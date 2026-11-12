// 「關於我」頁的資料(決策 16)。這裡是資料不是規則:增減自我介紹的證據、技能分組名單,改這一份就好。
// 文案本身(句子)在 src/locales/*.json 的 about.* 底下;這裡只放「連到哪裡」。

// 聯絡方式。LinkedIn / Medium 沿用頁尾已在用的環境變數,不另寫一份。
// Email 待需求方決定要公開哪一個信箱(票 10 QUESTION.md Q1);拿到前保持 null,頁上就不顯示 Email 那個連結。
export function getContacts() {
    return {
        email: null,
        linkedin: import.meta.env.VITE_LINKEDIN_URL ?? null,
        medium: import.meta.env.VITE_MEDIUM_URL ?? null,
    }
}

// 證據連結:每一筆指向文章的某一段。anchor 是那一段標題經 rehype-slug 產生的 id(文章頁 PostBody 用的同一套)。
// 有英文版的文章,en 指向英文版;沒有英文版的只寫 zh,英文介面照樣連過去,並標示「中文」。
// titleId 是連結文字在 locales 裡的 key。
export const introClaims = [
    {
        id: "distributed",
        evidence: [
            {
                titleId: "about.evidence.fortvax_deploy",
                zh: {postId: 487, anchor: "-完整的部署架構"},
                en: {postId: 488, anchor: "-complete-deployment-architecture"},
            },
            {
                titleId: "about.evidence.choose_architecture",
                zh: {postId: 421, anchor: "-架構"},
                en: {postId: 422, anchor: "-architecture"},
            },
            {
                titleId: "about.evidence.echoss_deploy",
                zh: {postId: 423, anchor: "-持續部署"},
                en: {postId: 424, anchor: "-continuous-deployment"},
            },
        ],
    },
    {
        id: "concurrency",
        evidence: [
            {
                titleId: "about.evidence.choose_red_packet",
                zh: {postId: 421, anchor: "-搶紅包"},
                en: {postId: 422, anchor: "-grabbing-red-packets"},
            },
            {
                titleId: "about.evidence.echoss_coupons",
                zh: {postId: 423, anchor: "-大量發券"},
                en: {postId: 424, anchor: "-mass-coupon-distribution"},
            },
            {
                titleId: "about.evidence.mysql_lock",
                zh: {postId: 386, anchor: "-增進效能的改良-query"},
            },
        ],
    },
    {
        id: "full_stack",
        evidence: [
            {
                titleId: "about.evidence.vapt",
                zh: {postId: 463, anchor: "-前言"},
                en: {postId: 486, anchor: "introduction"},
            },
            {
                titleId: "about.evidence.vpn_before_ssh",
                zh: {postId: 447, anchor: "-前言"},
                en: {postId: 505, anchor: "-preface"},
            },
            {
                titleId: "about.evidence.own_blog",
                zh: {postId: 116, anchor: "-技術架構"},
                en: {postId: 120, anchor: "-technical-architecture"},
            },
        ],
    },
    {
        id: "keep_learning",
        evidence: [
            {
                titleId: "about.evidence.php_85",
                zh: {postId: 640, anchor: "參考"},
            },
            {
                titleId: "about.evidence.laravel_weekly",
                zh: {postId: 644, anchor: "參考"},
            },
            {
                titleId: "about.evidence.ai_sop",
                zh: {postId: 660, anchor: "worktree"},
            },
        ],
    },
]

// 依介面語系挑證據要連的那一版。回傳 {href, isChineseOnly}。
export function resolveEvidence(evidence, locale) {
    const target = locale === "en" && evidence.en ? evidence.en : evidence.zh
    return {
        href: `/single-post?post_id=${target.postId}#${encodeURIComponent(target.anchor)}`,
        isChineseOnly: locale === "en" && !evidence.en,
    }
}

// 技能區的靜態分組名單(決策 16-1 第 4 點)。tags 是後端標籤的 tag_name 原字;
// 名單裡寫了、後端沒有的標籤顯示成不能點的字(SkillSection.jsx)。不在名單內的標籤留在「全部標籤」。
export const skillGroups = [
    {id: "backend", tags: ["Laravel", "PHP", "MySQL", "Redis", "PHP-FPM", "High Concurrency"]},
    {id: "infrastructure", tags: ["Docker", "Docker Swarm", "CI/CD", "Nginx", "GCP", "AWS"]},
    {id: "security", tags: ["VAPT", "WireGuard", "SSH", "Cookie", "Networking"]},
    {id: "frontend", tags: ["React", "TypeScript", "JavaScript", "Browser", "CSS", "Tailwind CSS"]},
    {id: "blockchain", tags: ["Blockchain", "Ethereum", "MetaMask", "Blockchain Node", "Tron"]},
]

// 頁上的區塊與導覽順序。id 同時是區塊的錨點。
export const sections = ["intro", "experience", "portfolio", "skills", "posts"]
