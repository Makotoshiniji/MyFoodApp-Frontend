// src/screens/PaymentQrScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform, // ✅ เพิ่ม import
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/client';

const PROMPTPAY_ID = '081-234-5678';

export default function PaymentQrScreen({ navigation, route }: any) {
  const { amount, orderId } = route.params;
  const amountText = amount.toFixed(2);
  const qrUrl = `https://promptpay.io/${PROMPTPAY_ID}/${amountText}.png`;

  // 🔸 เปลี่ยน state เป็นเก็บ Object แทน string
  const [slipImage, setSlipImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔸 ฟังก์ชันเลือกสลิป
  const handleUploadSlip = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8, // ลด quality นิดนึงเพื่อลดขนาดไฟล์ upload จะได้ไวขึ้น
    });

    if (result.didCancel) return;

    if (result.assets && result.assets.length > 0) {
      // ✅ เก็บทั้ง object
      setSlipImage(result.assets[0]);
    }
  };

  // 🔸 ฟังก์ชันยืนยันการชำระเงิน
  // 🔸 ฟังก์ชันยืนยันการชำระเงิน
  const handleConfirmPayment = async () => {
    if (!slipImage) {
      Alert.alert('แจ้งเตือน', 'กรุณาอัปโหลดสลิปก่อน');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // ✅ Fix URI for Android (ฉบับปลอดภัย)
      let localUri = slipImage.uri;

      // เช็คว่าถ้าเป็น Android และไม่มี file:// และไม่ใช่ content:// ค่อยเติม
      if (Platform.OS === 'android' && localUri) {
        if (
          !localUri.startsWith('file://') &&
          !localUri.startsWith('content://')
        ) {
          localUri = 'file://' + localUri;
        }
      }

      // ✅ Construct File Object
      formData.append('SlipFile', {
        uri: localUri,
        name: slipImage.fileName || 'slip.jpg',
        type: slipImage.type || 'image/jpeg',
      } as any);

      console.log('Sending FormData:', JSON.stringify(formData));

      // ✅ ยิง API
      await api.post(`/Orders/${orderId}/slip`, formData, {
        headers: {
          // ⚠️ สำคัญ: ใส่ undefined เพื่อล้างค่า default json (ถ้ามี)
          // ให้ Axios/Browser จัดการ boundary เอง
          'Content-Type': 'multipart/form-data',
        },
        // เพิ่ม transformRequest เพื่อป้องกัน Axios แปลง formData เป็น JSON
        transformRequest: (data, headers) => {
          return data;
        },
      });

      setLoading(false);

      Alert.alert('สำเร็จ', 'อัปโหลดสลิปเรียบร้อยแล้ว', [
        {
          text: 'ตกลง',
          onPress: () =>
            navigation.replace('NewBillDetail', { orderId: orderId }),
        },
      ]);
    } catch (err: any) {
      setLoading(false);
      console.log('Upload error:', err);

      if (err.response) {
        console.log('Error Data:', err.response.data);
        // เช็คว่า Server ส่ง error อะไรมา
        const serverMsg = JSON.stringify(err.response.data);
        Alert.alert('Upload Failed', `Server says: ${serverMsg}`);
      } else {
        const msg = err.message || 'เกิดข้อผิดพลาดในการอัปโหลด';
        Alert.alert('ผิดพลาด', msg);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>QR Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>สแกนเพื่อชำระเงิน</Text>
          <Text style={styles.amount}>ยอดชำระ ฿{amountText}</Text>
          <View style={styles.qrWrapper}>
            <Image
              source={{ uri: qrUrl }}
              style={styles.qr}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.note}>
            📱 สแกน QR เพื่อโอนเงิน{`\n`}และอัปโหลดสลิปด้านล่าง 💳
          </Text>

          {/* ✅ เปลี่ยนการเช็คเงื่อนไขแสดงรูป */}
          {slipImage && slipImage.uri && (
            <View style={styles.slipPreviewCard}>
              <Text style={styles.slipLabel}>สลิปที่เลือก:</Text>
              <Image source={{ uri: slipImage.uri }} style={styles.slipImage} />
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleUploadSlip}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadText}>
            {slipImage ? 'เลือกสลิปใหม่' : 'อัปโหลดสลิป'}
          </Text>
        </TouchableOpacity>

        {slipImage && (
          <TouchableOpacity
            onPress={handleConfirmPayment}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmText}>ยืนยันการชำระเงิน</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#FF7622" />
            <Text style={styles.loadingText}>กำลังตรวจสอบ...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ... styles คงเดิม ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: '#374151' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 20, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  amount: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
    marginBottom: 20,
  },
  qrWrapper: {
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#F97316',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
  },
  qr: { width: 220, height: 220 },
  note: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  uploadText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  confirmButton: {
    backgroundColor: '#16A34A',
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  confirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  slipPreviewCard: { marginTop: 16, alignItems: 'center' },
  slipLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  slipImage: {
    width: 150,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    resizeMode: 'contain',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 150,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
