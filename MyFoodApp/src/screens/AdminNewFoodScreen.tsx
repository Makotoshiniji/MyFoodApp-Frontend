import React, { useState } from 'react';
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
import api from '../api/client';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AdminNewFoodScreen({ route, navigation }: any) {
  // รับ shopId จาก Tab Params
  const { shopId } = route.params || {};

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });
    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleCreate = async () => {
    if (!name || !price)
      return Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อและราคา');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('shopId', shopId); // ต้องมี shopId
      formData.append('name', name);
      formData.append('description', desc);
      formData.append('price', price);
      formData.append('type', type);
      formData.append('isAvailable', isAvailable.toString());

      if (image) {
        formData.append('file', {
          uri: image.uri,
          type: image.type,
          name: image.fileName || 'food.jpg',
        } as any);
      }

      // เรียก API POST
      await api.post(`/menuitems`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('สำเร็จ', 'เพิ่มเมนูใหม่เรียบร้อย', [
        {
          text: 'OK',
          onPress: () => {
            // รีเซ็ตค่า
            setName('');
            setDesc('');
            setPrice('');
            setType('');
            setImage(null);
            // กระโดดกลับไปหน้ารายการอาหาร
            navigation.navigate('AdminFoodList');
          },
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'เพิ่มเมนูไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add New Item</Text>

        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.imageUploader}
          onPress={handleSelectImage}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.uploadedImg} />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name="camera-plus"
                size={40}
                color="#9CA3AF"
              />
              <Text style={styles.placeholderText}>Upload Photo</Text>
            </View>
          )}
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
            <Text style={styles.label}>Price ($)</Text>
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
          <Text style={styles.label}>Available Now?</Text>
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
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>CREATE ITEM</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 30,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
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
  },
  uploadedImg: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 8, color: '#9CA3AF', fontWeight: '600' },
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
    marginTop: 16,
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
  backBtn: {
    width: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    width: 60, // 🔥 สำคัญมาก
    fontSize: 16,
    color: '#FF7622',
  },
});
