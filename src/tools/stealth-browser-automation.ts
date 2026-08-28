import { ChromeLockRecovery } from "../utils/chrome-lock-recovery.js";
import { chromium } from "playwright";
import os from "os";

export async function handleStealthBrowserAutomation(args: any) {
  const profilePath = args?.profilePath;
  const launchOptions = args?.launchOptions || {};
  const headless = args?.headless ?? true;

  if (!profilePath) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: "ต้องระบุ profilePath สำหรับ stealth browser"
          })
        }
      ]
    };
  }

  const recovery = new ChromeLockRecovery();
  const isLocked = recovery.isProfileLocked(profilePath);

  if (isLocked) {
    const recovered = recovery.recoverProfileLock(profilePath);
    if (!recovered) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: "โปรไฟล์เบราว์เซอร์ถูกล็อกอยู่และไม่สามารถกู้คืนได้ เนื่องจากมีโปรเซสอื่นกำลังใช้งานอยู่ (Win32 Mutex/Lock)"
            })
          }
        ]
      };
    }
  }

  try {
    // Launch stealth browser using playwright (with standard options)
    const browserArgs = [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ];

    // We launch a persistent context using the provided profile path
    const context = await chromium.launchPersistentContext(profilePath, {
      headless: headless,
      args: browserArgs,
      ...launchOptions
    });

    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();

    // Quick anti-detect measure
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // Don't close context here since automation tools likely want to use it
    // But since this is just an MCP tool returning status,
    // maybe we just open it to verify it works, then disconnect/close if it's a test.
    // However, if the user requested to keep it open, we should leave it.
    // For safety, let's close it here since standard MCP tools execute and return.
    await context.close();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: "เปิดโปรไฟล์แบบ stealth สำเร็จ และจัดการล็อกอย่างปลอดภัย",
            profilePath
          })
        }
      ]
    };

  } catch (err: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "error",
            message: `เกิดข้อผิดพลาดในการเปิด stealth browser: ${err.message}`
          })
        }
      ]
    };
  }
}
