// src/api/client.ts
import axios from 'axios';

// ✅ Base URL ของ backend ASP.NET Core
// 10.0.2.2 ใช้ตอนรัน Android Emulator (เชื่อม localhost ของเครื่องเรา)
export const API_BASE = 'http://10.0.2.2:7284/api';
// export const API_BASE = "http://10.0.2.2:6445/api";

// ✅ ตั้งค่า axios instance ตัวหลัก
const api = axios.create({
  // baseURL: API_BASE, // baseURL มี /api แล้ว ดังนั้นตอนเรียกใช้ไม่ต้องใส่ /api ซ้ำ
  // headers: {
  //   "Content-Type": "application/json",
  // },
  baseURL: API_BASE,
});

// ✅ Interceptor สำหรับดู error เวลา debug
api.interceptors.response.use(
  response => response,
  error => {
    const info = {
      url: error?.response?.config?.url,
      method: error?.response?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
    };

    console.log('API Error:', info); // ✅ ตอนนี้ไม่ error แล้ว
    return Promise.reject(error);
  },
);

export const updateCartItem = async (
  cartItemId: number,
  quantity: number,
  specialRequest: string,
  optionIds: number[],
) => {
  const response = await api.put(`/carts/update-item/${cartItemId}`, {
    quantity,
    specialRequest,
    optionIds,
  });
  return response.data;
};

export default api;
