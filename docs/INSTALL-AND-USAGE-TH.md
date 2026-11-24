# คู่มือติดตั้งและใช้งาน Meta AI Skill

คู่มือนี้อธิบายการติดตั้ง Skill `meta` และการใช้ Ghost Mode เพื่อควบคุมเบราว์เซอร์แยกเฉพาะสำหรับ Meta AI โดยไม่รบกวนหน้าต่าง แท็บ หรือโปรไฟล์เบราว์เซอร์ที่ใช้งานประจำ

> Repository นี้เป็น Agent Skill และเครื่องมือช่วยใช้งาน Meta AI ผ่านเว็บไซต์ ไม่ใช่ผลิตภัณฑ์หรือไคลเอนต์อย่างเป็นทางการของ Meta ความสามารถด้าน Social Search, สร้างภาพ/วิดีโอ และ Artifacts ต้องตรวจจากหน้า Meta AI และบัญชีที่ลงชื่อเข้าใช้จริง

## 1. สิ่งที่ต้องเตรียม

- Windows 10/11
- Node.js 20 ขึ้นไป และ npm
- Microsoft Edge (ค่าเริ่มต้น) หรือ Chrome / Brave / Firefox
- อินเทอร์เน็ตและบัญชีที่เข้าใช้งาน Meta AI ได้
- Git หรือดาวน์โหลด Repository เป็น ZIP

ตรวจเวอร์ชัน:

```powershell
node --version
npm --version
```

## 2. ดาวน์โหลดและติดตั้ง

```powershell
git clone https://github.com/fluk1412114-afk/meta.git
cd meta
npm ci
```

หากติดตั้ง Skill ให้ Codex ใช้ได้ทุกโปรเจกต์:

```powershell
$skills = Join-Path $HOME ".agents\skills"
New-Item -ItemType Directory -Force -Path $skills | Out-Null
git clone https://github.com/fluk1412114-afk/meta.git (Join-Path $skills "meta")
Set-Location (Join-Path $skills "meta")
npm ci
```

ตำแหน่ง Skill คือ `%USERPROFILE%\.agents\skills\meta\SKILL.md`

- Codex CLI / IDE: เรียกใช้ด้วย `$meta`
- ChatGPT Desktop ที่รองรับ Standalone Skills: เพิ่ม Skill ผ่านตัวเลือก Skills ที่มีในแอป แล้วเรียกด้วย `@meta`
- การ Clone Repository อย่างเดียวไม่ได้ทำให้ Skill ปรากฏใน ChatGPT Web หรือ Mobile โดยอัตโนมัติ

## 3. เริ่ม Ghost Mode

Microsoft Edge เป็นเบราว์เซอร์เริ่มต้น:

```powershell
node scripts/ghost-launcher.js
```

หรือระบุ Edge ชัดเจน:

```powershell
node scripts/ghost-launcher.js --browser edge
```

หากต้องการใช้เบราว์เซอร์อื่น:

```powershell
node scripts/ghost-launcher.js --browser chrome
node scripts/ghost-launcher.js --browser brave
node scripts/ghost-launcher.js --browser firefox
```

หากเลือก Firefox ต้องติดตั้ง Playwright Firefox engine ก่อนหนึ่งครั้ง:

```powershell
npx playwright-core install firefox
```

เมื่อเริ่มสำเร็จ Ghost Mode จะเปิดเบราว์เซอร์แบบ Headless ซึ่งไม่มีหน้าต่างมารบกวนการใช้งานเครื่องตามปกติ

## 4. ลงชื่อเข้าใช้ Meta AI ด้วยตนเอง

หากยังไม่ได้ลงชื่อเข้าใช้ ให้เปิด Ghost Browser แบบมีหน้าต่าง โดยยังคงใช้โปรไฟล์แยก:

```powershell
node scripts/ghost-launcher.js --browser edge --headed
```

จากนั้น:
1. เปิดหรือไปที่ [https://www.meta.ai/](https://www.meta.ai/)
2. ลงชื่อเข้าใช้ด้วยตนเองในหน้าต่าง Ghost Browser
3. ปิด Ghost Browser ด้วยคำสั่ง Stop ตามหัวข้อ 7
4. เริ่มใหม่โดยไม่ใส่ `--headed` เพื่อกลับไปทำงานแบบ Headless

ห้ามให้สคริปต์หรือ AI กรอกรหัสผ่าน, OTP/MFA, CAPTCHA หรือรหัสยืนยันใด ๆ

## 5. ตรวจสอบการเชื่อมต่อ

หลังเริ่ม Ghost Mode แล้ว รัน:

```powershell
node scripts/connect-meta-ai.js --browser edge
```

คำสั่งนี้ตรวจการเชื่อมต่อกับโปรเซสและโปรไฟล์ Ghost ที่บันทึกไว้ และแจ้งว่าพบแท็บ Meta AI หรือไม่ จะไม่เชื่อมต่อกับเบราว์เซอร์ที่เปิดใช้งานทั่วไปหรือพอร์ตที่ไม่รู้จัก

## 6. ดูการทำงานแบบสด

เปิด Viewer แบบอ่านอย่างเดียว:

```powershell
node scripts/viewer-server.js --browser edge
```

เปิด URL นี้ในเบราว์เซอร์ที่คุณใช้งานตามปกติ:

```text
http://127.0.0.1:9229/viewer
```

Viewer แสดงภาพหน้าเว็บและสถานะของ Ghost Browser โดยไม่ส่งคำสั่งคลิกหรือพิมพ์จากหน้า Viewer และแสดง URL โดยตัด Query String และ Fragment ออก

## 7. คำสั่งจัดการ

แสดงเบราว์เซอร์ที่ตรวจพบ:

```powershell
node scripts/ghost-launcher.js list-browsers
```

หยุด Ghost Browser ของ Edge:

```powershell
node scripts/ghost-launcher.js stop --browser edge
```

คำสั่ง Stop จะตรวจสอบว่าโปรเซสที่บันทึกไว้เป็นของโปรไฟล์แยกที่เลือกจริงก่อนหยุด หากยืนยันเจ้าของโปรเซสไม่ได้ จะปฏิเสธการหยุดเพื่อป้องกันการปิดโปรแกรมผิดตัว

## 8. สร้างภาพด้วย Meta AI

เมื่อ Ghost Browser เปิดอยู่และบัญชี Meta AI ลงชื่อเข้าใช้แล้ว:

```powershell
node scripts/create-image.js "ภาพร้านกาแฟมินิมอลในสวน แสงเช้า โทนอบอุ่น" --browser edge
```

กำหนดโฟลเดอร์บันทึกได้:

```powershell
node scripts/create-image.js "ภาพสินค้าบนพื้นหลังสีขาว" --browser edge --output "D:\MetaAI-Output"
```

สคริปต์จะตรวจ Composer, สถานะการสร้าง, ภาพผลลัพธ์, ปุ่มดาวน์โหลด และไฟล์ที่บันทึกแยกจากกัน หาก UI เปลี่ยนจนหาองค์ประกอบไม่พบ ให้หยุดและตรวจหน้าเว็บก่อน ไม่ควรลองซ้ำโดยไม่ตรวจสอบ

## 9. หลักการแยกการควบคุมและความปลอดภัย

- ใช้โปรไฟล์เฉพาะใน `%LOCALAPPDATA%\MetaAI-Ghost-Profile\<browser>` เท่านั้น
- ไม่อ่านหรือใช้โปรไฟล์เบราว์เซอร์ประจำวัน
- ไม่ควบคุมเมาส์/คีย์บอร์ดระดับระบบ ไม่เปลี่ยนหน้าต่างที่กำลังโฟกัส และไม่สลับแท็บในเบราว์เซอร์ส่วนตัว
- Headless เป็นค่าเริ่มต้น; `--headed` ใช้เฉพาะเมื่อต้องลงชื่อเข้าใช้หรือดูหน้าต่าง Ghost ด้วยตนเอง
- Endpoint สำหรับควบคุมเบราว์เซอร์รับการเชื่อมต่อเฉพาะ `127.0.0.1` ห้ามเปิดออกสู่ LAN หรืออินเทอร์เน็ต
- ห้ามเผยแพร่โปรไฟล์, Cookies, Local Storage, Tokens, Passwords หรือไฟล์ส่วนตัวลง Git
- ก่อนโพสต์ แสดงความคิดเห็น ส่งข้อความ ซื้อ ชำระเงิน แชร์ ติดตาม หรือเปลี่ยนการตั้งค่าบัญชี ต้องแสดงรายละเอียดและได้รับการยืนยันจากผู้ใช้ทันที ก่อนส่งคำสั่งจริง
- หากพบ CAPTCHA, MFA หรือการยืนยันบัญชี ให้ผู้ใช้ดำเนินการเอง ห้ามพยายามข้าม

## 10. แก้ปัญหาเบื้องต้น

| อาการ | วิธีตรวจสอบ |
|---|---|
| ไม่พบ Node.js หรือ npm | ติดตั้ง Node.js 20+ แล้วเปิด PowerShell ใหม่ |
| `npm ci` ล้มเหลว | ตรวจเวอร์ชัน Node.js และการเชื่อมต่อเครือข่าย |
| ไม่พบ Edge | ตรวจการติดตั้ง Edge หรือระบุเบราว์เซอร์อื่นด้วย `--browser` |
| พอร์ต Ghost ถูกใช้งาน | Launcher จะปฏิเสธการเชื่อมต่อ อย่าบังคับให้ข้ามการตรวจสอบพอร์ต |
| ไม่มี PID หรือ Endpoint state | เริ่ม Ghost Browser ใหม่ และตรวจว่าไม่มีโปรเซส Ghost เก่าค้างอยู่ |
| Firefox เปิดไม่ได้ | รัน `npx playwright-core install firefox` |
| ไม่พบ Meta AI tab | เปิด Meta AI ในโปรไฟล์ Ghost ที่แยกไว้ |
| ไม่พบ Composer หรือปุ่มดาวน์โหลด | ตรวจ UI จริงและปรับ Selector อย่างระมัดระวัง |
| สร้างภาพไม่สำเร็จ | ตรวจสถานะการลงชื่อเข้าใช้ ข้อจำกัดบัญชี และหน้าเว็บจริง |

## 11. ทดสอบและอัปเดต

รันชุดทดสอบ:

```powershell
npm test
```

อัปเดต Repository ที่ติดตั้งด้วย Git:

```powershell
git pull
npm ci
```

หากมีการเปลี่ยน Dependencies ให้ใช้ `npm ci` เพื่อให้ตรงกับ Lockfile

## 12. ข้อจำกัด

- Browser automation อาศัย Playwright และเบราว์เซอร์ที่ติดตั้งในเครื่อง
- Firefox ต้องติดตั้ง Playwright browser engine เพิ่ม
- Helper สำหรับสร้างภาพอาศัย Selector ของ Meta AI ซึ่งอาจเปลี่ยนแปลงได้
- Social Search, Video Generation, Artifacts และ Website Creation ต้องตรวจสอบจาก UI และบัญชีจริงก่อนรับปากว่าสามารถทำได้
