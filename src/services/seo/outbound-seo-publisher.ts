import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface OutboundArticle {
  targetPlatform: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  anchorText: string;
  targetUrl: string;
  tags: string[];
}

export class OutboundSeoPublisher {
  /**
   * Drafts an E-E-A-T compliant contextual article for outbound syndication
   */
  static generateArticle(
    topic: string,
    targetKeyword: string,
    targetUrl: string,
    platform: string
  ): OutboundArticle {
    // Check keyword with policy guard
    const kwCheck = SeoPolicyGuard.checkPolicy({ text: targetKeyword });
    if (!kwCheck.isSafe) {
      throw new Error(`Negative keyword detected in target keyword: ${kwCheck.reason}`);
    }

    const title = `คู่มือแนะนำ${targetKeyword}และอุปกรณ์ผลิตสมุนไพรมาตรฐานสำหรับ SME`;
    const content = `ในกระบวนการผลิตและแปรรูปสมุนไพรลงแคปซูลสำหรับวิสาหกิจชุมชนและผู้ผลิตขนาดย่อม การเลือกใช้ **${targetKeyword}** ที่ได้มาตรฐาน Food Grade ถือเป็นหัวใจสำคัญในการควบคุมคุณภาพ ความสะอาด และความแม่นยำของน้ำหนักยาในแต่ละเม็ด

### ข้อดีของการใช้เครื่องบรรจุและอุปกรณ์มาตรฐาน
1. **ความรวดเร็วและสม่ำเสมอ:** ช่วยเพิ่มกำลังการผลิตได้ครั้งละ 100 ถึง 400 แคปซูลต่อรอบ ช่วยประหยัดเวลาและลดความล้าจากการกรอกทีละเม็ด
2. **ความปลอดภัยด้านสุขอนามัย:** ผลิตจากวัสดุ ABS Food Grade ทำความสะอาดง่าย ผงยาไม่ติดค้าง
3. **การควบคุมคุณภาพด้วยอุปกรณ์เสริม:** การใช้งานร่วมกับ [ถาดนับแคปซูล] ช่วยให้การตรวจนับบรรจุขวดหรือซองมีความแม่นยำ 100%

สำหรับผู้ประกอบการที่สนใจข้อมูลเทคนิคหรือต้องการคำปรึกษาเกี่ยวกับ [${targetKeyword}](${targetUrl}) สามารถศึกษาข้อมูลการใช้งาน ขนาดเบอร์แคปซูล (เบอร์ 00, 0, 1, 2, 3, 4) และอุปกรณ์ครบชุดได้ที่เว็บไซต์ CapsuleFill`;

    // Final safety verification of the complete text
    const fullCheck = SeoPolicyGuard.checkPolicy({ text: title + " " + content });
    if (!fullCheck.isSafe) {
      throw new Error(`Negative keyword detected in drafted article: ${fullCheck.reason}`);
    }

    return {
      targetPlatform: platform,
      category: "อุตสาหกรรม / เครื่องจักรแปรรูปสมุนไพร",
      title,
      summary: `คู่มือการเลือกใช้ ${targetKeyword} สำหรับผู้ประกอบการสมุนไพรและอาหารเสริม`,
      content,
      anchorText: targetKeyword,
      targetUrl,
      tags: [targetKeyword, "เครื่องบรรจุแคปซูลยา", "อุปกรณ์สมุนไพร", "แคปซูลเปล่า"]
    };
  }
}
