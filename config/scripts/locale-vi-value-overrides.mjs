// Exact whole-string Vietnamese renderings, checked before any other repair.
//
// An override whose value equals its English key is the locale-scoped way to pin a term to
// English: NEVER_TRANSLATE_VALUES is shared by every locale, so putting Git vocabulary there
// would strip the translation out of es/ja/ko/zh too.
export const VI_VALUE_OVERRIDES = {
  // Technical vocabulary pinned to English as a bare label.
  Commit: 'Commit',
  Commits: 'Commit',
  Branch: 'Branch',
  Branches: 'Branch',
  Merge: 'Merge',
  Merged: 'Merged',
  Rebase: 'Rebase',
  Squash: 'Squash',
  Push: 'Push',
  Pull: 'Pull',
  Fetch: 'Fetch',
  Clone: 'Clone',
  Checkout: 'Checkout',
  Stash: 'Stash',
  Diff: 'Diff',
  Blame: 'Blame',
  Remote: 'Remote',
  Remotes: 'Remote',
  'Add remote': 'Thêm remote',
  Worktree: 'Worktree',
  Worktrees: 'Worktree',
  Workspace: 'Workspace',
  Workspaces: 'Workspace',
  Terminal: 'Terminal',
  Terminals: 'Terminal',
  Agent: 'Agent',
  Agents: 'Agent',
  Repo: 'Repo',
  Repos: 'Repo',
  Repository: 'Repo',
  PR: 'PR',
  PRs: 'PR',
  'Pull Request': 'Pull Request',
  'Pull Requests': 'Pull Request',
  Pane: 'Pane',
  Prompt: 'Prompt',
  Token: 'Token',
  Tokens: 'Token',
  Plugin: 'Plugin',
  Plugins: 'Plugin',
  Sandbox: 'Sandbox',
  Runtime: 'Runtime',
  Sidebar: 'Sidebar',
  Tab: 'Tab',
  Tabs: 'Tab',
  Shell: 'Shell',
  Hook: 'Hook',
  Hooks: 'Hook',

  // Common UI vocabulary, so the highest-traffic labels never depend on machine translation.
  Settings: 'Cài đặt',
  Appearance: 'Giao diện',
  General: 'Chung',
  Advanced: 'Nâng cao',
  Language: 'Ngôn ngữ',
  Interface: 'Giao diện',
  Theme: 'Chủ đề',
  Save: 'Lưu',
  'Save changes': 'Lưu thay đổi',
  Cancel: 'Hủy',
  Close: 'Đóng',
  Delete: 'Xóa',
  Remove: 'Xóa',
  Create: 'Tạo',
  Add: 'Thêm',
  Edit: 'Sửa',
  Rename: 'Đổi tên',
  Copy: 'Sao chép',
  Paste: 'Dán',
  Cut: 'Cắt',
  Undo: 'Hoàn tác',
  Redo: 'Làm lại',
  Search: 'Tìm kiếm',
  'Search...': 'Tìm kiếm...',
  Filter: 'Bộ lọc',
  Done: 'Xong',
  Next: 'Tiếp',
  Back: 'Quay lại',
  Continue: 'Tiếp tục',
  Skip: 'Bỏ qua',
  Finish: 'Hoàn tất',
  Retry: 'Thử lại',
  'Try again': 'Thử lại',
  Refresh: 'Làm mới',
  Reload: 'Tải lại',
  Reset: 'Đặt lại',
  Clear: 'Xóa',
  Enable: 'Bật',
  Disable: 'Tắt',
  Enabled: 'Đã bật',
  Disabled: 'Đã tắt',
  On: 'Bật',
  Off: 'Tắt',
  Open: 'Mở',
  Dismiss: 'Bỏ qua',
  Optional: 'Tùy chọn',
  Required: 'Bắt buộc',
  Discard: 'Loại bỏ',
  Confirm: 'Xác nhận',
  Select: 'Chọn',
  'Select all': 'Chọn tất cả',
  Install: 'Cài đặt',
  Installed: 'Đã cài đặt',
  'Not installed': 'Chưa cài đặt',
  Uninstall: 'Gỡ cài đặt',
  Update: 'Cập nhật',
  Connect: 'Kết nối',
  Disconnect: 'Ngắt kết nối',
  Connected: 'Đã kết nối',
  Disconnected: 'Đã ngắt kết nối',
  Connecting: 'Đang kết nối',
  'Connecting…': 'Đang kết nối…',
  Ready: 'Sẵn sàng',
  Running: 'Đang chạy',
  Stopped: 'Đã dừng',
  Failed: 'Thất bại',
  Success: 'Thành công',
  Error: 'Lỗi',
  Warning: 'Cảnh báo',
  Loading: 'Đang tải',
  'Loading…': 'Đang tải…',
  'Saving...': 'Đang lưu...',
  'Checking...': 'Đang kiểm tra...',
  Status: 'Trạng thái',
  Name: 'Tên',
  Description: 'Mô tả',
  Details: 'Chi tiết',
  Actions: 'Hành động',
  Help: 'Trợ giúp',
  About: 'Giới thiệu',
  File: 'Tệp',
  Folder: 'Thư mục',
  Path: 'Đường dẫn',
  View: 'Xem',
  Window: 'Cửa sổ',
  Light: 'Sáng',
  Dark: 'Tối',
  System: 'Hệ thống',
  Auto: 'Tự động',
  None: 'Không',
  All: 'Tất cả',
  Yes: 'Có',
  No: 'Không',
  Quit: 'Thoát',
  Exit: 'Thoát',

  // Why: MT read the GitLab abbreviation "MR" (Merge Request) as the title "Mr." and
  // rendered it "Ông" (a form of address) — keep it untranslated like PR.
  MR: 'MR',
  // Why: singular "Port" (network port) was inconsistently rendered "Cảng" (seaport);
  // the plural "Ports" correctly got "Cổng" (network port) — align the singular to match.
  Port: 'Cổng',
  // Why: bare "commit" is too short/common a Vietnamese loanword collision ("làm" = to
  // do/make) to safely revert via the sentence-level phrase-fix mechanism — pin the exact
  // standalone leaf instead of adding "làm" to the generic wrong-forms list.
  commit: 'commit',
  // Why: bare lowercase "grok" (a search-keyword alias for the Grok brand, distinct from
  // NEVER_TRANSLATE_VALUES' capitalized "Grok") got MT'd to "mò mẫm" — the English verb "to
  // grok" (understand intuitively) — instead of staying the product name.
  grok: 'grok',
  // Why: MT restructured the whole phrase rather than leaving "runtime" isolable as a
  // substring, so there is no safe wrong-form to extract — pin these two leaves directly.
  'Codex usage runtime': 'Runtime sử dụng Codex',
  'Claude usage runtime': 'Runtime sử dụng Claude',
  // Why: this is a literal shell command example the user copies verbatim (the `{prompt}`
  // placeholder belongs to Ollama's CLI, not to i18next) — keep the command untranslated.
  'e.g. ollama run llama3.1 {prompt}': 'vd: ollama run llama3.1 {prompt}',

  // Why: these git-staging labels collide with the legitimate "giai đoạn" (progress phase)
  // rendering that the generic 'stage' wrong-forms list deliberately excludes — pin the
  // short, high-traffic Source Control leaves directly instead of widening that list.
  'Stage all': 'Stage tất cả',
  'Unstage all': 'Unstage tất cả',
  'Unstage folder': 'Unstage thư mục',
  'Discard all failed — unable to unstage files before discard':
    'Loại bỏ tất cả không thành công — không thể unstage tệp trước khi loại bỏ',
  'Stage all changes before committing partially staged files':
    'Stage tất cả thay đổi trước khi commit các tệp mới chỉ stage một phần',

  // Why: MT restructured these past the point a wrong-form substring could isolate.
  'Fast-forwarded {{branch}} by 1 commit.': 'Đã fast-forward {{branch}} thêm 1 commit.',
  'git diff main...HEAD': 'git diff main...HEAD',
  'Preferred presentation format for showing git diffs by default.':
    'Định dạng trình bày mặc định để hiển thị git diff.',
  'Font used by file editors and diff views. Leave empty to follow the terminal font.':
    'Phông chữ dùng cho trình chỉnh sửa tệp và khung xem diff. Để trống để theo phông chữ terminal.',
  'Edit issue links, pull request links, and notes for this workspace.':
    'Chỉnh sửa liên kết vấn đề, liên kết pull request và ghi chú cho workspace này.',
  'Pull request description': 'Mô tả pull request',
  'Pull request title': 'Tiêu đề pull request',
  'Discard all unstaged changes?': 'Loại bỏ tất cả thay đổi chưa stage?',

  // Why: "command transport" is the RPC/IPC channel, not a military command — MT rendered it
  // as "chỉ huy" (to command troops). "orca status"/"orca terminal" are literal CLI
  // subcommands the user types, so they must stay unreordered and untranslated.
  "Orca couldn't start its local command transport.": 'Orca không thể khởi động kênh lệnh cục bộ.',
  'Orca will continue to work, but commands such as orca status, orca terminal, and orchestration are unavailable for this session.\n\n{{guidance}}\n\nCause: {{cause}}':
    'Orca sẽ tiếp tục hoạt động, nhưng các lệnh như orca status, orca terminal và orchestration sẽ không khả dụng trong phiên này.\n\n{{guidance}}\n\nNguyên nhân: {{cause}}'
}
