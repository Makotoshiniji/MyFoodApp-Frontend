import api from './client';

export const ShopApi = {
  // เช็คสถานะเจ้าของร้าน
  checkOwner: async (userId: number) => {
    const res = await api.get(`/shops/check-owner/${userId}`);
    return res.data; // { hasShop: boolean, shopId?: number }
  },

  // สมัครร้านค้า
  register: async (data: {
    ownerUserId: number;
    name: string;
    description: string;
    phone: string;
  }) => {
    const res = await api.post('/shops/register', data);
    return res.data;
  },
};
