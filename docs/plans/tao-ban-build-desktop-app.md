# Kế hoạch đóng gói Desktop App (Windows) phiên bản mới

Sau khi đã hoàn tất việc đồng bộ upstream, giải quyết toàn bộ xung đột và kiểm tra toàn bộ unit tests / typecheck / lint sạch sẽ, kế hoạch này thực hiện quy trình đóng gói hoàn chỉnh ứng dụng Orca Desktop cho hệ điều hành Windows.

---

## 1. Mục tiêu
- Tạo bộ cài đặt và ứng dụng máy bàn Windows (x64) hoàn chỉnh (`orca-windows-setup.exe` / `dist/win-unpacked/`).
- Đảm bảo các thành phần phụ thuộc native (như `node-pty`, `windows-cli-launcher`, relay, web-from-renderer) được biên dịch và tích hợp chính xác vào gói ứng dụng.
- Đảm bảo các tính năng riêng của fork (Giao diện Tiếng Việt, Whisper STT, Docker scripts...) hoạt động bình thường trong bản build.

---

## 2. Các bước triển khai

### Giai đoạn 1: Chuẩn bị môi trường & Rebuild Native Dependencies
1. Đảm bảo runtime native nhắm đúng Electron:
   - Chạy `pnpm run ensure:electron-runtime` (hoặc `node config/scripts/rebuild-native-deps.mjs`).
2. Biên dịch launcher native cho Windows:
   - Chạy `pnpm run build:native` (tạo `native/windows-cli-launcher/.build/orca.exe`).
3. Kiểm tra tính toàn vẹn của mã nguồn:
   - Chạy `pnpm tc` để kiểm tra TypeCheck TypeScript.
   - Chạy `oxlint` để đảm bảo không có vi phạm lint.

### Giai đoạn 2: Build các Bundle & Assets
1. Build relay backend:
   - `pnpm run build:relay`
2. Build CLI package:
   - `pnpm run build:cli`
3. Build Electron & Renderer qua Vite:
   - `pnpm run build:electron-vite`
4. Build web projection từ renderer:
   - `pnpm run build:web-from-renderer`
5. Verify bundle CLI & skills:
   - `pnpm run verify:built-skills-cli`

*(Hoặc chạy gộp qua `pnpm run build:desktop`)*

### Giai đoạn 3: Đóng gói với Electron-Builder
1. Chạy tiến trình đóng gói Windows:
   - Lệnh: `pnpm run build:win`
   - Output kỳ vọng:
     - `dist/orca-windows-setup.exe` (Installer NSIS)
     - `dist/win-unpacked/` (Thư mục unpacked chứa `Orca.exe`)
2. Kiểm tra log đóng gói xem có lỗi asar, missing resource hay electron runtime mismatch nào không.

### Giai đoạn 4: Kiểm tra & Xác minh bản Build
1. Kiểm tra kích thước và sự tồn tại của file trong thư mục `dist/`.
2. Kiểm tra `dist/win-unpacked/Orca.exe` và các tài nguyên đi kèm (plugins, skills, resources).
3. Cập nhật tài liệu / walkthrough hướng dẫn cài đặt và sử dụng.

---

## 3. Rủi ro & Phương án xử lý
- **Lỗi Native Module Mismatch**: Nếu Electron builder báo lỗi binary native (node-pty), chạy lại `pnpm run rebuild:electron`.
- **Lỗi thiếu .NET Framework C# compiler cho launcher**: Script tự động tìm `csc.exe` trong `%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe`.
- **Lỗi dung lượng ổ đĩa**: Thư mục `dist/` có thể chiếm ~1-2GB, kiểm tra đủ dung lượng trước khi build.
