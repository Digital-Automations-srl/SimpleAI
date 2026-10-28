import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  An as r,
  Br as i,
  Fo as a,
  Ia as o,
  In as s,
  Ur as c,
  Vi as l,
  Vr as u,
  Wr as d,
  pi as f,
  qt as p,
  sa as m,
  ua as h,
  vn as g,
} from './vendor.BQmuAj0u.js';
import { f as _, m as v, u as y } from './routing.CgoqFSAd.js';
import { r as b } from './query-devtools.DIz6FZCX.js';
import {
  Ba as x,
  Cm as ee,
  Dc as S,
  Ju as C,
  Mh as w,
  Mp as T,
  Ou as E,
  Qh as D,
  Xg as O,
  Xn as k,
  af as te,
  bf as A,
  bl as j,
  ch as M,
  cn as ne,
  ds as N,
  f_ as re,
  fh as P,
  om as F,
  ps as I,
  sp as L,
  tg as R,
  wl as z,
} from './hooks.OIrsuUZX.js';
import { i as B, n as ie, r as V, t as H } from './virtualization.xxcvniXr.js';
import {
  C as ae,
  a as U,
  f as W,
  l as G,
  n as K,
  p as q,
  r as J,
  t as Y,
  u as X,
  w as oe,
} from './ProjectEditDialog.B0O8Ttyy.js';
import { r as se } from './utilities.HUTk6tC6.js';
var Z = e(t(), 1),
  Q = n();
function ce({ onCreate: e }) {
  let t = N(),
    n = D(`(max-width: 768px)`);
  return (0, Q.jsx)(`header`, {
    className: `sticky top-0 z-10 border-b border-border-light bg-presentation`,
    children: (0, Q.jsxs)(`div`, {
      className: `mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 md:h-16 md:px-6`,
      children: [
        (0, Q.jsxs)(`div`, {
          className: `flex min-w-0 items-center gap-2.5`,
          children: [
            n ? (0, Q.jsx)(x, { className: `size-9 shrink-0` }) : null,
            (0, Q.jsx)(`h1`, {
              className: `truncate text-balance text-lg font-semibold tracking-tight text-text-primary md:text-xl`,
              children: t(`com_ui_projects`),
            }),
          ],
        }),
        (0, Q.jsxs)(T, {
          type: `button`,
          variant: `default`,
          size: `sm`,
          onClick: e,
          className: `shrink-0`,
          children: [
            (0, Q.jsx)(r, { className: `h-4 w-4`, 'aria-hidden': `true` }),
            t(`com_ui_new_project`),
          ],
        }),
      ],
    }),
  });
}
function le(e, t) {
  return function ({ className: n, ...r }) {
    return (0, Q.jsxs)(`div`, {
      ...r,
      className: C(n, `justify-between gap-5`),
      children: [
        (0, Q.jsx)(`span`, { className: `truncate`, children: e }),
        t
          ? (0, Q.jsx)(l, {
              className: `h-4 w-4 shrink-0 text-text-primary`,
              'aria-hidden': `true`,
            })
          : (0, Q.jsx)(`span`, { className: `h-4 w-4 shrink-0`, 'aria-hidden': `true` }),
      ],
    });
  };
}
function ue(e, t, n) {
  return t
    ? n(`com_ui_project_count_partial`, { count: e })
    : e === 1
      ? n(`com_ui_project_count_single`)
      : n(`com_ui_project_count`, { count: e });
}
function de(e) {
  let t = e.lastConversationAt ?? e.updatedAt ?? e.createdAt;
  if (!t) return null;
  let n = new Date(t);
  return Number.isNaN(n.getTime())
    ? null
    : n.toLocaleDateString(void 0, { month: `short`, day: `numeric`, year: `numeric` });
}
function fe({ project: e, index: t, onOpen: n }) {
  let r = N(),
    a = (0, Z.useId)(),
    [c, l] = (0, Z.useState)(!1),
    [u, d] = (0, Z.useState)(!1),
    [m, h] = (0, Z.useState)(!1),
    g = de(e),
    _ = (0, Z.useMemo)(
      () => [
        {
          id: `${a}-edit`,
          label: r(`com_ui_edit_project`),
          icon: (0, Q.jsx)(s, { className: `size-4 text-text-secondary`, 'aria-hidden': `true` }),
          onClick: () => d(!0),
        },
        {
          id: `${a}-delete`,
          label: r(`com_ui_delete`),
          icon: (0, Q.jsx)(p, { className: `size-4 text-text-secondary`, 'aria-hidden': `true` }),
          onClick: () => h(!0),
        },
      ],
      [r, a],
    );
  return (0, Q.jsxs)(`article`, {
    className: C(
      `group/project relative flex min-h-[9.5rem] flex-col rounded-2xl border border-border-light bg-surface-secondary`,
      `transition-colors duration-150 ease-out hover:bg-surface-hover`,
      `motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:fill-mode-both`,
    ),
    style: { animationDelay: `${Math.min(t, 8) * 40}ms` },
    children: [
      (0, Q.jsxs)(`button`, {
        type: `button`,
        className: `flex min-h-[9.5rem] flex-1 flex-col rounded-2xl p-4 pr-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary`,
        onClick: () => n(e._id),
        children: [
          (0, Q.jsx)(`span`, {
            className: `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary text-text-secondary transition-colors group-hover/project:text-text-primary`,
            children: (0, Q.jsx)(i, { className: `h-5 w-5`, 'aria-hidden': `true` }),
          }),
          (0, Q.jsx)(`span`, {
            className: `mt-3 truncate text-base font-semibold tracking-tight text-text-primary`,
            children: e.name,
          }),
          e.description
            ? (0, Q.jsx)(`span`, {
                className: `mt-1 line-clamp-2 text-pretty text-sm leading-relaxed text-text-secondary`,
                children: e.description,
              })
            : null,
          (0, Q.jsxs)(`span`, {
            className: `mt-auto flex items-center gap-2 pt-4 text-xs tabular-nums text-text-secondary`,
            children: [
              (0, Q.jsx)(`span`, {
                children:
                  e.conversationCount === 1
                    ? r(`com_ui_project_chat_count_single`)
                    : r(`com_ui_project_chat_count`, { count: e.conversationCount }),
              }),
              g
                ? (0, Q.jsxs)(Q.Fragment, {
                    children: [
                      (0, Q.jsx)(`span`, { 'aria-hidden': `true`, children: `·` }),
                      (0, Q.jsx)(`time`, {
                        dateTime: e.lastConversationAt ?? e.updatedAt ?? e.createdAt,
                        children: g,
                      }),
                    ],
                  })
                : null,
            ],
          }),
        ],
      }),
      (0, Q.jsx)(`div`, {
        className: `absolute right-2 top-2`,
        children: (0, Q.jsx)(F, {
          portal: !0,
          focusLoop: !0,
          unmountOnHide: !0,
          menuId: a,
          isOpen: c,
          setIsOpen: l,
          className: `z-[125] min-w-44`,
          iconClassName: `mr-2 text-text-secondary`,
          trigger: (0, Q.jsx)(o, {
            'aria-label': r(`com_ui_more_options`),
            className: C(
              `flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary outline-none transition-colors`,
              `hover:bg-surface-tertiary hover:text-text-primary`,
              `focus-visible:ring-2 focus-visible:ring-text-primary`,
              c && `bg-surface-tertiary text-text-primary`,
            ),
            children: (0, Q.jsx)(f, { className: `h-4 w-4`, 'aria-hidden': `true` }),
          }),
          items: _,
        }),
      }),
      (0, Q.jsx)(Y, { open: u, onOpenChange: d, project: e }),
      (0, Q.jsx)(K, { open: m, onOpenChange: h, project: e }),
    ],
  });
}
function pe() {
  return (0, Q.jsx)(`div`, {
    className: `grid gap-3 sm:grid-cols-2 xl:grid-cols-3`,
    'aria-hidden': `true`,
    children: Array.from({ length: 6 }, (e, t) =>
      (0, Q.jsxs)(
        `div`,
        {
          className: `flex min-h-[9.5rem] flex-col rounded-2xl bg-surface-secondary p-4`,
          children: [
            (0, Q.jsx)(M, { className: `h-11 w-11 rounded-xl` }),
            (0, Q.jsx)(M, { className: `mt-3 h-5 w-2/3` }),
            (0, Q.jsx)(M, { className: `mt-2 h-4 w-full` }),
            (0, Q.jsx)(M, { className: `mt-auto h-3 w-24` }),
          ],
        },
        t,
      ),
    ),
  });
}
function me() {
  let e = N(),
    t = y(),
    [n, r] = v(),
    [i, a] = (0, Z.useState)(``),
    [s, l] = (0, Z.useState)(`lastConversationAt`),
    [u, d] = (0, Z.useState)(n.get(`new`) === `1`),
    f = (0, Z.useId)(),
    [p, h] = (0, Z.useState)(!1),
    _ = (0, Z.useDeferredValue)(i),
    {
      data: b,
      fetchNextPage: x,
      isFetchingNextPage: S,
      isLoading: w,
    } = oe({ search: _ || void 0, sortBy: s, sortDirection: s === `name` ? `asc` : `desc` }),
    E = (0, Z.useMemo)(() => b?.pages.flatMap((e) => e.projects) ?? [], [b?.pages]),
    D = b?.pages[b.pages.length - 1]?.nextCursor != null,
    O = (0, Z.useMemo)(
      () => [
        { value: `lastConversationAt`, label: e(`com_ui_latest_activity`) },
        { value: `createdAt`, label: e(`com_ui_sort_created`) },
        { value: `name`, label: e(`com_ui_name`) },
      ],
      [e],
    ),
    k = O.find((e) => e.value === s)?.label ?? e(`com_ui_latest_activity`),
    te = (0, Z.useMemo)(
      () =>
        O.map((e) => {
          let t = s === e.value;
          return {
            id: `project-sort-${e.value}`,
            ariaLabel: e.label,
            ariaChecked: t,
            onClick: () => l(e.value),
            render: le(e.label, t),
          };
        }),
      [s, O],
    ),
    A = ue(E.length, D, e);
  return (
    (0, Z.useEffect)(() => {
      n.get(`new`) === `1` && d(!0);
    }, [n]),
    (0, Q.jsxs)(`main`, {
      className: `flex h-full min-h-0 flex-col overflow-auto bg-presentation text-text-primary`,
      children: [
        (0, Q.jsx)(ce, { onCreate: () => d(!0) }),
        (0, Q.jsxs)(`div`, {
          className: `mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-6 md:px-6 md:pt-8`,
          children: [
            (0, Q.jsxs)(`div`, {
              className: `flex flex-col gap-3 sm:flex-row sm:items-center`,
              children: [
                (0, Q.jsxs)(`label`, {
                  className: `relative min-w-0 flex-1`,
                  children: [
                    (0, Q.jsx)(`span`, {
                      className: `sr-only`,
                      children: e(`com_ui_search_projects`),
                    }),
                    (0, Q.jsx)(g, {
                      className: `pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary`,
                      'aria-hidden': `true`,
                    }),
                    (0, Q.jsx)(ee, {
                      value: i,
                      onChange: (e) => a(e.target.value),
                      placeholder: e(`com_ui_search_projects`),
                      className: `h-11 rounded-xl bg-surface-secondary pl-10`,
                    }),
                  ],
                }),
                (0, Q.jsx)(F, {
                  portal: !0,
                  focusLoop: !0,
                  unmountOnHide: !0,
                  menuId: f,
                  isOpen: p,
                  setIsOpen: h,
                  className: `z-[125] min-w-56`,
                  trigger: (0, Q.jsxs)(o, {
                    'aria-label': e(`com_ui_sort_projects_by`),
                    className: C(
                      `inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors`,
                      `hover:bg-surface-hover hover:text-text-primary`,
                      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                      p && `bg-surface-hover text-text-primary`,
                    ),
                    children: [
                      (0, Q.jsx)(m, { className: `h-4 w-4 shrink-0`, 'aria-hidden': `true` }),
                      (0, Q.jsx)(`span`, { className: `truncate`, children: k }),
                    ],
                  }),
                  items: te,
                }),
              ],
            }),
            (0, Q.jsxs)(`div`, {
              className: `mt-8 flex items-baseline justify-between gap-3`,
              children: [
                (0, Q.jsx)(`h2`, {
                  className: `text-sm font-medium text-text-primary`,
                  children: e(`com_ui_your_projects`),
                }),
                !w && E.length > 0
                  ? (0, Q.jsx)(`p`, {
                      className: `text-sm tabular-nums text-text-secondary`,
                      children: A,
                    })
                  : null,
              ],
            }),
            (0, Q.jsx)(J, {
              open: u,
              onOpenChange: (e) => {
                if ((d(e), !e && n.get(`new`) === `1`)) {
                  let e = new URLSearchParams(n);
                  (e.delete(`new`), r(e, { replace: !0 }));
                }
              },
              onCreated: (e) => t(`/projects/${e._id}`),
            }),
            (0, Q.jsxs)(`div`, {
              className: `mt-4 flex flex-1 flex-col`,
              children: [
                w && (0, Q.jsx)(pe, {}),
                !w &&
                  E.length > 0 &&
                  (0, Q.jsx)(`div`, {
                    className: `grid gap-3 sm:grid-cols-2 xl:grid-cols-3`,
                    children: E.map((e, n) =>
                      (0, Q.jsx)(
                        fe,
                        { project: e, index: n, onOpen: (e) => t(`/projects/${e}`) },
                        e._id,
                      ),
                    ),
                  }),
                !w &&
                  E.length === 0 &&
                  (0, Q.jsxs)(`div`, {
                    className: `flex flex-1 flex-col items-center justify-center rounded-2xl bg-surface-secondary px-6 py-16 text-center`,
                    children: [
                      (0, Q.jsx)(`span`, {
                        className: `flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary text-text-secondary`,
                        children: (0, Q.jsx)(c, { className: `h-7 w-7`, 'aria-hidden': `true` }),
                      }),
                      (0, Q.jsx)(`h3`, {
                        className: `mt-4 text-balance text-base font-semibold text-text-primary`,
                        children: e(i ? `com_ui_no_matching_projects` : `com_ui_no_projects`),
                      }),
                      i
                        ? null
                        : (0, Q.jsxs)(Q.Fragment, {
                            children: [
                              (0, Q.jsx)(`p`, {
                                className: `mt-1 max-w-sm text-pretty text-sm text-text-secondary`,
                                children: e(`com_ui_add_first_project`),
                              }),
                              (0, Q.jsxs)(T, {
                                type: `button`,
                                variant: `default`,
                                size: `sm`,
                                className: `mt-5`,
                                onClick: () => d(!0),
                                children: [
                                  (0, Q.jsx)(c, { className: `h-4 w-4`, 'aria-hidden': `true` }),
                                  e(`com_ui_new_project`),
                                ],
                              }),
                            ],
                          }),
                    ],
                  }),
              ],
            }),
            D &&
              (0, Q.jsx)(T, {
                type: `button`,
                variant: `outline`,
                className: `mx-auto mt-8`,
                onClick: () => x(),
                disabled: S,
                children: e(S ? `com_ui_loading` : `com_ui_load_more`),
              }),
          ],
        }),
      ],
    })
  );
}
var he = e(se(), 1),
  ge = () => {};
function _e({ conversation: e, isMenuOpen: t, setIsMenuOpen: n }) {
  let r = N(),
    { showToast: i } = R(),
    a = (0, Z.useId)(),
    s = (0, Z.useRef)(null),
    [c, l] = (0, Z.useState)(!1),
    [m, h] = (0, Z.useState)(!1),
    g = e.conversationId ?? ``,
    _ = e.chatProjectId ?? null,
    v = z(),
    y = (0, Z.useMemo)(
      () =>
        g
          ? [
              {
                label: r(`com_ui_change_project`),
                onClick: () => h(!0),
                icon: (0, Q.jsx)(d, {
                  className: `size-4 text-text-secondary`,
                  'aria-hidden': `true`,
                }),
                hideOnClick: !1,
                render: (e) => (0, Q.jsx)(`button`, { ...e }),
              },
              {
                label: r(`com_ui_remove_from_project`),
                show: !!_,
                onClick: () => {
                  v.mutate(
                    { conversationId: g, projectId: null },
                    {
                      onSuccess: () => {
                        (n(!1),
                          i({
                            message: r(`com_ui_project_updated`),
                            severity: L.SUCCESS,
                            showIcon: !0,
                          }));
                      },
                      onError: () => {
                        i({
                          message: r(`com_ui_project_update_error`),
                          severity: L.ERROR,
                          showIcon: !0,
                        });
                      },
                    },
                  );
                },
                hideOnClick: !1,
                icon: v.isLoading
                  ? (0, Q.jsx)(P, { className: `size-4` })
                  : (0, Q.jsx)(u, {
                      className: `size-4 text-text-secondary`,
                      'aria-hidden': `true`,
                    }),
              },
              {
                label: r(`com_ui_delete`),
                onClick: () => l(!0),
                hideOnClick: !1,
                render: (e) => (0, Q.jsx)(`button`, { ...e }),
                icon: (0, Q.jsx)(p, {
                  className: `size-4 text-text-secondary`,
                  'aria-hidden': `true`,
                }),
              },
            ]
          : [],
      [v, _, g, r, n, i],
    );
  return (0, Q.jsxs)(Q.Fragment, {
    children: [
      (0, Q.jsx)(F, {
        portal: !0,
        focusLoop: !0,
        unmountOnHide: !0,
        menuId: a,
        isOpen: t,
        setIsOpen: n,
        className: `z-[125] min-w-44`,
        iconClassName: `mr-2 text-text-secondary`,
        trigger: (0, Q.jsx)(o, {
          ref: s,
          'aria-label': r(`com_nav_convo_menu_options`),
          className: C(
            `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none transition-colors`,
            `hover:bg-surface-hover hover:text-text-primary`,
            `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary`,
            t && `bg-surface-hover text-text-primary`,
          ),
          children: (0, Q.jsx)(f, { className: `h-4 w-4`, 'aria-hidden': `true` }),
        }),
        items: y,
      }),
      m
        ? (0, Q.jsx)(G, {
            conversationId: g,
            chatProjectId: _,
            setMenuOpen: n,
            triggerRef: s,
            showProjectDialog: m,
            setShowProjectDialog: h,
          })
        : null,
      c
        ? (0, Q.jsx)(X, {
            title: e.title ?? ``,
            retainView: ge,
            triggerRef: s,
            setMenuOpen: n,
            showDeleteDialog: c,
            conversationId: g,
            setShowDeleteDialog: l,
          })
        : null,
    ],
  });
}
var ve = (0, Z.memo)(_e),
  $ = (0, Z.memo)(({ cache: e, rowKey: t, parent: n, index: r, style: i, children: a }) =>
    (0, Q.jsx)(
      V,
      {
        cache: e,
        columnIndex: 0,
        parent: n,
        rowIndex: r,
        children: ({ registerChild: e }) => (0, Q.jsx)(`div`, { ref: e, style: i, children: a }),
      },
      t,
    ),
  );
$.displayName = `ProjectWorkspaceMeasuredRow`;
var ye = (0, Z.memo)(() => {
  let e = N();
  return (0, Q.jsxs)(`div`, {
    className: `flex items-center justify-center gap-2 py-4 text-sm text-text-secondary`,
    children: [
      (0, Q.jsx)(P, { className: `text-text-primary` }),
      (0, Q.jsx)(`span`, { children: e(`com_ui_loading`) }),
    ],
  });
});
ye.displayName = `ProjectWorkspaceLoadingRow`;
var be = (0, Z.memo)(
  ({ conversation: e, isGenerating: t }) => {
    let { navigateToConvo: n } = I(),
      r = N(),
      i = k(),
      a = e.conversationId ?? ``,
      o = e.title || r(`com_ui_untitled`),
      s = e.updatedAt || e.createdAt,
      c = s ? new Date(s).toLocaleString(void 0, { hour12: i }) : ``,
      [l, u] = (0, Z.useState)(!1);
    return (0, Q.jsxs)(`article`, {
      className: C(
        `group/project-chat mb-2 flex items-center rounded-2xl border border-border-light bg-surface-secondary`,
        `transition-colors hover:bg-surface-hover`,
        l && `bg-surface-hover`,
      ),
      children: [
        (0, Q.jsxs)(`button`, {
          type: `button`,
          className: `flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary`,
          onClick: () => n(e),
          children: [
            (0, Q.jsx)(`span`, {
              className: `flex h-10 w-10 shrink-0 items-center justify-center`,
              children: (0, Q.jsx)(W, { conversation: e, size: 40, context: `landing` }),
            }),
            (0, Q.jsxs)(`span`, {
              className: `min-w-0 flex-1`,
              children: [
                (0, Q.jsx)(`span`, {
                  className: `block truncate text-sm font-medium text-text-primary`,
                  children: o,
                }),
                (0, Q.jsx)(`span`, {
                  className: `block truncate text-xs tabular-nums text-text-secondary`,
                  children: c,
                }),
              ],
            }),
            t
              ? (0, Q.jsx)(P, {
                  className: `h-4 w-4 shrink-0 text-text-primary`,
                  'aria-label': r(`com_ui_generating`),
                })
              : null,
          ],
        }),
        a
          ? (0, Q.jsx)(`div`, {
              className: `pr-2`,
              children: (0, Q.jsx)(ve, { conversation: e, isMenuOpen: l, setIsMenuOpen: u }),
            })
          : null,
      ],
    });
  },
  (e, t) => q(e.conversation, t.conversation) && e.isGenerating === t.isGenerating,
);
be.displayName = `ProjectWorkspaceConversationRow`;
var xe = (0, Z.memo)(
  ({
    conversations: e,
    isLoading: t,
    isFetchingNextPage: n,
    hasNextPage: r,
    sortBy: i,
    emptyLabel: a,
    loadMore: o,
  }) => {
    let { data: s } = j(),
      c = (0, Z.useMemo)(() => new Set(s?.activeJobIds ?? []), [s?.activeJobIds]),
      l = (0, Z.useMemo)(() => {
        if (t) return [{ type: `loading` }];
        if (!e.length) return [{ type: `empty` }];
        let r = [];
        return (
          A(e, { field: i }).forEach(([e, t]) => {
            (r.push({ type: `date`, groupName: e }),
              t.forEach((e) => r.push({ type: `convo`, convo: e })));
          }),
          n && r.push({ type: `loading` }),
          r
        );
      }, [e, n, t, i]),
      u = (0, Z.useRef)(l);
    u.current = l;
    let d = (0, Z.useMemo)(
        () =>
          new ie({
            fixedWidth: !0,
            defaultHeight: 52,
            keyMapper: (e) => {
              let t = u.current[e];
              return t
                ? t.type === `date`
                  ? `project-workspace-date-${t.groupName}`
                  : t.type === `convo`
                    ? `project-workspace-convo-${t.convo.conversationId}`
                    : `project-workspace-${t.type}`
                : `project-workspace-unknown-${e}`;
            },
          }),
        [],
      ),
      f = (0, Z.useRef)(null);
    (0, Z.useEffect)(() => {
      let e = requestAnimationFrame(() => {
        (d.clearAll(), f.current?.recomputeRowHeights(0));
      });
      return () => cancelAnimationFrame(e);
    }, [d, e.length, i]);
    let p = (0, Z.useMemo)(() => (0, he.default)(o, 300), [o]),
      m = (0, Z.useCallback)(
        ({ index: e, key: t, parent: n, style: r }) => {
          let i = l[e],
            o = { cache: d, rowKey: t, parent: n, index: e, style: r };
          return i.type === `loading`
            ? (0, Q.jsx)($, { ...o, children: (0, Q.jsx)(ye, {}) }, t)
            : i.type === `empty`
              ? (0, Q.jsx)(
                  $,
                  {
                    ...o,
                    children: (0, Q.jsx)(`div`, {
                      className: `px-3 py-14 text-center text-sm text-text-secondary`,
                      children: a,
                    }),
                  },
                  t,
                )
              : i.type === `date`
                ? (0, Q.jsx)(
                    $,
                    {
                      ...o,
                      children: (0, Q.jsx)(`div`, {
                        className: `pb-3`,
                        children: (0, Q.jsx)(U, { groupName: i.groupName }),
                      }),
                    },
                    t,
                  )
                : (0, Q.jsx)(
                    $,
                    {
                      ...o,
                      children: (0, Q.jsx)(be, {
                        conversation: i.convo,
                        isGenerating: c.has(i.convo.conversationId ?? ``),
                      }),
                    },
                    t,
                  );
        },
        [c, d, a, l],
      ),
      h = (0, Z.useCallback)(({ index: e }) => d.getHeight(e, 0), [d]),
      g = (0, Z.useCallback)(
        ({ stopIndex: e }) => {
          r && e >= l.length - 6 && p();
        },
        [l.length, r, p],
      );
    return (0, Q.jsx)(`div`, {
      className: `min-h-[280px] flex-1 overflow-hidden`,
      children: (0, Q.jsx)(B, {
        children: ({ width: e, height: t }) =>
          (0, Q.jsx)(H, {
            ref: f,
            width: e,
            height: t,
            rowCount: l.length,
            rowHeight: h,
            rowRenderer: m,
            deferredMeasurementCache: d,
            overscanRowCount: 8,
            onRowsRendered: g,
            className: `outline-none`,
            style: { outline: `none` },
          }),
      }),
    });
  },
);
function Se(e, t) {
  return function ({ className: n, ...r }) {
    return (0, Q.jsxs)(`div`, {
      ...r,
      className: C(n, `justify-between gap-5`),
      children: [
        (0, Q.jsx)(`span`, { className: `truncate`, children: e }),
        t
          ? (0, Q.jsx)(l, {
              className: `h-4 w-4 shrink-0 text-text-primary`,
              'aria-hidden': `true`,
            })
          : (0, Q.jsx)(`span`, { className: `h-4 w-4 shrink-0`, 'aria-hidden': `true` }),
      ],
    });
  };
}
function Ce() {
  let e = N(),
    t = y(),
    n = b(),
    { projectId: c = `` } = _(),
    [l, u] = (0, Z.useState)(`updatedAt`),
    [d, f] = (0, Z.useState)(!1),
    [g, v] = (0, Z.useState)(!1),
    ee = (0, Z.useId)(),
    [k, A] = (0, Z.useState)(!1),
    { data: j, isLoading: M } = ae(c),
    I = a(E.conversationByIndex(0)),
    { newConversation: L } = ne(),
    R = j?._id,
    z = D(`(max-width: 768px)`),
    B = (0, Z.useMemo)(
      () => [
        { value: `updatedAt`, label: e(`com_ui_sort_updated`) },
        { value: `createdAt`, label: e(`com_ui_sort_created`) },
      ],
      [e],
    ),
    ie = B.find((e) => e.value === l)?.label ?? e(`com_ui_sort_updated`),
    V = (0, Z.useMemo)(
      () =>
        B.map((e) => {
          let t = l === e.value;
          return {
            id: `project-chat-sort-${e.value}`,
            ariaLabel: e.label,
            ariaChecked: t,
            onClick: () => u(e.value),
            render: Se(e.label, t),
          };
        }),
      [l, B],
    ),
    {
      data: H,
      fetchNextPage: U,
      isFetchingNextPage: W,
      isLoading: G,
    } = S(
      { projectId: R, sortBy: l, sortDirection: `desc` },
      { enabled: !!R, staleTime: 3e4, cacheTime: 3e5 },
    ),
    q = (0, Z.useMemo)(() => H?.pages.flatMap((e) => e.conversations) ?? [], [H?.pages]),
    J = (0, Z.useMemo)(() => {
      let e = H?.pages;
      return e?.length ? e[e.length - 1].nextCursor !== null : !1;
    }, [H?.pages]),
    X = (0, Z.useCallback)(() => {
      R &&
        (te(n, I?.conversationId),
        n.invalidateQueries([re.messages]),
        t(`/c/${O.NEW_CONVO}?projectId=${encodeURIComponent(R)}`),
        L({ template: { chatProjectId: R } }));
    }, [R, I?.conversationId, t, L, n]);
  return M
    ? (0, Q.jsx)(`div`, {
        className: `flex h-full items-center justify-center bg-presentation`,
        children: (0, Q.jsx)(P, { className: `text-text-primary` }),
      })
    : j
      ? (0, Q.jsxs)(`main`, {
          className: `flex h-full min-h-0 flex-col overflow-y-auto bg-presentation text-text-primary`,
          children: [
            (0, Q.jsx)(`header`, {
              className: `sticky top-0 z-10 border-b border-border-light bg-presentation`,
              children: (0, Q.jsxs)(`div`, {
                className: `mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 md:h-16 md:px-6`,
                children: [
                  z ? (0, Q.jsx)(x, { className: `size-9 shrink-0` }) : null,
                  (0, Q.jsxs)(T, {
                    type: `button`,
                    variant: `ghost`,
                    size: `sm`,
                    onClick: () => t(`/projects`),
                    className: `-ml-1.5 text-text-secondary hover:text-text-primary`,
                    children: [
                      (0, Q.jsx)(h, { className: `h-4 w-4`, 'aria-hidden': `true` }),
                      e(`com_ui_all_projects`),
                    ],
                  }),
                ],
              }),
            }),
            (0, Q.jsxs)(`div`, {
              className: `mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-6 md:px-6 md:pt-8`,
              children: [
                (0, Q.jsxs)(`div`, {
                  className: `flex items-start gap-3.5`,
                  children: [
                    (0, Q.jsx)(`span`, {
                      className: `flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-secondary text-text-secondary`,
                      children: (0, Q.jsx)(i, { className: `h-6 w-6`, 'aria-hidden': `true` }),
                    }),
                    (0, Q.jsxs)(`div`, {
                      className: `min-w-0 flex-1 pt-0.5`,
                      children: [
                        (0, Q.jsx)(`h1`, {
                          className: `truncate text-balance text-2xl font-semibold tracking-tight text-text-primary`,
                          children: j.name,
                        }),
                        j.description
                          ? (0, Q.jsx)(`p`, {
                              className: `mt-1 text-pretty text-sm leading-relaxed text-text-secondary`,
                              children: j.description,
                            })
                          : (0, Q.jsx)(`button`, {
                              type: `button`,
                              onClick: () => f(!0),
                              className: `mt-1 text-sm text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                              children: e(`com_ui_add_description`),
                            }),
                      ],
                    }),
                    (0, Q.jsxs)(`div`, {
                      className: `flex shrink-0 items-center gap-0.5 pt-1`,
                      children: [
                        (0, Q.jsx)(w, {
                          description: e(`com_ui_edit_project`),
                          render: (0, Q.jsx)(T, {
                            type: `button`,
                            variant: `ghost`,
                            size: `icon`,
                            className: `size-8 shrink-0 text-text-secondary hover:text-text-primary`,
                            'aria-label': e(`com_ui_edit_project`),
                            onClick: () => f(!0),
                            children: (0, Q.jsx)(s, {
                              className: `h-4 w-4`,
                              'aria-hidden': `true`,
                            }),
                          }),
                        }),
                        (0, Q.jsx)(w, {
                          description: e(`com_ui_delete_project_action`),
                          render: (0, Q.jsx)(T, {
                            type: `button`,
                            variant: `ghost`,
                            size: `icon`,
                            className: `size-8 shrink-0 text-text-secondary hover:text-text-destructive`,
                            'aria-label': e(`com_ui_delete_project_action`),
                            onClick: () => v(!0),
                            children: (0, Q.jsx)(p, {
                              className: `h-4 w-4`,
                              'aria-hidden': `true`,
                            }),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, Q.jsx)(Y, { open: d, onOpenChange: f, project: j }),
                (0, Q.jsx)(K, { open: g, onOpenChange: v, project: j }),
                (0, Q.jsxs)(`button`, {
                  type: `button`,
                  onClick: X,
                  className: C(
                    `mt-7 flex w-full items-center gap-3 rounded-2xl border border-border-light bg-surface-secondary px-3.5 py-3 text-left`,
                    `transition-colors duration-150 hover:bg-surface-hover`,
                    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                  ),
                  'aria-label': e(`com_ui_new_chat_in_project`, { name: j.name }),
                  children: [
                    (0, Q.jsx)(`span`, {
                      className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary text-text-primary`,
                      children: (0, Q.jsx)(r, { className: `h-4 w-4`, 'aria-hidden': `true` }),
                    }),
                    (0, Q.jsx)(`span`, {
                      className: `min-w-0 flex-1 truncate text-sm text-text-primary`,
                      children: e(`com_ui_new_chat_in_project`, { name: j.name }),
                    }),
                  ],
                }),
                (0, Q.jsxs)(`section`, {
                  className: `mt-8 flex min-h-0 flex-1 flex-col`,
                  children: [
                    (0, Q.jsxs)(`div`, {
                      className: `mb-3 flex items-center justify-between gap-3`,
                      children: [
                        (0, Q.jsxs)(`h2`, {
                          className: `flex items-baseline gap-2 text-sm font-medium text-text-primary`,
                          children: [
                            e(`com_ui_chats`),
                            (0, Q.jsx)(`span`, {
                              className: `tabular-nums text-text-secondary`,
                              children: j.conversationCount,
                            }),
                          ],
                        }),
                        (0, Q.jsx)(F, {
                          portal: !0,
                          focusLoop: !0,
                          unmountOnHide: !0,
                          menuId: ee,
                          isOpen: k,
                          setIsOpen: A,
                          className: `z-[125] min-w-44`,
                          trigger: (0, Q.jsxs)(o, {
                            'aria-label': e(`com_ui_sort_chats_by`),
                            className: C(
                              `inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                              k && `bg-surface-hover text-text-primary`,
                            ),
                            children: [
                              (0, Q.jsx)(m, { className: `h-4 w-4`, 'aria-hidden': `true` }),
                              ie,
                            ],
                          }),
                          items: V,
                        }),
                      ],
                    }),
                    (0, Q.jsx)(xe, {
                      conversations: q,
                      isLoading: G,
                      isFetchingNextPage: W,
                      hasNextPage: J,
                      sortBy: l,
                      emptyLabel: e(`com_ui_no_project_chats`),
                      loadMore: () => U(),
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      : (0, Q.jsxs)(`div`, {
          className: `flex h-full flex-col items-center justify-center gap-3 bg-presentation px-6 text-center`,
          children: [
            (0, Q.jsx)(`p`, {
              className: `text-sm text-text-secondary`,
              children: e(`com_ui_project_not_found`),
            }),
            (0, Q.jsx)(T, {
              type: `button`,
              variant: `outline`,
              size: `sm`,
              onClick: () => t(`/projects`),
              children: e(`com_ui_all_projects`),
            }),
          ],
        });
}
export { Ce as ProjectWorkspace, me as ProjectsView };
