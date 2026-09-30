# Chương 12: Chẩn Đoán & Xử Lý Sự Cố (Troubleshooting)

> Cẩm nang tra cứu và xử lý các lỗi thường gặp trong quá trình cài đặt, phát triển, kết nối mạng và quản lý tiến trình trong Orca.

---

## 12.1. Các Lỗi Phổ Biến Trên Môi Trường Windows

### 1. Lỗi khóa file `EPERM` khi cài đặt hoặc rebuild native module
- **Nguyên nhân**: Một tiến trình Electron hoặc PTY Daemon cũ của Orca vẫn đang chạy ngầm và giữ khóa các file nhị phân `.node` trong `node_modules`.
- **Cách xử lý**:
  ```powershell
  # 1. Đóng toàn bộ tiến trình Orca và Electron đang chạy
  Get-Process -Name *orca*, *electron* | Stop-Process -Force

  # 2. Chạy lệnh rebuild lại native module
  pnpm run rebuild:electron
  ```

### 2. Rò rỉ biến môi trường `ELECTRON_RUN_AS_NODE`
- **Hiện tượng**: Khi gõ lệnh chạy ứng dụng từ terminal tích hợp của VS Code hoặc Claude Code, cửa sổ ứng dụng không hiện lên mà chỉ boot thành một tiến trình Node thuần trong console.
- **Nguyên nhân**: VS Code và một số tool set sẵn biến `ELECTRON_RUN_AS_NODE=1` trong môi trường shell con.
- **Cách xử lý**: Khởi chạy qua script `pnpm dev` (Orca đã tích hợp sẵn cơ chế tự động dọn sạch biến này trước khi spawn), hoặc tự xóa biến:
  ```powershell
  $env:ELECTRON_RUN_AS_NODE = $null
  pnpm dev
  ```

### 3. Cảnh báo bỏ qua `cpu-features` khi build
- **Hiện tượng**: Khi chạy `pnpm install`, console in ra cảnh báo bỏ qua thư viện `cpu-features`.
- **Giải thích**: Đây là hành vi có chủ đích trên Windows. Thư viện `ssh2` sẽ tự động chuyển đổi an toàn sang chế độ thuần JavaScript (pure JS fallback) mà không làm ảnh hưởng đến hiệu năng SSH. Bạn hoàn toàn có thể an tâm bỏ qua cảnh báo này.

---

## 12.2. Sự Cố Kết Nối SSH & Môi Trường WSL

### 1. Lỗi "Host Key Verification Failed"
- **Nguyên nhân**: Máy chủ remote vừa được cài lại hệ điều hành hoặc thay đổi khóa SSH, làm lệch khóa đã lưu trong Orca.
- **Cách xử lý**:
  - Mở file `~/.ssh/known_hosts` trên máy bạn.
  - Xóa dòng chứa địa chỉ IP/Hostname của máy chủ đó, sau đó thử kết nối lại từ Orca để chấp nhận dấu vân tay mới.

### 2. Sự cố banner text trên WSL làm hỏng output parser
- **Hiện tượng**: Trạng thái Agent chạy trong WSL bị nhận diện sai.
- **Giải thích & Xử lý**: Lớp vỏ login shell của WSL thường in banner chào mừng (distro banner) ra stdout. Orca đã trang bị hàm bọc lệnh `buildWslCapturedLoginShellCommand` và cờ `--exec` của `buildWslExecArgs` để ngăn chặn việc biến môi trường bị mở rộng ngoài ý muốn. Hãy chắc chắn bạn đang dùng phiên bản Orca mới nhất.

---

## 12.3. Quản Lý Bộ Nhớ & Dọn Dẹp Tiến Trình Rác (Orphan PTY Cleanup)

### 1. Cơ chế phát hiện và dọn dẹp Orphan PTY
Nếu máy tính bị tắt đột ngột (mất điện, sập nguồn):
- Khi Orca khởi động lại, module `workspace-cleanup` sẽ quét toàn bộ bảng tiến trình hệ điều hành qua `windows-process-table.ts` (trên Windows) hoặc POSIX process tree (trên macOS/Linux).
- Tự động giải phóng các tiến trình PTY bị mồ côi (không còn gắn với worktree nào), thu hồi 100% RAM và CPU cho hệ thống.

### 2. Tối ưu hóa bộ nhớ xterm WebGL
- Nếu máy tính của bạn có card đồ họa yếu hoặc không hỗ trợ WebGL 2.0:
- Bạn có thể vào **Settings** -> **Terminal** -> Chuyển renderer từ `WebGL` sang `Canvas` hoặc `DOM` để tiết kiệm VRAM.

---

## 12.4. Khôi Phục Dữ Liệu & Khôi Phục Phiên Làm Việc

### 1. Phục hồi Worktree bị xóa nhầm
- Nếu bạn vô tình bấm xóa một worktree trong danh sách:
- Bấm `⌘ ⇧ P` (hoặc `Ctrl + Shift + P`) -> Gõ `Worktree: Open Recovery Panel`.
- Chọn worktree từ danh sách **Trash** và bấm **"Restore to Workspace"**. Toàn bộ file và branch chưa commit sẽ được khôi phục nguyên vẹn.

<p align="center">
  <img src="../docs/assets/issue-1920/fix.png" alt="Ví dụ quy trình chẩn đoán và khắc phục sự cố trong giao diện Orca" width="90%" />
</p>

### 2. Vị trí lưu trữ dữ liệu trạng thái (App Data)
- **Windows**: `%APPDATA%\Orca` (bản chính thức) hoặc `%APPDATA%\orca-dev` (bản phát triển).
- **macOS**: `~/Library/Application Support/Orca`
- **Linux**: `~/.config/Orca`

Nếu cơ sở dữ liệu SQLite bị lỗi cục bộ, bạn có thể sao lưu và xóa file `state.db` trong thư mục trên để ứng dụng khởi tạo lại một database sạch sẽ.

---

## 12.5. Tổng Kết & Lời Kết Toàn Bộ Sổ Tay

Chúc mừng bạn đã hoàn thành trọn bộ **Sổ tay Hướng dẫn Sử dụng Phần mềm Orca**! 

Với các kiến thức từ 12 chương:
- Bạn đã sẵn sàng điều phối hàng loạt AI Agent chạy song song trong các Git Worktree độc lập.
- Tận dụng tối đa sức mạnh của Terminal Ghostty-class, Trình duyệt Design Mode, SSH Remote, Mobile Companion và bộ lệnh CLI.
- Tự tin làm chủ năng suất lập trình gấp 10x - 100x với sự hỗ trợ của hệ sinh thái AI tiên tiến nhất hiện nay!

> Mọi đóng góp, báo cáo lỗi và yêu cầu tính năng mới, xin mời tham gia cộng đồng mã nguồn mở tại [GitHub Repository stablyai/orca](https://github.com/stablyai/orca) hoặc Discord của Orca.
