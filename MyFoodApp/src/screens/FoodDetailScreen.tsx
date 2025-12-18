// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../api/client';

// // ---------- types ----------
// type MenuOption = {
//   id: number;
//   name: string;
//   extraPrice: number;
//   isDefault: boolean;
// };

// type MenuOptionGroup = {
//   id: number;
//   name: string;
//   isRequired: boolean;
//   minSelect: number;
//   maxSelect: number;
//   options: MenuOption[];
// };

// type MenuItemDetail = {
//   id: number;
//   shopId: number;
//   name: string;
//   description?: string | null;
//   price: number;
//   imageUrl?: string | null;
//   optionGroups: MenuOptionGroup[];
// };

// type Props = {
//   route: any;
//   navigation: any;
// };

// export default function FoodDetailScreen({ route, navigation }: Props) {
//   const { menuItemId, shop } = route.params;

//   const [detail, setDetail] = useState<MenuItemDetail | null>(null);
//   const [selected, setSelected] = useState<Record<number, number[]>>({});
//   const [qty, setQty] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userId, setUserId] = useState<number | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const BASE_URL = useMemo(
//     () =>
//       api.defaults.baseURL
//         ? api.defaults.baseURL.replace(/\/api\/?$/, '') // ✅ ตัด /api ทิ้ง
//         : 'http://10.0.2.2:7284',
//     [],
//   );

//   // ---------- โหลด userId จาก AsyncStorage ----------
//   useEffect(() => {
//     (async () => {
//       try {
//         const stored = await AsyncStorage.getItem('logged_in_user');
//         if (stored) {
//           const u = JSON.parse(stored);
//           setUserId(u.id);
//           console.log('loaded userId:', u.id);
//         }
//       } catch (err) {
//         console.warn('Failed to load logged_in_user', err);
//       }
//     })();
//   }, []);

//   // ---------- โหลดรายละเอียดเมนู ----------
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         setLoading(true);
//         const res = await api.get<MenuItemDetail>(
//           `/MenuItems/${menuItemId}/detail`,
//         );
//         if (!mounted) return;

//         setDetail(res.data);

//         // ตั้งค่า default selections
//         const init: Record<number, number[]> = {};
//         res.data.optionGroups.forEach(g => {
//           init[g.id] = g.options.filter(o => o.isDefault).map(o => o.id);
//         });
//         setSelected(init);
//       } catch (e: any) {
//         if (mounted) {
//           setError(
//             e?.response?.data?.toString() ??
//               e?.message ??
//               'เกิดข้อผิดพลาดในการโหลดเมนู',
//           );
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [menuItemId]);

//   // ---------- คำนวณราคา ----------
//   const calcTotal = () => {
//     if (!detail) return 0;
//     const base = detail.price;
//     const extra = detail.optionGroups.reduce((sum, g) => {
//       const ids = selected[g.id] ?? [];
//       const opts = g.options.filter(o => ids.includes(o.id));
//       return sum + opts.reduce((s, o) => s + o.extraPrice, 0);
//     }, 0);
//     return (base + extra) * qty;
//   };

//   const total = calcTotal();

//   console.log(
//     'Image URL being loaded:',
//     `${BASE_URL}${detail?.imageUrl?.startsWith('/') ? '' : '/'}${
//       detail?.imageUrl
//     }`,
//   );

//   // const menuImgSource = detail?.imageUrl
//   //   ? {
//   //       uri: `${BASE_URL}${detail.imageUrl.startsWith('/') ? '' : '/'}${
//   //         detail.imageUrl
//   //       }`,
//   //     }
//   //   : undefined;

//   // ค้นหาบรรทัดที่กำหนดค่า menuImgSource แล้วแก้เป็นแบบนี้:

//   const menuImgSource = useMemo(() => {
//     if (!detail?.imageUrl) return undefined;

//     // 1. เปลี่ยน Backslash (\) เป็น Forward Slash (/)
//     let cleanPath = detail.imageUrl.replace(/\\/g, '/');

//     // 2. ถ้าใน path ไม่มีคำว่า shop_uploads ให้เติมเข้าไป
//     // (สมมติว่าใน DB เก็บแค่ "menu/1.jpg" แต่ Server รอรับ "/shop_uploads/menu/1.jpg")
//     if (
//       !cleanPath.startsWith('shop_uploads') &&
//       !cleanPath.startsWith('/shop_uploads')
//     ) {
//       cleanPath = `/shop_uploads/${
//         cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath
//       }`;
//     }

//     // 3. ตรวจสอบว่าต้องมี / นำหน้าหรือไม่
//     if (!cleanPath.startsWith('/')) {
//       cleanPath = '/' + cleanPath;
//     }

//     // 4. ประกอบร่าง
//     const finalUrl = `${BASE_URL}${cleanPath}`;

//     console.log('Image URL:', finalUrl); // 🔍 ดู Log นี้ใน Terminal เพื่อเช็คความถูกต้อง

//     return { uri: finalUrl };
//   }, [detail, BASE_URL]);

//   // ---------- ฟังก์ชันเปลี่ยน option (ตรงนี้แหละ toggleOption 😉) ----------
//   const toggleOption = (group: MenuOptionGroup, option: MenuOption) => {
//     setSelected(prev => {
//       const current = prev[group.id] ?? [];

//       // ถ้ากดตัวที่เลือกอยู่แล้ว
//       if (current.includes(option.id)) {
//         // ถ้ากลุ่มนี้เป็นแบบบังคับ (ต้องมีอย่างน้อย 1) → ไม่ให้เอาออก
//         if (group.isRequired) {
//           return prev;
//         }
//         // ถ้าไม่บังคับ → เอาออกให้กลายเป็นไม่ได้เลือกอะไร
//         return { ...prev, [group.id]: [] };
//       }

//       // ถ้ากดตัวใหม่ → เซ็ตให้กลุ่มนี้มีแค่ option เดียว
//       return { ...prev, [group.id]: [option.id] };
//     });
//   };

//   // ---------- ยิง API เพิ่มลงตะกร้า ----------
//   const handleAddToCart = async () => {
//     if (!detail) return;

//     if (!userId) {
//       Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
//       return;
//     }

//     const optionsPayload = detail.optionGroups.flatMap(g => {
//       const ids = selected[g.id] ?? [];
//       return g.options
//         .filter(o => ids.includes(o.id))
//         .map(o => ({
//           optionName: o.name,
//           extraPrice: o.extraPrice,
//         }));
//     });

//     try {
//       setSubmitting(true);

//       console.log('POST /Cart userId =', userId, 'payload =', {
//         menuItemId: detail.id,
//         qty,
//         options: optionsPayload,
//       });

//       await api.post(`/Cart/${userId}/items`, {
//         menuItemId: detail.id,
//         qty,
//         options: optionsPayload,
//       });

//       Alert.alert('สำเร็จ', 'เพิ่มสินค้าในตะกร้าแล้ว');
//       // navigation.navigate("Cart");
//     } catch (err: any) {
//       console.log('add to cart error', err?.response?.data ?? err);
//       Alert.alert('ผิดพลาด', 'ไม่สามารถเพิ่มลงตะกร้าได้');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- render ----------
//   if (loading || !detail) {
//     return (
//       <View style={styles.center}>
//         {loading ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <Text>{error ?? 'ไม่พบข้อมูลเมนู'}</Text>
//         )}
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//         {/* hero image */}
//         {menuImgSource ? (
//           <Image source={menuImgSource} style={styles.heroImage} />
//         ) : (
//           <View style={[styles.heroImage, { backgroundColor: '#ddd' }]} />
//         )}

//         {/* card */}
//         <View style={styles.infoCard}>
//           <Text style={styles.foodName}>{detail.name}</Text>
//           {detail.description ? (
//             <Text style={styles.foodDesc}>{detail.description}</Text>
//           ) : null}
//           <Text style={styles.foodPrice}>
//             เริ่มต้น ฿ {detail.price.toFixed(2)}
//           </Text>

//           {shop?.name && (
//             <Text style={styles.shopName}>จากร้าน {shop.name}</Text>
//           )}
//         </View>

//         {/* option groups */}
//         <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
//           {detail.optionGroups.map(g => (
//             <View key={g.id} style={{ marginBottom: 16 }}>
//               <Text style={styles.sectionHeader}>
//                 {g.name}{' '}
//                 {g.isRequired && (
//                   <Text style={{ color: '#F97316', fontSize: 12 }}>
//                     *จำเป็น
//                   </Text>
//                 )}
//               </Text>

//               {g.options.map(o => {
//                 const isSelected = (selected[g.id] ?? []).includes(o.id);

//                 return (
//                   <TouchableOpacity
//                     key={o.id}
//                     style={[
//                       styles.optionRow,
//                       {
//                         borderColor: isSelected ? '#1BAF5D' : '#E5E7EB',
//                         backgroundColor: isSelected ? '#ECFDF3' : '#FFFFFF',
//                       },
//                     ]}
//                     activeOpacity={0.8}
//                     onPress={() => toggleOption(g, o)}
//                   >
//                     <View>
//                       <Text style={styles.optionName}>{o.name}</Text>
//                       {o.extraPrice !== 0 && (
//                         <Text style={styles.optionPrice}>
//                           {o.extraPrice > 0
//                             ? `+ ฿ ${o.extraPrice.toFixed(2)}`
//                             : `- ฿ ${Math.abs(o.extraPrice).toFixed(2)}`}
//                         </Text>
//                       )}
//                     </View>

//                     <View
//                       style={[
//                         styles.radioOuter,
//                         isSelected && styles.radioOuterActive,
//                       ]}
//                     >
//                       {isSelected && <View style={styles.radioInner} />}
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       {/* bottom bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.qtyRow}>
//           <TouchableOpacity
//             onPress={() => setQty(q => Math.max(1, q - 1))}
//             style={styles.qtyBtn}
//             disabled={qty <= 1}
//           >
//             <Text style={styles.qtyBtnText}>-</Text>
//           </TouchableOpacity>
//           <Text style={styles.qtyText}>{qty}</Text>
//           <TouchableOpacity
//             onPress={() => setQty(q => q + 1)}
//             style={styles.qtyBtn}
//           >
//             <Text style={styles.qtyBtnText}>+</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[styles.addBtn, submitting && { opacity: 0.6 }]}
//           onPress={handleAddToCart}
//           disabled={submitting}
//         >
//           <Text style={styles.addBtnText}>
//             {submitting
//               ? 'กำลังเพิ่ม...'
//               : `เพิ่มลงตะกร้า • ฿ ${total.toFixed(2)}`}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* back button */}
//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={{ color: '#172B4D', fontWeight: '700', fontSize: 16 }}>
//           ‹ Back
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ---------- styles ----------
// const styles = StyleSheet.create({
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   heroImage: {
//     width: '100%',
//     height: 220,
//     backgroundColor: '#ccc',
//   },
//   infoCard: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     marginTop: -24,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: -2 },
//     elevation: 4,
//   },
//   foodName: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#172B4D',
//   },
//   foodDesc: {
//     marginTop: 4,
//     color: '#6B7280',
//   },
//   foodPrice: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#172B4D',
//   },
//   shopName: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#7B8AA3',
//   },
//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#172B4D',
//     marginBottom: 8,
//   },
//   optionRow: {
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   optionName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   optionPrice: {
//     marginTop: 2,
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioOuterActive: {
//     borderColor: '#1BAF5D',
//   },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 999,
//     backgroundColor: '#1BAF5D',
//   },
//   bottomBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   qtyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   qtyBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   qtyBtnText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   qtyText: {
//     minWidth: 32,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   addBtn: {
//     flex: 1,
//     backgroundColor: '#1BAF5D',
//     borderRadius: 999,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addBtnText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 40,
//     left: 16,
//     padding: 4,
//   },
// });

// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../api/client';

// // ---------- types ----------
// type MenuOption = {
//   id: number;
//   name: string;
//   extraPrice: number;
//   isDefault: boolean;
// };

// type MenuOptionGroup = {
//   id: number;
//   name: string;
//   isRequired: boolean;
//   minSelect: number;
//   maxSelect: number;
//   options: MenuOption[];
// };

// type MenuItemDetail = {
//   id: number;
//   shopId: number;
//   name: string;
//   description?: string | null;
//   price: number;
//   imageUrl?: string | null;
//   optionGroups: MenuOptionGroup[];
// };

// type Props = {
//   route: any;
//   navigation: any;
// };

// export default function FoodDetailScreen({ route, navigation }: Props) {
//   const { menuItemId, shop } = route.params;

//   const [detail, setDetail] = useState<MenuItemDetail | null>(null);
//   const [selected, setSelected] = useState<Record<number, number[]>>({});
//   const [qty, setQty] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userId, setUserId] = useState<number | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const BASE_URL = useMemo(
//     () =>
//       api.defaults.baseURL
//         ? api.defaults.baseURL.replace(/\/api\/?$/, '') // ✅ ตัด /api ทิ้ง
//         : 'http://10.0.2.2:7284',
//     [],
//   );

//   // ---------- โหลด userId จาก AsyncStorage ----------
//   useEffect(() => {
//     (async () => {
//       try {
//         const stored = await AsyncStorage.getItem('logged_in_user');
//         if (stored) {
//           const u = JSON.parse(stored);
//           setUserId(u.id);
//         }
//       } catch (err) {
//         console.warn('Failed to load logged_in_user', err);
//       }
//     })();
//   }, []);

//   // ---------- โหลดรายละเอียดเมนู ----------
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         setLoading(true);
//         const res = await api.get<MenuItemDetail>(
//           `/MenuItems/${menuItemId}/detail`,
//         );
//         if (!mounted) return;

//         setDetail(res.data);

//         // ตั้งค่า default selections
//         const init: Record<number, number[]> = {};
//         res.data.optionGroups.forEach(g => {
//           init[g.id] = g.options.filter(o => o.isDefault).map(o => o.id);
//         });
//         setSelected(init);
//       } catch (e: any) {
//         if (mounted) {
//           setError(
//             e?.response?.data?.toString() ??
//               e?.message ??
//               'เกิดข้อผิดพลาดในการโหลดเมนู',
//           );
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [menuItemId]);

//   // ---------- คำนวณราคา ----------
//   const calcTotal = () => {
//     if (!detail) return 0;
//     const base = detail.price;
//     const extra = detail.optionGroups.reduce((sum, g) => {
//       const ids = selected[g.id] ?? [];
//       const opts = g.options.filter(o => ids.includes(o.id));
//       return sum + opts.reduce((s, o) => s + o.extraPrice, 0);
//     }, 0);
//     return (base + extra) * qty;
//   };

//   const total = calcTotal();

//   // ⭐️ แก้ไข Logic การดึงรูปภาพให้ครอบคลุมทุกกรณี (Robust Image Logic)
//   const menuImgSource = useMemo(() => {
//     if (!detail?.imageUrl) return undefined;

//     let path = detail.imageUrl;

//     // 1. ถ้าเป็น URL เต็ม (เช่น http://...) ใช้ได้เลย
//     if (path.startsWith('http')) {
//       return { uri: path };
//     }

//     // 2. แปลง Backslash (\) เป็น Forward Slash (/) แก้ปัญหา Path จาก Windows
//     path = path.replace(/\\/g, '/');

//     // 3. ทำให้แน่ใจว่าขึ้นต้นด้วย /
//     if (!path.startsWith('/')) {
//       path = '/' + path;
//     }

//     // 4. เช็คว่ามีคำว่า shop_uploads หรือยัง? ถ้าไม่มี ให้เติมเข้าไป
//     // (เพราะ Server เปิดให้เข้าถึงรูปผ่าน path /shop_uploads)
//     if (!path.includes('/shop_uploads')) {
//       path = '/shop_uploads' + path;
//     }

//     const finalUrl = `${BASE_URL}${path}`;
//     console.log('Final Image URL:', finalUrl); // 🔍 เช็ค URL ใน Console

//     return { uri: finalUrl };
//   }, [detail, BASE_URL]);

//   // ---------- ฟังก์ชันเปลี่ยน option ----------
//   const toggleOption = (group: MenuOptionGroup, option: MenuOption) => {
//     setSelected(prev => {
//       const current = prev[group.id] ?? [];

//       // ถ้ากดตัวที่เลือกอยู่แล้ว
//       if (current.includes(option.id)) {
//         // ถ้ากลุ่มนี้เป็นแบบบังคับ (ต้องมีอย่างน้อย 1) → ไม่ให้เอาออก
//         if (group.isRequired) {
//           return prev;
//         }
//         // ถ้าไม่บังคับ → เอาออกให้กลายเป็นไม่ได้เลือกอะไร
//         return { ...prev, [group.id]: [] };
//       }

//       // ถ้ากดตัวใหม่ → เซ็ตให้กลุ่มนี้มีแค่ option เดียว (Single Select logic for simplicity, adjust if needed)
//       // *หมายเหตุ: ถ้าต้องการ Multiselect ในกลุ่มเดียวกัน ต้องแก้ Logic ตรงนี้*
//       return { ...prev, [group.id]: [option.id] };
//     });
//   };

//   // ---------- ยิง API เพิ่มลงตะกร้า ----------
//   const handleAddToCart = async () => {
//     if (!detail) return;

//     if (!userId) {
//       Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
//       return;
//     }

//     const optionsPayload = detail.optionGroups.flatMap(g => {
//       const ids = selected[g.id] ?? [];
//       return g.options
//         .filter(o => ids.includes(o.id))
//         .map(o => ({
//           optionName: o.name,
//           extraPrice: o.extraPrice,
//         }));
//     });

//     try {
//       setSubmitting(true);
//       await api.post(`/Cart/${userId}/items`, {
//         menuItemId: detail.id,
//         qty,
//         options: optionsPayload,
//       });

//       Alert.alert('สำเร็จ', 'เพิ่มสินค้าในตะกร้าแล้ว');
//       // navigation.navigate("Cart");
//     } catch (err: any) {
//       console.log('add to cart error', err?.response?.data ?? err);
//       Alert.alert('ผิดพลาด', 'ไม่สามารถเพิ่มลงตะกร้าได้');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- render ----------
//   if (loading || !detail) {
//     return (
//       <View style={styles.center}>
//         {loading ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <Text>{error ?? 'ไม่พบข้อมูลเมนู'}</Text>
//         )}
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//         {/* hero image */}
//         {menuImgSource ? (
//           <Image source={menuImgSource} style={styles.heroImage} />
//         ) : (
//           <View style={[styles.heroImage, { backgroundColor: '#ddd' }]} />
//         )}

//         {/* card */}
//         <View style={styles.infoCard}>
//           <Text style={styles.foodName}>{detail.name}</Text>
//           {detail.description ? (
//             <Text style={styles.foodDesc}>{detail.description}</Text>
//           ) : null}
//           <Text style={styles.foodPrice}>
//             เริ่มต้น ฿ {detail.price.toFixed(2)}
//           </Text>

//           {shop?.name && (
//             <Text style={styles.shopName}>จากร้าน {shop.name}</Text>
//           )}
//         </View>

//         {/* option groups */}
//         <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
//           {detail.optionGroups.map(g => (
//             <View key={g.id} style={{ marginBottom: 16 }}>
//               <Text style={styles.sectionHeader}>
//                 {g.name}{' '}
//                 {g.isRequired && (
//                   <Text style={{ color: '#F97316', fontSize: 12 }}>
//                     *จำเป็น
//                   </Text>
//                 )}
//               </Text>

//               {g.options.map(o => {
//                 const isSelected = (selected[g.id] ?? []).includes(o.id);

//                 return (
//                   <TouchableOpacity
//                     key={o.id}
//                     style={[
//                       styles.optionRow,
//                       {
//                         borderColor: isSelected ? '#1BAF5D' : '#E5E7EB',
//                         backgroundColor: isSelected ? '#ECFDF3' : '#FFFFFF',
//                       },
//                     ]}
//                     activeOpacity={0.8}
//                     onPress={() => toggleOption(g, o)}
//                   >
//                     <View>
//                       <Text style={styles.optionName}>{o.name}</Text>
//                       {o.extraPrice !== 0 && (
//                         <Text style={styles.optionPrice}>
//                           {o.extraPrice > 0
//                             ? `+ ฿ ${o.extraPrice.toFixed(2)}`
//                             : `- ฿ ${Math.abs(o.extraPrice).toFixed(2)}`}
//                         </Text>
//                       )}
//                     </View>

//                     <View
//                       style={[
//                         styles.radioOuter,
//                         isSelected && styles.radioOuterActive,
//                       ]}
//                     >
//                       {isSelected && <View style={styles.radioInner} />}
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       {/* bottom bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.qtyRow}>
//           <TouchableOpacity
//             onPress={() => setQty(q => Math.max(1, q - 1))}
//             style={styles.qtyBtn}
//             disabled={qty <= 1}
//           >
//             <Text style={styles.qtyBtnText}>-</Text>
//           </TouchableOpacity>
//           <Text style={styles.qtyText}>{qty}</Text>
//           <TouchableOpacity
//             onPress={() => setQty(q => q + 1)}
//             style={styles.qtyBtn}
//           >
//             <Text style={styles.qtyBtnText}>+</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[styles.addBtn, submitting && { opacity: 0.6 }]}
//           onPress={handleAddToCart}
//           disabled={submitting}
//         >
//           <Text style={styles.addBtnText}>
//             {submitting
//               ? 'กำลังเพิ่ม...'
//               : `เพิ่มลงตะกร้า • ฿ ${total.toFixed(2)}`}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* back button */}
//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={{ color: '#172B4D', fontWeight: '700', fontSize: 16 }}>
//           ‹ Back
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ---------- styles (เพิ่มกลับมาให้แล้ว) ----------
// const styles = StyleSheet.create({
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   heroImage: {
//     width: '100%',
//     height: 220,
//     backgroundColor: '#ccc',
//   },
//   infoCard: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     marginTop: -24,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: -2 },
//     elevation: 4,
//   },
//   foodName: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#172B4D',
//   },
//   foodDesc: {
//     marginTop: 4,
//     color: '#6B7280',
//   },
//   foodPrice: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#172B4D',
//   },
//   shopName: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#7B8AA3',
//   },
//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#172B4D',
//     marginBottom: 8,
//   },
//   optionRow: {
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   optionName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   optionPrice: {
//     marginTop: 2,
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioOuterActive: {
//     borderColor: '#1BAF5D',
//   },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 999,
//     backgroundColor: '#1BAF5D',
//   },
//   bottomBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   qtyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   qtyBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   qtyBtnText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   qtyText: {
//     minWidth: 32,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   addBtn: {
//     flex: 1,
//     backgroundColor: '#1BAF5D',
//     borderRadius: 999,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addBtnText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 40,
//     left: 16,
//     padding: 4,
//   },
// });

// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../api/client';

// // ---------- types ----------
// type MenuOption = {
//   id: number;
//   name: string;
//   extraPrice: number;
//   isDefault: boolean;
// };

// type MenuOptionGroup = {
//   id: number;
//   name: string;
//   isRequired: boolean;
//   minSelect: number;
//   maxSelect: number;
//   options: MenuOption[];
// };

// type MenuItemDetail = {
//   id: number;
//   shopId: number; // ✅ แก้เป็น shop_id ตาม Database
//   name: string;
//   description?: string | null;
//   price: number;
//   imageUrl?: string | null;
//   optionGroups: MenuOptionGroup[];
// };

// type Props = {
//   route: any;
//   navigation: any;
// };

// export default function FoodDetailScreen({ route, navigation }: Props) {
//   const { menuItemId, shop } = route.params;

//   const [detail, setDetail] = useState<MenuItemDetail | null>(null);
//   const [selected, setSelected] = useState<Record<number, number[]>>({});
//   const [qty, setQty] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userId, setUserId] = useState<number | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const BASE_URL = useMemo(
//     () =>
//       api.defaults.baseURL
//         ? api.defaults.baseURL.replace(/\/api\/?$/, '') // ✅ ตัด /api ทิ้ง
//         : 'http://10.0.2.2:7284',
//     [],
//   );

//   // ---------- โหลด userId จาก AsyncStorage ----------
//   useEffect(() => {
//     (async () => {
//       try {
//         const stored = await AsyncStorage.getItem('logged_in_user');
//         if (stored) {
//           const u = JSON.parse(stored);
//           setUserId(u.id);
//         }
//       } catch (err) {
//         console.warn('Failed to load logged_in_user', err);
//       }
//     })();
//   }, []);

//   // ---------- โหลดรายละเอียดเมนู ----------
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         setLoading(true);
//         const res = await api.get<MenuItemDetail>(
//           `/MenuItems/${menuItemId}/detail`,
//         );
//         if (!mounted) return;

//         setDetail(res.data);

//         // ตั้งค่า default selections
//         const init: Record<number, number[]> = {};
//         if (res.data.optionGroups) {
//           res.data.optionGroups.forEach(g => {
//             init[g.id] = g.options.filter(o => o.isDefault).map(o => o.id);
//           });
//         }
//         setSelected(init);
//       } catch (e: any) {
//         if (mounted) {
//           setError(
//             e?.response?.data?.toString() ??
//               e?.message ??
//               'เกิดข้อผิดพลาดในการโหลดเมนู',
//           );
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [menuItemId]);

//   // ---------- คำนวณราคา ----------
//   const calcTotal = () => {
//     if (!detail) return 0;
//     const base = detail.price;
//     const extra = (detail.optionGroups || []).reduce((sum, g) => {
//       const ids = selected[g.id] ?? [];
//       const opts = g.options.filter(o => ids.includes(o.id));
//       return sum + opts.reduce((s, o) => s + o.extraPrice, 0);
//     }, 0);
//     return (base + extra) * qty;
//   };

//   const total = calcTotal();

//   // ⭐️ Debug & Logic การดึงรูปภาพแบบแทรก shop_id
//   const menuImgSource = useMemo(() => {
//     if (!detail?.imageUrl) {
//       return undefined;
//     }

//     // 🔍 LOG 1: ค่าดิบจาก Database
//     console.log('FoodDetailScreen: Raw imageUrl from DB:', detail.imageUrl);

//     let path = detail.imageUrl;

//     // 1. ถ้าเป็น URL เต็ม (เช่น http://...) ใช้ได้เลย
//     if (path.startsWith('http')) {
//       return { uri: path };
//     }

//     // 2. แปลง Backslash (\) เป็น Forward Slash (/)
//     path = path.replace(/\\/g, '/');

//     // 3. ⭐️ เพิ่ม Logic แทรก shop_id ถ้า path ไม่มีเครื่องหมาย / (แสดงว่าเป็นแค่ชื่อไฟล์)
//     if (!path.includes('/')) {
//       // ✅ ใช้ detail.shop_id ตรงนี้ครับ
//       path = `/shop_uploads/${detail.shopId}/${path}`;

//       console.log(
//         `FoodDetailScreen: Injecting shop_id (${detail.shopId}) ->`,
//         path,
//       );
//     } else {
//       // กรณีมี path มาบ้างแล้ว (เช่น /menu/burger.jpg)
//       if (!path.startsWith('/')) {
//         path = '/' + path;
//       }

//       if (!path.includes('/shop_uploads')) {
//         path = '/shop_uploads' + path;
//       }
//     }

//     const finalUrl = `${BASE_URL}${path}`;

//     // 🔍 LOG 4: URL สุดท้าย
//     console.log('FoodDetailScreen: Final Image URL:', finalUrl);

//     return { uri: finalUrl };
//   }, [detail, BASE_URL]);

//   // ---------- ฟังก์ชันเปลี่ยน option ----------
//   const toggleOption = (group: MenuOptionGroup, option: MenuOption) => {
//     setSelected(prev => {
//       const current = prev[group.id] ?? [];

//       if (current.includes(option.id)) {
//         if (group.isRequired) {
//           return prev;
//         }
//         return { ...prev, [group.id]: [] };
//       }

//       return { ...prev, [group.id]: [option.id] };
//     });
//   };

//   // ---------- ยิง API เพิ่มลงตะกร้า ----------
//   const handleAddToCart = async () => {
//     if (!detail) return;

//     if (!userId) {
//       Alert.alert('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
//       return;
//     }

//     const optionsPayload = (detail.optionGroups || []).flatMap(g => {
//       const ids = selected[g.id] ?? [];
//       return g.options
//         .filter(o => ids.includes(o.id))
//         .map(o => ({
//           optionName: o.name,
//           extraPrice: o.extraPrice,
//         }));
//     });

//     try {
//       setSubmitting(true);
//       await api.post(`/Cart/${userId}/items`, {
//         menuItemId: detail.id,
//         qty,
//         options: optionsPayload,
//       });

//       Alert.alert('สำเร็จ', 'เพิ่มสินค้าในตะกร้าแล้ว');
//       // navigation.navigate("Cart");
//     } catch (err: any) {
//       console.log('add to cart error', err?.response?.data ?? err);
//       Alert.alert('ผิดพลาด', 'ไม่สามารถเพิ่มลงตะกร้าได้');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- render ----------
//   if (loading || !detail) {
//     return (
//       <View style={styles.center}>
//         {loading ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <Text>{error ?? 'ไม่พบข้อมูลเมนู'}</Text>
//         )}
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//         {/* hero image */}
//         {menuImgSource ? (
//           <Image
//             source={menuImgSource}
//             style={styles.heroImage}
//             onError={e =>
//               console.log('FoodDetailScreen: Image Load Error:', e.nativeEvent)
//             }
//           />
//         ) : (
//           <View style={[styles.heroImage, { backgroundColor: '#ddd' }]} />
//         )}

//         {/* card */}
//         <View style={styles.infoCard}>
//           <Text style={styles.foodName}>{detail.name}</Text>
//           {detail.description ? (
//             <Text style={styles.foodDesc}>{detail.description}</Text>
//           ) : null}
//           <Text style={styles.foodPrice}>
//             เริ่มต้น ฿ {detail.price.toFixed(2)}
//           </Text>

//           {shop?.name && (
//             <Text style={styles.shopName}>จากร้าน {shop.name}</Text>
//           )}
//         </View>

//         {/* option groups */}
//         <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
//           {(detail.optionGroups || []).map(g => (
//             <View key={g.id} style={{ marginBottom: 16 }}>
//               <Text style={styles.sectionHeader}>
//                 {g.name}{' '}
//                 {g.isRequired && (
//                   <Text style={{ color: '#F97316', fontSize: 12 }}>
//                     *จำเป็น
//                   </Text>
//                 )}
//               </Text>

//               {g.options.map(o => {
//                 const isSelected = (selected[g.id] ?? []).includes(o.id);

//                 return (
//                   <TouchableOpacity
//                     key={o.id}
//                     style={[
//                       styles.optionRow,
//                       {
//                         borderColor: isSelected ? '#1BAF5D' : '#E5E7EB',
//                         backgroundColor: isSelected ? '#ECFDF3' : '#FFFFFF',
//                       },
//                     ]}
//                     activeOpacity={0.8}
//                     onPress={() => toggleOption(g, o)}
//                   >
//                     <View>
//                       <Text style={styles.optionName}>{o.name}</Text>
//                       {o.extraPrice !== 0 && (
//                         <Text style={styles.optionPrice}>
//                           {o.extraPrice > 0
//                             ? `+ ฿ ${o.extraPrice.toFixed(2)}`
//                             : `- ฿ ${Math.abs(o.extraPrice).toFixed(2)}`}
//                         </Text>
//                       )}
//                     </View>

//                     <View
//                       style={[
//                         styles.radioOuter,
//                         isSelected && styles.radioOuterActive,
//                       ]}
//                     >
//                       {isSelected && <View style={styles.radioInner} />}
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           ))}
//         </View>
//       </ScrollView>

//       {/* bottom bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.qtyRow}>
//           <TouchableOpacity
//             onPress={() => setQty(q => Math.max(1, q - 1))}
//             style={styles.qtyBtn}
//             disabled={qty <= 1}
//           >
//             <Text style={styles.qtyBtnText}>-</Text>
//           </TouchableOpacity>
//           <Text style={styles.qtyText}>{qty}</Text>
//           <TouchableOpacity
//             onPress={() => setQty(q => q + 1)}
//             style={styles.qtyBtn}
//           >
//             <Text style={styles.qtyBtnText}>+</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[styles.addBtn, submitting && { opacity: 0.6 }]}
//           onPress={handleAddToCart}
//           disabled={submitting}
//         >
//           <Text style={styles.addBtnText}>
//             {submitting
//               ? 'กำลังเพิ่ม...'
//               : `เพิ่มลงตะกร้า • ฿ ${total.toFixed(2)}`}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* back button */}
//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={{ color: '#172B4D', fontWeight: '700', fontSize: 16 }}>
//           ‹ Back
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ---------- styles ----------
// const styles = StyleSheet.create({
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   heroImage: {
//     width: '100%',
//     height: 220,
//     backgroundColor: '#ccc',
//   },
//   infoCard: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     marginTop: -24,
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.07,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: -2 },
//     elevation: 4,
//   },
//   foodName: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#172B4D',
//   },
//   foodDesc: {
//     marginTop: 4,
//     color: '#6B7280',
//   },
//   foodPrice: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#172B4D',
//   },
//   shopName: {
//     marginTop: 4,
//     fontSize: 13,
//     color: '#7B8AA3',
//   },
//   sectionHeader: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#172B4D',
//     marginBottom: 8,
//   },
//   optionRow: {
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   optionName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   optionPrice: {
//     marginTop: 2,
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioOuterActive: {
//     borderColor: '#1BAF5D',
//   },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 999,
//     backgroundColor: '#1BAF5D',
//   },
//   bottomBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   qtyRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   qtyBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   qtyBtnText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   qtyText: {
//     minWidth: 32,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   addBtn: {
//     flex: 1,
//     backgroundColor: '#1BAF5D',
//     borderRadius: 999,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addBtnText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   backBtn: {
//     position: 'absolute',
//     top: 40,
//     left: 16,
//     padding: 4,
//   },
// });

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api, { API_BASE } from '../api/client';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AdminFoodEditScreen({ route, navigation }: any) {
  // รับค่าจากหน้าก่อนหน้า
  const { menuItemId, shopId: paramShopId } = route.params || {};

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // existingImage เก็บ URL รูปเดิม
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentShopId, setCurrentShopId] = useState(paramShopId);

  useEffect(() => {
    fetchFoodDetails();
  }, [menuItemId]);

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      console.log(`[Edit] Fetching detail for ID: ${menuItemId}`);

      const res = await api.get(`/MenuItems/${menuItemId}/detail`);
      const data = res.data;

      // 1. อัปเดตข้อมูลพื้นฐาน
      setName(data.name);
      setDesc(data.description || '');
      setPrice(data.price.toString());
      setType((data as any).type || '');

      const avail =
        (data as any).isAvailable ?? (data as any).is_available ?? true;
      setIsAvailable(!!avail);

      // อัปเดต ShopID จากข้อมูลจริง
      const realShopId = data.shopId || (data as any).shop_id || paramShopId;
      if (realShopId) setCurrentShopId(realShopId);

      // ---------------------------------------------------------
      // ⭐️ Logic สร้าง URL รูปภาพ (ยกมาจาก FoodDetailScreen แบบเป๊ะๆ)
      // ---------------------------------------------------------
      const rawPath = data.imageUrl || data.image_url;

      if (rawPath) {
        // เตรียม Base URL ตัด /api ออก
        const baseUrl = api.defaults.baseURL
          ? api.defaults.baseURL.replace(/\/api\/?$/, '')
          : 'http://10.0.2.2:7284';

        let path = rawPath.replace(/\\/g, '/'); // แก้ \ เป็น /

        // 1. ถ้าเป็น URL เต็มอยู่แล้ว
        if (path.startsWith('http')) {
          setExistingImage(path);
        } else {
          // 2. กรณีมาแค่ชื่อไฟล์ (ไม่มี /)
          if (!path.includes('/')) {
            // Logic: ถ้ามี shopId ให้ลองเข้าผ่านโฟลเดอร์ menu/{shopId}
            // แต่ถ้าไม่มี ให้ลองเข้าผ่าน menuitems (เผื่อเป็นระบบเก่า)
            if (realShopId) {
              // ลองแบบที่ 1: มาตรฐานใหม่ /shop_uploads/menu/{shopId}/{filename}
              // หมายเหตุ: ถ้าใน Database คุณไฟล์อยู่ที่ menuitems ให้แก้บรรทัดนี้เป็น /shop_uploads/menuitems/${path}
              // แต่ผมจะใช้ Logic ที่ฉลาดที่สุดคือการเดาจาก FoodDetail

              // 🟢 ลองใช้แบบ AdminFoodListScreen (ที่ user บอกว่าเวิร์ค)
              path = `/shop_uploads/menuitems/${path}`;
            } else {
              path = `/shop_uploads/menuitems/${path}`;
            }
          } else {
            // 3. กรณีมี Path มาบ้างแล้ว (เช่น "menu/1/burger.jpg")
            if (!path.startsWith('/')) path = '/' + path;
            if (!path.includes('/shop_uploads')) path = '/shop_uploads' + path;
          }

          const finalUrl = `${baseUrl}${path}`;
          console.log('[Edit] Final Image URL:', finalUrl);
          setExistingImage(finalUrl);
        }
      }
    } catch (err) {
      console.error('[Edit] Fetch Error:', err);
      Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (result.assets && result.assets.length > 0) {
      setNewImage(result.assets[0]);
    }
  };

  const handleUpdate = async () => {
    if (!name || !price)
      return Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อและราคา');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('shopId', currentShopId);
      formData.append('name', name);
      formData.append('description', desc);
      formData.append('price', price);
      formData.append('type', type);
      formData.append('isAvailable', isAvailable.toString());

      if (newImage) {
        formData.append('file', {
          uri: newImage.uri,
          type: newImage.type,
          name: newImage.fileName || 'updated_food.jpg',
        } as any);
      }

      await api.put(`/menuitems/${menuItemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('สำเร็จ', 'แก้ไขเมนูเรียบร้อย', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err: any) {
      console.error('[Edit] Update Error:', err?.response?.data || err);
      Alert.alert('Error', 'แก้ไขเมนูไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
          style={styles.backButton}
        >
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Item</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.imageUploader}
          onPress={handleSelectImage}
        >
          {/* 🟢 ส่วนแสดงรูปภาพ */}
          {newImage ? (
            <Image source={{ uri: newImage.uri }} style={styles.uploadedImg} />
          ) : existingImage ? (
            <Image
              source={{ uri: existingImage }}
              style={styles.uploadedImg}
              onError={e =>
                console.log('[Edit] Image Load Fail:', e.nativeEvent.error)
              }
            />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name="camera-plus"
                size={40}
                color="#9CA3AF"
              />
              <Text style={styles.placeholderText}>Change Photo</Text>
            </View>
          )}

          <View style={styles.editImageBadge}>
            <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Food Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex. Fried Chicken"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={desc}
          onChangeText={setDesc}
          multiline
          placeholder="Ingredients..."
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Price (฿)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
              placeholder="Ex. Chicken"
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Availability Status</Text>
            <Text
              style={{
                color: isAvailable ? '#1BAF5D' : '#FF0000',
                fontWeight: 'bold',
                marginTop: 4,
              }}
            >
              {isAvailable ? 'Available (มีของ)' : 'Out of Stock (หมด)'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#ddd', true: '#FF7622' }}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleUpdate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>SAVE CHANGES</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  backButton: { padding: 5 },
  backText: { color: '#FF7622', fontSize: 16 },

  content: { padding: 24 },
  imageUploader: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#CBD5E0',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 8, color: '#9CA3AF', fontWeight: '600' },
  editImageBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#32343E',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F0F5FA',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#F0F5FA',
    padding: 16,
    borderRadius: 10,
  },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee' },
  saveBtn: {
    backgroundColor: '#FF7622',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
