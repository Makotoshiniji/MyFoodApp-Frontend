// src/screens/AdminReportScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/th';
import RNPrint from 'react-native-print'; // ✅ ใช้ Library ใหม่
import api from '../api/client';

moment.locale('th');

interface OrderData {
  id: number;
  orderCode: string;
  customerName: string;
  grandTotal: number;
  status: string;
  placedAt: string;
}

export default function AdminReportScreen({ navigation, route }: any) {
  const { shopId } = route.params;

  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [displayOrders, setDisplayOrders] = useState<OrderData[]>([]);

  const [selectedDate, setSelectedDate] = useState(moment());
  const [filterType, setFilterType] = useState<'Week' | 'Month' | 'Year'>(
    'Week',
  );
  const [searchText, setSearchText] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/Orders/shop/${shopId}`);
      const data: OrderData[] = res.data;
      const validOrders = data.filter(
        o => o.status.toLowerCase() !== 'cancelled',
      );

      setAllOrders(validOrders);
      applyFilter(validOrders, filterType, selectedDate);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [shopId]);

  const applyFilter = (
    orders: OrderData[],
    type: 'Week' | 'Month' | 'Year',
    dateRef: moment.Moment,
  ) => {
    let filtered = orders.filter(o => {
      const orderTimeTH = moment.utc(o.placedAt).add(7, 'hours');
      if (type === 'Week') return orderTimeTH.isSame(dateRef, 'isoWeek');
      if (type === 'Month') return orderTimeTH.isSame(dateRef, 'month');
      if (type === 'Year') return orderTimeTH.isSame(dateRef, 'year');
      return false;
    });

    filtered.sort(
      (a, b) => moment(b.placedAt).valueOf() - moment(a.placedAt).valueOf(),
    );
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    let result = filteredOrders;
    if (searchText) {
      const lowerText = searchText.toLowerCase();
      result = result.filter(
        o =>
          (o.orderCode && o.orderCode.toLowerCase().includes(lowerText)) ||
          (o.customerName && o.customerName.toLowerCase().includes(lowerText)),
      );
    }
    setDisplayOrders(result);
    const sum = result.reduce((acc, curr) => acc + curr.grandTotal, 0);
    setTotalRevenue(sum);
  }, [filteredOrders, searchText]);

  // 🖨️ ฟังก์ชันสร้าง PDF (แก้ไขใหม่ใช้ RNPrint)
  const printPDF = async () => {
    if (displayOrders.length === 0) {
      Alert.alert('ไม่พบข้อมูล', 'ไม่มีรายการที่จะพิมพ์');
      return;
    }

    try {
      // สร้าง HTML Table
      let tableRows = displayOrders
        .map(
          item => `
        <tr>
          <td>${moment(item.placedAt)
            .add(7, 'hours')
            .format('DD/MM/YY HH:mm')}</td>
          <td>${item.orderCode}</td>
          <td>${item.customerName}</td>
          <td style="text-align: right;">${item.grandTotal.toLocaleString()}</td>
        </tr>
      `,
        )
        .join('');

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, sans-serif; padding: 20px; }
              h1 { text-align: center; color: #333; }
              h3 { text-align: center; color: #666; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background-color: #eee; text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
              td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
              .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>รายงานยอดขาย</h1>
            <h3>ช่วงเวลา: ${getDateLabel()}</h3>
            <table>
              <tr>
                <th>เวลา</th>
                <th>รหัสออเดอร์</th>
                <th>ลูกค้า</th>
                <th style="text-align: right;">ยอดเงิน (บาท)</th>
              </tr>
              ${tableRows}
            </table>
            <div class="total">ยอดรวมสุทธิ: ฿${totalRevenue.toLocaleString()}</div>
          </body>
        </html>
      `;

      // สั่ง Print (จะเด้งหน้า Preview ขึ้นมา ให้เลือก Save as PDF ได้)
      await RNPrint.print({
        html: htmlContent,
        jobName: `Report_${moment().format('YYYYMMDD_HHmm')}`,
      });
    } catch (error) {
      console.error(error);
      // Alert.alert('ผิดพลาด', 'ไม่สามารถพิมพ์ได้');
    }
  };

  const handleDateChange = (amount: number) => {
    const unit =
      filterType === 'Week'
        ? 'weeks'
        : filterType === 'Month'
        ? 'months'
        : 'years';
    const newDate = moment(selectedDate).add(amount, unit);
    setSelectedDate(newDate);
    applyFilter(allOrders, filterType, newDate);
  };

  const handleFilterChange = (type: 'Week' | 'Month' | 'Year') => {
    setFilterType(type);
    const now = moment();
    setSelectedDate(now);
    applyFilter(allOrders, type, now);
  };

  const getDateLabel = () => {
    if (filterType === 'Week') {
      const start = moment(selectedDate).startOf('isoWeek');
      const end = moment(selectedDate).endOf('isoWeek');
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
    } else if (filterType === 'Month') return selectedDate.format('MMMM YYYY');
    else return selectedDate.format('YYYY');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cooking':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const renderItem = ({ item }: { item: OrderData }) => (
    <TouchableOpacity
      style={styles.tableRow}
      // ✅ เพิ่ม onPress เพื่อลิงก์ไปหน้า AdminCheckOrder (หรือ NewBillDetail ถ้าอยากดูแบบบิล)
      onPress={() =>
        navigation.navigate('AdminCheckOrder', { orderId: item.id })
      }
    >
      <View style={{ flex: 2 }}>
        <Text style={styles.dateText}>
          {moment(item.placedAt).add(7, 'hours').format('DD/MM/YY')}
        </Text>
        <Text style={styles.timeText}>
          {moment(item.placedAt).add(7, 'hours').format('HH:mm')} น.
        </Text>
      </View>

      <View style={{ flex: 3, paddingHorizontal: 5 }}>
        <Text style={styles.orderCode} numberOfLines={1}>
          {item.orderCode || `#${item.id}`}
        </Text>
        <Text style={styles.customerName} numberOfLines={1}>
          {item.customerName}
        </Text>
      </View>

      <View style={{ flex: 2, alignItems: 'flex-end' }}>
        <Text style={styles.priceText}>
          ฿{item.grandTotal.toLocaleString()}
        </Text>
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>

      {/* ✅ เพิ่มลูกศรขวานิดนึง ให้รู้ว่ากดได้ */}
      <View style={{ width: 20, alignItems: 'flex-end' }}>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายงานยอดขาย</Text>

        {/* ปุ่ม Print / PDF */}
        <TouchableOpacity onPress={printPDF} style={styles.pdfBtn}>
          <Ionicons name="print-outline" size={24} color="#FF7622" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#94A3B8"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาเลข Order หรือชื่อลูกค้า..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Type */}
        <View style={styles.filterContainer}>
          {['Week', 'Month', 'Year'].map((type: any) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterBtn,
                filterType === type && styles.filterBtnActive,
              ]}
              onPress={() => handleFilterChange(type)}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === type && styles.filterTextActive,
                ]}
              >
                {type === 'Week'
                  ? 'รายสัปดาห์'
                  : type === 'Month'
                  ? 'รายเดือน'
                  : 'รายปี'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            onPress={() => handleDateChange(-1)}
            style={styles.arrowBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.dateLabelContainer}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#FF7622"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.dateLabel}>{getDateLabel()}</Text>
          </View>

          <TouchableOpacity
            onPress={() => handleDateChange(1)}
            style={styles.arrowBtn}
          >
            <Ionicons name="chevron-forward" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>ยอดขายรวม</Text>
          <Text style={styles.summaryValue}>
            ฿{totalRevenue.toLocaleString()}
          </Text>
          <Text style={styles.summaryCount}>{displayOrders.length} รายการ</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { flex: 2 }]}>เวลา</Text>
          <Text style={[styles.headerText, { flex: 3 }]}>ออเดอร์</Text>
          <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>
            ยอดสุทธิ
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={displayOrders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                {searchText
                  ? 'ไม่พบออเดอร์ที่ค้นหา'
                  : 'ไม่พบรายการในช่วงเวลานี้'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    marginTop: 50,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  backBtn: { padding: 8 },
  pdfBtn: { padding: 8 },
  content: { flex: 1, padding: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B' },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterBtnActive: { backgroundColor: '#fff', elevation: 2 },
  filterText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  filterTextActive: { color: '#FF7622', fontWeight: 'bold' },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    elevation: 1,
  },
  arrowBtn: { padding: 5 },
  dateLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  summaryCard: {
    backgroundColor: '#FF7622',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF7622',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  summaryCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  dateText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  timeText: { fontSize: 10, color: '#94A3B8' },
  orderCode: { fontSize: 13, color: '#1E293B', fontWeight: 'bold' },
  customerName: { fontSize: 11, color: '#64748B' },
  priceText: { fontSize: 14, color: '#1E293B', fontWeight: 'bold' },
  statusText: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94A3B8', fontSize: 14, marginTop: 10 },
});
