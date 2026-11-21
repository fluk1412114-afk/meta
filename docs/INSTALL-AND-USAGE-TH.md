# คู่มือติดตั้งและใช้งาน Meta AI Skill

เอกสารนี้อธิบายการติดตั้ง Skill `meta` และการเตรียม Chrome CDP/Playwright บน Windows รวมถึงวิธีเริ่มใช้งานจริง

> **ขอบเขต:** Repository นี้เป็น Agent Skill และเครื่องมือช่วยควบคุม Meta AI ผ่านเว็บไซต์ ไม่ใช่ Meta AI client อย่างเป็นทางการ และไม่ใช่แอป Meta/Facebook เอง ความสามารถด้านค้นหา Social, สร้างภาพ/วิดีโอ และ Artifacts ต้องตรวจจากหน้า Meta AI ที่ล็อกอินอยู่จริง เพราะอาจต่างกันตามบัญชี ประเทศ และการทยอยเปิดใช้

## 1. สิ่งที่ต้องเตรียม

- Windows 10/11 x64
- Node.js 20 ขึ้นไป และ npm
- Google Chrome ที่ติดตั้งในตำแหน่งมาตรฐานของ Windows
- อินเทอร์เน็ต
- บัญชี Meta ที่ผู้ใช้สามารถลงชื่อเข้าใช้ Meta AI ได้
- Git (แนะนำ) หรือดาวน์โหลด Repository เป็น ZIP

ตรวจ Node.js และ npm:

```powershell
node --version
npm --version
```

Playwright ใน `package-lock.json` กำหนด Node.js `>=20` หากเวอร์ชันต่ำกว่านี้ให้ติดตั้ง Node.js รุ่นใหม่ก่อน

## 2. ดาวน์โหลด Repository

### วิธี A — ใช้ Git (แนะนำ)

```powershell
git clone https://github.com/fluk1412114-afk/meta.git
cd meta
```

### วิธี B — ดาวน์โหลด ZIP

1. เปิด [Repository meta](https://github.com/fluk1412114-afk/meta)
2. กด **Code → Download ZIP**
3. แตกไฟล์ไปยังโฟลเดอร์ถาวร เช่น `D:\\Tools\\meta`
4. เปิด PowerShell ในโฟลเดอร์ที่มี `package.json`

## 3. ติดตั้ง Dependencies

รันคำสั่ง:

```powershell
npm ci
```

คำสั่งนี้ติดตั้ง dependencies ตาม lockfile โดยใช้ Playwright สำหรับเชื่อมต่อ Chrome ที่เปิดผ่าน CDP

**ไม่ต้องรัน `npx playwright install`** สำหรับ workflow ปัจจุบัน เพราะสคริปต์เชื่อมต่อกับ Google Chrome ที่ติดตั้งอยู่แล้ว ไม่ได้ใช้ Playwright เปิด browser binary ของตัวเอง

## 4. เปิด Chrome โปรไฟล์เฉพาะสำหรับ Meta AI

รัน:

```powershell
node scripts/launch-meta-cdp.js
```

สิ่งที่จะเกิดขึ้น:

1. สคริปต์ตรวจ Chrome process และพอร์ต CDP ก่อน
2. ถ้ายังไม่มีโปรไฟล์เฉพาะ จะเปิด Chrome ด้วยโปรไฟล์ `%LOCALAPPDATA%\\MetaAI-CDP-Profile`
3. เปิดเว็บไซต์ [https://www.meta.ai/](https://www.meta.ai/)
4. หากยังไม่ได้ลงชื่อเข้าใช้ ให้ผู้ใช้ลงชื่อเข้าใช้ด้วยตนเองในหน้าต่าง Chrome นี้
5. เมื่อเปิดใช้งานครั้งถัดไป สคริปต์จะพยายามใช้โปรไฟล์เดิมและ session เดิม

**สำคัญ:** อย่าปิดหน้าต่าง Chrome นี้ระหว่างที่กำลังให้สคริปต์ทำงาน และอย่าใช้โปรไฟล์ Chrome ปกติของคุณกับ CDP workflow นี้

## 5. ตรวจการเชื่อมต่อ

เปิด PowerShell อีกหน้าต่างในโฟลเดอร์ Repository แล้วรัน:

```powershell
node scripts/connect-meta-ai.js
```

ผลที่คาดหวัง:

- แสดงว่าเชื่อมต่อ dedicated local Chrome CDP profile สำเร็จ
- แสดงจำนวน Contexts และ Tabs
- ตรวจพบ Meta AI tab หรือแจ้งให้เปิด Meta AI ใน Chrome โปรไฟล์เฉพาะก่อน

สคริปต์ตรวจสอบนี้ไม่อ่านหรือแสดง Cookies, Local Storage, Passwords, Tokens, ชื่อแท็บ หรือ URL ของหน้าอื่น

หากขึ้นว่าไม่พบ CDP process ให้กลับไปรัน `node scripts/launch-meta-cdp.js` และตรวจว่าหน้าต่าง Chrome โปรไฟล์เฉพาะยังเปิดอยู่

## 6. ติดตั้ง Skill ให้ Codex ใช้

การ Clone Repository ไว้เฉย ๆ ยังไม่ทำให้ Codex รู้จัก Skill ต้องวางโฟลเดอร์ที่มี `SKILL.md` ไว้ในตำแหน่ง Skills ที่ Codex ค้นหา

### ติดตั้งระดับผู้ใช้ (ใช้ได้ทุกโปรเจกต์)

เปิด PowerShell แล้วรัน:

```powershell
$skills = Join-Path $HOME ".agents\\skills"
New-Item -ItemType Directory -Force -Path $skills | Out-Null
git clone https://github.com/fluk1412114-afk/meta.git (Join-Path $skills "meta")
Set-Location (Join-Path $skills "meta")
npm ci
```

ตำแหน่ง Skill จะเป็น:

```text
%USERPROFILE%\\.agents\\skills\\meta\\SKILL.md
```

### ติดตั้งเฉพาะโปรเจกต์

คัดลอกทั้งโฟลเดอร์ Repository ไปไว้ที่:

```text
<project-root>\\.agents\\skills\\meta\\SKILL.md
```

Codex จะค้นหา Skills ใน `.agents/skills` ของโปรเจกต์และโฟลเดอร์แม่ตามขอบเขตที่กำหนด

### เรียกใช้งาน

- Codex CLI / IDE: พิมพ์ `$meta` ตามด้วยคำสั่ง เช่น `$meta ช่วยค้นหาไอเดียโพสต์ที่กำลังเป็นกระแส`
- ChatGPT Desktop ที่รองรับ standalone Skills: เปิด **Skills** ใน Sidebar เพื่อตรวจดู Skills ที่มีในสภาพแวดล้อมนั้น หากมีขั้นตอน Add/Import ให้เพิ่มโฟลเดอร์ Skill นี้ตามตัวเลือกที่ UI รองรับ จากนั้นเรียกด้วย `@meta` หรือเลือกจาก Skills UI
- หากไม่มีตัวเลือกเพิ่ม Skill จากโฟลเดอร์หรือ Repository ใน UI เวอร์ชันที่ใช้อยู่ ให้ถือว่ายังไม่ได้ติดตั้ง อย่าสมมติว่าการ Clone GitHub ทำให้ ChatGPT โหลด Skill ให้เอง

การติดตั้งไฟล์ใน Repository นี้ไม่ได้ทำให้ Skill ปรากฏใน ChatGPT Web หรือ Mobile โดยอัตโนมัติ

อ่านเอกสารทางการ: [Build skills](https://learn.chatgpt.com/docs/build-skills)

## 7. ใช้งานเครื่องมือสร้างภาพ

เมื่อ Chrome โปรไฟล์เฉพาะเปิดอยู่และลงชื่อเข้าใช้ Meta AI แล้ว ให้เปิด PowerShell ในโฟลเดอร์ Repository

```powershell
node scripts/create-image.js "ภาพร้านกาแฟมินิมอลในสวน แสงเช้า โทนอบอุ่น"
```

กำหนดโฟลเดอร์ปลายทางเองได้:

```powershell
node scripts/create-image.js "ภาพสินค้าบนพื้นหลังสีขาว" "D:\\MetaAI-Output"
```

เมื่อสำเร็จ สคริปต์จะแสดงสถานะการสร้างภาพ ขนาดภาพ ประเภทไฟล์ และยืนยันว่าไฟล์ดาวน์โหลดมีขนาดมากกว่า 0 ไบต์

ค่าเริ่มต้นจะบันทึกไว้ใน:

```text
%USERPROFILE%\\Pictures\\MetaAI-Generated
```

สคริปต์นี้ทำงานเฉพาะ **Image Generation** และอาศัย selector ของหน้า Meta AI ที่อาจเปลี่ยนได้ หากหน้าเว็บเปลี่ยนจนหา Composer หรือปุ่มดาวน์โหลดไม่พบ ให้หยุดและตรวจ UI/selector ก่อน อย่ารันซ้ำแบบไม่ตรวจสอบ

## 8. ใช้ Skill ทำงานประเภทอื่น

พิมพ์คำขอที่ขึ้นต้นด้วย `$meta` หรือ `@meta` พร้อมระบุเป้าหมายตามปกติ เช่น:

- `$meta ช่วยวางแผนคอนเทนต์สำหรับร้านค้าออนไลน์`
- `$meta ค้นหาตัวอย่างโพสต์สาธารณะที่เกี่ยวกับ...`
- `$meta ช่วยคิด Storyboard สำหรับวิดีโอสั้น`
- `$meta สร้างภาพสินค้า...`

Skill จะเลือกคู่มืออ้างอิงตามงาน:

| งาน | คู่มือ |
|---|---|
| วางแผน วิเคราะห์ เขียน และสรุป | [assistant-agent.md](../references/assistant-agent.md) |
| ค้นหาโพสต์ Facebook / Instagram / Threads | [social-research.md](../references/social-research.md) |
| สร้างหรือแก้ไขภาพ/วิดีโอ | [creative-generation.md](../references/creative-generation.md) |
| ตรวจความสามารถและข้อจำกัดตาม UI จริง | [capability-map.md](../references/capability-map.md) |
| แบ่งหน้าที่ Meta AI และ ChatGPT | [collaboration-model.md](../references/collaboration-model.md) |

อย่าถือว่าทุกความสามารถมีให้ทุกบัญชี Skill ต้องตรวจหน้า Meta AI จริงก่อนใช้งาน และต้องแยกผลลัพธ์ที่สร้างแล้วออกจากไฟล์ที่ดาวน์โหลดหรือเว็บไซต์ที่เผยแพร่จริง

## 9. ตั้งค่าพอร์ต CDP (กรณีพอร์ต 9222 ถูกใช้งาน)

ค่าเริ่มต้นคือพอร์ต `9222` สามารถกำหนดพอร์ตอื่นใน PowerShell ก่อนเปิด Chrome ได้ เช่น:

```powershell
$env:META_AI_CDP_PORT = "9333"
node scripts/launch-meta-cdp.js
```

ใช้ค่าเดียวกันในหน้าต่าง PowerShell ที่รันสคริปต์เชื่อมต่อหรือสร้างภาพด้วย:

```powershell
$env:META_AI_CDP_PORT = "9333"
node scripts/connect-meta-ai.js
```

## 10. ความปลอดภัยและความเป็นส่วนตัว

- ใช้ dedicated Chrome profile ที่สคริปต์สร้างให้เท่านั้น อย่าเชื่อมต่อกับ Chrome โปรไฟล์ประจำวัน
- ลงชื่อเข้าใช้ด้วยตนเองเท่านั้น ห้ามส่งรหัสผ่าน, OTP, Cookies หรือ Token ให้สคริปต์หรือ ChatGPT
- อย่าเปิดพอร์ต CDP ออกสู่อินเทอร์เน็ตหรือเครือข่ายสาธารณะ เพราะผู้ที่เข้าถึงพอร์ตนี้อาจควบคุม browser session ได้
- อย่าคัดลอกหรือเผยแพร่โฟลเดอร์ `MetaAI-CDP-Profile` เพราะมีข้อมูล session ส่วนตัว
- อย่า commit โปรไฟล์, Cookies, Local Storage, ไฟล์ดาวน์โหลดส่วนตัว หรือข้อมูลรับรองลง Git
- Skill ไม่ควรโพสต์ แสดงความคิดเห็น กดถูกใจ ส่งข้อความ แชร์ ซื้อเครดิต หรือเปลี่ยนการตั้งค่าบัญชีโดยไม่มีคำสั่งและการยืนยันที่เหมาะสมจากผู้ใช้
- หาก Meta แสดง CAPTCHA, MFA หรือขั้นตอนยืนยันบัญชี ให้ผู้ใช้ดำเนินการเอง ห้ามพยายามข้ามระบบเหล่านั้น

## 11. แก้ปัญหาเบื้องต้น

| อาการ | วิธีแก้ |
|---|---|
| `node` หรือ `npm` ไม่พบ | ติดตั้ง Node.js 20+ แล้วเปิด PowerShell ใหม่ |
| `npm ci` ล้มเหลว | ตรวจอินเทอร์เน็ตและ Node.js version จากนั้นรัน `npm ci` อีกครั้ง |
| หา Chrome ไม่พบ | ติดตั้ง Google Chrome ในตำแหน่งมาตรฐานของ Windows |
| พอร์ต 9222 ถูกใช้งาน | ตรวจว่ามีโปรเซสอื่นใช้พอร์ตนี้หรือไม่ แล้วกำหนด `META_AI_CDP_PORT` เป็นพอร์ตอื่น |
| CDP process ไม่พบ | รัน `node scripts/launch-meta-cdp.js` และอย่าปิด Chrome โปรไฟล์เฉพาะ |
| ไม่พบ Meta AI tab | เปิด `https://www.meta.ai/` ใน Chrome โปรไฟล์เฉพาะ |
| ไม่พบ Composer หรือ Download button | UI อาจเปลี่ยน ให้ตรวจหน้าเว็บและปรับ selector อย่างระมัดระวัง |
| สร้างภาพไม่สำเร็จ | ตรวจว่าลงชื่อเข้าใช้แล้วหรือไม่ ตรวจเครดิต/ข้อจำกัดบัญชีและสถานะหน้าเว็บ |
| Social Search หรือ Video ใช้ไม่ได้ | ตรวจว่าความสามารถนั้นเปิดให้บัญชีนี้จริงหรือไม่ อย่าสมมติว่า Image helper รองรับ |

## 12. อัปเดต Skill

หากติดตั้งด้วย Git:

```powershell
git pull
npm ci
```

หากมีการเปลี่ยน dependencies ให้ใช้ `npm ci` เพื่อซิงก์ตาม lockfile หลังอัปเดต

## 13. ข้อจำกัดที่ควรทราบ

- Browser automation ปัจจุบันรองรับ Windows เท่านั้น
- ต้องมี Google Chrome และ Node.js 20+
- Helper ที่มีอยู่ทำ Image Generation เป็นหลัก ไม่ใช่ระบบอัตโนมัติสำหรับทุกความสามารถของ Meta AI
- Social Search, Video Generation, Artifacts และ Website Creation ต้องตรวจสอบจาก UI และบัญชีจริงก่อนรับปากว่าสามารถทำได้
- ไม่มี automated test suite ใน Repository ปัจจุบัน คำสั่งตรวจ syntax ที่ใช้ได้คือ:

```powershell
node --check scripts/launch-meta-cdp.js
node --check scripts/find-cdp-endpoint.js
node --check scripts/connect-meta-ai.js
node --check scripts/create-image.js
```
