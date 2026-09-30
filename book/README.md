# Sổ Tay Hướng Dẫn Sử Dụng Phần Mềm Orca (Orca User Handbook)

> **Orca — The AI Orchestrator for 100x Builders**  
> Chạy Codex, ClaudeCode, OpenCode hay Pi song song, mỗi agent trong một git worktree riêng biệt, quản lý tập trung tại một nơi.

<p align="center">
  <img src="../docs/assets/readme-hero.jpg" alt="Orca desktop app running agents in parallel worktrees, with the Orca mobile companion app in the corner" width="100%" />
</p>

Chào mừng bạn đến với bộ tài liệu và sổ tay hướng dẫn thực chiến toàn diện về phần mềm **Orca**. Toàn bộ tài liệu được biên soạn công phu, mạch lạc, chia thành từng chương độc lập giúp bạn dễ dàng tra cứu và thực hành.

---

## Danh Sách Các Chương

| Thứ tự | Tên Chương | Nội dung chính |
| :---: | :--- | :--- |
| 📑 | [**00. Đề Cương Tổng Thể & Lộ Trình**](./00-de-cuong-tong-the.md) | Mục lục chi tiết cấp 2-3, quy ước ký hiệu, bảng đối chiếu phím tắt |
| 01 | [**Chương 01: Giới Thiệu & Triết Lý Kiến Trúc**](./01-gioi-thieu-tong-quan.md) | Khái niệm Orca, triết lý Process-per-risk, hệ sinh thái 39+ Agent |
| 02 | [**Chương 02: Cài Đặt & Khởi Tạo Môi Trường**](./02-cai-dat-khoi-tao.md) | Hướng dẫn cài đặt Desktop trên macOS/Windows/Linux, thiết lập môi trường Dev |
| 03 | [**Chương 03: Không Gian Làm Việc & Quản Lý Worktree**](./03-khong-gian-lam-viec-worktree.md) | Cơ chế Git Worktree & Folder Workspace, tính năng Auto-naming, khôi phục Trash |
| 04 | [**Chương 04: Điều Phối & Quản Trị Hệ Thống AI Agents**](./04-dieu-phoi-quan-ly-ai-agents.md) | Cơ chế Agent-Hooks, Native Chat kéo thả tệp, AI Vault, quản lý tài khoản & Quota |
| 05 | [**Chương 05: Terminal Đa Nhiệm & Hệ Thống PTY Daemon**](./05-terminal-split-xterm.md) | Terminal Ghostty-class WebGL, chia màn hình vô hạn, PTY Daemon giữ tiến trình khi tắt app |
| 06 | [**Chương 06: Trình Duyệt Tích Hợp & Design Mode**](./06-design-mode-trinh-duyet.md) | Trình duyệt Chromium nhúng, Design Mode ("Grab Tool" DOM/CSS), Computer Use |
| 07 | [**Chương 07: Làm Việc Từ Xa Qua SSH & Môi Trường WSL**](./07-ssh-remote-worktree.md) | Máy chủ Remote SSH cấu hình cao, WSL2, tự động phục hồi kết nối, Port Forwarding |
| 08 | [**Chương 08: Quản Lý Source Control & Đánh Giá Code AI**](./08-git-review-annotate-diff.md) | Monaco Diff Viewer, Annotate AI Diffs, AI sinh commit message/PR, tích hợp GitHub/GitLab/Linear/Jira |
| 09 | [**Chương 09: Điều Khiển Qua Ứng Dụng Di Động & Thông Báo**](./09-mobile-companion-thong-bao.md) | Ứng dụng di động Orca Mobile (iOS/Android), ghép nối mã QR, mã hóa TweetNaCl |
| 10 | [**Chương 10: Tự Động Hóa Với Bộ Lệnh Orca CLI**](./10-orca-cli-tu-dong-hoa.md) | Bộ lệnh `orca` CLI, kịch bản tự động hóa, Headless Linux Server (`orca serve`) |
| 11 | [**Chương 11: Mở Rộng Hệ Thống Với Plugins & Agent Skills**](./11-tuy-bien-plugins-skills.md) | Plugin ngoài tiến trình, chia sẻ kỹ năng Agent Skills, nhập Theme Ghostty/Warp |
| 12 | [**Chương 12: Chẩn Đoán & Xử Lý Sự Cố (Troubleshooting)**](./12-xu-ly-su-co-troubleshooting.md) | Cẩm nang gỡ lỗi trên Windows/macOS/Linux/SSH, tối ưu RAM/VRAM, khôi phục dữ liệu |

---

<p align="center">
  <img src="../docs/assets/readme-feature-showcase.gif" alt="Tổng quan tính năng nổi bật của Orca" width="100%" />
</p>

---

## Liên Kết Hữu Ích
- **Kế hoạch triển khai**: [`docs/plans/ke-hoach-viet-so-tay-huong-dan-su-dung.md`](../docs/plans/ke-hoach-viet-so-tay-huong-dan-su-dung.md)
- **Tài liệu tổng quan tiếng Việt**: [`docs/orca-tong-quan-vi.md`](../docs/orca-tong-quan-vi.md)
- **Website chính thức**: [https://onorca.dev](https://onorca.dev)
- **Mã nguồn dự án**: [https://github.com/stablyai/orca](https://github.com/stablyai/orca)
