# Đề Cương Tổng Thể: Sổ Tay Hướng Dẫn Sử Dụng Orca

> **Orca — The AI Orchestrator for 100x Builders**  
> Bộ sổ tay thực chiến hướng dẫn toàn diện từ cơ bản đến nâng cao về cách vận hành, điều phối song song nhiều AI Coding Agent trong môi trường Worktree độc lập.

---

## 1. Mục lục Tổng Quan (Table of Contents)

- [00. Đề Cương Tổng Thể & Lộ Trình Học Tập](./00-de-cuong-tong-the.md)
- [Chương 01: Giới Thiệu & Triết Lý Kiến Trúc Orca](./01-gioi-thieu-tong-quan.md)
- [Chương 02: Cài Đặt & Khởi Tạo Môi Trường](./02-cai-dat-khoi-tao.md)
- [Chương 03: Không Gian Làm Việc & Quản Lý Worktree](./03-khong-gian-lam-viec-worktree.md)
- [Chương 04: Điều Phối & Quản Trị Hệ Thống AI Agents](./04-dieu-phoi-quan-ly-ai-agents.md)
- [Chương 05: Terminal Đa Nhiệm & Hệ Thống PTY Daemon](./05-terminal-split-xterm.md)
- [Chương 06: Trình Duyệt Tích Hợp & Design Mode](./06-design-mode-trinh-duyet.md)
- [Chương 07: Làm Việc Từ Xa Qua SSH & Môi Trường WSL](./07-ssh-remote-worktree.md)
- [Chương 08: Quản Lý Source Control & Đánh Giá Code AI](./08-git-review-annotate-diff.md)
- [Chương 09: Điều Khiển Qua Ứng Dụng Di Động & Thông Báo](./09-mobile-companion-thong-bao.md)
- [Chương 10: Tự Động Hóa Với Bộ Lệnh Orca CLI](./10-orca-cli-tu-dong-hoa.md)
- [Chương 11: Mở Rộng Hệ Thống Với Plugins & Agent Skills](./11-tuy-bien-plugins-skills.md)
- [Chương 12: Chẩn Đoán & Xử Lý Sự Cố (Troubleshooting)](./12-xu-ly-su-co-troubleshooting.md)

---

## 2. Chi Tiết Nội Dung Từng Chương

### [Chương 01: Giới Thiệu & Triết Lý Kiến Trúc Orca](./01-gioi-thieu-tong-quan.md)
- **1.1. Orca là gì?** — Bài toán điều phối song song nhiều agent (Fan-out execution) và giới hạn của IDE truyền thống (VS Code, Cursor).
- **1.2. Đơn vị trung tâm**: Tại sao trung tâm của Orca là *"Agent Session trong Worktree độc lập"* thay vì *"File đang mở"*.
- **1.3. Triết lý kiến trúc Process-Per-Risk**: Tách biệt PTY daemon, file watcher, SQLite workers, sidecar để đảm bảo độ ổn định tuyệt đối.
- **1.4. Hệ sinh thái 39+ Agent**: Các agent được nhận diện first-class (Claude Code, Codex, Opencode, Gemini, Pi, Amp, Cursor, v.v.).

### [Chương 02: Cài Đặt & Khởi Tạo Môi Trường](./02-cai-dat-khoi-tao.md)
- **2.1. Yêu cầu hệ thống**: macOS (Apple Silicon / Intel), Windows 10/11, Linux (Ubuntu/Debian, Arch Linux).
- **2.2. Hướng dẫn cài đặt Desktop**:
  - macOS: Cài qua Homebrew Cask hoặc file `.dmg`.
  - Windows: Cài qua bộ cài đặt `.exe` (SignPath signed) hoặc giải nén bản di động.
  - Linux: Sử dụng AppImage hoặc AUR (`stably-orca-bin`).
- **2.3. Cấu hình môi trường cho Developer**: Node 24, pnpm 10.x, C++ Build Tools (MSVC 2022 trên Windows).
- **2.4. Cấu hình ban đầu & Khởi chạy**: Thiết lập phím tắt, giao diện đơn sắc tối ưu hóa thị giác.

### [Chương 03: Không Gian Làm Việc & Quản Lý Worktree](./03-khong-gian-lam-viec-worktree.md)
- **3.1. Phân biệt Git Worktree vs Folder Workspace**:
  - Cơ chế tạo và quản lý Worktree nhánh độc lập không đè code.
  - Folder Workspace cho dự án non-git.
- **3.2. Tính năng Auto-naming thông minh**: `first-work-branch-rename` và `first-work-workspace-title-rename`.
- **3.3. Thao tác Worktree thực tế**: Tạo mới, nhân bản, chuyển đổi nhanh (Quick Open), xóa và dọn rác an toàn (Trash & Recovery).

### [Chương 04: Điều Phối & Quản Trị Hệ Thống AI Agents](./04-dieu-phoi-quan-ly-ai-agents.md)
- **4.1. Cơ chế Agent-Hooks**: HTTP Server nội bộ nhận telemetry, trạng thái liveness của Subagents.
- **4.2. Giao diện Native Chat & Headless Session**:
  - Gửi prompt có ngữ cảnh đính kèm (file drag & drop, DOM snippet).
  - Tương tác với Approval Card, Question Card, Tool Run.
- **4.3. Quản lý Tài khoản & Rate Limits**: Hot-swap tài khoản Claude/Codex không cần đăng nhập lại, theo dõi quota & thời gian reset.
- **4.4. AI Vault**: Quản lý lịch sử hội thoại, tìm kiếm phiên làm việc xuyên suốt nhiều mô hình.

### [Chương 05: Terminal Đa Nhiệm & Hệ Thống PTY Daemon](./05-terminal-split-xterm.md)
- **5.1. Công nghệ Terminal Ghostty-Class**: Render WebGL siêu tốc, hỗ trợ font ligatures và chuẩn Unicode 11.
- **5.2. PTY Daemon độc lập**: Scrollback và tiến trình dòng lệnh sống sót khi đóng hoặc khởi động lại ứng dụng.
- **5.3. Bố cục Chia màn hình (Split Panes)**: Chia vô hạn theo chiều ngang/dọc, quản lý nhóm tab.
- **5.4. Đồng bộ & Cơ chế Backpressure**: Kiểm soát lưu lượng output terminal lớn không làm đơ giao diện.

### [Chương 06: Trình Duyệt Tích Hợp & Design Mode](./06-design-mode-trinh-duyet.md)
- **6.1. Trình duyệt Chromium nhúng**: Quản lý guest view, session cookies (nhập từ Chrome/Brave/Comet).
- **6.2. Tính năng Design Mode ("Grab Tool")**:
  - Click chọn phần tử HTML trên màn hình live preview.
  - Tự động trích xuất mã HTML, CSS computed và ảnh chụp crop gửi vào prompt của Agent.
- **6.3. Tính năng Computer Use & Sidecar**: Cho phép Agent tương tác trực tiếp với UI desktop qua chuột/bàn phím ảo.
- **6.4. Emulator Streaming**: Xem và điều khiển màn hình máy ảo di động (Android/iOS).

### [Chương 07: Làm Việc Từ Xa Qua SSH & Môi Trường WSL](./07-ssh-remote-worktree.md)
- **7.1. Ba Execution Host**: So sánh Local vs WSL vs Remote SSH.
- **7.2. Thiết lập kết nối SSH Host**: Xác thực khóa (Host Key Verification), tự động phục hồi khi mất mạng (Auto-reconnect).
- **7.3. Port Forwarding**: Tự động chuyển tiếp cổng web service từ server remote về máy cục bộ.
- **7.4. Quy tắc tương thích Remote Wire Protocol**: Đảm bảo phiên bản app desktop và relay server luôn đồng bộ.

### [Chương 08: Quản Lý Source Control & Đánh Giá Code AI](./08-git-review-annotate-diff.md)
- **Chương 8.1. Review Diff trực quan**: Monaco Diff Viewer với bộ lọc file thay đổi.
- **Chương 8.2. Tính năng Annotate AI Diff**: Thả comment trực tiếp vào dòng code diff để Agent đọc và sửa lại.
- **Chương 8.3. Tự động sinh Commit Message & PR**: Trí tuệ nhân tạo tóm tắt ngữ cảnh thay đổi.
- **Chương 8.4. Tích hợp Forge & Issue Trackers**: Xem và mở Worktree từ GitHub PRs, GitLab MRs, Linear Issues, Jira Tickets.

### [Chương 09: Điều Khiển Qua Ứng Dụng Di Động & Thông Báo](./09-mobile-companion-thong-bao.md)
- **9.1. Giới thiệu Orca Mobile**: Ứng dụng đồng hành trên iOS (App Store/TestFlight) và Android (APK).
- **9.2. Ghép nối thiết bị**: Quét mã QR, cơ chế mã hóa đầu-cuối với thư viện TweetNaCl trên WebSocket port 6768.
- **9.3. Nhận thông báo & Phản hồi**: Nhận thông báo khi Agent hoàn thành tác vụ hoặc cần xin cấp quyền; gửi chỉ đạo tiếp theo từ điện thoại.

### [Chương 10: Tự Động Hóa Với Bộ Lệnh Orca CLI](./10-orca-cli-tu-dong-hoa.md)
- **10.1. Cài đặt & Tổng quan `orca` binary**: Đường dẫn, biến môi trường và thiết lập PATH.
- **10.2. Các họ lệnh cốt lõi**:
  - `orca worktree create / switch / delete`
  - `orca snapshot / screenshot`
  - `orca click / fill` (UI Automation)
  - `orca serve` (Chạy Headless trên Linux Server).
- **10.3. Tự động hóa CI/CD & Agent điều khiển Agent**: Kịch bản chạy batch kiểm thử nhiều giải pháp.

### [Chương 11: Mở Rộng Hệ Thống Với Plugins & Agent Skills](./11-tuy-bien-plugins-skills.md)
- **11.1. Hệ thống Plugin Out-of-process**: Mô hình bảo mật Consent, Kill-list, Marketplace.
- **11.2. Agent Skills Sharing**: Quản lý và chia sẻ kỹ năng chuyên môn giữa các Agent.
- **11.3. Tùy biến Theme & Giao diện**: Nhập theme từ Ghostty và Warp, chỉnh sửa CSS token.

### [Chương 12: Chẩn Đoán & Xử Lý Sự Cố (Troubleshooting)](./12-xu-ly-su-co-troubleshooting.md)
- **12.1. Các lỗi phổ biến trên Windows**: Lỗi khóa file `EPERM`, rò rỉ biến môi trường `ELECTRON_RUN_AS_NODE`, cấu hình `.cmd` runner.
- **12.2. Sự cố kết nối SSH & WSL**: Mất gói, xung đột port, xác thực khóa host.
- **12.3. Quản lý tài nguyên & Bộ nhớ**: Cơ chế dọn dẹp Orphan PTY, tối ưu bộ nhớ xterm WebGL.
- **12.4. Khôi phục phiên làm việc**: Khôi phục Worktree đã xóa trong Trash, quét lại cơ sở dữ liệu SQLite.

---

## 3. Quy Ước Ký Hiệu & Phím Tắt

| Ký hiệu trên macOS | Ký hiệu trên Windows/Linux | Ý nghĩa thao tác |
| :--- | :--- | :--- |
| `⌘` (Command) | `Ctrl` | Phím bổ trợ chính cho phím tắt |
| `⇧` (Shift) | `Shift` | Phím bổ trợ thay đổi hành vi |
| `⌥` (Option) | `Alt` | Phím bổ trợ tùy chọn |
| `⌃` (Control) | `Ctrl` | Phím điều khiển terminal |
| `↵` (Enter / Return) | `Enter` | Thực thi lệnh hoặc xác nhận |
