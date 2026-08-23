# คู่มือการตั้งค่า Vertex AI สำหรับ OpenWorker

## ตำแหน่งไฟล์ Configuration

ไฟล์การตั้งค่าของ OpenWorker อยู่ที่:
- **Windows:** `C:\Users\%USERNAME%\AppData\Roaming\coworker\secrets.json`

## โครงสร้างไฟล์ secrets.json

```json
{
  "providers": {
    "vertex": {
      "project": "your-project-id",
      "location": "global",
      "credentials": "path/to/service-account-key.json"
    }
  }
}
```

## การตั้งค่า Region สำหรับ Vertex AI

### ค่าที่รองรับ:
1. **`global`** - Multi-region endpoint (ค่าเริ่มต้นที่แนะนำ)
2. **Regional endpoints** เช่น:
   - `us-east5` (Columbus, Ohio, USA)
   - `us-central1` (Council Bluffs, Iowa, USA)
   - `europe-west1` (St. Ghislain, Belgium)
   - `asia-southeast1` (Jurong West, Singapore)

### การตั้งค่าที่ถูกต้อง:

#### ตัวอย่างที่ 1: การใช้ Multi-region (แนะนำ)
```json
{
  "providers": {
    "vertex": {
      "project": "your-project-id",
      "location": "global"
    }
  }
}
```

#### ตัวอย่างที่ 2: การใช้ Regional endpoint
```json
{
  "providers": {
    "vertex": {
      "project": "your-project-id",
      "location": "us-east5"
    }
  }
}
```

## ปัญหาที่พบจากการเปลี่ยน Region

### ปัญหา:
เมื่อเปลี่ยนค่า `location` จาก `global` เป็น `us-east5` ทำให้ OpenWorker ใช้งานไม่ได้

### สาเหตุที่เป็นไปได้:
1. โปรเจกต์ Google Cloud ของคุณไม่ได้เปิดใช้งาน Vertex AI ใน region `us-east5`
2. API ที่คุณต้องการใช้ไม่มีให้บริการใน region `us-east5`
3. Service Account ไม่มีสิทธิ์ในการเข้าถึง Vertex AI ใน region นี้
4. ระบบ OpenWorker มีข้อจำกัดบางอย่างกับการใช้งาน regional endpoints

## แนวทางการแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบการตั้งค่าปัจจุบัน
1. เปิดไฟล์ `secrets.json`
2. ตรวจสอบค่าที่ตั้งไว้ในส่วนของ Vertex AI

### ขั้นตอนที่ 2: กลับไปใช้ค่าเริ่มต้น (ชั่วคราว)
เปลี่ยนค่า `location` จาก `us-east5` กลับเป็น `global`:
```json
{
  "providers": {
    "vertex": {
      "project": "your-project-id",
      "location": "global"
    }
  }
}
```

### ขั้นตอนที่ 3: หากต้องการใช้ regional endpoint
1. ตรวจสอบใน Google Cloud Console ว่า:
   - Vertex AI API ถูกเปิดใช้งานใน region `us-east5`
   - Service Account มีสิทธิ์ที่จำเป็น
   - โมเดลที่คุณต้องการใช้มีให้บริการใน region นี้

2. ตั้งค่าใน `secrets.json`:
```json
{
  "providers": {
    "vertex": {
      "project": "your-project-id",
      "location": "us-east5",
      "region": "us-east5"
    }
  }
}
```

## การตรวจสอบใน Google Cloud Console

1. เข้าไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ "Vertex AI" > "Model Garden"
4. ตรวจสอบว่าโมเดลที่คุณต้องการใช้มีให้บริการใน region ที่ต้องการ
5. ตรวจสอบว่า API ถูกเปิดใช้งานใน region นั้น

## การทดสอบหลังการแก้ไข

หลังจากแก้ไขการตั้งค่าแล้ว:
1. รีสตาร์ท OpenWorker
2. ทดสอบการเชื่อมต่อกับ Vertex AI:
   ```bash
   # ตรวจสอบสถานะ
   gcloud ai models list --region=us-east5 --project=your-project-id
   
   # หรือสำหรับ global
   gcloud ai models list --region=global --project=your-project-id
   ```

## ข้อแนะนำ

1. **สำหรับการใช้งานทั่วไป:** แนะนำให้ใช้ค่า `global` ซึ่งจะ route การเชื่อมต่อไปยัง region ที่เหมาะสมอัตโนมัติ
2. **สำหรับการใช้งานเฉพาะ:** หากต้องการใช้ regional endpoint เพื่อเพิ่มประสิทธิภาพหรือลด latency ให้ตรวจสอบให้แน่ใจว่าทุกอย่างถูกตั้งค่าอย่างถูกต้อง
3. **การแก้ไขชั่วคราว:** หากเกิดปัญหาจากการเปลี่ยน region ให้เปลี่ยนกลับเป็น `global` ก่อน เพื่อให้ระบบกลับมาทำงานได้