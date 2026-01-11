// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import { AuthApi } from '../api/auth';

// export default function ResetPasswordScreen({ route, navigation }: any) {
//   const { email, otp } = route.params;
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleReset = async () => {
//     if (!newPassword) return Alert.alert('แจ้งเตือน', 'กรุณากรอกรหัสผ่านใหม่');
//     if (newPassword !== confirmPassword)
//       return Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');

//     setLoading(true);
//     try {
//       await AuthApi.resetPassword(email, otp, newPassword);
//       Alert.alert(
//         'สำเร็จ',
//         'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่',
//         [
//           { text: 'OK', onPress: () => navigation.popToTop() }, // กลับไปหน้าแรกสุด (Login)
//         ],
//       );
//     } catch (error: any) {
//       Alert.alert(
//         'เกิดข้อผิดพลาด',
//         error?.response?.data || 'เปลี่ยนรหัสไม่สำเร็จ',
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>ตั้งรหัสผ่านใหม่</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="รหัสผ่านใหม่"
//         secureTextEntry
//         value={newPassword}
//         onChangeText={setNewPassword}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="ยืนยันรหัสผ่านใหม่"
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//       />

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={handleReset}
//         disabled={loading}
//       >
//         <Text style={styles.btnText}>
//           {loading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// // (ใช้ styles เดียวกัน)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   btn: {
//     backgroundColor: '#EF9F27',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
// });
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
    // 1. เช็คว่ากรอกรหัสผ่านไหม
    if (!newPassword) return Alert.alert('แจ้งเตือน', 'กรุณากรอกรหัสผ่านใหม่');

    // 2. ⭐️ เช็คเงื่อนไขรหัสผ่าน (พิมพ์เล็ก, พิมพ์ใหญ่, ตัวเลข, 8 ตัวขึ้นไป)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'รหัสผ่านไม่ปลอดภัย',
        'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วย:\n• อักษรตัวพิมพ์ใหญ่ (A-Z)\n• อักษรตัวพิมพ์เล็ก (a-z)\n• ตัวเลข (0-9)',
      );
      return;
    }

    // 3. เช็ครหัสผ่านตรงกันไหม
    if (newPassword !== confirmPassword)
      return Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');

    setLoading(true);
    try {
      await AuthApi.resetPassword(email, otp, newPassword);
      Alert.alert(
        'สำเร็จ',
        'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่',
        [{ text: 'OK', onPress: () => navigation.popToTop() }],
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

      {/* ⭐️ เพิ่มข้อความเตือนเงื่อนไขรหัสผ่าน */}
      <View style={styles.passwordHintWrap}>
        <Text style={styles.passwordHintText}>
          * รหัสผ่านต้องมี 8 ตัวขึ้นไป ประกอบด้วย A-Z, a-z และ 0-9
        </Text>
      </View>

      <TextInput
        style={[styles.input, { marginTop: 15 }]} // เว้นระยะจากตัว hint
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  // ⭐️ เพิ่มสไตล์สำหรับข้อความเตือน
  passwordHintWrap: {
    marginTop: 4,
    paddingLeft: 5,
  },
  passwordHintText: {
    fontSize: 11,
    color: '#7A869A', // สีเทาเหมือนหน้า Register
  },
  btn: {
    backgroundColor: '#EF9F27',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
