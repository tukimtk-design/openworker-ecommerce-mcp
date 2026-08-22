import { z } from "zod";

export const PlatformSchema = z.enum(["shopee", "tiktok", "lazada"]);
export type Platform = z.infer<typeof PlatformSchema>;

export interface StoreTabInfo {
  platform: Platform;
  title: string;
  url: string;
  isLoggedIn: boolean;
}

export interface ProductSearchResult {
  productId: string;
  title: string;
  coverImage?: string;
  skus: Array<{
    skuId: string;
    name: string;
    price: number;
    stock: number;
  }>;
}

export interface UpdatePriceStockParams {
  platform: Platform;
  productId: string;
  skuId?: string;
  newPrice?: number;
  newStock?: number;
}
