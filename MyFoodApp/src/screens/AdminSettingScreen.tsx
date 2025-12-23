// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Switch,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
//   Image,
// } from 'react-native';
// import api, { API_BASE } from '../api/client';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// export default function AdminSettingScreen({ navigation, route }: any) {
//   const { shopId } = route.params || {}; // Receive shopId
//   const [shop, setShop] = useState<any>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Load Shop Data
//   useEffect(() => {
//     if (shopId) {
//       fetchShopData();
//     }
//   }, [shopId]);

//   const fetchShopData = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/Shops/${shopId}`);
//       setShop(res.data);
//       setIsOpen(res.data.isOpen);
//     } catch (err) {
//       console.log('Error fetching shop:', err);
//       Alert.alert('Error', 'Unable to load shop data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle Shop Status
//   const toggleShopStatus = async (value: boolean) => {
//     // 1. เปลี่ยน UI ทันที (Optimistic Update)
//     setIsOpen(value);

//     try {
//       // 2. ✅ ยิง API เส้นใหม่ที่เราเพิ่งสร้าง /status
//       // ส่ง Body เป็น JSON { isOpen: true/false }
//       await api.put(`/Shops/${shopId}/status`, { isOpen: value });

//       console.log(`Updated shop status to: ${value}`);
//     } catch (err) {
//       console.error('Error updating status:', err);
//       // 3. ถ้า Error ให้ดีดสวิตช์กลับ
//       setIsOpen(!value);
//       Alert.alert('Error', 'ไม่สามารถเปลี่ยนสถานะร้านได้ กรุณาลองใหม่');
//     }
//   };

//   const goToEditProfile = () => {
//     // ✅ เรียกใช้ชื่อ Route ใหม่ "AdminEditShopProfile"
//     navigation.navigate('AdminEditShopProfile', { shopId: shopId });
//   };

//   const getImageUrl = (path: string | null) => {
//     if (!path) return null;
//     if (path.startsWith('http')) return { uri: path };
//     const baseUrl = API_BASE.replace('/api', '');
//     return { uri: `${baseUrl}${path}` };
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#FF7622" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
//           <Ionicons name="arrow-back" size={24} color="#1E293B" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Shop Settings</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Shop Info Card */}
//         <View style={styles.profileCard}>
//           <View style={styles.shopImageWrapper}>
//             {/* Logic to find promo image or placeholder */}
//             <Image
//               source={
//                 shop?.media?.find((m: any) => m.kind === 'promo')?.url
//                   ? getImageUrl(
//                       shop.media.find((m: any) => m.kind === 'promo').url,
//                     )
//                   : require('../../assets/images/SHOP_KFC.png')
//               }
//               style={styles.shopImage}
//             />
//           </View>
//           <Text style={styles.shopName}>{shop?.name || 'Shop Name'}</Text>
//           <Text style={styles.shopDesc}>
//             {shop?.description || 'No description'}
//           </Text>
//         </View>

//         {/* Status Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Shop Status</Text>
//           <View style={styles.row}>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <View
//                 style={[
//                   styles.statusDot,
//                   { backgroundColor: isOpen ? '#22C55E' : '#EF4444' },
//                 ]}
//               />
//               <Text style={styles.rowText}>
//                 {isOpen ? 'Shop Open' : 'Shop Closed'}
//               </Text>
//             </View>
//             <Switch
//               value={isOpen}
//               onValueChange={toggleShopStatus}
//               trackColor={{ false: '#E2E8F0', true: '#FFEDD5' }}
//               thumbColor={isOpen ? '#FF7622' : '#94A3B8'}
//             />
//           </View>
//         </View>

//         {/* General Settings */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>General</Text>

//           <TouchableOpacity style={styles.menuItem} onPress={goToEditProfile}>
//             <View style={styles.menuLeft}>
//               <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
//                 <Ionicons name="create-outline" size={20} color="#3B82F6" />
//               </View>
//               <Text style={styles.menuText}>Edit Shop Profile</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() =>
//               navigation.navigate('AdminReport', { shopId: shopId })
//             }
//           >
//             <View style={styles.menuLeft}>
//               <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
//                 <Ionicons name="stats-chart" size={20} color="#16A34A" />
//               </View>
//               <Text style={styles.menuText}>Sales report</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() =>
//               Alert.alert('Coming Soon', 'Financial system under development')
//             }
//           >
//             <View style={styles.menuLeft}>
//               <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
//                 <Ionicons name="wallet-outline" size={20} color="#10B981" />
//               </View>
//               <Text style={styles.menuText}>Financial & Accounts</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.menuItem}
//             onPress={() =>
//               Alert.alert('Coming Soon', 'Marketing tools under development')
//             }
//           >
//             <View style={styles.menuLeft}>
//               <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
//                 <Ionicons name="megaphone-outline" size={20} color="#F97316" />
//               </View>
//               <Text style={styles.menuText}>Marketing Tools</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FB' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 15,
//     backgroundColor: '#fff',
//   },
//   backBtn: { padding: 5 },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
//   scrollContent: { padding: 20 },

//   profileCard: {
//     alignItems: 'center',
//     marginBottom: 25,
//   },
//   shopImageWrapper: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#E2E8F0',
//     marginBottom: 10,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#fff',
//     elevation: 2,
//   },
//   shopImage: { width: '100%', height: '100%' },
//   shopName: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1E293B',
//     marginBottom: 4,
//   },
//   shopDesc: { fontSize: 14, color: '#64748B' },

//   section: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#94A3B8',
//     marginBottom: 15,
//     textTransform: 'uppercase',
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   rowText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1E293B',
//     marginLeft: 10,
//   },
//   statusDot: { width: 10, height: 10, borderRadius: 5 },

//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F1F5F9',
//   },
//   menuLeft: { flexDirection: 'row', alignItems: 'center' },
//   iconBox: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   menuText: { fontSize: 16, color: '#334155', fontWeight: '500' },
// });
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { API_BASE } from '../api/client';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AdminSettingScreen({ navigation, route }: any) {
  const { shopId } = route.params || {};
  const [shop, setShop] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ ใช้ useFocusEffect + useCallback เพื่อโหลดข้อมูลใหม่ทุกครั้งที่หน้านี้ถูกเปิด
  useFocusEffect(
    useCallback(() => {
      if (shopId) {
        fetchShopData();
      }
    }, [shopId]),
  );

  const fetchShopData = async () => {
    try {
      // โหลดครั้งแรกให้หมุนๆ แต่ถ้ากลับมาหน้านี้ซ้ำ (มี shop แล้ว) ไม่ต้องหมุน เพื่อความลื่นไหล
      if (!shop) setLoading(true);

      const res = await api.get(`/Shops/${shopId}`);
      setShop(res.data);
      setIsOpen(res.data.isOpen);
    } catch (err) {
      console.log('Error fetching shop:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleShopStatus = async (value: boolean) => {
    setIsOpen(value); // Optimistic update
    try {
      await api.put(`/Shops/${shopId}/status`, { isOpen: value });
      console.log(`Updated shop status to: ${value}`);
    } catch (err) {
      console.error('Error updating status:', err);
      setIsOpen(!value); // Revert
      Alert.alert('Error', 'ไม่สามารถเปลี่ยนสถานะร้านได้ กรุณาลองใหม่');
    }
  };

  const goToEditProfile = () => {
    navigation.navigate('AdminEditShopProfile', { shopId: shopId });
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return { uri: path };
    const baseUrl = API_BASE.replace('/api', '');
    return { uri: `${baseUrl}${path}` };
  };

  if (loading && !shop) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shop Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.shopImageWrapper}>
            <Image
              source={
                shop?.media?.find((m: any) => m.kind === 'promo')?.url
                  ? getImageUrl(
                      shop.media.find((m: any) => m.kind === 'promo').url,
                    )
                  : require('../../assets/images/SHOP_KFC.png')
              }
              style={styles.shopImage}
            />
          </View>
          <Text style={styles.shopName}>{shop?.name || 'Shop Name'}</Text>
          <Text style={styles.shopDesc}>
            {shop?.description || 'No description'}
          </Text>
        </View>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Status</Text>
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOpen ? '#22C55E' : '#EF4444' },
                ]}
              />
              <Text style={styles.rowText}>
                {isOpen ? 'Shop Open' : 'Shop Closed'}
              </Text>
            </View>
            <Switch
              value={isOpen}
              onValueChange={toggleShopStatus}
              trackColor={{ false: '#E2E8F0', true: '#FFEDD5' }}
              thumbColor={isOpen ? '#FF7622' : '#94A3B8'}
            />
          </View>
        </View>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <TouchableOpacity style={styles.menuItem} onPress={goToEditProfile}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="create-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.menuText}>Edit Shop Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate('AdminReport', { shopId: shopId })
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="stats-chart" size={20} color="#16A34A" />
              </View>
              <Text style={styles.menuText}>Sales report</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert('Coming Soon', 'Financial system under development')
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="wallet-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.menuText}>Financial & Accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert('Coming Soon', 'Marketing tools under development')
            }
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="megaphone-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.menuText}>Marketing Tools</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  scrollContent: { padding: 20 },
  profileCard: { alignItems: 'center', marginBottom: 25 },
  shopImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  shopImage: { width: '100%', height: '100%' },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  shopDesc: { fontSize: 14, color: '#64748B' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 10,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: { fontSize: 16, color: '#334155', fontWeight: '500' },
});
