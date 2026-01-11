// src/api/food.ts
import api from "./client";

export type FoodItem = {
  id?: number;
  name: string;
  price: number;
  isAvailable?: boolean;
  createdAt?: string;
};

export type CreateFood = {
  name: string;
  price: number;
  isAvailable?: boolean;
};

export const FoodApi = {
  list: () => api.get<FoodItem[]>("/FoodItems").then((r) => r.data),
  create: (payload: CreateFood) => api.post<FoodItem>("/FoodItems", payload).then((r) => r.data),
  update: (id: number, payload: CreateFood) => api.put<void>(`/FoodItems/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete<void>(`/FoodItems/${id}`).then((r) => r.data),
};
