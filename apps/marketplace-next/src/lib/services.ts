import { api } from './api';

export interface Shop {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  logo?: string;
  banner?: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  activity?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  followerCount?: number;
  isVerified?: boolean;
  isApproved?: boolean;
  isOpen?: boolean;
  socialLinks?: Record<string, string>;
  coverImage?: string;
  productCount?: number;
  pageDesign?: Record<string, any>;
}

export interface Product {
  id: string;
  shopId: string;
  shopName?: string;
  shopSlug?: string;
  name: string;
  description?: string;
  price?: number;
  oldPrice?: number;
  currency?: string;
  images?: string[];
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  readTime?: string;
}

export async function getShops(take = 100): Promise<Shop[]> {
  try {
    const data = await api.get<any>(`/shops?take=${take}`, { revalidate: 300, tags: ['shops'] });
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  try {
    return await api.get<Shop>(`/shops/${slug}`, { revalidate: 300, tags: [`shop:${slug}`] });
  } catch {
    return null;
  }
}

export async function getProducts(shopId: string, limit = 12): Promise<Product[]> {
  try {
    const data = await api.get<any>(`/shops/${shopId}/products?limit=${limit}`, {
      revalidate: 300,
      tags: [`products:${shopId}`],
    });
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await api.get<Product>(`/products/${id}`, { revalidate: 300, tags: [`product:${id}`] });
  } catch {
    return null;
  }
}

export async function getOffers(category?: string): Promise<Product[]> {
  try {
    const path = category ? `/offers?category=${category}` : '/offers';
    const data = await api.get<any>(path, { revalidate: 300, tags: ['offers'] });
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const data = await api.get<any>('/blog', { revalidate: 3600, tags: ['blog'] });
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await api.get<BlogPost>(`/blog/${slug}`, { revalidate: 3600, tags: [`blog:${slug}`] });
  } catch {
    return null;
  }
}
