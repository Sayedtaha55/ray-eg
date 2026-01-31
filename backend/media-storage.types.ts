export type MediaUploadPurpose =
  | 'product_image'
  | 'shop_banner'
  | 'shop_background'
  | 'shop_header_background'
  | 'images'
  | 'videos'
  | string;

export type UploadedFile = {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
  size?: number;
};

export type MediaUploadInput = {
  file: UploadedFile;
  shopId: string;
  purpose: MediaUploadPurpose;
};

export type MediaUploadResult = {
  key: string;
  url: string;
};

export interface MediaStorage {
  upload(input: MediaUploadInput): Promise<MediaUploadResult>;
}
