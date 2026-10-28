const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './SandboxArtifactTabs.BCfDQNon.js',
      './rolldown-runtime.B0Z9INg1.js',
      './advanced-inputs.0gHsBjsU.js',
      './radix-ui.BGubVf3o.js',
      './animations.BHEQrG-H.js',
      './hooks.OIrsuUZX.js',
      './vendor.BQmuAj0u.js',
      './mermaid.C3Ct62iP.js',
      './codemirror-core.r8uhyzQ3.js',
      './http-client.C5fr6Lnu.js',
      './query-devtools.DIz6FZCX.js',
      './validation.Bd3jvxDI.js',
      './react-vtree.BInx5Ne5.js',
      './i18n.CenFdT2j.js',
      './react-interactions.BEfrmSAG.js',
      './routing.CgoqFSAd.js',
      './tanstack-vendor.2R6Ja_-H.js',
      './avatars.DwBzmTCp.js',
      './framer-motion.6mTbS3M5.js',
      './virtualization.xxcvniXr.js',
      './headlessui.8omgZzEp.js',
      './markdown-processing.CjMf2xPH.js',
      './date-utils.C_DbPEjY.js',
      './utilities.HUTk6tC6.js',
      './forms.DQMwNapF.js',
      './math-katex.dI9Ti9PO.js',
      './math-katex.uZ8_QngQ.css',
      './sandpack.CM9tvzTe.js',
    ]),
) => i.map((i) => d[i]);
import { a as e, r as t } from './rolldown-runtime.B0Z9INg1.js';
import { at as n, rt as r } from './advanced-inputs.0gHsBjsU.js';
import {
  Fo as i,
  Ia as a,
  Io as o,
  Jn as s,
  Lo as c,
  Mn as l,
  Nt as u,
  Or as d,
  Ro as f,
  Si as p,
  Tn as m,
  Vi as h,
  nr as g,
  rt as _,
  ut as v,
  x as y,
  z as b,
} from './vendor.BQmuAj0u.js';
import { s as x } from './mermaid.C3Ct62iP.js';
import { c as S, u as C } from './radix-ui.BGubVf3o.js';
import {
  Aa as w,
  Bo as T,
  Ca as ee,
  Da as E,
  Ea as D,
  Gi as O,
  Ju as k,
  Kh as A,
  Ki as j,
  Mh as M,
  Mp as N,
  Na as P,
  Nf as F,
  Oa as te,
  Ou as I,
  Qh as ne,
  Sa as re,
  Ta as ie,
  Um as ae,
  Vo as oe,
  Xg as L,
  _a as se,
  _o as R,
  ap as ce,
  ds as z,
  fh as le,
  fv as ue,
  ga as de,
  ha as B,
  ja as V,
  ka as fe,
  l as pe,
  ma as me,
  om as H,
  qh as U,
  qo as he,
  tg as W,
  va as ge,
  wa as G,
  wh as K,
  xa as _e,
  ya as q,
} from './hooks.OIrsuUZX.js';
import { i as ve, t as ye } from './markdown.l8BCx8YR.js';
import { a as be } from './utilities.HUTk6tC6.js';
import { t as xe } from './code-editor.D4qHd5re.js';
var Se = e(y(), 1),
  J = e(n(), 1),
  Y = (e, t) => {
    let n = e.indexOf(
      `
`,
      t,
    );
    return n === -1 ? e.length : n;
  },
  X = (e, t) => (t >= e.length ? e.length : t + 1),
  Ce = (e, t) => {
    let n = t;
    for (; n < e.length; ) {
      let t = Y(e, n);
      if (e.slice(n, t).trim().length > 0) return n;
      n = X(e, t);
    }
    return e.length;
  },
  Z = (e, t) => {
    let n = Y(e, t),
      r = e
        .slice(t, n)
        .trimStart()
        .match(/^(`{3,}|~{3,})/);
    return r ? { marker: r[1][0], length: r[1].length, contentStart: X(e, n) } : null;
  },
  Q = (e, t) => RegExp(`^\\${t.marker}{${t.length},}\\s*$`).test(e.trim()),
  we = (e) => {
    let t = e.trimStart();
    return t.startsWith(`:::`) && !t.startsWith(`:::artifact`);
  },
  Te = (e, t) => {
    let n = Ce(e, t);
    if (n >= e.length) return !1;
    let r = Y(e, n);
    return we(e.slice(n, r));
  },
  Ee = (e, t) => {
    let n = t,
      r = null;
    for (; n < e.length; ) {
      let t = Y(e, n),
        i = e.slice(n, t),
        a = Z(e, n);
      if (we(i) && !r) return !0;
      (a && !r ? (r = a) : r && Q(i, r) && (r = null), (n = X(e, t)));
    }
    return !1;
  },
  De = (e) => {
    let t = e.trim(),
      n = /:::artifact(?:\{[^}]*\})?/g,
      r = n.exec(t);
    for (; r; ) {
      let e = Ce(t, X(t, Y(t, r.index))),
        i = Z(t, e);
      if (!i) {
        if (Ee(t, e)) return !0;
        r = n.exec(t);
        continue;
      }
      let a = i.contentStart;
      for (; a < t.length; ) {
        let e = Y(t, a);
        if (Q(t.slice(a, e), i)) {
          if (Te(t, X(t, e))) return !0;
          break;
        }
        a = X(t, e);
      }
      r = n.exec(t);
    }
    return !1;
  };
function Oe() {
  let [e, t] = (0, J.useState)(`preview`),
    { isSubmitting: n, latestMessageId: r, latestMessageText: a, conversationId: s } = R(),
    c = i(I.artifactsState),
    l = f(I.artifactsState),
    u = f(I.currentArtifactId),
    [d, p] = o(I.currentArtifactId),
    { orderedArtifactIds: m, latestAutoOpenArtifactId: h } = (0, J.useMemo)(() => {
      let e = Object.keys(c ?? {}).sort(
        (e, t) => (c?.[e]?.lastUpdateTime ?? 0) - (c?.[t]?.lastUpdateTime ?? 0),
      );
      for (let t = e.length - 1; t >= 0; t--) {
        let n = e[t];
        if (!te(c?.[n]?.type)) return { orderedArtifactIds: e, latestAutoOpenArtifactId: n };
      }
      return { orderedArtifactIds: e, latestAutoOpenArtifactId: null };
    }, [c]),
    g = (0, J.useRef)(!1),
    _ = (0, J.useRef)(null),
    v = (0, J.useRef)(!1),
    y = (0, J.useRef)(!1),
    b = (0, J.useRef)(null),
    x = (0, J.useRef)(null);
  (0, J.useEffect)(() => {
    let e = () => {
      (l(),
        u(),
        (x.current = s),
        (b.current = null),
        (_.current = null),
        (v.current = !1),
        (y.current = !1));
    };
    return (
      ((s !== x.current && x.current != null) || s === L.NEW_CONVO) && e(),
      (x.current = s),
      () => {
        (ce.log(`artifacts_visibility`, `Unmounting artifacts`), e());
      }
    );
  }, [s, l, u]);
  let S = (0, J.useRef)(d);
  ((S.current = d),
    (0, J.useEffect)(() => {
      if (m.length === 0) return;
      let e = S.current;
      if (!(e != null && m.includes(e))) {
        if (h == null) {
          e != null && u();
          return;
        }
        p(h);
      }
    }, [h, m, u, p]),
    (0, J.useEffect)(() => {
      let e = g.current && !n;
      if (((g.current = n), (!n && !e) || m.length === 0 || r == null)) return;
      let i = m[m.length - 1],
        o = c?.[i];
      if (
        o?.messageId === r &&
        !(o.content === _.current && !e) &&
        ((_.current = o?.content ?? null), !te(o?.type) && (p(i), !v.current && !y.current))
      ) {
        let e = o?.content?.slice(0, 50) ?? ``;
        e.length > 0 && a.includes(e) && (t(`code`), (y.current = !0));
      }
    }, [c, n, r, a, m, p]),
    (0, J.useEffect)(() => {
      !n ||
        v.current ||
        (De(a) &&
          (ce.log(
            `artifacts`,
            `Enclosed artifact detected during generation, switching to preview`,
          ),
          t(`preview`),
          (v.current = !0),
          (y.current = !1)));
    }, [n, a]),
    (0, J.useEffect)(() => {
      r !== b.current && ((b.current = r), (v.current = !1), (y.current = !1));
    }, [r]));
  let C = d == null ? null : c?.[d];
  return {
    activeTab: e,
    setActiveTab: t,
    currentIndex: m.indexOf(d ?? ``),
    currentArtifact: C,
    orderedArtifactIds: m,
    setCurrentArtifactId: p,
  };
}
function ke(e, t) {
  if (!e) return e;
  let n = t ? A : U,
    r = (e, t) => {
      let r = n[e]?.trim().split(/\s+/).map(Number);
      return r?.length !== 3 || r.some(Number.isNaN)
        ? t
        : `#${r.map((e) => e.toString(16).padStart(2, `0`)).join(``)}`;
    },
    i = r(`rgb-surface-primary`, t ? `#000000` : `#ffffff`),
    a = r(`rgb-text-primary`, t ? `#ffffff` : `#000000`),
    o = r(`rgb-border-medium`, a),
    s = r(`rgb-surface-active`, i),
    c = r(`rgb-surface-hover`, i),
    l = r(`rgb-surface-hover-alt`, c),
    u = r(`rgb-link`, t ? `#8cc8ff` : `#0000cc`),
    d = `<style>${`
:root {
  color-scheme: ${t ? `dark` : `light`};
  --bg: ${i};
  --fg: ${a};
  --muted: ${a};
  --border: ${o};
  --row-alt: ${s};
  --row-hover: ${c};
  --header-bg: ${l};
  --tab-active-bg: ${l};
  --tab-bg: ${i};
  --link: ${u};
}
/** WCAG 1.4.1: a link in running text must not be colour alone. */
a { text-decoration: underline; }
`}</style>`,
    f = e.toLowerCase().indexOf(`</head>`);
  return f >= 0 ? `${e.slice(0, f)}${d}${e.slice(f)}` : `${d}${e}`;
}
function Ae({ artifact: e }) {
  let { resolvedMode: t, highContrast: n } = (0, J.useContext)(K),
    r = t === `dark`,
    [i, a] = (0, J.useMemo)(() => {
      let t = ee(e.type ?? ``, e.language),
        i = e.type ?? ``;
      if (t.includes(`mermaid`)) return [`diagram.mmd`, ge(e.content ?? ``, r, n)];
      if (i === q.CODE) {
        let t = e.language ?? V(e.title),
          i = P(e.content ?? ``, t);
        return [`content.md`, ye(i, r, n)];
      }
      if (i === `text/markdown` || i === `text/md` || i === `text/plain`)
        return [`content.md`, ye(e.content ?? ``, r, n)];
      if (i === q.DOCX || i === q.SPREADSHEET || i === q.PRESENTATION) {
        let t = e.content ?? ``;
        return [`index.html`, { 'index.html': n ? ke(t, r) : t }];
      }
      if (w(i)) return [re(i), D(e.content ?? ``)];
      let a = re(e.type ?? ``, e.language);
      return [a, ue({ [a]: e.content })];
    }, [e.type, e.content, e.language, e.title, r, n]);
  return {
    files: a,
    fileKey: i,
    template: (0, J.useMemo)(() => E(e.type ?? ``, e.language), [e.type, e.language]),
    sharedProps: (0, J.useMemo)(() => ie(e.type ?? ``), [e.type]),
    deriveFiles: (0, J.useMemo)(() => (w(e.type ?? ``) ? D : void 0), [e.type]),
  };
}
function je(e) {
  let { currentCode: t } = T(),
    { showToast: n } = W(),
    r = z(),
    [i, a] = (0, J.useState)(!1),
    { fileKey: o } = Ae({ artifact: e }),
    s = (0, J.useRef)();
  (0, J.useEffect)(() => () => clearTimeout(s.current), []);
  let { download: c } = e,
    l =
      (c?.filepath != null && c.filepath !== ``) ||
      (c?.file_id != null && c?.user != null && O(c?.source)),
    u = t != null && t !== e.content,
    d = l && (fe(e.type) || !u),
    { handleDownload: f } = j({
      href: c?.filepath ?? ``,
      filename: G(e, o),
      file_id: c?.file_id,
      user: c?.user,
      source: c?.source,
    }),
    p = (0, J.useCallback)(() => {
      (a(!0), clearTimeout(s.current), (s.current = setTimeout(() => a(!1), 3e3)));
    }, []);
  return {
    isDownloaded: i,
    handleDownload: (0, J.useCallback)(
      async (i) => {
        try {
          if (d) {
            let e = await f(i);
            return (e && p(), e);
          }
          let a = t ?? e.content;
          if (a == null) return (n({ status: `error`, message: r(`com_ui_download_error`) }), !1);
          let s = new Blob([a], { type: `text/plain` }),
            c = window.URL.createObjectURL(s),
            l = document.createElement(`a`);
          return (
            (l.href = c),
            (l.download = _e(e, o, a)),
            document.body.appendChild(l),
            l.click(),
            document.body.removeChild(l),
            window.URL.revokeObjectURL(c),
            p(),
            !0
          );
        } catch (e) {
          return (
            console.error(`Download failed:`, e),
            n({ status: `error`, message: r(`com_ui_download_error`) }),
            !1
          );
        }
      },
      [e, t, f, d, o, r, p, n],
    ),
  };
}
var $ = r(),
  Me = ({ artifact: e }) => {
    let t = z(),
      { isDownloaded: n, handleDownload: r } = je(e);
    return (0, $.jsx)(N, {
      size: `icon`,
      variant: `ghost`,
      className: `h-9 w-9`,
      onClick: r,
      'aria-label': t(`com_ui_download_artifact`),
      children: (0, $.jsx)(b, { icon: n ? v : _, size: 16 }),
    });
  };
function Ne({ currentIndex: e, totalVersions: t, portalElement: n, onVersionChange: r }) {
  let i = z(),
    [o, s] = (0, J.useState)(!1),
    c = ne(`(max-width: 768px)`),
    l = (e) => {
      (r(parseInt(e, 10)), s(!1));
    };
  if (t <= 1) return null;
  let u = Array.from({ length: t }, (e, t) => ({
    value: t.toString(),
    label: i(`com_ui_version_var`, { 0: String(t + 1) }),
  })).map((t) => {
    let n = t.value === String(e);
    return {
      label: t.label,
      onClick: () => l(t.value),
      value: t.value,
      icon: n
        ? (0, $.jsx)(h, { size: 16, className: `text-text-primary`, 'aria-hidden': `true` })
        : void 0,
    };
  });
  return (0, $.jsx)(H, {
    menuId: `version-dropdown-menu`,
    portal: !0,
    portalElement: n,
    focusLoop: !0,
    unmountOnHide: !0,
    isOpen: o,
    setIsOpen: s,
    trigger: (0, $.jsx)(M, {
      description: i(`com_ui_change_version`),
      portalElement: n,
      render: (0, $.jsx)(N, {
        size: `icon`,
        variant: `ghost`,
        asChild: !0,
        'aria-label': i(`com_ui_change_version`),
        children: (0, $.jsx)(a, {
          children: (0, $.jsx)(d, {
            size: 18,
            className: `text-text-secondary`,
            'aria-hidden': `true`,
            focusable: `false`,
          }),
        }),
      }),
    }),
    items: u,
    className: c ? `` : `absolute right-0 top-0 mt-2`,
  });
}
var Pe = (0, J.memo)(function ({ artifact: e, exportData: t, portalElement: n }) {
  let r = z(),
    { handleDownload: i } = je(e);
  return (0, $.jsx)(
    se,
    {
      svg: t?.svg,
      dimensions: t?.dimensions,
      filename: e.title ?? r(`com_ui_mermaid_diagram`),
      buttonClassName: `h-9 w-9 p-0`,
      portalElement: n,
      onDownloadSource: i,
    },
    e.id,
  );
});
Pe.displayName = `ArtifactMermaidExport`;
var Fe = e(be(), 1),
  Ie = {
    javascript: `javascript`,
    typescript: `typescript`,
    python: `python`,
    css: `css`,
    json: `json`,
    markdown: `markdown`,
    html: `html`,
    xml: `xml`,
    sql: `sql`,
    yaml: `yaml`,
    shell: `shell`,
    bash: `shell`,
    tsx: `typescript`,
    jsx: `javascript`,
    c: `c`,
    cpp: `cpp`,
    java: `java`,
    go: `go`,
    rust: `rust`,
    kotlin: `kotlin`,
    swift: `swift`,
    php: `php`,
    ruby: `ruby`,
    r: `r`,
    lua: `lua`,
    scala: `scala`,
    perl: `perl`,
  },
  Le = {
    'text/html': `html`,
    'application/vnd.code-html': `html`,
    'application/vnd.react': `typescript`,
    'application/vnd.ant.react': `typescript`,
    'text/markdown': `markdown`,
    'text/md': `markdown`,
    'text/plain': `plaintext`,
    'application/vnd.mermaid': `markdown`,
  },
  Re = `librechat-high-contrast-light`,
  ze = `librechat-high-contrast-dark`,
  Be = `#1e1e1e`,
  Ve = (e, t) => {
    let n = e[t];
    if (n == null) throw Error(`Missing Monaco theme token: ${t}`);
    let r = n.split(/\s+/).map((e) => Number(e));
    if (r.length !== 3 || r.some((e) => !Number.isInteger(e)))
      throw Error(`Invalid Monaco theme token: ${t}`);
    return `#${r.map((e) => e.toString(16).padStart(2, `0`)).join(``)}`;
  },
  He = (e, t, n) => {
    let r = (t) => Ve(e, t),
      i = (e) => r(e).slice(1);
    return {
      base: t,
      inherit: !1,
      rules: [
        { token: ``, foreground: i(`rgb-syntax-text`) },
        { token: `identifier`, foreground: i(`rgb-syntax-text`) },
        { token: `comment`, foreground: i(`rgb-syntax-comment`) },
        { token: `meta`, foreground: i(`rgb-syntax-meta`) },
        { token: `annotation`, foreground: i(`rgb-syntax-meta`) },
        { token: `delimiter`, foreground: i(`rgb-syntax-meta`) },
        { token: `predefined`, foreground: i(`rgb-syntax-builtin`) },
        { token: `class`, foreground: i(`rgb-syntax-builtin`) },
        { token: `keyword`, foreground: i(`rgb-syntax-keyword`) },
        { token: `literal`, foreground: i(`rgb-syntax-keyword`) },
        { token: `string`, foreground: i(`rgb-syntax-string`) },
        { token: `regexp`, foreground: i(`rgb-syntax-string`) },
        { token: `variable`, foreground: i(`rgb-syntax-attr`) },
        { token: `number`, foreground: i(`rgb-syntax-attr`) },
        { token: `type`, foreground: i(`rgb-syntax-attr`) },
        { token: `attribute.name`, foreground: i(`rgb-syntax-attr`) },
        { token: `tag`, foreground: i(`rgb-syntax-title`) },
        { token: `symbol`, foreground: i(`rgb-syntax-title`) },
      ],
      colors: {
        'editor.background': r(n),
        'editor.foreground': r(`rgb-syntax-text`),
        'editorLineNumber.foreground': r(`rgb-text-secondary`),
        'editorLineNumber.activeForeground': r(`rgb-text-primary`),
        'editorCursor.foreground': r(`rgb-ring-primary`),
        'editor.selectionBackground': r(`rgb-text-primary`),
        'editor.selectionForeground': r(`rgb-surface-primary`),
        'editor.inactiveSelectionBackground': r(`rgb-surface-hover-alt`),
        'editor.selectionHighlightBackground': r(`rgb-surface-hover-alt`),
        'editor.lineHighlightBackground': r(`rgb-surface-hover`),
        'editor.findMatchBackground': r(`rgb-surface-hover-alt`),
        'editor.findMatchBorder': r(`rgb-border-heavy`),
        'editor.findMatchHighlightBackground': r(`rgb-surface-hover-alt`),
        'editorWidget.background': r(`rgb-surface-dialog`),
        'editorWidget.border': r(`rgb-border-medium`),
        'input.background': r(`rgb-surface-primary`),
        'input.foreground': r(`rgb-text-primary`),
        'input.border': r(`rgb-border-medium`),
        focusBorder: r(`rgb-ring-primary`),
        'editorIndentGuide.background1': r(`rgb-border-light`),
        'editorIndentGuide.activeBackground1': r(`rgb-border-heavy`),
        'scrollbarSlider.background': r(`rgb-border-light`),
        'scrollbarSlider.hoverBackground': r(`rgb-border-heavy`),
        'scrollbarSlider.activeBackground': r(`rgb-border-xheavy`),
      },
    };
  },
  Ue = He(U, `vs`, `rgb-surface-primary-alt`),
  We = He(A, `vs-dark`, `rgb-presentation`),
  Ge = { theme: `vs-dark`, background: Be },
  Ke = { theme: Re, background: Ue.colors[`editor.background`] },
  qe = { theme: ze, background: We.colors[`editor.background`] };
function Je(e, t) {
  return t && Ie[t] ? Ie[t] : (Le[e ?? ``] ?? `plaintext`);
}
function Ye(e) {
  return e.index == null
    ? null
    : { artifactId: e.id, messageId: e.messageId ?? ``, index: e.index };
}
function Xe(e, t) {
  return e.artifactId === t.artifactId && e.messageId === t.messageId && e.index === t.index;
}
function Ze(e, t) {
  return e.messageId === t.messageId && e.index === t.index;
}
var Qe = function ({ artifact: e, monacoRef: t, readOnly: n }) {
    let { resolvedMode: r, highContrast: i } = (0, J.useContext)(K),
      { isSubmitting: a } = R(),
      o = (n ?? !1) || a,
      { setCurrentCode: s } = T(),
      [c, l] = (0, J.useState)(null),
      { isMutating: u, setIsMutating: d } = oe(),
      [f, p] = (0, J.useState)(null),
      m = (0, J.useRef)(e),
      h = (0, J.useRef)(u),
      g = (0, J.useRef)(c),
      _ = (0, J.useRef)(s),
      v = (0, J.useRef)(f),
      y = (0, J.useRef)(null),
      b = (0, J.useRef)(() => {}),
      x = ve({
        onMutate: (e) => {
          ((h.current = !0), (g.current = e.updated), d(!0), l(e.updated));
        },
        onSuccess: (e, t) => {
          ((h.current = !1), (g.current = null), d(!1), l(null), p(null));
          let n = y.current;
          y.current = null;
          let r = Ye(m.current);
          if (n == null || r == null || !Xe(n, r)) return;
          let i = Ze(n, t) ? t.updated : n.original;
          n.code.trim() !== i.trim() && (_.current(n.code), b.current(n.code, i));
        },
        onError: (e) => {
          F(e) === 400 && g.current != null && (p(g.current), (v.current = g.current));
          let t = y.current;
          ((y.current = null), (h.current = !1), (g.current = null), d(!1), l(null));
          let n = Ye(m.current);
          t == null ||
            n == null ||
            !Xe(t, n) ||
            (t.code.trim() !== t.original.trim() &&
              (_.current(t.code), b.current(t.code, t.original)));
        },
      }),
      S = (0, J.useRef)(x),
      C = (0, J.useRef)(e.content ?? ``),
      w = (0, J.useRef)(e.id),
      ee = (0, J.useRef)(o);
    ((m.current = e),
      (h.current = u),
      (g.current = c),
      (S.current = x),
      (_.current = s),
      (v.current = f),
      (b.current = (0, J.useCallback)(
        (e, t) => {
          let n = m.current,
            r = Ye(n);
          if (o || r == null) return;
          let i = t ?? n.content ?? ``;
          if (h.current) {
            y.current = { ...r, code: e, original: i };
            return;
          }
          let a = e.trim() !== i.trim(),
            s = g.current == null || e.trim() !== g.current.trim();
          !a ||
            !s ||
            ((v.current == null || e.trim() !== v.current.trim()) &&
              (_.current(e),
              S.current.mutate({
                index: r.index,
                messageId: r.messageId,
                original: i,
                updated: e,
              })));
        },
        [o],
      )));
    let E = (0, J.useMemo)(
      () =>
        (0, Fe.default)((e) => {
          b.current(e);
        }, 500),
      [],
    );
    ((0, J.useEffect)(() => () => E.cancel(), [e.id, E]),
      (0, J.useEffect)(() => {
        let n = t.current;
        if (!n || !o) return;
        let r = e.content ?? ``,
          i = C.current;
        if (r === i) return;
        let a = n.getModel();
        if (a) {
          if (r.startsWith(i) && i.length > 0) {
            let e = r.slice(i.length),
              t = a.getPositionAt(a.getValueLength());
            a.applyEdits([
              {
                range: {
                  startLineNumber: t.lineNumber,
                  startColumn: t.column,
                  endLineNumber: t.lineNumber,
                  endColumn: t.column,
                },
                text: e,
              },
            ]);
          } else a.setValue(r);
          ((C.current = r), n.revealLine(a.getLineCount()));
        }
      }, [e.content, o, t]),
      (0, J.useEffect)(() => {
        if (e.id === w.current) return;
        ((w.current = e.id), (y.current = null), p(null), (C.current = e.content ?? ``));
        let n = t.current;
        n && e.content != null && n.getModel()?.setValue(e.content);
      }, [e.id, e.content, t]),
      (0, J.useEffect)(() => {
        if (ee.current && !o && e.content != null) {
          let n = t.current;
          n && (n.getModel()?.setValue(e.content), (C.current = e.content));
        }
        ee.current = o;
      }, [o, e.content, t]));
    let D = (0, J.useCallback)(
        (e) => {
          e === void 0 || o || ((C.current = e), s(e), e.length > 0 && E(e));
        },
        [o, E, s],
      ),
      O = (0, J.useCallback)((e) => {
        (e.editor.defineTheme(Re, Ue), e.editor.defineTheme(ze, We));
        let { typescriptDefaults: t, javascriptDefaults: n, JsxEmit: r } = e.languages.typescript,
          i = { noSemanticValidation: !0, noSyntaxValidation: !0 },
          a = { allowNonTsExtensions: !0, allowJs: !0, jsx: r.React };
        (t.setDiagnosticsOptions(i),
          n.setDiagnosticsOptions(i),
          t.setCompilerOptions(a),
          n.setCompilerOptions(a));
      }, []),
      k = (0, J.useCallback)(
        (n) => {
          if (((t.current = n), (C.current = n.getModel()?.getValue() ?? e.content ?? ``), o)) {
            let e = n.getModel();
            e && n.revealLine(e.getLineCount());
          }
        },
        [t],
      ),
      A = Je(e.type, e.language),
      j = Ge;
    i && (j = r === `dark` ? qe : Ke);
    let M = (0, J.useMemo)(
      () => ({
        readOnly: o,
        minimap: { enabled: !1 },
        lineNumbers: `on`,
        scrollBeyondLastLine: !1,
        fontSize: 13,
        tabSize: 2,
        wordWrap: `on`,
        automaticLayout: !0,
        padding: { top: 8 },
        renderLineHighlight: o ? `none` : `line`,
        cursorStyle: o ? `underline-thin` : `line`,
        scrollbar: {
          vertical: `visible`,
          horizontal: `auto`,
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
          useShadows: !1,
          alwaysConsumeMouseWheel: !1,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: !0,
        overviewRulerBorder: !1,
        folding: !1,
        glyphMargin: !1,
        colorDecorators: !o,
        occurrencesHighlight: o ? `off` : `singleFile`,
        selectionHighlight: !o,
        renderValidationDecorations: o ? `off` : `editable`,
        quickSuggestions: !o,
        suggestOnTriggerCharacters: !o,
        parameterHints: { enabled: !o },
        hover: { enabled: o ? `off` : `on` },
        matchBrackets: o ? `never` : `always`,
      }),
      [o],
    );
    return e.content
      ? (0, $.jsx)(`div`, {
          className: `h-full w-full`,
          style: { backgroundColor: j.background },
          children: (0, $.jsx)(xe, {
            height: `100%`,
            language: o ? `plaintext` : A,
            theme: j.theme,
            defaultValue: e.content,
            onChange: D,
            beforeMount: O,
            onMount: k,
            options: M,
          }),
        })
      : null;
  },
  $e = (0, J.lazy)(() =>
    x(
      () => import(`./SandboxArtifactTabs.BCfDQNon.js`).then((e) => e.t),
      __vite__mapDeps([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27,
      ]),
      import.meta.url,
    ),
  );
function et() {
  let e = z();
  return (0, $.jsxs)(`div`, {
    className: `flex h-full w-full items-center justify-center bg-surface-primary text-text-secondary`,
    role: `status`,
    children: [
      (0, $.jsx)(le, { className: `size-5`, 'aria-hidden': `true` }),
      (0, $.jsx)(`span`, { className: `sr-only`, children: e(`com_ui_loading`) }),
    ],
  });
}
function tt({ artifact: e, isSharedConvo: t, onMermaidExportReady: n }) {
  let r = z(),
    { currentCode: i, setCurrentCode: a } = T(),
    o = (0, J.useRef)(null),
    s = (0, J.useRef)(null),
    c = s.current === e.id;
  (0, J.useEffect)(() => {
    (e.id !== s.current && a(void 0), (s.current = e.id));
  }, [e.id, a]);
  let l = (c ? i : void 0) ?? e.content ?? ``,
    u = t === !0 || e.index == null;
  return (0, $.jsxs)(`div`, {
    className: `flex h-full w-full flex-col`,
    children: [
      (0, $.jsx)(S, {
        value: `code`,
        id: `artifacts-code`,
        className: `h-full w-full flex-grow overflow-auto`,
        tabIndex: -1,
        children: (0, $.jsx)(Qe, { artifact: e, monacoRef: o, readOnly: u }),
      }),
      (0, $.jsx)(S, {
        value: `preview`,
        className: `min-h-0 w-full flex-1 overflow-hidden p-4`,
        tabIndex: -1,
        children: (0, $.jsx)(
          B,
          {
            exportFilename: e.title ?? r(`com_ui_mermaid_diagram`),
            fillContainer: !0,
            onExportReady: n,
            showExpandButton: !1,
            showHeader: !1,
            children: l,
          },
          e.id,
        ),
      }),
    ],
  });
}
function nt(e) {
  return e.artifact.type === `application/vnd.mermaid`
    ? (0, $.jsx)(tt, {
        artifact: e.artifact,
        isSharedConvo: e.isSharedConvo,
        onMermaidExportReady: e.onMermaidExportReady,
      })
    : (0, $.jsx)(J.Suspense, { fallback: (0, $.jsx)(et, {}), children: (0, $.jsx)($e, { ...e }) });
}
var rt = t({ default: () => ot }),
  it = 32,
  at = 0.3;
function ot() {
  let e = z(),
    { isMutating: t } = oe(),
    { isSharedConvo: n } = he(),
    r = ne(`(max-width: 868px)`),
    i = ne(`(prefers-reduced-motion: reduce)`),
    a = (0, J.useRef)(),
    o = (0, J.useRef)(null),
    d = (0, J.useRef)(null),
    h = (0, J.useRef)(null),
    _ = (0, J.useRef)(null),
    [v, y] = (0, J.useState)(!1),
    [b, x] = (0, J.useState)(!1),
    [S, w] = (0, J.useState)(!1),
    [T, ee] = (0, J.useState)(!1),
    [E, D] = (0, J.useState)(!1),
    [O, A] = (0, J.useState)(90),
    [j, M] = (0, J.useState)(!1),
    [P, F] = (0, J.useState)(0),
    [re, ie] = (0, J.useState)(!1),
    [L, se] = (0, J.useState)(null),
    R = (0, J.useRef)(0),
    ue = (0, J.useRef)(90),
    B = c(I.artifactsVisibility),
    V = f(I.currentArtifactId),
    H = (0, J.useMemo)(
      () => [
        { value: `code`, label: e(`com_ui_code`), icon: (0, $.jsx)(p, { className: `size-4` }) },
        {
          value: `preview`,
          label: e(`com_ui_preview`),
          icon: (0, $.jsx)(l, { className: `size-4` }),
        },
      ],
      [e],
    );
  ((0, J.useEffect)(() => {
    let e = document.activeElement;
    (e instanceof HTMLElement && e !== document.body && (_.current = e), D(!0));
    let t = setTimeout(() => y(!0), r ? 50 : 30);
    return () => {
      (clearTimeout(t), D(!1));
    };
  }, [r]),
    (0, J.useEffect)(() => {
      let e = () => {
        let e = o.current;
        ee(e !== null && document.fullscreenElement === e);
      };
      return (
        document.addEventListener(`fullscreenchange`, e),
        () => document.removeEventListener(`fullscreenchange`, e)
      );
    }, []),
    (0, J.useEffect)(() => {
      if (!r) {
        F(0);
        return;
      }
      if (O <= 50) F(0);
      else if (O >= 100) F(it);
      else {
        let e = (O - 50) / 50;
        F(Math.round(e * it));
      }
    }, [O, r]));
  let {
      activeTab: U,
      setActiveTab: W,
      currentIndex: ge,
      currentArtifact: G,
      orderedArtifactIds: K,
      setCurrentArtifactId: _e,
    } = Oe(),
    ve = (0, J.useCallback)(() => {
      let e = _.current,
        t = G?.id;
      requestAnimationFrame(() => {
        if (e?.isConnected) {
          e.focus();
          return;
        }
        Array.from(document.querySelectorAll(`[data-artifact-trigger]`))
          .find((e) => e.dataset.artifactTrigger === t)
          ?.focus();
      });
    }, [G?.id]),
    ye = (0, J.useCallback)(
      (e) => {
        G?.id != null && se({ artifactId: G.id, data: e });
      },
      [G?.id],
    ),
    be = L != null && L.artifactId === G?.id ? L.data : null,
    xe = G?.type === q.MERMAID,
    Y = (0, J.useCallback)(() => {
      if (r) {
        (x(!0), y(!1));
        let e = () => {
          (V(), B(!1), x(!1), A(90), ve());
        };
        i ? e() : setTimeout(e, 250);
        return;
      }
      (V(), B(!1), ve());
    }, [r, i, V, ve, B]);
  pe(h, r && v && !b, Y);
  let X = fe(G?.type),
    Ce = te(G?.type),
    Z = null;
  X ? (Z = `preview`) : Ce && (Z = `code`);
  let Q = Z ?? U,
    we = (0, J.useMemo)(() => {
      if (Z == null) return H;
      let e = me(G?.title),
        t = H.find((e) => e.value === Z);
      return t ? [e ? { ...t, label: e } : t] : H;
    }, [H, Z, G?.title]),
    Te = (0, J.useRef)(null);
  (0, J.useEffect)(() => {
    let e = G?.id ?? null;
    e !== Te.current &&
      ((Te.current = e), e != null && Z == null && U !== `preview` && W(`preview`));
  }, [U, Z, G?.id, W]);
  let Ee = (0, J.useCallback)(() => {
      let e = G?.content ?? ``;
      e && ((0, Se.default)(e, { format: `text/plain` }), ie(!0), setTimeout(() => ie(!1), 3e3));
    }, [G?.content]),
    De = (e) => {
      (M(!0), (R.current = e.clientY), (ue.current = O), e.target.setPointerCapture(e.pointerId));
    },
    ke = (e) => {
      if (!j) return;
      let t = ((R.current - e.clientY) / window.innerHeight) * 100,
        n = Math.max(10, Math.min(100, ue.current + t));
      A(n);
    },
    Ae = (e) => {
      j &&
        (M(!1),
        e.target.releasePointerCapture(e.pointerId),
        O < 30 ? Y() : A(O > 95 ? 100 : O < 60 ? 50 : 90));
    },
    je = (e) => {
      let t = O;
      if (e.key === `ArrowUp`) t = Math.min(100, O + 10);
      else if (e.key === `ArrowDown`) t = Math.max(10, O - 10);
      else if (e.key === `Home`) t = 10;
      else if (e.key === `End`) t = 100;
      else return;
      (e.preventDefault(), A(t));
    };
  if (!G || !E) return null;
  let Fe = () => {
      w(!0);
      let e = a.current?.getClient();
      (e && e.dispatch({ type: `refresh` }), setTimeout(() => w(!1), 750));
    },
    Ie = async () => {
      let e = o.current;
      if (e)
        try {
          if (document.fullscreenElement === e) {
            await document.exitFullscreen();
            return;
          }
          await e.requestFullscreen();
        } catch (e) {
          ce.error(`Failed to toggle artifact fullscreen mode:`, e);
        }
    },
    Le = P > 0 ? (Math.min(P, it) / it) * at : 0;
  return (0, $.jsx)(C, {
    value: Q,
    onValueChange: W,
    asChild: !0,
    children: (0, $.jsxs)(`div`, {
      ref: o,
      className: `flex h-full w-full flex-col bg-surface-primary`,
      children: [
        r &&
          (0, $.jsx)(`div`, {
            className: k(
              `fixed inset-0 z-[99] bg-black will-change-[opacity,backdrop-filter] motion-reduce:transition-none`,
              v && !b
                ? `transition-all duration-300`
                : `pointer-events-none opacity-0 backdrop-blur-none transition-opacity duration-150`,
              P < 8 && v && !b ? `pointer-events-none` : ``,
            ),
            style: {
              opacity: v && !b ? Le : 0,
              backdropFilter: v && !b ? `blur(${P}px)` : `none`,
              WebkitBackdropFilter: v && !b ? `blur(${P}px)` : `none`,
            },
            onClick: P >= 8 ? Y : void 0,
            'aria-hidden': `true`,
          }),
        (0, $.jsxs)(`div`, {
          ref: h,
          id: `artifact-viewer`,
          role: r ? `dialog` : `region`,
          'aria-modal': r || void 0,
          'aria-label': G.title ?? e(`com_ui_artifacts`),
          className: k(
            `flex w-full flex-col bg-surface-primary text-xl text-text-primary motion-reduce:transition-none`,
            r
              ? k(
                  `fixed z-[100] shadow-[0_-10px_60px_rgba(0,0,0,0.35)]`,
                  T ? `inset-0 rounded-none` : `inset-x-0 bottom-0 rounded-t-[20px]`,
                  v && !b
                    ? `translate-y-0 opacity-100`
                    : `duration-250 translate-y-full opacity-0 transition-all`,
                  j ? `` : `transition-all duration-300`,
                )
              : k(
                  `h-full shadow-2xl`,
                  v && !b
                    ? `duration-350 translate-x-0 opacity-100 transition-all`
                    : `translate-x-5 opacity-0 transition-all duration-300`,
                ),
          ),
          style: r ? { height: T ? `100%` : `${O}vh` } : { overflow: `hidden` },
          children: [
            r &&
              !T &&
              (0, $.jsx)(`div`, {
                role: `separator`,
                tabIndex: 0,
                'aria-label': e(`com_ui_resize_artifact_panel`),
                'aria-orientation': `horizontal`,
                'aria-valuemin': 10,
                'aria-valuemax': 100,
                'aria-valuenow': Math.round(O),
                className: `flex flex-shrink-0 cursor-grab items-center justify-center bg-surface-primary-alt pb-1.5 pt-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-heavy active:cursor-grabbing`,
                onPointerDown: De,
                onPointerMove: ke,
                onPointerUp: Ae,
                onPointerCancel: Ae,
                onKeyDown: je,
                children: (0, $.jsx)(`div`, {
                  className: `h-1 w-12 rounded-full bg-border-xheavy opacity-40 transition-all duration-200 active:opacity-60 high-contrast:opacity-100 motion-reduce:transition-none`,
                }),
              }),
            (0, $.jsxs)(`div`, {
              className: k(
                `flex h-[52px] flex-shrink-0 items-center justify-between gap-2 border-b border-border-light bg-surface-primary-alt p-2 transition-all duration-300 motion-reduce:transition-none`,
                r ? `justify-center` : `overflow-hidden`,
              ),
              children: [
                !r &&
                  (0, $.jsx)(`div`, {
                    className: k(
                      `flex items-center transition-all duration-500 motion-reduce:transition-none`,
                      v && !b ? `translate-x-0 opacity-100` : `-translate-x-2 opacity-0`,
                    ),
                    children: (0, $.jsx)(ae, {
                      options: we,
                      value: Q,
                      onChange: W,
                      disabled: t && Q !== `code`,
                      buttonClassName: `h-9 px-3 gap-1.5`,
                    }),
                  }),
                (0, $.jsxs)(`div`, {
                  className: k(
                    `flex items-center gap-2 transition-all duration-500 motion-reduce:transition-none`,
                    r ? `min-w-max` : ``,
                    v && !b ? `translate-x-0 opacity-100` : `translate-x-2 opacity-0`,
                  ),
                  children: [
                    Q === `preview` &&
                      !xe &&
                      (0, $.jsx)(N, {
                        size: `icon`,
                        variant: `ghost`,
                        className: `h-9 w-9`,
                        onClick: Fe,
                        disabled: S,
                        'aria-label': e(`com_ui_refresh`),
                        children: S
                          ? (0, $.jsx)(le, { size: 16 })
                          : (0, $.jsx)(m, {
                              size: 16,
                              className: `transition-transform duration-200 motion-reduce:transition-none`,
                              'aria-hidden': `true`,
                            }),
                      }),
                    (Q === `preview` || T) &&
                      document.fullscreenEnabled &&
                      (0, $.jsx)(N, {
                        size: `icon`,
                        variant: `ghost`,
                        className: `h-9 w-9`,
                        onClick: Ie,
                        'aria-label': e(T ? `com_ui_exit_full_screen` : `com_ui_enter_full_screen`),
                        children: T
                          ? (0, $.jsx)(s, { size: 16, 'aria-hidden': `true` })
                          : (0, $.jsx)(g, { size: 16, 'aria-hidden': `true` }),
                      }),
                    Q !== `preview` &&
                      t &&
                      (0, $.jsx)(m, { size: 16, className: `animate-spin text-text-secondary` }),
                    K.length > 1 &&
                      (0, $.jsx)(Ne, {
                        currentIndex: ge,
                        totalVersions: K.length,
                        portalElement: T ? d.current : void 0,
                        onVersionChange: (e) => {
                          let t = K[e];
                          t && _e(t);
                        },
                      }),
                    (0, $.jsx)(de, {
                      isCopied: re,
                      iconOnly: !0,
                      portalElement: T ? d.current : void 0,
                      onClick: Ee,
                    }),
                    xe
                      ? (0, $.jsx)(Pe, {
                          artifact: G,
                          exportData: be,
                          portalElement: T ? d.current : void 0,
                        })
                      : (0, $.jsx)(Me, { artifact: G }),
                    (0, $.jsx)(N, {
                      size: `icon`,
                      variant: `ghost`,
                      className: `h-9 w-9`,
                      onClick: Y,
                      'aria-label': e(`com_ui_close`),
                      children: (0, $.jsx)(u, { size: 16, 'aria-hidden': `true` }),
                    }),
                  ],
                }),
              ],
            }),
            (0, $.jsxs)(`div`, {
              className: `relative flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-primary`,
              children: [
                (0, $.jsx)(`div`, {
                  className: `absolute inset-0 flex flex-col`,
                  children: (0, $.jsx)(nt, {
                    artifact: G,
                    previewRef: a,
                    isSharedConvo: n,
                    onMermaidExportReady: ye,
                  }),
                }),
                (0, $.jsx)(`div`, {
                  className: k(
                    `absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out`,
                    S ? `pointer-events-auto opacity-100` : `pointer-events-none opacity-0`,
                  ),
                  'aria-hidden': !S,
                  role: `status`,
                  children: (0, $.jsx)(`div`, {
                    className: k(
                      `transition-transform duration-300 ease-in-out`,
                      S ? `scale-100` : `scale-95`,
                    ),
                    children: (0, $.jsx)(le, { size: 24 }),
                  }),
                }),
              ],
            }),
            r &&
              (0, $.jsx)(`div`, {
                className: `flex-shrink-0 border-t border-border-light bg-surface-primary-alt p-2`,
                children: (0, $.jsx)(ae, {
                  fullWidth: !0,
                  options: we,
                  value: Q,
                  onChange: W,
                  disabled: t && Q !== `code`,
                }),
              }),
          ],
        }),
        (0, $.jsx)(`div`, {
          ref: d,
          className: `z-[101]`,
          'data-testid': `artifact-fullscreen-portal`,
        }),
      ],
    }),
  });
}
export { ot as default, Qe as n, Ae as r, rt as t };
