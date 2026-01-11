import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons'; // Uncomment ถ้าใช้
import api, { API_BASE } from '../api/client';

// --- Types ---
type OrderStatus = 'pending' | 'cooking' | 'completed' | 'cancelled';

interface OrderDetailItem {
  id: number;
  menuItemName: string;
  quantity: number;
  price: number;
  options?: { optionName: string; extraPrice: number }[];
  notes?: string;
}

interface OrderDetail {
  id: number;
  orderCode: string;
  customerName: string;
  grandTotal: number;
  status: OrderStatus;
  placedAt: string;
  notes?: string;
  items: OrderDetailItem[];
  slipUrl?: string;
}

const AdminCheckOrder = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // State สำหรับดูรูปเต็มจอ
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/Orders/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
      Alert.alert('Error', 'Unable to load order details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setProcessing(true);
    try {
      await api.put(`/Orders/${order.id}/status`, { newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      navigation.goBack();
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Failed to update order status.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => handleUpdateStatus('cancelled'),
        },
      ],
    );
  };

  // ✅ แก้ไข: รับ undefined ได้ และคืนค่า undefined แทน null
  const getFullImageUrl = (path?: string) => {
    if (!path) return undefined; // 👈 เปลี่ยนจาก return null เป็น undefined หรือ string เปล่า

    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}${cleanPath}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  if (!order) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Order Code:</Text>
            <Text style={styles.valueBold}>{order.orderCode}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.valueBold,
                { color: getStatusColor(order.status) },
              ]}
            >
              {order.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {new Date(order.placedAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>
          {order.notes && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Order Note:</Text>
              <Text style={styles.noteText}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* ✅ ส่วนแสดงสลิปการโอนเงิน */}
        {order.slipUrl && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>หลักฐานการชำระเงิน</Text>
            <TouchableOpacity onPress={() => setImageModalVisible(true)}>
              <Image
                // ✅ ใช้ || undefined เพื่อกันเหนียวว่าห้ามเป็น null
                source={{ uri: getFullImageUrl(order.slipUrl) || undefined }}
                style={styles.slipImage}
                resizeMode="cover"
              />
              <Text style={styles.viewImageHint}>แตะเพื่อดูรูปใหญ่ 🔍</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items List */}
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.card}>
          {order.items.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.menuItemName}
                </Text>
                {item.options &&
                  item.options.map((opt, i) => (
                    <Text key={i} style={styles.itemOption}>
                      + {opt.optionName}
                    </Text>
                  ))}
                {item.notes && (
                  <Text style={styles.itemNote}>Note: {item.notes}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                ฿{(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              ฿{order.grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons (Footer) */}
      {order.status === 'pending' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={handleCancelOrder}
            disabled={processing}
          >
            <Text style={[styles.btnText, { color: '#EF4444' }]}>
              Cancel Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => handleUpdateStatus('cooking')}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, { color: '#fff' }]}>
                Accept Order
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'cooking' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => handleUpdateStatus('completed')}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, { color: '#fff' }]}>
                Complete Order
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Modal แสดงรูปสลิปเต็มจอ */}
      {order.slipUrl && (
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)} // เพิ่ม onRequestClose เพื่อรองรับ Android back button
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setImageModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕ ปิด</Text>
            </TouchableOpacity>
            <Image
              // ✅ ใช้ || undefined เพื่อกันเหนียว
              source={{ uri: getFullImageUrl(order.slipUrl) || undefined }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// Helper for status color
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return '#C2410C';
    case 'cooking':
      return '#1D4ED8';
    case 'completed':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#374151';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: StatusBar.currentHeight || 40,
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, color: '#FF7622', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { fontSize: 14, color: '#64748B' },
  value: { fontSize: 14, color: '#1E293B' },
  valueBold: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  noteContainer: {
    marginTop: 8,
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 6,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C2410C',
    marginBottom: 2,
  },
  noteText: { fontSize: 13, color: '#C2410C' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemInfo: { flex: 1, paddingRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  itemOption: { fontSize: 13, color: '#64748B', marginTop: 2, paddingLeft: 8 },
  itemNote: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 2,
    fontStyle: 'italic',
  },
  itemPrice: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  acceptBtn: { backgroundColor: '#FF7622' },
  completeBtn: { backgroundColor: '#10B981' },
  btnText: { fontSize: 16, fontWeight: 'bold' },

  // Slip Styles
  slipImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  viewImageHint: {
    textAlign: 'center',
    marginTop: 8,
    color: '#6B7280',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminCheckOrder;
