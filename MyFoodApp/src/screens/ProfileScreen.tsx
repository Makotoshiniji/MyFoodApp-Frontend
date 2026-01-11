import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { API_BASE } from '../api/client';
import { CommonActions } from '@react-navigation/native';
import { ShopApi } from '../api/shop';

// ฟังก์ชันแปลง URL รูปภาพ
const toAbsolute = (p?: string | null) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const host = API_BASE.replace('/api', '');
  return `${host}${p.startsWith('/') ? '' : '/'}${p}`;
};

// ✅ Component เมนูย่อย (ใช้ Emoji)
const ProfileMenuItem = ({
  emoji,
  label,
  onPress,
  iconBg = '#FFF0E8',
}: any) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
      <Text style={styles.emojiIcon}>{emoji}</Text>
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.chevron}>{'>'}</Text>
  </TouchableOpacity>
);

export default function ProfileScreen({ onLogout }: any) {
  // รับ onLogout มาจาก App.tsx
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params || {};

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชัน Logout ที่ถูกต้อง (ใช้ onLogout ถ้ามี หรือใช้ dispatch)
  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณแน่ใจหรือไม่ที่จะออกจากระบบ?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออก',
        style: 'destructive',
        onPress: () => {
          if (onLogout) {
            onLogout();
          } else {
            // Fallback ถ้าไม่ได้ส่ง onLogout มา
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
            );
          }
        },
      },
    ]);
  };

  // โหลดข้อมูล User
  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoading(false);
        return;
      }
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/users/${userId}`);
          setUser(response.data);
        } catch (err) {
          console.error('Error loading profile:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchUserProfile();
    }, [userId]),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  const avatarUrl = toAbsolute(user?.userProfilePath);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerIcon}>{'❮'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Profile Info --- */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.username || 'Guest User'}</Text>
          <Text style={styles.userBio}>{user?.bio || 'I love fast food'}</Text>
        </View>

        {/* --- Menu Group 1: Personal --- */}
        <View style={styles.menuGroup}>
          <ProfileMenuItem
            emoji="👤"
            label="Personal Info"
            onPress={() =>
              navigation.navigate('ProfileSetting', { userId, user })
            }
          />
          <ProfileMenuItem
            emoji="📍"
            label="Addresses"
            iconBg="#F0F0FF"
            onPress={() => {}}
          />
        </View>

        {/* --- Menu Group 2: App Features --- */}
        <View style={styles.menuGroup}>
          <ProfileMenuItem
            emoji="🏪"
            label="Go to My Shop"
            iconBg="#FFF8E1"
            onPress={async () => {
              try {
                const data = await ShopApi.checkOwner(userId);
                if (data.hasShop) {
                  navigation.navigate('MainAdminShop', {
                    userId,
                    shopId: data.shopId,
                  });
                } else {
                  navigation.navigate('RegisterShop', { userId });
                }
              } catch (err) {
                console.error(err);
                Alert.alert('Error', 'ตรวจสอบข้อมูลร้านค้าไม่ได้');
              }
            }}
          />

          <ProfileMenuItem
            emoji="🏠"
            label="Go to Home"
            iconBg="#E0F7FA" // สีฟ้าอ่อนๆ
            onPress={() => {
              // ใช้ reset เพื่อกลับไปหน้าแรกสุดและล้าง stack เดิม
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                }),
              );
              // หรือถ้าแค่อยากกลับไปเฉยๆ ใช้: navigation.navigate('Home');
            }}
          />

          {/* เมนูเดิมอื่นๆ */}
          <ProfileMenuItem
            emoji="🛒"
            label="Cart"
            iconBg="#E8F5FF"
            onPress={() => navigation.navigate('AllCart', { userId })}
          />
          <ProfileMenuItem
            emoji="❤️"
            label="Favourite"
            iconBg="#FFEAEA"
            onPress={() => {}}
          />
          <ProfileMenuItem
            emoji="🔔"
            label="Notifications"
            iconBg="#FFF0E8"
            onPress={() => {}}
          />
          <ProfileMenuItem
            emoji="🧾" // เปลี่ยน Emoji ให้สื่อถึงบิล (หรือใช้ 💳 อันเดิมก็ได้)
            label="Bill History" // หรือใช้ชื่อ Payment Method ตามเดิม
            iconBg="#F0F0FF"
            onPress={() => {
              // เชื่อมต่อไปยังหน้า BillHistoryScreen พร้อมส่ง userId
              navigation.navigate('BillHistory', { userId });
            }}
          />
        </View>

        {/* --- Menu Group 3: Support & Settings --- */}
        <View style={styles.menuGroup}>
          <ProfileMenuItem
            emoji="❓"
            label="FAQs"
            iconBg="#FFF0E8"
            onPress={() => {}}
          />
          <ProfileMenuItem
            emoji="⭐"
            label="User Reviews"
            iconBg="#E8F5FF"
            onPress={() => {}}
          />
          <ProfileMenuItem
            emoji="⚙️"
            label="Settings"
            iconBg="#F0F0FF"
            onPress={() => {}}
          />
        </View>

        {/* --- Logout Button --- */}
        <View style={[styles.menuGroup, { marginBottom: 40 }]}>
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <View style={[styles.logoutIconWrapper]}>
              <Text style={styles.emojiIcon}>🚪</Text>
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#F9FBFC',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#181C2E' },
  headerBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerIcon: { fontSize: 20 },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },

  // Profile Info
  profileSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFD27C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { backgroundColor: '#FFD27C' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#181C2E',
    marginBottom: 6,
  },
  userBio: { fontSize: 14, color: '#A0A5BA', fontWeight: '500' },

  // Menu Groups
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#D3D1D8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emojiIcon: { fontSize: 20 },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#181C2E',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chevron: { fontSize: 18, color: '#C4C4C4', fontWeight: 'bold' },

  // Logout Specific
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#FF4B4B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
