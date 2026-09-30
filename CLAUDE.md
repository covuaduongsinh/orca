# Orca AI Assistant Reference Index (CLAUDE.md)

Tài liệu này là cổng thông tin chính dành cho Claude Code và các AI Assistant khi làm việc trong repository Orca.

---

## 1. Bản Đồ Tài Liệu Cốt Lõi (Core Knowledge Map)

Khi thực hiện bất kỳ nhiệm vụ nào, hãy tham khảo các tài liệu chuyên biệt sau:

- 📋 [`AGENTS.md`](file:///d:/code/orca/AGENTS.md) — **Quy tắc thiết kế, phong cách mã nguồn, an toàn đa nền tảng và cổng kiểm thử bắt buộc (Mandatory Gates).**
- 🏗️ [`TECH.md`](file:///d:/code/orca/TECH.md) — **Kiến trúc kỹ thuật chi tiết, danh mục module, thuật toán cốt lõi và giao thức truyền thông.**
- 🧠 [`MEMORY.md`](file:///d:/code/orca/MEMORY.md) — **Bộ nhớ dài hạn, các bất biến kiến trúc, bài học kinh nghiệm, cẩm nang mở rộng tính năng và nhân bản phần mềm.**
- 🛠️ [`SKILLS.md`](file:///d:/code/orca/SKILLS.md) — **Hệ sinh thái công cụ/kỹ năng (Agent Skills) và quy chuẩn xây dựng Skill mới.**
- 📖 [`README.md`](file:///d:/code/orca/README.md) — **Giới thiệu tổng quan sản phẩm, tính năng và hướng dẫn người dùng.**

---

## 2. Các Lệnh Thao Tác Nhanh (Essential Commands)

### 2.1. Kiểm Tra Tính Hợp Lệ Của Mã Nguồn (Verification Gates)
```bash
# Kiểm tra kiểu dữ liệu toàn dự án
pnpm tc

# Kiểm tra linting và chất lượng code trên các file thay đổi
pnpm run check:code-quality:changed

# Chạy bộ unit tests
pnpm test

# Format mã nguồn theo chuẩn oxfmt
pnpm format
```

### 2.2. Xây Dựng Dự Án (Build Pipelines)
```bash
# Khởi chạy môi trường phát triển Electron
pnpm dev

# Build toàn bộ desktop runtime (Relay + CLI + Electron + Mobile Web)
pnpm run build:desktop

# Build và kiểm tra tính toàn vẹn của skills catalog
pnpm run verify:bundled-skill-guides
pnpm run verify:skill-bundle-manifest
```

---

## 3. Nguyên Tắc Hành Động Bắt Buộc (Golden Rules)
1. **Tái sử dụng trước khi viết mới**: Luôn tìm kiếm logic đã có trước khi tạo hàm/component mới.
2. **Comment súc tích**: Chỉ viết comment 1 dòng giải thích lý do thiết kế (WHY, not HOW), không viết comment giải thích điều hiển nhiên.
3. **An toàn tiến trình Windows**: Luôn dùng `runProcess`/`spawnProcess` từ `src/shared/child-process/`. Không dùng `shell: true`.
4. **An toàn Git Worktree**: Không duyệt quét vô hạn (`bounded ref scan`), giữ khả năng tương thích từ Git 2.25 trở lên.
