// // src/screens/FoodDetailScreenEdit.tsx
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
//   TextInput,
// } from 'react-native';
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
//   shopId?: number;
//   shop_id?: number;
//   name: string;
//   description?: string | null;
//   price: number;
//   imageUrl?: string | null;
//   image_url?: string | null;
//   optionGroups: MenuOptionGroup[];
// };

// type Props = {
//   route: any;
//   navigation: any;
// };

// export default function FoodDetailScreenEdit({ route, navigation }: Props) {
//   // 🟢 รับค่า Params ที่ส่งมาจาก CartScreen
//   const {
//     cartItemId, // ID ของรายการในตะกร้า (ใช้สำหรับ Update)
//     menuItemId, // ID เมนู (ใช้ดึงรูป/ราคา)
//     initialQty, // จำนวนเดิม
//     initialNote, // หมายเหตุเดิม
//     // initialOptionIds // (ถ้าคุณส่ง list ของ option id มาด้วยในอนาคต สามารถเอามา set selected ได้)
//   } = route.params;

//   const [detail, setDetail] = useState<MenuItemDetail | null>(null);
//   const [selected, setSelected] = useState<Record<number, number[]>>({});

//   // 🟢 ตั้งค่าเริ่มต้นจากข้อมูลเดิม
//   const [qty, setQty] = useState<number>(initialQty || 1);
//   const [specialRequest, setSpecialRequest] = useState(initialNote || '');

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const BASE_URL = useMemo(
//     () =>
//       api.defaults.baseURL
//         ? api.defaults.baseURL.replace(/\/api\/?$/, '')
//         : 'http://10.0.2.2:7284',
//     [],
//   );

//   // โหลดข้อมูลเมนู (เพื่อให้เห็นรูป, ราคา และตัวเลือก)
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

//         // ตั้งค่าตัวเลือกเริ่มต้น (Default Options)
//         // 💡 หมายเหตุ: ถ้าอยากให้ติ๊กถูกตัวเลือกเดิมที่ลูกค้าเคยเลือกไว้
//         // ต้องส่ง `initialOptionIds` มาจาก CartScreen แล้วเขียน Logic เช็คตรงนี้เพิ่ม
//         const init: Record<number, number[]> = {};
//         if (res.data.optionGroups) {
//           res.data.optionGroups.forEach(g => {
//             init[g.id] = g.options.filter(o => o.isDefault).map(o => o.id);
//           });
//         }
//         setSelected(init);
//       } catch (e: any) {
//         if (mounted) {
//           setError(e?.message ?? 'โหลดข้อมูลไม่สำเร็จ');
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [menuItemId]);

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

//   // Logic การแสดงรูปภาพ (เหมือนไฟล์เดิม)
//   const menuImgSource = useMemo(() => {
//     let rawPath = detail?.imageUrl || detail?.image_url;
//     const sId = detail?.shopId || detail?.shop_id;

//     if (!rawPath && sId && detail?.id) {
//       rawPath = `/shop_uploads/menu/${sId}/${sId}_${detail.id}.png`;
//     }
//     if (!rawPath) return undefined;
//     if (rawPath.startsWith('http')) return { uri: rawPath };

//     let path = rawPath.replace(/\\/g, '/');
//     if (!path.includes('/')) {
//       if (sId) path = `/shop_uploads/menu/${sId}/${path}`;
//       else path = `/shop_uploads/menuitems/${path}`;
//     } else {
//       if (!path.startsWith('/')) path = '/' + path;
//       if (!path.includes('/shop_uploads')) path = '/shop_uploads' + path;
//     }

//     const host = BASE_URL.replace(/\/api\/?$/, '');
//     return { uri: `${host}${path}` };
//   }, [detail, BASE_URL]);

//   const toggleOption = (group: MenuOptionGroup, option: MenuOption) => {
//     setSelected(prev => {
//       const current = prev[group.id] ?? [];
//       if (current.includes(option.id)) {
//         if (group.isRequired) return prev;
//         return { ...prev, [group.id]: [] };
//       }
//       return { ...prev, [group.id]: [option.id] };
//     });
//   };

//   // 🟢 ฟังก์ชันบันทึกการแก้ไข (Update)
//   const handleUpdateCart = async () => {
//     if (!detail) return;

//     // รวบรวม Option IDs ที่ถูกเลือก
//     const selectedOptionIds = (detail.optionGroups || []).flatMap(g => {
//       return selected[g.id] ?? [];
//     });

//     try {
//       setSubmitting(true);

//       // ยิง PUT ไปอัปเดต
//       await api.put(`/Cart/update-item/${cartItemId}`, {
//         quantity: qty,
//         specialRequest: specialRequest.trim() || null,
//         optionIds: selectedOptionIds, // ส่ง ID ของตัวเลือกใหม่ไปแทนที่ของเดิม
//       });

//       Alert.alert('สำเร็จ', 'บันทึกการแก้ไขเรียบร้อย', [
//         { text: 'OK', onPress: () => navigation.goBack() },
//       ]);
//     } catch (err: any) {
//       console.log('update cart error', err?.response?.data ?? err);
//       Alert.alert('ผิดพลาด', 'ไม่สามารถแก้ไขรายการได้');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading || !detail) {
//     return (
//       <View style={styles.center}>
//         {loading ? <ActivityIndicator size="large" /> : <Text>{error}</Text>}
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//         {/* ส่วนแสดงรูปภาพ */}
//         {menuImgSource ? (
//           <Image source={menuImgSource} style={styles.heroImage} />
//         ) : (
//           <View
//             style={[
//               styles.heroImage,
//               {
//                 backgroundColor: '#ddd',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               },
//             ]}
//           >
//             <Text style={{ color: '#999' }}>No Image</Text>
//           </View>
//         )}

//         <View style={styles.infoCard}>
//           <Text style={styles.foodName}>{detail.name}</Text>
//           {detail.description && (
//             <Text style={styles.foodDesc}>{detail.description}</Text>
//           )}
//           <Text style={styles.foodPrice}>
//             ราคาต่อชิ้น ฿ {detail.price.toFixed(2)}
//           </Text>
//           <Text style={{ color: '#F97316', fontWeight: 'bold', marginTop: 5 }}>
//             [โหมดแก้ไขรายการ]
//           </Text>
//         </View>

//         <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
//           {/* ส่วนตัวเลือก (Options) */}
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
//                         borderColor: isSelected ? '#F97316' : '#E5E7EB', // เปลี่ยนสีธีมเป็นส้มตอนแก้ไข
//                         backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
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
//                         isSelected && { borderColor: '#F97316' },
//                       ]}
//                     >
//                       {isSelected && (
//                         <View
//                           style={[
//                             styles.radioInner,
//                             { backgroundColor: '#F97316' },
//                           ]}
//                         />
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           ))}

//           {/* ส่วนกรอกหมายเหตุ */}
//           <View style={{ marginBottom: 24, marginTop: 8 }}>
//             <Text style={styles.sectionHeader}>หมายเหตุถึงร้าน (แก้ไข)</Text>
//             <TextInput
//               style={styles.noteInput}
//               placeholder="เช่น ไม่ใส่ผัก, ขอช้อนส้อม..."
//               placeholderTextColor="#9CA3AF"
//               multiline
//               value={specialRequest}
//               onChangeText={setSpecialRequest}
//             />
//           </View>
//         </View>
//       </ScrollView>

//       {/* Bottom Bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.qtyRow}>
//           <TouchableOpacity
//             onPress={() => setQty(q => Math.max(1, q - 1))}
//             style={styles.qtyBtn}
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
//           style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
//           onPress={handleUpdateCart}
//           disabled={submitting}
//         >
//           <Text style={styles.addBtnText}>
//             {submitting
//               ? 'กำลังบันทึก...'
//               : `บันทึกการแก้ไข • ฿ ${total.toFixed(2)}`}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <TouchableOpacity
//         style={styles.backBtn}
//         onPress={() => navigation.goBack()}
//       >
//         <Text style={{ color: '#172B4D', fontWeight: '700', fontSize: 16 }}>
//           ‹ ยกเลิก
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   heroImage: { width: '100%', height: 220, backgroundColor: '#ccc' },
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
//   foodName: { fontSize: 20, fontWeight: '800', color: '#172B4D' },
//   foodDesc: { marginTop: 4, color: '#6B7280' },
//   foodPrice: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#172B4D',
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
//   optionName: { fontSize: 14, fontWeight: '600', color: '#111827' },
//   optionPrice: { marginTop: 2, fontSize: 13, color: '#6B7280' },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioInner: {
//     width: 10,
//     height: 10,
//     borderRadius: 999,
//     backgroundColor: '#1BAF5D',
//   },
//   noteInput: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     padding: 12,
//     minHeight: 80,
//     textAlignVertical: 'top',
//     backgroundColor: '#F9FAFB',
//     fontSize: 14,
//     color: '#111827',
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
//   qtyRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
//   qtyBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#111827' },
//   qtyText: {
//     minWidth: 32,
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   saveBtn: {
//     flex: 1,
//     backgroundColor: '#F97316', // สีส้มสำหรับการแก้ไข
//     borderRadius: 999,
//     paddingVertical: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
//   backBtn: { position: 'absolute', top: 40, left: 16, padding: 4 },
// });
// src/screens/FoodDetailScreenEdit.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import api from '../api/client';

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
  shopId?: number;
  shop_id?: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  image_url?: string | null;
  optionGroups: MenuOptionGroup[];
};

type Props = {
  route: any;
  navigation: any;
};

export default function FoodDetailScreenEdit({ route, navigation }: Props) {
  // 🟢 รับค่า Params ที่ส่งมาจาก CartScreen
  const {
    cartItemId, // ID ของรายการในตะกร้า (ใช้สำหรับ Update)
    menuItemId, // ID เมนู (ใช้ดึงรูป/ราคา)
    initialQty, // จำนวนเดิม
    initialNote, // หมายเหตุเดิม
    initialOptionIds = [], // 🟢 รับรายการ Option ID เดิมมาด้วย (ใส่ค่า default เป็น [] กัน error)
  } = route.params;

  const [detail, setDetail] = useState<MenuItemDetail | null>(null);
  const [selected, setSelected] = useState<Record<number, number[]>>({});

  // 🟢 ตั้งค่าเริ่มต้นจากข้อมูลเดิม
  const [qty, setQty] = useState<number>(initialQty || 1);
  const [specialRequest, setSpecialRequest] = useState(initialNote || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = useMemo(
    () =>
      api.defaults.baseURL
        ? api.defaults.baseURL.replace(/\/api\/?$/, '')
        : 'http://10.0.2.2:7284',
    [],
  );

  // โหลดข้อมูลเมนู (เพื่อให้เห็นรูป, ราคา และตัวเลือก)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // ดึงข้อมูล Master Data ของเมนูนั้นๆ
        const res = await api.get<MenuItemDetail>(
          `/MenuItems/${menuItemId}/detail`,
        );

        if (!mounted) return;
        setDetail(res.data);

        // 🟢 Logic: ตั้งค่าตัวเลือกเริ่มต้น (Pre-fill Options)
        const init: Record<number, number[]> = {};

        if (res.data.optionGroups) {
          res.data.optionGroups.forEach(g => {
            // 1. ลองหาว่าในกลุ่มนี้ มีตัวเลือกไหนที่ตรงกับ initialOptionIds บ้าง
            const userHistoryOptions = g.options
              .filter(o => initialOptionIds.includes(o.id))
              .map(o => o.id);

            if (userHistoryOptions.length > 0) {
              // ✅ เจอ: ใช้ค่าเดิมที่ลูกค้าเคยเลือก
              init[g.id] = userHistoryOptions;
            } else {
              // ❌ ไม่เจอ: ใช้ค่า Default ของร้าน (เช่น บังคับเลือกอันแรก)
              init[g.id] = g.options.filter(o => o.isDefault).map(o => o.id);
            }
          });
        }
        setSelected(init);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? 'โหลดข้อมูลไม่สำเร็จ');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [menuItemId, initialOptionIds]); // 🟢 ใส่ dependency ให้ครบ

  const calcTotal = () => {
    if (!detail) return 0;
    const base = detail.price;
    const extra = (detail.optionGroups || []).reduce((sum, g) => {
      const ids = selected[g.id] ?? [];
      const opts = g.options.filter(o => ids.includes(o.id));
      return sum + opts.reduce((s, o) => s + o.extraPrice, 0);
    }, 0);
    return (base + extra) * qty;
  };

  const total = calcTotal();

  // Logic การแสดงรูปภาพ
  const menuImgSource = useMemo(() => {
    let rawPath = detail?.imageUrl || detail?.image_url;
    const sId = detail?.shopId || detail?.shop_id;

    if (!rawPath && sId && detail?.id) {
      rawPath = `/shop_uploads/menu/${sId}/${sId}_${detail.id}.png`;
    }
    if (!rawPath) return undefined;
    if (rawPath.startsWith('http')) return { uri: rawPath };

    let path = rawPath.replace(/\\/g, '/');
    if (!path.includes('/')) {
      if (sId) path = `/shop_uploads/menu/${sId}/${path}`;
      else path = `/shop_uploads/menuitems/${path}`;
    } else {
      if (!path.startsWith('/')) path = '/' + path;
      if (!path.includes('/shop_uploads')) path = '/shop_uploads' + path;
    }

    const host = BASE_URL.replace(/\/api\/?$/, '');
    return { uri: `${host}${path}` };
  }, [detail, BASE_URL]);

  const toggleOption = (group: MenuOptionGroup, option: MenuOption) => {
    setSelected(prev => {
      const current = prev[group.id] ?? [];
      if (current.includes(option.id)) {
        if (group.isRequired) return prev;
        return { ...prev, [group.id]: [] };
      }
      return { ...prev, [group.id]: [option.id] };
    });
  };

  // 🟢 ฟังก์ชันบันทึกการแก้ไข (Update)
  const handleUpdateCart = async () => {
    if (!detail) return;

    // รวบรวม Option IDs ที่ถูกเลือก
    const selectedOptionIds = (detail.optionGroups || []).flatMap(g => {
      return selected[g.id] ?? [];
    });

    try {
      setSubmitting(true);

      // ยิง PUT ไปอัปเดต (ใช้ /Cart ตัวใหญ่ตาม Controller)
      await api.put(`/Cart/update-item/${cartItemId}`, {
        quantity: qty,
        specialRequest: specialRequest.trim() || null,
        optionIds: selectedOptionIds, // ส่ง ID ของตัวเลือกใหม่ไปแทนที่ของเดิม
      });

      Alert.alert('สำเร็จ', 'บันทึกการแก้ไขเรียบร้อย', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      console.log('update cart error', err?.response?.data ?? err);
      Alert.alert('ผิดพลาด', 'ไม่สามารถแก้ไขรายการได้');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !detail) {
    return (
      <View style={styles.center}>
        {loading ? <ActivityIndicator size="large" /> : <Text>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ส่วนแสดงรูปภาพ */}
        {menuImgSource ? (
          <Image source={menuImgSource} style={styles.heroImage} />
        ) : (
          <View
            style={[
              styles.heroImage,
              {
                backgroundColor: '#ddd',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Text style={{ color: '#999' }}>No Image</Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.foodName}>{detail.name}</Text>
          {detail.description && (
            <Text style={styles.foodDesc}>{detail.description}</Text>
          )}
          <Text style={styles.foodPrice}>
            ราคาต่อชิ้น ฿ {detail.price.toFixed(2)}
          </Text>
          <Text style={{ color: '#F97316', fontWeight: 'bold', marginTop: 5 }}>
            [โหมดแก้ไขรายการ]
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          {/* ส่วนตัวเลือก (Options) */}
          {(detail.optionGroups || []).map(g => (
            <View key={g.id} style={{ marginBottom: 16 }}>
              <Text style={styles.sectionHeader}>
                {g.name}{' '}
                {g.isRequired && (
                  <Text style={{ color: '#F97316', fontSize: 12 }}>
                    *จำเป็น
                  </Text>
                )}
              </Text>
              {g.options.map(o => {
                const isSelected = (selected[g.id] ?? []).includes(o.id);
                return (
                  <TouchableOpacity
                    key={o.id}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: isSelected ? '#F97316' : '#E5E7EB', // เปลี่ยนสีธีมเป็นส้มตอนแก้ไข
                        backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
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
                        isSelected && { borderColor: '#F97316' },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: '#F97316' },
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* ส่วนกรอกหมายเหตุ */}
          <View style={{ marginBottom: 24, marginTop: 8 }}>
            <Text style={styles.sectionHeader}>หมายเหตุถึงร้าน (แก้ไข)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="เช่น ไม่ใส่ผัก, ขอช้อนส้อม..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={specialRequest}
              onChangeText={setSpecialRequest}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => setQty(q => Math.max(1, q - 1))}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            onPress={() => setQty(q => q + 1)}
            style={styles.qtyBtn}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
          onPress={handleUpdateCart}
          disabled={submitting}
        >
          <Text style={styles.addBtnText}>
            {submitting
              ? 'กำลังบันทึก...'
              : `บันทึกการแก้ไข • ฿ ${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: '#172B4D', fontWeight: '700', fontSize: 16 }}>
          ‹ ยกเลิก
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: 220, backgroundColor: '#ccc' },
  infoCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  foodName: { fontSize: 20, fontWeight: '800', color: '#172B4D' },
  foodDesc: { marginTop: 4, color: '#6B7280' },
  foodPrice: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172B4D',
    marginBottom: 8,
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  optionPrice: { marginTop: 2, fontSize: 13, color: '#6B7280' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1BAF5D',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    fontSize: 14,
    color: '#111827',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  qtyText: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#F97316', // สีส้มสำหรับการแก้ไข
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backBtn: { position: 'absolute', top: 40, left: 16, padding: 4 },
});
