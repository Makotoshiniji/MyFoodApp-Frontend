import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { AuthApi } from '../api/auth';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) return Alert.alert('แจ้งเตือน', 'กรุณากรอกอีเมล');
    setLoading(true);
    try {
      await AuthApi.forgotPassword(email);
      Alert.alert(
        'สำเร็จ',
        'ส่งรหัส OTP ไปที่อีเมลแล้ว (ดูใน Console ของ Backend)',
      );
      // ส่งอีเมลไปหน้าถัดไป
      navigation.navigate('VerifyOtp', { email });
    } catch (error: any) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error?.response?.data || 'ส่ง OTP ไม่สำเร็จ',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ลืมรหัสผ่าน?</Text>
      <Text style={styles.subtitle}>กรอกอีเมลของคุณเพื่อรับรหัส OTP</Text>

      <TextInput
        style={styles.input}
        placeholder="อีเมลของคุณ"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={handleSendOtp}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#EF9F27',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
