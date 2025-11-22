import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Image,
  SafeAreaView,
} from 'react-native';
import { AuthApi } from '../api/auth';

// ใช้รูป Background ถ้ามี หรือใช้สีพื้นหลังแทน
const HEADER_BG = '#111827'; // สีน้ำเงินเข้มเกือบดำ

export default function VerifyOtpScreen({ route, navigation }: any) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // สร้าง Ref เพื่อคุมการ Focus (ถ้าจะทำแบบแยกช่อง แต่แบบช่องเดียวง่ายกว่าสำหรับ User)
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }

    setLoading(true);
    try {
      await AuthApi.verifyOtp(email, otp);
      navigation.navigate('ResetPassword', { email, otp });
    } catch (error: any) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        error?.response?.data || 'รหัส OTP ไม่ถูกต้อง',
      );
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแสดงผลช่อง OTP แบบแยก
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      boxes.push(
        <View
          key={i}
          style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}
        >
          <Text style={styles.otpText}>{otp[i] || ''}</Text>
        </View>,
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      {/* === Header Section === */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>{'<'}</Text>
              {/* หรือใช้ Icon: <Image source={require('path/to/back_icon.png')} /> */}
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Verification</Text>
            <Text style={styles.subtitle}>
              We have sent a code to your email
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* === Body Section (White Card) === */}
      <View style={styles.bodyContainer}>
        {/* OTP Input Area */}
        <View style={styles.otpSection}>
          <View style={styles.codeHeaderRow}>
            <Text style={styles.codeLabel}>CODE</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.resendLink}>Resend</Text>
              <Text style={styles.timerText}> in 50sec</Text>
            </View>
          </View>

          {/* ช่องรับค่าจริง (ซ่อนไว้แต่ให้กดได้) */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          {/* ช่องแสดงผล (Visual Boxes) */}
          <TouchableOpacity
            style={styles.otpBoxesContainer}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            {renderOtpBoxes()}
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>VERIFY</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEADER_BG, // พื้นหลังหลักเป็นสีเข้ม
  },

  // Header Styles
  headerContainer: {
    height: '35%', // กินพื้นที่ 35% ด้านบน
    backgroundColor: HEADER_BG,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
  },
  navBar: {
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#111',
    fontWeight: 'bold',
    marginTop: -2,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'Montserrat-Bold', // ถ้ามี font
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Body Styles (White Card)
  bodyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  // OTP Section
  otpSection: {
    marginBottom: 30,
  },
  codeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 1,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Input Styles
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 50, // ปรับขนาดตามจำนวนช่อง (ถ้า 4 ช่องใช้ 60-70)
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  otpBoxActive: {
    borderColor: '#EF9F27', // สีส้มเมื่อ Active
    backgroundColor: '#FFF',
  },
  otpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },

  // Button
  verifyButton: {
    backgroundColor: '#EF9F27',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF9F27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
