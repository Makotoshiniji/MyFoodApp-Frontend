// src/screens/ShopDetailScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api, { API_BASE } from "../api/client";

// รูปแบบข้อมูลเมนูที่ backend ส่งมา
type MenuItem = {
  id: number;
  shopId: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;     // มาจาก ImageUrl (NotMapped) ใน C#
  mainPhotoUrl?: string | null; // กันกรณี backend ยังส่งตัวนี้มาด้วย
};

export default function ShopDetailScreen({ route, navigation }: any) {
  const { shop } = route.params ?? {};
  // shop = object จาก HomeScreen (ต้องมีอย่างน้อย shop.id, shop.name, promoUrl, ...)

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = useMemo(
    () =>
      (api.defaults.baseURL ?? API_BASE).replace(/\/api\/?$/, "") ||
      "http://10.0.2.2:7284",
    []
  );

  // โหลดเมนูตาม shop.id
  useEffect(() => {
    if (!shop?.id) {
      setLoading(false);
      setError("ไม่พบข้อมูลร้าน (shop.id)");
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<MenuItem[]>("/MenuItems", {
          params: { shopId: shop.id },
        });

        if (mounted) {
          setMenuItems(res.data ?? []);
        }
      } catch (e: any) {
        console.error("Load menu error:", e);
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
  }, [shop?.id, BASE_URL]);

  // helper สร้าง source ของรูปเมนูจาก path ใน SQL
  const getMenuImageSource = (item: MenuItem) => {
    if (item.imageUrl) {
      // ถ้า backend ส่งมาเป็น URL เต็ม
      if (item.imageUrl.startsWith("http")) {
        return { uri: item.imageUrl };
      }
      // ถ้าเป็น path เช่น /shop_uploads/menuitems/1_1.png
      return {
        uri: `${BASE_URL}${
          item.imageUrl.startsWith("/") ? "" : "/"
        }${item.imageUrl}`,
      };
    }

    if (item.mainPhotoUrl) {
      // กันกรณีใช้ MainPhotoUrl เดิม
      return {
        uri: `${BASE_URL}/shop_uploads/menuitems/${item.mainPhotoUrl}`,
      };
    }

    // ถ้าไม่มีรูปใน DB เลย ค่อย fallback เป็นรูป local
    return require("../../assets/images/CATAGORY_ICON_BURGERS.png");
  };

  // helper สร้าง URL รูปร้าน (promo)
  const getShopHeroSource = () => {
    if (!shop?.promoUrl) return null;

    if (shop.promoUrl.startsWith("http")) {
      return { uri: shop.promoUrl };
    }

    return {
      uri: `${BASE_URL}${
        shop.promoUrl.startsWith("/") ? "" : "/"
      }${shop.promoUrl}`,
    };
  };

  const heroSrc = getShopHeroSource();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* ส่วน header รูปร้าน */}
        {heroSrc ? (
          <Image source={heroSrc} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: "#ddd" }]} />
        )}

        {/* การ์ดข้อมูลร้าน */}
        <View style={styles.infoCard}>
          <Text style={styles.shopNameRow}>
            <Text style={styles.shopName}>{shop?.name ?? "Shop"}</Text>
            <Text style={styles.verifyDot}>  ✓</Text>
          </Text>

          <View style={styles.row}>
            <Text style={[styles.badgeOpen, { color: "#1BAF5D" }]}>Open</Text>
            <Text style={styles.sepDot}> · </Text>
            <Text style={styles.addrText}>
              {shop?.description ?? "รายละเอียดร้าน / ที่อยู่ ..."}
            </Text>
          </View>

          <View style={styles.rowChips}>
            <View style={styles.detailChip}>
              <Text style={styles.star}>★ </Text>
              <Text style={styles.chipTextSmall}>
                {(shop?.ratingAvg ?? 4.5).toFixed(1)}
              </Text>
            </View>

            <View style={styles.detailChip}>
              <Text style={styles.chipTextSmall}>15 mins</Text>
            </View>

            <View style={styles.detailChip}>
              <Text style={styles.chipTextSmall}>Free shipping</Text>
            </View>
          </View>
        </View>

        {/* เมนูจากฐานข้อมูล */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={styles.sectionHeader}>Popular Items</Text>

          {loading ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="large" />
            </View>
          ) : error ? (
            <Text style={{ color: "red", marginTop: 8 }}>{error}</Text>
          ) : menuItems.length === 0 ? (
            <Text style={{ opacity: 0.6, marginTop: 8 }}>
              ยังไม่มีเมนูสำหรับร้านนี้
            </Text>
          ) : (
            menuItems.map((item) => (
              <View key={item.id} style={styles.menuRow}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate("FoodDetail", {
                      menuItemId: item.id,
                      shop,
                    })
                  }
                >
                  <Image source={getMenuImageSource(item)} style={styles.menuThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <Text style={styles.menuPrice}>฿ {Number(item.price).toFixed(2)}</Text>
                    {item.description ? (
                      <Text style={styles.menuType} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={{ fontSize: 20, color: "#FFB020" }}>★</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ปุ่ม Back ง่ายๆ มุมบนซ้าย */}
      <TouchableOpacity
        style={styles.backBtn}
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
      >
        <Text
          style={{ color: "#172B4D", fontWeight: "700", fontSize: 16 }}
        >{`‹ Back`}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
    height: 200,
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
  shopNameRow: {
    flexDirection: "row",
    fontSize: 20,
    fontWeight: "800",
    color: "#172B4D",
  },
  shopName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172B4D",
  },
  verifyDot: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1BAF5D",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  rowChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  badgeOpen: {
    fontSize: 14,
    fontWeight: "700",
  },
  sepDot: {
    color: "#7B8AA3",
    marginHorizontal: 4,
  },
  addrText: {
    color: "#7B8AA3",
    fontSize: 14,
    fontWeight: "600",
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E8",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  star: {
    color: "#F59E0B",
    fontWeight: "700",
  },
  chipTextSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172B4D",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172B4D",
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEFF4",
  },
  menuThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#EEE",
  },
  menuName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172B4D",
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172B4D",
    marginTop: 4,
  },
  menuType: {
    fontSize: 13,
    fontWeight: "500",
    color: "#7B8AA3",
    marginTop: 2,
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
