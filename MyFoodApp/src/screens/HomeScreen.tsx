// src/screens/HomeScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { API_BASE } from '../api/client';

const BASE_HOST = API_BASE.replace('/api', ''); // => http://10.0.2.2:7284

const toAbsolute = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return `${BASE_HOST}${p.startsWith('/') ? '' : '/'}${p}`;
};

// ---------------- Types ----------------
type Shop = {
  id: number;
  name: string;
  description?: string;
  isOpen: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  promoUrl?: string;
};

// ---------------- Assets ----------------
const ICONS = {
  searchbar: require('../../assets/images/SEARCHBAR_ICON.png'),
  dropdown: require('../../assets/images/DROP_DOWN_ICON.png'),
};

const CATS = [
  {
    key: 'burgers',
    titleTh: 'Burgers',
    img: require('../../assets/images/CATAGORY_ICON_BURGERS.png'),
  },
  {
    key: 'chicken',
    titleTh: 'Chicken',
    img: require('../../assets/images/CATAGORY_ICON_CHICKEN.png'),
  },
  {
    key: 'drinks',
    titleTh: 'Drinks',
    img: require('../../assets/images/CATAGORY_ICON_DRINKS.png'),
  },
  {
    key: 'pizza',
    titleTh: 'Pizza',
    img: require('../../assets/images/CATAGORY_ICON_PIZZA.png'),
  },
  {
    key: 'sandwich',
    titleTh: 'Sandwich',
    img: require('../../assets/images/CATAGORY_ICON_SANWICH.png'),
  },
];

const SHOP_IMAGES: Record<string, any> = {
  KFC: require('../../assets/images/SHOP_KFC.png'),
  McDonald: require('../../assets/images/SHOP_MCD.png'),
  'Burger King': require('../../assets/images/SHOP_BK.png'),
};
const SHOP_PLACEHOLDER = require('../../assets/images/CATAGORY_ICON_BURGERS.png');

// ---------------- Screen ----------------
export default function HomeScreen({ navigation, currentUser }: any) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  type TopTab = 'nearby' | 'sales' | 'rate' | 'fast';
  const [topTab, setTopTab] = useState<TopTab>('nearby');
  const [cartCount, setCartCount] = useState(0);
  const [showPromo, setShowPromo] = useState(true);

  const getETA = (s: Shop) => ((s.id * 7) % 20) + 10; // 10–29 นาที

  const displayedShops = useMemo(() => {
    const arr = [...shops];
    switch (topTab) {
      case 'sales':
        return arr.sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
      case 'rate':
        return arr.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
      case 'fast':
        return arr.sort((a, b) => getETA(a) - getETA(b));
      case 'nearby':
      default:
        return arr;
    }
  }, [shops, topTab]);

  const loadCartCount = useCallback(async () => {
    try {
      if (!currentUser?.id) {
        setCartCount(0);
        return;
      }

      const res = await api.get<any[]>(`/Cart/${currentUser.id}/items`);
      const data = res.data ?? [];

      const total = data.reduce((sum, it) => {
        const qty = it.quantity ?? it.qty ?? 1;
        return sum + qty;
      }, 0);

      setCartCount(total);
    } catch (err) {
      console.log('loadCartCount error:', err);
      setCartCount(0);
    }
  }, [currentUser?.id]);

  // โหลดร้าน
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // โหลดร้านทั้งหมด
        const res = await api.get<Shop[]>('/shops');
        if (mounted) setShops(res.data ?? []);
      } catch (e) {
        console.log('GET /shops error', e);
        if (mounted) {
          setShops([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ทุกครั้งที่หน้า Home ถูกโฟกัส (กลับมาจาก Cart/AllCart)
  useFocusEffect(
    useCallback(() => {
      loadCartCount();
    }, [loadCartCount]),
  );

  const popularTop4 = useMemo(() => {
    const withScore = shops.map(s => ({
      ...s,
      score:
        typeof s.ratingCount === 'number'
          ? s.ratingCount
          : Math.floor(Math.random() * 100),
    }));
    return withScore
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 4);
  }, [shops]);

  const openShop = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shop });
  };

  const greetingName = currentUser?.username || currentUser?.email || 'Guest';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          {/* top row: sidebar + deliver to + bag */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.sidebarBtn}
              activeOpacity={0.8}
              onPress={() => {
                // 1. Log ค่าออกมาดู (จะทำงานเมื่อกดปุ่มเท่านั้น)
                console.log('กดปุ่ม Profile, ส่ง userId:', currentUser?.id);

                // 2. สั่งเปลี่ยนหน้า พร้อมส่ง userId
                navigation.navigate('Profile', { userId: currentUser?.id });
              }}
            >
              <View style={styles.sidebarLine} />
              <View style={[styles.sidebarLine, { width: 14 }]} />
              <View style={[styles.sidebarLine, { width: 10 }]} />
            </TouchableOpacity>

            {/* deliver to */}
            <View style={styles.headerCenter}>
              <Text style={styles.deliverToLabel}>DELIVER TO</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.locationText} numberOfLines={1}>
                  KhonKean University
                </Text>
                <Image source={ICONS.dropdown} style={styles.dropdownIcon} />
              </View>
            </View>

            {/* 👜 Shopping Bag (Cart Icon) */}
            <TouchableOpacity
              style={styles.bagWrapper}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('AllCart', { userId: currentUser.id })
              }
            >
              <View style={styles.bagCircle}>
                <Image
                  source={require('../../assets/images/ICON_BAG.png')}
                  style={{ width: 22, height: 22, tintColor: '#fff' }}
                  resizeMode="contain"
                />
              </View>

              {/* 🔸 Badge นับจำนวนในตะกร้า */}
              {cartCount > 0 && (
                <View style={styles.bagBadge}>
                  <Text style={styles.bagBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* greeting */}
          <Text style={styles.greetingText}>
            Hey {greetingName},{' '}
            <Text style={styles.greetingBold}>Good Afternoon!</Text>
          </Text>

          {/* search bar */}
          <View style={styles.searchBar}>
            <Image source={ICONS.searchbar} style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>
              Search dishes, restaurants
            </Text>
          </View>
        </View>

        {/* ======================================================
          SECTION 2: CATEGORY
        ====================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catPillRow}
        >
          {/* ปุ่ม All */}
          <TouchableOpacity
            key="all"
            style={[
              styles.catPill,
              activeCat === 'all' && styles.catPillActive,
            ]}
            onPress={() => setActiveCat('all')}
            activeOpacity={0.9}
          >
            <View style={styles.catPillCircle} />
            <Text
              style={[
                styles.catPillLabel,
                activeCat === 'all' && styles.catPillLabelActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* หมวดอื่น ๆ */}
          {CATS.map(c => {
            const active = activeCat === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setActiveCat(c.key)}
                activeOpacity={0.9}
              >
                <Image
                  source={c.img}
                  style={styles.catIcon}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.catPillLabel,
                    active && styles.catPillLabelActive,
                  ]}
                >
                  {c.titleTh}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ============ POPULAR ============ */}
        {popularTop4.length > 0 && (
          <View style={styles.popularSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularRow}
            >
              {popularTop4.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.popularCard}
                  activeOpacity={0.9}
                  onPress={() => openShop(s)}
                >
                  <Image
                    source={SHOP_IMAGES[s.name] ?? SHOP_PLACEHOLDER}
                    style={styles.popularCover}
                    resizeMode="cover"
                  />
                  <View style={styles.popularBody}>
                    <Text style={styles.popularName} numberOfLines={1}>
                      {s.name}
                    </Text>
                    <Text style={styles.popularSub} numberOfLines={1}>
                      {s.description ?? 'Burger · Chicken · Wings'}
                    </Text>
                    <View style={styles.popularMetaRow}>
                      <Text style={styles.metaStar}>
                        ★ {(s.ratingAvg ?? 4.5).toFixed(1)}
                      </Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>Free</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.metaText}>{getETA(s)} min</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ============ OPEN RESTAURANTS ============ */}
        <View style={{ marginTop: 24 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Open Restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {displayedShops.map(s => {
            const url = toAbsolute(s.promoUrl);
            const src = url ? { uri: url } : SHOP_PLACEHOLDER;
            const eta = getETA(s);

            return (
              <TouchableOpacity
                key={s.id}
                style={styles.restaurantCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ShopDetail', { shop: s })}
              >
                <Image
                  source={src}
                  style={styles.restaurantCover}
                  resizeMode="cover"
                />
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {s.name}
                </Text>
                <Text style={styles.restaurantTags} numberOfLines={1}>
                  {s.description ?? 'Burger · Chicken · Rice · Wings'}
                </Text>

                <View style={styles.restaurantMetaRow}>
                  <Text style={styles.metaStar}>
                    ★ {(s.ratingAvg ?? 4.5).toFixed(1)}
                  </Text>
                  <Text style={styles.metaText}>Free</Text>
                  <Text style={styles.metaText}>{eta} min</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 🔶 Promo Popup – แสดงเฉพาะครั้งแรกหลัง login */}
      {showPromo && (
        <View style={styles.promoOverlay}>
          <View style={styles.promoCardWrapper}>
            {/* ตัวรูปโปรโมชั่น */}
            <Image
              source={require('../../assets/images/Offer1.png')}
              style={styles.promoImage}
              resizeMode="contain"
            />

            {/* ปุ่มกากบาทปิด popup */}
            <TouchableOpacity
              style={styles.promoCloseBtn}
              onPress={() => setShowPromo(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.promoCloseText}>×</Text>
            </TouchableOpacity>

            {/* ปุ่ม GOT IT จริง (ซ้อนทับปุ่มในรูป) */}
            <TouchableOpacity
              style={styles.promoGotItBtn}
              onPress={() => setShowPromo(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.promoGotItText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // HEADER
  header: {
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sidebarBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarLine: {
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#111827',
    marginVertical: 2,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  deliverToLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
    letterSpacing: 0.8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dropdownIcon: {
    width: 10,
    height: 10,
    marginLeft: 6,
    tintColor: '#111827',
  },
  bagWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  bagBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: '#F97316',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  greetingText: {
    marginTop: 24,
    fontSize: 22,
    color: '#111827',
  },
  greetingBold: {
    fontWeight: '800',
  },

  // SEARCH
  searchBar: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 56,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    opacity: 0.8,
  },
  searchPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
  },

  // SECTIONS
  sectionHeaderRow: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },

  // CATEGORY PILL
  catPillRow: {
    paddingHorizontal: 8,
    paddingBottom: 16,
    paddingLeft: 24,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  catIcon: { width: 36, height: 36, marginRight: 10 },
  catPillActive: {
    backgroundColor: '#ffd873',
  },
  catPillCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9CA3AF',
    marginRight: 10,
  },
  catPillLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  catPillLabelActive: {
    color: '#111827',
  },

  // POPULAR
  popularSection: {
    marginTop: 8,
  },
  popularRow: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  popularCard: {
    width: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  popularCover: {
    width: '100%',
    height: 120,
  },
  popularBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  popularName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  popularSub: {
    marginTop: 4,
    color: '#9CA3AF',
    fontSize: 13,
  },
  popularMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  // OPEN RESTAURANTS LIST
  restaurantCard: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  restaurantCover: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  restaurantName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  restaurantTags: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  // meta
  metaStar: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
    marginRight: 12,
  },
  metaDot: {
    marginHorizontal: 6,
    color: '#9CA3AF',
  },
  metaText: {
    fontSize: 14,
    color: '#111827',
    marginRight: 12,
  },

  /* ─── Promo Overlay ─── */
  promoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', // ทำพื้นหลังทึบลง
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  promoCardWrapper: {
    width: '80%',
    aspectRatio: 3 / 4, // ปรับตามสัดส่วนรูปจริงได้
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  promoCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE194', // ✅ สีเหลืองพาสเทลตามที่บอก
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3, // ✅ เงาบาง ๆ สำหรับ Android
  },

  promoCloseText: {
    color: '#EF761A', // ✅ สีตัวกากบาทเข้มหน่อย
    fontSize: 26, // ✅ ใหญ่พอดีวงกลม
    lineHeight: 24,
    fontWeight: '400',
    marginTop: -1, // ✅ ปรับให้อยู่กลางเป๊ะ
  },
  promoGotItBtn: {
    position: 'absolute',
    bottom: 50, // เลื่อนให้ทับปุ่มในรูปคร่าว ๆ
    alignSelf: 'center',
    paddingHorizontal: 120,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent', // ให้เห็นปุ่มในรูปด้านล่าง
  },
  promoGotItText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
