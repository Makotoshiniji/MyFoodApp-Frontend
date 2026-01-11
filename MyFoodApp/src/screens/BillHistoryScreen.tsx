import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../api/client'; // ตรวจสอบ path ให้ถูกต้อง
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Type ของข้อมูลบิล (ปรับแก้ตาม Database ของจริง)
interface BillItem {
  id: number;
  orderCode: string;
  totalAmount: number;
  status: string;
  date: string; // หรือ createdAt
}

export default function BillHistoryScreen() {
  // เปลี่ยนจากอันเดิม เป็นแบบนี้
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params || {}; // รับ userId มาเพื่อดึงข้อมูลของคนนั้น

  const [bills, setBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillHistory();
  }, []);

  const fetchBillHistory = async () => {
    try {
      // 🟢 TODO: แก้ไข URL API ให้ตรงกับ Backend ของคุณ
      // ตัวอย่าง: /orders/user/{userId} หรือ /bills/history
      const response = await api.get(`/orders/user/${userId}`);
      setBills(response.data);
    } catch (error) {
      console.error('Failed to fetch bill history:', error);
      // Mock Data (ข้อมูลสมมติ ถ้ายังไม่มี API)
      setBills([
        {
          id: 1,
          orderCode: 'ORD-001',
          totalAmount: 150,
          status: 'Completed',
          date: '2023-10-25 12:30',
        },
        {
          id: 2,
          orderCode: 'ORD-002',
          totalAmount: 320,
          status: 'Cancelled',
          date: '2023-10-24 18:45',
        },
        {
          id: 3,
          orderCode: 'ORD-003',
          totalAmount: 85,
          status: 'Completed',
          date: '2023-10-20 09:15',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50'; // เขียว
      case 'cancelled':
        return '#F44336'; // แดง
      case 'pending':
        return '#FF9800'; // ส้ม
      default:
        return '#757575'; // เทา
    }
  };

  const renderItem = ({ item }: { item: BillItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      // ✅ แก้ตรงนี้: ใส่ (navigation as any) เพื่อแก้ Error เส้นแดง
      onPress={() =>
        (navigation as any).navigate('BillHistoryDetail', { orderId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderCode}>#{item.orderCode}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>

      <Text style={styles.dateText}>{item.date}</Text>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalAmount}>฿{item.totalAmount.toFixed(2)}</Text>
      </View>

      {/* เพิ่มส่วนนี้เพื่อให้ UX ดีขึ้น (คนจะได้รู้ว่ากดได้) */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 8,
        }}
      >
        <Text style={styles.tapToView}>แตะเพื่อดูใบเสร็จ {'>'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : bills.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No history found.</Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    paddingTop: 30,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#181C2E' },
  backBtn: { padding: 5 },

  listContent: { padding: 16 },
  tapToView: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 8,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderCode: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  status: { fontSize: 14, fontWeight: '600' },
  dateText: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 14, color: '#666' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },

  emptyText: { fontSize: 16, color: '#999' },
});
