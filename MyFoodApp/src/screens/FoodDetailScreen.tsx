import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";

// ---------- types ----------
type MenuOption = {
  id: number;
  name: string;
  extraPrice: number;
  isDefault: boolean;
};

type MenuOptionGroup = {
  id: number;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
};

type MenuItemDetail = {
  id: number;
  shopId: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  optionGroups: MenuOptionGroup[];
};

type Props = {
  route: any;
  navigation: any;
};

export default function FoodDetailScreen({ route, navigation }: Props) {
  const { menuItemId, shop } = route.params;

  const [detail, setDetail] = useState<MenuItemDetail | null>(null);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = useMemo(
    () =>
      api.defaults.baseURL
        ? api.defaults.baseURL.replace(/\/api\/?$/, "") // ✅ ตัด /api ทิ้ง
        : "http://10.0.2.2:7284",
    []
  );

  // ---------- โหลด userId จาก AsyncStorage ----------
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("logged_in_user");
        if (stored) {
          const u = JSON.parse(stored);
          setUserId(u.id);
          console.log("loaded userId:", u.id);
        }
      } catch (err) {
        console.warn("Failed to load logged_in_user", err);
      }
    })();
  }, []);

  // ---------- โหลดรายละเอียดเมนู ----------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get<MenuItemDetail>(
          `/MenuItems/${menuItemId}/detail`
        );
        if (!mounted) return;

        setDetail(res.data);

        // ตั้งค่า default selections
        const init: Record<number, number[]> = {};
        res.data.optionGroups.forEach((g) => {
          init[g.id] = g.options.filter((o) => o.isDefault).map((o) => o.id);
        });
        setSelected(init);
      } catch (e: any) {
        if (mounted) {
          setError(
            e?.response?.data?.toString() ??
              e?.message ??
              "เกิดข้อผิดพลาดในการโหลดเมนู"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [menuItemId]);

  // ---------- คำนวณราคา ----------
  const calcTotal = () => {
    if (!detail) return 0;
    const base = detail.price;
    const extra = detail.optionGroups.reduce((sum, g) => {
      const ids = selected[g.id] ?? [];
      const opts = g.options.filter((o) => ids.includes(o.id));
      return sum + opts.reduce((s, o) => s + o.extraPrice, 0);
    }, 0);
    return (base + extra) * qty;
  };

  const total = calcTotal();

  const menuImgSource =
    detail?.imageUrl
      ? {
          uri: `${BASE_URL}${
            detail.imageUrl.startsWith("/") ? "" : "/"
          }${detail.imageUrl}`,
        }
      : undefined;

  // ---------- ฟังก์ชันเปลี่ยน option (ตรงนี้แหละ toggleOption 😉) ----------
  const toggleOption = (group: MenuOptionGroup, option: MenuOption) => {
    setSelected((prev) => {
      const current = prev[group.id] ?? [];

      // ถ้ากดตัวที่เลือกอยู่แล้ว
      if (current.includes(option.id)) {
        // ถ้ากลุ่มนี้เป็นแบบบังคับ (ต้องมีอย่างน้อย 1) → ไม่ให้เอาออก
        if (group.isRequired) {
          return prev;
        }
        // ถ้าไม่บังคับ → เอาออกให้กลายเป็นไม่ได้เลือกอะไร
        return { ...prev, [group.id]: [] };
      }

      // ถ้ากดตัวใหม่ → เซ็ตให้กลุ่มนี้มีแค่ option เดียว
      return { ...prev, [group.id]: [option.id] };
    });
  };

  // ---------- ยิง API เพิ่มลงตะกร้า ----------
  const handleAddToCart = async () => {
    if (!detail) return;

    if (!userId) {
      Alert.alert("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
      return;
    }

    const optionsPayload = detail.optionGroups.flatMap((g) => {
      const ids = selected[g.id] ?? [];
      return g.options
        .filter((o) => ids.includes(o.id))
        .map((o) => ({
          optionName: o.name,
          extraPrice: o.extraPrice,
        }));
    });

    try {
      setSubmitting(true);

      console.log("POST /Cart userId =", userId, "payload =",  {
        menuItemId: detail.id,
        qty,
        options: optionsPayload,
      });

      await api.post(`/Cart/${userId}/items`, {
        menuItemId: detail.id,
        qty,
        options: optionsPayload,
      });

      Alert.alert("สำเร็จ", "เพิ่มสินค้าในตะกร้าแล้ว");
      // navigation.navigate("Cart");
    } catch (err: any) {
      console.log("add to cart error", err?.response?.data ?? err);
      Alert.alert("ผิดพลาด", "ไม่สามารถเพิ่มลงตะกร้าได้");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- render ----------
  if (loading || !detail) {
    return (
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text>{error ?? "ไม่พบข้อมูลเมนู"}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* hero image */}
        {menuImgSource ? (
          <Image source={menuImgSource} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: "#ddd" }]} />
        )}

        {/* card */}
        <View style={styles.infoCard}>
          <Text style={styles.foodName}>{detail.name}</Text>
          {detail.description ? (
            <Text style={styles.foodDesc}>{detail.description}</Text>
          ) : null}
          <Text style={styles.foodPrice}>
            เริ่มต้น ฿ {detail.price.toFixed(2)}
          </Text>

          {shop?.name && (
            <Text style={styles.shopName}>จากร้าน {shop.name}</Text>
          )}
        </View>

        {/* option groups */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          {detail.optionGroups.map((g) => (
            <View key={g.id} style={{ marginBottom: 16 }}>
              <Text style={styles.sectionHeader}>
                {g.name}{" "}
                {g.isRequired && (
                  <Text style={{ color: "#F97316", fontSize: 12 }}>
                    *จำเป็น
                  </Text>
                )}
              </Text>

              {g.options.map((o) => {
                const isSelected = (selected[g.id] ?? []).includes(o.id);

                return (
                  <TouchableOpacity
                    key={o.id}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: isSelected ? "#1BAF5D" : "#E5E7EB",
                        backgroundColor: isSelected ? "#ECFDF3" : "#FFFFFF",
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleOption(g, o)}
                  >
                    <View>
                      <Text style={styles.optionName}>{o.name}</Text>
                      {o.extraPrice !== 0 && (
                        <Text style={styles.optionPrice}>
                          {o.extraPrice > 0
                            ? `+ ฿ ${o.extraPrice.toFixed(2)}`
                            : `- ฿ ${Math.abs(o.extraPrice).toFixed(2)}`}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            style={styles.qtyBtn}
            disabled={qty <= 1}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            onPress={() => setQty((q) => q + 1)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, submitting && { opacity: 0.6 }]}
          onPress={handleAddToCart}
          disabled={submitting}
        >
          <Text style={styles.addBtnText}>
            {submitting
              ? "กำลังเพิ่ม..."
              : `เพิ่มลงตะกร้า • ฿ ${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "#172B4D", fontWeight: "700", fontSize: 16 }}>
          ‹ Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#ccc",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  foodName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172B4D",
  },
  foodDesc: {
    marginTop: 4,
    color: "#6B7280",
  },
  foodPrice: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#172B4D",
  },
  shopName: {
    marginTop: 4,
    fontSize: 13,
    color: "#7B8AA3",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172B4D",
    marginBottom: 8,
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  optionPrice: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: "#1BAF5D",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#1BAF5D",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  qtyText: {
    minWidth: 32,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#1BAF5D",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 16,
    padding: 4,
  },
});
