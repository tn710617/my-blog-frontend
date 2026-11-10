import { defaultSchema } from 'rehype-sanitize';

/**
 * 文章內文的 HTML 允許清單(決策 9-1,票 04 ④)。
 *
 * 以 hast-util-sanitize 的 GitHub 預設 schema 為底,再加上 2026-11-10 用
 * `tools/audit-post-html.mjs` 掃正式站公開文章時實際用到、而且有可見內容的東西。
 * 清單守的性質由 `PostBody.sanitize.test.jsx` 的測試保證;要放寬就先加一條會紅的測試。
 */
export const YOUTUBE_EMBED_SRC = /^https:\/\/www\.youtube\.com\/embed\//;

export const postSanitizeSchema = {
  ...defaultSchema,
  strip: [...(defaultSchema.strip ?? []), 'style'],
  tagNames: [...defaultSchema.tagNames, 'aside', 'font', 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    aside: ['style'],
    div: [...(defaultSchema.attributes.div ?? []), 'style'],
    font: ['size'],
    iframe: [['src', YOUTUBE_EMBED_SRC], 'title', 'frameBorder', 'allow', 'referrerPolicy', 'allowFullScreen'],
    img: [...(defaultSchema.attributes.img ?? []), 'style'],
  },
};

/**
 * 接在 rehype-sanitize 之後:允許清單只留 YouTube embed 的 src,
 * 其他來源的 iframe 會剩一個沒有 src 的空框,這裡把它整個拿掉。
 */
export function rehypeDropIframesWithoutSrc() {
  return (tree) => {
    const prune = (node) => {
      if (!Array.isArray(node.children)) {
        return;
      }
      node.children = node.children.filter(
        (child) => !(child.type === 'element' && child.tagName === 'iframe' && !child.properties?.src),
      );
      node.children.forEach(prune);
    };
    prune(tree);
  };
}

const URL_PROPERTIES = ['href', 'src'];
const SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

/**
 * 接在 rehype-sanitize 之前:把 href / src 的協定名轉小寫。
 * hast-util-sanitize 比對協定時分大小寫,`Https://` 會被當成不在清單裡而整個拿掉 href(post 143 就是這樣)。
 */
export function rehypeLowercaseUrlScheme() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.properties) {
        for (const property of URL_PROPERTIES) {
          const value = node.properties[property];
          if (typeof value === 'string') {
            node.properties[property] = value.replace(SCHEME, (whole, scheme) => `${scheme.toLowerCase()}:`);
          }
        }
      }
      (node.children ?? []).forEach(walk);
    };
    walk(tree);
  };
}
