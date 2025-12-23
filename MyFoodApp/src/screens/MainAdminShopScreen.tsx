// // src/screens/MainAdminShopScreen.tsx
// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
//   Dimensions,
// } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { useFocusEffect } from '@react-navigation/native';
// import moment from 'moment';
// import api, { API_BASE } from '../api/client';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import 'moment/locale/th';

// // Screens
// import AdminFoodListScreen from './AdminFoodListScreen';
// import AdminNewFoodScreen from './AdminNewFoodScreen';
// import AdminNotificationScreen from './AdminNotificationScreen';
// import AdminSettingScreen from './AdminSettingScreen';

// // --- Types ---

// // ✅ 1. แก้ไข Interface ให้ตรงกับ Backend C# (OrderDetailItemDto)
// interface OrderItem {
//   id: number;
//   menuItemId: number; // ✅ เพิ่ม ID เพื่อใช้ Grouping
//   menuItemName: string; // ✅ แก้จาก itemName เป็น menuItemName
//   quantity: number;
//   price: number; // ✅ แก้จาก unitPrice เป็น price

//   // รองรับค่าที่อาจจะเป็น null จาก Backend
//   imagePath?: string | null;
//   category?: string | null;
// }

// interface Order {
//   id: number;
//   grandTotal: number;
//   status: string;
//   placedAt: string;
//   orderItems: OrderItem[];
// }

// interface RankingItem {
//   id: number;
//   name: string;
//   price: number;
//   orderCount: number;
//   totalSales: number;
//   imageUrl: string | null;
//   category: string;
// }

// // Helper: Image URL
// const getImageUrl = (path: string | null | undefined, shopId: number) => {
//   if (!path) return null;
//   if (path.startsWith('http')) return { uri: path };

//   let cleanPath = path.replace(/\\/g, '/');
//   if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

//   if (
//     !cleanPath.includes('/shop_uploads') &&
//     !cleanPath.includes(shopId.toString())
//   ) {
//     cleanPath = `/shop_uploads/${shopId}${cleanPath}`;
//   } else if (!cleanPath.includes('/shop_uploads')) {
//     cleanPath = `/shop_uploads${cleanPath}`;
//   }

//   const baseUrl = API_BASE.replace('/api', '');
//   return { uri: `${baseUrl}${cleanPath}` };
// };

// const FILTER_TYPES = ['Week', 'Month', 'Year'];

// // --- Components ---
// const FilterTabs = ({ activeFilter, onSelect }: any) => (
//   <View style={dashboardStyles.filterContainer}>
//     {FILTER_TYPES.map(type => (
//       <TouchableOpacity
//         key={type}
//         style={[
//           dashboardStyles.filterBtn,
//           activeFilter === type && dashboardStyles.filterBtnActive,
//         ]}
//         onPress={() => onSelect(type)}
//       >
//         <Text
//           style={[
//             dashboardStyles.filterText,
//             activeFilter === type && dashboardStyles.filterTextActive,
//           ]}
//         >
//           {type}
//         </Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

// const StatCard = ({
//   label,
//   value,
//   color = '#fff',
//   textColor = '#1E293B',
// }: any) => (
//   <View style={[dashboardStyles.statCard, { backgroundColor: color }]}>
//     <Text style={[dashboardStyles.statValue, { color: textColor }]}>
//       {typeof value === 'number' ? value.toLocaleString() : value}
//     </Text>
//     <Text style={dashboardStyles.statLabel}>{label}</Text>
//   </View>
// );

// const SalesChart = ({ data }: { data: any[] }) => {
//   if (!data || data.length === 0) {
//     return (
//       <View
//         style={[
//           dashboardStyles.chartContainer,
//           { justifyContent: 'center', alignItems: 'center' },
//         ]}
//       >
//         <Text style={{ color: '#94A3B8' }}>No data available</Text>
//       </View>
//     );
//   }

//   const rawMax = Math.max(...data.map(d => d.value), 0);
//   const yAxisMax = rawMax > 0 ? rawMax * 1.2 : 1000;

//   return (
//     <View style={dashboardStyles.chartContainer}>
//       {/* Grid Lines */}
//       <View
//         style={[
//           StyleSheet.absoluteFill,
//           { justifyContent: 'space-between', paddingBottom: 20 },
//         ]}
//       >
//         {[0, 1, 2, 3, 4].map(i => {
//           const gridValue = Math.round(yAxisMax - (yAxisMax / 4) * i);
//           return (
//             <View key={i} style={dashboardStyles.gridLineContainer}>
//               <Text style={dashboardStyles.gridLabel}>{gridValue}</Text>
//               <View style={dashboardStyles.gridLine} />
//             </View>
//           );
//         })}
//       </View>

//       {/* Bars */}
//       <View style={dashboardStyles.chartRow}>
//         {data.map((item, index) => {
//           const heightPercentage = (item.value / yAxisMax) * 100;
//           return (
//             <View key={index} style={dashboardStyles.barWrapper}>
//               <Text style={dashboardStyles.barValue}>
//                 {item.value > 0 ? item.value.toFixed(0) : ''}
//               </Text>
//               <View
//                 style={[
//                   dashboardStyles.barLine,
//                   {
//                     height: `${heightPercentage}%`,
//                     backgroundColor:
//                       heightPercentage > 0 ? '#FF7622' : '#E2E8F0',
//                     opacity: item.value === rawMax ? 1 : 0.7,
//                   },
//                 ]}
//               />
//               <Text style={dashboardStyles.barLabel}>{item.label}</Text>
//             </View>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// // ==================================================
// // 🏠 HomeScreen (Dashboard)
// // ==================================================
// const HomeScreen = ({ route, navigation }: any) => {
//   const { shopId } = route.params || {};
//   const [loading, setLoading] = useState(true);
//   const [orders, setOrders] = useState<Order[]>([]);

//   // Chart State
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [chartFilter, setChartFilter] = useState('Week');

//   // Stats State
//   const [stats, setStats] = useState({
//     running: 0,
//     daily: 0,
//     weekly: 0,
//     monthly: 0,
//     allTime: 0,
//   });

//   // Ranking State (Popular Menu)
//   const [menuRanking, setMenuRanking] = useState<RankingItem[]>([]);
//   const [rankingFilter, setRankingFilter] = useState('Week');

//   // --- 1. Fetch Data ---
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/Orders/shop/${shopId}`);
//       const rawOrders: Order[] = res.data;

//       console.log('Orders Fetched:', rawOrders.length); // Debug

//       setOrders(rawOrders);
//       calculateStats(rawOrders);
//       processChartData(rawOrders, chartFilter);
//       processMenuRanking(rawOrders, rankingFilter);
//     } catch (err) {
//       console.error('Dashboard Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       if (shopId) fetchAllData();
//     }, [shopId]),
//   );

//   // Re-calculate when filters change
//   useEffect(() => {
//     if (orders.length > 0) {
//       processChartData(orders, chartFilter);
//     }
//   }, [chartFilter, orders]);

//   useEffect(() => {
//     if (orders.length > 0) {
//       processMenuRanking(orders, rankingFilter);
//     }
//   }, [rankingFilter, orders]);

//   // --- 2. Logic Calculation ---
//   const calculateStats = (data: Order[]) => {
//     const today = moment().format('YYYY-MM-DD');
//     const startOfWeek = moment().startOf('isoWeek');
//     const startOfMonth = moment().startOf('month');

//     let running = 0;
//     let dailyVal = 0;
//     let weeklyVal = 0;
//     let monthlyVal = 0;
//     let allTimeVal = 0;

//     data.forEach(o => {
//       const orderDate = moment(o.placedAt);
//       const isCompleted = o.status.toLowerCase() === 'completed';

//       if (['pending', 'cooking'].includes(o.status.toLowerCase())) {
//         running++;
//       }

//       if (isCompleted) {
//         allTimeVal += o.grandTotal;
//         if (orderDate.isSame(today, 'day')) dailyVal += o.grandTotal;
//         if (orderDate.isSameOrAfter(startOfWeek)) weeklyVal += o.grandTotal;
//         if (orderDate.isSameOrAfter(startOfMonth)) monthlyVal += o.grandTotal;
//       }
//     });

//     setStats({
//       running,
//       daily: dailyVal,
//       weekly: weeklyVal,
//       monthly: monthlyVal,
//       allTime: allTimeVal,
//     });
//   };

//   const processChartData = (data: Order[], type: string) => {
//     const validOrders = data.filter(
//       o => o.status && o.status.toLowerCase() === 'completed',
//     );
//     let chart: any[] = [];
//     const REFERENCE_DATE = moment();

//     if (type === 'Week') {
//       const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
//       for (let i = 0; i < 7; i++) {
//         const d = moment(startOfWeek).add(i, 'days');
//         const dayLabel = d.format('ddd');
//         const dateKey = d.format('YYYY-MM-DD');
//         const total = validOrders
//           .filter(o => moment(o.placedAt).format('YYYY-MM-DD') === dateKey)
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: dayLabel, value: total });
//       }
//     } else if (type === 'Month') {
//       const currentMonthKey = REFERENCE_DATE.format('YYYY-MM');
//       const weeks = [
//         { label: 'W1', start: 1, end: 7 },
//         { label: 'W2', start: 8, end: 14 },
//         { label: 'W3', start: 15, end: 21 },
//         { label: 'W4', start: 22, end: 31 },
//       ];
//       const ordersInMonth = validOrders.filter(
//         o => moment(o.placedAt).format('YYYY-MM') === currentMonthKey,
//       );
//       weeks.forEach(w => {
//         const total = ordersInMonth
//           .filter(o => {
//             const day = moment(o.placedAt).date();
//             return day >= w.start && day <= w.end;
//           })
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: w.label, value: total });
//       });
//     } else if (type === 'Year') {
//       const targetYear = REFERENCE_DATE.year();
//       for (let i = 0; i < 12; i++) {
//         const d = moment().month(i);
//         const monthLabel = d.format('MMM');
//         const total = validOrders
//           .filter(
//             o =>
//               moment(o.placedAt).month() === i &&
//               moment(o.placedAt).year() === targetYear,
//           )
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: monthLabel, value: total });
//       }
//     }
//     setChartData(chart);
//   };

//   // ✅ 3. ฟังก์ชันคำนวณ Ranking (แก้ไขแล้ว)
//   const processMenuRanking = (data: Order[], type: string) => {
//     let validOrders = data.filter(
//       o => o.status && o.status.toLowerCase() === 'completed',
//     );

//     const REFERENCE_DATE = moment();

//     if (type === 'Week') {
//       const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).isSameOrAfter(startOfWeek),
//       );
//     } else if (type === 'Month') {
//       const startOfMonth = moment(REFERENCE_DATE).startOf('month');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).isSameOrAfter(startOfMonth),
//       );
//     } else if (type === 'Year') {
//       const startOfYear = moment(REFERENCE_DATE).startOf('year');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).isSameOrAfter(startOfYear),
//       );
//     }

//     const menuMap = new Map<number, RankingItem>();

//     validOrders.forEach(order => {
//       if (order.orderItems && order.orderItems.length > 0) {
//         order.orderItems.forEach(item => {
//           // ✅ ดึง MenuItemId
//           const mId = item.menuItemId;

//           // ป้องกันกรณี id เป็น 0 หรือ null
//           if (!mId) return;

//           if (menuMap.has(mId)) {
//             const existing = menuMap.get(mId)!;
//             existing.orderCount += item.quantity;
//             // ✅ ใช้ item.price
//             existing.totalSales += item.quantity * item.price;
//           } else {
//             menuMap.set(mId, {
//               id: mId,
//               // ✅ ใช้ item.menuItemName และ item.price
//               name: item.menuItemName || 'Unknown Menu',
//               price: item.price || 0,
//               orderCount: item.quantity,
//               totalSales: item.quantity * item.price,

//               // ✅ ดึงรูปและหมวดหมู่ (ถ้าไม่มีใช้ Default)
//               imageUrl: item.imagePath || null,
//               category: item.category || 'Food',
//             });
//           }
//         });
//       }
//     });

//     const sortedRanking = Array.from(menuMap.values())
//       .sort((a, b) => b.orderCount - a.orderCount)
//       .slice(0, 5);

//     setMenuRanking(sortedRanking);
//   };

//   return (
//     <View style={styles.screenContainer}>
//       <View style={dashboardStyles.header}>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TouchableOpacity
//             style={dashboardStyles.profileButton}
//             onPress={() => navigation.navigate('Profile')}
//           >
//             <Ionicons name="person-circle-outline" size={40} color="#1E293B" />
//           </TouchableOpacity>

//           <View style={{ marginLeft: 10 }}>
//             <Text style={dashboardStyles.locationLabel}>DASHBOARD</Text>
//             <Text style={dashboardStyles.locationText}>Shop Overview</Text>
//           </View>
//         </View>

//         <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
//           <View style={dashboardStyles.shopProfileWrapper}>
//             <Image
//               source={require('../../assets/images/SHOP_KFC.png')}
//               style={dashboardStyles.shopProfileImg}
//             />
//           </View>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         contentContainerStyle={dashboardStyles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={loading} onRefresh={fetchAllData} />
//         }
//       >
//         <Text style={dashboardStyles.sectionTitle}>Order Statistics</Text>
//         <View style={dashboardStyles.statsGrid}>
//           <View style={{ width: '100%', marginBottom: 10 }}>
//             <StatCard
//               label="In Progress"
//               value={stats.running}
//               color="#FF7622"
//               textColor="#FFF"
//             />
//           </View>
//           <View style={dashboardStyles.statsRow}>
//             <View style={{ width: '48%' }}>
//               <StatCard
//                 label="Today"
//                 value={`฿${stats.daily.toLocaleString()}`}
//               />
//             </View>
//             <View style={{ width: '48%' }}>
//               <StatCard
//                 label="Week"
//                 value={`฿${stats.weekly.toLocaleString()}`}
//               />
//             </View>
//           </View>
//         </View>

//         <View style={[dashboardStyles.card, { marginTop: 10 }]}>
//           <View style={dashboardStyles.cardHeaderColumn}>
//             <Text style={dashboardStyles.cardTitleBig}>Sales Performance</Text>
//           </View>
//           <FilterTabs activeFilter={chartFilter} onSelect={setChartFilter} />
//           <View style={{ marginTop: 20, height: 220 }}>
//             <SalesChart data={chartData} />
//           </View>
//         </View>

//         <View style={{ marginTop: 30, marginBottom: 50 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 12,
//             }}
//           >
//             <Text style={[dashboardStyles.sectionTitle, { marginBottom: 0 }]}>
//               Popular Menu
//             </Text>
//           </View>

//           <View style={dashboardStyles.menuFilterContainer}>
//             {FILTER_TYPES.map(type => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   dashboardStyles.menuFilterBadge,
//                   rankingFilter === type &&
//                     dashboardStyles.menuFilterBadgeActive,
//                 ]}
//                 onPress={() => setRankingFilter(type)}
//               >
//                 <Text
//                   style={[
//                     dashboardStyles.menuFilterText,
//                     rankingFilter === type &&
//                       dashboardStyles.menuFilterTextActive,
//                   ]}
//                 >
//                   {type}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={{ marginTop: 10 }}>
//             {menuRanking.length === 0 ? (
//               <View style={{ padding: 20, alignItems: 'center' }}>
//                 <Text style={{ color: '#94A3B8' }}>
//                   No sales data for this period
//                 </Text>
//               </View>
//             ) : (
//               menuRanking.map((item, index) => (
//                 <View key={index} style={dashboardStyles.rankItem}>
//                   <View style={dashboardStyles.rankBadge}>
//                     <Text style={dashboardStyles.rankNumber}>{index + 1}</Text>
//                   </View>

//                   <Image
//                     source={
//                       item.imageUrl
//                         ? getImageUrl(item.imageUrl, shopId)
//                         : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
//                     }
//                     style={dashboardStyles.rankImg}
//                     resizeMode="cover"
//                   />

//                   <View style={{ flex: 1, marginLeft: 12 }}>
//                     <Text style={dashboardStyles.rankName} numberOfLines={1}>
//                       {item.name}
//                     </Text>
//                     <Text style={dashboardStyles.rankCategory}>
//                       {item.category}
//                     </Text>
//                     <Text style={dashboardStyles.rankPrice}>฿{item.price}</Text>
//                   </View>
//                   <View style={{ alignItems: 'flex-end' }}>
//                     <Text style={dashboardStyles.rankSalesVal}>
//                       {item.orderCount}
//                     </Text>
//                     <Text style={dashboardStyles.rankSalesLabel}>Sold</Text>
//                   </View>
//                 </View>
//               ))
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// // --- Notification & Profile Screens --- (เหมือนเดิม)
// const ShopProfileScreen = () => (
//   <View style={styles.screenContainer}>
//     <Text style={{ padding: 20 }}>Shop Settings & Profile</Text>
//   </View>
// );

// // --- Navigator --- (เหมือนเดิม)
// const Tab = createBottomTabNavigator();
// const ICONS = {
//   home: require('../../assets/images/admin_home.png'),
//   food_list: require('../../assets/images/admin_food_list.png'),
//   new_food: require('../../assets/images/admin_new_food.png'),
//   notification: require('../../assets/images/admin_notification.png'),
//   profile: require('../../assets/images/admin_profile.png'),
// };

// export default function MainAdminShopScreen({ route }: any) {
//   const params = route.params || {};

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: styles.tabBar,
//       }}
//     >
//       <Tab.Screen
//         name="AdminHome"
//         component={HomeScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.home}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminFoodList"
//         component={AdminFoodListScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.food_list}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminNewFood"
//         component={AdminNewFoodScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.new_food}
//               style={styles.centerIcon}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminNotification"
//         component={AdminNotificationScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.notification}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminProfile"
//         component={AdminSettingScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.profile}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// // --- Styles --- (ใช้ Styles เดิม)
// const styles = StyleSheet.create({
//   screenContainer: { flex: 1, backgroundColor: '#F8F9FB' },
//   tabBar: {
//     backgroundColor: '#ffffff',
//     height: 70,
//     borderTopWidth: 0,
//     elevation: 10,
//     paddingBottom: 20,
//     paddingTop: 10,
//   },
//   icon: { width: 28, height: 28, tintColor: '#9CA3AF' },
//   iconActive: { tintColor: '#FF7622' },
//   centerIcon: { width: 50, height: 50 },
// });

// const dashboardStyles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 50,
//     paddingBottom: 15,
//     backgroundColor: '#fff',
//   },
//   profileButton: {
//     marginRight: 5,
//     padding: 2,
//   },
//   locationLabel: {
//     fontSize: 10,
//     color: '#F97316',
//     fontWeight: '800',
//     letterSpacing: 1,
//   },
//   locationText: { fontSize: 16, color: '#333', fontWeight: '700' },
//   shopProfileWrapper: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#CBD5E0',
//     overflow: 'hidden',
//   },
//   shopProfileImg: { width: '100%', height: '100%' },
//   scrollContent: { padding: 20 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1E293B',
//     marginBottom: 12,
//   },
//   statsGrid: { marginBottom: 15 },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   statCard: {
//     padding: 15,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     elevation: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 90,
//   },
//   statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
//   statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     elevation: 3,
//   },
//   cardHeaderColumn: { marginBottom: 15 },
//   cardTitleBig: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },

//   // Graph Filters
//   filterContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F1F5F9',
//     borderRadius: 12,
//     padding: 4,
//     justifyContent: 'space-between',
//   },
//   filterBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 10,
//   },
//   filterBtnActive: { backgroundColor: '#fff', elevation: 1 },
//   filterText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
//   filterTextActive: { color: '#1E293B', fontWeight: 'bold' },

//   // Menu Filters
//   menuFilterContainer: {
//     flexDirection: 'row',
//     marginBottom: 15,
//   },
//   menuFilterBadge: {
//     marginRight: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     backgroundColor: '#FFF',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   menuFilterBadgeActive: {
//     backgroundColor: '#FF7622',
//     borderColor: '#FF7622',
//   },
//   menuFilterText: {
//     fontSize: 12,
//     color: '#64748B',
//     fontWeight: '600',
//   },
//   menuFilterTextActive: {
//     color: '#FFF',
//   },

//   // Charts
//   chartContainer: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     position: 'relative',
//   },
//   chartRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     height: '100%',
//     paddingBottom: 20,
//     zIndex: 10,
//   },
//   gridLineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 1,
//     overflow: 'visible',
//     width: '100%',
//   },
//   gridLabel: {
//     fontSize: 9,
//     color: '#CBD5E1',
//     width: 25,
//     textAlign: 'right',
//     marginRight: 5,
//     transform: [{ translateY: -6 }],
//   },
//   gridLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#F1F5F9',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//     borderStyle: 'dashed',
//   },
//   barWrapper: { alignItems: 'center', flex: 1, marginLeft: 15 },
//   barValue: { fontSize: 10, color: '#64748B', marginBottom: 4 },
//   barLine: { width: 12, borderRadius: 6, minHeight: 4 },
//   barLabel: { marginTop: 8, fontSize: 10, color: '#94A3B8' },

//   // List Items
//   rankItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   rankBadge: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#1E293B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   rankNumber: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
//   rankImg: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     backgroundColor: '#F1F5F9',
//   },
//   rankName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
//   rankCategory: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
//   rankPrice: { fontSize: 12, color: '#F97316', marginTop: 2 },
//   rankSalesVal: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
//   rankSalesLabel: { fontSize: 10, color: '#94A3B8' },
// });
// src/screens/MainAdminShopScreen.tsx
// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { useFocusEffect } from '@react-navigation/native';
// import moment from 'moment';
// import api, { API_BASE } from '../api/client';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import 'moment/locale/th';

// // Screens Imports
// import AdminFoodListScreen from './AdminFoodListScreen';
// import AdminNewFoodScreen from './AdminNewFoodScreen';
// import AdminNotificationScreen from './AdminNotificationScreen';
// import AdminSettingScreen from './AdminSettingScreen';

// // ==================================================
// // 🟢 TYPES & INTERFACES
// // ==================================================

// interface OrderItem {
//   id: number;
//   menuItemId: number; // ใช้สำหรับ Grouping
//   menuItemName: string; // ชื่อเมนู
//   quantity: number;
//   price: number; // ราคาต่อหน่วย

//   // รองรับค่าที่อาจจะเป็น null จาก Backend
//   imagePath?: string | null;
//   category?: string | null;
// }

// interface Order {
//   id: number;
//   grandTotal: number;
//   status: string;
//   placedAt: string;
//   orderItems: OrderItem[];
// }

// interface RankingItem {
//   id: number;
//   name: string;
//   price: number;
//   orderCount: number;
//   totalSales: number;
//   imageUrl: string | null;
//   category: string;
// }

// // ==================================================
// // 🛠 HELPERS
// // ==================================================

// // ฟังก์ชันจัดการ URL รูปภาพ (เพิ่ม Log แล้ว)
// const getImageUrl = (path: string | null | undefined) => {
//   if (!path) {
//     // console.log('❌ getImageUrl: Path is null or undefined');
//     return null;
//   }

//   // 1. ถ้าเป็น Full URL อยู่แล้ว
//   if (path.startsWith('http')) {
//     // console.log(`✅ getImageUrl (Full): ${path}`);
//     return { uri: path };
//   }

//   // 2. เตรียม Base URL
//   const baseUrl = API_BASE.replace('/api', '');

//   // 3. จัดการ Slash
//   let cleanPath = path.replace(/\\/g, '/');
//   if (!cleanPath.startsWith('/')) {
//     cleanPath = '/' + cleanPath;
//   }

//   const finalUrl = `${baseUrl}${cleanPath}`;
//   // console.log(`🔗 getImageUrl (Resolved): Input=${path} -> Output=${finalUrl}`);

//   return { uri: finalUrl };
// };

// const FILTER_TYPES = ['Week', 'Month', 'Year'];

// // ==================================================
// // 🧱 COMPONENTS
// // ==================================================

// const FilterTabs = ({ activeFilter, onSelect }: any) => (
//   <View style={dashboardStyles.filterContainer}>
//     {FILTER_TYPES.map(type => (
//       <TouchableOpacity
//         key={type}
//         style={[
//           dashboardStyles.filterBtn,
//           activeFilter === type && dashboardStyles.filterBtnActive,
//         ]}
//         onPress={() => onSelect(type)}
//       >
//         <Text
//           style={[
//             dashboardStyles.filterText,
//             activeFilter === type && dashboardStyles.filterTextActive,
//           ]}
//         >
//           {type}
//         </Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

// const StatCard = ({
//   label,
//   value,
//   color = '#fff',
//   textColor = '#1E293B',
// }: any) => (
//   <View style={[dashboardStyles.statCard, { backgroundColor: color }]}>
//     <Text style={[dashboardStyles.statValue, { color: textColor }]}>
//       {typeof value === 'number' ? value.toLocaleString() : value}
//     </Text>
//     <Text style={dashboardStyles.statLabel}>{label}</Text>
//   </View>
// );

// const SalesChart = ({ data }: { data: any[] }) => {
//   if (!data || data.length === 0) {
//     return (
//       <View
//         style={[
//           dashboardStyles.chartContainer,
//           { justifyContent: 'center', alignItems: 'center' },
//         ]}
//       >
//         <Text style={{ color: '#94A3B8' }}>No data available</Text>
//       </View>
//     );
//   }

//   const rawMax = Math.max(...data.map(d => d.value), 0);
//   const yAxisMax = rawMax > 0 ? rawMax * 1.2 : 1000;

//   return (
//     <View style={dashboardStyles.chartContainer}>
//       <View
//         style={[
//           StyleSheet.absoluteFill,
//           { justifyContent: 'space-between', paddingBottom: 20 },
//         ]}
//       >
//         {[0, 1, 2, 3, 4].map(i => {
//           const gridValue = Math.round(yAxisMax - (yAxisMax / 4) * i);
//           return (
//             <View key={i} style={dashboardStyles.gridLineContainer}>
//               <Text style={dashboardStyles.gridLabel}>{gridValue}</Text>
//               <View style={dashboardStyles.gridLine} />
//             </View>
//           );
//         })}
//       </View>

//       <View style={dashboardStyles.chartRow}>
//         {data.map((item, index) => {
//           const heightPercentage =
//             yAxisMax > 0 ? (item.value / yAxisMax) * 100 : 0;
//           return (
//             <View key={index} style={dashboardStyles.barWrapper}>
//               <Text style={dashboardStyles.barValue}>
//                 {item.value > 0 ? item.value.toFixed(0) : ''}
//               </Text>
//               <View
//                 style={[
//                   dashboardStyles.barLine,
//                   {
//                     height: `${heightPercentage}%`,
//                     backgroundColor:
//                       heightPercentage > 0 ? '#FF7622' : '#E2E8F0',
//                     opacity: item.value === rawMax ? 1 : 0.7,
//                   },
//                 ]}
//               />
//               <Text style={dashboardStyles.barLabel}>{item.label}</Text>
//             </View>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// // ==================================================
// // 🏠 HomeScreen (Dashboard Logic)
// // ==================================================
// const HomeScreen = ({ route, navigation }: any) => {
//   const { shopId } = route.params || {};
//   const [loading, setLoading] = useState(true);
//   const [orders, setOrders] = useState<Order[]>([]);

//   // Chart State
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [chartFilter, setChartFilter] = useState('Week');

//   // Stats State
//   const [stats, setStats] = useState({
//     running: 0,
//     daily: 0,
//     weekly: 0,
//     monthly: 0,
//     allTime: 0,
//   });

//   // Ranking State (Popular Menu)
//   const [menuRanking, setMenuRanking] = useState<RankingItem[]>([]);
//   const [rankingFilter, setRankingFilter] = useState('Week');

//   // --- 1. Fetch Data ---
//   const fetchAllData = async () => {
//     if (!shopId) return;
//     try {
//       setLoading(true);
//       console.log(`📡 Fetching orders for shop: ${shopId}`);

//       const res = await api.get(`/Orders/shop/${shopId}`);
//       const rawOrders: Order[] = res.data;

//       // 🔍 DEBUG: เช็คข้อมูล Order ตัวแรก
//       if (rawOrders.length > 0) {
//         console.log(
//           '📦 First Order Data Sample:',
//           JSON.stringify(rawOrders[0], null, 2),
//         );
//         if (rawOrders[0].orderItems?.length > 0) {
//           console.log(
//             '🍕 Sample OrderItem:',
//             JSON.stringify(rawOrders[0].orderItems[0], null, 2),
//           );
//         }
//       } else {
//         console.log('⚠️ No orders found.');
//       }

//       setOrders(rawOrders);
//       calculateStats(rawOrders);
//       processChartData(rawOrders, chartFilter);
//       processMenuRanking(rawOrders, rankingFilter);
//     } catch (err) {
//       console.error('❌ Dashboard Fetch Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchAllData();
//     }, [shopId]),
//   );

//   useEffect(() => {
//     if (orders.length > 0) {
//       processChartData(orders, chartFilter);
//     }
//   }, [chartFilter, orders]);

//   useEffect(() => {
//     if (orders.length > 0) {
//       processMenuRanking(orders, rankingFilter);
//     }
//   }, [rankingFilter, orders]);

//   // --- 2. Logic Calculation ---
//   const calculateStats = (data: Order[]) => {
//     const today = moment().format('YYYY-MM-DD');
//     const startOfWeek = moment().startOf('isoWeek');
//     const startOfMonth = moment().startOf('month');

//     let running = 0;
//     let dailyVal = 0;
//     let weeklyVal = 0;
//     let monthlyVal = 0;
//     let allTimeVal = 0;

//     data.forEach(o => {
//       const orderDate = moment(o.placedAt);
//       const status = o.status?.toLowerCase() || '';
//       const isCompleted = status === 'completed';

//       if (['pending', 'cooking', 'ready'].includes(status)) {
//         running++;
//       }

//       if (isCompleted) {
//         allTimeVal += o.grandTotal;
//         if (orderDate.isSame(today, 'day')) dailyVal += o.grandTotal;
//         if (orderDate.isSameOrAfter(startOfWeek)) weeklyVal += o.grandTotal;
//         if (orderDate.isSameOrAfter(startOfMonth)) monthlyVal += o.grandTotal;
//       }
//     });

//     setStats({
//       running,
//       daily: dailyVal,
//       weekly: weeklyVal,
//       monthly: monthlyVal,
//       allTime: allTimeVal,
//     });
//   };

//   const processChartData = (data: Order[], type: string) => {
//     // ... (logic เดิม ไม่มีการเปลี่ยนแปลงส่วนนี้)
//     const validOrders = data.filter(
//       o => o.status?.toLowerCase() === 'completed',
//     );
//     let chart: any[] = [];
//     const REFERENCE_DATE = moment();

//     if (type === 'Week') {
//       const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
//       for (let i = 0; i < 7; i++) {
//         const d = moment(startOfWeek).add(i, 'days');
//         const dayLabel = d.format('ddd');
//         const dateKey = d.format('YYYY-MM-DD');
//         const total = validOrders
//           .filter(o => moment(o.placedAt).format('YYYY-MM-DD') === dateKey)
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: dayLabel, value: total });
//       }
//     } else if (type === 'Month') {
//       const currentMonthKey = REFERENCE_DATE.format('YYYY-MM');
//       const weeks = [
//         { label: 'W1', start: 1, end: 7 },
//         { label: 'W2', start: 8, end: 14 },
//         { label: 'W3', start: 15, end: 21 },
//         { label: 'W4', start: 22, end: 31 },
//       ];
//       const ordersInMonth = validOrders.filter(
//         o => moment(o.placedAt).format('YYYY-MM') === currentMonthKey,
//       );
//       weeks.forEach(w => {
//         const total = ordersInMonth
//           .filter(o => {
//             const day = moment(o.placedAt).date();
//             return day >= w.start && day <= w.end;
//           })
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: w.label, value: total });
//       });
//     } else if (type === 'Year') {
//       const targetYear = REFERENCE_DATE.year();
//       for (let i = 0; i < 12; i++) {
//         const d = moment().month(i);
//         const monthLabel = d.format('MMM');
//         const total = validOrders
//           .filter(
//             o =>
//               moment(o.placedAt).month() === i &&
//               moment(o.placedAt).year() === targetYear,
//           )
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: monthLabel, value: total });
//       }
//     }
//     setChartData(chart);
//   };

//   const processMenuRanking = (data: Order[], type: string) => {
//     let validOrders = data.filter(o => o.status?.toLowerCase() === 'completed');
//     const REFERENCE_DATE = moment();

//     if (type === 'Week') {
//       const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).isSameOrAfter(startOfWeek),
//       );
//     } else if (type === 'Month') {
//       const startOfMonth = moment(REFERENCE_DATE).startOf('month');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).isSameOrAfter(startOfMonth),
//       );
//     } else if (type === 'Year') {
//       const startOfYear = moment(REFERENCE_DATE).startOf('year');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).isSameOrAfter(startOfYear),
//       );
//     }

//     const menuMap = new Map<number, RankingItem>();

//     validOrders.forEach(order => {
//       if (order.orderItems && order.orderItems.length > 0) {
//         order.orderItems.forEach(item => {
//           const mId = item.menuItemId;
//           if (!mId) return;

//           // 🔍 DEBUG: เช็คว่า Item แต่ละตัวมี imagePath ไหม
//           // if (!item.imagePath) {
//           //    console.warn(`⚠️ Item ID ${item.menuItemId} (${item.menuItemName}) has NO imagePath`);
//           // }

//           const qty = item.quantity || 0;
//           const price = item.price || 0;

//           if (menuMap.has(mId)) {
//             const existing = menuMap.get(mId)!;
//             existing.orderCount += qty;
//             existing.totalSales += qty * price;
//           } else {
//             menuMap.set(mId, {
//               id: mId,
//               name: item.menuItemName || 'Unknown Menu',
//               price: price,
//               orderCount: qty,
//               totalSales: qty * price,
//               imageUrl: item.imagePath || null, // เช็คตรงนี้
//               category: item.category || 'Food',
//             });
//           }
//         });
//       }
//     });

//     const sortedRanking = Array.from(menuMap.values())
//       .sort((a, b) => b.orderCount - a.orderCount)
//       .slice(0, 5);

//     // 🔍 DEBUG: ดูผลลัพธ์การจัดอันดับและ URL รูป
//     console.log(
//       '🏆 Top 5 Ranking:',
//       JSON.stringify(
//         sortedRanking.map(i => ({ name: i.name, img: i.imageUrl })),
//         null,
//         2,
//       ),
//     );

//     setMenuRanking(sortedRanking);
//   };

//   return (
//     <View style={styles.screenContainer}>
//       <View style={dashboardStyles.header}>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TouchableOpacity
//             style={dashboardStyles.profileButton}
//             onPress={() => navigation.navigate('AdminProfile')}
//           >
//             <Ionicons name="person-circle-outline" size={40} color="#1E293B" />
//           </TouchableOpacity>

//           <View style={{ marginLeft: 10 }}>
//             <Text style={dashboardStyles.locationLabel}>DASHBOARD</Text>
//             <Text style={dashboardStyles.locationText}>Shop Overview</Text>
//           </View>
//         </View>

//         <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
//           <View style={dashboardStyles.shopProfileWrapper}>
//             <Image
//               source={require('../../assets/images/SHOP_KFC.png')}
//               style={dashboardStyles.shopProfileImg}
//             />
//           </View>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         contentContainerStyle={dashboardStyles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={loading} onRefresh={fetchAllData} />
//         }
//       >
//         <Text style={dashboardStyles.sectionTitle}>Order Statistics</Text>
//         <View style={dashboardStyles.statsGrid}>
//           <View style={{ width: '100%', marginBottom: 10 }}>
//             <StatCard
//               label="Orders In Progress"
//               value={stats.running}
//               color="#FF7622"
//               textColor="#FFF"
//             />
//           </View>
//           <View style={dashboardStyles.statsRow}>
//             <View style={{ width: '48%' }}>
//               <StatCard
//                 label="Today Sales"
//                 value={`฿${stats.daily.toLocaleString()}`}
//               />
//             </View>
//             <View style={{ width: '48%' }}>
//               <StatCard
//                 label="This Week Sales"
//                 value={`฿${stats.weekly.toLocaleString()}`}
//               />
//             </View>
//           </View>
//         </View>

//         <View style={[dashboardStyles.card, { marginTop: 10 }]}>
//           <View style={dashboardStyles.cardHeaderColumn}>
//             <Text style={dashboardStyles.cardTitleBig}>Sales Performance</Text>
//           </View>
//           <FilterTabs activeFilter={chartFilter} onSelect={setChartFilter} />
//           <View style={{ marginTop: 20, height: 220 }}>
//             <SalesChart data={chartData} />
//           </View>
//         </View>

//         <View style={{ marginTop: 30, marginBottom: 50 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 12,
//             }}
//           >
//             <Text style={[dashboardStyles.sectionTitle, { marginBottom: 0 }]}>
//               Popular Menu
//             </Text>
//           </View>

//           <View style={dashboardStyles.menuFilterContainer}>
//             {FILTER_TYPES.map(type => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   dashboardStyles.menuFilterBadge,
//                   rankingFilter === type &&
//                     dashboardStyles.menuFilterBadgeActive,
//                 ]}
//                 onPress={() => setRankingFilter(type)}
//               >
//                 <Text
//                   style={[
//                     dashboardStyles.menuFilterText,
//                     rankingFilter === type &&
//                       dashboardStyles.menuFilterTextActive,
//                   ]}
//                 >
//                   {type}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={{ marginTop: 10 }}>
//             {menuRanking.length === 0 ? (
//               <View style={{ padding: 20, alignItems: 'center' }}>
//                 <Text style={{ color: '#94A3B8' }}>
//                   No sales data for this period
//                 </Text>
//               </View>
//             ) : (
//               menuRanking.map((item, index) => {
//                 // 🔍 DEBUG: เช็ค URL สุดท้ายก่อน Render
//                 const imgSource = item.imageUrl
//                   ? getImageUrl(item.imageUrl)
//                   : require('../../assets/images/CATAGORY_ICON_BURGERS.png');
//                 // console.log(`🖼️ Rendering ${item.name} with source:`, imgSource);

//                 return (
//                   <View key={index} style={dashboardStyles.rankItem}>
//                     <View style={dashboardStyles.rankBadge}>
//                       <Text style={dashboardStyles.rankNumber}>
//                         {index + 1}
//                       </Text>
//                     </View>

//                     <Image
//                       source={imgSource}
//                       style={dashboardStyles.rankImg}
//                       resizeMode="cover"
//                       // เพิ่ม onError เพื่อดูว่าโหลดรูปไม่ได้เพราะอะไร
//                       onError={e =>
//                         console.log(
//                           `❌ Load Error for ${item.name}:`,
//                           e.nativeEvent.error,
//                         )
//                       }
//                     />

//                     <View style={{ flex: 1, marginLeft: 12 }}>
//                       <Text style={dashboardStyles.rankName} numberOfLines={1}>
//                         {item.name}
//                       </Text>
//                       <Text style={dashboardStyles.rankCategory}>
//                         {item.category}
//                       </Text>
//                       <Text style={dashboardStyles.rankPrice}>
//                         ฿{item.price}
//                       </Text>
//                     </View>
//                     <View style={{ alignItems: 'flex-end' }}>
//                       <Text style={dashboardStyles.rankSalesVal}>
//                         {item.orderCount}
//                       </Text>
//                       <Text style={dashboardStyles.rankSalesLabel}>Sold</Text>
//                     </View>
//                   </View>
//                 );
//               })
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// // ==================================================
// // 🧭 NAVIGATOR CONFIG
// // ==================================================

// const Tab = createBottomTabNavigator();
// const ICONS = {
//   home: require('../../assets/images/admin_home.png'),
//   food_list: require('../../assets/images/admin_food_list.png'),
//   new_food: require('../../assets/images/admin_new_food.png'),
//   notification: require('../../assets/images/admin_notification.png'),
//   profile: require('../../assets/images/admin_profile.png'),
// };

// export default function MainAdminShopScreen({ route }: any) {
//   const params = route.params || {};

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: styles.tabBar,
//       }}
//     >
//       <Tab.Screen
//         name="AdminHome"
//         component={HomeScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.home}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminFoodList"
//         component={AdminFoodListScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.food_list}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminNewFood"
//         component={AdminNewFoodScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.new_food}
//               style={styles.centerIcon}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminNotification"
//         component={AdminNotificationScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.notification}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminProfile"
//         component={AdminSettingScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.profile}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// // ==================================================
// // 🎨 STYLES
// // ==================================================

// const styles = StyleSheet.create({
//   screenContainer: { flex: 1, backgroundColor: '#F8F9FB' },
//   tabBar: {
//     backgroundColor: '#ffffff',
//     height: 70,
//     borderTopWidth: 0,
//     elevation: 10,
//     paddingBottom: 20,
//     paddingTop: 10,
//   },
//   icon: { width: 28, height: 28, tintColor: '#9CA3AF' },
//   iconActive: { tintColor: '#FF7622' },
//   centerIcon: { width: 50, height: 50 },
// });

// const dashboardStyles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 50,
//     paddingBottom: 15,
//     backgroundColor: '#fff',
//   },
//   profileButton: {
//     marginRight: 5,
//     padding: 2,
//   },
//   locationLabel: {
//     fontSize: 10,
//     color: '#F97316',
//     fontWeight: '800',
//     letterSpacing: 1,
//   },
//   locationText: { fontSize: 16, color: '#333', fontWeight: '700' },
//   shopProfileWrapper: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#CBD5E0',
//     overflow: 'hidden',
//   },
//   shopProfileImg: { width: '100%', height: '100%' },
//   scrollContent: { padding: 20 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1E293B',
//     marginBottom: 12,
//   },
//   statsGrid: { marginBottom: 15 },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   statCard: {
//     padding: 15,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     elevation: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 90,
//   },
//   statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
//   statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     elevation: 3,
//   },
//   cardHeaderColumn: { marginBottom: 15 },
//   cardTitleBig: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },

//   // Graph Filters
//   filterContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F1F5F9',
//     borderRadius: 12,
//     padding: 4,
//     justifyContent: 'space-between',
//   },
//   filterBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 10,
//   },
//   filterBtnActive: { backgroundColor: '#fff', elevation: 1 },
//   filterText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
//   filterTextActive: { color: '#1E293B', fontWeight: 'bold' },

//   // Menu Filters
//   menuFilterContainer: {
//     flexDirection: 'row',
//     marginBottom: 15,
//   },
//   menuFilterBadge: {
//     marginRight: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     backgroundColor: '#FFF',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   menuFilterBadgeActive: {
//     backgroundColor: '#FF7622',
//     borderColor: '#FF7622',
//   },
//   menuFilterText: {
//     fontSize: 12,
//     color: '#64748B',
//     fontWeight: '600',
//   },
//   menuFilterTextActive: {
//     color: '#FFF',
//   },

//   // Charts
//   chartContainer: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     position: 'relative',
//   },
//   chartRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     height: '100%',
//     paddingBottom: 20,
//     zIndex: 10,
//   },
//   gridLineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 1,
//     overflow: 'visible',
//     width: '100%',
//   },
//   gridLabel: {
//     fontSize: 9,
//     color: '#CBD5E1',
//     width: 25,
//     textAlign: 'right',
//     marginRight: 5,
//     transform: [{ translateY: -6 }],
//   },
//   gridLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#F1F5F9',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//     borderStyle: 'dashed',
//   },
//   barWrapper: { alignItems: 'center', flex: 1, marginLeft: 15 },
//   barValue: { fontSize: 10, color: '#64748B', marginBottom: 4 },
//   barLine: { width: 12, borderRadius: 6, minHeight: 4 },
//   barLabel: { marginTop: 8, fontSize: 10, color: '#94A3B8' },

//   // List Items
//   rankItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   rankBadge: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#1E293B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   rankNumber: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
//   rankImg: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     backgroundColor: '#F1F5F9',
//   },
//   rankName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
//   rankCategory: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
//   rankPrice: { fontSize: 12, color: '#F97316', marginTop: 2 },
//   rankSalesVal: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
//   rankSalesLabel: { fontSize: 10, color: '#94A3B8' },
// });
// src/screens/MainAdminShopScreen.tsx
// src/screens/MainAdminShopScreen.tsx
// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { useFocusEffect } from '@react-navigation/native';
// import moment from 'moment';
// import api, { API_BASE } from '../api/client';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import 'moment/locale/th';

// // Screens Imports
// import AdminFoodListScreen from './AdminFoodListScreen';
// import AdminNewFoodScreen from './AdminNewFoodScreen';
// import AdminNotificationScreen from './AdminNotificationScreen';
// import AdminSettingScreen from './AdminSettingScreen';

// // ==================================================
// // 🟢 TYPES & INTERFACES
// // ==================================================

// // ✅ เพิ่ม Type สำหรับรับข้อมูลจาก API MenuItems (เพื่อเอารูป)
// interface MenuItemDto {
//   id: number;
//   name: string;
//   price: number;
//   imageUrl: string | null;
// }

// interface OrderItem {
//   id: number;
//   menuItemId: number; // ใช้สำหรับ Grouping
//   menuItemName: string; // ชื่อเมนู
//   quantity: number;
//   price: number; // ราคาต่อหน่วย
//   imagePath?: string | null;
//   category?: string | null;
// }

// interface Order {
//   id: number;
//   grandTotal: number;
//   status: string;
//   placedAt: string;
//   orderItems: OrderItem[];
// }

// interface RankingItem {
//   id: number;
//   name: string;
//   price: number;
//   orderCount: number;
//   totalSales: number;
//   imageUrl: string | null;
//   category: string;
// }

// // ==================================================
// // 🛠 HELPERS
// // ==================================================

// const getImageUrl = (path: string | null | undefined) => {
//   if (!path) return null;

//   if (path.startsWith('http')) {
//     return { uri: path };
//   }

//   const baseUrl = API_BASE.replace('/api', '');
//   let cleanPath = path.replace(/\\/g, '/');
//   if (!cleanPath.startsWith('/')) {
//     cleanPath = '/' + cleanPath;
//   }

//   const finalUrl = `${baseUrl}${cleanPath}`;
//   return { uri: finalUrl };
// };

// const FILTER_TYPES = ['Week', 'Month', 'Year'];

// // ==================================================
// // 🧱 COMPONENTS
// // ==================================================

// const FilterTabs = ({ activeFilter, onSelect }: any) => (
//   <View style={dashboardStyles.filterContainer}>
//     {FILTER_TYPES.map(type => (
//       <TouchableOpacity
//         key={type}
//         style={[
//           dashboardStyles.filterBtn,
//           activeFilter === type && dashboardStyles.filterBtnActive,
//         ]}
//         onPress={() => onSelect(type)}
//       >
//         <Text
//           style={[
//             dashboardStyles.filterText,
//             activeFilter === type && dashboardStyles.filterTextActive,
//           ]}
//         >
//           {type}
//         </Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

// const StatCard = ({
//   label,
//   value,
//   color = '#fff',
//   textColor = '#1E293B',
// }: any) => (
//   <View style={[dashboardStyles.statCard, { backgroundColor: color }]}>
//     <Text style={[dashboardStyles.statValue, { color: textColor }]}>
//       {typeof value === 'number' ? value.toLocaleString() : value}
//     </Text>
//     <Text style={dashboardStyles.statLabel}>{label}</Text>
//   </View>
// );

// const SalesChart = ({ data }: { data: any[] }) => {
//   if (!data || data.length === 0) {
//     return (
//       <View
//         style={[
//           dashboardStyles.chartContainer,
//           { justifyContent: 'center', alignItems: 'center' },
//         ]}
//       >
//         <Text style={{ color: '#94A3B8' }}>No data available</Text>
//       </View>
//     );
//   }

//   const rawMax = Math.max(...data.map(d => d.value), 0);
//   const yAxisMax = rawMax > 0 ? rawMax * 1.2 : 1000;

//   return (
//     <View style={dashboardStyles.chartContainer}>
//       <View
//         style={[
//           StyleSheet.absoluteFill,
//           { justifyContent: 'space-between', paddingBottom: 20 },
//         ]}
//       >
//         {[0, 1, 2, 3, 4].map(i => {
//           const gridValue = Math.round(yAxisMax - (yAxisMax / 4) * i);
//           return (
//             <View key={i} style={dashboardStyles.gridLineContainer}>
//               <Text style={dashboardStyles.gridLabel}>{gridValue}</Text>
//               <View style={dashboardStyles.gridLine} />
//             </View>
//           );
//         })}
//       </View>

//       <View style={dashboardStyles.chartRow}>
//         {data.map((item, index) => {
//           const heightPercentage =
//             yAxisMax > 0 ? (item.value / yAxisMax) * 100 : 0;
//           return (
//             <View key={index} style={dashboardStyles.barWrapper}>
//               <Text style={dashboardStyles.barValue}>
//                 {item.value > 0 ? item.value.toFixed(0) : ''}
//               </Text>
//               <View
//                 style={[
//                   dashboardStyles.barLine,
//                   {
//                     height: `${heightPercentage}%`,
//                     backgroundColor:
//                       heightPercentage > 0 ? '#FF7622' : '#E2E8F0',
//                     opacity: item.value === rawMax ? 1 : 0.7,
//                   },
//                 ]}
//               />
//               <Text style={dashboardStyles.barLabel}>{item.label}</Text>
//             </View>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// // ==================================================
// // 🏠 HomeScreen (Dashboard Logic)
// // ==================================================
// const HomeScreen = ({ route, navigation }: any) => {
//   const { shopId } = route.params || {};
//   const [loading, setLoading] = useState(true);

//   // Data State
//   const [orders, setOrders] = useState<Order[]>([]);

//   // ✅ เพิ่ม State เก็บ Map ของรูปภาพ (Key=MenuID, Value=ImageUrl)
//   const [menuItemsMap, setMenuItemsMap] = useState<Record<number, string>>({});

//   // Chart State
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [chartFilter, setChartFilter] = useState('Week');

//   // Stats State
//   const [stats, setStats] = useState({
//     running: 0,
//     daily: 0,
//     weekly: 0,
//     monthly: 0,
//     allTime: 0,
//   });

//   // Ranking State (Popular Menu)
//   const [menuRanking, setMenuRanking] = useState<RankingItem[]>([]);
//   const [rankingFilter, setRankingFilter] = useState('Week');

//   // --- 1. Fetch Data (Modified) ---
//   const fetchAllData = async () => {
//     if (!shopId) return;
//     try {
//       setLoading(true);
//       console.log(`📡 Fetching data for shop: ${shopId}`);

//       // ✅ ยิง API 2 เส้นพร้อมกัน (Parallel)
//       // 1. ordersRes: เอามาทำกราฟและยอดขาย
//       // 2. menuRes: เอามาดึง Path รูปภาพ
//       const [ordersRes, menuRes] = await Promise.all([
//         api.get(`/Orders/shop/${shopId}`),
//         api.get(`/shops/${shopId}/menuitems`),
//       ]);

//       const rawOrders: Order[] = ordersRes.data;
//       const rawMenus: MenuItemDto[] = menuRes.data;

//       // ✅ สร้าง Map รูปภาพเตรียมไว้ใช้ { 8: "/uploads/img.png", ... }
//       const imgMap: Record<number, string> = {};
//       rawMenus.forEach(m => {
//         if (m.imageUrl) imgMap[m.id] = m.imageUrl;
//       });
//       setMenuItemsMap(imgMap);

//       setOrders(rawOrders);

//       // คำนวณต่างๆ (ใช้ rawOrders เหมือนเดิม กราฟไม่หายแน่นอน)
//       calculateStats(rawOrders);
//       processChartData(rawOrders, chartFilter);

//       // ส่ง imgMap เข้าไปช่วยแปะรูปตอนจัดอันดับ
//       processMenuRanking(rawOrders, rankingFilter, imgMap);
//     } catch (err) {
//       console.error('❌ Dashboard Fetch Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchAllData();
//     }, [shopId]),
//   );

//   useEffect(() => {
//     if (orders.length > 0) {
//       processChartData(orders, chartFilter);
//     }
//   }, [chartFilter, orders]);

//   useEffect(() => {
//     if (orders.length > 0) {
//       // ✅ ส่ง menuItemsMap เข้าไปทุกครั้งที่มีการเปลี่ยน Filter
//       processMenuRanking(orders, rankingFilter, menuItemsMap);
//     }
//   }, [rankingFilter, orders, menuItemsMap]);

//   // --- 2. Logic Calculation ---
//   const calculateStats = (data: Order[]) => {
//     // ใช้เวลาปัจจุบันของเครื่อง (ซึ่งควรจะเป็นเวลาไทยถ้าเครื่องอยู่ไทย)
//     const today = moment().format('YYYY-MM-DD');
//     const startOfWeek = moment().startOf('isoWeek');
//     const startOfMonth = moment().startOf('month');

//     let running = 0;
//     let dailyVal = 0;
//     let weeklyVal = 0;
//     let monthlyVal = 0;
//     let allTimeVal = 0;

//     data.forEach(o => {
//       // ✅ ปรับเวลา: บังคับให้เป็น UTC+7 (ไทย) เพื่อความแม่นยำ
//       const orderDate = moment(o.placedAt).utcOffset(7);
//       const status = o.status?.toLowerCase() || '';
//       const isCompleted = status === 'completed';

//       if (['pending', 'cooking', 'ready'].includes(status)) {
//         running++;
//       }

//       if (isCompleted) {
//         allTimeVal += o.grandTotal;

//         // เปรียบเทียบวันโดยใช้วันที่ที่ปรับเวลาแล้ว
//         if (orderDate.format('YYYY-MM-DD') === today) dailyVal += o.grandTotal;
//         if (orderDate.isSameOrAfter(startOfWeek)) weeklyVal += o.grandTotal;
//         if (orderDate.isSameOrAfter(startOfMonth)) monthlyVal += o.grandTotal;
//       }
//     });

//     setStats({
//       running,
//       daily: dailyVal,
//       weekly: weeklyVal,
//       monthly: monthlyVal,
//       allTime: allTimeVal,
//     });
//   };

//   const processChartData = (data: Order[], type: string) => {
//     const validOrders = data.filter(
//       o => o.status?.toLowerCase() === 'completed',
//     );
//     let chart: any[] = [];
//     const REFERENCE_DATE = moment();

//     if (type === 'Week') {
//       const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
//       for (let i = 0; i < 7; i++) {
//         const d = moment(startOfWeek).add(i, 'days');
//         const dayLabel = d.format('ddd');
//         const dateKey = d.format('YYYY-MM-DD');

//         // ✅ ปรับเวลา: ตอนกรองให้ใช้ UTC+7
//         const total = validOrders
//           .filter(
//             o =>
//               moment(o.placedAt).utcOffset(7).format('YYYY-MM-DD') === dateKey,
//           )
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: dayLabel, value: total });
//       }
//     } else if (type === 'Month') {
//       const currentMonthKey = REFERENCE_DATE.format('YYYY-MM');
//       const weeks = [
//         { label: 'W1', start: 1, end: 7 },
//         { label: 'W2', start: 8, end: 14 },
//         { label: 'W3', start: 15, end: 21 },
//         { label: 'W4', start: 22, end: 31 },
//       ];
//       // ✅ ปรับเวลา: ตอนกรองเดือนใช้ UTC+7
//       const ordersInMonth = validOrders.filter(
//         o =>
//           moment(o.placedAt).utcOffset(7).format('YYYY-MM') === currentMonthKey,
//       );
//       weeks.forEach(w => {
//         const total = ordersInMonth
//           .filter(o => {
//             // ✅ ปรับเวลา: ตอนดึงวันที่ใช้ UTC+7
//             const day = moment(o.placedAt).utcOffset(7).date();
//             return day >= w.start && day <= w.end;
//           })
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: w.label, value: total });
//       });
//     } else if (type === 'Year') {
//       const targetYear = REFERENCE_DATE.year();
//       for (let i = 0; i < 12; i++) {
//         const d = moment().month(i);
//         const monthLabel = d.format('MMM');
//         const total = validOrders
//           .filter(
//             o =>
//               // ✅ ปรับเวลา: ตอนดึงเดือนและปีใช้ UTC+7
//               moment(o.placedAt).utcOffset(7).month() === i &&
//               moment(o.placedAt).utcOffset(7).year() === targetYear,
//           )
//           .reduce((sum, o) => sum + o.grandTotal, 0);
//         chart.push({ label: monthLabel, value: total });
//       }
//     }
//     setChartData(chart);
//   };

//   // ✅ แก้ไขฟังก์ชันนี้ให้รับ imgMap เพิ่มเข้ามา
//   const processMenuRanking = (
//     data: Order[],
//     type: string,
//     imgMap: Record<number, string>,
//   ) => {
//     let validOrders = data.filter(o => o.status?.toLowerCase() === 'completed');
//     const REFERENCE_DATE = moment();

//     if (type === 'Week') {
//       const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
//       // ✅ ปรับเวลา: ใช้ UTC+7 ในการเปรียบเทียบ
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).utcOffset(7).isSameOrAfter(startOfWeek),
//       );
//     } else if (type === 'Month') {
//       const startOfMonth = moment(REFERENCE_DATE).startOf('month');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).utcOffset(7).isSameOrAfter(startOfMonth),
//       );
//     } else if (type === 'Year') {
//       const startOfYear = moment(REFERENCE_DATE).startOf('year');
//       validOrders = validOrders.filter(o =>
//         moment(o.placedAt).utcOffset(7).isSameOrAfter(startOfYear),
//       );
//     }

//     const menuMap = new Map<number, RankingItem>();

//     validOrders.forEach(order => {
//       if (order.orderItems && order.orderItems.length > 0) {
//         order.orderItems.forEach(item => {
//           const mId = item.menuItemId;
//           if (!mId) return;

//           const qty = item.quantity || 0;
//           const price = item.price || 0;

//           // ✅ หัวใจสำคัญ: ดึงรูปจาก Map ที่เราเตรียมไว้ (ถ้าไม่มีให้ใช้ path เดิมเป็นสำรอง)
//           const resolvedImage = imgMap[mId] || item.imagePath || null;

//           if (menuMap.has(mId)) {
//             const existing = menuMap.get(mId)!;
//             existing.orderCount += qty;
//             existing.totalSales += qty * price;
//             // อัปเดตเผื่อรูปเพิ่งมา
//             if (!existing.imageUrl && resolvedImage) {
//               existing.imageUrl = resolvedImage;
//             }
//           } else {
//             menuMap.set(mId, {
//               id: mId,
//               name: item.menuItemName || 'Unknown Menu',
//               price: price,
//               orderCount: qty,
//               totalSales: qty * price,
//               imageUrl: resolvedImage, // ✅ ใส่รูปลงไป
//               category: item.category || 'Food',
//             });
//           }
//         });
//       }
//     });

//     const sortedRanking = Array.from(menuMap.values())
//       .sort((a, b) => b.orderCount - a.orderCount)
//       .slice(0, 5);

//     setMenuRanking(sortedRanking);
//   };

//   return (
//     <View style={styles.screenContainer}>
//       <View style={dashboardStyles.header}>
//         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//           <TouchableOpacity
//             style={dashboardStyles.profileButton}
//             onPress={() => navigation.navigate('AdminProfile')}
//           >
//             <Ionicons name="person-circle-outline" size={40} color="#1E293B" />
//           </TouchableOpacity>

//           <View style={{ marginLeft: 10 }}>
//             <Text style={dashboardStyles.locationLabel}>DASHBOARD</Text>
//             <Text style={dashboardStyles.locationText}>Shop Overview</Text>
//           </View>
//         </View>

//         <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
//           <View style={dashboardStyles.shopProfileWrapper}>
//             <Image
//               source={require('../../assets/images/SHOP_KFC.png')}
//               style={dashboardStyles.shopProfileImg}
//             />
//           </View>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         contentContainerStyle={dashboardStyles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={loading} onRefresh={fetchAllData} />
//         }
//       >
//         <Text style={dashboardStyles.sectionTitle}>Order Statistics</Text>
//         <View style={dashboardStyles.statsGrid}>
//           <View style={{ width: '100%', marginBottom: 10 }}>
//             <StatCard
//               label="Orders In Progress"
//               value={stats.running}
//               color="#FF7622"
//               textColor="#FFF"
//             />
//           </View>
//           <View style={dashboardStyles.statsRow}>
//             <View style={{ width: '48%' }}>
//               <StatCard
//                 label="Today Sales"
//                 value={`฿${stats.daily.toLocaleString()}`}
//               />
//             </View>
//             <View style={{ width: '48%' }}>
//               <StatCard
//                 label="This Week Sales"
//                 value={`฿${stats.weekly.toLocaleString()}`}
//               />
//             </View>
//           </View>
//         </View>

//         <View style={[dashboardStyles.card, { marginTop: 10 }]}>
//           <View style={dashboardStyles.cardHeaderColumn}>
//             <Text style={dashboardStyles.cardTitleBig}>Sales Performance</Text>
//           </View>
//           <FilterTabs activeFilter={chartFilter} onSelect={setChartFilter} />
//           <View style={{ marginTop: 20, height: 220 }}>
//             <SalesChart data={chartData} />
//           </View>
//         </View>

//         <View style={{ marginTop: 30, marginBottom: 50 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 12,
//             }}
//           >
//             <Text style={[dashboardStyles.sectionTitle, { marginBottom: 0 }]}>
//               Popular Menu
//             </Text>
//           </View>

//           <View style={dashboardStyles.menuFilterContainer}>
//             {FILTER_TYPES.map(type => (
//               <TouchableOpacity
//                 key={type}
//                 style={[
//                   dashboardStyles.menuFilterBadge,
//                   rankingFilter === type &&
//                     dashboardStyles.menuFilterBadgeActive,
//                 ]}
//                 onPress={() => setRankingFilter(type)}
//               >
//                 <Text
//                   style={[
//                     dashboardStyles.menuFilterText,
//                     rankingFilter === type &&
//                       dashboardStyles.menuFilterTextActive,
//                   ]}
//                 >
//                   {type}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={{ marginTop: 10 }}>
//             {menuRanking.length === 0 ? (
//               <View style={{ padding: 20, alignItems: 'center' }}>
//                 <Text style={{ color: '#94A3B8' }}>
//                   No sales data for this period
//                 </Text>
//               </View>
//             ) : (
//               menuRanking.map((item, index) => {
//                 const imgSource = item.imageUrl
//                   ? getImageUrl(item.imageUrl)
//                   : require('../../assets/images/CATAGORY_ICON_BURGERS.png');

//                 return (
//                   <View key={index} style={dashboardStyles.rankItem}>
//                     <View style={dashboardStyles.rankBadge}>
//                       <Text style={dashboardStyles.rankNumber}>
//                         {index + 1}
//                       </Text>
//                     </View>

//                     <Image
//                       source={imgSource}
//                       style={dashboardStyles.rankImg}
//                       resizeMode="cover"
//                       onError={e =>
//                         console.log(
//                           `❌ Load Error for ${item.name}:`,
//                           e.nativeEvent.error,
//                         )
//                       }
//                     />

//                     <View style={{ flex: 1, marginLeft: 12 }}>
//                       <Text style={dashboardStyles.rankName} numberOfLines={1}>
//                         {item.name}
//                       </Text>
//                       <Text style={dashboardStyles.rankCategory}>
//                         {item.category}
//                       </Text>
//                       <Text style={dashboardStyles.rankPrice}>
//                         ฿{item.price}
//                       </Text>
//                     </View>
//                     <View style={{ alignItems: 'flex-end' }}>
//                       <Text style={dashboardStyles.rankSalesVal}>
//                         {item.orderCount}
//                       </Text>
//                       <Text style={dashboardStyles.rankSalesLabel}>Sold</Text>
//                     </View>
//                   </View>
//                 );
//               })
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// // ==================================================
// // 🧭 NAVIGATOR CONFIG
// // ==================================================

// const Tab = createBottomTabNavigator();
// const ICONS = {
//   home: require('../../assets/images/admin_home.png'),
//   food_list: require('../../assets/images/admin_food_list.png'),
//   new_food: require('../../assets/images/admin_new_food.png'),
//   notification: require('../../assets/images/admin_notification.png'),
//   profile: require('../../assets/images/admin_profile.png'),
// };

// export default function MainAdminShopScreen({ route }: any) {
//   const params = route.params || {};

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: styles.tabBar,
//       }}
//     >
//       <Tab.Screen
//         name="AdminHome"
//         component={HomeScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.home}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminFoodList"
//         component={AdminFoodListScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.food_list}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminNewFood"
//         component={AdminNewFoodScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.new_food}
//               style={styles.centerIcon}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminNotification"
//         component={AdminNotificationScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.notification}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="AdminProfile"
//         component={AdminSettingScreen}
//         initialParams={params}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Image
//               source={ICONS.profile}
//               style={[styles.icon, focused && styles.iconActive]}
//               resizeMode="contain"
//             />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }

// // ==================================================
// // 🎨 STYLES
// // ==================================================

// const styles = StyleSheet.create({
//   screenContainer: { flex: 1, backgroundColor: '#F8F9FB' },
//   tabBar: {
//     backgroundColor: '#ffffff',
//     height: 70,
//     borderTopWidth: 0,
//     elevation: 10,
//     paddingBottom: 20,
//     paddingTop: 10,
//   },
//   icon: { width: 28, height: 28, tintColor: '#9CA3AF' },
//   iconActive: { tintColor: '#FF7622' },
//   centerIcon: { width: 50, height: 50 },
// });

// const dashboardStyles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 50,
//     paddingBottom: 15,
//     backgroundColor: '#fff',
//   },
//   profileButton: {
//     marginRight: 5,
//     padding: 2,
//   },
//   locationLabel: {
//     fontSize: 10,
//     color: '#F97316',
//     fontWeight: '800',
//     letterSpacing: 1,
//   },
//   locationText: { fontSize: 16, color: '#333', fontWeight: '700' },
//   shopProfileWrapper: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#CBD5E0',
//     overflow: 'hidden',
//   },
//   shopProfileImg: { width: '100%', height: '100%' },
//   scrollContent: { padding: 20 },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1E293B',
//     marginBottom: 12,
//   },
//   statsGrid: { marginBottom: 15 },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   statCard: {
//     padding: 15,
//     borderRadius: 16,
//     backgroundColor: '#fff',
//     elevation: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 90,
//   },
//   statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
//   statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     elevation: 3,
//   },
//   cardHeaderColumn: { marginBottom: 15 },
//   cardTitleBig: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },

//   // Graph Filters
//   filterContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F1F5F9',
//     borderRadius: 12,
//     padding: 4,
//     justifyContent: 'space-between',
//   },
//   filterBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 10,
//   },
//   filterBtnActive: { backgroundColor: '#fff', elevation: 1 },
//   filterText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
//   filterTextActive: { color: '#1E293B', fontWeight: 'bold' },

//   // Menu Filters
//   menuFilterContainer: {
//     flexDirection: 'row',
//     marginBottom: 15,
//   },
//   menuFilterBadge: {
//     marginRight: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//     backgroundColor: '#FFF',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   menuFilterBadgeActive: {
//     backgroundColor: '#FF7622',
//     borderColor: '#FF7622',
//   },
//   menuFilterText: {
//     fontSize: 12,
//     color: '#64748B',
//     fontWeight: '600',
//   },
//   menuFilterTextActive: {
//     color: '#FFF',
//   },

//   // Charts
//   chartContainer: {
//     flex: 1,
//     width: '100%',
//     height: '100%',
//     position: 'relative',
//   },
//   chartRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-end',
//     height: '100%',
//     paddingBottom: 20,
//     zIndex: 10,
//   },
//   gridLineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 1,
//     overflow: 'visible',
//     width: '100%',
//   },
//   gridLabel: {
//     fontSize: 9,
//     color: '#CBD5E1',
//     width: 25,
//     textAlign: 'right',
//     marginRight: 5,
//     transform: [{ translateY: -6 }],
//   },
//   gridLine: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#F1F5F9',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//     borderStyle: 'dashed',
//   },
//   barWrapper: { alignItems: 'center', flex: 1, marginLeft: 15 },
//   barValue: { fontSize: 10, color: '#64748B', marginBottom: 4 },
//   barLine: { width: 12, borderRadius: 6, minHeight: 4 },
//   barLabel: { marginTop: 8, fontSize: 10, color: '#94A3B8' },

//   // List Items
//   rankItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   rankBadge: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#1E293B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   rankNumber: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
//   rankImg: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     backgroundColor: '#F1F5F9',
//   },
//   rankName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
//   rankCategory: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
//   rankPrice: { fontSize: 12, color: '#F97316', marginTop: 2 },
//   rankSalesVal: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
//   rankSalesLabel: { fontSize: 10, color: '#94A3B8' },
// });
// src/screens/MainAdminShopScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import api, { API_BASE } from '../api/client';
import Ionicons from 'react-native-vector-icons/Ionicons';
import 'moment/locale/th';

// Screens Imports
import AdminFoodListScreen from './AdminFoodListScreen';
import AdminNewFoodScreen from './AdminNewFoodScreen';
import AdminNotificationScreen from './AdminNotificationScreen';
import AdminSettingScreen from './AdminSettingScreen';

// ==================================================
// 🟢 TYPES & INTERFACES
// ==================================================

// ✅ เพิ่ม Type สำหรับรับข้อมูลจาก API MenuItems (เพื่อเอารูป)
interface MenuItemDto {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface OrderItem {
  id: number;
  menuItemId: number; // ใช้สำหรับ Grouping
  menuItemName: string; // ชื่อเมนู
  quantity: number;
  price: number; // ราคาต่อหน่วย
  imagePath?: string | null;
  category?: string | null;
}

interface Order {
  id: number;
  grandTotal: number;
  status: string;
  placedAt: string;
  orderItems: OrderItem[];
}

interface RankingItem {
  id: number;
  name: string;
  price: number;
  orderCount: number;
  totalSales: number;
  imageUrl: string | null;
  category: string;
}

// ==================================================
// 🛠 HELPERS
// ==================================================

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;

  if (path.startsWith('http')) {
    return { uri: path };
  }

  const baseUrl = API_BASE.replace('/api', '');
  let cleanPath = path.replace(/\\/g, '/');
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  const finalUrl = `${baseUrl}${cleanPath}`;
  return { uri: finalUrl };
};

const FILTER_TYPES = ['Week', 'Month', 'Year'];

// ==================================================
// 🧱 COMPONENTS
// ==================================================

const FilterTabs = ({ activeFilter, onSelect }: any) => (
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

const StatCard = ({
  label,
  value,
  color = '#ffffffff',
  textColor = '#1E293B',
  labelColor, // ✅ 1. เพิ่มตัวแปรรับสี Label
}: any) => (
  <View style={[dashboardStyles.statCard, { backgroundColor: color }]}>
    <Text style={[dashboardStyles.statValue, { color: textColor }]}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </Text>
    <Text
      style={[dashboardStyles.statLabel, labelColor && { color: labelColor }]}
    >
      {label}
    </Text>
  </View>
);

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

  const rawMax = Math.max(...data.map(d => d.value), 0);
  const yAxisMax = rawMax > 0 ? rawMax * 1.2 : 1000;

  return (
    <View style={dashboardStyles.chartContainer}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { justifyContent: 'space-between', paddingBottom: 20 },
        ]}
      >
        {[0, 1, 2, 3, 4].map(i => {
          const gridValue = Math.round(yAxisMax - (yAxisMax / 4) * i);
          return (
            <View key={i} style={dashboardStyles.gridLineContainer}>
              <Text style={dashboardStyles.gridLabel}>{gridValue}</Text>
              <View style={dashboardStyles.gridLine} />
            </View>
          );
        })}
      </View>

      <View style={dashboardStyles.chartRow}>
        {data.map((item, index) => {
          const heightPercentage =
            yAxisMax > 0 ? (item.value / yAxisMax) * 100 : 0;
          return (
            <View key={index} style={dashboardStyles.barWrapper}>
              <Text style={dashboardStyles.barValue}>
                {item.value > 0 ? item.value.toFixed(0) : ''}
              </Text>
              <View
                style={[
                  dashboardStyles.barLine,
                  {
                    height: `${heightPercentage}%`,
                    backgroundColor:
                      heightPercentage > 0 ? '#FF7622' : '#E2E8F0',
                    opacity: item.value === rawMax ? 1 : 0.7,
                  },
                ]}
              />
              <Text style={dashboardStyles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ==================================================
// 🏠 HomeScreen (Dashboard Logic)
// ==================================================
const HomeScreen = ({ route, navigation }: any) => {
  const { shopId } = route.params || {};
  const [loading, setLoading] = useState(true);

  // Data State
  const [orders, setOrders] = useState<Order[]>([]);

  // ✅ เพิ่ม State เก็บ Map ของรูปภาพ (Key=MenuID, Value=ImageUrl)
  const [menuItemsMap, setMenuItemsMap] = useState<Record<number, string>>({});

  // Chart State
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartFilter, setChartFilter] = useState('Week');

  // Stats State
  const [stats, setStats] = useState({
    running: 0,
    daily: 0,
    weekly: 0,
    monthly: 0,
    allTime: 0,
  });

  // Ranking State (Popular Menu)
  const [menuRanking, setMenuRanking] = useState<RankingItem[]>([]);
  const [rankingFilter, setRankingFilter] = useState('Week');

  // --- 1. Fetch Data ---
  const fetchAllData = async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      console.log(`📡 Fetching data for shop: ${shopId}`);

      // ✅ ยิง API 2 เส้นพร้อมกัน (Parallel Fetching)
      // เส้นที่ 2 ตัด /api ออก เพื่อแก้ Error 404
      const [ordersRes, menuRes] = await Promise.all([
        api.get(`/Orders/shop/${shopId}`),
        api.get(`/shops/${shopId}/menuitems`),
      ]);

      const rawOrders: Order[] = ordersRes.data;
      const rawMenus: MenuItemDto[] = menuRes.data;

      // ✅ สร้าง Map รูปภาพเตรียมไว้ใช้ { 8: "/uploads/img.png", ... }
      const imgMap: Record<number, string> = {};
      rawMenus.forEach(m => {
        if (m.imageUrl) imgMap[m.id] = m.imageUrl;
      });
      setMenuItemsMap(imgMap);

      setOrders(rawOrders);

      // คำนวณต่างๆ
      calculateStats(rawOrders);
      processChartData(rawOrders, chartFilter);

      // ส่ง imgMap เข้าไปช่วยแปะรูปตอนจัดอันดับ
      processMenuRanking(rawOrders, rankingFilter, imgMap);
    } catch (err) {
      console.error('❌ Dashboard Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [shopId]),
  );

  useEffect(() => {
    if (orders.length > 0) {
      processChartData(orders, chartFilter);
    }
  }, [chartFilter, orders]);

  useEffect(() => {
    if (orders.length > 0) {
      // ✅ ส่ง menuItemsMap เข้าไปทุกครั้งที่มีการเปลี่ยน Filter
      processMenuRanking(orders, rankingFilter, menuItemsMap);
    }
  }, [rankingFilter, orders, menuItemsMap]);

  // --- 2. Logic Calculation ---
  const calculateStats = (data: Order[]) => {
    // 🕒 กำหนดเวลาปัจจุบันเป็นเวลาไทย (UTC+7) เพื่อใช้เปรียบเทียบ
    const nowThai = moment().utcOffset(7);
    const today = nowThai.format('YYYY-MM-DD');
    const startOfWeek = nowThai.clone().startOf('isoWeek');
    const startOfMonth = nowThai.clone().startOf('month');

    let running = 0;
    let dailyVal = 0;
    let weeklyVal = 0;
    let monthlyVal = 0;
    let allTimeVal = 0;

    data.forEach(o => {
      // 🕒 แปลงเวลา Order เป็นเวลาไทย (UTC+7)
      const orderDate = moment(o.placedAt).utcOffset(7);

      const status = o.status?.toLowerCase() || '';
      const isCompleted = status === 'completed';

      if (['pending', 'cooking', 'ready'].includes(status)) {
        running++;
      }

      if (isCompleted) {
        allTimeVal += o.grandTotal;

        // เปรียบเทียบโดยใช้เวลาไทยทั้งคู่
        if (orderDate.format('YYYY-MM-DD') === today) dailyVal += o.grandTotal;
        if (orderDate.isSameOrAfter(startOfWeek)) weeklyVal += o.grandTotal;
        if (orderDate.isSameOrAfter(startOfMonth)) monthlyVal += o.grandTotal;
      }
    });

    setStats({
      running,
      daily: dailyVal,
      weekly: weeklyVal,
      monthly: monthlyVal,
      allTime: allTimeVal,
    });
  };

  const processChartData = (data: Order[], type: string) => {
    const validOrders = data.filter(
      o => o.status?.toLowerCase() === 'completed',
    );
    let chart: any[] = [];

    // 🕒 ใช้เวลาอ้างอิงเป็นเวลาไทย
    const REFERENCE_DATE = moment().utcOffset(7);

    if (type === 'Week') {
      const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
      for (let i = 0; i < 7; i++) {
        const d = moment(startOfWeek).add(i, 'days');
        const dayLabel = d.format('ddd');
        const dateKey = d.format('YYYY-MM-DD');

        // 🕒 Filter โดยแปลง placedAt เป็นเวลาไทยก่อนเทียบ
        const total = validOrders
          .filter(
            o =>
              moment(o.placedAt).utcOffset(7).format('YYYY-MM-DD') === dateKey,
          )
          .reduce((sum, o) => sum + o.grandTotal, 0);
        chart.push({ label: dayLabel, value: total });
      }
    } else if (type === 'Month') {
      const currentMonthKey = REFERENCE_DATE.format('YYYY-MM');
      const weeks = [
        { label: 'W1', start: 1, end: 7 },
        { label: 'W2', start: 8, end: 14 },
        { label: 'W3', start: 15, end: 21 },
        { label: 'W4', start: 22, end: 31 },
      ];
      // 🕒 Filter เดือนไทย
      const ordersInMonth = validOrders.filter(
        o =>
          moment(o.placedAt).utcOffset(7).format('YYYY-MM') === currentMonthKey,
      );
      weeks.forEach(w => {
        const total = ordersInMonth
          .filter(o => {
            // 🕒 ดึงวันที่แบบไทย
            const day = moment(o.placedAt).utcOffset(7).date();
            return day >= w.start && day <= w.end;
          })
          .reduce((sum, o) => sum + o.grandTotal, 0);
        chart.push({ label: w.label, value: total });
      });
    } else if (type === 'Year') {
      const targetYear = REFERENCE_DATE.year();
      for (let i = 0; i < 12; i++) {
        const d = moment().utcOffset(7).month(i); // เดือนไทย
        const monthLabel = d.format('MMM');
        const total = validOrders
          .filter(
            o =>
              // 🕒 ดึงเดือนและปีแบบไทย
              moment(o.placedAt).utcOffset(7).month() === i &&
              moment(o.placedAt).utcOffset(7).year() === targetYear,
          )
          .reduce((sum, o) => sum + o.grandTotal, 0);
        chart.push({ label: monthLabel, value: total });
      }
    }
    setChartData(chart);
  };

  // ✅ แก้ไขฟังก์ชันนี้ให้รับ imgMap เพิ่มเข้ามา
  const processMenuRanking = (
    data: Order[],
    type: string,
    imgMap: Record<number, string>,
  ) => {
    let validOrders = data.filter(o => o.status?.toLowerCase() === 'completed');

    // 🕒 ใช้เวลาอ้างอิงเป็นเวลาไทย
    const REFERENCE_DATE = moment().utcOffset(7);

    if (type === 'Week') {
      const startOfWeek = moment(REFERENCE_DATE).startOf('isoWeek');
      validOrders = validOrders.filter(o =>
        moment(o.placedAt).utcOffset(7).isSameOrAfter(startOfWeek),
      );
    } else if (type === 'Month') {
      const startOfMonth = moment(REFERENCE_DATE).startOf('month');
      validOrders = validOrders.filter(o =>
        moment(o.placedAt).utcOffset(7).isSameOrAfter(startOfMonth),
      );
    } else if (type === 'Year') {
      const startOfYear = moment(REFERENCE_DATE).startOf('year');
      validOrders = validOrders.filter(o =>
        moment(o.placedAt).utcOffset(7).isSameOrAfter(startOfYear),
      );
    }

    const menuMap = new Map<number, RankingItem>();

    validOrders.forEach(order => {
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach(item => {
          const mId = item.menuItemId;
          if (!mId) return;

          const qty = item.quantity || 0;
          const price = item.price || 0;

          // ✅ หัวใจสำคัญ: ดึงรูปจาก Map ที่เราเตรียมไว้ (ถ้าไม่มีให้ใช้ path เดิมเป็นสำรอง)
          const resolvedImage = imgMap[mId] || item.imagePath || null;

          if (menuMap.has(mId)) {
            const existing = menuMap.get(mId)!;
            existing.orderCount += qty;
            existing.totalSales += qty * price;
            // อัปเดตเผื่อรูปเพิ่งมา
            if (!existing.imageUrl && resolvedImage) {
              existing.imageUrl = resolvedImage;
            }
          } else {
            menuMap.set(mId, {
              id: mId,
              name: item.menuItemName || 'Unknown Menu',
              price: price,
              orderCount: qty,
              totalSales: qty * price,
              imageUrl: resolvedImage, // ✅ ใส่รูปลงไป
              category: item.category || 'Food',
            });
          }
        });
      }
    });

    const sortedRanking = Array.from(menuMap.values())
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    setMenuRanking(sortedRanking);
  };

  return (
    <View style={styles.screenContainer}>
      <View style={dashboardStyles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={dashboardStyles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#1E293B" />
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Text style={dashboardStyles.locationLabel}>DASHBOARD</Text>
            <Text style={dashboardStyles.locationText}>Shop Overview</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
          <View style={dashboardStyles.shopProfileWrapper}>
            <Image
              source={require('../../assets/images/SHOP_KFC.png')}
              style={dashboardStyles.shopProfileImg}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={dashboardStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAllData} />
        }
      >
        <Text style={dashboardStyles.sectionTitle}>Order Statistics</Text>
        <View style={dashboardStyles.statsGrid}>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <StatCard
              label="Orders In Progress"
              value={stats.running}
              color="#FF7622"
              textColor="#ffffffff"
            />
          </View>
          <View style={dashboardStyles.statsRow}>
            <View style={{ width: '48%' }}>
              <StatCard
                label="Today Sales"
                value={`฿${stats.daily.toLocaleString()}`}
              />
            </View>
            <View style={{ width: '48%' }}>
              <StatCard
                label="This Week Sales"
                value={`฿${stats.weekly.toLocaleString()}`}
              />
            </View>
          </View>
        </View>

        <View style={[dashboardStyles.card, { marginTop: 10 }]}>
          <View style={dashboardStyles.cardHeaderColumn}>
            <Text style={dashboardStyles.cardTitleBig}>Sales Performance</Text>
          </View>
          <FilterTabs activeFilter={chartFilter} onSelect={setChartFilter} />
          <View style={{ marginTop: 20, height: 220 }}>
            <SalesChart data={chartData} />
          </View>
        </View>

        <View style={{ marginTop: 30, marginBottom: 50 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={[dashboardStyles.sectionTitle, { marginBottom: 0 }]}>
              Popular Menu
            </Text>
          </View>

          <View style={dashboardStyles.menuFilterContainer}>
            {FILTER_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  dashboardStyles.menuFilterBadge,
                  rankingFilter === type &&
                    dashboardStyles.menuFilterBadgeActive,
                ]}
                onPress={() => setRankingFilter(type)}
              >
                <Text
                  style={[
                    dashboardStyles.menuFilterText,
                    rankingFilter === type &&
                      dashboardStyles.menuFilterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 10 }}>
            {menuRanking.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8' }}>
                  No sales data for this period
                </Text>
              </View>
            ) : (
              menuRanking.map((item, index) => {
                const imgSource = item.imageUrl
                  ? getImageUrl(item.imageUrl)
                  : require('../../assets/images/CATAGORY_ICON_BURGERS.png');

                return (
                  <View key={index} style={dashboardStyles.rankItem}>
                    <View style={dashboardStyles.rankBadge}>
                      <Text style={dashboardStyles.rankNumber}>
                        {index + 1}
                      </Text>
                    </View>

                    <Image
                      source={imgSource}
                      style={dashboardStyles.rankImg}
                      resizeMode="cover"
                      onError={e =>
                        console.log(
                          `❌ Load Error for ${item.name}:`,
                          e.nativeEvent.error,
                        )
                      }
                    />

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={dashboardStyles.rankName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={dashboardStyles.rankCategory}>
                        {item.category}
                      </Text>
                      <Text style={dashboardStyles.rankPrice}>
                        ฿{item.price}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={dashboardStyles.rankSalesVal}>
                        {item.orderCount}
                      </Text>
                      <Text style={dashboardStyles.rankSalesLabel}>Sold</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ==================================================
// 🧭 NAVIGATOR CONFIG
// ==================================================

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
        component={AdminNotificationScreen}
        initialParams={params}
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
        component={AdminSettingScreen}
        initialParams={params}
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

// ==================================================
// 🎨 STYLES
// ==================================================

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
  profileButton: {
    marginRight: 5,
    padding: 2,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  cardHeaderColumn: { marginBottom: 15 },
  cardTitleBig: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },

  // Graph Filters
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

  // Menu Filters
  menuFilterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  menuFilterBadge: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuFilterBadgeActive: {
    backgroundColor: '#FF7622',
    borderColor: '#FF7622',
  },
  menuFilterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  menuFilterTextActive: {
    color: '#FFF',
  },

  // Charts
  chartContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 20,
    zIndex: 10,
  },
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
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  barWrapper: { alignItems: 'center', flex: 1, marginLeft: 15 },
  barValue: { fontSize: 10, color: '#64748B', marginBottom: 4 },
  barLine: { width: 12, borderRadius: 6, minHeight: 4 },
  barLabel: { marginTop: 8, fontSize: 10, color: '#94A3B8' },

  // List Items
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
  rankCategory: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  rankPrice: { fontSize: 12, color: '#F97316', marginTop: 2 },
  rankSalesVal: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  rankSalesLabel: { fontSize: 10, color: '#94A3B8' },
});
