# Kế Hoạch Đóng Gói File Cài Đặt Desktop (Windows Installer) [23/10/2026]

> **Trạng thái**: ✅ **ĐÃ HOÀN THÀNH**
> **Kết quả đầu ra**:
> - File cài đặt setup: `dist/orca-windows-setup.exe` (180.5 MB, tạo lúc 19:14:49 23/10/2026)
> - Phiên bản portable giải nén sẵn: `dist/win-unpacked/Orca.exe`

> **Mục tiêu**: Biên dịch và tạo bộ cài đặt Windows desktop mới nhất (`dist/orca-windows-setup.exe`) tích hợp toàn bộ 3,698 commits cập nhật từ upstream, bản địa hóa tiếng Việt, Whisper/Groq Speech-to-Text và cấu hình tối ưu.

## 1. Quy Trình Đóng Gói (Pipeline)
1. **Kiểm tra kiểu dữ liệu (Typecheck)**:
   - `pnpm run typecheck`
2. **Biên dịch tài nguyên Desktop (Assets Build)**:
   - `build:wsl-guest`: Đóng gói WSL guest bridge
   - `build:cli`: Biên dịch Orca CLI
   - `build:electron-vite`: Biên dịch React 19 UI (Renderer), Preload scripts và Electron Main
   - `build:web-from-renderer` & `build:mobile-web`: Đóng gói Web companion
3. **Đảm bảo môi trường thực thi Electron Native Runtime**:
   - `ensure:electron-runtime`: Kiểm tra và đảm bảo các native bindings (`windows-registry`, `windows-security`, `node-pty`) tương thích hoàn toàn với Electron runtime.
4. **Đóng gói Windows Installer (NSIS)**:
   - `electron-builder --config config/electron-builder.config.cjs --win`
   - Đầu ra mong muốn: `dist/orca-windows-setup.exe`

## 2. Xác Minh Sau Khi Build
- File `dist/orca-windows-setup.exe` được tạo mới với timestamp hiện tại.
- Kích thước hợp lệ (~200MB).
- Thư mục portable `dist/win-unpacked/Orca.exe` sẵn sàng để kiểm tra hoặc chạy trực tiếp.
