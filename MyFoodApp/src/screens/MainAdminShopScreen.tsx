import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import api, { API_BASE } from '../api/client';
import AdminFoodListScreen from './AdminFoodListScreen';
import AdminNewFoodScreen from './AdminNewFoodScreen';

// --- Helper ---
const toAbsolute = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const host = API_BASE.replace('/api', '');
  return `${host}${p.startsWith('/') ? '' : '/'}${p}`;
};

// --- Components ย่อยสำหรับ Dashboard ---
const StatCard = ({ label, value }: any) => (
  <View style={dashboardStyles.statCard}>
    <Text style={dashboardStyles.statValue}>{value}</Text>
    <Text style={dashboardStyles.statLabel}>{label}</Text>
  </View>
);

// ==================================================
// 🏠 HomeScreen (Dashboard จริง)
// ==================================================
const HomeScreen = ({ route, navigation }: any) => {
  // รับ params ที่ส่งต่อมาจาก Tab.Screen (initialParams)
  const { shopId, userId } = route.params || {};

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // ถ้าไม่มี shopId (เช่น เข้ามาแบบไม่ได้ผ่านหน้า Profile) ให้ข้ามไปก่อน
    if (!shopId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // เรียก API Dashboard ที่เราเตรียมไว้
      const res = await api.get(`/shops/${shopId}/dashboard`);
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [shopId]),
  );

  if (loading)
    return (
      <View style={styles.screenContainer}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );

  return (
    <View style={styles.screenContainer}>
      {/* --- Header Dashboard --- */}
      <View style={dashboardStyles.header}>
        {/* ปุ่ม Profile (ซ้าย) */}
        <TouchableOpacity
          style={dashboardStyles.iconBtn}
          // กดแล้วกลับไปหน้า User Profile
          onPress={() => navigation.navigate('Profile', { userId })}
        >
          <Image
            source={require('../../assets/images/admin_profile.png')}
            style={dashboardStyles.headerIcon}
          />
        </TouchableOpacity>

        {/* Location (กลาง) */}
        <View style={{ alignItems: 'center' }}>
          <Text style={dashboardStyles.locationLabel}>LOCATION</Text>
          <Text style={dashboardStyles.locationText}>Halal Lab office ▾</Text>
        </View>

        {/* รูปโปรไฟล์ร้าน (ขวา) */}
        <View style={dashboardStyles.shopProfileWrapper}>
          <Image
            source={require('../../assets/images/SHOP_KFC.png')}
            style={dashboardStyles.shopProfileImg}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
      >
        {/* 1. Stats Row (Running Orders / Order Request) */}
        <View style={dashboardStyles.row}>
          <StatCard label="RUNNING ORDERS" value={data?.runningOrders || 0} />
          <StatCard label="ORDER REQUEST" value={data?.orderRequest || 0} />
        </View>

        {/* 2. Total Revenue (Daily) */}
        <View style={[dashboardStyles.card, dashboardStyles.revenueCard]}>
          <View style={dashboardStyles.cardHeaderRow}>
            <View>
              <Text style={dashboardStyles.cardTitle}>Total Revenue</Text>
              <Text style={dashboardStyles.revenueText}>
                ${data?.totalRevenueToday?.toLocaleString() || '0.00'}
              </Text>
            </View>

            <View style={dashboardStyles.badge}>
              <Text style={dashboardStyles.badgeText}>Daily ▾</Text>
            </View>
          </View>

          {/* Mock Graph (เส้นกราฟจำลอง) */}
          <View style={dashboardStyles.graphContainer}>
            <View style={dashboardStyles.graphLine} />
            <View style={dashboardStyles.graphPoint} />
            <Text style={dashboardStyles.graphTag}>$500</Text>
          </View>
          <View style={dashboardStyles.timeLabels}>
            <Text style={dashboardStyles.timeText}>10AM</Text>
            <Text style={dashboardStyles.timeText}>12PM</Text>
            <Text style={dashboardStyles.timeText}>04PM</Text>
          </View>
        </View>

        {/* 3. Reviews */}
        <View style={dashboardStyles.card}>
          <View style={dashboardStyles.cardHeaderRow}>
            <Text style={dashboardStyles.cardTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={dashboardStyles.seeAll}>See All Reviews</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
            }}
          >
            <Text
              style={{ fontSize: 28, fontWeight: 'bold', color: '#F97316' }}
            >
              ★ {data?.ratingAvg?.toFixed(1) || '0.0'}
            </Text>
            <Text style={{ marginLeft: 12, color: '#64748B', fontSize: 16 }}>
              Total {data?.ratingCount || 0} Reviews
            </Text>
          </View>
        </View>

        {/* 4. Popular Items */}
        <View style={{ marginTop: 24, marginBottom: 100 }}>
          <View style={dashboardStyles.sectionHeaderRow}>
            <Text style={dashboardStyles.sectionTitle}>
              Popular Items This Week
            </Text>
            <TouchableOpacity>
              <Text style={dashboardStyles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={dashboardStyles.row}>
            {data?.popularItems?.length > 0 ? (
              data.popularItems.map((item: any) => (
                <View key={item.id} style={dashboardStyles.popularItem}>
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: toAbsolute(item.imageUrl) }
                        : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
                    }
                    style={dashboardStyles.popularImg}
                  />
                  <View style={dashboardStyles.popularOverlay}>
                    <Text style={dashboardStyles.popularName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={dashboardStyles.popularCount}>
                      {item.orderCount} Orders
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              // Placeholder ถ้าไม่มีข้อมูล
              <>
                <View
                  style={[
                    dashboardStyles.popularItem,
                    { backgroundColor: '#CBD5E0' },
                  ]}
                />
                <View
                  style={[
                    dashboardStyles.popularItem,
                    { backgroundColor: '#CBD5E0' },
                  ]}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Dummy Screens อื่นๆ ---
// const NewFoodScreen = ({ navigation, route }: any) => {
//   const { shopId } = route.params || {};
//   // เรียกหน้า AdminFoodDetail โดยตรง (เพื่อให้เป็น Tab)
//   return (
//     <AdminFoodDetailScreen
//       navigation={navigation}
//       route={{ params: { shopId } }}
//     />
//   );
// };

const NotificationScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.text}>🔔 Notifications</Text>
  </View>
);
const ShopProfileScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.text}>👤 Shop Profile</Text>
  </View>
);

// --- Navigator ---
const Tab = createBottomTabNavigator();

const ICONS = {
  home: require('../../assets/images/admin_home.png'),
  food_list: require('../../assets/images/admin_food_list.png'),
  new_food: require('../../assets/images/admin_new_food.png'),
  notification: require('../../assets/images/admin_notification.png'),
  profile: require('../../assets/images/admin_profile.png'),
};

export default function MainAdminShopScreen({ route }: any) {
  // รับ params (userId, shopId) จากหน้าก่อนหน้า
  const params = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar, // ✅ ใช้ Style เดิมที่คุณต้องการ
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={HomeScreen}
        initialParams={params} // ✅ ส่ง params ให้ Dashboard
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICONS.home}
              style={[styles.icon, focused && styles.iconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminFoodList"
        component={AdminFoodListScreen}
        initialParams={params}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICONS.food_list}
              style={[styles.icon, focused && styles.iconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="AdminNewFood"
        component={AdminNewFoodScreen} // 🟢 ใช้หน้าสำหรับเพิ่มโดยเฉพาะ
        initialParams={params} // ส่ง shopId ไปด้วย
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICONS.new_food}
              style={styles.centerIcon}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="AdminNotification"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICONS.notification}
              style={[styles.icon, focused && styles.iconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ShopProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICONS.profile}
              style={[styles.icon, focused && styles.iconActive]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- Styles (Tab Bar เดิม + Dashboard ใหม่) ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
  },
  text: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  // ✅ Style แถบเมนูเดิมของคุณ (ไม่แตะต้อง)
  tabBar: {
    backgroundColor: '#ffffff',
    height: 70,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingBottom: 70, // ตามที่คุณตั้งไว้
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },
  icon: { width: 30, height: 30, tintColor: '#9CA3AF' },
  iconActive: { tintColor: '#FF7622' },
  centerIcon: { width: 55, height: 55, marginTop: 0 },
});

// --- Styles เฉพาะ Dashboard (เพิ่มใหม่ตามดีไซน์) ---
const dashboardStyles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerIcon: { width: 22, height: 22, tintColor: '#333' },
  locationLabel: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  locationText: { fontSize: 14, color: '#333', fontWeight: '600' },
  shopProfileWrapper: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#CBD5E0',
    overflow: 'hidden',
  },
  shopProfileImg: { width: '100%', height: '100%' },

  // Scroll Content
  scrollContent: { padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  // Stat Card (20 Running Orders)
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    marginBottom: 20,
  },
  statValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Revenue Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    marginBottom: 20,
  },
  revenueCard: { paddingBottom: 10 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 5,
  },
  revenueText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 10,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, color: '#475569', fontWeight: '600' },

  // Mock Graph
  graphContainer: {
    height: 100,
    marginTop: 15,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  graphLine: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFEDD5',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    opacity: 0.5,
  },
  graphPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'absolute',
    top: 30,
    left: '35%',
  },
  graphTag: {
    position: 'absolute',
    top: 0,
    left: '28%',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  timeText: { color: '#94A3B8', fontSize: 12 },

  // Reviews & Popular Items
  seeAll: { color: '#F97316', fontSize: 14, fontWeight: '600' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },

  popularItem: {
    width: '48%',
    height: 160,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  popularImg: { width: '100%', height: '100%' },
  popularOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  popularName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  popularCount: { color: '#E2E8F0', fontSize: 12 },
});
