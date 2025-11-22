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

export default function ResetPasswordScreen({ route, navigation }: any) {
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword) return Alert.alert('แจ้งเตือน', 'กรุณากรอกรหัสผ่านใหม่');
    if (newPassword !== confirmPassword)
      return Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');

    setLoading(true);
    try {
      await AuthApi.resetPassword(email, otp, newPassword);
      Alert.alert(
        'สำเร็จ',
        'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่',
        [
          { text: 'OK', onPress: () => navigation.popToTop() }, // กลับไปหน้าแรกสุด (Login)
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error?.response?.data || 'เปลี่ยนรหัสไม่สำเร็จ',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ตั้งรหัสผ่านใหม่</Text>

      <TextInput
        style={styles.input}
        placeholder="รหัสผ่านใหม่"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="ยืนยันรหัสผ่านใหม่"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={handleReset}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
// (ใช้ styles เดียวกัน)
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
