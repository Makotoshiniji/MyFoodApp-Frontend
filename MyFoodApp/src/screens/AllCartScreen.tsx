// src/screens/AllCartScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import api, { API_BASE } from "../api/client";

type Props = {
  navigation: any;
  route: { params: { userId: number } };
};

type CartItem = {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
  shopId: number;
  shopName: string;
};

type ShopCartSummary = {
  shopId: number;
  shopName: string;
  totalItems: number;
  totalPrice: number;
  imageUrl?: string | null;
};

const SHOP_PLACEHOLDER = require("../../assets/images/CATAGORY_ICON_BURGERS.png");

const BASE_HOST = API_BASE.replace(/\/api\/?$/, "");

export default function AllCartScreen({ navigation, route }: Props) {
  const { userId } = route.params;

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

    const loadCart = async () => {
    try {
        setLoading(true);

        const res = await api.get<any[]>(`/Cart/${userId}/items`);
        const raw = res.data ?? [];

        console.log("AllCart raw:", raw); // ดูโครง JSON ใน Metro

        const mapped: CartItem[] = raw.map((it) => ({
        id: it.id,
        menuItemId: it.menuItemId,
        menuItemName: it.menuItemName ?? it.name ?? "ไม่ทราบชื่อเมนู",
        quantity: it.quantity ?? it.qty ?? 1,
        price: it.price ?? 0,
        imageUrl: it.imageUrl ?? null,
        // ❗ สำคัญ: ไม่ใช้ fallback เดา ให้ใช้ค่าจาก API เท่านั้น
        shopId: it.shopId,
        shopName: it.shopName ?? "ร้านอาหาร",
        }));

        setItems(mapped);
    } catch (err) {
        console.log("loadCart error", err);
        setItems([]);
    } finally {
        setLoading(false);
    }
    };


  useEffect(() => {
    loadCart();
  }, [userId]);

  // 🔁 รวมตามร้าน
    const shops = useMemo<ShopCartSummary[]>(() => {
    const map = new Map<number, ShopCartSummary>();

    for (const it of items) {
        if (it.shopId == null) continue; // ถ้าไม่มีจริง ๆ ก็ข้ามไปเลย

        const existing = map.get(it.shopId);
        if (!existing) {
        map.set(it.shopId, {
            shopId: it.shopId,
            shopName: it.shopName,
            totalItems: it.quantity,
            totalPrice: it.price * it.quantity,
            imageUrl: it.imageUrl ?? null,
        });
        } else {
        existing.totalItems += it.quantity;
        existing.totalPrice += it.price * it.quantity;
        if (!existing.imageUrl && it.imageUrl) {
            existing.imageUrl = it.imageUrl;
        }
        }
    }

    return Array.from(map.values());
    }, [items]);

  const openShopCart = (shop: ShopCartSummary) => {
    navigation.navigate("Cart", {
      userId,
      shopId: shop.shopId,
      shopName: shop.shopName,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>กำลังโหลดตะกร้า...</Text>
      </View>
    );
  }

  if (!shops.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>ยังไม่มีสินค้าในตะกร้า</Text>
        <Text style={styles.emptySubtitle}>
          เลือกเมนูจากร้านโปรดของคุณแล้วกลับมาที่นี่อีกครั้งนะ 🍔
        </Text>
      </View>
    );
  }

    return (
    <View style={styles.container}>
        {/* ───── Top Header (เหมือนรูป Confirm Order) ───── */}
        <View style={styles.topBar}>
        <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
        >
            <Text style={styles.backIcon}>{"❮"}</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>Confirm Order</Text>

        {/* ช่องว่างด้านขวาให้สมดุลกับปุ่มย้อนกลับ */}
        <View style={{ width: 32 }} />
        </View>

        {/* Header ด้านในของ AllCart เดิม */}
        <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.subtitle}>
            เลือกร้านที่ต้องการชำระเงิน ({shops.length} ร้าน)
        </Text>
        </View>

      <FlatList
        data={shops}
        keyExtractor={(item) => `${item.shopId}-${item.shopName}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const src = item.imageUrl
            ? {
                uri:
                  BASE_HOST +
                  (item.imageUrl.startsWith("/") ? "" : "/") +
                  item.imageUrl,
              }
            : SHOP_PLACEHOLDER;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openShopCart(item)}
              activeOpacity={0.9}
            >
              <Image source={src} style={styles.shopImage} />

              <View style={styles.cardMiddle}>
                <Text style={styles.shopName}>{item.shopName}</Text>
                <Text style={styles.shopMeta}>
                  {item.totalItems} รายการในตะกร้า
                </Text>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.totalPrice}>
                  ฿ {item.totalPrice.toFixed(2)}
                </Text>
                <Text style={styles.arrowText}>{">"}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  shopImage: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 12,
  },
  cardMiddle: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  shopMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F59E0B",
  },
  arrowText: {
    fontSize: 20,
    color: "#D1D5DB",
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F5F6FA",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  /* ─── Top header bar ─── */
  topBar: {
    paddingTop: 14,              // เผื่อระยะจากขอบบน (ถ้าอยากสูงกว่านี้เพิ่มได้)
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    marginTop: 40,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#111827",
  },
  topTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
});
