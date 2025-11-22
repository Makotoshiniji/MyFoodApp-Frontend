import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ShopApi } from '../api/shop';

export default function RegisterShopScreen({ route, navigation }: any) {
  const { userId } = route.params; // รับ ID ผู้ใช้มา

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone)
      return Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อร้านและเบอร์โทร');

    setLoading(true);
    try {
      await ShopApi.register({
        ownerUserId: userId,
        name,
        description: desc,
        phone,
      });

      Alert.alert('ยินดีด้วย!', 'ร้านค้าของคุณเปิดใช้งานแล้ว', [
        {
          text: 'ไปที่แดชบอร์ด',
          onPress: () => navigation.replace('MainAdminShop', { userId }), // ไปหน้า Admin เลย
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'ไม่สามารถสร้างร้านได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>ลงทะเบียนร้านค้า</Text>
      <Text style={styles.subTitle}>เริ่มธุรกิจของคุณกับเราวันนี้</Text>

      <View style={styles.form}>
        <Text style={styles.label}>ชื่อร้านค้า</Text>
        <TextInput
          style={styles.input}
          placeholder="เช่น ข้าวมันไก่เจ๊ไฝ"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>รายละเอียดร้าน (สั้นๆ)</Text>
        <TextInput
          style={styles.input}
          placeholder="อาหารตามสั่ง รสเด็ด"
          value={desc}
          onChangeText={setDesc}
        />

        <Text style={styles.label}>เบอร์โทรศัพท์ติดต่อ</Text>
        <TextInput
          style={styles.input}
          placeholder="081-xxx-xxxx"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>เปิดร้านค้า</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: { width: '100%' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
  },
  btn: {
    backgroundColor: '#5A67D8',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
