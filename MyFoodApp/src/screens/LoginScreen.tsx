import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { AuthApi } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGES = {
  main: require('../../assets/images/MAIN_LOGO.png'),
  facebook: require('../../assets/images/FACEBOOK_LOGO.png'),
  google: require('../../assets/images/GOOGLE_LOGO.png'),
  emailCollect: require('../../assets/images/EMAIL_COLLECT_ICON.png'),
  hide: require('../../assets/images/HIDE_PASSWORD_ICON.png'),
  unhide: require('../../assets/images/UNHIDE_PASSWORD_ICON.png'),
};

type UserShape = {
  id: number;
  username: string;
  email?: string;
  rank: 'admin' | 'user';
};
type Props = {
  onLoggedIn: (u: UserShape) => void;
  onGoSignUp: () => void; // 🟩 เพิ่ม prop สำหรับไปหน้า Register
  onGoForgotPassword: () => void; // 👈 เพิ่มบรรทัดนี้
};

export default function LoginScreen({
  onLoggedIn,
  onGoSignUp,
  onGoForgotPassword,
}: Props) {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pwdHidden, setPwdHidden] = useState(true);
  const [focusPwd, setFocusPwd] = useState(false);

  const submit = async () => {
    try {
      if (!identity.trim() || !password) {
        Alert.alert('ล็อกอินล้มเหลว', 'กรุณากรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน');
        return;
      }
      setLoading(true);

      const user = await AuthApi.login({ identity: identity.trim(), password });

      // ✅ เก็บ user ไว้ใน AsyncStorage ให้ทั้งแอปใช้ได้
      await AsyncStorage.setItem('logged_in_user', JSON.stringify(user));

      // แจ้ง parent ว่าล็อกอินสำเร็จแล้ว (ของเดิม)
      onLoggedIn(user);
    } catch (e: any) {
      Alert.alert('ล็อกอินล้มเหลว', e?.message ?? 'unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* โลโก้หลัก */}
      <Image
        source={IMAGES.main}
        style={styles.mainLogo}
        resizeMode="contain"
      />

      {/* Welcome */}
      <Text style={styles.welcomeTitle}>Welcome Back</Text>
      <Text style={styles.subText}>Hello, sign in to continue!</Text>
      <Text style={styles.subText}>
        Or{' '}
        <Text style={styles.createLink} onPress={onGoSignUp}>
          Create new account
        </Text>
      </Text>

      {/* ช่องกรอก Email/Username */}
      <View style={styles.inputWrap}>
        <TextInput
          placeholder="Username or Email"
          placeholderTextColor="#99A1A8"
          style={[styles.input, { paddingLeft: 24 }]}
          autoCapitalize="none"
          keyboardType="email-address"
          value={identity}
          onChangeText={setIdentity}
        />
        {identity.trim().length > 0 && (
          <Image
            source={IMAGES.emailCollect}
            style={styles.rightEmailIcon}
            resizeMode="contain"
          />
        )}
      </View>

      {/* ช่องกรอกรหัสผ่าน */}
      <View style={[styles.inputWrap, { marginTop: 12 }]}>
        <View style={{ width: 24 }} />
        <TextInput
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusPwd(true)}
          onBlur={() => setFocusPwd(false)}
          style={[styles.input, styles.fontMain]}
          placeholder={focusPwd || password.length > 0 ? '' : 'Password'}
          placeholderTextColor="#7A869A"
          secureTextEntry={pwdHidden}
        />
        <TouchableOpacity
          onPress={() => setPwdHidden(v => !v)}
          style={styles.eyeBtn}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <Image
            source={pwdHidden ? IMAGES.hide : IMAGES.unhide}
            style={{ width: 22, height: 22 }}
          />
        </TouchableOpacity>
      </View>

      {/* ปุ่ม Sign in */}
      <TouchableOpacity
        style={[styles.signInBtn, loading && { opacity: 0.7 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={[styles.signInText, styles.fontMain]}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      {/* ลิงก์ Forgot */}
      <TouchableOpacity onPress={onGoForgotPassword}>
        <Text style={styles.forgotLink}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* เส้นคั่น OR */}
      <View style={styles.orRow}>
        <View style={styles.hr} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.hr} />
      </View>

      {/* ปุ่ม Social */}
      <TouchableOpacity style={styles.socialBtn}>
        <View style={styles.socialBtnInner}>
          <Image
            source={IMAGES.facebook}
            style={styles.socialIconAbs}
            resizeMode="contain"
          />
          <Text style={[styles.socialText, styles.fontMain]}>
            Connect with Facebook
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialBtn, { marginTop: 12 }]}>
        <View style={styles.socialBtnInner}>
          <Image
            source={IMAGES.google}
            style={styles.socialIconAbs}
            resizeMode="contain"
          />
          <Text style={[styles.socialText, styles.fontMain]}>
            Connect with Google
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const COLOR = {
  orange: '#EF9F27',
  navy: '#172B4D',
  gray: '#7A869A',
  inputBg: '#EEF3FAFF',
  cardBg: '#FFFFFF',
  border: '#E6EDF7',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 48,
  },
  fontMain: { fontFamily: 'Montserrat-Light', color: COLOR.navy },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLOR.navy,
    marginTop: 4,
    marginBottom: 6,
    fontFamily: 'Montserrat-Light',
  },
  subText: {
    color: COLOR.gray,
    fontSize: 14,
    marginBottom: 2,
    fontFamily: 'Montserrat-Light',
  },
  createLink: { color: COLOR.orange, fontFamily: 'Montserrat-Light' },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '86%',
    alignSelf: 'center',
    backgroundColor: COLOR.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 22,
    borderWidth: 1,
    borderColor: COLOR.border,
  },

  input: { flex: 1, fontSize: 16, color: COLOR.navy },
  eyeBtn: { width: 32, alignItems: 'flex-end' },

  signInBtn: {
    width: '86%',
    height: 50,
    backgroundColor: COLOR.orange,
    alignSelf: 'center',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  forgotLink: {
    color: COLOR.orange,
    marginTop: 10,
    fontFamily: 'Montserrat-Light',
  },

  orRow: {
    width: '86%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  hr: { flex: 1, height: 1, backgroundColor: '#E8EEF7' },
  orText: {
    marginHorizontal: 10,
    color: COLOR.gray,
    fontFamily: 'Montserrat-Light',
  },

  mainLogo: {
    width: 180,
    height: 140,
    marginBottom: 10,
    alignSelf: 'center',
    marginTop: 40,
  },

  rightEmailIcon: {
    position: 'absolute',
    right: 12,
    width: 22,
    height: 22,
    opacity: 0.9,
  },

  socialBtn: {
    width: '86%',
    height: 52,
    backgroundColor: '#F2F6FF',
    borderRadius: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  socialBtnInner: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  socialIconAbs: { position: 'absolute', left: 14, width: 24, height: 24 },
  socialText: { color: '#7A869A', fontWeight: '700', fontSize: 15 },
});
