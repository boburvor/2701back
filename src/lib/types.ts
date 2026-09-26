export interface User {
  _id?: string;
  id?: string;
  username: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  gender?: string;
  age?: number | null;
  country?: string;
  region?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
  role: string;
  createdAt?: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category?: string;
  stock?: number;
  description?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: { id: string; username: string; role: string };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  gender?: string;
  country?: string;
  region?: string;
  district?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface MeResponse {
  message: string;
  user: User;
}

export interface ProductListResponse {
  count: number;
  products: Product[];
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  icon?: string;
  sortOrder?: number;
}

export interface CategoryListResponse {
  count: number;
  categories: Category[];
}

export interface UpdateRolePayload {
  role: "user" | "admin";
}