import { Shop, Product, Offer, Reservation, Category, ShopGallery } from '../types';
import {
  BackendRequestError,
  backendDelete,
  backendGet,
  backendPatch,
  backendPost,
  backendPut,
  disablePathPrefix,
  toBackendUrl,
} from './api/httpClient';
import {
  normalizeOrderFromBackend,
  normalizeProductFromBackend,
  normalizeShopFromBackend,
} from './api/normalizers';
import {
  devMerchantLoginViaBackend,
  loginViaBackend,
  sessionViaBackend,
  signupViaBackend,
} from './api/modules/auth';
import {
  getMyNotificationsViaBackend,
  getMyUnreadNotificationsCountViaBackend,
  getShopNotificationsViaBackend,
  markMyNotificationReadViaBackend,
  markMyNotificationsReadViaBackend,
  markShopNotificationReadViaBackend,
  markShopNotificationsReadViaBackend,
  subscribeToNotificationsViaBackend,
} from './api/modules/notifications';
import {
  addShopGalleryImageFileViaBackend,
  deleteShopGalleryImageViaBackend,
  followShopViaBackend,
  getMyShopViaBackend,
  getShopAdminByIdViaBackend,
  getShopAnalyticsViaBackend,
  getShopBySlugOrIdViaBackend,
  getShopBySlugViaBackend,
  getShopGalleryViaBackend,
  getShopsViaBackend,
  incrementVisitorsViaBackend,
  updateMyShopViaBackend,
  updateShopDesignViaBackend,
  updateShopStatusViaBackend,
  uploadMyShopBannerViaBackend,
} from './api/modules/shops';
import {
  createOfferViaBackend,
  deleteOfferViaBackend,
  getOfferByIdViaBackend,
  getOfferByProductIdViaBackend,
  getOffersViaBackend,
} from './api/modules/offers';
import {
  addProductViaBackend,
  deleteProductViaBackend,
  getProductByIdViaBackend,
  getProductsForManageViaBackend,
  getProductsViaBackend,
  updateProductStockViaBackend,
  updateProductViaBackend,
} from './api/modules/products';
import {
  assignCourierToOrderViaBackend,
  getAllOrdersViaBackend,
  getCourierOrdersViaBackend,
  placeOrderViaBackend,
  updateCourierOrderViaBackend,
  updateOrderViaBackend,
} from './api/modules/orders';
import {
  addReservationViaBackend,
  getReservationsViaBackend,
  updateReservationStatusViaBackend,
} from './api/modules/reservations';
import {
  createCourierViaBackend,
  deleteUserViaMock,
  getAllUsersViaMock,
  getCouriersViaBackend,
  updateUserRoleViaMock,
} from './api/modules/users';
import {
  getPendingShopsViaBackend,
  getSystemActivityViaBackend,
  getSystemAnalyticsTimeseriesViaBackendWithFallback,
  getSystemAnalyticsViaBackendWithFallback,
} from './api/modules/analytics';
import {
  convertReservationToCustomerViaBackendWithFallback,
  getShopCustomersViaBackendWithFallback,
  sendCustomerPromotionViaBackendWithFallback,
  updateCustomerStatusViaBackendWithFallback,
} from './api/modules/customers';
import {
  createThemeViaMock,
  deleteThemeViaMock,
  getThemeTemplatesViaMock,
  updateThemeViaMock,
} from './api/modules/themes';
import { getFeedbackViaMock, saveFeedbackViaMock } from './api/modules/feedback';
import {
  getMerchantChatsViaMock,
  getMessagesViaMock,
  sendMessageViaMock,
  subscribeToMessagesViaMock,
} from './api/modules/chat';
import { mockDb } from './api/mockDb';

 let rayDbUpdateTimer: any;
 function dispatchRayDbUpdateDebounced() {
   try {
     if (rayDbUpdateTimer) clearTimeout(rayDbUpdateTimer);
     rayDbUpdateTimer = setTimeout(() => {
       try {
         window.dispatchEvent(new Event('ray-db-update'));
       } catch {
         // ignore
       }
     }, 150);
   } catch {
     // ignore
   }
 }

function getLocalShopIdFromStorage(): string | undefined {
  try {
    const raw = localStorage.getItem('ray_user');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed?.shopId) return String(parsed.shopId);
    if (parsed?.shop_id) return String(parsed.shop_id);
    return undefined;
  } catch {
    return undefined;
  }
}

function getLocalUserRoleFromStorage(): string | undefined {
  try {
    const raw = localStorage.getItem('ray_user');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed?.role) return String(parsed.role);
    return undefined;
  } catch {
    return undefined;
  }
}

export const ApiService = {
  // Auth
  login: async (email: string, pass: string) => {
    return await loginViaBackend(email, pass);
  },
  uploadMedia: async (payload: { file: File; purpose?: string; shopId?: string }) => {
    const file = payload?.file;
    if (!file) throw new Error('Missing file');

    const form = new FormData();
    form.append('file', file);
    if (typeof payload?.purpose === 'string') form.append('purpose', payload.purpose);
    if (typeof payload?.shopId === 'string') form.append('shopId', payload.shopId);

    return await backendPost<{ url: string; key: string }>('/api/v1/media/upload', form);
  },
  presignMediaUpload: async (payload: {
    mimeType: string;
    size?: number;
    fileName?: string;
    purpose?: string;
    shopId?: string;
  }) => {
    return await backendPost<{ uploadUrl: string; key: string; publicUrl: string; expiresIn?: number }>(
      '/api/v1/media/presign',
      {
        mimeType: String(payload?.mimeType || '').trim(),
        ...(typeof payload?.size === 'number' ? { size: payload.size } : {}),
        ...(typeof payload?.fileName === 'string' ? { fileName: payload.fileName } : {}),
        ...(typeof payload?.purpose === 'string' ? { purpose: payload.purpose } : {}),
        ...(typeof payload?.shopId === 'string' ? { shopId: payload.shopId } : {}),
      },
    );
  },
  uploadFileToPresignedUrl: async (uploadUrl: string, file: File) => {
    const rawUrl = String(uploadUrl || '').trim();
    if (!rawUrl) throw new Error('Missing uploadUrl');
    if (!file) throw new Error('Missing file');

    const url = rawUrl.startsWith('/') ? toBackendUrl(rawUrl) : rawUrl;
    const backendBase = toBackendUrl('/').replace(/\/+$/, '');
    const isBackendUpload = url.startsWith(backendBase);

    let token = '';
    if (isBackendUpload) {
      try {
        token = localStorage.getItem('ray_token') || '';
      } catch {
        token = '';
      }
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': String((file as any)?.type || 'application/octet-stream'),
        ...(isBackendUpload && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: file,
    });

    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`);
    }

    return true;
  },
  devMerchantLogin: async (opts?: { shopCategory?: string }) => {
    return await devMerchantLoginViaBackend(opts);
  },
  bootstrapAdmin: async (payload: { token: string; email: string; password: string; name?: string }) => {
    return await backendPost<{ ok: boolean; userId?: string }>('/api/v1/auth/bootstrap-admin', {
      token: String(payload?.token || '').trim(),
      email: String(payload?.email || '').trim(),
      password: String(payload?.password || ''),
      name: payload?.name,
    });
  },
  session: async () => {
    return await sessionViaBackend();
  },
  signup: async (data: any) => {
    return await signupViaBackend(data);
  },
  logout: async () => {
    try {
      return await backendPost<{ ok: boolean }>('/api/v1/auth/logout', {});
    } catch {
      return { ok: true } as any;
    }
  },
  forgotPassword: async (payload: { email: string }) => {
    return await backendPost<any>('/api/v1/auth/password/forgot', {
      email: String(payload?.email || '').trim(),
    });
  },
  resetPassword: async (payload: { token: string; newPassword: string }) => {
    return await backendPost<any>('/api/v1/auth/password/reset', {
      token: String(payload?.token || '').trim(),
      newPassword: String(payload?.newPassword || ''),
    });
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    return await backendPost<any>('/api/v1/auth/password/change', {
      currentPassword: String(payload?.currentPassword || ''),
      newPassword: String(payload?.newPassword || ''),
    });
  },

  // Chat
  sendMessage: async (msg: any) => {
    return await sendMessageViaMock(mockDb, msg);
  },
  getMessages: async (shopId: string, userId: string) => {
    return await getMessagesViaMock(mockDb, shopId, userId);
  },
  getMerchantChats: async (shopId: string) => {
    return await getMerchantChatsViaMock(mockDb, shopId);
  },
  subscribeToMessages: (shopId: string, callback: (payload: any) => void) => {
    return subscribeToMessagesViaMock(mockDb, shopId, callback);
  },

  // Notifications
  subscribeToNotifications: (shopId: string, callback: (payload: any) => void) => {
    return subscribeToNotificationsViaBackend(shopId, callback);
  },
  getNotifications: async (shopId: string) => {
    const sid = String(shopId || '').trim();
    if (!sid) return [];
    try {
      return await getShopNotificationsViaBackend(sid);
    } catch {
      return await mockDb.getNotifications(sid);
    }
  },
  markNotificationsRead: async (shopId: string) => {
    const sid = String(shopId || '').trim();
    if (!sid) return { ok: true } as any;
    try {
      return await markShopNotificationsReadViaBackend(sid);
    } catch {
      return await mockDb.markNotificationsRead(sid);
    }
  },
  markShopNotificationRead: async (shopId: string, id: string) => {
    return await markShopNotificationReadViaBackend(shopId, id);
  },

  getMyNotifications: async (opts?: { take?: number; skip?: number }) => {
    return await getMyNotificationsViaBackend(opts);
  },
  getMyUnreadNotificationsCount: async () => {
    return await getMyUnreadNotificationsCountViaBackend();
  },
  markMyNotificationsRead: async () => {
    return await markMyNotificationsReadViaBackend();
  },
  markMyNotificationRead: async (id: string) => {
    return await markMyNotificationReadViaBackend(id);
  },

  // Shops
  getShops: async (
    filterStatus: 'approved' | 'pending' | 'rejected' | 'all' | '' = 'approved',
    opts?: { take?: number; skip?: number; category?: string; governorate?: string; search?: string },
  ) => {
    const status = String(filterStatus || 'approved').toLowerCase();
    try {
      return await getShopsViaBackend(filterStatus, opts);
    } catch {
      const applyClientFilters = (items: any[]) => {
        let out = items;
        if (opts?.category) {
          const wanted = String(opts.category).toUpperCase();
          out = out.filter((s: any) => String(s?.category || '').toUpperCase() === wanted);
        }
        if (opts?.governorate) {
          const gov = String(opts.governorate).trim();
          out = out.filter((s: any) => String(s?.governorate || '').trim() === gov);
        }
        if (opts?.search) {
          const q = String(opts.search).trim();
          if (q) out = out.filter((s: any) => String(s?.name || '').includes(q));
        }
        return out;
      };

      const fallbackStatus = !status || status === 'approved' ? 'approved' : (status as any);
      const shops = await mockDb.getShops(fallbackStatus);
      return applyClientFilters((shops || []).map(normalizeShopFromBackend));
    }
  },
  updateShopDesign: async (id: string, designConfig: any) => {
    return await updateShopDesignViaBackend(id, designConfig);
  },
  getShopBySlugOrId: async (slugOrId: string) => {
    return await getShopBySlugOrIdViaBackend(slugOrId);
  },
  getShopBySlug: async (slug: string) => {
    return await getShopBySlugViaBackend(slug);
  },
  getMyShop: async () => {
    return await getMyShopViaBackend();
  },
  updateMyShop: async (payload: any) => {
    const shop = await updateMyShopViaBackend(payload);
    try {
      dispatchRayDbUpdateDebounced();
    } catch {
      // ignore
    }
    return shop;
  },

  uploadMyShopBanner: async (payload: { file: File; shopId?: string }) => {
    return await uploadMyShopBannerViaBackend(payload);
  },
  getShopAdminById: async (id: string) => {
    return await getShopAdminByIdViaBackend(id);
  },
  updateShopStatus: async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    return await updateShopStatusViaBackend(id, status);
  },
  followShop: async (shopId: string) => {
    return await followShopViaBackend(shopId);
  },
  incrementVisitors: async (shopId: string) => {
    const sid = String(shopId || '').trim();
    if (!sid) return { error: 'shopId مطلوب' } as any;
    try {
      return await incrementVisitorsViaBackend(sid);
    } catch {
      return await mockDb.incrementVisitors(sid);
    }
  },

  // Offers
  getOffers: async (opts?: { take?: number; skip?: number; shopId?: string }) => {
    try {
      return await getOffersViaBackend(opts);
    } catch {
      const offers = await mockDb.getOffers();
      return offers || [];
    }
  },
  createOffer: async (offer: any) => {
    const created = await createOfferViaBackend(offer);
    dispatchRayDbUpdateDebounced();
    return created;
  },
  deleteOffer: async (offerId: string) => {
    const deleted = await deleteOfferViaBackend(offerId);
    dispatchRayDbUpdateDebounced();
    return deleted;
  },
  getOfferByProductId: async (productId: string) => {
    try {
      return await getOfferByProductIdViaBackend(productId);
    } catch {
      return null;
    }
  },

  getOfferById: async (id: string) => {
    try {
      return await getOfferByIdViaBackend(id);
    } catch {
      return null;
    }
  },

  // Products
  getProducts: async (shopId?: string, opts?: { page?: number; limit?: number }) => {
    return await getProductsViaBackend(shopId, opts);
  },
  getProductsForManage: async (shopId: string, opts?: { page?: number; limit?: number }) => {
    return await getProductsForManageViaBackend(shopId, opts);
  },
  getProductById: async (id: string) => {
    return await getProductByIdViaBackend(id);
  },
  addProduct: async (product: any) => {
    return await addProductViaBackend(product);
  },
  updateProduct: async (id: string, data: any) => {
    return await updateProductViaBackend(id, data);
  },
  updateProductStock: async (id: string, stock: number) => {
    return await updateProductStockViaBackend(id, stock);
  },
  deleteProduct: async (id: string) => {
    return await deleteProductViaBackend(id);
  },

  // Reservations
  getReservations: async (shopId?: string) => {
    return await getReservationsViaBackend(shopId);
  },
  addReservation: async (reservation: any) => {
    return await addReservationViaBackend(reservation);
  },
  updateReservationStatus: async (id: string, status: string) => {
    return await updateReservationStatusViaBackend(id, status);
  },

  // Orders / Sales
  getAllOrders: async (opts?: { shopId?: string; from?: string; to?: string }) => {
    const localRole = String(getLocalUserRoleFromStorage() || '').toUpperCase();
    const localShopId = getLocalShopIdFromStorage();
    return await getAllOrdersViaBackend(opts, localRole, localShopId);
  },
  addSale: mockDb.addSale.bind(mockDb),
  placeOrder: async (order: { items: any[]; total: number; paymentMethod?: string; shopId?: string; notes?: string }) => {
    return await placeOrderViaBackend(order);
  },

  updateOrder: async (id: string, payload: { status?: string; notes?: string }) => {
    return await updateOrderViaBackend(id, payload);
  },

  assignCourierToOrder: async (id: string, courierId: string) => {
    return await assignCourierToOrderViaBackend(id, courierId);
  },

  getCourierOrders: async () => {
    return await getCourierOrdersViaBackend();
  },

  updateCourierOrder: async (id: string, payload: { status?: string; codCollected?: boolean }) => {
    return await updateCourierOrderViaBackend(id, payload);
  },

  // Shop analytics / gallery
  getShopAnalytics: async (shopId: string, opts?: { from?: string; to?: string }) => {
    return await getShopAnalyticsViaBackend(shopId, opts);
  },
  getShopGallery: async (shopId: string) => {
    return await getShopGalleryViaBackend(shopId);
  },
  addShopGalleryImage: async (shopId: string, image: any) => {
    if (image?.file) {
      return await addShopGalleryImageFileViaBackend(shopId, { file: image.file, caption: image.caption });
    }
    if (image?.url) {
      return mockDb.addShopGalleryImage(shopId, image);
    }
    return { error: 'No image provided' };
  },
  deleteShopGalleryImage: async (imageId: string) => {
    return await deleteShopGalleryImageViaBackend(imageId);
  },

  // Users
  getAllUsers: () => {
    return getAllUsersViaMock(mockDb);
  },
  deleteUser: (id: string) => {
    return deleteUserViaMock(mockDb, id);
  },
  updateUserRole: (userId: string, role: string) => {
    return updateUserRoleViaMock(mockDb, userId, role);
  },
  getCouriers: async () => {
    return await getCouriersViaBackend();
  },
  createCourier: async (payload: { name: string; email: string; password: string; phone?: string | null }) => {
    return await createCourierViaBackend(payload);
  },

  // Analytics
  getSystemAnalytics: async () => {
    return await getSystemAnalyticsViaBackendWithFallback(mockDb);
  },
  getSystemAnalyticsTimeseries: async (days: number = 7) => {
    return await getSystemAnalyticsTimeseriesViaBackendWithFallback(days, mockDb);
  },
  getSystemActivity: async (limit: number = 10) => {
    return await getSystemActivityViaBackend(limit);
  },
  getPendingShops: async () => {
    return await getPendingShopsViaBackend();
  },

  // Themes
  getThemeTemplates: () => {
    return getThemeTemplatesViaMock(mockDb);
  },
  createTheme: (payload: any) => {
    return createThemeViaMock(mockDb, payload);
  },
  updateTheme: (id: string, payload: any) => {
    return updateThemeViaMock(mockDb, id, payload);
  },
  deleteTheme: (id: string) => {
    return deleteThemeViaMock(mockDb, id);
  },

  // Feedback
  getFeedback: () => {
    return getFeedbackViaMock(mockDb);
  },
  saveFeedback: async (feedbackData: any) => {
    return await saveFeedbackViaMock(feedbackData);
  },

  // Customer Management
  getShopCustomers: async (shopId: string) => {
    return await getShopCustomersViaBackendWithFallback(mockDb, shopId);
  },

  convertReservationToCustomer: async (customerData: any) => {
    return await convertReservationToCustomerViaBackendWithFallback(mockDb, customerData);
  },

  updateCustomerStatus: async (customerId: string, status: string) => {
    return await updateCustomerStatusViaBackendWithFallback(mockDb, customerId, status);
  },

  sendCustomerPromotion: async (customerId: string, shopId: string) => {
    return await sendCustomerPromotionViaBackendWithFallback(customerId, shopId);
  }
};
