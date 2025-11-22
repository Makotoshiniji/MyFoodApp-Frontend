import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api, { API_BASE } from '../api/client';

const getFullUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const host = API_BASE.replace('/api', '');
  return `${host}${path}`;
};

export default function ProfileSettingScreen({ route, navigation }: any) {
  const { userId } = route.params;

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [currentProfileUrl, setCurrentProfileUrl] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${userId}`);
      const u = res.data;
      setFullName(u.username);
      setEmail(u.email);
      setPhone(u.phoneNumber || '');
      setBio(u.bio || '');
      setCurrentProfileUrl(u.userProfilePath);
    } catch (err) {
      console.error('Error loading user data:', err);
      Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลได้');
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
      setProfileImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. อัปเดตข้อมูล Text
      await api.put(`/users/${userId}`, {
        username: fullName,
        email: email,
        phoneNumber: phone,
        bio: bio,
      });

      // 2. อัปโหลดรูป (ถ้าเลือกใหม่)
      if (profileImage) {
        const formData = new FormData();
        formData.append('file', {
          uri: profileImage.uri,
          type: profileImage.type,
          name: profileImage.fileName || 'profile.jpg',
        } as any);

        await api.post(`/users/${userId}/upload-profile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const displayImageUri = profileImage?.uri
    ? profileImage.uri
    : getFullUrl(currentProfileUrl);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* ปุ่มย้อนกลับ */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {displayImageUri ? (
              <Image source={{ uri: displayImageUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#FFD89D' }]} />
            )}

            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={handleSelectImage}
            >
              <Text style={styles.pencilIcon}>✎</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>ชื่อ-นามสกุล</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="ชื่อของคุณ"
        />

        <Text style={styles.label}>อีเมล</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="อีเมล"
          keyboardType="email-address"
          editable={false} // อีเมลอาจจะไม่ให้แก้ ถ้าแก้ต้องมีระบบยืนยัน
        />

        <Text style={styles.label}>เบอร์โทรศัพท์</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="เบอร์โทรศัพท์"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>แนะนำตัว</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={bio}
          onChangeText={setBio}
          placeholder="เขียนแนะนำตัวเองสั้นๆ..."
          multiline
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0F5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  scrollContent: { padding: 24 },

  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
  },
  editIconBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF7622',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  pencilIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  label: {
    fontSize: 13,
    color: '#32343E',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F0F5FA',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },

  saveBtn: {
    backgroundColor: '#FF7622',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
    shadowColor: '#FF7622',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
