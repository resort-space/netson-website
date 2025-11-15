import { NextApiRequest } from 'next';
import { Category, Product, Image, Article, SiteSetting, ProductVariant } from '../lib/database';

export interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// NetSon API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Re-export NetSon types from database
export type { Category, Product, Image, Article, SiteSetting, ProductVariant };

// Admin API types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    role: string;
  };
  message?: string;
}

// Product management types
export interface CreateProductRequest {
  title: string;
  description?: string;
  category_id?: number;
  price?: number;
  meta_description?: string;
  is_featured?: boolean;
  is_active?: boolean;
  materials?: string;
  customization_available?: boolean;
}

export interface UpdateProductRequest extends CreateProductRequest {
  slug?: string;
  stock_quantity?: number;
  weight_grams?: number;
  dimensions_cm?: any;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  og_image?: string;
  is_published?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
}

export interface UpdateArticleRequest extends CreateArticleRequest {
  slug?: string;
}

// Image upload types
export interface CloudinaryUploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface ImageUploadResponse {
  success: boolean;
  data?: CloudinaryUploadResponse[];
  message?: string;
  error?: string;
}

// Search and filter types
export interface ProductFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  is_featured?: boolean;
  search?: string;
  sort_by?: 'default' | 'popular' | 'rating' | 'latest' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export interface ArticleFilters {
  category?: string;
  featured?: boolean;
  published?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
