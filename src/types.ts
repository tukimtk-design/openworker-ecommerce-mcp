import { z } from "zod";

export const PlatformSchema = z.enum(["shopee", "tiktok", "lazada", "lnwshop"]);
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

export interface StoreMetrics {
  platform: Platform;
  pendingOrdersCount: number;
  outOfStockSkusCount: number;
  lowStockSkusCount: number;
}

export interface ChallengeDetectionResult {
  platform: Platform;
  challengeDetected: boolean;
  challengeType?: "captcha" | "otp" | "login_required" | "none";
  message: string;
}

export interface AuditLogEntry {
  timestamp: string;
  platform: Platform;
  productId: string;
  skuId?: string;
  action: string;
  oldPrice?: number;
  newPrice?: number;
  oldStock?: number;
  newStock?: number;
  updatedBy: string;
}
