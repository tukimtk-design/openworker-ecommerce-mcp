/**
 * ผลลัพธ์จากการตรวจสอบนโยบาย SEO (Negative Keywords)
 */
export interface SeoPolicyGuardResult {
  /**
   * สถานะการผ่านกฎ (true = ปลอดภัย/ผ่าน, false = ไม่ผ่าน/มีคำต้องห้าม)
   */
  isSafe: boolean;

  /**
   * รายการคำต้องห้ามที่ตรวจพบ
   */
  rejectedKeywords: string[];

  /**
   * ข้อความอธิบายเหตุผล (ถ้ามี)
   */
  reason?: string;
}

/**
 * โครงสร้างข้อมูลสำหรับตั้งค่า Policy Guard
 */
export interface SeoPolicyGuardOptions {
  /**
   * ข้อความ หรือ title ที่ต้องการตรวจสอบ
   */
  text: string;
}
