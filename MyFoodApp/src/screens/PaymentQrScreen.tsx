// src/screens/PaymentQrScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { API_BASE } from "../api/client";

const PROMPTPAY_ID = "0827028815";

export default function PaymentQrScreen({ navigation, route }: any) {
  const { amount, orderId, userId } = route.params;
  const amountText = amount.toFixed(2);
  const qrUrl = `https://promptpay.io/${PROMPTPAY_ID}/${amountText}.png`;
  

  const [slipUri, setSlipUri] = useState<string | null>(null);

  // 🔸 ฟังก์ชันเลือกสลิปจาก Gallery
  const handleUploadSlip = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.9,
    });

    if (result.didCancel) return;

    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setSlipUri(uri);
      Alert.alert("สำเร็จ", "อัปโหลดสลิปเรียบร้อยแล้ว ✅");
    }
  };

  // 🔸 ฟังก์ชันยืนยันการชำระเงิน (หลังอัปโหลดสลิป)
  const handleConfirmPayment = async () => {
    if (!slipUri) {
      Alert.alert("แจ้งเตือน", "กรุณาอัปโหลดสลิปก่อน");
      return;
    }

    try {
      const formData = new FormData();
      const fileName = slipUri.split("/").pop() || "slip.jpg";

      // ⚠️ ชื่อ field ต้องตรงกับ C# DTO: UploadSlipRequest { int? OrderId; IFormFile? SlipFile; }
      formData.append("OrderId", String(orderId));
      formData.append("SlipFile", {
        uri: slipUri,
        name: fileName,
        type: "image/jpeg",
      } as any);

      // ถ้าใน client.ts ลบ default Content-Type แล้ว
      // ตรงนี้ไม่ต้องใส่ header เลยก็ได้
      const res = await api.post("/payments/upload-slip", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // ถ้าใช้ interceptor แล้วจะไม่จำเป็น
        },
      });

      console.log("upload slip success:", res.data);

      Alert.alert("ส่งหลักฐานเรียบร้อย", "ระบบได้รับสลิปของคุณแล้ว ❤️", [
        {
          text: "ดูใบเสร็จ",
          onPress: () =>
            navigation.navigate("Bills", {
              userId, // ✅ ส่งไปให้ BillsScreen โหลดรายการของผู้ใช้
            }),
        },
      ]);
    } catch (err: any) {
      console.log(
        "upload slip error:",
        JSON.stringify(err?.response?.data ?? err, null, 2)
      );
      Alert.alert("ผิดพลาด", "ไม่สามารถอัปโหลดสลิปได้ กรุณาลองใหม่");
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
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
            <Image source={{ uri: qrUrl }} style={styles.qr} resizeMode="contain" />
          </View>

          <Text style={styles.note}>
            📱 ใช้แอปธนาคารสแกน QR นี้เพื่อโอนเงินผ่าน PromptPay{`\n`}
            หลังโอนเสร็จอย่าลืมอัปโหลดสลิปการโอนเงินด้านล่างนะ 💳
          </Text>

          {/* ✅ ถ้ามีรูปสลิปแล้ว แสดงตัวอย่าง */}
          {slipUri && (
            <View style={styles.slipPreviewCard}>
              <Text style={styles.slipLabel}>สลิปที่อัปโหลด</Text>
              <Image source={{ uri: slipUri }} style={styles.slipImage} />
            </View>
          )}
        </View>

        {/* ปุ่มอัปโหลดสลิป */}
        <TouchableOpacity
          onPress={handleUploadSlip}
          style={styles.uploadButton}
          activeOpacity={0.9}
        >
          <Text style={styles.uploadText}>
            {slipUri ? "เปลี่ยนสลิปการโอนเงิน" : "อัปโหลดสลิปการโอนเงิน"}
          </Text>
        </TouchableOpacity>

        {/* ปุ่มยืนยัน (โชว์หลังอัปโหลดสลิปแล้ว) */}
        {slipUri && (
          <TouchableOpacity
            onPress={handleConfirmPayment}
            style={styles.confirmButton}
            activeOpacity={0.9}
          >
            <Text style={styles.confirmText}>ยืนยันการชำระเงิน</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  backBtn: {
    backgroundColor: "#F3F4F6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#374151",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "600",
    marginBottom: 20,
  },
  qrWrapper: {
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
    borderColor: "#F97316",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
  },
  qr: {
    width: 220,
    height: 220,
  },
  note: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  uploadText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: "#16A34A",
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  slipPreviewCard: {
    marginTop: 16,
    alignItems: "center",
  },
  slipLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
  },
  slipImage: {
    width: 220,
    height: 320,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
