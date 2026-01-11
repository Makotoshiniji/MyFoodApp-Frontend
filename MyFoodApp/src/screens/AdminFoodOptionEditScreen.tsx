import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../api/client'; // ตรวจสอบ path ให้ถูกต้อง

// Types สำหรับ State ภายในหน้านี้
interface OptionItem {
  name: string;
  extraPrice: string; // ใช้ string เพื่อให้ง่ายต่อการพิมพ์ใน TextInput
  isDefault: boolean;
}

interface OptionGroup {
  id?: number; // ถ้ามี id แปลว่าเป็นของเดิม (เอาไว้เช็คได้)
  name: string;
  isRequired: boolean;
  minSelect: string;
  maxSelect: string;
  options: OptionItem[];
}

const AdminFoodOptionEditScreen = ({ route, navigation }: any) => {
  const { foodId, foodName } = route.params;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<OptionGroup[]>([]);

  // --- Init Data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // ดึงข้อมูล Detail ของเมนู (ซึ่ง backend จะส่ง OptionGroups มาให้ด้วย)
      const res = await api.get(`/menuitems/${foodId}/detail`);
      const data = res.data;

      if (data.optionGroups) {
        // แปลงข้อมูลจาก API เข้า State
        const loadedGroups = data.optionGroups.map((g: any) => ({
          id: g.id,
          name: g.name,
          isRequired: g.isRequired,
          minSelect: g.minSelect.toString(),
          maxSelect: g.maxSelect.toString(),
          options: g.options.map((o: any) => ({
            name: o.name,
            extraPrice: o.extraPrice.toString(),
            isDefault: o.isDefault,
          })),
        }));
        setGroups(loadedGroups);
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลตัวเลือกได้');
    } finally {
      setLoading(false);
    }
  };

  // --- Logic Handlers ---

  // 1. จัดการ Group
  const addGroup = () => {
    setGroups([
      ...groups,
      {
        name: 'กลุ่มตัวเลือกใหม่',
        isRequired: false,
        minSelect: '0',
        maxSelect: '1',
        options: [],
      },
    ]);
  };

  const removeGroup = (index: number) => {
    Alert.alert('ยืนยันลบ', 'ต้องการลบกลุ่มตัวเลือกนี้ใช่ไหม?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const newGroups = [...groups];
          newGroups.splice(index, 1);
          setGroups(newGroups);
        },
      },
    ]);
  };

  const updateGroup = (index: number, field: keyof OptionGroup, value: any) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setGroups(newGroups);
  };

  // 2. จัดการ Option ใน Group
  const addOptionToGroup = (groupIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options.push({
      name: '',
      extraPrice: '0',
      isDefault: false,
    });
    setGroups(newGroups);
  };

  const removeOptionFromGroup = (groupIndex: number, optionIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].options.splice(optionIndex, 1);
    setGroups(newGroups);
  };

  const updateOption = (
    groupIndex: number,
    optionIndex: number,
    field: keyof OptionItem,
    value: any,
  ) => {
    const newGroups = [...groups];
    const opts = newGroups[groupIndex].options;
    opts[optionIndex] = { ...opts[optionIndex], [field]: value };
    setGroups(newGroups);
  };

  // --- Save Handler ---
  const handleSave = async () => {
    setSubmitting(true);
    try {
      // 1. เตรียมข้อมูลให้ตรงกับ DTO ที่ Backend ต้องการ (OptionGroupJsonDto)
      const optionsJson = groups.map(g => ({
        name: g.name,
        isRequired: g.isRequired,
        minSelect: parseInt(g.minSelect) || 0,
        maxSelect: parseInt(g.maxSelect) || 1,
        options: g.options.map(o => ({
          name: o.name,
          extraPrice: parseFloat(o.extraPrice) || 0,
          isDefault: o.isDefault,
        })),
      }));

      // 2. ส่งไป Update ที่ MenuItem (เพราะ Backend เราเขียนให้แก้ผ่าน MenuItem PUT)
      // เราต้องส่ง FormData ไป เพราะ Controller รับ [FromForm]
      const formData = new FormData();

      // เราต้องส่งข้อมูลเดิมของเมนูไปด้วย (ชื่อ ราคา ฯลฯ) ไม่งั้นมันอาจจะหาย หรือ Error
      // แต่ใน API PUT menuitems/{id} ของคุณ มันเช็ค null ได้
      // ทริค: ส่งแค่ optionsJson ไป ส่วนชื่อ/ราคา ให้ส่งค่าเดิม (หรือถ้า Backend ยอมรับ null ก็ไม่ต้องส่ง)
      // เพื่อความชัวร์ เราควรดึงค่าเดิมมาใส่ แต่ในที่นี้เราจะส่งเฉพาะ OptionsJson
      // *หมายเหตุ: ถ้า Backend คุณเขียนทับทุก field คุณต้อง fetch ข้อมูลเมนูมาใส่ใน formData ด้วย* // สมมติว่า Backend Update เฉพาะ field ที่ส่งมา หรือเราต้องส่ง name, price เดิมไปด้วย

      // ดึงข้อมูลปัจจุบันอีกรอบเพื่อความชัวร์ หรือใช้ค่าจาก params ถ้ามี
      const detailRes = await api.get(`/menuitems/${foodId}/detail`);
      const currentData = detailRes.data;

      formData.append('shopId', currentData.shopId);
      formData.append('name', currentData.name);
      formData.append('description', currentData.description || '');
      formData.append('price', currentData.price);
      formData.append('type', currentData.type || '');
      formData.append('isAvailable', currentData.isAvailable.toString());

      // พระเอกของเรา:
      formData.append('optionsJson', JSON.stringify(optionsJson));

      await api.put(`/menuitems/${foodId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('สำเร็จ', 'บันทึกข้อมูลตัวเลือกเรียบร้อย', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log('Save Error:', err);
      Alert.alert('Error', 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          จัดการตัวเลือก: {foodName}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FF7622" />
          ) : (
            <Text style={styles.saveText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {groups.map((group, gIndex) => (
          <View key={gIndex} style={styles.groupCard}>
            {/* Header ของ Group */}
            <View style={styles.groupHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  ชื่อกลุ่มตัวเลือก (เช่น ขนาด, ความหวาน)
                </Text>
                <TextInput
                  style={styles.inputBold}
                  value={group.name}
                  onChangeText={val => updateGroup(gIndex, 'name', val)}
                  placeholder="ระบุชื่อกลุ่ม"
                />
              </View>
              <TouchableOpacity
                onPress={() => removeGroup(gIndex)}
                style={styles.deleteGroupBtn}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color="#FF4444"
                />
              </TouchableOpacity>
            </View>

            {/* Config ของ Group */}
            <View style={styles.rowConfig}>
              <View style={styles.switchContainer}>
                <Text style={styles.smallLabel}>ต้องเลือกอย่างน้อย 1 ข้อ?</Text>
                <Switch
                  value={group.isRequired}
                  onValueChange={val => updateGroup(gIndex, 'isRequired', val)}
                  trackColor={{ false: '#ddd', true: '#FF7622' }}
                />
              </View>
              <View style={styles.numConfig}>
                <View>
                  <Text style={styles.smallLabel}>Min</Text>
                  <TextInput
                    style={styles.numInput}
                    value={group.minSelect}
                    keyboardType="numeric"
                    onChangeText={val => updateGroup(gIndex, 'minSelect', val)}
                  />
                </View>
                <View>
                  <Text style={styles.smallLabel}>Max</Text>
                  <TextInput
                    style={styles.numInput}
                    value={group.maxSelect}
                    keyboardType="numeric"
                    onChangeText={val => updateGroup(gIndex, 'maxSelect', val)}
                  />
                </View>
              </View>
            </View>

            {/* รายการ Options ภายใน Group */}
            <View style={styles.optionList}>
              {group.options.map((opt, oIndex) => (
                <View key={oIndex} style={styles.optionRow}>
                  <TextInput
                    style={[styles.input, { flex: 2, marginRight: 5 }]}
                    placeholder="ชื่อตัวเลือก (เช่น หวานน้อย)"
                    value={opt.name}
                    onChangeText={val =>
                      updateOption(gIndex, oIndex, 'name', val)
                    }
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, marginRight: 5, textAlign: 'right' },
                    ]}
                    placeholder="+ราคา"
                    keyboardType="numeric"
                    value={opt.extraPrice}
                    onChangeText={val =>
                      updateOption(gIndex, oIndex, 'extraPrice', val)
                    }
                  />
                  <TouchableOpacity
                    onPress={() => removeOptionFromGroup(gIndex, oIndex)}
                    style={{ padding: 5 }}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addOptionBtn}
                onPress={() => addOptionToGroup(gIndex)}
              >
                <Text style={styles.addOptionText}>+ เพิ่มตัวเลือกย่อย</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addGroupBtn} onPress={addGroup}>
          <Text style={styles.addGroupText}>+ เพิ่มกลุ่มตัวเลือกใหม่</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50, // for notch
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  saveText: { color: '#FF7622', fontWeight: 'bold', fontSize: 16 },

  content: { padding: 15 },

  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  deleteGroupBtn: {
    padding: 5,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
  },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  smallLabel: { fontSize: 10, color: '#888', marginBottom: 2 },
  input: {
    backgroundColor: '#F0F5FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  inputBold: {
    backgroundColor: '#F0F5FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: '100%',
  },
  rowConfig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numConfig: {
    flexDirection: 'row',
    gap: 10,
  },
  numInput: {
    backgroundColor: '#F0F5FA',
    borderRadius: 8,
    padding: 5,
    width: 50,
    textAlign: 'center',
    fontSize: 14,
  },

  optionList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOptionBtn: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  addOptionText: { color: '#FF7622', fontWeight: '600', fontSize: 14 },

  addGroupBtn: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addGroupText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AdminFoodOptionEditScreen;
