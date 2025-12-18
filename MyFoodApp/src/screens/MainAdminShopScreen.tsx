import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import api, { API_BASE } from '../api/client'; // ตรวจสอบ path ให้ถูกต้องตามโปรเจคจริง
import AdminFoodListScreen from './AdminFoodListScreen';
import AdminNewFoodScreen from './AdminNewFoodScreen';
import AdminNotificationScreen from './AdminNotificationScreen';

// --- Helper ---
const toAbsolute = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const host = API_BASE.replace('/api', '');
  return `${host}${p.startsWith('/') ? '' : '/'}${p}`;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// --- Filter Options ---
const FILTER_TYPES = ['Day', 'Week', 'Month', 'Year', 'All'];

// --- Components ย่อย ---

// 1. ปุ่ม Filter (แคปซูล)
const FilterTabs = ({ activeFilter, onSelect }: any) => {
  return (
    <View style={dashboardStyles.filterContainer}>
      {FILTER_TYPES.map(type => (
        <TouchableOpacity
          key={type}
          style={[
            dashboardStyles.filterBtn,
            activeFilter === type && dashboardStyles.filterBtnActive,
          ]}
          onPress={() => onSelect(type)}
        >
          <Text
            style={[
              dashboardStyles.filterText,
              activeFilter === type && dashboardStyles.filterTextActive,
            ]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 2. การ์ดแสดงยอด Order (Stat Card)
const StatCard = ({
  label,
  value,
  color = '#fff',
  textColor = '#1E293B',
}: any) => (
  <View style={[dashboardStyles.statCard, { backgroundColor: color }]}>
    <Text style={[dashboardStyles.statValue, { color: textColor }]}>
      {value?.toLocaleString() || 0}
    </Text>
    <Text style={dashboardStyles.statLabel}>{label}</Text>
  </View>
);

// 3. กราฟแท่ง (Custom Bar Chart) - ปรับปรุงใหม่
const SalesChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <View
        style={[
          dashboardStyles.chartContainer,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: '#94A3B8' }}>No data available</Text>
      </View>
    );
  }

  // 1. หาค่าสูงสุดในข้อมูล
  const rawMax = Math.max(...data.map(d => d.value), 0);

  // 2. Logic "Zoom Out": ปรับเพดานกราฟให้สูงกว่าค่าสูงสุดจริง 20% (* 1.2)
  // หากค่าเป็น 0 ให้ตั้ง default เป็น 100 เพื่อไม่ให้ error
  const yAxisMax = rawMax > 0 ? rawMax * 1.2 : 100;

  return (
    <View style={dashboardStyles.chartContainer}>
      {/* --- Layer 1: Grid Lines (เส้นตาราง) --- */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { justifyContent: 'space-between', paddingBottom: 20 },
        ]}
      >
        {/* สร้างเส้น Grid 5 เส้น (0%, 25%, 50%, 75%, 100%) */}
        {[0, 1, 2, 3, 4].map(i => {
          // คำนวณตัวเลขที่จะโชว์ข้างเส้น (Optional)
          const gridValue = Math.round(yAxisMax - (yAxisMax / 4) * i);
          return (
            <View key={i} style={dashboardStyles.gridLineContainer}>
              <Text style={dashboardStyles.gridLabel}>{gridValue}</Text>
              <View style={dashboardStyles.gridLine} />
            </View>
          );
        })}
      </View>

      {/* --- Layer 2: Bars (แท่งกราฟ) --- */}
      <View style={dashboardStyles.chartRow}>
        {data.map((item, index) => {
          // คำนวณความสูงเทียบกับ yAxisMax (ไม่ใช่ rawMax)
          const heightPercentage = (item.value / yAxisMax) * 100;

          return (
            <View key={index} style={dashboardStyles.barWrapper}>
              {/* Tooltip value (แสดงเฉพาะถ้าค่ามากกว่า 0) */}
              <Text style={dashboardStyles.barValue}>
                {item.value > 0 ? item.value : ''}
              </Text>

              {/* Bar */}
              <View
                style={[
                  dashboardStyles.barLine,
                  {
                    height: `${heightPercentage}%`,
                    backgroundColor:
                      heightPercentage > 0 ? '#FF7622' : '#E2E8F0',
                    // เปลี่ยนสีถ้าเป็นค่าสูงสุด (Optional highlight)
                    opacity: item.value === rawMax ? 1 : 0.8,
                  },
                ]}
              />
              {/* Label (e.g., Mon, Tue) */}
              <Text style={dashboardStyles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ==================================================
// 🏠 HomeScreen (Dashboard)
// ==================================================
const HomeScreen = ({ route, navigation }: any) => {
  const { shopId, userId } = route.params || {};

  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState<any>({});
  const [salesData, setSalesData] = useState<any[]>([]);
  const [menuRanking, setMenuRanking] = useState<any[]>([]);

  // Filter States
  const [salesFilter, setSalesFilter] = useState('Week'); // Default Week
  const [menuFilter, setMenuFilter] = useState('Month'); // Default Month

  // Fetch ข้อมูลรวม (Stats + Review)
  const fetchOverview = async () => {
    try {
      // GET /shops/{id}/dashboard
      const res = await api.get(`/shops/${shopId}/dashboard`);
      setStats(res.data);
    } catch (err) {
      console.error('Overview error:', err);
    }
  };

  // Fetch กราฟยอดขาย (แยกตาม Filter)
  const fetchSalesChart = async (filter: string) => {
    try {
      // Mock Data Logic (ลบส่วนนี้ออกเมื่อต่อ API จริง)
      let mockData = [];
      if (filter === 'Day')
        mockData = [
          { label: '0-4', value: 200 },
          { label: '4-8', value: 500 },
          { label: '8-12', value: 1200 },
          { label: '12-16', value: 800 },
          { label: '16-20', value: 1500 },
          { label: '20-24', value: 300 },
        ];
      else if (filter === 'Week')
        mockData = [
          { label: 'Mon', value: 1200 },
          { label: 'Tue', value: 1500 },
          { label: 'Wed', value: 900 },
          { label: 'Thu', value: 2000 },
          { label: 'Fri', value: 2500 },
          { label: 'Sat', value: 3000 },
          { label: 'Sun', value: 2800 },
        ];
      else if (filter === 'Month')
        mockData = [
          { label: 'W1', value: 5000 },
          { label: 'W2', value: 7000 },
          { label: 'W3', value: 4500 },
          { label: 'W4', value: 8000 },
        ];
      else
        mockData = [
          { label: 'Jan', value: 20000 },
          { label: 'Feb', value: 18000 },
          { label: 'Mar', value: 25000 },
        ];

      setSalesData(mockData);

      // Code สำหรับต่อ API จริง:
      /*
        const res = await api.get(`/shops/${shopId}/sales-chart`, { params: { period: filter } });
        setSalesData(res.data);
        */
    } catch (err) {
      console.error('Sales chart error:', err);
    }
  };

  // Fetch อันดับเมนู (แยกตาม Filter)
  const fetchMenuRanking = async (filter: string) => {
    try {
      // Mock Data: ดึงจาก Dashboard เดิมแล้วมา Sort หรือ Mock เอา
      const res = await api.get(`/shops/${shopId}/dashboard`);
      let items = res.data.popularItems || [];

      // จำลองการสลับข้อมูลเล็กน้อยตาม Filter
      if (filter === 'Day') items = items.slice(0, 2);
      else items = items.sort((a: any, b: any) => b.price - a.price);

      setMenuRanking(items);
    } catch (err) {
      console.error('Menu ranking error:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchSalesChart(salesFilter),
      fetchMenuRanking(menuFilter),
    ]);
    setLoading(false);
  };

  // Initial Load
  useFocusEffect(
    useCallback(() => {
      if (shopId) loadAllData();
    }, [shopId]),
  );

  // Load เมื่อเปลี่ยน Filter Sales
  useEffect(() => {
    fetchSalesChart(salesFilter);
  }, [salesFilter]);

  // Load เมื่อเปลี่ยน Filter Menu
  useEffect(() => {
    fetchMenuRanking(menuFilter);
  }, [menuFilter]);

  if (loading && !stats.shopId)
    return (
      <View style={styles.screenContainer}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile', { userId })}
          style={dashboardStyles.iconBtn}
        >
          <Image
            source={require('../../assets/images/admin_profile.png')}
            style={dashboardStyles.headerIcon}
          />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={dashboardStyles.locationLabel}>DASHBOARD</Text>
          <Text style={dashboardStyles.locationText}>Shop Overview</Text>
        </View>
        <View style={dashboardStyles.shopProfileWrapper}>
          <Image
            source={require('../../assets/images/SHOP_KFC.png')}
            style={dashboardStyles.shopProfileImg}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={dashboardStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAllData} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* --- 1. Order Stats Grid --- */}
        <Text style={dashboardStyles.sectionTitle}>Order Statistics</Text>
        <View style={dashboardStyles.statsGrid}>
          {/* แถวบน: In Progress */}
          <View style={{ width: '100%', marginBottom: 10 }}>
            <StatCard
              label="In Progress"
              value={stats.runningOrders}
              color="#FF7622"
              textColor="#FFF"
            />
          </View>

          {/* แถวล่าง */}
          <View style={dashboardStyles.statsRow}>
            <View style={{ width: '48%' }}>
              <StatCard label="Daily" value={stats.dailyOrders || 12} />
            </View>
            <View style={{ width: '48%' }}>
              <StatCard label="Weekly" value={stats.weeklyOrders || 85} />
            </View>
          </View>
          <View style={dashboardStyles.statsRow}>
            <View style={{ width: '48%' }}>
              <StatCard label="Monthly" value={stats.monthlyOrders || 340} />
            </View>
            <View style={{ width: '48%' }}>
              <StatCard label="All Time" value={stats.allOrders || 1205} />
            </View>
          </View>
        </View>

        {/* --- 2. Sales Chart --- */}
        <View style={[dashboardStyles.card, { marginTop: 20 }]}>
          <View style={dashboardStyles.cardHeaderColumn}>
            <Text style={dashboardStyles.cardTitleBig}>Total Sales</Text>
            <Text style={dashboardStyles.cardSubTitle}>
              Sales Performance over time
            </Text>
          </View>

          {/* Filter Sales */}
          <FilterTabs activeFilter={salesFilter} onSelect={setSalesFilter} />

          {/* Graph Container */}
          <View style={{ marginTop: 20, height: 220 }}>
            <SalesChart data={salesData} />
          </View>
        </View>

        {/* --- 3. Review Score --- */}
        <View
          style={[
            dashboardStyles.card,
            { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={dashboardStyles.cardTitleBig}>Shop Rating</Text>
            <Text style={dashboardStyles.cardSubTitle}>
              Customer satisfaction
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{ fontSize: 32, fontWeight: 'bold', color: '#F97316' }}
              >
                {stats?.ratingAvg?.toFixed(1) || '4.8'}
              </Text>
              <Text style={{ fontSize: 24, color: '#FFC107', marginLeft: 5 }}>
                ★
              </Text>
            </View>
            <Text style={{ color: '#64748B', fontSize: 12 }}>
              Based on {stats?.ratingCount || 120} reviews
            </Text>
          </View>
        </View>

        {/* --- 4. Menu Ranking --- */}
        <View style={{ marginTop: 30, marginBottom: 50 }}>
          <View style={dashboardStyles.sectionHeaderRow}>
            <Text style={dashboardStyles.sectionTitle}>Top Menu Sales</Text>
          </View>

          {/* Filter Menu */}
          <FilterTabs activeFilter={menuFilter} onSelect={setMenuFilter} />

          {/* List */}
          <View style={{ marginTop: 15 }}>
            {menuRanking.length > 0 ? (
              menuRanking.map((item: any, index: number) => (
                <View key={item.id || index} style={dashboardStyles.rankItem}>
                  {/* อันดับ */}
                  <View style={dashboardStyles.rankBadge}>
                    <Text style={dashboardStyles.rankNumber}>{index + 1}</Text>
                  </View>

                  {/* รูปเมนู */}
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: toAbsolute(item.imageUrl) }
                        : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
                    }
                    style={dashboardStyles.rankImg}
                  />

                  {/* รายละเอียด */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={dashboardStyles.rankName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={dashboardStyles.rankPrice}>฿{item.price}</Text>
                  </View>

                  {/* ยอดขาย */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={dashboardStyles.rankSalesVal}>
                      {item.orderCount || Math.floor(Math.random() * 100)}{' '}
                    </Text>
                    <Text style={dashboardStyles.rankSalesLabel}>Orders</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text
                style={{ textAlign: 'center', color: '#94A3B8', marginTop: 20 }}
              >
                No menu data found
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Notification & Profile (Dummy) ---
const ShopProfileScreen = () => (
  <View style={styles.screenContainer}>
    <Text>Shop Profile</Text>
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
  const params = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={HomeScreen}
        initialParams={params}
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
        component={AdminNewFoodScreen}
        initialParams={params}
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
        component={AdminNotificationScreen} // ✅ เปลี่ยนจาก NotificationScreen เป็น AdminNotificationScreen
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

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: '#F8F9FB' },
  tabBar: {
    backgroundColor: '#ffffff',
    height: 70,
    borderTopWidth: 0,
    elevation: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  icon: { width: 28, height: 28, tintColor: '#9CA3AF' },
  iconActive: { tintColor: '#FF7622' },
  centerIcon: { width: 50, height: 50 },
});

// --- Dashboard Styles ---
const dashboardStyles = StyleSheet.create({
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  headerIcon: { width: 20, height: 20, tintColor: '#333' },
  locationLabel: {
    fontSize: 10,
    color: '#F97316',
    fontWeight: '800',
    letterSpacing: 1,
  },
  locationText: { fontSize: 16, color: '#333', fontWeight: '700' },
  shopProfileWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBD5E0',
    overflow: 'hidden',
  },
  shopProfileImg: { width: '100%', height: '100%' },

  scrollContent: { padding: 20 },

  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Stats Grid
  statsGrid: { marginBottom: 15 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  // Generic Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  cardHeaderColumn: { marginBottom: 15 },
  cardTitleBig: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  cardSubTitle: { fontSize: 12, color: '#94A3B8' },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'space-between',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterBtnActive: { backgroundColor: '#fff', elevation: 1 },
  filterText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterTextActive: { color: '#1E293B', fontWeight: 'bold' },

  // --- Chart Styles (Updated) ---
  chartContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative', // จำเป็นสำหรับ Grid
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 20,
    zIndex: 10, // ให้แท่งกราฟอยู่เหนือเส้น Grid
  },
  // Grid Lines Styles
  gridLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 1,
    overflow: 'visible',
    width: '100%',
  },
  gridLabel: {
    fontSize: 9,
    color: '#CBD5E1',
    width: 25,
    textAlign: 'right',
    marginRight: 5,
    transform: [{ translateY: -6 }],
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9', // สีของเส้นตาราง
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderStyle: 'dashed', // เส้นประ (ถ้า Android ไม่รองรับจะกลายเป็นเส้นทึบอัตโนมัติ)
  },

  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 15, // เว้นที่ซ้ายให้ตัวเลข Grid
  },
  barValue: { fontSize: 10, color: '#64748B', marginBottom: 4 },
  barLine: {
    width: 12,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: { marginTop: 8, fontSize: 10, color: '#94A3B8' },

  // Ranking List
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankNumber: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  rankImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  rankName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  rankPrice: { fontSize: 12, color: '#F97316', marginTop: 2 },
  rankSalesVal: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  rankSalesLabel: { fontSize: 10, color: '#94A3B8' },
});
