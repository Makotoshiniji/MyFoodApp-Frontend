import React, { useState, useEffect } from 'react';
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

      const res = await api.get(`/MenuItems/${menuItemId}/detail`);
      const data = res.data;

      setName(data.name);
      setDesc(data.description || '');
      setPrice(data.price.toString());
      setType((data as any).type || '');

      const avail =
        (data as any).isAvailable ?? (data as any).is_available ?? true;
      setIsAvailable(!!avail);

      const realShopId = data.shopId || (data as any).shop_id || paramShopId;
      if (realShopId) setCurrentShopId(realShopId);

      // --- Logic รูปภาพ ---
      const rawPath = data.imageUrl || data.image_url;

      if (rawPath) {
        const baseUrl = api.defaults.baseURL
          ? api.defaults.baseURL.replace(/\/api\/?$/, '')
          : 'http://10.0.2.2:7284';

        let path = rawPath.replace(/\\/g, '/');

        if (path.startsWith('http')) {
          setExistingImage(path);
        } else {
          if (!path.includes('/')) {
            if (realShopId) {
              path = `/shop_uploads/menu/${realShopId}/${path}`;
            } else {
              path = `/shop_uploads/menuitems/${path}`;
            }
          } else {
            if (!path.startsWith('/')) path = '/' + path;
            if (!path.includes('/shop_uploads')) path = '/shop_uploads' + path;
          }

          const finalUrl = `${baseUrl}${path}`;
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

          {/* 🟢 ส่วนที่แก้ไข: ใช้รูปไอคอน edit_icon.png แทน */}
          <View style={styles.editImageBadge}>
            <Image
              source={require('../../assets/images/edit_icon.png')}
              style={{ width: 24, height: 24, tintColor: '#fff' }}
              resizeMode="contain"
            />
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
    // เพิ่มให้จัดกึ่งกลางรูปไอคอน
    justifyContent: 'center',
    alignItems: 'center',
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
