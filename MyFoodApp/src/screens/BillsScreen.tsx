import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, SafeAreaView } from "react-native";
import api from "../api/client";

type Bill = {
  id: number;
  orderId: number;
  orderCode: string;
  shopName: string;
  grandTotal: number;
  createdAt: string; // ISO string
  status: string;
};

type Props = { navigation: any; route: { params: { userId: number } } };

export default function BillsScreen({ navigation, route }: Props) {
  const { userId } = route.params;
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<Bill[]>(`/payments/user/${userId}/bills`);
        setBills(res.data ?? []);
      } catch (e: any) {
        console.log("load bills error:", e?.response?.data ?? e);
        setErrorMsg("ไม่สามารถโหลดรายการใบเสร็จได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

const goDetail = (orderId: number) => {
    navigation.navigate("BillDetail", { orderId, userId });
};

  const renderBill = ({ item }: { item: Bill }) => {
    const dt = new Date(item.createdAt);
    const dateStr = dt.toLocaleDateString("th-TH", { year: "2-digit", month: "2-digit", day: "2-digit" });
    const timeStr = dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => goDetail(item.orderId)}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.date}>{dateStr} | {timeStr}</Text>
            <Text style={styles.code}>เลขที่ใบเสร็จ: {item.orderCode}</Text>
          </View>
          <View style={styles.amountPill}>
            <Text style={styles.amountText}>฿ {item.grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paper}>
          <Text style={styles.shop}>{item.shopName}</Text>
          <Text style={styles.status}>สถานะ: {item.status}</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>ยอดสุทธิ</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.muted}>1 รายการ</Text>
            <Text style={styles.total}>฿ {item.grandTotal.toFixed(2)}</Text>
          </View>
          <Text style={styles.note}>* ใบเสร็จนี้ออกโดยระบบ My_FoodApp</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.title}>รายการใบเสร็จของฉัน</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.info}>กำลังโหลดรายการใบเสร็จ...</Text>
        </View>
      )}

      {!loading && errorMsg && (
        <View style={styles.center}><Text style={styles.info}>{errorMsg}</Text></View>
      )}

      {!loading && !errorMsg && bills.length === 0 && (
        <View style={styles.center}><Text style={styles.info}>ยังไม่มีใบเสร็จในระบบ</Text></View>
      )}

      {!loading && bills.length > 0 && (
        <FlatList data={bills} keyExtractor={(it) => String(it.id)} renderItem={renderBill}
                  contentContainerStyle={{ padding: 16, paddingBottom: 24 }} />
      )}
    </SafeAreaView>
  );
}

const PURPLE = "#800080";
const LIGHT_BG = "#F3F4F6";

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: LIGHT_BG },
  topbar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff" },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 20, color: PURPLE },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#111827" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  info: { marginTop: 8, fontSize: 14, color: "#6B7280" },

  card: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 16, elevation: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  date: { fontSize: 12, color: "#6B7280" },
  code: { marginTop: 2, fontSize: 13, fontWeight: "600", color: "#111827" },
  amountPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: PURPLE },
  amountText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  paper: { marginTop: 8, backgroundColor: "#FAFAFA", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  shop: { fontSize: 15, fontWeight: "700", color: "#374151" },
  status: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  divider: { marginVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#D1D5DB" },
  label: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 4 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  muted: { fontSize: 13, color: "#4B5563" },
  total: { fontSize: 14, fontWeight: "700", color: "#111827" },
  note: { marginTop: 8, fontSize: 11, color: "#9CA3AF" },
});
