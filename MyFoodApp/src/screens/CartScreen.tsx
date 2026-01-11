// src/screens/CartScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import api, { API_BASE } from '../api/client';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'; // ต้องใช้คู่กัน

type CartItem = {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
  shopName?: string | null;
  shopId: number;
  specialRequest?: string | null;
  options: { optionId: number; optionName: string; extraPrice: number }[];
};

type Props = {
  navigation: any;
  route: { params: { userId: number; shopId?: number; shopName?: string } };
};

export type { CartItem };

export default function CartScreen({ navigation, route }: Props) {
  const { userId, shopId, shopName } = route.params;

  type PaymentMethod = 'paypal' | 'cash';

  const CART_PLACEHOLDER = require('../../assets/images/CATAGORY_ICON_BURGERS.png');
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      setConfirmDeleteId(null);
      setItems(prev => prev.filter(it => it.id !== cartItemId));
      await api.delete(`/Cart/items/${cartItemId}`);
    } catch (err: any) {
      console.log('remove cart item error:', err?.response?.data ?? err);
      Alert.alert('ผิดพลาด', 'ลบสินค้าในระบบไม่สำเร็จ');
    }
  };

  const BASE_HOST = useMemo(() => API_BASE.replace(/\/api\/?$/, ''), []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchCartData = async () => {
        try {
          // ถ้าโหลดครั้งแรกให้หมุนติ้วๆ (Optional: ถ้าไม่อยากให้กระพริบ ลบ setLoading ได้)
          // setLoading(true);
          setErrorMsg(null);

          const res = await api.get<any[]>(`/Cart/${userId}/items`);

          if (!mounted) return;

          let mapped: CartItem[] = (res.data ?? []).map(it => ({
            id: it.id,
            menuItemId: it.menuItemId,
            menuItemName: it.menuItemName ?? it.name ?? 'ไม่ทราบชื่อเมนู',
            quantity: it.quantity ?? it.qty ?? 1,
            price: it.price ?? 0,
            imageUrl: it.imageUrl ?? null,
            shopName: it.shopName ?? null,
            shopId: it.shopId,
            specialRequest: it.specialRequest ?? null,
            options: it.options ?? [], // ✅ สำคัญ: ต้องรับ options ล่าสุดมา
          }));

          if (shopId != null) {
            mapped = mapped.filter(x => x.shopId === shopId);
          }

          setItems(mapped);
        } catch (err: any) {
          console.log(
            'Cart load error:',
            err?.response?.data ?? err?.message ?? err,
          );
          if (mounted) {
            setErrorMsg('ไม่สามารถโหลดตะกร้าได้ หรือยังไม่มีสินค้าในตะกร้า');
            setItems([]);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchCartData();

      return () => {
        mounted = false;
      };
    }, [userId, shopId]), // Dependency array
  );

  const subtotal: number = items.reduce<number>(
    (sum, it) => sum + it.price * it.quantity,
    0,
  );
  const deliveryFee: number = 0;
  const VAT_RATE = 0.07;
  const vat = subtotal * VAT_RATE;
  const total: number = subtotal + vat + deliveryFee - voucherDiscount;

  const handleQtyChange = async (itemId: number, delta: 1 | -1) => {
    const target = items.find(it => it.id === itemId);
    if (!target) return;

    const currentQty = target.quantity;
    const nextQty = currentQty + delta;

    if (nextQty <= 0) {
      setConfirmDeleteId(itemId);
      return;
    }

    setItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, quantity: nextQty } : it)),
    );

    try {
      await api.put(`/Cart/items/${itemId}/qty`, {
        qty: nextQty,
      });
    } catch (err: any) {
      console.log('update qty error:', err?.response?.data ?? err);
      setItems(prev =>
        prev.map(it =>
          it.id === itemId ? { ...it, quantity: currentQty } : it,
        ),
      );
      Alert.alert('ผิดพลาด', 'อัปเดตจำนวนสินค้าในระบบไม่สำเร็จ');
    }
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('แจ้งเตือน', 'ยังไม่มีสินค้าในตะกร้า');
      return;
    }

    try {
      const body = {
        userId,
        shopId: shopId ?? items[0]?.shopId,
        voucherCode:
          voucherDiscount > 0 ? voucherCode.trim().toUpperCase() : null,
      };

      const res = await api.post('/orders', body);
      const { orderId, grandTotal } = res.data;

      setVoucherCode('');
      setVoucherDiscount(0);

      if (payment === 'cash') {
        Alert.alert(
          'Order Submitted',
          `ชำระเงินด้วย: เงินสด\nยอดสุทธิ ฿ ${grandTotal.toFixed(2)}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        navigation.navigate('PaymentQr', {
          amount: grandTotal,
          orderId,
          userId,
        });
      }
    } catch (err: any) {
      console.log('create order error:', err?.response?.data ?? err);
      Alert.alert('ผิดพลาด', 'สร้างคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();

    if (!code) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกโค้ดส่วนลด');
      return;
    }

    if (code === 'GRADANAJA') {
      const discount = subtotal * 0.25;
      setVoucherDiscount(discount);
      Alert.alert('สำเร็จ', 'ใช้โค้ดส่วนลด 25% แล้ว');
    } else {
      setVoucherDiscount(0);
      Alert.alert('ผิดพลาด', 'โค้ดส่วนลดไม่ถูกต้อง');
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const imgSource =
      item.imageUrl && item.imageUrl.length > 0
        ? {
            uri: `${BASE_HOST}${item.imageUrl.startsWith('/') ? '' : '/'}${
              item.imageUrl
            }`,
          }
        : CART_PLACEHOLDER;

    return (
      <TouchableOpacity
        style={styles.foodRow}
        activeOpacity={0.7}
        onPress={() => {
          // 🟢 1. ดึงเฉพาะ ID ออกมาเป็น Array [1, 5, 8]
          const currentOptionIds = item.options.map(o => o.optionId);

          // 🟢 2. ส่งไปหน้าแก้ไข
          navigation.navigate('FoodDetailEdit', {
            cartItemId: item.id,
            menuItemId: item.menuItemId,
            initialQty: item.quantity,
            initialNote: item.specialRequest,
            initialOptionIds: currentOptionIds, // ✅ ส่งอันนี้ไปด้วย
          });
        }}
      >
        <Image source={imgSource} style={styles.foodImage} resizeMode="cover" />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.foodTitle} numberOfLines={2}>
            {item.menuItemName}
          </Text>

          {/* แสดงหมายเหตุถ้ามี */}
          {item.specialRequest ? (
            <Text style={{ fontSize: 12, color: '#F97316', marginTop: 2 }}>
              📝 {item.specialRequest}
            </Text>
          ) : null}

          <View style={styles.qtyRow}>
            {/* ปุ่มลดจำนวน (ต้อง stopPropagation ไม่ให้เด้งไปหน้าแก้ไข) */}
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                handleQtyChange(item.id, -1);
              }}
              style={[styles.qtyBtn, { marginRight: 4 }]}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            {/* ปุ่มเพิ่มจำนวน */}
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation();
                handleQtyChange(item.id, +1);
              }}
              style={[styles.qtyBtn, { marginLeft: 4 }]}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.foodPrice}>
            ฿ {(item.price * item.quantity).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>
            แตะเพื่อแก้ไข
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const shopTitle =
    items[0]?.shopName && items[0].shopName.trim().length > 0
      ? items[0].shopName
      : 'Your Order';

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>❮</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Confirm Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* DELIVERY CARD */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Delivery to</Text>

              <View style={styles.deliveryCard}>
                <View style={styles.deliveryAvatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.deliveryName} numberOfLines={1}>
                    (323) 238-0678
                  </Text>
                  <Text style={styles.deliveryAddress} numberOfLines={2}>
                    909-1/2 E 49th St, Los Angeles, California(CA), 90011
                  </Text>
                  <Text style={styles.deliveryDistance}>1.5 km</Text>
                </View>
              </View>
            </View>

            {/* ORDER CARD */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{shopTitle}</Text>

              {loading && (
                <View style={styles.center}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.infoText}>กำลังโหลดตะกร้า...</Text>
                </View>
              )}

              {!loading && errorMsg && items.length === 0 && (
                <View style={styles.center}>
                  <Text style={styles.infoText}>{errorMsg}</Text>
                </View>
              )}

              {!loading && !errorMsg && items.length === 0 && (
                <View style={styles.center}>
                  <Text style={styles.infoText}>ตะกร้าของคุณว่างเปล่า</Text>
                </View>
              )}
            </View>
          </>
        }
        data={items}
        keyExtractor={it => String(it.id)}
        renderItem={info => (
          <View style={styles.sectionCardNoPadding}>
            {renderCartItem(info)}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.sectionCard}>
            {/* SUMMARY */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({items.length} items)
              </Text>
              <Text style={styles.summaryValue}>฿ {subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT (7%)</Text>
              <Text style={styles.summaryValue}>฿ {vat.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>
                ฿ {deliveryFee.toFixed(2)}
              </Text>
            </View>

            {/* 🔸 ช่องกรอกโค้ดส่วนลด */}
            <View style={styles.voucherRow}>
              <TextInput
                style={styles.voucherInput}
                placeholder="Enter promotion code"
                placeholderTextColor="#9CA3AF"
                value={voucherCode}
                onChangeText={setVoucherCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.voucherButton}
                onPress={handleApplyVoucher}
                activeOpacity={0.85}
              >
                <Text style={styles.voucherButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Voucher</Text>
              <Text style={styles.summaryValue}>
                {voucherDiscount === 0
                  ? '-'
                  : `- ฿ ${voucherDiscount.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>฿ {total.toFixed(2)}</Text>
            </View>

            {/* PAYMENT METHODS */}
            <View style={styles.paymentRow}>
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  payment === 'paypal' && styles.paymentCardActive,
                ]}
                onPress={() => setPayment('paypal')}
              >
                <Text style={styles.paymentIcon}>💳</Text>
                <Text style={styles.paymentAmount}>฿ {total.toFixed(2)}</Text>
                <Text style={styles.paymentLabel}>QR Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  payment === 'cash' && styles.paymentCardActive,
                ]}
                onPress={() => setPayment('cash')}
              >
                <Text style={styles.paymentIcon}>💵</Text>
                <Text style={styles.paymentAmount}>฿ {total.toFixed(2)}</Text>
                <Text style={styles.paymentLabel}>Cash</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* SUBMIT BUTTON */}
      <View style={styles.submitBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Confirm Delete Modal */}
      {confirmDeleteId !== null && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Remove item?</Text>
            <Text style={styles.modalText}>
              คุณต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setConfirmDeleteId(null)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => handleRemoveItem(confirmDeleteId)}
              >
                <Text style={styles.modalButtonPrimaryText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const COLOR = {
  orange: '#EF9F27',
  navy: '#172B4D',
  gray: '#7A869A',
  cardBg: '#FFFFFF',
  bg: '#F6F7FB',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR.cardBg,
    marginTop: 40,
  },
  backText: { fontSize: 20, color: COLOR.navy },
  headerTitle: {
    fontSize: 18,
    color: COLOR.navy,
    fontWeight: '700',
  },

  sectionCard: {
    backgroundColor: COLOR.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionCardNoPadding: {
    backgroundColor: COLOR.cardBg,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLOR.navy,
    marginBottom: 12,
  },

  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFF',
    borderRadius: 18,
    padding: 12,
  },
  deliveryAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E5F3FF',
  },
  deliveryName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.navy,
  },
  deliveryAddress: {
    fontSize: 13,
    color: COLOR.gray,
    marginTop: 2,
  },
  deliveryDistance: {
    fontSize: 12,
    color: COLOR.gray,
    marginTop: 4,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  infoText: { color: COLOR.gray, fontSize: 13 },

  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F8',
  },
  foodImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EEE',
  },
  foodTitle: {
    fontSize: 14,
    color: COLOR.navy,
    fontWeight: '600',
  },
  foodPrice: {
    fontSize: 14,
    color: COLOR.navy,
    fontWeight: '700',
    marginLeft: 8,
  },

  qtyRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLOR.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    color: COLOR.gray,
    fontWeight: '700',
  },
  qtyText: {
    fontSize: 14,
    color: COLOR.navy,
    fontWeight: '600',
    marginHorizontal: 8,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 13, color: COLOR.gray },
  summaryValue: { fontSize: 13, color: COLOR.navy, fontWeight: '600' },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ECEFF5',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR.navy,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLOR.orange,
  },

  voucherLabel: {
    fontSize: 14,
    color: COLOR.navy,
    fontWeight: '600',
  },
  voucherAdd: {
    fontSize: 14,
    color: COLOR.orange,
    fontWeight: '600',
  },

  paymentRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  paymentCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4E7F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#F9FAFF',
  },
  paymentCardActive: {
    borderColor: COLOR.orange,
    backgroundColor: '#FFF4E5',
  },
  paymentIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR.navy,
  },
  paymentLabel: {
    fontSize: 12,
    color: COLOR.gray,
    marginTop: 2,
  },

  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 24,
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLOR.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ===== Modal ยืนยันลบสินค้า =====
  modalOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)', // ดำโปร่ง ๆ
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 6,
  },
  modalText: {
    fontSize: 14,
    color: '#7A869A',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    minWidth: 90,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalButtonSecondary: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalButtonPrimary: {
    backgroundColor: '#EF9F27',
  },
  modalButtonSecondaryText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  voucherInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  voucherButton: {
    marginLeft: 16,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFB800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
