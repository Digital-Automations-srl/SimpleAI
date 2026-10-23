import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  Bi as r,
  Br as i,
  Fa as a,
  Fn as o,
  Hr as s,
  Po as c,
  Ur as l,
  _n as u,
  fi as d,
  kn as f,
  la as p,
  oa as m,
  qt as h,
  zr as g,
} from './vendor.DMhDOqx5.js';
import { f as _, m as v, u as y } from './routing.CgoqFSAd.js';
import { r as b } from './query-devtools.DIz6FZCX.js';
import {
  Ba as x,
  Dc as S,
  Dh as C,
  Dp as w,
  Eu as T,
  Gg as E,
  Wu as D,
  Xh as O,
  Xn as k,
  bl as A,
  cn as ee,
  ds as j,
  gf as M,
  np as N,
  ps as P,
  qh as F,
  rh as I,
  s_ as te,
  sh as L,
  tf as ne,
  tm as R,
  vm as z,
  wl as re,
} from './hooks.wwWU0zYC.js';
import { i as B, n as ie, r as V, t as H } from './virtualization.B_GnC4Bm.js';
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
} from './ProjectEditDialog.wWnItqBu.js';
import { r as se } from './utilities.HUTk6tC6.js';
var Z = e(t(), 1),
  Q = n();
function ce({ onCreate: e }) {
  let t = j(),
    n = F(`(max-width: 768px)`);
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
        (0, Q.jsxs)(w, {
          type: `button`,
          variant: `default`,
          size: `sm`,
          onClick: e,
          className: `shrink-0`,
          children: [
            (0, Q.jsx)(f, { className: `h-4 w-4`, 'aria-hidden': `true` }),
            t(`com_ui_new_project`),
          ],
        }),
      ],
    }),
  });
}
function le(e, t) {
  return function ({ className: n, ...i }) {
    return (0, Q.jsxs)(`div`, {
      ...i,
      className: D(n, `justify-between gap-5`),
      children: [
        (0, Q.jsx)(`span`, { className: `truncate`, children: e }),
        t
          ? (0, Q.jsx)(r, {
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
  let r = j(),
    i = (0, Z.useId)(),
    [s, c] = (0, Z.useState)(!1),
    [l, u] = (0, Z.useState)(!1),
    [f, p] = (0, Z.useState)(!1),
    m = de(e),
    _ = (0, Z.useMemo)(
      () => [
        {
          id: `${i}-edit`,
          label: r(`com_ui_edit_project`),
          icon: (0, Q.jsx)(o, { className: `size-4 text-text-secondary`, 'aria-hidden': `true` }),
          onClick: () => u(!0),
        },
        {
          id: `${i}-delete`,
          label: r(`com_ui_delete`),
          icon: (0, Q.jsx)(h, { className: `size-4 text-text-secondary`, 'aria-hidden': `true` }),
          onClick: () => p(!0),
        },
      ],
      [r, i],
    );
  return (0, Q.jsxs)(`article`, {
    className: D(
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
            children: (0, Q.jsx)(g, { className: `h-5 w-5`, 'aria-hidden': `true` }),
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
              m
                ? (0, Q.jsxs)(Q.Fragment, {
                    children: [
                      (0, Q.jsx)(`span`, { 'aria-hidden': `true`, children: `·` }),
                      (0, Q.jsx)(`time`, {
                        dateTime: e.lastConversationAt ?? e.updatedAt ?? e.createdAt,
                        children: m,
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
        children: (0, Q.jsx)(R, {
          portal: !0,
          focusLoop: !0,
          unmountOnHide: !0,
          menuId: i,
          isOpen: s,
          setIsOpen: c,
          className: `z-[125] min-w-44`,
          iconClassName: `mr-2 text-text-secondary`,
          trigger: (0, Q.jsx)(a, {
            'aria-label': r(`com_ui_more_options`),
            className: D(
              `flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary outline-none transition-colors`,
              `hover:bg-surface-tertiary hover:text-text-primary`,
              `focus-visible:ring-2 focus-visible:ring-text-primary`,
              s && `bg-surface-tertiary text-text-primary`,
            ),
            children: (0, Q.jsx)(d, { className: `h-4 w-4`, 'aria-hidden': `true` }),
          }),
          items: _,
        }),
      }),
      (0, Q.jsx)(Y, { open: l, onOpenChange: u, project: e }),
      (0, Q.jsx)(K, { open: f, onOpenChange: p, project: e }),
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
            (0, Q.jsx)(I, { className: `h-11 w-11 rounded-xl` }),
            (0, Q.jsx)(I, { className: `mt-3 h-5 w-2/3` }),
            (0, Q.jsx)(I, { className: `mt-2 h-4 w-full` }),
            (0, Q.jsx)(I, { className: `mt-auto h-3 w-24` }),
          ],
        },
        t,
      ),
    ),
  });
}
function me() {
  let e = j(),
    t = y(),
    [n, r] = v(),
    [i, o] = (0, Z.useState)(``),
    [c, l] = (0, Z.useState)(`lastConversationAt`),
    [d, f] = (0, Z.useState)(n.get(`new`) === `1`),
    p = (0, Z.useId)(),
    [h, g] = (0, Z.useState)(!1),
    _ = (0, Z.useDeferredValue)(i),
    {
      data: b,
      fetchNextPage: x,
      isFetchingNextPage: S,
      isLoading: C,
    } = oe({ search: _ || void 0, sortBy: c, sortDirection: c === `name` ? `asc` : `desc` }),
    T = (0, Z.useMemo)(() => b?.pages.flatMap((e) => e.projects) ?? [], [b?.pages]),
    E = b?.pages[b.pages.length - 1]?.nextCursor != null,
    O = (0, Z.useMemo)(
      () => [
        { value: `lastConversationAt`, label: e(`com_ui_latest_activity`) },
        { value: `createdAt`, label: e(`com_ui_sort_created`) },
        { value: `name`, label: e(`com_ui_name`) },
      ],
      [e],
    ),
    k = O.find((e) => e.value === c)?.label ?? e(`com_ui_latest_activity`),
    A = (0, Z.useMemo)(
      () =>
        O.map((e) => {
          let t = c === e.value;
          return {
            id: `project-sort-${e.value}`,
            ariaLabel: e.label,
            ariaChecked: t,
            onClick: () => l(e.value),
            render: le(e.label, t),
          };
        }),
      [c, O],
    ),
    ee = ue(T.length, E, e);
  return (
    (0, Z.useEffect)(() => {
      n.get(`new`) === `1` && f(!0);
    }, [n]),
    (0, Q.jsxs)(`main`, {
      className: `flex h-full min-h-0 flex-col overflow-auto bg-presentation text-text-primary`,
      children: [
        (0, Q.jsx)(ce, { onCreate: () => f(!0) }),
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
                    (0, Q.jsx)(u, {
                      className: `pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary`,
                      'aria-hidden': `true`,
                    }),
                    (0, Q.jsx)(z, {
                      value: i,
                      onChange: (e) => o(e.target.value),
                      placeholder: e(`com_ui_search_projects`),
                      className: `h-11 rounded-xl bg-surface-secondary pl-10`,
                    }),
                  ],
                }),
                (0, Q.jsx)(R, {
                  portal: !0,
                  focusLoop: !0,
                  unmountOnHide: !0,
                  menuId: p,
                  isOpen: h,
                  setIsOpen: g,
                  className: `z-[125] min-w-56`,
                  trigger: (0, Q.jsxs)(a, {
                    'aria-label': e(`com_ui_sort_projects_by`),
                    className: D(
                      `inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors`,
                      `hover:bg-surface-hover hover:text-text-primary`,
                      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                      h && `bg-surface-hover text-text-primary`,
                    ),
                    children: [
                      (0, Q.jsx)(m, { className: `h-4 w-4 shrink-0`, 'aria-hidden': `true` }),
                      (0, Q.jsx)(`span`, { className: `truncate`, children: k }),
                    ],
                  }),
                  items: A,
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
                !C && T.length > 0
                  ? (0, Q.jsx)(`p`, {
                      className: `text-sm tabular-nums text-text-secondary`,
                      children: ee,
                    })
                  : null,
              ],
            }),
            (0, Q.jsx)(J, {
              open: d,
              onOpenChange: (e) => {
                if ((f(e), !e && n.get(`new`) === `1`)) {
                  let e = new URLSearchParams(n);
                  (e.delete(`new`), r(e, { replace: !0 }));
                }
              },
              onCreated: (e) => t(`/projects/${e._id}`),
            }),
            (0, Q.jsxs)(`div`, {
              className: `mt-4 flex flex-1 flex-col`,
              children: [
                C && (0, Q.jsx)(pe, {}),
                !C &&
                  T.length > 0 &&
                  (0, Q.jsx)(`div`, {
                    className: `grid gap-3 sm:grid-cols-2 xl:grid-cols-3`,
                    children: T.map((e, n) =>
                      (0, Q.jsx)(
                        fe,
                        { project: e, index: n, onOpen: (e) => t(`/projects/${e}`) },
                        e._id,
                      ),
                    ),
                  }),
                !C &&
                  T.length === 0 &&
                  (0, Q.jsxs)(`div`, {
                    className: `flex flex-1 flex-col items-center justify-center rounded-2xl bg-surface-secondary px-6 py-16 text-center`,
                    children: [
                      (0, Q.jsx)(`span`, {
                        className: `flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary text-text-secondary`,
                        children: (0, Q.jsx)(s, { className: `h-7 w-7`, 'aria-hidden': `true` }),
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
                              (0, Q.jsxs)(w, {
                                type: `button`,
                                variant: `default`,
                                size: `sm`,
                                className: `mt-5`,
                                onClick: () => f(!0),
                                children: [
                                  (0, Q.jsx)(s, { className: `h-4 w-4`, 'aria-hidden': `true` }),
                                  e(`com_ui_new_project`),
                                ],
                              }),
                            ],
                          }),
                    ],
                  }),
              ],
            }),
            E &&
              (0, Q.jsx)(w, {
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
  let r = j(),
    { showToast: o } = O(),
    s = (0, Z.useId)(),
    c = (0, Z.useRef)(null),
    [u, f] = (0, Z.useState)(!1),
    [p, m] = (0, Z.useState)(!1),
    g = e.conversationId ?? ``,
    _ = e.chatProjectId ?? null,
    v = re(),
    y = (0, Z.useMemo)(
      () =>
        g
          ? [
              {
                label: r(`com_ui_change_project`),
                onClick: () => m(!0),
                icon: (0, Q.jsx)(l, {
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
                          o({
                            message: r(`com_ui_project_updated`),
                            severity: N.SUCCESS,
                            showIcon: !0,
                          }));
                      },
                      onError: () => {
                        o({
                          message: r(`com_ui_project_update_error`),
                          severity: N.ERROR,
                          showIcon: !0,
                        });
                      },
                    },
                  );
                },
                hideOnClick: !1,
                icon: v.isLoading
                  ? (0, Q.jsx)(L, { className: `size-4` })
                  : (0, Q.jsx)(i, {
                      className: `size-4 text-text-secondary`,
                      'aria-hidden': `true`,
                    }),
              },
              {
                label: r(`com_ui_delete`),
                onClick: () => f(!0),
                hideOnClick: !1,
                render: (e) => (0, Q.jsx)(`button`, { ...e }),
                icon: (0, Q.jsx)(h, {
                  className: `size-4 text-text-secondary`,
                  'aria-hidden': `true`,
                }),
              },
            ]
          : [],
      [v, _, g, r, n, o],
    );
  return (0, Q.jsxs)(Q.Fragment, {
    children: [
      (0, Q.jsx)(R, {
        portal: !0,
        focusLoop: !0,
        unmountOnHide: !0,
        menuId: s,
        isOpen: t,
        setIsOpen: n,
        className: `z-[125] min-w-44`,
        iconClassName: `mr-2 text-text-secondary`,
        trigger: (0, Q.jsx)(a, {
          ref: c,
          'aria-label': r(`com_nav_convo_menu_options`),
          className: D(
            `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none transition-colors`,
            `hover:bg-surface-hover hover:text-text-primary`,
            `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary`,
            t && `bg-surface-hover text-text-primary`,
          ),
          children: (0, Q.jsx)(d, { className: `h-4 w-4`, 'aria-hidden': `true` }),
        }),
        items: y,
      }),
      p
        ? (0, Q.jsx)(G, {
            conversationId: g,
            chatProjectId: _,
            setMenuOpen: n,
            triggerRef: c,
            showProjectDialog: p,
            setShowProjectDialog: m,
          })
        : null,
      u
        ? (0, Q.jsx)(X, {
            title: e.title ?? ``,
            retainView: ge,
            triggerRef: c,
            setMenuOpen: n,
            showDeleteDialog: u,
            conversationId: g,
            setShowDeleteDialog: f,
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
  let e = j();
  return (0, Q.jsxs)(`div`, {
    className: `flex items-center justify-center gap-2 py-4 text-sm text-text-secondary`,
    children: [
      (0, Q.jsx)(L, { className: `text-text-primary` }),
      (0, Q.jsx)(`span`, { children: e(`com_ui_loading`) }),
    ],
  });
});
ye.displayName = `ProjectWorkspaceLoadingRow`;
var be = (0, Z.memo)(
  ({ conversation: e, isGenerating: t }) => {
    let { navigateToConvo: n } = P(),
      r = j(),
      i = k(),
      a = e.conversationId ?? ``,
      o = e.title || r(`com_ui_untitled`),
      s = e.updatedAt || e.createdAt,
      c = s ? new Date(s).toLocaleString(void 0, { hour12: i }) : ``,
      [l, u] = (0, Z.useState)(!1);
    return (0, Q.jsxs)(`article`, {
      className: D(
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
              ? (0, Q.jsx)(L, {
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
    let { data: s } = A(),
      c = (0, Z.useMemo)(() => new Set(s?.activeJobIds ?? []), [s?.activeJobIds]),
      l = (0, Z.useMemo)(() => {
        if (t) return [{ type: `loading` }];
        if (!e.length) return [{ type: `empty` }];
        let r = [];
        return (
          M(e, { field: i }).forEach(([e, t]) => {
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
  return function ({ className: n, ...i }) {
    return (0, Q.jsxs)(`div`, {
      ...i,
      className: D(n, `justify-between gap-5`),
      children: [
        (0, Q.jsx)(`span`, { className: `truncate`, children: e }),
        t
          ? (0, Q.jsx)(r, {
              className: `h-4 w-4 shrink-0 text-text-primary`,
              'aria-hidden': `true`,
            })
          : (0, Q.jsx)(`span`, { className: `h-4 w-4 shrink-0`, 'aria-hidden': `true` }),
      ],
    });
  };
}
function Ce() {
  let e = j(),
    t = y(),
    n = b(),
    { projectId: r = `` } = _(),
    [i, s] = (0, Z.useState)(`updatedAt`),
    [l, u] = (0, Z.useState)(!1),
    [d, v] = (0, Z.useState)(!1),
    O = (0, Z.useId)(),
    [k, A] = (0, Z.useState)(!1),
    { data: M, isLoading: N } = ae(r),
    P = c(T.conversationByIndex(0)),
    { newConversation: I } = ee(),
    z = M?._id,
    re = F(`(max-width: 768px)`),
    B = (0, Z.useMemo)(
      () => [
        { value: `updatedAt`, label: e(`com_ui_sort_updated`) },
        { value: `createdAt`, label: e(`com_ui_sort_created`) },
      ],
      [e],
    ),
    ie = B.find((e) => e.value === i)?.label ?? e(`com_ui_sort_updated`),
    V = (0, Z.useMemo)(
      () =>
        B.map((e) => {
          let t = i === e.value;
          return {
            id: `project-chat-sort-${e.value}`,
            ariaLabel: e.label,
            ariaChecked: t,
            onClick: () => s(e.value),
            render: Se(e.label, t),
          };
        }),
      [i, B],
    ),
    {
      data: H,
      fetchNextPage: U,
      isFetchingNextPage: W,
      isLoading: G,
    } = S(
      { projectId: z, sortBy: i, sortDirection: `desc` },
      { enabled: !!z, staleTime: 3e4, cacheTime: 3e5 },
    ),
    q = (0, Z.useMemo)(() => H?.pages.flatMap((e) => e.conversations) ?? [], [H?.pages]),
    J = (0, Z.useMemo)(() => {
      let e = H?.pages;
      return e?.length ? e[e.length - 1].nextCursor !== null : !1;
    }, [H?.pages]),
    X = (0, Z.useCallback)(() => {
      z &&
        (ne(n, P?.conversationId),
        n.invalidateQueries([te.messages]),
        t(`/c/${E.NEW_CONVO}?projectId=${encodeURIComponent(z)}`),
        I({ template: { chatProjectId: z } }));
    }, [z, P?.conversationId, t, I, n]);
  return N
    ? (0, Q.jsx)(`div`, {
        className: `flex h-full items-center justify-center bg-presentation`,
        children: (0, Q.jsx)(L, { className: `text-text-primary` }),
      })
    : M
      ? (0, Q.jsxs)(`main`, {
          className: `flex h-full min-h-0 flex-col overflow-y-auto bg-presentation text-text-primary`,
          children: [
            (0, Q.jsx)(`header`, {
              className: `sticky top-0 z-10 border-b border-border-light bg-presentation`,
              children: (0, Q.jsxs)(`div`, {
                className: `mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 md:h-16 md:px-6`,
                children: [
                  re ? (0, Q.jsx)(x, { className: `size-9 shrink-0` }) : null,
                  (0, Q.jsxs)(w, {
                    type: `button`,
                    variant: `ghost`,
                    size: `sm`,
                    onClick: () => t(`/projects`),
                    className: `-ml-1.5 text-text-secondary hover:text-text-primary`,
                    children: [
                      (0, Q.jsx)(p, { className: `h-4 w-4`, 'aria-hidden': `true` }),
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
                      children: (0, Q.jsx)(g, { className: `h-6 w-6`, 'aria-hidden': `true` }),
                    }),
                    (0, Q.jsxs)(`div`, {
                      className: `min-w-0 flex-1 pt-0.5`,
                      children: [
                        (0, Q.jsx)(`h1`, {
                          className: `truncate text-balance text-2xl font-semibold tracking-tight text-text-primary`,
                          children: M.name,
                        }),
                        M.description
                          ? (0, Q.jsx)(`p`, {
                              className: `mt-1 text-pretty text-sm leading-relaxed text-text-secondary`,
                              children: M.description,
                            })
                          : (0, Q.jsx)(`button`, {
                              type: `button`,
                              onClick: () => u(!0),
                              className: `mt-1 text-sm text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                              children: e(`com_ui_add_description`),
                            }),
                      ],
                    }),
                    (0, Q.jsxs)(`div`, {
                      className: `flex shrink-0 items-center gap-0.5 pt-1`,
                      children: [
                        (0, Q.jsx)(C, {
                          description: e(`com_ui_edit_project`),
                          render: (0, Q.jsx)(w, {
                            type: `button`,
                            variant: `ghost`,
                            size: `icon`,
                            className: `size-8 shrink-0 text-text-secondary hover:text-text-primary`,
                            'aria-label': e(`com_ui_edit_project`),
                            onClick: () => u(!0),
                            children: (0, Q.jsx)(o, {
                              className: `h-4 w-4`,
                              'aria-hidden': `true`,
                            }),
                          }),
                        }),
                        (0, Q.jsx)(C, {
                          description: e(`com_ui_delete_project_action`),
                          render: (0, Q.jsx)(w, {
                            type: `button`,
                            variant: `ghost`,
                            size: `icon`,
                            className: `size-8 shrink-0 text-text-secondary hover:text-text-destructive`,
                            'aria-label': e(`com_ui_delete_project_action`),
                            onClick: () => v(!0),
                            children: (0, Q.jsx)(h, {
                              className: `h-4 w-4`,
                              'aria-hidden': `true`,
                            }),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, Q.jsx)(Y, { open: l, onOpenChange: u, project: M }),
                (0, Q.jsx)(K, { open: d, onOpenChange: v, project: M }),
                (0, Q.jsxs)(`button`, {
                  type: `button`,
                  onClick: X,
                  className: D(
                    `mt-7 flex w-full items-center gap-3 rounded-2xl border border-border-light bg-surface-secondary px-3.5 py-3 text-left`,
                    `transition-colors duration-150 hover:bg-surface-hover`,
                    `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                  ),
                  'aria-label': e(`com_ui_new_chat_in_project`, { name: M.name }),
                  children: [
                    (0, Q.jsx)(`span`, {
                      className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary text-text-primary`,
                      children: (0, Q.jsx)(f, { className: `h-4 w-4`, 'aria-hidden': `true` }),
                    }),
                    (0, Q.jsx)(`span`, {
                      className: `min-w-0 flex-1 truncate text-sm text-text-primary`,
                      children: e(`com_ui_new_chat_in_project`, { name: M.name }),
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
                              children: M.conversationCount,
                            }),
                          ],
                        }),
                        (0, Q.jsx)(R, {
                          portal: !0,
                          focusLoop: !0,
                          unmountOnHide: !0,
                          menuId: O,
                          isOpen: k,
                          setIsOpen: A,
                          className: `z-[125] min-w-44`,
                          trigger: (0, Q.jsxs)(a, {
                            'aria-label': e(`com_ui_sort_chats_by`),
                            className: D(
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
                      sortBy: i,
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
            (0, Q.jsx)(w, {
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
