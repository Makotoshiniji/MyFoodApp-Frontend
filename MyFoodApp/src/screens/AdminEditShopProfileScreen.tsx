// src/screens/AdminEditShopProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker'; // 📦 อย่าลืม npm install react-native-image-picker
import api, { API_BASE } from '../api/client';

export default function AdminEditShopProfileScreen({ route, navigation }: any) {
  const { shopId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');

  // 🖼️ State สำหรับรูปภาพ
  const [imageUri, setImageUri] = useState<string | null>(null); // รูปที่โชว์ (URL หรือ Local Path)
  const [newImage, setNewImage] = useState<any>(null); // ไฟล์รูปใหม่ที่จะอัปโหลด

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Helper: แปลง URL รูปให้ถูกต้อง
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return { uri: path };
    const baseUrl = API_BASE.replace('/api', '');
    return { uri: `${baseUrl}${path}` };
  };

  useEffect(() => {
    fetchShopData();
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const res = await api.get(`/Shops/${shopId}`);
      const shop = res.data;

      setName(shop.name);
      setDescription(shop.description);
      setPhone(shop.phone);

      // หา URL รูปโปรไฟล์เดิม (จาก media type 'promo')
      const promoMedia = shop.media?.find((m: any) => m.kind === 'promo');
      if (promoMedia) {
        const fullUrl = getImageUrl(promoMedia.url)?.uri;
        setImageUri(fullUrl || null);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'ไม่สามารถดึงข้อมูลร้านค้าได้');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  // 📸 ฟังก์ชันเลือกรูป
  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel) return;
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri || null); // โชว์รูปที่เลือกทันที
      setNewImage(asset); // เก็บไฟล์ไว้เตรียมอัปโหลด
    }
  };

  const handleSave = async () => {
    if (!name || !phone) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อร้านและเบอร์โทรศัพท์');
      return;
    }

    setLoading(true);
    try {
      // ✅ ใช้ FormData แทน JSON
      const formData = new FormData();
      formData.append('Name', name);
      formData.append('Description', description || '');
      formData.append('Phone', phone);

      // ถ้ามีการเลือกรูปใหม่ ให้ใส่เข้าไปด้วย
      if (newImage) {
        const fileName = newImage.fileName || 'shop_profile.jpg';
        formData.append('ImageFile', {
          uri: newImage.uri,
          type: newImage.type || 'image/jpeg',
          name: fileName,
        } as any);
      }

      // ส่งแบบ Multipart
      await api.put(`/Shops/${shopId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF7622" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขข้อมูลร้านค้า</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 📸 ส่วนเลือกรูปโปรไฟล์ */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            onPress={handleSelectImage}
            style={styles.imageWrapper}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.shopImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="storefront-outline" size={40} color="#94A3B8" />
                <Text style={styles.placeholderText}>เพิ่มรูป</Text>
              </View>
            )}
            {/* ไอคอนกล้องเล็กๆ มุมขวาล่าง */}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ชื่อร้านค้า</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="ระบุชื่อร้าน"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>คำอธิบายร้าน</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="ระบุรายละเอียดร้าน..."
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>เบอร์โทรศัพท์</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="ระบุเบอร์โทรศัพท์"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    paddingTop: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  backBtn: { padding: 5 },
  content: { padding: 20 },

  // Styles สำหรับรูปภาพ
  imageSection: { alignItems: 'center', marginBottom: 25 },
  imageWrapper: { position: 'relative' },
  shopImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF7622',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    marginTop: 8,
    color: '#FF7622',
    fontSize: 14,
    fontWeight: '600',
  },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#FF7622',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF7622',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
