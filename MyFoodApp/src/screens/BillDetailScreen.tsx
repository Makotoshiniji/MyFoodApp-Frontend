declare var require: any;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
// import * as RNHTMLtoPDF from "react-native-html-to-pdf";
import api from "../api/client";
const RNHTMLtoPDF = require("react-native-html-to-pdf");

type Bill = {
  orderCode: string;
  userName: string;
  shopName: string;
  total: number;
  date: string;
  items: { name: string; quantity: number; price: number }[];
};

export default function BillDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 โหลดข้อมูลบิลจาก backend
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await api.get(`/api/payments/${orderId}`);
        setBill(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "ไม่สามารถโหลดข้อมูลบิลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [orderId]);

  // 🔹 ฟังก์ชันสร้าง PDF
  const generatePDF = async () => {
    if (!bill) return;

    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; color: #333; }
              h1 { text-align: center; color: #800080; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>ใบเสร็จการสั่งซื้อ</h1>
            <p><b>รหัสคำสั่งซื้อ:</b> ${bill.orderCode}</p>
            <p><b>ร้านค้า:</b> ${bill.shopName}</p>
            <p><b>ลูกค้า:</b> ${bill.userName}</p>
            <p><b>วันที่:</b> ${bill.date}</p>
            <table>
              <tr><th>รายการ</th><th>จำนวน</th><th>ราคา</th></tr>
              ${bill.items
                .map(
                  (it) => `
                    <tr>
                      <td>${it.name}</td>
                      <td>${it.quantity}</td>
                      <td>${(it.price * it.quantity).toFixed(2)}</td>
                    </tr>`
                )
                .join("")}
            </table>
            <p class="total">รวมทั้งหมด: ${bill.total.toFixed(2)} บาท</p>
          </body>
        </html>
      `;

      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: `bill_${bill.orderCode}`,
        base64: false,
        directory: "Documents",
      });

      Alert.alert("สร้างไฟล์สำเร็จ", "เปิดดูใบเสร็จได้เลย", [
        { text: "เปิดไฟล์", onPress: () => Linking.openURL(`file://${file.filePath}`) },
        { text: "ปิด" },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถสร้างไฟล์ PDF ได้");
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

      <Text style={styles.label}>รหัสคำสั่งซื้อ: {bill.orderCode}</Text>
      <Text style={styles.label}>ร้านค้า: {bill.shopName}</Text>
      <Text style={styles.label}>ลูกค้า: {bill.userName}</Text>
      <Text style={styles.label}>วันที่: {bill.date}</Text>

      <View style={styles.table}>
        <Text style={styles.subTitle}>รายการสินค้า</Text>
        {bill.items.map((it, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {it.name} × {it.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              {(it.price * it.quantity).toFixed(2)} ฿
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.total}>รวมทั้งหมด: {bill.total.toFixed(2)} ฿</Text>

      <TouchableOpacity style={styles.btn} onPress={generatePDF}>
        <Text style={styles.btnText}>📄 ดาวน์โหลดใบเสร็จ (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 🔹 สไตล์
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, color: "#800080", textAlign: "center", fontWeight: "bold", marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 4 },
  subTitle: { fontSize: 18, color: "#800080", marginBottom: 8, marginTop: 16 },
  table: { borderTopWidth: 1, borderColor: "#ddd", marginVertical: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderColor: "#eee" },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: "bold" },
  total: { textAlign: "right", fontSize: 18, fontWeight: "bold", marginTop: 10, color: "#333" },
  btn: { backgroundColor: "#800080", padding: 12, borderRadius: 10, marginTop: 20, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
