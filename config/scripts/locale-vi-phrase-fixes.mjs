// Vietnamese glossary repairs applied after machine translation.
//
// Product decision: every technical term stays in English — Git/CLI vocabulary (commit, branch,
// merge, rebase, worktree, diff, stash, PR, terminal, agent, repo) and product vocabulary
// (workspace, runtime, prompt, pane, plugin, token, sandbox, sidebar, tab) alike. Only the verbs
// and prose around them are Vietnamese, which is how Vietnamese developers actually speak.
//
// Because `vi` declares no renderings in locale-generic-ui-terms.mjs, the generic-term gate is
// inert here and these reverts are the only thing pinning those words to Latin. Brand and product
// *names* live in locale-brand-mistranslations.mjs instead; this module handles the vocabulary.

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// Each entry expands to two case-sensitive rules per wrong form, so a sentence-initial
// "Cam kết" becomes "Commit" while a mid-sentence one becomes "commit".
// `wrong` MUST be ordered longest-first: "chi nhánh" has to be consumed before "nhánh",
// otherwise the shorter rule leaves "chi branch" behind.
const DEV_TERMS = [
  {
    term: 'commit',
    whenEnMatches: /\bcommit(s|ted|ting)?\b/i,
    // "xác nhận" is deliberately absent: it is the correct rendering of "Confirm", and
    // "Confirm commit" must stay "Xác nhận commit" rather than collapse to "commit commit".
    wrong: ['sự cam kết', 'cam kết', 'cống hiến']
  },
  {
    term: 'branch',
    whenEnMatches: /\bbranch(es|ing|ed)?\b/i,
    wrong: ['chi nhánh', 'nhánh cây', 'phân nhánh', 'nhánh']
  },
  {
    term: 'merge',
    Term: 'Merge',
    whenEnMatches: /\bmerg(e|es|ed|ing)\b/i,
    wrong: ['sự hợp nhất', 'hợp nhất', 'sáp nhập', 'hòa trộn', 'trộn', 'gộp']
  },
  {
    term: 'rebase',
    whenEnIncludes: 'rebase',
    // MT reads "rebase" as "rebel"/"rebellion" ("nổi loạn") or generically as "restart"
    // ("khởi động lại") strikingly often.
    wrong: ['đặt lại cơ sở', 'cuộc nổi loạn', 'khởi động lại', 'tái cơ sở', 'cơ sở lại', 'nổi loạn']
  },
  {
    term: 'pull request',
    Term: 'Pull Request',
    whenEnIncludes: 'pull request',
    // "pull yêu cầu" / "pull các yêu cầu" are partial MT misses: they left "Pull" alone but
    // still translated "request(s)", optionally inserting the Vietnamese plural marker "các".
    wrong: [
      'yêu cầu lấy dữ liệu',
      'yêu cầu kéo',
      'yêu cầu pull',
      'pull các yêu cầu',
      'pull yêu cầu'
    ]
  },
  {
    term: 'worktree',
    whenEnIncludes: 'worktree',
    wrong: [
      'cây thư mục làm việc',
      'thẻ bài làm việc',
      'sơ đồ công việc',
      'cây công trình',
      'cây công việc',
      'cây làm việc',
      'cây công tác'
    ]
  },
  {
    term: 'repo',
    whenEnMatches: /\brepo(s|sitor(y|ies))?\b/i,
    wrong: ['kho lưu trữ', 'kho mã nguồn', 'kho chứa', 'kho']
  },
  {
    term: 'terminal',
    whenEnMatches: /\bterminals?\b/i,
    // Google renders "terminal" as "nhà ga" (train station) surprisingly often.
    // "cuối" alone is risky (a common word for "final/last") but the boundary-guarded
    // regex plus the "terminal" English guard keep it scoped in practice.
    wrong: ['thiết bị đầu cuối', 'phần cuối', 'đầu cuối', 'nhà ga', 'cuối']
  },
  {
    term: 'agent',
    whenEnMatches: /\bagents?\b/i,
    // "tổng đài viên" (call-center operator), "đặc vụ" (secret agent), and "đại diện"
    // (representative) are recurring MT misses for the CLI-agent sense.
    wrong: [
      'tổng đài viên',
      'người đại diện',
      'đại lý',
      'tác nhân',
      'đặc vụ',
      'nhân viên',
      'đại diện'
    ]
  },
  {
    term: 'diff',
    whenEnMatches: /\bdiffs?\b/i,
    wrong: ['điểm khác biệt', 'sự khác biệt', 'khác biệt']
  },
  {
    term: 'stash',
    whenEnMatches: /\bstash(es|ed|ing)?\b/i,
    wrong: ['lưu trữ tạm thời', 'lưu trữ tạm', 'chỗ giấu', 'cất giữ', 'lưu trữ']
  },
  {
    term: 'checkout',
    whenEnMatches: /\bcheck ?out\b/i,
    // "kiểm tra" is the legitimate rendering of bare "Check", but this rule's guard only
    // matches "check out"/"checkout" as one token, so it never touches a lone "Check".
    wrong: ['thanh toán', 'trả phòng', 'kiểm tra']
  },
  { term: 'push', whenEnMatches: /\bpush(es|ed|ing)?\b/i, wrong: ['đẩy'] },
  { term: 'pull', whenEnMatches: /\bpull(s|ed|ing)?\b/i, wrong: ['kéo'] },
  { term: 'fetch', whenEnMatches: /\bfetch(es|ed|ing)?\b/i, wrong: ['tìm nạp', 'nạp'] },
  {
    term: 'clone',
    whenEnMatches: /\bclon(e|es|ed|ing)\b/i,
    // "sao chép" is the everyday word for "copy" — risky in general, but this rule only
    // fires on strings whose English literally says "clone", so it stays scoped.
    // "dòng vô tính" (biological clone/clone lineage) is the other recurring MT miss.
    wrong: ['dòng vô tính', 'nhân bản', 'bản sao', 'sao chép']
  },
  {
    term: 'squash',
    whenEnMatches: /\bsquash(es|ed|ing)?\b/i,
    wrong: ['quả bí', 'bí đao', 'nghiền', 'bí']
  },
  {
    term: 'cherry-pick',
    Term: 'Cherry-pick',
    whenEnIncludes: 'cherry-pick',
    wrong: ['hái quả anh đào', 'chọn quả anh đào', 'hái anh đào', 'chọn anh đào', 'chọn cherry']
  },
  {
    term: 'stage',
    whenEnMatches: /\b(un)?stag(e|es|ed|ing)\b/i,
    // "giai đoạn" is absent: it is the correct rendering of a progress stage.
    wrong: ['dàn dựng', 'sân khấu']
  },
  { term: 'hunk', whenEnMatches: /\bhunks?\b/i, wrong: ['khối lớn', 'miếng', 'tảng'] },
  { term: 'blame', whenEnIncludes: 'blame', wrong: ['khiển trách', 'chỉ trích', 'quy lỗi'] },
  { term: 'hook', whenEnMatches: /\bhooks?\b/i, wrong: ['cái móc', 'lưỡi câu', 'móc nối', 'móc'] },
  {
    term: 'workspace',
    whenEnMatches: /\bworkspaces?\b/i,
    wrong: ['không gian làm việc', 'khu vực làm việc', 'vùng làm việc']
  },
  { term: 'sandbox', whenEnIncludes: 'sandbox', wrong: ['hộp cát'] },
  { term: 'daemon', whenEnIncludes: 'daemon', wrong: ['trình nền', 'ma quỷ', 'yêu tinh', 'quỷ'] },
  { term: 'token', whenEnMatches: /\btokens?\b/i, wrong: ['mã thông báo'] },
  {
    term: 'plugin',
    whenEnMatches: /\bplug ?ins?\b/i,
    wrong: [
      'tiện ích bổ sung',
      'phần bổ trợ',
      'trình cắm thêm',
      'trình cắm',
      'bổ trợ',
      'bổ sung',
      'cắm'
    ]
  },
  {
    term: 'shell',
    whenEnMatches: /\bshells?\b/i,
    wrong: ['lớp vỏ', 'vỏ bọc', 'trình bao', 'vỏ']
  },
  {
    term: 'runtime',
    whenEnMatches: /\bruntimes?\b/i,
    wrong: ['thời gian hoạt động', 'thời gian chạy', 'lúc chạy']
  },
  {
    term: 'pane',
    whenEnMatches: /\bpanes?\b/i,
    wrong: ['khung kính', 'tấm kính', 'ô kính', 'ngăn', 'khung']
  },
  {
    term: 'prompt',
    whenEnMatches: /\bprompts?\b/i,
    wrong: ['dấu nhắc', 'lời nhắc', 'nhắc nhở']
  },
  {
    term: 'sidebar',
    whenEnIncludes: 'sidebar',
    wrong: ['thanh công cụ bên', 'thanh cạnh', 'thanh bên']
  },
  { term: 'tag', whenEnMatches: /\btags?\b/i, wrong: ['thẻ đánh dấu', 'thẻ'] },
  {
    term: 'tab',
    // Guarded on the English "tab" token, so this never touches an unrelated "thẻ"
    // that is the correct translation of "tag"/"card" elsewhere in the same string.
    whenEnMatches: /\btabs?\b/i,
    wrong: ['tab điều hướng', 'thẻ']
  }
]

// Custom "word boundary" built on the Unicode letter property (\p{L}), spelled via
// fromCharCode so the source file never carries a literal backslash escape (which downstream
// tooling in this pipeline has repeatedly mangled). Plain regex \b is ASCII-only in JS — it
// treats every accented Vietnamese vowel as a non-word character, so a wrong-form ending in one
// (e.g. "nhắc nhở", "lưu trữ", "thẻ") would never satisfy a trailing \b and silently never match.
const LETTER = `${String.fromCharCode(92)}p{L}`
const NOT_BEFORE_LETTER = `(?<!${LETTER})`
const NOT_AFTER_LETTER = `(?!${LETTER})`

function expandDevTerm({ term, Term, whenEnIncludes, whenEnMatches, wrong }) {
  const guard = whenEnMatches ? { whenEnMatches } : { whenEnIncludes }
  // Bounded so a short wrong form (e.g. "ngăn") never eats into an unrelated Vietnamese word
  // that happens to contain the same syllable.
  return wrong.flatMap((form) => [
    {
      pattern: new RegExp(NOT_BEFORE_LETTER + capitalize(form) + NOT_AFTER_LETTER, 'gu'),
      replacement: Term ?? capitalize(term),
      ...guard
    },
    {
      pattern: new RegExp(NOT_BEFORE_LETTER + form + NOT_AFTER_LETTER, 'gu'),
      replacement: term,
      ...guard
    }
  ])
}

export const VI_PHRASE_FIXES = [
  // Why: machine translation renders the abbreviation "PR" (pull request) as "quan hệ công chúng"
  // (public relations). The guard matches the real PR/PRs token so genuinely public-relations
  // English is left alone — the same failure Spanish hit with "relaciones públicas".
  { pattern: /Quan hệ công chúng/g, replacement: 'PR', whenEnMatches: /\bPRs?\b/ },
  { pattern: /quan hệ công chúng/g, replacement: 'PR', whenEnMatches: /\bPRs?\b/ },
  // "Add remote" must not become "Thêm từ xa"; the adjectival sense ("remote host" →
  // "máy chủ từ xa") reads naturally in Vietnamese and is intentionally left translated.
  { pattern: /điều khiển từ xa/g, replacement: 'remote', whenEnMatches: /\bremotes?\b/i },
  // Why: "giai đoạn" (phase/stage) is deliberately absent from the generic 'stage' wrong-forms
  // above because it is the correct rendering of a progress stage elsewhere. But "Staged
  // Changes" — the git-staging concept, which must stay English — hits the same MT word, so
  // revert only this specific bigram, tightly guarded on the literal English phrase.
  {
    pattern: /Thay đổi theo giai đoạn/g,
    replacement: 'Thay đổi đã stage',
    whenEnMatches: /\bStaged Changes\b/
  },
  {
    pattern: /thay đổi theo giai đoạn/g,
    replacement: 'thay đổi đã stage',
    whenEnMatches: /\bstaged changes\b/i
  },
  ...DEV_TERMS.flatMap(expandDevTerm)
]
