declare var require: any;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking, // ❗️ 1. ตรวจสอบว่ามี Linking
} from 'react-native';
import api, { API_BASE } from '../api/client'; // ❗️ 2. Import API_BASE เข้ามาด้วย

// ❗️ 3. ลบ RNHTMLtoPDF ทิ้งไป

// ✅ Type นี้ถูกต้องแล้ว (ใช้สำหรับแสดงผลบนจอ)
type Bill = {
  OrderCode: string;
  UserName: string;
  ShopName: string;
  Total: number;
  Date: string;
  Items: { Name: string; Quantity: number; Price: number }[];
};

export default function BillDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 โหลดข้อมูลบิลจาก backend (อันนี้ยังต้องใช้ เพื่อแสดงผลบนจอ)
  useEffect(() => {
    console.log('Checking orderId:', orderId);
    const fetchBill = async () => {
      try {
        const res = await api.get(`/Payments/bill/${orderId}`);
        console.log('DATA FROM SERVER:', JSON.stringify(res.data, null, 2));
        setBill(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลบิลได้');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [orderId]);

  // ❗️ 4. ลบฟังก์ชัน generatePDF (ที่สร้าง HTML) ทั้งหมดทิ้ง

  // ✅ 5. นี่คือฟังก์ชันใหม่สำหรับเรียก Backend
  const handleDownloadPDF = () => {
    // เราใช้ orderId ที่ได้มาจาก route.params ได้เลย
    const url = `${API_BASE}/Payments/download-bill/${orderId}`;

    console.log('Attempting to open PDF URL:', url);

    try {
      // สั่งให้มือถือเปิด URL นี้ (มันจะเด้งไปที่ Browser เพื่อดาวน์โหลด)
      Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open URL', err);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเปิดลิงก์ดาวน์โหลดได้');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#800080" />
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.center}>
        <Text>ไม่พบบิลที่ต้องการแสดง</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>รายละเอียดใบเสร็จ</Text>

      <Text style={styles.label}>
        รหัสคำสั่งซื้อ: {bill.OrderCode || 'N/A'}
      </Text>
      <Text style={styles.label}>ร้านค้า: {bill.ShopName || 'N/A'}</Text>
      <Text style={styles.label}>ลูกค้า: {bill.UserName || 'N/A'}</Text>
      <Text style={styles.label}>วันที่: {bill.Date || 'N/A'}</Text>

      <View style={styles.table}>
        <Text style={styles.subTitle}>รายการสินค้า</Text>
        {(bill.Items || []).map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {it.Name || 'N/A'} × {it.Quantity || 0}
            </Text>
            <Text style={styles.itemPrice}>
              {((it.Price || 0) * (it.Quantity || 0)).toFixed(2)} ฿
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>
        รวมทั้งหมด: {(bill.Total || 0).toFixed(2)} ฿
      </Text>

      {/* ❗️ 6. เปลี่ยน onPress มาเรียกฟังก์ชันใหม่ */}
      <TouchableOpacity style={styles.btn} onPress={handleDownloadPDF}>
        <Text style={styles.btnText}>📄 ดาวน์โหลดใบเสร็จ (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 🔹 สไตล์ (เหมือนเดิม)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 22,
    color: '#800080',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: { fontSize: 16, marginBottom: 4 },
  subTitle: { fontSize: 18, color: '#800080', marginBottom: 8, marginTop: 16 },
  table: { borderTopWidth: 1, borderColor: '#ddd', marginVertical: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  total: {
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  btn: {
    backgroundColor: '#800080',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
