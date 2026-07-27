export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  AUTH_ACCOUNT_INACTIVE = 'AUTH_ACCOUNT_INACTIVE',
  AUTH_SHOP_PENDING = 'AUTH_SHOP_PENDING',

  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',

  ORDER_INSUFFICIENT_STOCK = 'ORDER_INSUFFICIENT_STOCK',
  ORDER_INVALID_ITEMS = 'ORDER_INVALID_ITEMS',
  ORDER_INVALID_STATUS = 'ORDER_INVALID_STATUS',

  RATE_LIMITED = 'RATE_LIMITED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface StructuredError {
  code: ErrorCode;
  message: string;
  details?: any;
}

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: 'المصادقة مطلوبة',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  [ErrorCode.AUTH_FORBIDDEN]: 'صلاحيات غير كافية',
  [ErrorCode.AUTH_ACCOUNT_INACTIVE]: 'الحساب غير نشط',
  [ErrorCode.AUTH_SHOP_PENDING]: 'حسابك قيد المراجعة من الأدمن',

  [ErrorCode.VALIDATION_ERROR]: 'بيانات غير صحيحة',
  [ErrorCode.NOT_FOUND]: 'المورد غير موجود',
  [ErrorCode.CONFLICT]: 'تعارض في البيانات',
  [ErrorCode.DUPLICATE_RESOURCE]: 'المورد موجود بالفعل',

  [ErrorCode.ORDER_INSUFFICIENT_STOCK]: 'المخزون غير كاف',
  [ErrorCode.ORDER_INVALID_ITEMS]: 'المنتجات المطلوبة غير متاحة',
  [ErrorCode.ORDER_INVALID_STATUS]: 'حالة الطلب غير صحيحة',

  [ErrorCode.RATE_LIMITED]: 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'الخدمة غير متاحة مؤقتاً',
  [ErrorCode.TIMEOUT]: 'انتهت مهلة الاتصال',
  [ErrorCode.INTERNAL_ERROR]: 'خطأ داخلي في الخادم',
};

export function createStructuredError(code: ErrorCode, customMessage?: string, details?: any): StructuredError {
  return {
    code,
    message: customMessage || errorMessages[code],
    details,
  };
}
