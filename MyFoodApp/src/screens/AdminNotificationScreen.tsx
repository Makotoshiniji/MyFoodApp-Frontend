import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

// --- Types ---
type OrderStatus = 'pending' | 'cooking' | 'completed' | 'cancelled';

interface OrderItem {
  id: number;
  orderCode: string;
  customerName: string;
  itemsCount: number;
  grandTotal: number;
  status: OrderStatus;
  placedAt: string;
  notes?: string;
}

const AdminNotificationScreen = ({ route, navigation }: any) => {
  const shopId = route.params?.shopId || 1;

  const [activeTab, setActiveTab] = useState<'ongoing' | 'history'>('ongoing'); // ✅ เปลี่ยนชื่อจาก 'all' เป็น 'history' เพื่อความชัดเจน
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- 1. Fetch Data ---
  const fetchOrders = async () => {
    try {
      const res = await api.get(`/Orders/shop/${shopId}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      const interval = setInterval(() => {
        fetchOrders();
      }, 15000);
      return () => clearInterval(interval);
    }, [shopId]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    try {
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      await api.put(`/Orders/${orderId}/status`, { newStatus });
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถอัปเดตสถานะได้');
      fetchOrders();
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'รอรับออเดอร์';
      case 'cooking':
        return 'กำลังปรุง';
      case 'completed':
        return 'สำเร็จ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { bg: '#FFF7ED', text: '#C2410C' };
      case 'cooking':
        return { bg: '#EFF6FF', text: '#1D4ED8' };
      case 'completed':
        return { bg: '#F1F5F9', text: '#64748B' };
      case 'cancelled':
        return { bg: '#FEF2F2', text: '#B91C1C' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  // --- 🔥 จุดแก้ไข Logic การกรอง (ฉบับรัดกุม) ---
  const filteredOrders = orders.filter(order => {
    // 1. ป้องกันกรณี status เป็น null หรือ undefined
    if (!order.status) return false;

    // 2. แปลงเป็นตัวพิมพ์เล็ก และตัดช่องว่างหน้าหลังทิ้ง (Trim)
    // เช่น " Pending " จะกลายเป็น "pending"
    const s = order.status.toString().trim().toLowerCase();

    // Debug: ปริ้นดูค่าจริงใน Console (ถ้ายังไม่หาย ให้ดูค่าตรงนี้)
    // console.log(`Order: ${order.orderCode}, Status: [${s}], Tab: ${activeTab}`);

    if (activeTab === 'ongoing') {
      // แท็บ Ongoing: เอาแค่ pending และ cooking
      return s === 'pending' || s === 'cooking';
    } else {
      // ✅ แท็บ History: เอาเฉพาะ completed และ cancelled เท่านั้น
      // ถ้า status เป็น pending จะไม่เข้าเงื่อนไขนี้แน่นอน
      return s === 'completed' || s === 'cancelled';
    }
  });

  const renderItem = ({ item }: { item: OrderItem }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        // ✅ เพิ่มบรรทัดนี้: เมื่อกดการ์ด ให้ไปหน้า AdminCheckOrder
        onPress={() =>
          navigation.navigate('AdminCheckOrder', { orderId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderCode}</Text>
            <Text style={styles.orderTime}>{item.placedAt}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.itemCount}>{item.itemsCount} รายการ</Text>
            {item.notes ? (
              <Text style={styles.notes} numberOfLines={1}>
                หมายเหตุ: {item.notes}
              </Text>
            ) : null}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>
              ฿{item.grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Action Bar: ส่วนปุ่มกดรับ/ยกเลิกด้านล่าง 
            คุณสามารถเลือกได้ว่าจะ 'คงไว้' เพื่อให้กดเร็วๆ ได้เลย 
            หรือ 'ลบออก' เพื่อบังคับให้กดเข้าไปดูรายละเอียดข้างในก่อนค่อยกดรับ
            
            ในตัวอย่างนี้ ผม 'คงไว้' ตามโค้ดเดิมของคุณครับ
        */}
        {['pending', 'cooking'].includes(item.status) && (
          <View style={styles.actionRow}>
            {/* ... (ปุ่มต่างๆ เหมือนเดิม ไม่ต้องแก้) ... */}
            {item.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionBtnOutline, { borderColor: '#EF4444' }]}
                onPress={() =>
                  Alert.alert('ยืนยัน', 'ต้องการยกเลิกออเดอร์นี้?', [
                    { text: 'ไม่', style: 'cancel' },
                    {
                      text: 'ยกเลิกออเดอร์',
                      style: 'destructive',
                      onPress: () => handleUpdateStatus(item.id, 'cancelled'),
                    },
                  ])
                }
              >
                <Text
                  style={[styles.actionBtnTextOutline, { color: '#EF4444' }]}
                >
                  ยกเลิก
                </Text>
              </TouchableOpacity>
            )}

            {item.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionBtnFilled, { flex: 2 }]}
                onPress={() => handleUpdateStatus(item.id, 'cooking')}
              >
                <Text style={styles.actionBtnTextFilled}>รับออเดอร์</Text>
              </TouchableOpacity>
            )}

            {item.status === 'cooking' && (
              <TouchableOpacity
                style={[styles.actionBtnFilled, { backgroundColor: '#10B981' }]}
                onPress={() => handleUpdateStatus(item.id, 'completed')}
              >
                <Text style={styles.actionBtnTextFilled}>พร้อมเสิร์ฟ</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>จัดการออเดอร์</Text>
        <Text style={styles.headerSubtitle}>ร้านค้าของคุณ</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'ongoing' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ongoing' && styles.tabTextActive,
            ]}
          >
            กำลังดำเนินการ (
            {
              orders.filter(o =>
                ['pending', 'cooking'].includes(o.status.toLowerCase()),
              ).length
            }
            )
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'history' && styles.tabActive,
          ]} // history tab
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            ประวัติทั้งหมด
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FF7622" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ไม่มีรายการออเดอร์ในหมวดนี้</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { padding: 15, backgroundColor: '#fff', marginTop: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 14, color: '#64748B' },

  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff', elevation: 2 },
  tabText: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  tabTextActive: { color: '#FF7622', fontWeight: 'bold' },

  listContent: { padding: 20, paddingTop: 0 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 10,
  },
  orderNumber: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  orderTime: { fontSize: 12, color: '#94A3B8' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },

  cardBody: { flexDirection: 'row', alignItems: 'center' },
  iconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#FFEDD5',
    borderRadius: 8,
    marginRight: 12,
  },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: 'bold', color: '#334155' },
  itemCount: { fontSize: 12, color: '#64748B' },
  notes: { fontSize: 11, color: '#F97316', marginTop: 2 },
  priceContainer: { alignItems: 'flex-end' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },

  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  actionBtnOutline: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  actionBtnFilled: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FF7622',
    alignItems: 'center',
  },
  actionBtnTextOutline: { fontWeight: 'bold', fontSize: 14 },
  actionBtnTextFilled: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default AdminNotificationScreen;
