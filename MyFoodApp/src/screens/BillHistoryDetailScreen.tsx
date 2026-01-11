import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import api from '../api/client';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BillHistoryDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/Orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching bill:', err);
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลบิลได้');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // ฟังก์ชันย้อนกลับ (ต่างจากหน้า NewBill ที่จะ Reset ไป Home)
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSaveImage = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'ไม่ได้รับอนุญาตให้บันทึกรูป');
          return;
        }
      }

      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('สำเร็จ', 'บันทึกใบเสร็จเรียบร้อยแล้วครับ 📸');
      }
    } catch (error) {
      console.error('Failed to save image:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกรูปได้');
    }
  };

  const renderReceiptItems = () => {
    if (!order || !order.items) return null;
    return order.items.map((item: any, index: number) => (
      <View key={index} style={styles.receiptItemRow}>
        <Text style={styles.receiptQty}>{item.quantity}</Text>
        <Text style={styles.receiptItemName}>
          {item.menuItemName}
          {item.options && item.options.length > 0 && (
            <Text style={styles.optionText}>
              {'\n'} + {item.options.map((o: any) => o.optionName).join(', ')}
            </Text>
          )}
        </Text>
        <Text style={styles.receiptPrice}>
          {(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text>ไม่พบข้อมูลออเดอร์</Text>
        <TouchableOpacity onPress={handleBack} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subTotal = order.grandTotal;
  const vatRate = 0.07;
  const vatAmount = subTotal * vatRate;
  const finalTotal = subTotal + vatAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* เพิ่มปุ่ม Back ด้านบนเพื่อให้กดกลับง่ายๆ */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <TouchableOpacity
          onPress={handleBack}
          style={{ padding: 5, alignSelf: 'flex-start' }}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 0.9 }}
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>COOK</Text>
              </View>
              <Text style={styles.brandSlogan}>COOK คู่หูยามท้องหิว</Text>
              <Text style={styles.receiptTitle}>ใบเสร็จ (ย้อนหลัง)</Text>
              <Text style={styles.receiptSubtitle}>PRETTY FOOD, REAL GOOD</Text>
            </View>

            <View style={styles.shopInfoRow}>
              <Text style={styles.shopName}>
                ร้าน {order.shopName || 'Unknown Shop'}
              </Text>
              <View>
                <Text style={styles.dateText}>
                  Date: {new Date(order.placedAt).toLocaleDateString('th-TH')}
                </Text>
                <Text style={styles.dateText}>
                  Time: {new Date(order.placedAt).toLocaleTimeString('th-TH')}
                </Text>
              </View>
            </View>

            <View style={styles.dashedLine} />
            <View style={styles.itemListContainer}>{renderReceiptItems()}</View>
            <View style={styles.dashedLine} />

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SUB-TOTAL:</Text>
                <Text style={styles.summaryValue}>{subTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>VAT (7%):</Text>
                <Text style={styles.summaryValue}>{vatAmount.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>{finalTotal.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.dashedLine} />
            <Text style={styles.receiptFooter}>ขอบคุณที่ใช้บริการครับ 🙏</Text>
          </View>
        </ViewShot>

        <TouchableOpacity onPress={handleSaveImage} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 บันทึกรูปใบเสร็จ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ใช้ Style เดิมจาก NewBillDetailScreen ได้เลย
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  receiptCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  receiptHeader: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: { color: '#F97316', fontWeight: '900', fontSize: 16 },
  brandSlogan: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  receiptSubtitle: { fontSize: 10, fontWeight: '600', color: '#000' },
  shopInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginVertical: 12,
    borderRadius: 1,
  },
  itemListContainer: { marginBottom: 10 },
  receiptItemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  receiptQty: {
    width: 30,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  receiptItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
  receiptPrice: {
    width: 70,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  summaryContainer: { alignItems: 'flex-end' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    width: '100%',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#333',
    marginRight: 10,
    textAlign: 'right',
    width: 100,
  },
  summaryValue: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
    width: 70,
    fontFamily: 'monospace',
  },
  totalLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginRight: 10,
    textAlign: 'right',
    width: 100,
  },
  totalValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'right',
    width: 80,
    fontFamily: 'monospace',
  },
  receiptFooter: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  homeButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
