// // src/screens/NewBillDetailScreen.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   BackHandler,
// } from 'react-native';
// import api from '../api/client';

// export default function NewBillDetailScreen({ route, navigation }: any) {
//   const { orderId } = route.params; // รับ orderId มาจากหน้า PaymentQr
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   // 🔸 ดึงข้อมูลออเดอร์เมื่อเข้ามาหน้านี้
//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await api.get(`/Orders/${orderId}`);
//         setOrder(res.data);
//       } catch (err) {
//         console.error('Error fetching bill:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrder();

//     // 🔸 ป้องกันการกดปุ่ม Back ของ Android เพื่อไม่ให้ย้อนกลับไปหน้าจ่ายเงิน
//     const backAction = () => {
//       handleGoHome();
//       return true;
//     };
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction,
//     );
//     return () => backHandler.remove();
//   }, [orderId]);

//   // 🔸 ฟังก์ชันกลับหน้า Home (Reset Stack)
//   const handleGoHome = () => {
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'Home' }],
//     });
//   };

//   const renderReceiptItems = () => {
//     if (!order || !order.items) return null;
//     return order.items.map((item: any, index: number) => (
//       <View key={index} style={styles.receiptItemRow}>
//         <Text style={styles.receiptQty}>{item.quantity}</Text>
//         <Text style={styles.receiptItemName} numberOfLines={1}>
//           {item.menuItemName}
//         </Text>
//         <Text style={styles.receiptPrice}>
//           {(item.price * item.quantity).toFixed(2)}
//         </Text>
//       </View>
//     ));
//   };

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#FF7622" />
//         <Text style={{ marginTop: 10, color: '#666' }}>
//           กำลังพิมพ์ใบเสร็จ...
//         </Text>
//       </View>
//     );
//   }

//   if (!order) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text>ไม่พบข้อมูลออเดอร์</Text>
//         <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
//           <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* กล่องใบเสร็จ */}
//         <View style={styles.receiptCard}>
//           {/* Logo & Header */}
//           <View style={styles.receiptHeader}>
//             <View style={styles.logoCircle}>
//               <Text style={styles.logoText}>COOK</Text>
//             </View>
//             <Text style={styles.brandSlogan}>COOK คู่หูยามท้องหิว</Text>
//             <Text style={styles.receiptTitle}>ใบเสร็จ</Text>
//             <Text style={styles.receiptSubtitle}>PRETTY FOOD, REAL GOOD</Text>
//           </View>

//           {/* Shop Info */}
//           <View style={styles.shopInfoRow}>
//             <Text style={styles.shopName}>
//               ร้าน {order.items?.[0]?.shopName || 'My Shop'}
//             </Text>
//             <View>
//               <Text style={styles.dateText}>
//                 Date: {new Date(order.placedAt).toLocaleDateString('th-TH')}
//               </Text>
//               <Text style={styles.dateText}>
//                 Time: {new Date(order.placedAt).toLocaleTimeString('th-TH')}
//               </Text>
//             </View>
//           </View>

//           {/* Dashed Line */}
//           <View style={styles.dashedLine} />

//           {/* Item List */}
//           <View style={styles.itemListContainer}>{renderReceiptItems()}</View>

//           {/* Dashed Line */}
//           <View style={styles.dashedLine} />

//           {/* Summary */}
//           <View style={styles.summaryContainer}>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>SUB-TOTAL:</Text>
//               <Text style={styles.summaryValue}>
//                 {order.grandTotal.toFixed(2)}
//               </Text>
//             </View>
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>DELIVERY FEE:</Text>
//               <Text style={styles.summaryValue}>0.00</Text>
//             </View>
//             <View style={[styles.summaryRow, { marginTop: 8 }]}>
//               <Text style={styles.totalLabel}>TOTAL:</Text>
//               <Text style={styles.totalValue}>
//                 {order.grandTotal.toFixed(2)}
//               </Text>
//             </View>
//           </View>

//           {/* Dashed Line */}
//           <View style={styles.dashedLine} />

//           {/* Footer */}
//           <Text style={styles.receiptFooter}>
//             อย่าลืมติดตามเราที่ FB: COOK THAILAND
//           </Text>
//         </View>
//       </ScrollView>

//       {/* ปุ่มกลับหน้า Home (Fixed Bottom) */}
//       <View style={styles.footerButtonContainer}>
//         <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
//           <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F9FAFB', marginTop: 40 },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   scrollContent: { padding: 20, paddingBottom: 100 },

//   // Receipt Card Style
//   receiptCard: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderRadius: 2, // ให้ดูเหมือนกระดาษ
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 2 },
//   },
//   receiptHeader: { alignItems: 'center', marginBottom: 20 },
//   logoCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#FFEDD5',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   logoText: { color: '#F97316', fontWeight: '900', fontSize: 16 },
//   brandSlogan: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 5,
//   },
//   receiptTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 2,
//   },
//   receiptSubtitle: { fontSize: 10, fontWeight: '600', color: '#000' },

//   shopInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 15,
//   },
//   shopName: { fontSize: 20, fontWeight: 'bold', color: '#000', flex: 1 },
//   dateText: {
//     fontSize: 11,
//     color: '#333',
//     textAlign: 'right',
//     fontFamily: 'monospace',
//   },

//   dashedLine: {
//     height: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderStyle: 'dashed',
//     marginVertical: 12,
//     borderRadius: 1,
//   },

//   itemListContainer: { marginBottom: 10 },
//   receiptItemRow: { flexDirection: 'row', marginBottom: 6 },
//   receiptQty: {
//     width: 30,
//     fontSize: 14,
//     color: '#333',
//     fontWeight: 'bold',
//     fontFamily: 'monospace',
//   },
//   receiptItemName: { flex: 1, fontSize: 14, color: '#333', fontWeight: '600' },
//   receiptPrice: {
//     width: 70,
//     fontSize: 14,
//     color: '#333',
//     textAlign: 'right',
//     fontFamily: 'monospace',
//   },

//   summaryContainer: { alignItems: 'flex-end' },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginBottom: 4,
//     width: '100%',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#333',
//     marginRight: 10,
//     textAlign: 'right',
//     width: 100,
//   },
//   summaryValue: {
//     fontSize: 12,
//     color: '#333',
//     textAlign: 'right',
//     width: 70,
//     fontFamily: 'monospace',
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: 'bold',
//     marginRight: 10,
//     textAlign: 'right',
//     width: 100,
//   },
//   totalValue: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: 'bold',
//     textAlign: 'right',
//     width: 80,
//     fontFamily: 'monospace',
//   },

//   receiptFooter: {
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#000',
//     marginTop: 10,
//   },

//   footerButtonContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#F9FAFB',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   homeButton: {
//     backgroundColor: '#F97316',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   homeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
// });

// // src/screens/NewBillDetailScreen.tsx
// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   BackHandler,
//   Alert,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import ViewShot from 'react-native-view-shot'; // 📦 สำหรับแคปรูป
// import { CameraRoll } from '@react-native-camera-roll/camera-roll'; // 📦 สำหรับบันทึกลงเครื่อง
// import api from '../api/client';

// export default function NewBillDetailScreen({ route, navigation }: any) {
//   const { orderId } = route.params;
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   // 📸 สร้าง Ref สำหรับจับภาพ
//   const viewShotRef = useRef<ViewShot>(null);

//   useEffect(() => {
//     const fetchOrder = async () => {
//       try {
//         const res = await api.get(`/Orders/${orderId}`);
//         setOrder(res.data);
//       } catch (err) {
//         console.error('Error fetching bill:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrder();

//     const backAction = () => {
//       handleGoHome();
//       return true;
//     };
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction,
//     );
//     return () => backHandler.remove();
//   }, [orderId]);

//   const handleGoHome = () => {
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'Home' }],
//     });
//   };

//   // 📸 ฟังก์ชันบันทึกรูป
//   const handleSaveImage = async () => {
//     try {
//       // 1. ขอ Permission สำหรับ Android (ถ้าจำเป็น)
//       if (Platform.OS === 'android' && Platform.Version < 33) {
//         const granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//         );
//         if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
//           Alert.alert(
//             'Permission denied',
//             'ไม่สามารถบันทึกรูปได้เนื่องจากไม่ได้รับอนุญาต',
//           );
//           return;
//         }
//       }

//       // 2. จับภาพและบันทึก
//       if (viewShotRef.current && viewShotRef.current.capture) {
//         const uri = await viewShotRef.current.capture();
//         await CameraRoll.save(uri, { type: 'photo' });
//         Alert.alert('สำเร็จ', 'บันทึกใบเสร็จลงในอัลบั้มรูปแล้วครับ 📸');
//       }
//     } catch (error) {
//       console.error('Failed to save image:', error);
//       Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกรูปได้');
//     }
//   };

//   const renderReceiptItems = () => {
//     if (!order || !order.items) return null;
//     return order.items.map((item: any, index: number) => (
//       <View key={index} style={styles.receiptItemRow}>
//         <Text style={styles.receiptQty}>{item.quantity}</Text>

//         {/* 🟢 แก้ไข: ลบ numberOfLines ออก เพื่อให้ขึ้นบรรทัดใหม่ได้ */}
//         <Text style={styles.receiptItemName}>
//           {item.menuItemName}
//           {/* โชว์ Option ด้วยก็ได้ถ้าต้องการ */}
//           {item.options && item.options.length > 0 && (
//             <Text style={styles.optionText}>
//               {'\n'} + {item.options.map((o: any) => o.optionName).join(', ')}
//             </Text>
//           )}
//         </Text>

//         <Text style={styles.receiptPrice}>
//           {(item.price * item.quantity).toFixed(2)}
//         </Text>
//       </View>
//     ));
//   };

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#FF7622" />
//         <Text style={{ marginTop: 10, color: '#666' }}>
//           กำลังพิมพ์ใบเสร็จ...
//         </Text>
//       </View>
//     );
//   }

//   if (!order) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text>ไม่พบข้อมูลออเดอร์</Text>
//         <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
//           <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* 📸 ห่อ ViewShot รอบๆ ส่วนที่ต้องการแคป */}
//         <ViewShot
//           ref={viewShotRef}
//           options={{ format: 'jpg', quality: 0.9 }}
//           style={{ backgroundColor: '#F9FAFB' }}
//         >
//           <View style={styles.receiptCard}>
//             {/* Logo & Header */}
//             <View style={styles.receiptHeader}>
//               <View style={styles.logoCircle}>
//                 <Text style={styles.logoText}>COOK</Text>
//               </View>
//               <Text style={styles.brandSlogan}>COOK คู่หูยามท้องหิว</Text>
//               <Text style={styles.receiptTitle}>ใบเสร็จ</Text>
//               <Text style={styles.receiptSubtitle}>PRETTY FOOD, REAL GOOD</Text>
//             </View>

//             {/* Shop Info */}
//             <View style={styles.shopInfoRow}>
//               {/* 🟢 แก้ไข: ใช้ชื่อร้านจริงจาก API (order.shopName) */}
//               <Text style={styles.shopName}>
//                 ร้าน {order.shopName || 'Unknown Shop'}
//               </Text>
//               <View>
//                 <Text style={styles.dateText}>
//                   Date: {new Date(order.placedAt).toLocaleDateString('th-TH')}
//                 </Text>
//                 <Text style={styles.dateText}>
//                   Time: {new Date(order.placedAt).toLocaleTimeString('th-TH')}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.dashedLine} />
//             <View style={styles.itemListContainer}>{renderReceiptItems()}</View>
//             <View style={styles.dashedLine} />

//             {/* Summary */}
//             <View style={styles.summaryContainer}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>SUB-TOTAL:</Text>
//                 <Text style={styles.summaryValue}>
//                   {order.grandTotal.toFixed(2)}
//                 </Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>DELIVERY FEE:</Text>
//                 <Text style={styles.summaryValue}>0.00</Text>
//               </View>
//               <View style={[styles.summaryRow, { marginTop: 8 }]}>
//                 <Text style={styles.totalLabel}>TOTAL:</Text>
//                 <Text style={styles.totalValue}>
//                   {order.grandTotal.toFixed(2)}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.dashedLine} />
//             <Text style={styles.receiptFooter}>
//               อย่าลืมติดตามเราที่ FB: COOK THAILAND
//             </Text>
//           </View>
//         </ViewShot>

//         {/* ปุ่มบันทึกรูป */}
//         <TouchableOpacity onPress={handleSaveImage} style={styles.saveButton}>
//           <Text style={styles.saveButtonText}>💾 บันทึกรูปใบเสร็จ</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* ปุ่มกลับหน้า Home */}
//       <View style={styles.footerButtonContainer}>
//         <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
//           <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F9FAFB', marginTop: 40 },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   scrollContent: { padding: 20, paddingBottom: 100 },

//   receiptCard: {
//     backgroundColor: '#fff',
//     padding: 24,
//     borderRadius: 2,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 2 },
//     marginBottom: 20, // เผื่อระยะให้ปุ่ม save
//   },
//   receiptHeader: { alignItems: 'center', marginBottom: 20 },
//   logoCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: '#FFEDD5',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   logoText: { color: '#F97316', fontWeight: '900', fontSize: 16 },
//   brandSlogan: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 5,
//   },
//   receiptTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 2,
//   },
//   receiptSubtitle: { fontSize: 10, fontWeight: '600', color: '#000' },

//   shopInfoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 15,
//   },
//   shopName: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//     flex: 1,
//     marginRight: 10,
//   },
//   dateText: {
//     fontSize: 11,
//     color: '#333',
//     textAlign: 'right',
//     fontFamily: 'monospace',
//   },

//   dashedLine: {
//     height: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderStyle: 'dashed',
//     marginVertical: 12,
//     borderRadius: 1,
//   },

//   itemListContainer: { marginBottom: 10 },

//   // 🟢 แก้ไข Layout ของ Row ให้รองรับข้อความยาวๆ
//   receiptItemRow: {
//     flexDirection: 'row',
//     marginBottom: 8, // เพิ่มระยะห่างนิดหน่อยเพราะอาจมีหลายบรรทัด
//     alignItems: 'flex-start', // จัดให้ชิดบน เพื่อให้ราคาไม่ลอยกลางอากาศถ้าชื่อยาว
//   },
//   receiptQty: {
//     width: 30,
//     fontSize: 14,
//     color: '#333',
//     fontWeight: 'bold',
//     fontFamily: 'monospace',
//   },
//   receiptItemName: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '600',
//     flexWrap: 'wrap', // ให้ตัดบรรทัดได้
//   },
//   optionText: {
//     fontSize: 12,
//     color: '#666',
//     fontWeight: 'normal',
//     fontStyle: 'italic',
//   },
//   receiptPrice: {
//     width: 70,
//     fontSize: 14,
//     color: '#333',
//     textAlign: 'right',
//     fontFamily: 'monospace',
//   },

//   summaryContainer: { alignItems: 'flex-end' },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginBottom: 4,
//     width: '100%',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#333',
//     marginRight: 10,
//     textAlign: 'right',
//     width: 100,
//   },
//   summaryValue: {
//     fontSize: 12,
//     color: '#333',
//     textAlign: 'right',
//     width: 70,
//     fontFamily: 'monospace',
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: 'bold',
//     marginRight: 10,
//     textAlign: 'right',
//     width: 100,
//   },
//   totalValue: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: 'bold',
//     textAlign: 'right',
//     width: 80,
//     fontFamily: 'monospace',
//   },

//   receiptFooter: {
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#000',
//     marginTop: 10,
//   },

//   // ปุ่ม Save
//   saveButton: {
//     backgroundColor: '#3B82F6', // สีฟ้า
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

//   footerButtonContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#F9FAFB',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   homeButton: {
//     backgroundColor: '#F97316',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   homeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
// });

// src/screens/NewBillDetailScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import api from '../api/client';

export default function NewBillDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/Orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching bill:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const backAction = () => {
      handleGoHome();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [orderId]);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleSaveImage = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission denied',
            'ไม่สามารถบันทึกรูปได้เนื่องจากไม่ได้รับอนุญาต',
          );
          return;
        }
      }

      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        await CameraRoll.save(uri, { type: 'photo' });
        Alert.alert('สำเร็จ', 'บันทึกใบเสร็จลงในอัลบั้มรูปแล้วครับ 📸');
      }
    } catch (error) {
      console.error('Failed to save image:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกรูปได้');
    }
  };

  const renderReceiptItems = () => {
    if (!order || !order.items) return null;
    return order.items.map((item: any, index: number) => (
      <View key={index} style={styles.receiptItemRow}>
        <Text style={styles.receiptQty}>{item.quantity}</Text>
        <Text style={styles.receiptItemName}>
          {item.menuItemName}
          {item.options && item.options.length > 0 && (
            <Text style={styles.optionText}>
              {'\n'} + {item.options.map((o: any) => o.optionName).join(', ')}
            </Text>
          )}
        </Text>
        <Text style={styles.receiptPrice}>
          {(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7622" />
        <Text style={{ marginTop: 10, color: '#666' }}>
          กำลังพิมพ์ใบเสร็จ...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text>ไม่พบข้อมูลออเดอร์</Text>
        <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // คำนวณ VAT และ Total
  const subTotal = order.grandTotal;
  const vatRate = 0.07; // VAT 7%
  const vatAmount = subTotal * vatRate;
  const finalTotal = subTotal + vatAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 0.9 }}
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>COOK</Text>
              </View>
              <Text style={styles.brandSlogan}>COOK คู่หูยามท้องหิว</Text>
              <Text style={styles.receiptTitle}>ใบเสร็จ</Text>
              <Text style={styles.receiptSubtitle}>PRETTY FOOD, REAL GOOD</Text>
            </View>

            <View style={styles.shopInfoRow}>
              <Text style={styles.shopName}>
                ร้าน {order.shopName || 'Unknown Shop'}
              </Text>
              <View>
                <Text style={styles.dateText}>
                  Date: {new Date(order.placedAt).toLocaleDateString('th-TH')}
                </Text>
                <Text style={styles.dateText}>
                  Time: {new Date(order.placedAt).toLocaleTimeString('th-TH')}
                </Text>
              </View>
            </View>

            <View style={styles.dashedLine} />
            <View style={styles.itemListContainer}>{renderReceiptItems()}</View>
            <View style={styles.dashedLine} />

            {/* ส่วนสรุปยอดเงิน */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SUB-TOTAL:</Text>
                <Text style={styles.summaryValue}>{subTotal.toFixed(2)}</Text>
              </View>

              {/* ✅ เปลี่ยนจาก TAX เป็น VAT */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>VAT (7%):</Text>
                <Text style={styles.summaryValue}>{vatAmount.toFixed(2)}</Text>
              </View>

              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>{finalTotal.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.dashedLine} />
            <Text style={styles.receiptFooter}>
              อย่าลืมติดตามเราที่ FB: COOK THAILAND
            </Text>
          </View>
        </ViewShot>

        <TouchableOpacity onPress={handleSaveImage} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 บันทึกรูปใบเสร็จ</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footerButtonContainer}>
        <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', marginTop: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },

  receiptCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  receiptHeader: { alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: { color: '#F97316', fontWeight: '900', fontSize: 16 },
  brandSlogan: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  receiptSubtitle: { fontSize: 10, fontWeight: '600', color: '#000' },

  shopInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'right',
    fontFamily: 'monospace',
  },

  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginVertical: 12,
    borderRadius: 1,
  },

  itemListContainer: { marginBottom: 10 },

  receiptItemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  receiptQty: {
    width: 30,
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  receiptItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
  receiptPrice: {
    width: 70,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    fontFamily: 'monospace',
  },

  summaryContainer: { alignItems: 'flex-end' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    width: '100%',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#333',
    marginRight: 10,
    textAlign: 'right',
    width: 100,
  },
  summaryValue: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
    width: 70,
    fontFamily: 'monospace',
  },
  totalLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginRight: 10,
    textAlign: 'right',
    width: 100,
  },
  totalValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'right',
    width: 80,
    fontFamily: 'monospace',
  },

  receiptFooter: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  footerButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  homeButton: {
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import api from '../api/client';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Type ของข้อมูลบิล
// interface BillItem {
//   id: number;
//   orderCode: string;
//   totalAmount: number;
//   status: string;
//   date: string;
// }

// export default function BillHistoryScreen() {
//   const navigation = useNavigation<any>(); // ใช้ <any> เพื่อให้ typescript ไม่ฟ้องเรื่อง NewBillDetail
//   const route = useRoute<any>();
//   const { userId } = route.params || {};

//   const [bills, setBills] = useState<BillItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       let id = userId;
//       if (!id) {
//         // ถ้าไม่มี userId จาก params ให้ดึงจากเครื่อง
//         const userData = await AsyncStorage.getItem('logged_in_user');
//         if (userData) {
//           id = JSON.parse(userData).id;
//         }
//       }

//       if (id) {
//         fetchBillHistory(id);
//       } else {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, [userId]);

//   const fetchBillHistory = async (id: number) => {
//     try {
//       const response = await api.get(`/orders/user/${id}`);
//       setBills(response.data);
//     } catch (error) {
//       console.error('Failed to fetch bill history:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return '#4CAF50';
//       case 'cancelled':
//         return '#F44336';
//       case 'pending':
//         return '#FF9800';
//       default:
//         return '#757575';
//     }
//   };

//   const renderItem = ({ item }: { item: BillItem }) => (
//     <TouchableOpacity
//       style={styles.card}
//       activeOpacity={0.7}
//       // ✅ จุดที่แก้ไข: กดแล้วไปหน้า NewBillDetail พร้อมส่ง orderId ไป
//       onPress={() => navigation.navigate('NewBillDetail', { orderId: item.id })}
//     >
//       <View style={styles.cardHeader}>
//         <Text style={styles.orderCode}>#{item.orderCode}</Text>
//         <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
//           {item.status}
//         </Text>
//       </View>

//       <Text style={styles.dateText}>{item.date}</Text>

//       <View style={styles.divider} />

//       <View style={styles.cardFooter}>
//         <Text style={styles.totalLabel}>Total Amount</Text>
//         <Text style={styles.totalAmount}>฿{item.totalAmount.toFixed(2)}</Text>
//       </View>

//       {/* เพิ่มข้อความเล็กๆ ให้รู้ว่ากดดูใบเสร็จได้ */}
//       <Text style={styles.tapToView}>แตะเพื่อดูใบเสร็จ {'>'}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.backBtn}
//         >
//           <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>ประวัติการสั่งซื้อ</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color="#FF7622" />
//         </View>
//       ) : bills.length === 0 ? (
//         <View style={styles.center}>
//           <MaterialCommunityIcons name="receipt" size={60} color="#DDD" />
//           <Text style={styles.emptyText}>ยังไม่มีประวัติการสั่งซื้อ</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={bills}
//           keyExtractor={item => item.id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F8F9FB' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#fff',
//     elevation: 2,
//   },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#181C2E' },
//   backBtn: { padding: 5 },

//   listContent: { padding: 16 },

//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   orderCode: { fontSize: 16, fontWeight: 'bold', color: '#333' },
//   status: { fontSize: 14, fontWeight: '600' },
//   dateText: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },

//   divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },

//   cardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   totalLabel: { fontSize: 14, color: '#666' },
//   totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF7622' },

//   tapToView: {
//     fontSize: 10,
//     color: '#aaa',
//     textAlign: 'right',
//     marginTop: 8,
//   },

//   emptyText: { fontSize: 16, color: '#999', marginTop: 10 },
// });
