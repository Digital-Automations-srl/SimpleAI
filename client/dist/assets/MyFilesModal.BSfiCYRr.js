import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  Fo as r,
  Ia as i,
  Lo as a,
  Nt as o,
  Rr as s,
  _i as c,
  aa as l,
  da as u,
  nr as d,
  sa as f,
  ur as p,
} from './vendor.BQmuAj0u.js';
import { B as m, I as h, Q as g, R as _, V as ee, Z as v, tt as y } from './radix-ui.BGubVf3o.js';
import { r as b } from './query-devtools.DIz6FZCX.js';
import {
  a as x,
  h as S,
  i as C,
  n as w,
  o as T,
  r as E,
  t as D,
  v as O,
} from './tanstack-vendor.2R6Ja_-H.js';
import {
  Gf as k,
  Hm as A,
  Ju as j,
  Mh as M,
  Mp as N,
  Nh as te,
  Np as P,
  Ou as F,
  P_ as I,
  Pl as ne,
  Qh as L,
  Qp as re,
  Rm as ie,
  Wf as ae,
  Xi as oe,
  Yp as se,
  Zi as ce,
  _h as le,
  bh as ue,
  ds as R,
  e_ as z,
  em as de,
  f_ as B,
  fh as V,
  gh as fe,
  im as H,
  kp as pe,
  l_ as U,
  om as W,
  ot as me,
  pm as he,
  qp as ge,
  t_ as G,
  vh as K,
  xh as q,
  yh as _e,
} from './hooks.OIrsuUZX.js';
var ve = (e = !0) =>
    O([B.langfuseConnection], () => I.getLangfuseConnection(), {
      enabled: e,
      refetchOnWindowFocus: !1,
    }),
  ye = (e, t = !0) =>
    O([B.langfuseSessionLink, e], () => I.getLangfuseSessionLink(e), {
      enabled: t,
      refetchOnWindowFocus: !1,
    }),
  be = () => {
    let e = b();
    return S((e) => I.updateLangfuseConnection(e), {
      mutationKey: [U.updateLangfuseConnection],
      onSuccess: (t) => {
        (e.setQueryData([B.langfuseConnection], t), e.removeQueries([B.langfuseSessionLink]));
      },
    });
  },
  xe = () => S((e) => I.testLangfuseConnection(e), { mutationKey: [U.testLangfuseConnection] }),
  Se = (e) =>
    O([B.memories], () => I.getMemories(), {
      refetchOnWindowFocus: !1,
      refetchOnReconnect: !1,
      refetchOnMount: !1,
      ...e,
    }),
  Ce = () => {
    let e = b();
    return S(
      ({ key: e, id: t, agentId: n }) => {
        if (t) return I.deleteMemoryById(t, n);
        if (e) return I.deleteMemory(e, n);
        throw Error(`Memory address is required.`);
      },
      {
        onSuccess: () => {
          e.invalidateQueries([B.memories]);
        },
      },
    );
  },
  we = (e) => {
    let t = b();
    return S(
      ({ key: e, id: t, value: n, originalKey: r, agentId: i }) => {
        if (t) return I.updateMemoryById(t, n, e, i);
        if (e) return I.updateMemory(e, n, r, i);
        throw Error(`Memory address is required.`);
      },
      {
        ...e,
        onSuccess: (...n) => {
          (t.invalidateQueries([B.memories]), e?.onSuccess?.(...n));
        },
      },
    );
  },
  Te = (e) => {
    let t = b();
    return S([U.updateMemoryPreferences], (e) => I.updateMemoryPreferences(e), {
      ...e,
      onSuccess: (...n) => {
        (t.invalidateQueries([B.user]), e?.onSuccess?.(...n));
      },
    });
  },
  Ee = (e) => {
    let t = b();
    return S(
      ({ key: e, value: t, agentId: n }) => I.createMemory({ key: e, value: t, agentId: n }),
      {
        ...e,
        onSuccess: (n, r, i) => {
          (t.setQueryData([B.memories], (e) => {
            if (!e) return e;
            let t = [...e.memories, n.memory],
              r = t.reduce((e, t) => e + (t.agentId ? 0 : t.tokenCount || 0), 0),
              i = e.tokenLimit,
              a = e.usagePercentage;
            return (
              i && i > 0 && (a = Math.min(100, Math.round((r / i) * 100))),
              { ...e, memories: t, totalTokens: r, usagePercentage: a }
            );
          }),
            e?.onSuccess?.(n, r, i));
        },
      },
    );
  },
  J = n(),
  De = ({ theme: e, onChange: t, portal: n = !0, portalElement: r, popoverClassName: i }) => {
    let a = R(),
      o = [
        { value: `system`, label: a(`com_nav_theme_system`) },
        { value: `dark`, label: a(`com_nav_theme_dark`) },
        { value: `light`, label: a(`com_nav_theme_light`) },
        { value: `high-contrast-light`, label: a(`com_nav_theme_high_contrast_light`) },
        { value: `high-contrast-dark`, label: a(`com_nav_theme_high_contrast_dark`) },
      ],
      s = `theme-selector-label`;
    return (0, J.jsxs)(`div`, {
      className: `flex items-center justify-between`,
      children: [
        (0, J.jsx)(`div`, { id: s, children: a(`com_nav_theme`) }),
        (0, J.jsx)(H, {
          value: e,
          onChange: t,
          options: o,
          sizeClasses: j(`z-50 w-[180px]`, i),
          testId: `theme-selector`,
          'aria-labelledby': s,
          portal: n,
          portalElement: r,
        }),
      ],
    });
  },
  Oe = ({ langcode: e, onChange: t, portal: n = !0, portalElement: i, popoverClassName: a }) => {
    let o = R(),
      s = r(F.languageLoading),
      c = [
        { value: `auto`, label: o(`com_nav_lang_auto`) },
        { value: `en-US`, label: o(`com_nav_lang_english`) },
        { value: `zh-Hans`, label: o(`com_nav_lang_chinese`) },
        { value: `zh-Hant`, label: o(`com_nav_lang_traditional_chinese`) },
        { value: `ar-EG`, label: o(`com_nav_lang_arabic`) },
        { value: `bs`, label: o(`com_nav_lang_bosnian`) },
        { value: `da-DK`, label: o(`com_nav_lang_danish`) },
        { value: `de-DE`, label: o(`com_nav_lang_german`) },
        { value: `es-ES`, label: o(`com_nav_lang_spanish`) },
        { value: `ca-ES`, label: o(`com_nav_lang_catalan`) },
        { value: `et-EE`, label: o(`com_nav_lang_estonian`) },
        { value: `fa-IR`, label: o(`com_nav_lang_persian`) },
        { value: `fr-FR`, label: o(`com_nav_lang_french`) },
        { value: `he-HE`, label: o(`com_nav_lang_hebrew`) },
        { value: `hu-HU`, label: o(`com_nav_lang_hungarian`) },
        { value: `hy-AM`, label: o(`com_nav_lang_armenian`) },
        { value: `is`, label: o(`com_nav_lang_icelandic`) },
        { value: `it-IT`, label: o(`com_nav_lang_italian`) },
        { value: `nb`, label: o(`com_nav_lang_norwegian_bokmal`) },
        { value: `nn`, label: o(`com_nav_lang_norwegian_nynorsk`) },
        { value: `pl-PL`, label: o(`com_nav_lang_polish`) },
        { value: `pt-BR`, label: o(`com_nav_lang_brazilian_portuguese`) },
        { value: `pt-PT`, label: o(`com_nav_lang_portuguese`) },
        { value: `ru-RU`, label: o(`com_nav_lang_russian`) },
        { value: `sk`, label: o(`com_nav_lang_slovak`) },
        { value: `ja-JP`, label: o(`com_nav_lang_japanese`) },
        { value: `ka-GE`, label: o(`com_nav_lang_georgian`) },
        { value: `cs-CZ`, label: o(`com_nav_lang_czech`) },
        { value: `sv-SE`, label: o(`com_nav_lang_swedish`) },
        { value: `ko-KR`, label: o(`com_nav_lang_korean`) },
        { value: `lt-LT`, label: o(`com_nav_lang_lithuanian`) },
        { value: `lv-LV`, label: o(`com_nav_lang_latvian`) },
        { value: `vi-VN`, label: o(`com_nav_lang_vietnamese`) },
        { value: `th-TH`, label: o(`com_nav_lang_thai`) },
        { value: `tr-TR`, label: o(`com_nav_lang_turkish`) },
        { value: `ug`, label: o(`com_nav_lang_uyghur`) },
        { value: `nl-NL`, label: o(`com_nav_lang_dutch`) },
        { value: `id-ID`, label: o(`com_nav_lang_indonesia`) },
        { value: `fi-FI`, label: o(`com_nav_lang_finnish`) },
        { value: `sl`, label: o(`com_nav_lang_slovenian`) },
        { value: `bo`, label: o(`com_nav_lang_tibetan`) },
        { value: `uk-UA`, label: o(`com_nav_lang_ukrainian`) },
      ],
      l = `language-selector-label`;
    return (0, J.jsxs)(`div`, {
      className: `flex items-center justify-between`,
      children: [
        (0, J.jsx)(`div`, { id: l, children: o(`com_nav_language`) }),
        (0, J.jsxs)(`div`, {
          className: `flex items-center gap-2`,
          children: [
            s &&
              (0, J.jsx)(`span`, {
                role: `status`,
                'aria-label': o(`com_ui_loading`),
                className: `flex size-5 items-center justify-center text-text-secondary`,
                children: (0, J.jsx)(V, { className: `size-4` }),
              }),
            (0, J.jsx)(H, {
              value: e,
              onChange: t,
              sizeClasses: j(`z-50 w-[220px]`, a),
              options: c,
              'aria-labelledby': l,
              portal: n,
              portalElement: i,
              searchable: !0,
              searchPlaceholder: o(`com_ui_search_language`),
              searchEmptyText: o(`com_ui_no_results_found`),
            }),
          ],
        }),
      ],
    });
  },
  Y = e(t(), 1);
function ke({ circumference: e, offset: t, circleCSSProperties: n }) {
  return (0, J.jsx)(`div`, {
    className: `absolute inset-0 flex items-center justify-center bg-black/5 text-white`,
    children: (0, J.jsxs)(`svg`, {
      width: `120`,
      height: `120`,
      viewBox: `0 0 120 120`,
      className: `h-6 w-6`,
      children: [
        (0, J.jsx)(`circle`, {
          className: `origin-[50%_50%] -rotate-90 stroke-border-heavy`,
          strokeWidth: `10`,
          fill: `transparent`,
          r: `55`,
          cx: `60`,
          cy: `60`,
        }),
        (0, J.jsx)(`circle`, {
          className: `origin-[50%_50%] -rotate-90 transition-[stroke-dashoffset]`,
          stroke: `currentColor`,
          strokeWidth: `10`,
          strokeDasharray: `${e} ${e}`,
          strokeDashoffset: t,
          fill: `transparent`,
          r: `55`,
          cx: `60`,
          cy: `60`,
          style: n,
        }),
      ],
    }),
  });
}
var X = ({
  imageBase64: e,
  url: t,
  progress: n = 1,
  className: r = ``,
  source: i,
  alt: a = `Preview image`,
}) => {
  let s = R(),
    [c, l] = (0, Y.useState)(!1),
    [u, f] = (0, Y.useState)(!1),
    [p, g] = (0, Y.useState)(!1),
    v = (0, Y.useRef)(null),
    y = (0, Y.useRef)(null),
    b = (0, Y.useRef)(null),
    x = (0, Y.useCallback)(() => {
      l(!0);
    }, []),
    S = (0, Y.useCallback)((e) => {
      (l(e),
        !e &&
          v.current &&
          requestAnimationFrame(() => {
            v.current?.focus({ preventScroll: !0 });
          }));
    }, []),
    C = (0, Y.useCallback)(
      (e) => {
        e.target === e.currentTarget && S(!1);
      },
      [S],
    );
  ((0, Y.useEffect)(
    () => (
      c ? (document.body.style.overflow = `hidden`) : (document.body.style.overflow = `unset`),
      () => {
        document.body.style.overflow = `unset`;
      }
    ),
    [c],
  ),
    (0, Y.useEffect)(() => {
      if (!c) return;
      let e = (e) => {
        e.key === `Escape` && S(!1);
      };
      return (
        document.addEventListener(`keydown`, e),
        () => document.removeEventListener(`keydown`, e)
      );
    }, [c, S]));
  let w = { backgroundSize: `cover`, backgroundPosition: `center`, backgroundRepeat: `no-repeat` },
    T = e ?? t ?? ``,
    E = T ? { ...w, backgroundImage: `url(${T})` } : w;
  if (typeof E.backgroundImage != `string` || E.backgroundImage.length === 0) return null;
  let D = 2 * Math.PI * 55,
    O = D - n * D,
    k = { transition: `stroke-dashoffset 0.3s linear` },
    A = u || p;
  return (0, J.jsxs)(J.Fragment, {
    children: [
      (0, J.jsxs)(`button`, {
        ref: v,
        type: `button`,
        className: j(
          `relative size-14 overflow-hidden rounded-xl transition-shadow`,
          `focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary`,
          r,
        ),
        style: E,
        'aria-label': `View ${a} in full size`,
        'aria-haspopup': `dialog`,
        onClick: (e) => {
          (e.preventDefault(), e.stopPropagation(), x());
        },
        onMouseEnter: () => f(!0),
        onMouseLeave: () => f(!1),
        onFocus: () => g(!0),
        onBlur: () => g(!1),
        children: [
          n < 1
            ? (0, J.jsx)(ke, {
                circumference: D,
                offset: O,
                circleCSSProperties: k,
                'aria-label': `Loading progress: ${Math.round(n * 100)}%`,
              })
            : (0, J.jsx)(`div`, {
                className: j(
                  `absolute inset-0 flex transform-gpu cursor-pointer items-center justify-center rounded-xl transition-opacity duration-200 ease-in-out`,
                  A ? `bg-black/20 opacity-100` : `opacity-0`,
                ),
                'aria-hidden': `true`,
                children: (0, J.jsx)(d, {
                  className: j(
                    `size-5 transform-gpu text-white drop-shadow-lg transition-all duration-200`,
                    A ? `scale-110` : ``,
                  ),
                }),
              }),
          (0, J.jsx)(ce, { source: i, 'aria-label': i ? `Source: ${i}` : void 0 }),
        ],
      }),
      (0, J.jsx)(h, {
        open: c,
        onOpenChange: S,
        children: (0, J.jsxs)(ee, {
          children: [
            (0, J.jsx)(m, { className: `fixed inset-0 z-[250] bg-black/90`, onClick: C }),
            (0, J.jsxs)(_, {
              className: `fixed inset-0 z-[250] flex items-center justify-center outline-none`,
              onOpenAutoFocus: (e) => {
                (e.preventDefault(), b.current?.focus());
              },
              onCloseAutoFocus: (e) => {
                (e.preventDefault(), v.current?.focus());
              },
              onPointerDownOutside: (e) => e.preventDefault(),
              onClick: C,
              children: [
                (0, J.jsx)(N, {
                  ref: b,
                  onClick: () => S(!1),
                  variant: `ghost`,
                  size: `icon`,
                  className: `absolute right-4 top-4 z-20 text-white hover:bg-white/10`,
                  'aria-label': s(`com_ui_close`),
                  children: (0, J.jsx)(o, { className: `size-5`, 'aria-hidden': `true` }),
                }),
                (0, J.jsx)(`div`, {
                  onClick: (e) => e.stopPropagation(),
                  children: (0, J.jsx)(`img`, {
                    ref: y,
                    src: T,
                    alt: a,
                    className: `max-h-[85vh] max-w-[90vw] object-contain`,
                    draggable: !1,
                  }),
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
};
function Z({ provider: e, imageURL: t, size: n = 20, className: r, model: i, alt: a = `` }) {
  return t
    ? (0, J.jsx)(`img`, { src: t, alt: a, width: n, height: n, className: j(`object-contain`, r) })
    : (0, J.jsx)(A, { provider: e, model: i, size: n, className: r });
}
function Q({ column: e, title: t, className: n = ``, filters: r, valueMap: a, ariaLabel: o }) {
  let c = R(),
    l = (0, Y.useId)(),
    [u, d] = (0, Y.useState)(!1),
    f = (0, Y.useMemo)(() => {
      let t = [
        {
          label: c(`com_ui_ascending`),
          onClick: () => e.toggleSorting(!1),
          icon: (0, J.jsx)(g, { className: `icon-sm text-text-secondary` }),
        },
        {
          label: c(`com_ui_descending`),
          onClick: () => e.toggleSorting(!0),
          icon: (0, J.jsx)(v, { className: `icon-sm text-text-secondary` }),
        },
      ];
      return (
        r &&
          (t.push({ separate: !0 }),
          Object.entries(r).forEach(([n, r]) => {
            r.forEach((n) => {
              let r = a?.[n ?? ``],
                i = r != null && r.length ? c(r) : String(n);
              if (i) {
                let r = e.getFilterValue() === n;
                t.push({
                  label: i,
                  onClick: () => e.setFilterValue(n),
                  icon: (0, J.jsx)(p, {
                    className: `icon-sm text-text-secondary`,
                    'aria-hidden': `true`,
                  }),
                  show: !0,
                  className: r ? `border-l-2 border-l-border-xheavy` : ``,
                });
              }
            });
          }),
          t.push({ separate: !0 }),
          t.push({
            label: c(`com_ui_show_all`),
            onClick: () => e.setFilterValue(void 0),
            icon: (0, J.jsx)(s, { className: `icon-sm text-text-secondary` }),
            show: !0,
          })),
        t
      );
    }, [e, r, a, c]);
  if (!e.getCanSort()) return (0, J.jsx)(`div`, { className: j(n), children: t });
  let m = e.getIsSorted(),
    h = `none`;
  return (
    m === `desc` ? (h = `descending`) : m === `asc` && (h = `ascending`),
    (0, J.jsx)(`div`, {
      className: j(`flex items-center space-x-2`, n),
      children: (0, J.jsx)(W, {
        portal: !1,
        isOpen: u,
        setIsOpen: d,
        trigger: (0, J.jsx)(M, {
          description: o || t,
          side: `top`,
          render: (0, J.jsxs)(i, {
            'aria-sort': h,
            'aria-label': o,
            'aria-pressed': e.getIsFiltered() ? `true` : `false`,
            'aria-current': m ? `true` : `false`,
            className: j(
              `inline-flex items-center gap-2 rounded-lg px-2 py-0 text-xs transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary data-[open]:bg-surface-hover sm:px-2 sm:py-2 sm:text-sm`,
              e.getIsFiltered() && `border-b-2 border-b-border-xheavy`,
            ),
            children: [
              (0, J.jsx)(`span`, { children: t }),
              e.getIsFiltered()
                ? (0, J.jsx)(p, { className: `icon-sm`, 'aria-hidden': `true` })
                : (0, J.jsx)(p, {
                    className: `icon-sm text-text-secondary`,
                    'aria-hidden': `true`,
                  }),
              (() => {
                let t = e.getIsSorted();
                return t === `desc`
                  ? (0, J.jsx)(v, { className: `icon-sm` })
                  : t === `asc`
                    ? (0, J.jsx)(g, { className: `icon-sm` })
                    : (0, J.jsx)(y, { className: `icon-sm` });
              })(),
            ],
          }),
        }),
        items: f,
        menuId: l,
        className: `z-[1001]`,
      }),
    })
  );
}
var $ = {
    [z.avatar]: `com_ui_avatar`,
    [z.unknown]: `com_ui_unknown`,
    [z.assistants]: `com_ui_assistants`,
    [z.image_generation]: `com_ui_image_gen`,
    [z.assistants_output]: `com_ui_assistants_output`,
    [z.message_attachment]: `com_ui_attachment`,
    [z.run_artifact]: `com_ui_published_file`,
  },
  Ae = [
    {
      id: `select`,
      size: 40,
      header: ({ table: e }) => {
        let t = R();
        return (0, J.jsx)(M, {
          description: t(`com_ui_select_all`),
          side: `top`,
          role: `checkbox`,
          render: (0, J.jsx)(P, {
            checked:
              e.getIsAllPageRowsSelected() || (e.getIsSomePageRowsSelected() && `indeterminate`),
            onCheckedChange: (t) => e.toggleAllPageRowsSelected(!!t),
            'aria-label': t(`com_ui_select_all`),
            className: `flex`,
          }),
        });
      },
      cell: ({ row: e }) => {
        let t = R();
        return (0, J.jsx)(P, {
          checked: e.getIsSelected(),
          onCheckedChange: (t) => e.toggleSelected(!!t),
          'aria-label': t(`com_ui_select_row`),
          className: `flex`,
        });
      },
      enableSorting: !1,
      enableHiding: !1,
    },
    {
      meta: { size: `150px` },
      accessorKey: `filename`,
      header: ({ column: e }) => {
        let t = R(),
          n = e.getIsSorted(),
          r = f,
          i = `none`;
        return (
          n === `desc`
            ? ((r = u), (i = `descending`))
            : n === `asc` && ((r = l), (i = `ascending`)),
          (0, J.jsx)(M, {
            description: t(`com_ui_name_sort`),
            side: `top`,
            render: (0, J.jsxs)(N, {
              variant: `ghost`,
              className: `px-2 py-0 text-xs hover:bg-surface-hover sm:px-2 sm:py-2 sm:text-sm`,
              onClick: () => e.toggleSorting(e.getIsSorted() === `asc`),
              'aria-sort': i,
              'aria-label': t(`com_ui_name_sort`),
              'aria-hidden': `true`,
              'aria-current': n ? `true` : `false`,
              children: [
                t(`com_ui_name`),
                (0, J.jsx)(r, { className: `ml-2 h-3 w-4 sm:h-4 sm:w-4` }),
              ],
            }),
          })
        );
      },
      cell: ({ row: e }) => {
        let t = e.original;
        if (t.type?.startsWith(`image`))
          return (0, J.jsxs)(`div`, {
            className: `flex gap-2`,
            children: [
              (0, J.jsx)(X, {
                url: t.filepath,
                className: `relative h-10 w-10 shrink-0 overflow-visible rounded-md`,
                source: t.source,
              }),
              (0, J.jsx)(`span`, { className: `self-center truncate`, children: t.filename }),
            ],
          });
        let n = k(t.type);
        return (0, J.jsxs)(`div`, {
          className: `flex gap-2`,
          children: [
            n && (0, J.jsx)(oe, { fileType: n, className: `relative`, file: t }),
            (0, J.jsx)(`span`, { className: `self-center truncate`, children: t.filename }),
          ],
        });
      },
    },
    {
      accessorKey: `updatedAt`,
      header: ({ column: e }) => {
        let t = R(),
          n = e.getIsSorted(),
          r = f,
          i = `none`;
        return (
          n === `desc`
            ? ((r = u), (i = `descending`))
            : n === `asc` && ((r = l), (i = `ascending`)),
          (0, J.jsx)(M, {
            description: t(`com_ui_date_sort`),
            side: `top`,
            render: (0, J.jsxs)(N, {
              variant: `ghost`,
              onClick: () => e.toggleSorting(e.getIsSorted() === `asc`),
              className: `px-2 py-0 text-xs hover:bg-surface-hover sm:px-2 sm:py-2 sm:text-sm`,
              'aria-sort': i,
              'aria-label': t(`com_ui_date_sort`),
              'aria-hidden': `true`,
              'aria-current': n ? `true` : `false`,
              children: [
                t(`com_ui_date`),
                (0, J.jsx)(r, { className: `ml-2 h-3 w-4 sm:h-4 sm:w-4` }),
              ],
            }),
          })
        );
      },
      cell: ({ row: e }) => {
        let t = L(`(max-width: 768px)`);
        return ae(e.original.updatedAt?.toString() ?? ``, t);
      },
    },
    {
      accessorKey: `filterSource`,
      header: ({ column: e }) => {
        let t = R();
        return (0, J.jsx)(Q, {
          column: e,
          title: t(`com_ui_storage`),
          ariaLabel: t(`com_ui_storage_filter_sort`),
          filters: {
            Storage: Object.values(G).filter(
              (e) => e === G.local || e === G.openai || e === G.azure,
            ),
          },
          valueMap: {
            [G.azure]: `com_ui_azure`,
            [G.openai]: `com_ui_openai`,
            [G.local]: `com_ui_host`,
          },
        });
      },
      cell: ({ row: e }) => {
        let t = R(),
          { source: n } = e.original;
        return n === G.openai
          ? (0, J.jsxs)(`div`, {
              className: `flex flex-wrap items-center gap-2`,
              children: [(0, J.jsx)(ie, { className: `icon-sm text-green-600/50` }), `OpenAI`],
            })
          : n === G.azure
            ? (0, J.jsxs)(`div`, {
                className: `flex flex-wrap items-center gap-2`,
                children: [(0, J.jsx)(pe, { className: `icon-sm text-cyan-700` }), `Azure`],
              })
            : (0, J.jsxs)(`div`, {
                className: `flex flex-wrap items-center gap-2`,
                children: [
                  (0, J.jsx)(c, { className: `icon-sm text-cyan-700`, 'aria-hidden': `true` }),
                  t(`com_ui_host`),
                ],
              });
      },
    },
    {
      accessorKey: `context`,
      header: ({ column: e }) => {
        let t = R();
        return (0, J.jsx)(Q, {
          column: e,
          title: t(`com_ui_context`),
          ariaLabel: t(`com_ui_context_filter_sort`),
          filters: { Context: Object.values(z).filter((e) => e === z[e ?? ``]) },
          valueMap: $,
        });
      },
      cell: ({ row: e }) => {
        let { context: t } = e.original,
          n = R();
        return (0, J.jsx)(`div`, {
          className: `flex flex-wrap items-center gap-2`,
          children: n($[t ?? z.unknown]),
        });
      },
    },
    {
      accessorKey: `bytes`,
      header: ({ column: e }) => {
        let t = R(),
          n = e.getIsSorted(),
          r = f,
          i = `none`;
        return (
          n === `desc`
            ? ((r = u), (i = `descending`))
            : n === `asc` && ((r = l), (i = `ascending`)),
          (0, J.jsx)(M, {
            description: t(`com_ui_size_sort`),
            side: `top`,
            render: (0, J.jsxs)(N, {
              variant: `ghost`,
              className: `px-2 py-0 text-xs hover:bg-surface-hover sm:px-2 sm:py-2 sm:text-sm`,
              onClick: () => e.toggleSorting(e.getIsSorted() === `asc`),
              'aria-sort': i,
              'aria-label': t(`com_ui_size_sort`),
              'aria-hidden': `true`,
              'aria-current': n ? `true` : `false`,
              children: [
                t(`com_ui_size`),
                (0, J.jsx)(r, { className: `ml-2 h-3 w-4 sm:h-4 sm:w-4` }),
              ],
            }),
          })
        );
      },
      cell: ({ row: e }) => {
        let t = Number((Number(e.original.bytes) / 1024 / 1024).toFixed(2));
        return t < 0.01 ? `< 0.01 MB` : `${t} MB`;
      },
    },
  ];
function je({ table: e, contextMap: t, isSmallScreen: n }) {
  let r = R(),
    a = (0, Y.useId)(),
    [o, s] = (0, Y.useState)(!1),
    c = (0, Y.useMemo)(
      () =>
        e
          .getAllColumns()
          .filter((e) => e.getCanHide())
          .map((e) => ({
            label: r(t[e.id]),
            onClick: () => e.toggleVisibility(!e.getIsVisible()),
            icon: e.getIsVisible() ? `✓` : ``,
            id: e.id,
          })),
      [e, t, r],
    );
  return (0, J.jsx)(W, {
    portal: !1,
    isOpen: o,
    setIsOpen: s,
    trigger: (0, J.jsx)(i, {
      'aria-label': r(`com_files_filter_by`),
      className: j(
        `inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border-medium bg-transparent px-3 text-sm font-medium ring-offset-surface-primary transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,
        n && `px-2 py-1`,
      ),
      children: (0, J.jsx)(p, { className: `size-3.5 sm:size-4`, 'aria-hidden': `true` }),
    }),
    items: c,
    menuId: a,
    className: `z-50 max-h-[300px] overflow-y-auto`,
  });
}
var Me = {
  [z.filename]: `com_ui_name`,
  [z.updatedAt]: `com_ui_date`,
  [z.filterSource]: `com_ui_storage`,
  [z.context]: `com_ui_context`,
  [z.bytes]: `com_ui_size`,
};
function Ne({ columns: e, data: t }) {
  let n = R(),
    [r, i] = (0, Y.useState)(!1),
    o = a(F.filesByIndex(0)),
    { deleteFiles: s } = me(() => i(!1)),
    [c, l] = (0, Y.useState)({}),
    [u, d] = (0, Y.useState)([]),
    f = L(`(max-width: 768px)`),
    [p, m] = (0, Y.useState)([]),
    [h, g] = (0, Y.useState)({}),
    _ = w({
      data: t,
      columns: e,
      defaultColumn: { minSize: 0, size: 2 ** 53 - 1, maxSize: 2 ** 53 - 1 },
      onSortingChange: d,
      getCoreRowModel: E(),
      getSortedRowModel: T(),
      onColumnFiltersChange: m,
      getFilteredRowModel: C(),
      onColumnVisibilityChange: g,
      getPaginationRowModel: x(),
      onRowSelectionChange: l,
      state: { sorting: u, columnFilters: p, columnVisibility: h, rowSelection: c },
    });
  return (0, J.jsxs)(`div`, {
    className: `flex h-full flex-col gap-4`,
    children: [
      (0, J.jsxs)(`div`, {
        className: `flex flex-wrap items-center gap-2 py-2 sm:gap-4 sm:py-4`,
        children: [
          (0, J.jsxs)(N, {
            variant: `outline`,
            onClick: () => {
              i(!0);
              let e = _.getFilteredSelectedRowModel().rows.map((e) => e.original);
              (s({ files: e, setFiles: o }), l({}));
            },
            disabled: !_.getFilteredSelectedRowModel().rows.length || r,
            className: j(`min-w-[40px] transition-all duration-200`, f && `px-2 py-1`),
            children: [
              r
                ? (0, J.jsx)(V, { className: `size-3.5 sm:size-4` })
                : (0, J.jsx)(te, { className: `size-3.5 text-text-destructive sm:size-4` }),
              !f && (0, J.jsx)(`span`, { className: `ml-2`, children: n(`com_ui_delete`) }),
            ],
          }),
          (0, J.jsx)(he, {
            inputId: `files-filter`,
            label: n(`com_files_filter`),
            value: _.getColumn(`filename`)?.getFilterValue() ?? ``,
            onChange: (e) => _.getColumn(`filename`)?.setFilterValue(e.target.value),
            containerClassName: `flex-1`,
          }),
          (0, J.jsx)(`div`, {
            className: `relative focus-within:z-[100]`,
            children: (0, J.jsx)(je, { table: _, contextMap: Me, isSmallScreen: f }),
          }),
        ],
      }),
      (0, J.jsx)(`div`, {
        className: `relative grid h-full max-h-[calc(100vh-20rem)] min-h-[calc(100vh-20rem)] w-full flex-1 overflow-hidden overflow-x-auto overflow-y-auto rounded-md border border-border-light`,
        children: (0, J.jsxs)(fe, {
          className: `w-full min-w-[300px] border-separate border-spacing-0`,
          children: [
            (0, J.jsx)(ue, {
              className: `sticky top-0 z-50`,
              children: _.getHeaderGroups().map((e) =>
                (0, J.jsx)(
                  q,
                  {
                    className: `border-b border-border-light`,
                    children: e.headers.map((e, t) => {
                      let n = e.getSize(),
                        r = { width: n === 2 ** 53 - 1 ? `auto` : n };
                      return (0, J.jsx)(
                        _e,
                        {
                          className: `whitespace-nowrap bg-surface-secondary px-2 py-2 text-left text-sm font-medium text-text-secondary sm:px-4`,
                          style: { ...r },
                          children: e.isPlaceholder
                            ? null
                            : D(e.column.columnDef.header, e.getContext()),
                        },
                        e.id,
                      );
                    }),
                  },
                  e.id,
                ),
              ),
            }),
            (0, J.jsx)(le, {
              className: `w-full`,
              children: _.getRowModel().rows.length
                ? _.getRowModel().rows.map((e) =>
                    (0, J.jsx)(
                      q,
                      {
                        'data-state': e.getIsSelected() && `selected`,
                        className: `border-b border-border-light transition-colors hover:bg-surface-secondary [tr:last-child_&]:border-b-0`,
                        children: e.getVisibleCells().map((e, t) => {
                          let n = e.column.getSize(),
                            r = { width: n === 2 ** 53 - 1 ? `auto` : n };
                          return (0, J.jsx)(
                            K,
                            {
                              className: j(
                                `align-start px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm [tr[data-disabled=true]_&]:opacity-50`,
                                e.column.id === `select` ? `overflow-visible` : `overflow-x-auto`,
                              ),
                              style: r,
                              children: D(e.column.columnDef.cell, e.getContext()),
                            },
                            e.id,
                          );
                        }),
                      },
                      e.id,
                    ),
                  )
                : (0, J.jsx)(q, {
                    children: (0, J.jsx)(K, {
                      colSpan: e.length,
                      className: `h-24 text-center`,
                      children: n(`com_files_no_results`),
                    }),
                  }),
            }),
          ],
        }),
      }),
      (0, J.jsxs)(`div`, {
        className: `flex items-center justify-end gap-2 py-4`,
        children: [
          (0, J.jsxs)(`div`, {
            className: `ml-2 flex-1 truncate text-xs text-text-secondary sm:ml-4 sm:text-sm`,
            children: [
              (0, J.jsx)(`span`, {
                className: `hidden sm:inline`,
                children: n(`com_files_number_selected`, {
                  0: `${_.getFilteredSelectedRowModel().rows.length}`,
                  1: `${_.getFilteredRowModel().rows.length}`,
                }),
              }),
              (0, J.jsx)(`span`, {
                className: `sm:hidden`,
                children: `${_.getFilteredSelectedRowModel().rows.length}/${_.getFilteredRowModel().rows.length}`,
              }),
            ],
          }),
          (0, J.jsxs)(`div`, {
            className: `flex items-center space-x-1 pr-2 text-xs font-bold text-text-primary sm:text-sm`,
            children: [
              (0, J.jsx)(`span`, { className: `hidden sm:inline`, children: n(`com_ui_page`) }),
              (0, J.jsx)(`span`, { children: _.getState().pagination.pageIndex + 1 }),
              (0, J.jsx)(`span`, { children: `/` }),
              (0, J.jsx)(`span`, { children: Math.max(_.getPageCount(), 1) }),
            ],
          }),
          (0, J.jsx)(N, {
            className: `select-none`,
            variant: `outline`,
            size: `sm`,
            onClick: () => _.previousPage(),
            disabled: !_.getCanPreviousPage(),
            children: n(`com_ui_prev`),
          }),
          (0, J.jsx)(N, {
            className: `select-none`,
            variant: `outline`,
            size: `sm`,
            onClick: () => _.nextPage(),
            disabled: !_.getCanNextPage(),
            children: n(`com_ui_next`),
          }),
        ],
      }),
    ],
  });
}
(G.openai, G.local, G.local, G.local);
function Pe({ open: e, onOpenChange: t, triggerRef: n }) {
  let r = R(),
    { data: i = [] } = ne({
      select: (e) =>
        e.map(
          (e) => (
            (e.context = e.context ?? z.unknown),
            (e.filterSource = e.source === G.firebase ? G.local : e.source),
            e
          ),
        ),
    });
  return (0, J.jsx)(ge, {
    open: e,
    onOpenChange: t,
    triggerRef: n,
    children: (0, J.jsxs)(se, {
      title: r(`com_nav_my_files`),
      className: `w-11/12 bg-surface-dialog text-text-primary shadow-2xl`,
      children: [
        (0, J.jsx)(re, { children: (0, J.jsx)(de, { children: r(`com_nav_my_files`) }) }),
        (0, J.jsx)(Ne, { columns: Ae, data: i }),
      ],
    }),
  });
}
export {
  De as a,
  Se as c,
  ve as d,
  ye as f,
  Oe as i,
  we as l,
  be as m,
  Z as n,
  Ee as o,
  xe as p,
  X as r,
  Ce as s,
  Pe as t,
  Te as u,
};
