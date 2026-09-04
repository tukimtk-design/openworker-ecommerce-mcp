import { SeoPolicyGuardOptions, SeoPolicyGuardResult } from './seo-types.js';

export class SeoPolicyGuard {
  // รายการคำต้องห้ามที่ต้องปฏิเสธ (Strict Reject)
  private static readonly NEGATIVE_KEYWORDS = [
    'มือสอง',
    'ปิดฝาฟอยล์',
    'กระปุก',
    'อย.'
  ];

  /**
   * ตรวจสอบว่าข้อความผ่านนโยบาย SEO (ไม่มี Negative Keywords) หรือไม่
   * @param options ตัวเลือกการตรวจสอบ (ข้อความที่ต้องการตรวจสอบ)
   * @returns ผลลัพธ์การตรวจสอบ (isSafe, rejectedKeywords)
   */
  public static checkPolicy(options: SeoPolicyGuardOptions): SeoPolicyGuardResult {
    const { text } = options;

    if (!text) {
      return {
        isSafe: true,
        rejectedKeywords: []
      };
    }

    // แปลงข้อความเป็น Unicode NFC ก่อนตรวจสอบ
    const normalizedText = text.normalize('NFC');
    const rejectedKeywords: string[] = [];

    // ตรวจสอบคำต้องห้ามทีละคำ
    for (const keyword of SeoPolicyGuard.NEGATIVE_KEYWORDS) {
      // แปลง keyword เป็น NFC เช่นกันเพื่อความแน่นอน
      const normalizedKeyword = keyword.normalize('NFC');
      
      // ใช้ indexOf สำหรับการตรวจสอบ Exact Match ใน string
      if (normalizedText.includes(normalizedKeyword)) {
        rejectedKeywords.push(normalizedKeyword);
      }
    }

    if (rejectedKeywords.length > 0) {
      return {
        isSafe: false,
        rejectedKeywords,
        reason: `พบคำต้องห้ามในข้อความ: ${rejectedKeywords.join(', ')}`
      };
    }

    return {
      isSafe: true,
      rejectedKeywords: []
    };
  }
}
