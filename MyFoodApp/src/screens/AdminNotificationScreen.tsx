import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// --- Types ---
type OrderStatus =
  | 'pending'
  | 'cooking'
  | 'delivering'
  | 'completed'
  | 'cancelled';

interface OrderItem {
  id: string;
  orderNumber: string; // เช่น #ORD-001
  customerName: string;
  itemsCount: number; // จำนวนรายการอาหาร
  totalPrice: number;
  status: OrderStatus;
  time: string; // เวลาที่สั่ง
}

// --- Mock Data (ข้อมูลจำลอง) ---
const MOCK_ORDERS: OrderItem[] = [
  {
    id: '1',
    orderNumber: '#1001',
    customerName: 'โต๊ะ 5 (คุณสมชาย)',
    itemsCount: 3,
    totalPrice: 450,
    status: 'pending',
    time: '10:30 AM',
  },
  {
    id: '2',
    orderNumber: '#1002',
    customerName: 'โต๊ะ 2',
    itemsCount: 1,
    totalPrice: 120,
    status: 'cooking',
    time: '10:35 AM',
  },
  {
    id: '3',
    orderNumber: '#1003',
    customerName: 'Take Away - Rider',
    itemsCount: 5,
    totalPrice: 890,
    status: 'delivering',
    time: '10:15 AM',
  },
  {
    id: '4',
    orderNumber: '#0998',
    customerName: 'โต๊ะ 9',
    itemsCount: 2,
    totalPrice: 250,
    status: 'completed',
    time: '09:45 AM',
  },
  {
    id: '5',
    orderNumber: '#0997',
    customerName: 'โต๊ะ 1',
    itemsCount: 1,
    totalPrice: 80,
    status: 'cancelled',
    time: '09:30 AM',
  },
  {
    id: '6',
    orderNumber: '#1004',
    customerName: 'โต๊ะ 4',
    itemsCount: 4,
    totalPrice: 1200,
    status: 'pending',
    time: '10:40 AM',
  },
];

// --- Helper Functions ---
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return { bg: '#FFF7ED', text: '#C2410C' }; // ส้มเข้ม/เหลือง
    case 'cooking':
      return { bg: '#EFF6FF', text: '#1D4ED8' }; // น้ำเงิน
    case 'delivering':
      return { bg: '#F0FDF4', text: '#15803D' }; // เขียวเข้ม
    case 'completed':
      return { bg: '#F1F5F9', text: '#64748B' }; // เทา (Success)
    case 'cancelled':
      return { bg: '#FEF2F2', text: '#B91C1C' }; // แดง
    default:
      return { bg: '#F3F4F6', text: '#374151' };
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'รอรับออเดอร์';
    case 'cooking':
      return 'กำลังปรุง';
    case 'delivering':
      return 'กำลังส่ง';
    case 'completed':
      return 'สำเร็จ';
    case 'cancelled':
      return 'ยกเลิก';
    default:
      return status;
  }
};

// --- Component หลัก ---
const AdminNotificationScreen = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'all'>('ongoing');
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);

  // จำลอง Pull to Refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // ตรงนี้ใส่ Logic เรียก API ใหม่
    }, 1500);
  };

  // Logic การกรองข้อมูล
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    // ongoing = pending, cooking, delivering
    return ['pending', 'cooking', 'delivering'].includes(order.status);
  });

  // --- Sub-Component: การ์ดแต่ละออเดอร์ ---
  const renderItem = ({ item }: { item: OrderItem }) => {
    const statusStyle = getStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderTime}>{item.time}</Text>
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
          <View style={styles.iconContainer}>
            {/* ใช้ Image icon หรือ Placeholder */}
            <View style={styles.placeholderIcon} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.itemCount}>{item.itemsCount} รายการ</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>ยอดรวม</Text>
            <Text style={styles.totalPrice}>฿{item.totalPrice}</Text>
          </View>
        </View>

        {/* ปุ่ม Action (เฉพาะรายการที่ยังไม่จบ) */}
        {['pending', 'cooking'].includes(item.status) && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtnOutline}>
              <Text style={styles.actionBtnTextOutline}>รายละเอียด</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnFilled}>
              <Text style={styles.actionBtnTextFilled}>
                {item.status === 'pending' ? 'รับออเดอร์' : 'เสิร์ฟ/ส่ง'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายการคำสั่งซื้อ</Text>
        <Text style={styles.headerSubtitle}>จัดการออเดอร์ลูกค้า</Text>
      </View>

      {/* Custom Tab Switcher */}
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
                ['pending', 'cooking', 'delivering'].includes(o.status),
              ).length
            }
            )
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.tabTextActive,
            ]}
          >
            ประวัติทั้งหมด
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ไม่มีรายการออเดอร์</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },

  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: '#E2E8F0', // สีพื้นหลังแถบ Tab
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FF7622', // สีส้ม
    fontWeight: 'bold',
  },

  // List Styles
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  orderInfo: {},
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  orderTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#FF7622',
    borderRadius: 12,
    opacity: 0.5,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  itemCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7622',
  },

  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  actionBtnOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  actionBtnFilled: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF7622',
    alignItems: 'center',
  },
  actionBtnTextOutline: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionBtnTextFilled: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default AdminNotificationScreen;
