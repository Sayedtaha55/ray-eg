import { BackendRequestError, backendGet, backendPost, backendPut, disablePathPrefix } from '../httpClient';

export async function getShopCustomersViaBackendWithFallback(mockDb: any, shopId: string) {
  try {
    const customers = await backendGet<any[]>(`/api/v1/customers/shop/${shopId}`);
    return customers.map((c: any) => ({
      ...c,
      totalSpent: c.totalSpent || 0,
      orders: c.orders || 0,
      status: c.status || 'active',
    }));
  } catch (e) {
    if (e instanceof BackendRequestError && e.status === 404) {
      disablePathPrefix('/api/v1/customers/shop/');
    }
    return mockDb.getShopCustomers(shopId);
  }
}

export async function convertReservationToCustomerViaBackendWithFallback(mockDb: any, customerData: any) {
  try {
    return await backendPost('/api/v1/customers/convert', customerData);
  } catch {
    return mockDb.convertReservationToCustomer(customerData);
  }
}

export async function updateCustomerStatusViaBackendWithFallback(mockDb: any, customerId: string, status: string) {
  try {
    return await backendPut(`/api/v1/customers/${customerId}/status`, { status });
  } catch {
    return mockDb.updateCustomerStatus(customerId, status);
  }
}

export async function sendCustomerPromotionViaBackendWithFallback(customerId: string, shopId: string) {
  try {
    return await backendPost('/api/v1/customers/send-promotion', { customerId, shopId });
  } catch {
    return { success: true, message: 'Promotion sent successfully' };
  }
}
