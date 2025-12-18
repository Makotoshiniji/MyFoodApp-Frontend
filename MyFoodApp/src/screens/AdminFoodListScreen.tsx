// // // import React, { useState, useCallback, useMemo } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   Image,
// // //   TouchableOpacity,
// // //   FlatList,
// // //   ActivityIndicator,
// // //   TextInput,
// // //   RefreshControl,
// // // } from 'react-native';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import api, { API_BASE } from '../api/client';
// // // import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// // // export default function AdminFoodListScreen({ route, navigation }: any) {
// // //   const { shopId } = route.params || {};

// // //   const [items, setItems] = useState<any[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [activeType, setActiveType] = useState<string>('All');
// // //   const [searchText, setSearchText] = useState('');

// // //   // 1. ฟังก์ชันดึงข้อมูลอาหาร
// // //   const fetchFood = async () => {
// // //     if (!shopId) return;
// // //     setLoading(true);
// // //     try {
// // //       const res = await api.get(`/shops/${shopId}/menuitems`);
// // //       setItems(res.data);
// // //     } catch (err) {
// // //       console.error('Load food error:', err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       fetchFood();
// // //     }, [shopId]),
// // //   );

// // //   // 2. แยกประเภทอาหาร
// // //   const categories = useMemo(() => {
// // //     const allTypes = items
// // //       .map(i => i.type || 'General')
// // //       .filter((value, index, self) => self.indexOf(value) === index);
// // //     return ['All', ...allTypes.sort()];
// // //   }, [items]);

// // //   // 3. กรองข้อมูล
// // //   const filteredItems = useMemo(() => {
// // //     let result = items;
// // //     if (activeType !== 'All') {
// // //       result = result.filter(i => (i.type || 'General') === activeType);
// // //     }
// // //     if (searchText) {
// // //       result = result.filter(i =>
// // //         i.name.toLowerCase().includes(searchText.toLowerCase()),
// // //       );
// // //     }
// // //     return result;
// // //   }, [items, activeType, searchText]);

// // //   // --- Render Item ---
// // //   const renderFoodItem = ({ item }: { item: any }) => {
// // //     // 🟢 สร้าง URL รูปภาพเองตามโครงสร้างที่คุณกำหนด
// // //     // Path: /shop_uploads/menu/{shop_id}/{shopid}_{menu_items_id}.png
// // //     const host = API_BASE.replace('/api', ''); // ตัด /api ออกเพื่อเอาแค่ base url
// // //     const manualImgUrl = `${host}/shop_uploads/menu/${shopId}/${shopId}_${item.id}.png`;

// // //     return (
// // //       <TouchableOpacity
// // //         style={styles.foodCard}
// // //         onPress={() =>
// // //           navigation.navigate('AdminFoodDetail', {
// // //             menuItemId: item.id,
// // //             shopId: shopId,
// // //           })
// // //         }
// // //       >
// // //         <Image
// // //           source={{ uri: manualImgUrl }}
// // //           defaultSource={require('../../assets/images/CATAGORY_ICON_BURGERS.png')}
// // //           style={styles.foodImg}
// // //           resizeMode="cover"
// // //         />

// // //         <View style={styles.foodInfo}>
// // //           <View style={{ paddingRight: 30 }}>
// // //             <Text style={styles.foodName} numberOfLines={1}>
// // //               {item.name}
// // //             </Text>
// // //             <Text style={styles.foodType}>{item.type || 'General'}</Text>
// // //           </View>
// // //           <Text style={styles.foodPrice}>฿{item.price.toLocaleString()}</Text>
// // //         </View>

// // //         <View style={styles.editIcon}>
// // //           <Text style={{ fontSize: 20, color: '#9CA3AF' }}>⋮</Text>
// // //         </View>
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   const renderCategoryItem = ({ item }: { item: string }) => {
// // //     const isActive = activeType === item;
// // //     return (
// // //       <TouchableOpacity
// // //         style={[styles.catPill, isActive && styles.catPillActive]}
// // //         onPress={() => setActiveType(item)}
// // //       >
// // //         <Text style={[styles.catText, isActive && styles.catTextActive]}>
// // //           {item}
// // //         </Text>
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       <View style={styles.header}>
// // //         <Text style={styles.title}>My Food List</Text>
// // //         <TouchableOpacity
// // //           style={styles.addBtn}
// // //           onPress={() => navigation.navigate('AdminNewFood', { shopId })}
// // //         >
// // //           <Text style={styles.addBtnText}>+ Add New</Text>
// // //         </TouchableOpacity>
// // //       </View>

// // //       <View style={styles.searchContainer}>
// // //         {/* 🟢 เปลี่ยนเป็นใช้ Image จาก Assets */}
// // //         <Image
// // //           source={require('../../assets/images/search_icon.png')}
// // //           style={{
// // //             width: 24,
// // //             height: 24,
// // //             marginRight: 10,
// // //             tintColor: '#9CA3AF',
// // //           }}
// // //           resizeMode="contain"
// // //         />

// // //         <TextInput
// // //           style={styles.searchInput}
// // //           placeholder="Search food name..."
// // //           value={searchText}
// // //           onChangeText={setSearchText}
// // //         />
// // //       </View>

// // //       <View style={styles.catContainer}>
// // //         <FlatList
// // //           data={categories}
// // //           renderItem={renderCategoryItem}
// // //           keyExtractor={item => item}
// // //           horizontal
// // //           showsHorizontalScrollIndicator={false}
// // //           contentContainerStyle={{ paddingHorizontal: 20 }}
// // //         />
// // //       </View>

// // //       {loading ? (
// // //         <ActivityIndicator
// // //           size="large"
// // //           color="#FF7622"
// // //           style={{ marginTop: 50 }}
// // //         />
// // //       ) : (
// // //         <FlatList
// // //           data={filteredItems}
// // //           renderItem={renderFoodItem}
// // //           keyExtractor={item => item.id.toString()}
// // //           contentContainerStyle={styles.listContent}
// // //           refreshControl={
// // //             <RefreshControl refreshing={loading} onRefresh={fetchFood} />
// // //           }
// // //           ListEmptyComponent={
// // //             <View style={styles.emptyView}>
// // //               <Text style={{ color: '#999' }}>No food items found.</Text>
// // //             </View>
// // //           }
// // //         />
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: '#F8F9FB' },

// // //   header: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 24,
// // //     paddingTop: 60,
// // //     paddingBottom: 20,
// // //     backgroundColor: '#fff',
// // //   },
// // //   title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
// // //   addBtn: {
// // //     backgroundColor: '#FF7622',
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 8,
// // //     borderRadius: 8,
// // //   },
// // //   addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

// // //   searchContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#fff',
// // //     marginHorizontal: 24,
// // //     marginBottom: 15,
// // //     paddingHorizontal: 15,
// // //     height: 50,
// // //     borderRadius: 12,
// // //     elevation: 2,
// // //     shadowColor: '#000',
// // //     shadowOpacity: 0.05,
// // //   },
// // //   searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },

// // //   catContainer: { marginBottom: 15 },
// // //   catPill: {
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 8,
// // //     borderRadius: 20,
// // //     backgroundColor: '#fff',
// // //     marginRight: 10,
// // //     borderWidth: 1,
// // //     borderColor: '#E2E8F0',
// // //   },
// // //   catPillActive: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
// // //   catText: { color: '#64748B', fontWeight: '600' },
// // //   catTextActive: { color: '#fff' },

// // //   listContent: { paddingHorizontal: 24, paddingBottom: 100 },

// // //   foodCard: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#fff',
// // //     borderRadius: 16,
// // //     padding: 12,
// // //     marginBottom: 15,
// // //     elevation: 3,
// // //     shadowColor: '#000',
// // //     shadowOpacity: 0.05,
// // //     shadowOffset: { width: 0, height: 2 },
// // //     position: 'relative',
// // //   },
// // //   foodImg: {
// // //     width: 80,
// // //     height: 80,
// // //     borderRadius: 12,
// // //     backgroundColor: '#F1F5F9',
// // //   },

// // //   foodInfo: {
// // //     flex: 1,
// // //     marginLeft: 15,
// // //     justifyContent: 'center',
// // //     height: 80,
// // //   },
// // //   foodName: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#1E293B',
// // //     marginBottom: 4,
// // //   },
// // //   foodType: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
// // //   foodPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },

// // //   editIcon: {
// // //     position: 'absolute',
// // //     top: 10,
// // //     right: 10,
// // //     padding: 5,
// // //   },

// // //   emptyView: { alignItems: 'center', marginTop: 50 },
// // // });
// // import React, { useState, useCallback, useMemo } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   Image,
// //   TouchableOpacity,
// //   FlatList,
// //   ActivityIndicator,
// //   TextInput,
// //   RefreshControl,
// // } from 'react-native';
// // import { useFocusEffect } from '@react-navigation/native';
// // import api, { API_BASE } from '../api/client';
// // import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// // // Helper แปลงรูป
// // const toAbsolute = (p?: string | null) => {
// //   if (!p) return null;
// //   if (/^https?:\/\//i.test(p)) return p;
// //   const host = API_BASE.replace('/api', '');
// //   return `${host}${p.startsWith('/') ? '' : '/'}${p}`;
// // };

// // export default function AdminFoodListScreen({ route, navigation }: any) {
// //   // รับ shopId ที่ส่งมาจาก MainAdminShopScreen
// //   const { shopId } = route.params || {};

// //   const [items, setItems] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeType, setActiveType] = useState<string>('All');
// //   const [searchText, setSearchText] = useState('');

// //   // 1. ฟังก์ชันดึงข้อมูลอาหาร
// //   const fetchFood = async () => {
// //     if (!shopId) return;
// //     setLoading(true);
// //     try {
// //       const res = await api.get(`/shops/${shopId}/menuitems`);
// //       setItems(res.data);
// //     } catch (err) {
// //       console.error('Load food error:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       fetchFood();
// //     }, [shopId]),
// //   );

// //   // 2. แยกประเภทอาหาร
// //   const categories = useMemo(() => {
// //     const allTypes = items
// //       .map(i => i.type || 'General')
// //       .filter((value, index, self) => self.indexOf(value) === index);
// //     return ['All', ...allTypes.sort()];
// //   }, [items]);

// //   // 3. กรองข้อมูล
// //   const filteredItems = useMemo(() => {
// //     let result = items;
// //     if (activeType !== 'All') {
// //       result = result.filter(i => (i.type || 'General') === activeType);
// //     }
// //     if (searchText) {
// //       result = result.filter(i =>
// //         i.name.toLowerCase().includes(searchText.toLowerCase()),
// //       );
// //     }
// //     return result;
// //   }, [items, activeType, searchText]);

// //   // --- Render Item ---
// //   // --- Render Item ---
// //   const renderFoodItem = ({ item }: { item: any }) => {
// //     // ✅ 1. ใช้ URL จริงจาก Database (มันจะรู้นามสกุลไฟล์ที่ถูกต้อง เช่น .jpg หรือ .png)
// //     const imgUrl = toAbsolute(item.mainPhotoUrl);

// //     // 🔍 ลอง Log ดูค่าที่ได้ (เอาไว้เช็คถ้ายังไม่ขึ้น)
// //     // console.log("Image URL:", imgUrl);

// //     return (
// //       <TouchableOpacity
// //         style={styles.foodCard}
// //         onPress={() =>
// //           navigation.navigate('AdminFoodDetail', {
// //             menuItemId: item.id,
// //             shopId: shopId,
// //           })
// //         }
// //       >
// //         <Image
// //           source={
// //             // ✅ 2. เช็คว่ามี URL ไหม ถ้ามีให้ใช้ ถ้าไม่มีให้ใช้รูป Placeholder
// //             imgUrl
// //               ? { uri: imgUrl }
// //               : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
// //           }
// //           style={styles.foodImg}
// //           resizeMode="cover"
// //         />

// //         <View style={styles.foodInfo}>
// //           <View style={{ paddingRight: 30 }}>
// //             <Text style={styles.foodName} numberOfLines={1}>
// //               {item.name}
// //             </Text>
// //             <Text style={styles.foodType}>{item.type || 'General'}</Text>
// //           </View>
// //           <Text style={styles.foodPrice}>฿{item.price.toLocaleString()}</Text>
// //         </View>

// //         <View style={styles.editIcon}>
// //           <MaterialCommunityIcons
// //             name="dots-vertical"
// //             size={24}
// //             color="#9CA3AF"
// //           />
// //         </View>
// //       </TouchableOpacity>
// //     );
// //   };

// //   const renderCategoryItem = ({ item }: { item: string }) => {
// //     const isActive = activeType === item;
// //     return (
// //       <TouchableOpacity
// //         style={[styles.catPill, isActive && styles.catPillActive]}
// //         onPress={() => setActiveType(item)}
// //       >
// //         <Text style={[styles.catText, isActive && styles.catTextActive]}>
// //           {item}
// //         </Text>
// //       </TouchableOpacity>
// //     );
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <Text style={styles.title}>Menu Management</Text>

// //         {/* 🟢 ปุ่ม Add New: กดแล้วไปหน้า AdminNewFood (Tab กลาง) */}
// //         <TouchableOpacity
// //           style={styles.addBtn}
// //           onPress={() => navigation.navigate('AdminNewFood', { shopId })}
// //         >
// //           <Text style={styles.addBtnText}>+ Add New</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.searchContainer}>
// //         <Image
// //           source={require('../../assets/images/search_icon.png')}
// //           style={{
// //             width: 24,
// //             height: 24,
// //             marginRight: 10,
// //             tintColor: '#9CA3AF',
// //           }}
// //           resizeMode="contain"
// //         />
// //         <TextInput
// //           style={styles.searchInput}
// //           placeholder="Search food name..."
// //           value={searchText}
// //           onChangeText={setSearchText}
// //         />
// //       </View>

// //       <View style={styles.catContainer}>
// //         <FlatList
// //           data={categories}
// //           renderItem={renderCategoryItem}
// //           keyExtractor={item => item}
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           contentContainerStyle={{ paddingHorizontal: 20 }}
// //         />
// //       </View>

// //       {loading ? (
// //         <ActivityIndicator
// //           size="large"
// //           color="#FF7622"
// //           style={{ marginTop: 50 }}
// //         />
// //       ) : (
// //         <FlatList
// //           data={filteredItems}
// //           renderItem={renderFoodItem}
// //           keyExtractor={item => item.id.toString()}
// //           contentContainerStyle={styles.listContent}
// //           refreshControl={
// //             <RefreshControl refreshing={loading} onRefresh={fetchFood} />
// //           }
// //           ListEmptyComponent={
// //             <View style={styles.emptyView}>
// //               <Text style={{ color: '#999' }}>No food items found.</Text>
// //             </View>
// //           }
// //         />
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F8F9FB' },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 24,
// //     paddingTop: 60,
// //     paddingBottom: 20,
// //     backgroundColor: '#fff',
// //   },
// //   title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
// //   addBtn: {
// //     backgroundColor: '#FF7622',
// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //   },
// //   addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
// //   searchContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     marginHorizontal: 24,
// //     marginBottom: 15,
// //     paddingHorizontal: 15,
// //     height: 50,
// //     borderRadius: 12,
// //     elevation: 2,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.05,
// //   },
// //   searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
// //   catContainer: { marginBottom: 15 },
// //   catPill: {
// //     paddingHorizontal: 20,
// //     paddingVertical: 8,
// //     borderRadius: 20,
// //     backgroundColor: '#fff',
// //     marginRight: 10,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   catPillActive: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
// //   catText: { color: '#64748B', fontWeight: '600' },
// //   catTextActive: { color: '#fff' },
// //   listContent: { paddingHorizontal: 24, paddingBottom: 100 },
// //   foodCard: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     borderRadius: 16,
// //     padding: 12,
// //     marginBottom: 15,
// //     elevation: 3,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.05,
// //     shadowOffset: { width: 0, height: 2 },
// //     position: 'relative',
// //   },
// //   foodImg: {
// //     width: 80,
// //     height: 80,
// //     borderRadius: 12,
// //     backgroundColor: '#F1F5F9',
// //   },
// //   foodInfo: {
// //     flex: 1,
// //     marginLeft: 15,
// //     justifyContent: 'center',
// //     height: 80,
// //   },
// //   foodName: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#1E293B',
// //     marginBottom: 4,
// //   },
// //   foodType: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
// //   foodPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },
// //   editIcon: {
// //     position: 'absolute',
// //     top: 10,
// //     right: 10,
// //     padding: 5,
// //   },
// //   emptyView: { alignItems: 'center', marginTop: 50 },
// // });
// // src/screens/AdminFoodListScreen.tsx
// // import React, { useState, useCallback, useMemo } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   Image,
// //   TouchableOpacity,
// //   FlatList,
// //   ActivityIndicator,
// //   TextInput,
// //   RefreshControl,
// // } from 'react-native';
// // import { useFocusEffect } from '@react-navigation/native';
// // import api, { API_BASE } from '../api/client';
// // import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// // export default function AdminFoodListScreen({ route, navigation }: any) {
// //   // shopId มาจาก MainAdminShopScreen
// //   const { shopId } = route.params || {};

// //   const [items, setItems] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeType, setActiveType] = useState<string>('All');
// //   const [searchText, setSearchText] = useState('');

// //   // 1. ฟังก์ชันดึงข้อมูลอาหาร
// //   const fetchFood = async () => {
// //     if (!shopId) return;
// //     setLoading(true);
// //     try {
// //       const res = await api.get(`/shops/${shopId}/menuitems`);
// //       setItems(res.data);
// //     } catch (err) {
// //       console.error('Load food error:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       fetchFood();
// //     }, [shopId]),
// //   );

// //   // 2. แยกประเภทอาหาร
// //   const categories = useMemo(() => {
// //     const allTypes = items
// //       .map(i => i.type || 'General')
// //       .filter((value, index, self) => self.indexOf(value) === index);
// //     return ['All', ...allTypes.sort()];
// //   }, [items]);

// //   // 3. กรองข้อมูล
// //   const filteredItems = useMemo(() => {
// //     let result = items;
// //     if (activeType !== 'All') {
// //       result = result.filter(i => (i.type || 'General') === activeType);
// //     }
// //     if (searchText) {
// //       result = result.filter(i =>
// //         i.name.toLowerCase().includes(searchText.toLowerCase()),
// //       );
// //     }
// //     return result;
// //   }, [items, activeType, searchText]);

// //   // ⭐️ 4. ฟังก์ชันสร้าง URL รูปภาพ (Logic เดียวกับ FoodDetailScreen)
// //   const getImageUrl = (item: any) => {
// //     // Database อาจเก็บในชื่อ imageUrl หรือ mainPhotoUrl
// //     let path = item.imageUrl || item.mainPhotoUrl;

// //     if (!path) return null;

// //     // ถ้าเป็น http อยู่แล้ว ใช้เลย
// //     if (path.startsWith('http')) return path;

// //     // แก้ Backslash (\) เป็น (/)
// //     path = path.replace(/\\/g, '/');

// //     // ถ้ามาแค่ชื่อไฟล์ (ไม่มี /) ให้แทรก shop_uploads/{shopId}/
// //     if (!path.includes('/')) {
// //       path = `/shop_uploads/${shopId}/${path}`;
// //     }
// //     // ถ้ามี Path มาบ้างแล้ว แต่ยังไม่มี shop_uploads
// //     else {
// //       if (!path.startsWith('/')) path = '/' + path;
// //       if (!path.includes('/shop_uploads')) {
// //         path = '/shop_uploads' + path;
// //       }
// //     }

// //     // ต่อ Base URL
// //     const host = api.defaults.baseURL
// //       ? api.defaults.baseURL.replace(/\/api\/?$/, '')
// //       : 'http://10.0.2.2:7284';

// //     return `${host}${path}`;
// //   };

// //   // --- Render Item ---
// //   const renderFoodItem = ({ item }: { item: any }) => {
// //     const imgUrl = getImageUrl(item); // ✅ เรียกใช้ฟังก์ชันที่แก้ใหม่

// //     return (
// //       <TouchableOpacity
// //         style={styles.foodCard}
// //         onPress={() =>
// //           // ✅ ต้องแน่ใจว่า AdminFoodDetail ถูกลงทะเบียนใน App.tsx แล้ว
// //           navigation.navigate('AdminFoodDetail', {
// //             menuItemId: item.id,
// //             shopId: shopId,
// //           })
// //         }
// //       >
// //         <Image
// //           source={
// //             imgUrl
// //               ? { uri: imgUrl }
// //               : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
// //           }
// //           style={styles.foodImg}
// //           resizeMode="cover"
// //         />

// //         <View style={styles.foodInfo}>
// //           <View style={{ paddingRight: 30 }}>
// //             <Text style={styles.foodName} numberOfLines={1}>
// //               {item.name}
// //             </Text>
// //             <Text style={styles.foodType}>{item.type || 'General'}</Text>
// //           </View>
// //           <Text style={styles.foodPrice}>฿{item.price.toLocaleString()}</Text>
// //         </View>

// //         <View style={styles.editIcon}>
// //           <MaterialCommunityIcons
// //             name="dots-vertical"
// //             size={24}
// //             color="#9CA3AF"
// //           />
// //         </View>
// //       </TouchableOpacity>
// //     );
// //   };

// //   const renderCategoryItem = ({ item }: { item: string }) => {
// //     const isActive = activeType === item;
// //     return (
// //       <TouchableOpacity
// //         style={[styles.catPill, isActive && styles.catPillActive]}
// //         onPress={() => setActiveType(item)}
// //       >
// //         <Text style={[styles.catText, isActive && styles.catTextActive]}>
// //           {item}
// //         </Text>
// //       </TouchableOpacity>
// //     );
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <Text style={styles.title}>Menu Management</Text>

// //         <TouchableOpacity
// //           style={styles.addBtn}
// //           onPress={() => navigation.navigate('AdminNewFood', { shopId })}
// //         >
// //           <Text style={styles.addBtnText}>+ Add New</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.searchContainer}>
// //         <Image
// //           source={require('../../assets/images/search_icon.png')}
// //           style={{
// //             width: 24,
// //             height: 24,
// //             marginRight: 10,
// //             tintColor: '#9CA3AF',
// //           }}
// //           resizeMode="contain"
// //         />
// //         <TextInput
// //           style={styles.searchInput}
// //           placeholder="Search food name..."
// //           value={searchText}
// //           onChangeText={setSearchText}
// //         />
// //       </View>

// //       <View style={styles.catContainer}>
// //         <FlatList
// //           data={categories}
// //           renderItem={renderCategoryItem}
// //           keyExtractor={item => item}
// //           horizontal
// //           showsHorizontalScrollIndicator={false}
// //           contentContainerStyle={{ paddingHorizontal: 20 }}
// //         />
// //       </View>

// //       {loading ? (
// //         <ActivityIndicator
// //           size="large"
// //           color="#FF7622"
// //           style={{ marginTop: 50 }}
// //         />
// //       ) : (
// //         <FlatList
// //           data={filteredItems}
// //           renderItem={renderFoodItem}
// //           keyExtractor={item => item.id.toString()}
// //           contentContainerStyle={styles.listContent}
// //           refreshControl={
// //             <RefreshControl refreshing={loading} onRefresh={fetchFood} />
// //           }
// //           ListEmptyComponent={
// //             <View style={styles.emptyView}>
// //               <Text style={{ color: '#999' }}>No food items found.</Text>
// //             </View>
// //           }
// //         />
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F8F9FB' },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingHorizontal: 24,
// //     paddingTop: 60,
// //     paddingBottom: 20,
// //     backgroundColor: '#fff',
// //   },
// //   title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
// //   addBtn: {
// //     backgroundColor: '#FF7622',
// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     borderRadius: 8,
// //   },
// //   addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
// //   searchContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     marginHorizontal: 24,
// //     marginBottom: 15,
// //     paddingHorizontal: 15,
// //     height: 50,
// //     borderRadius: 12,
// //     elevation: 2,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.05,
// //   },
// //   searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
// //   catContainer: { marginBottom: 15 },
// //   catPill: {
// //     paddingHorizontal: 20,
// //     paddingVertical: 8,
// //     borderRadius: 20,
// //     backgroundColor: '#fff',
// //     marginRight: 10,
// //     borderWidth: 1,
// //     borderColor: '#E2E8F0',
// //   },
// //   catPillActive: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
// //   catText: { color: '#64748B', fontWeight: '600' },
// //   catTextActive: { color: '#fff' },
// //   listContent: { paddingHorizontal: 24, paddingBottom: 100 },
// //   foodCard: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     borderRadius: 16,
// //     padding: 12,
// //     marginBottom: 15,
// //     elevation: 3,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.05,
// //     shadowOffset: { width: 0, height: 2 },
// //     position: 'relative',
// //   },
// //   foodImg: {
// //     width: 80,
// //     height: 80,
// //     borderRadius: 12,
// //     backgroundColor: '#F1F5F9',
// //   },
// //   foodInfo: {
// //     flex: 1,
// //     marginLeft: 15,
// //     justifyContent: 'center',
// //     height: 80,
// //   },
// //   foodName: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#1E293B',
// //     marginBottom: 4,
// //   },
// //   foodType: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
// //   foodPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },
// //   editIcon: {
// //     position: 'absolute',
// //     top: 10,
// //     right: 10,
// //     padding: 5,
// //   },
// //   emptyView: { alignItems: 'center', marginTop: 50 },
// // });

// import React, { useState, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   TextInput,
//   RefreshControl,
// } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import api, { API_BASE } from '../api/client';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// export default function AdminFoodListScreen({ route, navigation }: any) {
//   // shopId มาจาก MainAdminShopScreen
//   const { shopId } = route.params || {};

//   const [items, setItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeType, setActiveType] = useState<string>('All');
//   const [searchText, setSearchText] = useState('');

//   // 1. ฟังก์ชันดึงข้อมูลอาหาร
//   const fetchFood = async () => {
//     if (!shopId) return;
//     setLoading(true);
//     try {
//       const res = await api.get(`/shops/${shopId}/menuitems`);
//       setItems(res.data);
//     } catch (err) {
//       console.error('Load food error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchFood();
//     }, [shopId]),
//   );

//   // 2. แยกประเภทอาหาร
//   const categories = useMemo(() => {
//     const allTypes = items
//       .map(i => i.type || 'General')
//       .filter((value, index, self) => self.indexOf(value) === index);
//     return ['All', ...allTypes.sort()];
//   }, [items]);

//   // 3. กรองข้อมูล
//   const filteredItems = useMemo(() => {
//     let result = items;
//     if (activeType !== 'All') {
//       result = result.filter(i => (i.type || 'General') === activeType);
//     }
//     if (searchText) {
//       result = result.filter(i =>
//         i.name.toLowerCase().includes(searchText.toLowerCase()),
//       );
//     }
//     return result;
//   }, [items, activeType, searchText]);

//   // ⭐️ 4. ฟังก์ชันสร้าง URL รูปภาพ (แก้ไขให้เหมือน ShopDetailScreen ที่ทำงานได้)
//   const getImageUrl = (item: any) => {
//     // Database อาจเก็บในชื่อ imageUrl หรือ mainPhotoUrl
//     let path = item.imageUrl || item.mainPhotoUrl;

//     if (!path) return null;

//     // ถ้าเป็น http อยู่แล้ว ใช้เลย
//     if (path.startsWith('http')) return path;

//     // แก้ Backslash (\) เป็น (/)
//     path = path.replace(/\\/g, '/');

//     // ถ้ามาแค่ชื่อไฟล์ (ไม่มี /) ให้เติม path เป็น /shop_uploads/menuitems/
//     // (อ้างอิงจาก ShopDetailScreen ที่ทำงานได้ถูกต้อง)
//     if (!path.includes('/')) {
//       path = `/shop_uploads/menuitems/${path}`;
//     } else {
//       // ถ้ามี Path มาบ้างแล้ว แต่ยังไม่มี shop_uploads
//       if (!path.startsWith('/')) path = '/' + path;
//       if (!path.includes('/shop_uploads')) {
//         path = '/shop_uploads' + path;
//       }
//     }

//     // ต่อ Base URL
//     const host = api.defaults.baseURL
//       ? api.defaults.baseURL.replace(/\/api\/?$/, '')
//       : 'http://10.0.2.2:7284';

//     return `${host}${path}`;
//   };

//   // --- Render Item ---
//   const renderFoodItem = ({ item }: { item: any }) => {
//     const imgUrl = getImageUrl(item); // ✅ เรียกใช้ฟังก์ชันที่แก้ใหม่

//     return (
//       <TouchableOpacity
//         style={styles.foodCard}
//         onPress={() =>
//           // 🟢 แก้ไข: กดแล้วไปหน้า AdminFoodEdit พร้อมส่ง menuItemId และ shopId
//           navigation.navigate('AdminFoodEdit', {
//             menuItemId: item.id,
//             shopId: shopId,
//           })
//         }
//       >
//         <Image
//           source={
//             imgUrl
//               ? { uri: imgUrl }
//               : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
//           }
//           style={styles.foodImg}
//           resizeMode="cover"
//         />

//         <View style={styles.foodInfo}>
//           <View style={{ paddingRight: 30 }}>
//             <Text style={styles.foodName} numberOfLines={1}>
//               {item.name}
//             </Text>
//             <Text style={styles.foodType}>{item.type || 'General'}</Text>
//           </View>
//           <Text style={styles.foodPrice}>฿{item.price.toLocaleString()}</Text>

//           {/* แสดงสถานะสินค้า (ถ้าปิดการขายอยู่) */}
//           {item.isAvailable === false && (
//             <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
//               Out of Stock
//             </Text>
//           )}
//         </View>

//         <View style={styles.editIcon}>
//           {/* เปลี่ยนไอคอนเป็นดินสอสื่อถึงการแก้ไข */}
//           <MaterialCommunityIcons name="pencil" size={20} color="#9CA3AF" />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderCategoryItem = ({ item }: { item: string }) => {
//     const isActive = activeType === item;
//     return (
//       <TouchableOpacity
//         style={[styles.catPill, isActive && styles.catPillActive]}
//         onPress={() => setActiveType(item)}
//       >
//         <Text style={[styles.catText, isActive && styles.catTextActive]}>
//           {item}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Menu Management</Text>

//         <TouchableOpacity
//           style={styles.addBtn}
//           onPress={() => navigation.navigate('AdminNewFood', { shopId })}
//         >
//           <Text style={styles.addBtnText}>+ Add New</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchContainer}>
//         <Image
//           source={require('../../assets/images/search_icon.png')}
//           style={{
//             width: 24,
//             height: 24,
//             marginRight: 10,
//             tintColor: '#9CA3AF',
//           }}
//           resizeMode="contain"
//         />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search food name..."
//           value={searchText}
//           onChangeText={setSearchText}
//         />
//       </View>

//       <View style={styles.catContainer}>
//         <FlatList
//           data={categories}
//           renderItem={renderCategoryItem}
//           keyExtractor={item => item}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 20 }}
//         />
//       </View>

//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#FF7622"
//           style={{ marginTop: 50 }}
//         />
//       ) : (
//         <FlatList
//           data={filteredItems}
//           renderItem={renderFoodItem}
//           keyExtractor={item => item.id.toString()}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl refreshing={loading} onRefresh={fetchFood} />
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyView}>
//               <Text style={{ color: '#999' }}>No food items found.</Text>
//             </View>
//           }
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FB' },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 60,
//     paddingBottom: 20,
//     backgroundColor: '#fff',
//   },
//   title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
//   addBtn: {
//     backgroundColor: '#FF7622',
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     marginHorizontal: 24,
//     marginBottom: 15,
//     paddingHorizontal: 15,
//     height: 50,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//   },
//   searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
//   catContainer: { marginBottom: 15 },
//   catPill: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#fff',
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   catPillActive: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
//   catText: { color: '#64748B', fontWeight: '600' },
//   catTextActive: { color: '#fff' },
//   listContent: { paddingHorizontal: 24, paddingBottom: 100 },
//   foodCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 12,
//     marginBottom: 15,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     position: 'relative',
//   },
//   foodImg: {
//     width: 80,
//     height: 80,
//     borderRadius: 12,
//     backgroundColor: '#F1F5F9',
//   },
//   foodInfo: {
//     flex: 1,
//     marginLeft: 15,
//     justifyContent: 'center',
//     height: 80,
//   },
//   foodName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#1E293B',
//     marginBottom: 4,
//   },
//   foodType: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
//   foodPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },
//   editIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     padding: 5,
//   },
//   emptyView: { alignItems: 'center', marginTop: 50 },
// });
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { API_BASE } from '../api/client';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AdminFoodListScreen({ route, navigation }: any) {
  // shopId มาจาก MainAdminShopScreen
  const { shopId } = route.params || {};

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('All');
  const [searchText, setSearchText] = useState('');

  // 1. ฟังก์ชันดึงข้อมูลอาหาร
  const fetchFood = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const res = await api.get(`/shops/${shopId}/menuitems`);
      setItems(res.data);
    } catch (err) {
      console.error('Load food error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFood();
    }, [shopId]),
  );

  // 2. แยกประเภทอาหาร
  const categories = useMemo(() => {
    const allTypes = items
      .map(i => i.type || 'General')
      .filter((value, index, self) => self.indexOf(value) === index);
    return ['All', ...allTypes.sort()];
  }, [items]);

  // 3. กรองข้อมูล
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeType !== 'All') {
      result = result.filter(i => (i.type || 'General') === activeType);
    }
    if (searchText) {
      result = result.filter(i =>
        i.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return result;
  }, [items, activeType, searchText]);

  // ⭐️ 4. ฟังก์ชันสร้าง URL รูปภาพ (เหมือน ShopDetailScreen)
  const getImageUrl = (item: any) => {
    let path = item.imageUrl || item.mainPhotoUrl;

    if (!path) return null;

    if (path.startsWith('http')) return path;

    path = path.replace(/\\/g, '/');

    if (!path.includes('/')) {
      path = `/shop_uploads/menuitems/${path}`;
    } else {
      if (!path.startsWith('/')) path = '/' + path;
      if (!path.includes('/shop_uploads')) {
        path = '/shop_uploads' + path;
      }
    }

    const host = api.defaults.baseURL
      ? api.defaults.baseURL.replace(/\/api\/?$/, '')
      : 'http://10.0.2.2:7284';

    return `${host}${path}`;
  };

  // --- Render Item ---
  const renderFoodItem = ({ item }: { item: any }) => {
    const imgUrl = getImageUrl(item);

    return (
      <TouchableOpacity
        style={styles.foodCard}
        onPress={() =>
          navigation.navigate('AdminFoodEdit', {
            menuItemId: item.id,
            shopId: shopId,
          })
        }
      >
        <Image
          source={
            imgUrl
              ? { uri: imgUrl }
              : require('../../assets/images/CATAGORY_ICON_BURGERS.png')
          }
          style={styles.foodImg}
          resizeMode="cover"
        />

        <View style={styles.foodInfo}>
          <View style={{ paddingRight: 30 }}>
            <Text style={styles.foodName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.foodType}>{item.type || 'General'}</Text>
          </View>
          <Text style={styles.foodPrice}>฿{item.price.toLocaleString()}</Text>

          {item.isAvailable === false && (
            <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              Out of Stock
            </Text>
          )}
        </View>

        <View style={styles.editIcon}>
          {/* 🟢 เปลี่ยนเป็นใช้รูป edit_icon.png */}
          <Image
            source={require('../../assets/images/edit_icon.png')}
            style={{ width: 24, height: 24, tintColor: '#9CA3AF' }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }: { item: string }) => {
    const isActive = activeType === item;
    return (
      <TouchableOpacity
        style={[styles.catPill, isActive && styles.catPillActive]}
        onPress={() => setActiveType(item)}
      >
        <Text style={[styles.catText, isActive && styles.catTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Management</Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminNewFood', { shopId })}
        >
          <Text style={styles.addBtnText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Image
          source={require('../../assets/images/search_icon.png')}
          style={{
            width: 24,
            height: 24,
            marginRight: 10,
            tintColor: '#9CA3AF',
          }}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search food name..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.catContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#FF7622"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchFood} />
          }
          ListEmptyComponent={
            <View style={styles.emptyView}>
              <Text style={{ color: '#999' }}>No food items found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  addBtn: {
    backgroundColor: '#FF7622',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  catContainer: { marginBottom: 15 },
  catPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: { backgroundColor: '#FF7622', borderColor: '#FF7622' },
  catText: { color: '#64748B', fontWeight: '600' },
  catTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  foodImg: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  foodInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    height: 80,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  foodType: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  foodPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },
  editIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  emptyView: { alignItems: 'center', marginTop: 50 },
});
