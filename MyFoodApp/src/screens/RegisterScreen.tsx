// src/screens/RegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { AuthApi } from "../api/auth";

const IMAGES = {
  main: require("../../assets/images/MAIN_LOGO.png"),
  facebook: require("../../assets/images/FACEBOOK_LOGO.png"),
  google: require("../../assets/images/GOOGLE_LOGO.png"),
  emailCollect: require("../../assets/images/EMAIL_COLLECT_ICON.png"),
  hide: require("../../assets/images/HIDE_PASSWORD_ICON.png"),
  unhide: require("../../assets/images/UNHIDE_PASSWORD_ICON.png"),
};

type UserShape = { id: number; username: string; email?: string; rank: "admin" | "user" };

type Props = {
  onRegistered: (u: UserShape) => void;
  onGoSignIn: () => void;
};

export default function RegisterScreen({ onRegistered, onGoSignIn }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pwdHidden, setPwdHidden] = useState(true);
  const [confirmPwdHidden, setConfirmPwdHidden] = useState(true);

  const [loading, setLoading] = useState(false);

  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPwd, setFocusPwd] = useState(false);
  const [focusConfirmPwd, setFocusConfirmPwd] = useState(false);

  const submit = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("สมัครไม่สำเร็จ", "กรุณากรอกชื่อ, อีเมล, รหัสผ่าน และยืนยันรหัสผ่าน");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("สมัครไม่สำเร็จ", "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);
      const user = await AuthApi.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      onRegistered(user);
    } catch (e: any) {
      Alert.alert("สมัครไม่สำเร็จ", e?.message ?? "unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* โลโก้ */}
      <Image source={IMAGES.main} style={styles.mainLogo} resizeMode="contain" />

      {/* หัวเรื่อง */}
      <Text style={[styles.title, styles.fontMain]}>Hello! Create Account</Text>
      <Text style={[styles.sub, styles.fontMain]}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={onGoSignIn}>
          Sign in
        </Text>
      </Text>

      {/* Name */}
      <View style={[styles.inputWrap, focusName && styles.inputWrapFocus]}>
        <TextInput
          value={username}
          onChangeText={setUsername}
          onFocus={() => setFocusName(true)}
          onBlur={() => setFocusName(false)}
          style={[styles.input, styles.fontMain, { paddingLeft: 24 }]}
          placeholder={focusName || username ? "" : "Your name"}
          placeholderTextColor={COLOR.placeholder}
        />
      </View>

      {/* Email */}
      <View style={[styles.inputWrap, focusEmail && styles.inputWrapFocus]}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusEmail(true)}
          onBlur={() => setFocusEmail(false)}
          style={[styles.input, styles.fontMain, { paddingLeft: 24 }]}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder={focusEmail || email ? "" : "Username or Email"}
          placeholderTextColor={COLOR.placeholder}
        />
        {email.trim().length > 0 && (
          <Image source={IMAGES.emailCollect} style={styles.rightIcon} resizeMode="contain" />
        )}
      </View>

      {/* Password */}
      <View style={[styles.inputWrap, focusPwd && styles.inputWrapFocus]}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusPwd(true)}
          onBlur={() => setFocusPwd(false)}
          style={[styles.input, styles.fontMain, { paddingLeft: 24 }]}
          secureTextEntry={pwdHidden}
          placeholder={focusPwd || password ? "" : "Password"}
          placeholderTextColor={COLOR.placeholder}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setPwdHidden(v => !v)}>
          <Image
            source={pwdHidden ? IMAGES.hide : IMAGES.unhide}
            style={{ width: 22, height: 22, opacity: 0.85 }}
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={[styles.inputWrap, focusConfirmPwd && styles.inputWrapFocus]}>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => setFocusConfirmPwd(true)}
          onBlur={() => setFocusConfirmPwd(false)}
          style={[styles.input, styles.fontMain, { paddingLeft: 24 }]}
          secureTextEntry={confirmPwdHidden}
          placeholder={focusConfirmPwd || confirmPassword ? "" : "Confirm Password"}
          placeholderTextColor={COLOR.placeholder}
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setConfirmPwdHidden(v => !v)}
        >
          <Image
            source={confirmPwdHidden ? IMAGES.hide : IMAGES.unhide}
            style={{ width: 22, height: 22, opacity: 0.85 }}
          />
        </TouchableOpacity>
      </View>

      {/* ปุ่มสมัคร */}
      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={[styles.primaryText, styles.fontMain]}>
          {loading ? "Creating..." : "Sign up"}
        </Text>
      </TouchableOpacity>

      {/* เส้นคั่น OR */}
      <View style={styles.orRow}>
        <View style={styles.hr} />
        <Text style={[styles.orText, styles.fontMain]}>OR</Text>
        <View style={styles.hr} />
      </View>

      {/* ปุ่ม Social */}
      <TouchableOpacity style={styles.socialBtn}>
        <View style={styles.socialBtnInner}>
          <Image source={IMAGES.facebook} style={styles.socialIconAbs} resizeMode="contain" />
          <Text style={[styles.socialText, styles.fontMain]}>Connect with Facebook</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialBtn, { marginTop: 12 }]}>
        <View style={styles.socialBtnInner}>
          <Image source={IMAGES.google} style={styles.socialIconAbs} resizeMode="contain" />
          <Text style={[styles.socialText, styles.fontMain]}>Connect with Google</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const COLOR = {
  orange: "#EF9F27",
  navy: "#172B4D",
  gray: "#7A869A",
  inputBg: "#EEF3FAFF",      // พื้นหลังช่องกรอก (โทนอ่อน)
  border: "#E6EDF7",
  borderFocus: "#D8E4FF",    // เวลาโฟกัส เปลี่ยนแค่สีเส้นขอบ
  placeholder: "#99A1A8",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 40,
  },
  fontMain: { fontFamily: "Montserrat-Light", color: COLOR.navy },

  mainLogo: { width: 180, height: 140, marginBottom: 8, alignSelf: "center", marginTop: 40 },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLOR.navy,
    marginTop: 4,
  },
  sub: { color: COLOR.gray, marginTop: 6, marginBottom: 10, fontSize: 14 },
  link: { color: COLOR.orange },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "86%",
    alignSelf: "center",
    backgroundColor: COLOR.inputBg,   // ✅ พื้นหลังคงที่ไม่เปลี่ยน
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLOR.border,
  },
  inputWrapFocus: {
    // ✅ เปลี่ยนแค่สีขอบ เวลามี focus
    borderColor: COLOR.borderFocus,
  },
  input: { flex: 1, fontSize: 16, color: COLOR.navy },

  rightIcon: { position: "absolute", right: 12, width: 22, height: 22, opacity: 0.9 },
  eyeBtn: { width: 32, alignItems: "flex-end" },

  primaryBtn: {
    width: "86%",
    height: 50,
    backgroundColor: COLOR.orange,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  orRow: {
    width: "86%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  hr: { flex: 1, height: 1, backgroundColor: "#E8EEF7" },
  orText: { marginHorizontal: 10, color: COLOR.gray },

  socialBtn: {
    width: "86%",
    height: 52,
    backgroundColor: "#F2F6FF",
    borderRadius: 12,
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  socialBtnInner: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  socialIconAbs: { position: "absolute", left: 14, width: 24, height: 24 },
  socialText: { color: "#7A869A", fontWeight: "700", fontSize: 15 },
});
