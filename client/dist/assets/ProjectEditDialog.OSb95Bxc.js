import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  Bi as r,
  Br as i,
  Fn as a,
  Fo as o,
  Ia as s,
  Kt as c,
  Ln as l,
  Nt as u,
  On as d,
  Pn as f,
  Sn as p,
  Tt as m,
  Vi as h,
  Vr as g,
  Wr as _,
  dn as v,
  fn as y,
  ha as b,
  ma as x,
  mr as S,
  pi as C,
  pr as w,
  wt as T,
  xi as E,
  zt as D,
} from './vendor.BQmuAj0u.js';
import { n as O } from './i18n.CenFdT2j.js';
import { a as ee, s as k } from './react-interactions.BEfrmSAG.js';
import { c as A, f as te, u as ne } from './routing.CgoqFSAd.js';
import { r as j } from './query-devtools.DIz6FZCX.js';
import { m as re, v as M } from './tanstack-vendor.2R6Ja_-H.js';
import {
  $h as N,
  Ah as P,
  Ao as F,
  Ap as I,
  As as ie,
  Bc as ae,
  Bp as L,
  Cl as R,
  Dl as z,
  Dm as B,
  Du as oe,
  E_ as se,
  El as ce,
  Fm as V,
  Gp as H,
  Hc as le,
  Hl as U,
  I as ue,
  Jg as W,
  Jp as G,
  Kp as K,
  L as de,
  Lc as fe,
  Lh as pe,
  Ln as me,
  M_ as he,
  Oo as ge,
  Qp as q,
  R as _e,
  S as ve,
  Sn as ye,
  Su as be,
  Tl as xe,
  Uc as Se,
  Vc as Ce,
  Wl as we,
  Xh as Te,
  Xp as Ee,
  Yu as De,
  ac as Oe,
  am as ke,
  ap as J,
  bc as Ae,
  bh as je,
  bl as Me,
  bm as Ne,
  c_ as Pe,
  cc as Fe,
  cn as Ie,
  dc as Le,
  ds as Y,
  f_ as Re,
  ga as ze,
  hs as Be,
  ig as Ve,
  im as He,
  mc as Ue,
  na as We,
  nc as Ge,
  ph as Ke,
  ps as qe,
  qp as Je,
  qu as X,
  r_ as Ye,
  rg as Xe,
  rp as Ze,
  u_ as Qe,
  uc as $e,
  uh as Z,
  wl as et,
  xm as tt,
  xs as nt,
  xu as rt,
  yc as it,
  yf as at,
  yt as ot,
  zc as st,
} from './hooks.DHfa_SP2.js';
import { n as ct, r as lt, t as ut } from './virtualization.xxcvniXr.js';
import { r as dt } from './utilities.HUTk6tC6.js';
import { t as ft } from './security-ui.B17a9jwF.js';
var pt = (e) => {
    let t = se();
    return new URL(`${t}/share/${e}`, window.location.origin).toString();
  },
  mt = (e = {}, t) => {
    let { sortBy: n, sortDirection: r, search: i, limit: a } = e;
    return re({
      queryKey: [Qe.projects, { sortBy: n, sortDirection: r, search: i, limit: a }],
      queryFn: ({ pageParam: e }) =>
        he.listProjects({
          sortBy: n,
          sortDirection: r,
          search: i,
          limit: a,
          cursor: e?.toString(),
        }),
      getNextPageParam: (e) => e?.nextCursor ?? void 0,
      keepPreviousData: !0,
      staleTime: 3e5,
      cacheTime: 18e5,
      ...t,
    });
  },
  ht = (e, t) =>
    M([Qe.project, e], () => he.getProjectById(e ?? ``), {
      enabled: !!e,
      refetchOnWindowFocus: !1,
      refetchOnReconnect: !1,
      refetchOnMount: !1,
      ...t,
    }),
  gt = e(dt(), 1),
  Q = e(t(), 1),
  _t = `conversation-item`,
  vt = !1,
  yt = () => {
    vt = !1;
  },
  bt = () => {
    vt = !0;
  },
  xt = () => {
    vt = !1;
  },
  St = () => vt,
  Ct = () => {
    let e = j();
    return (0, Q.useCallback)(
      (t) => {
        if (!t.conversationId) return t.chatProjectId;
        let n = R(t.conversationId);
        if (n) return n.projectId;
        let r = e.getQueryData([Qe.conversation, t.conversationId]);
        return r ? (r.chatProjectId ?? null) : t.chatProjectId;
      },
      [e],
    );
  },
  wt = () => {
    let e = Y(),
      { showToast: t } = N(),
      n = et();
    return (0, Q.useCallback)(
      (r, i) => {
        let a = r.conversationId;
        return a
          ? n.mutateAsync({ conversationId: a, projectId: i }).then(
              (n) => (
                n.previousProjectId !== n.projectId &&
                  t({ message: e(`com_ui_project_updated`), severity: J.SUCCESS, showIcon: !0 }),
                !0
              ),
              () => (
                t({ message: e(`com_ui_project_update_error`), severity: J.ERROR, showIcon: !0 }),
                !1
              ),
            )
          : Promise.resolve(!1);
      },
      [n, e, t],
    );
  },
  Tt = () => {
    let e = Y(),
      { showToast: t } = N(),
      n = Ue();
    return (0, Q.useCallback)(
      (r) => {
        let i = r.conversationId;
        !i ||
          r.pinned !== !0 ||
          n.mutate(
            { conversationId: i, pinned: !1 },
            {
              onError: () =>
                t({ message: e(`com_ui_unpin_error`), severity: J.ERROR, showIcon: !0 }),
            },
          );
      },
      [n, e, t],
    );
  },
  Et = ({ dragIndex: e, hoverIndex: t, pointerY: n, hoverTop: r, hoverBottom: i }) => {
    if (e < 0 || t < 0 || e === t) return !1;
    let a = (i - r) / 2,
      o = n - r;
    return e < t ? o >= a : o <= a;
  },
  Dt = (e) => (e.startsWith(`convo:`) ? `convo` : `favorite`),
  Ot = (e, t) => {
    let n = new Set(t);
    return [`favorite`, `convo`].flatMap((r) => {
      let i = e.filter((e) => Dt(e) === r),
        a = t.filter((e) => Dt(e) === r),
        o = [],
        s = 0;
      for (let e of i) {
        if (!n.has(e)) {
          o.push(e);
          continue;
        }
        s < a.length && (o.push(a[s]), (s += 1));
      }
      for (; s < a.length; s += 1) o.push(a[s]);
      return o;
    });
  },
  kt = `com_ui_running_chats`;
function At(e, t, n) {
  if (n.includePinned || n.field !== `updatedAt` || n.direction !== `desc` || t.size === 0)
    return e;
  let r = [],
    i = [];
  for (let [n, a] of e) {
    let e = [];
    for (let n of a) {
      let i = n.conversationId;
      i && t.has(i) ? r.push(n) : e.push(n);
    }
    e.length > 0 && i.push([n, e]);
  }
  return r.length === 0 ? e : [[kt, r], ...i];
}
function jt(e, t) {
  return (
    e.endpoint === t.endpoint &&
    e.endpointType === t.endpointType &&
    e.iconURL === t.iconURL &&
    e.model === t.model &&
    e.modelLabel === t.modelLabel &&
    e.chatGptLabel === t.chatGptLabel &&
    e.spec === t.spec &&
    e.agent_id === t.agent_id &&
    e.assistant_id === t.assistant_id
  );
}
function Mt(e, t) {
  return (
    jt(e, t) &&
    e.conversationId === t.conversationId &&
    e.title === t.title &&
    e.chatProjectId === t.chatProjectId &&
    e.pinned === t.pinned &&
    e.isArchived === t.isArchived &&
    e.isShared === t.isShared &&
    e.createdAt === t.createdAt &&
    e.updatedAt === t.updatedAt
  );
}
function Nt(e, t) {
  return (
    Mt(e.conversation, t.conversation) &&
    e.isGenerating === t.isGenerating &&
    e.keyShortcuts === t.keyShortcuts
  );
}
var $ = n(),
  Pt = {};
function Ft({ conversation: e, className: t, context: n = `menu-item`, size: r = 20 }) {
  let { data: i = Pt } = U(),
    a = Be(),
    o = F();
  return (0, $.jsx)(We, {
    conversation: e,
    endpointsConfig: i,
    assistantMap: o,
    agentsMap: a,
    className: t,
    size: r,
    context: n,
  });
}
var It = (0, Q.memo)(
    Ft,
    (e, t) =>
      e.className === t.className &&
      e.context === t.context &&
      e.size === t.size &&
      jt(e.conversation, t.conversation),
  ),
  Lt = `[data-testid="convo-item"],[data-testid="favorite-item"]`,
  Rt = [
    `[data-testid="new-chat-button"]`,
    `[data-testid="nav-new-chat-fab"]`,
    `[data-testid="header-new-chat-button"]`,
  ],
  zt = () => {
    for (let e of Rt) {
      let t = document.querySelector(e);
      if (t) return t;
    }
    return null;
  },
  Bt = (e) =>
    e.matches(`a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])`)
      ? e
      : e.querySelector(`a[href],button:not([disabled])`),
  Vt = (e) => {
    let t = e?.closest(`[data-pinned-section]`);
    if (e && t) {
      let n = Array.from(t.querySelectorAll(Lt)),
        r = n.indexOf(e),
        i = n[r + 1] ?? n[r - 1],
        a = i ? Bt(i) : null;
      if (a) return a;
    }
    return t ? zt() : null;
  },
  Ht = (e) => (e ? Bt(e) : null),
  Ut = (e) => {
    let t = e?.querySelector(Lt) ?? null,
      n = (t && Bt(t)) ?? zt();
    return (n?.focus(), n != null && document.activeElement === n);
  };
function Wt({
  setShowDeleteDialog: e,
  conversationId: t,
  currentConversationId: n,
  setMenuOpen: r,
  retainView: i,
  title: a,
}) {
  let o = Y(),
    s = ne(),
    c = j(),
    { showToast: l } = N(),
    { newConversation: u } = Ie(),
    { conversationId: d } = te(),
    f = n ?? d,
    p = Fe({
      onSuccess: () => {
        (e(!1),
          (f === t || f === `new`) && (u(), s(`/c/new`, { replace: !0 })),
          r?.(!1),
          i(),
          l({ message: o(`com_ui_convo_delete_success`), severity: J.SUCCESS, showIcon: !0 }));
      },
      onError: () => {
        l({ message: o(`com_ui_convo_delete_error`), severity: J.ERROR, showIcon: !0 });
      },
    }),
    m = (0, Q.useCallback)(() => {
      let e = c.getQueryData([Qe.messages, t]),
        n = e?.[e.length - 1]?.thread_id,
        r = e?.[e.length - 1]?.endpoint;
      p.mutate({ conversationId: t, thread_id: n, endpoint: r, source: `button` });
    }, [t, p, c]);
  return (0, $.jsxs)(Je, {
    className: `w-11/12 max-w-md`,
    showCloseButton: !1,
    'aria-describedby': `delete-conversation-description`,
    children: [
      (0, $.jsx)(Ee, { children: (0, $.jsx)(q, { children: o(`com_ui_delete_conversation`) }) }),
      (0, $.jsx)(`div`, {
        id: `delete-conversation-description`,
        className: `w-full truncate`,
        children: (0, $.jsx)(O, {
          i18nKey: `com_ui_delete_confirm_strong`,
          values: { title: a },
          components: { strong: (0, $.jsx)(`strong`, {}) },
        }),
      }),
      (0, $.jsxs)(`div`, {
        className: `flex justify-end gap-4 pt-4`,
        children: [
          (0, $.jsx)(K, {
            asChild: !0,
            children: (0, $.jsx)(I, {
              'aria-label': `cancel`,
              variant: `outline`,
              children: o(`com_ui_cancel`),
            }),
          }),
          (0, $.jsx)(I, {
            variant: `destructive`,
            onClick: m,
            disabled: p.isLoading,
            children: p.isLoading ? (0, $.jsx)(Z, {}) : o(`com_ui_delete`),
          }),
        ],
      }),
    ],
  });
}
function Gt({
  conversationId: e,
  currentConversationId: t,
  retainView: n,
  title: r,
  setMenuOpen: i,
  showDeleteDialog: a,
  setShowDeleteDialog: o,
  triggerRef: s,
}) {
  return a === void 0 || o === void 0 || !e
    ? null
    : (0, $.jsx)(H, {
        open: a,
        onOpenChange: o,
        triggerRef: s,
        children: (0, $.jsx)(Wt, {
          setShowDeleteDialog: o,
          conversationId: e,
          currentConversationId: t,
          setMenuOpen: i,
          retainView: n,
          title: r,
        }),
      });
}
function Kt({ conversationId: e, chatProjectId: t, setMenuOpen: n, setShowProjectDialog: r }) {
  let a = Y(),
    { showToast: o } = N(),
    [s, c] = (0, Q.useState)(t ?? ``),
    l = et(),
    {
      data: u,
      fetchNextPage: d,
      isFetchingNextPage: f,
    } = mt({ sortBy: `name`, sortDirection: `asc`, limit: 100 }),
    p = (0, Q.useMemo)(() => u?.pages.flatMap((e) => e.projects) ?? [], [u?.pages]),
    m = u?.pages[u.pages.length - 1]?.nextCursor != null,
    h = p.find((e) => e._id === s),
    g = (0, Q.useMemo)(
      () =>
        p.map((e) => ({
          label: e.name,
          value: e._id,
          icon: (0, $.jsx)(i, { className: `h-4 w-4 text-text-secondary`, 'aria-hidden': `true` }),
        })),
      [p],
    ),
    _ = !!s && s !== (t ?? ``) && !l.isLoading;
  return (0, $.jsxs)(Je, {
    id: `project-conversation-dialog`,
    className: `w-11/12 max-w-md overflow-visible`,
    showCloseButton: !1,
    children: [
      (0, $.jsx)(Ee, { children: (0, $.jsx)(q, { children: a(`com_ui_change_project`) }) }),
      (0, $.jsxs)(`div`, {
        className: `flex flex-col gap-2`,
        children: [
          (0, $.jsx)(B, {
            htmlFor: `change-project-select`,
            className: `text-sm font-medium text-text-primary`,
            children: a(`com_ui_select_project`),
          }),
          (0, $.jsx)(L, {
            selectId: `change-project-select`,
            selectedValue: s,
            displayValue: h?.name,
            items: g,
            setValue: c,
            SelectIcon: (0, $.jsx)(i, {
              className: `h-4 w-4 text-text-secondary`,
              'aria-hidden': `true`,
            }),
            ariaLabel: a(`com_ui_select_project`),
            searchPlaceholder: a(`com_ui_search_projects`),
            selectPlaceholder: a(`com_ui_select_project`),
            isCollapsed: !1,
            showCarat: !0,
            placement: `bottom-start`,
            portal: !1,
            matchTriggerWidth: !0,
            containerClassName: `w-full px-0`,
            className: `h-10 w-full justify-start gap-2 rounded-xl border border-border-light bg-surface-tertiary px-3 text-sm text-text-primary hover:bg-surface-hover`,
          }),
          m
            ? (0, $.jsx)(I, {
                type: `button`,
                variant: `link`,
                className: `h-auto justify-start px-0 text-sm`,
                onClick: () => d(),
                disabled: f,
                children: a(f ? `com_ui_loading` : `com_ui_load_more`),
              })
            : null,
        ],
      }),
      (0, $.jsxs)(`div`, {
        className: `flex justify-end gap-2 pt-4`,
        children: [
          (0, $.jsx)(K, {
            asChild: !0,
            children: (0, $.jsx)(I, {
              type: `button`,
              variant: `outline`,
              children: a(`com_ui_cancel`),
            }),
          }),
          (0, $.jsx)(I, {
            type: `button`,
            variant: `submit`,
            onClick: () => {
              _ &&
                l.mutate(
                  { conversationId: e, projectId: s },
                  {
                    onSuccess: () => {
                      (r(!1),
                        n?.(!1),
                        o({
                          message: a(`com_ui_project_updated`),
                          severity: J.SUCCESS,
                          showIcon: !0,
                        }));
                    },
                    onError: () => {
                      o({
                        message: a(`com_ui_project_update_error`),
                        severity: J.ERROR,
                        showIcon: !0,
                      });
                    },
                  },
                );
            },
            disabled: !_,
            children: l.isLoading ? (0, $.jsx)(Z, {}) : a(`com_ui_save`),
          }),
        ],
      }),
    ],
  });
}
function qt({
  conversationId: e,
  chatProjectId: t,
  setMenuOpen: n,
  showProjectDialog: r,
  setShowProjectDialog: i,
  triggerRef: a,
}) {
  return r === void 0 || i === void 0 || !e
    ? null
    : (0, $.jsx)(H, {
        open: r,
        onOpenChange: i,
        triggerRef: a,
        children: (0, $.jsx)(Kt, {
          conversationId: e,
          chatProjectId: t,
          setMenuOpen: n,
          setShowProjectDialog: i,
        }),
      });
}
function Jt({ sharedLink: e }) {
  let t = Y(),
    { announcePolite: n } = ge(),
    [r, i] = (0, Q.useState)(!1),
    a = ot({ text: e });
  return (0, $.jsxs)(`div`, {
    className: `relative`,
    children: [
      (0, $.jsx)(tt, {
        type: `text`,
        readOnly: !0,
        dir: `ltr`,
        value: e,
        'aria-label': t(`com_ui_shared_link`),
        onFocus: (e) => e.currentTarget.select(),
        className: `h-11 rounded-xl bg-surface-secondary pr-12 text-right text-sm text-text-primary`,
        'data-testid': `shared-link-url`,
      }),
      (0, $.jsx)(ze, {
        iconOnly: !0,
        isCopied: r,
        label: t(`com_ui_copy_link`),
        copiedLabel: t(`com_ui_copied`),
        onClick: () => {
          r || (a(i) && n({ message: t(`com_ui_link_copied`), isStatus: !0 }));
        },
        className: `absolute right-1.5 top-1/2 size-8 -translate-y-1/2`,
      }),
    ],
  });
}
var Yt = (e) => {
    if (typeof e != `object` || !e) return;
    let t = `code` in e ? e.code : void 0;
    if (t === `TARGET_MESSAGE_NOT_FOUND` || t === `NO_MESSAGES`) return t;
    if (!(`response` in e) || e.response == null || typeof e.response != `object`) return;
    let n = `data` in e.response ? e.response.data : void 0;
    if (!(typeof n != `object` || !n || !(`code` in n)))
      return n.code === `TARGET_MESSAGE_NOT_FOUND` || n.code === `NO_MESSAGES` ? n.code : void 0;
  },
  Xt = async (e, t) => {
    try {
      return await t(await e());
    } catch (e) {
      let t = Yt(e);
      if (t !== `TARGET_MESSAGE_NOT_FOUND` && t !== `NO_MESSAGES`) throw e;
    }
    return t(await e());
  };
function Zt({
  share: e,
  conversationId: t,
  targetMessageId: n,
  resolveTargetMessageId: r,
  showQR: i,
  setShowQR: a,
  sharedLink: o,
  setSharedLink: s,
  snapshotFiles: c,
}) {
  let l = Y(),
    { showToast: u } = N(),
    f = (0, Q.useRef)(null),
    m = (0, Q.useRef)(null),
    [h, g] = (0, Q.useState)(!1),
    [_, y] = (0, Q.useState)(!1),
    [b, x] = (0, Q.useState)(0),
    [C, w] = (0, Q.useState)(!1),
    [T, E] = (0, Q.useState)(!1),
    [ee, k] = (0, Q.useState)(``),
    A = e?.shareId ?? ``,
    te = Te(`(max-width: 768px)`);
  (0, Q.useEffect)(() => {
    E(typeof navigator < `u` && typeof navigator.share == `function`);
  }, []);
  let { mutateAsync: ne, isLoading: j } = Oe(),
    { mutateAsync: re, isLoading: M } = Ae(),
    F = $e({
      onSuccess: () => {
        (g(!1),
          setTimeout(() => {
            let e = document
              .getElementById(`share-conversation-dialog`)
              ?.closest(`[role="dialog"]`);
            e instanceof HTMLElement && e.focus();
          }, 0));
      },
      onError: (e) => {
        (console.error(`Delete error:`, e),
          u({ message: l(`com_ui_share_delete_error`), severity: J.ERROR }));
      },
    }),
    ie = (e) => pt(e),
    ae = (e) => {
      let t = Yt(e),
        n = l(`com_ui_share_error`);
      (t === `TARGET_MESSAGE_NOT_FOUND`
        ? (n = l(`com_ui_share_target_not_saved`))
        : t === `NO_MESSAGES` && (n = l(`com_ui_share_no_messages`)),
        u({ message: n, severity: J.ERROR, showIcon: !0 }));
    },
    L = () => r?.() ?? Promise.resolve(n),
    R = async () => {
      if (A) {
        w(!0);
        try {
          let e = await Xt(L, (e) => re({ shareId: A, targetMessageId: e, snapshotFiles: c }));
          (x((e) => e + 1),
            s(ie(e.shareId)),
            y(!1),
            k(l(`com_ui_link_refreshed`)),
            setTimeout(() => {
              k(``);
            }, 1e3));
        } catch (e) {
          (console.error(`Failed to update shared link:`, e), ae(e));
        } finally {
          w(!1);
        }
      }
    },
    z = async () => {
      w(!0);
      try {
        let e = await Xt(L, (e) => ne({ conversationId: t, targetMessageId: e, snapshotFiles: c }));
        s(ie(e.shareId));
      } catch (e) {
        (console.error(`Failed to create shared link:`, e), ae(e));
      } finally {
        w(!1);
      }
    },
    oe = async () => {
      if (A)
        try {
          (await F.mutateAsync({ shareId: A }),
            g(!1),
            s(``),
            u({ message: l(`com_ui_shared_link_delete_success`), severity: J.SUCCESS }));
        } catch (e) {
          (console.error(`Failed to delete shared link:`, e),
            u({ message: l(`com_ui_share_delete_error`), severity: J.ERROR }));
        }
    },
    se = async () => {
      if (!(!T || !o))
        try {
          await navigator.share({ title: l(`com_ui_share_link_to_chat`), url: o });
        } catch (e) {
          if (e.name === `AbortError`) return;
          u({ message: l(`com_ui_share_error`), severity: J.ERROR, showIcon: !0 });
        }
    },
    ce = me({ permissionType: Xe.SHARED_LINKS, permission: Ve.SHARE }),
    { hasPermission: V, isLoading: le } = ve(Re.SHARED_LINK, e?._id || ``),
    U = ce && !le && V(Pe.SHARE) && !!e?._id,
    ue = l(i ? `com_ui_hide_qr` : `com_ui_show_qr`);
  return (0, $.jsx)($.Fragment, {
    children: (0, $.jsxs)(`div`, {
      className: `flex w-full flex-wrap items-center gap-2`,
      children: [
        !A &&
          (0, $.jsxs)(I, {
            type: `button`,
            disabled: j || C,
            variant: `submit`,
            onClick: z,
            className: `ml-auto min-w-28`,
            children: [
              !j && !C && l(`com_ui_create_link`),
              (j || C) && (0, $.jsx)(Z, { className: `size-4` }),
            ],
          }),
        A &&
          (0, $.jsxs)($.Fragment, {
            children: [
              U &&
                (0, $.jsx)(ye, {
                  resourceType: Re.SHARED_LINK,
                  resourceDbId: e?._id,
                  resourceName: e?.shareId ?? void 0,
                  children: (0, $.jsx)(P, {
                    description: l(`com_ui_shared_link_manage_access`),
                    render: (e) =>
                      (0, $.jsx)(I, {
                        ...e,
                        type: `button`,
                        size: `icon`,
                        variant: `outline`,
                        className: `size-9 sm:size-10`,
                        'aria-label': l(`com_ui_shared_link_manage_access`),
                        children: (0, $.jsx)(D, { className: `size-4`, 'aria-hidden': `true` }),
                      }),
                  }),
                }),
              (0, $.jsxs)(`div`, {
                className: `ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2`,
                children: [
                  te &&
                    T &&
                    (0, $.jsx)(P, {
                      description: l(`com_ui_share`),
                      render: (e) =>
                        (0, $.jsx)(I, {
                          ...e,
                          type: `button`,
                          onClick: se,
                          variant: `outline`,
                          size: `icon`,
                          className: `size-9 sm:size-10`,
                          'aria-label': l(`com_ui_share`),
                          children: (0, $.jsx)(v, { className: `size-4`, 'aria-hidden': `true` }),
                        }),
                    }),
                  (0, $.jsx)(`span`, {
                    className: `sr-only`,
                    'aria-live': `polite`,
                    'aria-atomic': `true`,
                    children: ee,
                  }),
                  (0, $.jsx)(P, {
                    description: l(`com_ui_update_shared_link`),
                    render: (e) =>
                      (0, $.jsx)(I, {
                        ...e,
                        ref: m,
                        type: `button`,
                        onClick: () => y(!0),
                        variant: `outline`,
                        size: `icon`,
                        className: `size-9 sm:size-10`,
                        disabled: M || C,
                        'aria-label': l(`com_ui_update_shared_link`),
                        children: (0, $.jsx)(
                          p,
                          {
                            className:
                              b > 0
                                ? `size-4 animate-refresh-link-spin motion-reduce:animate-none`
                                : `size-4`,
                            'aria-hidden': `true`,
                          },
                          b,
                        ),
                      }),
                  }),
                  (0, $.jsx)(P, {
                    description: ue,
                    render: (e) =>
                      (0, $.jsx)(I, {
                        ...e,
                        type: `button`,
                        onClick: () => a(!i),
                        variant: `outline`,
                        size: `icon`,
                        className: `size-9 sm:size-10`,
                        'aria-pressed': i,
                        'aria-label': ue,
                        children: (0, $.jsx)(d, { className: `size-4`, 'aria-hidden': `true` }),
                      }),
                  }),
                  (0, $.jsx)(P, {
                    description: l(`com_ui_delete_link`),
                    render: (e) =>
                      (0, $.jsx)(I, {
                        ...e,
                        ref: f,
                        type: `button`,
                        onClick: () => g(!0),
                        variant: `destructive`,
                        size: `icon`,
                        className: `size-9 sm:size-10`,
                        'aria-label': l(`com_ui_delete_link`),
                        children: (0, $.jsx)(S, { className: `size-4`, 'aria-hidden': `true` }),
                      }),
                  }),
                ],
              }),
            ],
          }),
        (0, $.jsx)(H, {
          open: _,
          triggerRef: m,
          onOpenChange: y,
          children: (0, $.jsxs)(Je, {
            className: `w-11/12 max-w-md`,
            showCloseButton: !1,
            children: [
              (0, $.jsxs)(Ee, {
                children: [
                  (0, $.jsx)(q, { children: l(`com_ui_update_shared_link_confirm_title`) }),
                  (0, $.jsx)(G, {
                    className: `text-text-secondary`,
                    children: l(`com_ui_update_shared_link_confirm_description`),
                  }),
                ],
              }),
              (0, $.jsxs)(`div`, {
                className: `flex justify-end gap-2 pt-4`,
                children: [
                  (0, $.jsx)(K, {
                    asChild: !0,
                    children: (0, $.jsx)(I, { variant: `outline`, children: l(`com_ui_cancel`) }),
                  }),
                  (0, $.jsxs)(I, {
                    type: `button`,
                    variant: `submit`,
                    onClick: R,
                    disabled: M || C,
                    children: [
                      (M || C) && (0, $.jsx)(Z, { className: `size-4` }),
                      l(`com_ui_update_shared_link`),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
        (0, $.jsx)(H, {
          open: h,
          triggerRef: f,
          onOpenChange: g,
          children: (0, $.jsxs)(Je, {
            role: `alertdialog`,
            className: `w-11/12 max-w-[450px]`,
            showCloseButton: !1,
            children: [
              (0, $.jsx)(Ee, {
                children: (0, $.jsx)(q, { children: l(`com_ui_delete_shared_link_heading`) }),
              }),
              (0, $.jsx)(`div`, {
                className: `flex w-full flex-col items-center gap-2`,
                children: (0, $.jsx)(`div`, {
                  className: `grid w-full items-center gap-2`,
                  children: (0, $.jsx)(B, {
                    htmlFor: `dialog-confirm-delete`,
                    className: `text-left text-sm font-medium`,
                    children: (0, $.jsx)(O, {
                      i18nKey: `com_ui_delete_confirm_strong`,
                      values: { title: A },
                      components: { strong: (0, $.jsx)(`strong`, {}) },
                    }),
                  }),
                }),
              }),
              (0, $.jsxs)(`div`, {
                className: `flex justify-end gap-4 pt-4`,
                children: [
                  (0, $.jsx)(K, {
                    asChild: !0,
                    children: (0, $.jsx)(I, { variant: `outline`, children: l(`com_ui_cancel`) }),
                  }),
                  (0, $.jsx)(I, {
                    variant: `destructive`,
                    onClick: oe,
                    disabled: F.isLoading,
                    children: F.isLoading
                      ? (0, $.jsx)(Z, { className: `size-4` })
                      : l(`com_ui_delete_link`),
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    }),
  });
}
var Qt = (e) => Object.assign(Error(e), { code: e });
function $t({ conversationId: e, open: t, onOpenChange: n, triggerRef: r, children: i }) {
  let a = Y(),
    { data: s } = we(),
    c = s?.sharedLinksSnapshotFilesEnabled === !0,
    l = j(),
    [u, d] = (0, Q.useState)(!0),
    [f, p] = (0, Q.useState)(``),
    [m, h] = (0, Q.useState)(!0),
    g = Q.useRef(null),
    _ = o(oe.conversationIdByIndex(0)),
    v = be(0),
    y = rt(0),
    b = _ === e,
    x = b ? v : null,
    S = (0, Q.useCallback)(async () => {
      let t = y()?.messageId ?? x;
      if (
        ((t ||=
          (await l.fetchQuery([Qe.messages, e], () => he.getMessagesByConvoId(e), { staleTime: 0 }),
          y()?.messageId ?? null)),
        !t)
      )
        throw Qt(`NO_MESSAGES`);
      if (!(await he.getMessageById(e, t)).some((e) => e.messageId === t))
        throw Qt(`TARGET_MESSAGE_NOT_FOUND`);
      return t;
    }, [e, y, x, l]),
    { data: C, isLoading: w } = ie(e),
    T = C?.shareId ?? ``;
  ((0, Q.useEffect)(() => {
    p(T ? pt(T) : ``);
  }, [e, T]),
    (0, Q.useEffect)(() => {
      h(C?.success === !0 && typeof C.snapshotFiles == `boolean` ? C.snapshotFiles : !0);
    }, [e, C?.success, C?.snapshotFiles]));
  let E =
    w === !0
      ? null
      : (0, $.jsx)(Zt, {
          share: C,
          conversationId: e,
          targetMessageId: x ?? void 0,
          resolveTargetMessageId: b ? S : void 0,
          showQR: u,
          setShowQR: d,
          sharedLink: f,
          setSharedLink: p,
          snapshotFiles: c ? m : void 0,
        });
  return (0, $.jsxs)(H, {
    open: t,
    onOpenChange: n,
    triggerRef: r,
    children: [
      i,
      (0, $.jsxs)(Je, {
        className: `flex max-h-[90vh] w-11/12 max-w-md flex-col gap-0 overflow-hidden p-0 shadow-2xl`,
        onOpenAutoFocus: (e) => {
          g.current && (e.preventDefault(), g.current.focus());
        },
        children: [
          (0, $.jsxs)(Ee, {
            className: `shrink-0 px-6 pb-0 pr-14 pt-6 text-left`,
            children: [
              (0, $.jsxs)(`div`, {
                className: `flex items-center gap-2`,
                children: [
                  (0, $.jsx)(q, {
                    className: `text-xl font-semibold tracking-tight`,
                    children: a(`com_ui_share_link_to_chat`),
                  }),
                  (0, $.jsx)(Ne, {
                    icon: `info`,
                    side: ke.Bottom,
                    text:
                      C?.success === !0
                        ? a(`com_ui_share_update_message`)
                        : a(`com_ui_share_create_message`),
                  }),
                ],
              }),
              (0, $.jsx)(G, {
                className: `sr-only`,
                children:
                  C?.success === !0
                    ? a(`com_ui_share_update_message`)
                    : a(`com_ui_share_create_message`),
              }),
            ],
          }),
          w === !0
            ? (0, $.jsx)(`div`, {
                className: `flex min-h-72 items-center justify-center px-6 pb-6`,
                children: (0, $.jsx)(Z, { className: `size-6` }),
              })
            : (0, $.jsxs)(`div`, {
                id: `share-conversation-dialog`,
                className: `min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6 pt-6`,
                children: [
                  c &&
                    (0, $.jsxs)(`div`, {
                      className: `flex items-center justify-between gap-4`,
                      children: [
                        (0, $.jsxs)(`div`, {
                          className: `flex min-w-0 items-center gap-2`,
                          children: [
                            (0, $.jsx)(B, {
                              id: `share-files-label`,
                              htmlFor: `share-files-switch`,
                              className: `cursor-pointer text-sm font-medium text-text-primary`,
                              children: a(`com_ui_share_files`),
                            }),
                            (0, $.jsx)(Ne, {
                              icon: `info`,
                              side: ke.Bottom,
                              text: `${a(`com_ui_share_files_description`)}${T ? ` ${a(`com_ui_share_files_update_note`)}` : ``}`,
                            }),
                          ],
                        }),
                        (0, $.jsx)(Ke, {
                          ref: g,
                          id: `share-files-switch`,
                          checked: m,
                          onCheckedChange: h,
                          'aria-labelledby': `share-files-label`,
                        }),
                      ],
                    }),
                  u &&
                    T &&
                    (0, $.jsx)(`div`, {
                      className: `flex min-h-56 items-center justify-center py-1`,
                      children: (0, $.jsx)(`div`, {
                        className: `rounded-2xl bg-surface-qr p-3 shadow-sm`,
                        children: (0, $.jsx)(ft, {
                          value: f,
                          size: 200,
                          marginSize: 1,
                          title: a(`com_ui_share_qr_code_description`),
                        }),
                      }),
                    }),
                  T && (0, $.jsx)(Jt, { sharedLink: f }),
                  (0, $.jsx)(`div`, { className: `pt-1`, children: E }),
                ],
              }),
        ],
      }),
    ],
  });
}
function en(e, t, n) {
  return e
    ? (0, $.jsx)(Z, { className: `size-4` })
    : t
      ? (0, $.jsx)(b, { className: n, 'aria-hidden': `true` })
      : (0, $.jsx)(x, { className: n, 'aria-hidden': `true` });
}
function tn({
  conversationId: e,
  chatProjectId: t,
  title: n,
  isPinned: r = !1,
  isArchived: i = !1,
  retainView: a,
  renameHandler: o,
  isPopoverActive: u,
  setIsPopoverActive: d,
  isActiveConvo: p,
  isShiftHeld: m = !1,
}) {
  let h = Y(),
    v = j(),
    b = Te(`(max-width: 768px)`),
    { index: x, setConversation: S } = nt(),
    { data: w } = we(),
    { navigateToConvo: T } = qe(x),
    { showToast: D } = N(),
    { announcePolite: O } = ge(),
    ee = ne(),
    { conversationId: k } = te(),
    A = (0, Q.useRef)(k);
  A.current = k;
  let { newConversation: re } = Ie(),
    M = (0, Q.useId)(),
    P = (0, Q.useRef)(null),
    F = (0, Q.useRef)(null),
    I = (0, Q.useRef)(null),
    ie = (0, Q.useRef)(null),
    [ae, L] = (0, Q.useState)(!1),
    [R, z] = (0, Q.useState)(!1),
    [B, oe] = (0, Q.useState)(!1),
    se = me({ permissionType: Xe.SHARED_LINKS, permission: Ve.CREATE }),
    ce = Ge(),
    V = et(),
    H = Ue(),
    le = Fe({
      onSuccess: () => {
        ((k === e || k === `new`) && (re(), ee(`/c/new`, { replace: !0 })),
          a(),
          D({ message: h(`com_ui_convo_delete_success`), severity: J.SUCCESS, showIcon: !0 }));
      },
      onError: () => {
        D({ message: h(`com_ui_convo_delete_error`), severity: J.ERROR, showIcon: !0 });
      },
    }),
    U = Le({
      onSuccess: (e) => {
        (T(e.conversation),
          D({ message: h(`com_ui_duplication_success`), status: `success` }),
          d(!1));
      },
      onMutate: () => {
        D({ message: h(`com_ui_duplication_processing`), status: `info` });
      },
      onError: () => {
        D({ message: h(`com_ui_duplication_error`), status: `error` });
      },
    }),
    ue = U.isLoading,
    W = ce.isLoading,
    G = H.isLoading,
    K = le.isLoading,
    de = (0, Q.useCallback)(() => {
      L(!0);
    }, []),
    fe = (0, Q.useCallback)(() => {
      z(!0);
    }, []),
    he = (0, Q.useCallback)(() => {
      oe(!0);
    }, []),
    q = (0, Q.useCallback)(() => {
      let t = e ?? ``;
      t &&
        V.mutate(
          { conversationId: t, projectId: null },
          {
            onSuccess: () => {
              (d(!1),
                D({ message: h(`com_ui_project_updated`), severity: J.SUCCESS, showIcon: !0 }));
            },
            onError: () => {
              D({ message: h(`com_ui_project_update_error`), severity: J.ERROR, showIcon: !0 });
            },
          },
        );
    }, [V, e, h, d, D]),
    _e = (0, Q.useCallback)(
      (t) => {
        t.stopPropagation();
        let n = e ?? ``;
        if (!n) return;
        let r = v.getQueryData([Qe.messages, n]),
          i = r?.[r.length - 1]?.thread_id,
          a = r?.[r.length - 1]?.endpoint;
        le.mutate({ conversationId: n, thread_id: i, endpoint: a, source: `button` });
      },
      [e, le, v],
    ),
    ve = (0, Q.useCallback)(
      async (t) => {
        t?.stopPropagation();
        let n = e ?? ``;
        n &&
          ce.mutate(
            { conversationId: n, isArchived: !i },
            {
              onSuccess: () => {
                (S((e) => (e?.conversationId === n ? { ...e, isArchived: !i } : e)),
                  O({
                    message: h(i ? `com_ui_convo_unarchived` : `com_ui_convo_archived`),
                    isStatus: !0,
                  }));
                let e = A.current;
                (!i && (e === n || e === `new`) && (re(), ee(`/c/new`, { replace: !0 })),
                  a(),
                  d(!1));
              },
              onError: () => {
                D({
                  message: h(i ? `com_ui_unarchive_error` : `com_ui_archive_error`),
                  severity: J.ERROR,
                  showIcon: !0,
                });
              },
            },
          );
      },
      [e, i, S, ce, ee, re, a, d, O, D, h],
    ),
    ye = (0, Q.useCallback)(() => {
      let t = e ?? ``;
      t &&
        H.mutate(
          { conversationId: t, pinned: !r },
          {
            onSuccess: () => d(!1),
            onError: () => {
              D({
                message: h(r ? `com_ui_unpin_error` : `com_ui_pin_error`),
                severity: J.ERROR,
                showIcon: !0,
              });
            },
          },
        );
    }, [e, r, H, d, D, h]),
    be = (0, Q.useCallback)(() => {
      U.mutate({ conversationId: e ?? `` });
    }, [e, U]),
    xe = (0, Q.useMemo)(
      () => [
        {
          label: h(`com_ui_share`),
          onClick: de,
          icon: (0, $.jsx)(y, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
          show: w && w.sharedLinksEnabled && se,
          ariaHasPopup: `dialog`,
          ariaControls: `share-conversation-dialog`,
          hideOnClick: !1,
          ref: F,
          render: (e) => (0, $.jsx)(`button`, { ...e }),
        },
        {
          label: h(r ? `com_ui_unpin` : `com_ui_pin`),
          onClick: ye,
          hideOnClick: !1,
          icon: G
            ? (0, $.jsx)(Z, { className: `size-4` })
            : (0, $.jsx)(f, { className: `icon-sm mr-2 text-text-primary`, 'aria-hidden': `true` }),
        },
        {
          label: h(`com_ui_rename`),
          onClick: o,
          icon: (0, $.jsx)(l, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
        },
        {
          label: h(`com_ui_duplicate`),
          onClick: be,
          hideOnClick: !1,
          icon: ue
            ? (0, $.jsx)(Z, { className: `size-4` })
            : (0, $.jsx)(E, { className: `icon-sm mr-2 text-text-primary`, 'aria-hidden': `true` }),
        },
        {
          label: h(`com_ui_change_project`),
          onClick: he,
          icon: (0, $.jsx)(_, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
          ariaHasPopup: `dialog`,
          ariaControls: `project-conversation-dialog`,
          hideOnClick: !1,
          ref: ie,
          render: (e) => (0, $.jsx)(`button`, { ...e }),
        },
        {
          label: h(`com_ui_remove_from_project`),
          onClick: q,
          show: !!t,
          hideOnClick: !1,
          icon: V.isLoading
            ? (0, $.jsx)(Z, { className: `size-4` })
            : (0, $.jsx)(g, { className: `icon-sm mr-2 text-text-primary`, 'aria-hidden': `true` }),
        },
        {
          label: h(i ? `com_ui_unarchive` : `com_ui_archive`),
          onClick: ve,
          hideOnClick: !1,
          icon: en(W, i, `icon-sm mr-2 text-text-primary`),
        },
        {
          label: h(`com_ui_delete`),
          onClick: fe,
          icon: (0, $.jsx)(c, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
          ariaHasPopup: `dialog`,
          ariaControls: `delete-conversation-dialog`,
          hideOnClick: !1,
          ref: I,
          render: (e) => (0, $.jsx)(`button`, { ...e }),
        },
      ],
      [h, r, G, de, w, o, fe, W, i, ue, ye, ve, se, be, he, q, t, V.isLoading],
    ),
    Se = X(
      pe({ variant: `row-action`, size: `icon-xs` }),
      `text-text-secondary`,
      p === !0 || u || b
        ? `opacity-100`
        : `opacity-0 focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100`,
    );
  return m && p && !u && !ae && !R
    ? (0, $.jsxs)(`div`, {
        className: `flex items-center gap-0.5`,
        children: [
          (0, $.jsx)(`button`, {
            'aria-label': h(i ? `com_ui_unarchive` : `com_ui_archive`),
            className: Se,
            onClick: ve,
            disabled: W,
            children: en(W, i, `icon-md text-text-secondary`),
          }),
          (0, $.jsx)(`button`, {
            'aria-label': h(`com_ui_delete`),
            className: Se,
            onClick: _e,
            disabled: K,
            children: K
              ? (0, $.jsx)(Z, { className: `size-4` })
              : (0, $.jsx)(c, { className: `icon-md text-text-secondary`, 'aria-hidden': !0 }),
          }),
        ],
      })
    : (0, $.jsxs)($.Fragment, {
        children: [
          (0, $.jsx)(He, {
            portal: !0,
            menuId: M,
            focusLoop: !0,
            className: `z-[125]`,
            unmountOnHide: !0,
            isOpen: u,
            setIsOpen: d,
            trigger: (0, $.jsx)(s, {
              ref: P,
              id: `conversation-menu-${e}`,
              'aria-label': h(`com_nav_convo_menu_options`),
              'aria-expanded': u,
              className: X(Se, `gap-2`, u && `bg-surface-active text-text-primary`),
              onClick: (e) => {
                e.stopPropagation();
              },
              onKeyDown: (e) => {
                (e.key === `Enter` || e.key === ` `) && e.stopPropagation();
              },
              children: (0, $.jsx)(C, { className: `icon-md`, 'aria-hidden': !0 }),
            }),
            items: xe,
          }),
          ae &&
            (0, $.jsx)($t, { conversationId: e ?? ``, open: ae, onOpenChange: L, triggerRef: F }),
          R &&
            (0, $.jsx)(Gt, {
              title: n ?? ``,
              retainView: a,
              triggerRef: I,
              setMenuOpen: d,
              showDeleteDialog: R,
              conversationId: e ?? ``,
              setShowDeleteDialog: z,
            }),
          B &&
            (0, $.jsx)(qt, {
              conversationId: e ?? ``,
              chatProjectId: t,
              setMenuOpen: d,
              triggerRef: P,
              showProjectDialog: B,
              setShowProjectDialog: oe,
            }),
        ],
      });
}
var nn = (0, Q.memo)(
  tn,
  (e, t) =>
    e.conversationId === t.conversationId &&
    e.title === t.title &&
    e.chatProjectId === t.chatProjectId &&
    e.isPinned === t.isPinned &&
    e.isArchived === t.isArchived &&
    e.isPopoverActive === t.isPopoverActive &&
    e.isActiveConvo === t.isActiveConvo &&
    e.isShiftHeld === t.isShiftHeld,
);
function rn({ hasInteracted: e, isActiveConvo: t, isPopoverActive: n, onOpenChange: r, ...i }) {
  let a = Y(),
    o = Te(`(max-width: 768px)`),
    [s, c] = (0, Q.useState)(!1),
    l = (e) => {
      (e && c(!0), r(e));
    };
  return (o ? n || t || s : e || t)
    ? (0, $.jsx)(nn, { ...i, isActiveConvo: t, isPopoverActive: n, setIsPopoverActive: l })
    : o
      ? (0, $.jsx)(I, {
          size: `icon`,
          variant: `ghost`,
          'aria-label': a(`com_nav_convo_menu_options`),
          'data-testid': `convo-options-trigger`,
          className: `size-9 text-text-secondary`,
          onClick: (e) => {
            (e.stopPropagation(), l(!0));
          },
          children: (0, $.jsx)(C, { className: `icon-md`, 'aria-hidden': `true` }),
        })
      : null;
}
var an = (0, Q.memo)(rn);
function on({ onClick: e, onKeyDown: t, testId: n, keepVisible: r = !1, className: i }) {
  let o = Y(),
    s = Te(`(hover: hover)`);
  return (0, $.jsx)(P, {
    description: o(`com_ui_unpin`),
    side: `top`,
    render: (0, $.jsx)(I, {
      variant: `row-action`,
      size: `icon-xs`,
      'aria-label': o(`com_ui_unpin`),
      'data-testid': n,
      onClick: e,
      onKeyDown: t,
      className: X(
        `shrink-0 text-text-secondary`,
        s &&
          !r &&
          `pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100`,
        i,
      ),
      children: (0, $.jsx)(a, { className: `size-4`, 'aria-hidden': `true` }),
    }),
  });
}
var sn = ({ titleInput: e, setTitleInput: t, onSubmit: n, onCancel: r, localize: i }) => {
    let a = (0, Q.useRef)(null);
    return (
      (0, Q.useEffect)(() => {
        a.current && (a.current.focus(), a.current.select());
      }, []),
      (0, $.jsxs)(`div`, {
        className: `absolute inset-0 z-20 flex w-full items-center rounded-lg bg-surface-active-alt p-1.5`,
        role: `form`,
        'aria-label': i(`com_ui_rename_conversation`),
        children: [
          (0, $.jsx)(tt, {
            ref: a,
            type: `text`,
            className: X(
              `h-auto w-full rounded border-0 bg-transparent p-0.5 text-sm leading-tight focus-visible:outline-none`,
            ),
            value: e,
            onChange: (e) => t(e.target.value),
            onKeyDown: (t) => {
              switch (t.key) {
                case `Escape`:
                  r();
                  break;
                case `Enter`:
                  n(e);
              }
            },
            maxLength: 100,
            'aria-label': i(`com_ui_new_conversation_title`),
          }),
          (0, $.jsxs)(`div`, {
            className: `flex gap-1`,
            role: `toolbar`,
            children: [
              (0, $.jsx)(I, {
                variant: `row-action`,
                size: `icon`,
                onClick: () => r(),
                className: X(
                  `size-auto p-1 focus:outline-none focus:ring-2 focus:ring-text-primary`,
                ),
                'aria-label': i(`com_ui_cancel`),
                type: `button`,
                children: (0, $.jsx)(u, { className: `h-4 w-4`, 'aria-hidden': `true` }),
              }),
              (0, $.jsx)(I, {
                variant: `row-action`,
                size: `icon`,
                onClick: () => n(e),
                className: X(
                  `size-auto p-1 focus:outline-none focus:ring-2 focus:ring-text-primary`,
                ),
                'aria-label': i(`com_ui_save`),
                type: `button`,
                children: (0, $.jsx)(h, { className: `h-4 w-4`, 'aria-hidden': `true` }),
              }),
            ],
          }),
        ],
      })
    );
  },
  cn = 30,
  ln = 600,
  un = 2e3,
  dn = (e, t) =>
    typeof e.addEventListener == `function`
      ? (e.addEventListener(`change`, t), () => e.removeEventListener(`change`, t))
      : (e.addListener(t), () => e.removeListener(t)),
  fn = ({
    isActiveConvo: e,
    isPopoverActive: t,
    isHovered: n,
    isSharedBadgeVisible: r,
    title: i,
    onRename: a,
    isSmallScreen: o,
    localize: s,
    keyShortcuts: c,
    children: l,
  }) => {
    let [u, d] = (0, Q.useState)(!1),
      f = (0, Q.useRef)(null),
      p = (0, Q.useRef)(null),
      m = i || s(`com_ui_untitled`);
    return (
      (0, Q.useEffect)(() => {
        let e = f.current,
          t = p.current;
        if (!e || !t) return;
        let r = window.matchMedia(`(prefers-reduced-motion: reduce)`),
          i,
          a = 0,
          s = () => {
            (i?.cancel(), cancelAnimationFrame(a), delete e.dataset.titleRevealed);
            let s = t.getBoundingClientRect().width - e.getBoundingClientRect().width;
            if ((d(s > 0), !n || o || r.matches || s <= 0)) return;
            let c = getComputedStyle(e),
              l = c.direction === `rtl` ? 1 : -1,
              u = parseFloat(c.getPropertyValue(`--convo-title-reveal-duration`)),
              f = (s / cn) * 1e3,
              p = f + un,
              m = `translateX(${l * s}px)`;
            i = t.animate(
              [{ transform: `translateX(0)` }, { transform: m, offset: f / p }, { transform: m }],
              { duration: p, delay: ln, iterations: 1 / 0, easing: `linear` },
            );
            let h = Math.max(0, f - u),
              g = () => {
                let t = (typeof i?.currentTime == `number` ? i.currentTime : 0) - ln;
                ((e.dataset.titleRevealed = String(t > 0 && t % p >= h)),
                  (a = requestAnimationFrame(g)));
              };
            g();
          },
          c = new ResizeObserver(s);
        (c.observe(e), c.observe(t));
        let l = dn(r, s);
        return (
          s(),
          () => {
            (c.disconnect(),
              l(),
              i?.cancel(),
              cancelAnimationFrame(a),
              delete e.dataset.titleRevealed);
          }
        );
      }, [n, o, m]),
      (0, $.jsxs)(`button`, {
        type: `button`,
        className: X(
          `flex w-full min-w-0 grow cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary`,
          e || t ? `bg-surface-active-alt` : ``,
        ),
        'aria-current': e ? `page` : void 0,
        'aria-keyshortcuts': c,
        'aria-label': s(r ? `com_ui_conversation_label_shared` : `com_ui_conversation_label`, {
          title: i || s(`com_ui_untitled`),
        }),
        children: [
          l,
          (0, $.jsx)(`span`, {
            ref: f,
            className: X(
              `min-w-0 flex-1 overflow-hidden whitespace-nowrap [--convo-title-fade-width:24px] [--convo-title-reveal-duration:800ms] [mask-position:left] [mask-repeat:no-repeat] [mask-size:100%_100%] [text-align:start] [transition-duration:0ms] [transition-property:mask-size] [transition-timing-function:linear] [&:dir(rtl)]:[mask-position:right]`,
              u &&
                `[mask-image:linear-gradient(to_right,currentColor_calc(100%_-_var(--convo-title-fade-width)),transparent)] [&:dir(rtl)]:[mask-image:linear-gradient(to_left,currentColor_calc(100%_-_var(--convo-title-fade-width)),transparent)]`,
              `data-[title-revealed=true]:[mask-size:calc(100%_+_var(--convo-title-fade-width))_100%] data-[title-revealed=true]:[transition-duration:var(--convo-title-reveal-duration)]`,
            ),
            onDoubleClick: (e) => {
              o || (e.preventDefault(), e.stopPropagation(), a());
            },
            children: (0, $.jsx)(`span`, { ref: p, className: `inline-block`, children: m }),
          }),
        ],
      })
    );
  };
function pn({
  conversation: e,
  retainView: t,
  toggleNav: n,
  isGenerating: r = !1,
  draggable: i = !1,
  onRenamingChange: a,
  keyShortcuts: s,
}) {
  let c = te(),
    l = Y(),
    { showToast: u } = N(),
    { navigateToConvo: d } = qe(),
    f = (0, Q.useMemo)(() => c.conversationId, [c.conversationId]),
    p = it(f ?? ``),
    m = Ue(),
    h = o(oe.allConversationsSelector),
    g = Te(`(max-width: 768px)`),
    { data: _ } = we(),
    v = _?.sharedLinksEnabled === !0,
    y = e.isShared === !0 && v,
    b = _e(),
    { conversationId: x, title: S = `` } = e,
    [C, T] = (0, Q.useState)(S || ``),
    [E, D] = (0, Q.useState)(!1),
    [O, ee] = (0, Q.useState)(!1),
    [A, ne] = (0, Q.useState)(!1),
    [j, re] = (0, Q.useState)(!1),
    M = (0, Q.useRef)(S),
    P = (0, Q.useRef)(null),
    F = (0, Q.useRef)(a);
  F.current = a;
  let I = (0, Q.useCallback)((e) => {
    (D(e), F.current?.(e));
  }, []);
  (0, Q.useEffect)(
    () => () => {
      F.current?.(!1);
    },
    [],
  );
  let ie = Te(`(hover: hover)`),
    [, ae] = k({
      type: _t,
      item: () => ({
        conversationId: x ?? ``,
        chatProjectId: e.chatProjectId ?? null,
        pinned: e.pinned === !0,
      }),
    });
  (ae(i && ie && !E ? P : null),
    (0, Q.useEffect)(() => {
      S !== M.current && (T(S), (M.current = S));
    }, [S]));
  let L = (0, Q.useMemo)(
      () => (x === W.NEW_CONVO ? f === W.NEW_CONVO : f === W.NEW_CONVO ? h?.[0] === x : f === x),
      [f, x, h],
    ),
    R = () => {
      (ee(!1), T(S), I(!0));
    },
    z = async (e) => {
      if (!x || e === S) {
        I(!1);
        return;
      }
      try {
        (await p.mutateAsync({ conversationId: x, title: e.trim() || l(`com_ui_untitled`) }),
          I(!1));
      } catch (e) {
        (Ze.error(`Error renaming conversation`, e),
          T(S),
          u({ message: l(`com_ui_rename_failed`), severity: J.ERROR, showIcon: !0 }),
          I(!1));
      }
    },
    B = () => {
      (T(S), I(!1));
    },
    se = (0, Q.useCallback)(() => {
      re(!0);
    }, []),
    ce = (0, Q.useCallback)(() => {
      if (!x) return;
      let e = P.current,
        t = e?.contains(document.activeElement) === !0 ? (Vt(e) ?? Ht(e)) : null;
      m.mutate(
        { conversationId: x, pinned: !1 },
        {
          onSuccess: () => {
            let n = document.activeElement,
              r = e?.contains(n) === !0,
              i = e?.isConnected === !1 && (n === document.body || n === document.documentElement);
            t?.isConnected && (r || i) && t.focus();
          },
          onError: () => {
            u({ message: l(`com_ui_unpin_error`), severity: J.ERROR, showIcon: !0 });
          },
        },
      );
    }, [x, m, u, l]),
    V = (0, Q.useCallback)((e) => {
      ee(e);
    }, []),
    H = (t) => {
      if (t && !r) {
        n();
        let e = window.location.origin,
          t = `/c/${x}`;
        window.open(e + t, `_blank`);
        return;
      }
      f === x ||
        O ||
        n(() => {
          (De(S), d(e, { currentConvoId: f }));
        });
    },
    le = {
      title: S,
      isPinned: e.pinned,
      isArchived: e.isArchived === !0,
      retainView: t,
      renameHandler: R,
      isActiveConvo: L,
      conversationId: x,
      chatProjectId: e.chatProjectId,
      isPopoverActive: O,
      onOpenChange: V,
      isShiftHeld: L ? b : !1,
    },
    U = (0, $.jsx)(`span`, {
      role: `img`,
      'aria-label': l(`com_ui_generating`),
      children: (0, $.jsx)(Z, { className: `h-5 w-5 flex-shrink-0 text-text-primary` }),
    }),
    ue = `pointer-events-none w-0 scale-x-0 opacity-0 group-focus-within:pointer-events-auto group-focus-within:scale-x-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:scale-x-100 group-hover:opacity-100`,
    G = g ? `group-focus-within:w-9 group-hover:w-9` : `group-focus-within:w-7 group-hover:w-7`;
  r
    ? ((ue = `pointer-events-none w-5 scale-x-100 opacity-100`), (G = ``))
    : (O || L || g) &&
      ((ue = `pointer-events-auto scale-x-100 opacity-100`),
      (G = !O && L && b ? `w-[60px]` : g ? `w-9` : `w-7`));
  let K = null;
  return (
    r ? (K = U) : E || (K = (0, $.jsx)(an, { ...le, hasInteracted: j })),
    (0, $.jsxs)(`div`, {
      ref: P,
      className: X(
        `group relative flex h-12 w-full items-center rounded-lg outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary md:h-9`,
        L || O
          ? `bg-surface-active-alt before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-full before:bg-text-primary`
          : `hover:bg-surface-active-alt`,
      ),
      onPointerEnter: (e) => {
        e.pointerType === `mouse` && ne(!0);
      },
      onPointerLeave: () => ne(!1),
      onPointerCancel: () => ne(!1),
      onMouseEnter: se,
      onFocus: se,
      onClick: (e) => {
        E || (e.button === 0 && H(e.ctrlKey || e.metaKey));
      },
      style: { cursor: E ? `default` : `pointer` },
      'data-testid': `convo-item`,
      children: [
        E
          ? (0, $.jsx)(sn, {
              titleInput: C,
              setTitleInput: T,
              onSubmit: z,
              onCancel: B,
              localize: l,
            })
          : (0, $.jsx)(fn, {
              isActiveConvo: L,
              isPopoverActive: O,
              isHovered: A,
              isSharedBadgeVisible: y,
              title: S,
              onRename: R,
              isSmallScreen: g,
              localize: l,
              keyShortcuts: s,
              children: (0, $.jsx)(It, { conversation: e, size: 20, context: `menu-item` }),
            }),
        y &&
          (0, $.jsx)(w, {
            className: `icon-sm mr-1 shrink-0 text-text-secondary`,
            'aria-hidden': `true`,
          }),
        e.pinned === !0 &&
          (0, $.jsx)(on, {
            testId: `convo-unpin-button`,
            className: `mr-1`,
            keepVisible: O,
            onClick: (e) => {
              (e.stopPropagation(), ce());
            },
          }),
        (0, $.jsx)(`div`, {
          className: X(`mr-1 flex shrink-0 origin-left items-center justify-center`, ue, G),
          children: K,
        }),
      ],
    })
  );
}
var mn = (0, Q.memo)(pn, Nt),
  hn = (0, Q.memo)(({ cache: e, rowKey: t, parent: n, index: r, style: i, children: a }) =>
    (0, $.jsx)(
      lt,
      {
        cache: e,
        columnIndex: 0,
        parent: n,
        rowIndex: r,
        children: ({ registerChild: e }) =>
          (0, $.jsx)(`div`, {
            ref: e,
            style: i,
            className: `px-3`,
            'data-testid': `convo-list-row`,
            role: `row`,
            children: (0, $.jsx)(`div`, { role: `gridcell`, children: a }),
          }),
      },
      t,
    ),
  );
hn.displayName = `MeasuredRow`;
var gn = (0, Q.memo)(() => {
  let e = Y();
  return (0, $.jsxs)(`div`, {
    className: `mx-auto mt-2 flex items-center justify-center gap-2`,
    children: [
      (0, $.jsx)(Z, { className: `text-text-primary` }),
      (0, $.jsx)(`span`, {
        className: `animate-pulse text-text-primary`,
        children: e(`com_ui_loading`),
      }),
    ],
  });
});
gn.displayName = `LoadingSpinner`;
var _n = (0, Q.memo)(({ isExpanded: e, onToggle: t, trailing: n, highlight: i }) => {
  let a = Y();
  return (0, $.jsxs)(`div`, {
    className: X(`flex h-8 w-full items-center pr-2`, i && `rounded-lg bg-surface-active-alt`),
    children: [
      (0, $.jsxs)(`button`, {
        onClick: t,
        className: X(pe({ variant: `section-header` }), `group min-w-0 flex-1`),
        type: `button`,
        'aria-expanded': e,
        children: [
          (0, $.jsx)(`span`, { className: `select-none truncate`, children: a(`com_ui_chats`) }),
          (0, $.jsx)(r, {
            className: X(
              `h-3 w-3 shrink-0 transition-transform duration-200`,
              e ? `` : `-rotate-90`,
            ),
            'aria-hidden': `true`,
          }),
        ],
      }),
      n,
    ],
  });
});
_n.displayName = `ChatsHeader`;
var vn = (0, Q.memo)(({ groupName: e, isFirst: t, isAlphabetical: n = !1 }) => {
  let r = Y(),
    i = r(e) || e;
  return (0, $.jsx)(`h2`, {
    'aria-label':
      e === `com_ui_running_chats`
        ? r(`com_a11y_chats_running_section`)
        : r(
            n ? `com_a11y_chats_alpha_section` : `com_a11y_chats_date_section`,
            n ? { letter: i } : { date: i },
          ),
    className: X(`pl-1 pt-1 text-text-secondary`, t === !0 ? `mt-0` : `mt-2`),
    style: { fontSize: `0.7rem` },
    children: i,
  });
});
vn.displayName = `DateLabel`;
var yn = (0, Q.memo)(
  ({
    conversations: e,
    moveToTop: t,
    toggleNav: n,
    containerRef: r,
    loadMoreConversations: i,
    isLoading: a,
    isSearchLoading: s,
    isChatsExpanded: c,
    setIsChatsExpanded: l,
    chatsHeaderTrailing: u,
    hasNextPage: d = !1,
    isError: f = !1,
    onRetry: p,
    scrollViewport: h,
    scrollContent: g,
  }) => {
    let _ = Y(),
      v = o(oe.search),
      y = T(ae),
      b = T(le),
      x = T(fe),
      S = T(st),
      C = m(Se),
      w = Te(`(max-width: 768px)`),
      E = wt(),
      D = Tt(),
      O = Ct(),
      k = (0, Q.useRef)(null),
      [{ isDropOver: A, canDrop: te }, ne] = ee({
        accept: _t,
        canDrop: (e) => O(e) != null || e.pinned === !0,
        hover: () => bt(),
        drop: (e) => {
          E(e, null).then((t) => {
            t && D(e);
          });
        },
        collect: (e) => ({ isDropOver: e.isOver(), canDrop: e.canDrop() }),
      });
    ne(k);
    let j = w ? 44 : 34,
      { ref: re, width: M } = de(),
      { ref: N, height: P, scrollTop: F, isOnScreen: I } = ue(h, g),
      ie = (0, Q.useCallback)(
        (e) => {
          (re(e), N(e));
        },
        [re, N],
      ),
      { data: L } = Me(),
      R = (0, Q.useRef)(null),
      z = (0, Q.useMemo)(() => {
        let e = L?.activeJobIds ?? [],
          t = new Set(e),
          n = R.current;
        return n && t.size === n.size && e.every((e) => n.has(e)) ? n : ((R.current = t), t);
      }, [L?.activeJobIds]),
      B = (0, Q.useMemo)(() => e.filter(Boolean), [e]),
      se = b || !!v.query,
      ce = (0, Q.useMemo)(
        () => at(B, { field: y.field, direction: y.direction, includePinned: se }),
        [B, se, y.direction, y.field],
      ),
      V = (0, Q.useMemo)(
        () => At(ce, z, { field: y.field, direction: y.direction, includePinned: b }),
        [ce, z, b, y.direction, y.field],
      ),
      H = (0, Q.useRef)(null);
    ((0, Q.useEffect)(() => {
      c || (H.current = null);
    }, [c]),
      (0, Q.useEffect)(() => {
        !c || a || s || V.length > 0 || (H.current !== e && ((H.current = e), i()));
      }, [c, a, s, V.length, e, i]));
    let U = (0, Q.useMemo)(() => {
        let e = [];
        return (
          c &&
            (V.forEach(([t, n]) => {
              (e.push({ type: `header`, groupName: t }),
                e.push(...n.map((e) => ({ type: `convo`, convo: e }))));
            }),
            a && e.push({ type: `loading` })),
          e
        );
      }, [V, a, c]),
      W = (0, Q.useRef)(U);
    W.current = U;
    let G = (0, Q.useMemo)(
      () =>
        new ct({
          fixedWidth: !0,
          defaultHeight: j,
          keyMapper: (e) => {
            let t = W.current[e];
            return t
              ? t.type === `header`
                ? `header-${t.groupName}-${e === 0 ? `first` : `sub`}`
                : t.type === `convo`
                  ? `convo-${t.convo.conversationId}`
                  : t.type === `loading`
                    ? `loading`
                    : `unknown-${e}`
              : `unknown-${e}`;
          },
        }),
      [j],
    );
    ((0, Q.useEffect)(() => {
      let e = requestAnimationFrame(() => {
        (G.clearAll(),
          r.current && `recomputeRowHeights` in r.current && r.current.recomputeRowHeights(0));
      });
      return () => cancelAnimationFrame(e);
    }, [v.query, G, r]),
      (0, Q.useEffect)(() => {
        let e = requestAnimationFrame(() => {
          r.current && `recomputeRowHeights` in r.current && r.current.recomputeRowHeights(0);
        });
        return () => cancelAnimationFrame(e);
      }, [U, r]));
    let K = (0, Q.useRef)(0);
    (0, Q.useEffect)(() => {
      if (M === 0 || M === K.current) return;
      K.current = M;
      let e = requestAnimationFrame(() => {
        (G.clearAll(),
          r.current && `recomputeRowHeights` in r.current && r.current.recomputeRowHeights(0));
      });
      return () => cancelAnimationFrame(e);
    }, [M, G, r]);
    let pe = (0, Q.useCallback)(
        ({ index: e, key: r, parent: i, style: a }) => {
          let o = U[e],
            s = { cache: G, rowKey: r, parent: i, index: e, style: a };
          if (o.type === `loading`)
            return (0, $.jsx)(hn, { ...s, children: (0, $.jsx)(gn, {}) }, r);
          if (o.type === `header`)
            return (0, $.jsx)(
              hn,
              {
                ...s,
                children: (0, $.jsx)(vn, {
                  groupName: o.groupName,
                  isFirst: e === 0,
                  isAlphabetical: Ce(y.field),
                }),
              },
              r,
            );
          if (o.type === `convo`) {
            let e = z.has(o.convo.conversationId ?? ``);
            return (0, $.jsx)(
              hn,
              {
                ...s,
                children: (0, $.jsx)(mn, {
                  conversation: o.convo,
                  retainView: t,
                  toggleNav: n,
                  isGenerating: e,
                  draggable: !0,
                }),
              },
              r,
            );
          }
          return null;
        },
        [G, U, t, n, z, y.field],
      ),
      me = (0, Q.useCallback)(({ index: e }) => G.getHeight(e, 0), [G]),
      he = (0, Q.useMemo)(() => (0, gt.default)(i, 300), [i]),
      ge = (0, Q.useCallback)(
        ({ stopIndex: e }) => {
          I() && e >= U.length - 8 && he();
        },
        [U.length, he, I],
      ),
      q = c && f && !a && !s && B.length === 0,
      _e = !v.query && S.length === 0 && !b && B.length > 0,
      ve = c && !a && !s && !q && !d && V.length === 0 && !_e,
      ye = `com_ui_no_chats`;
    v.query
      ? (ye = `com_ui_no_search_results`)
      : S.length > 0
        ? (ye = `com_ui_no_chats_match_filters`)
        : b && (ye = `com_ui_no_archived_chats`);
    let be = (0, $.jsx)(`div`, {
      ref: ie,
      className: `flex-1`,
      children: (0, $.jsx)(ut, {
        ref: r,
        autoHeight: !0,
        width: M,
        height: P,
        scrollTop: F,
        deferredMeasurementCache: G,
        rowCount: U.length,
        rowHeight: me,
        rowRenderer: pe,
        overscanRowCount: 10,
        'aria-readonly': !1,
        className: `outline-none`,
        'aria-label': `Conversations`,
        onRowsRendered: ge,
        tabIndex: -1,
        style: { outline: `none` },
        containerRole: `rowgroup`,
      }),
    });
    return (
      s
        ? (be = (0, $.jsxs)(`div`, {
            className: `flex flex-1 items-center justify-center`,
            children: [
              (0, $.jsx)(Z, { className: `text-text-primary` }),
              (0, $.jsx)(`span`, {
                className: `ml-2 text-text-primary`,
                children: _(`com_ui_loading`),
              }),
            ],
          }))
        : q
          ? (be = (0, $.jsxs)(`div`, {
              className: `flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center`,
              'data-testid': `convo-list-error`,
              role: `alert`,
              children: [
                (0, $.jsx)(`span`, {
                  className: `text-sm text-text-secondary`,
                  children: _(`com_ui_chats_load_error`),
                }),
                p &&
                  (0, $.jsx)(`button`, {
                    type: `button`,
                    onClick: p,
                    className: `rounded-lg px-2 py-1 text-sm text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                    children: _(`com_ui_retry`),
                  }),
              ],
            }))
          : ve &&
            (be = (0, $.jsxs)(`div`, {
              className: `flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center`,
              'data-testid': `convo-list-empty`,
              children: [
                (0, $.jsx)(`span`, { className: `text-sm text-text-secondary`, children: _(ye) }),
                x > 0 &&
                  (0, $.jsx)(`button`, {
                    type: `button`,
                    onClick: () => C(),
                    className: `rounded-lg px-2 py-1 text-sm text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                    children: _(`com_ui_clear_filters`),
                  }),
              ],
            })),
      (0, $.jsxs)(`div`, {
        ref: k,
        className: `relative flex flex-1 flex-col pb-2 text-sm text-text-primary`,
        children: [
          (0, $.jsx)(`div`, {
            className: `px-3`,
            children: (0, $.jsx)(_n, {
              isExpanded: c,
              onToggle: () => l(!c),
              trailing: u,
              highlight: A && te,
            }),
          }),
          be,
        ],
      })
    );
  },
);
function bn({ open: e, onOpenChange: t, onCreated: n, children: r, triggerRef: i }) {
  let a = Y(),
    o = (0, Q.useId)(),
    s = (0, Q.useRef)(null),
    [c, l] = (0, Q.useState)(``),
    [u, d] = (0, Q.useState)(``),
    f = xe(),
    { showToast: p } = N();
  (0, Q.useEffect)(() => {
    if (!e) return;
    let t = requestAnimationFrame(() => s.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [e]);
  let m = () => {
    (l(``), d(``));
  };
  return (0, $.jsxs)(H, {
    open: e,
    onOpenChange: (e) => {
      (t(e), !e && !f.isLoading && m());
    },
    triggerRef: i,
    children: [
      r,
      (0, $.jsx)(V, {
        title: a(`com_ui_create_project`),
        showCloseButton: !1,
        className: `w-11/12 max-w-md`,
        main: (0, $.jsxs)(`form`, {
          id: o,
          onSubmit: async (e) => {
            e.preventDefault();
            let r = c.trim();
            if (!(!r || f.isLoading))
              try {
                let e = u.trim(),
                  i = await f.mutateAsync({ name: r, ...(e ? { description: e } : {}) });
                (m(), t(!1), n?.(i));
              } catch {
                p({ message: a(`com_ui_project_create_error`), status: `error` });
              }
          },
          className: `flex flex-col gap-4`,
          children: [
            (0, $.jsxs)(`div`, {
              className: `space-y-2`,
              children: [
                (0, $.jsx)(B, {
                  htmlFor: `${o}-name`,
                  className: `text-sm font-medium text-text-primary`,
                  children: a(`com_ui_project_name`),
                }),
                (0, $.jsx)(tt, {
                  id: `${o}-name`,
                  ref: s,
                  value: c,
                  onChange: (e) => l(e.target.value),
                  placeholder: a(`com_ui_project_name_placeholder`),
                  maxLength: 100,
                  className: `w-full`,
                }),
              ],
            }),
            (0, $.jsxs)(`div`, {
              className: `space-y-2`,
              children: [
                (0, $.jsxs)(B, {
                  htmlFor: `${o}-description`,
                  className: `text-sm font-medium text-text-primary`,
                  children: [
                    a(`com_ui_description`),
                    ` `,
                    (0, $.jsx)(`span`, {
                      className: `font-normal text-text-secondary`,
                      children: a(`com_ui_optional`),
                    }),
                  ],
                }),
                (0, $.jsx)(je, {
                  id: `${o}-description`,
                  value: u,
                  onChange: (e) => d(e.target.value),
                  rows: 3,
                  maxLength: Ye,
                  className: `min-h-[4.5rem] bg-transparent`,
                }),
              ],
            }),
          ],
        }),
        buttons: (0, $.jsx)(I, {
          type: `submit`,
          form: o,
          variant: `submit`,
          disabled: !c.trim() || f.isLoading,
          'aria-label': a(`com_ui_create_project`),
          className: `active:scale-[0.96]`,
          children: f.isLoading
            ? (0, $.jsx)(Z, { className: `size-4` })
            : a(`com_ui_create_project`),
        }),
      }),
    ],
  });
}
function xn({ open: e, onOpenChange: t, project: n }) {
  let r = Y(),
    i = ne(),
    a = A(),
    o = ce(),
    { showToast: s } = N();
  return (0, $.jsx)(H, {
    open: e,
    onOpenChange: t,
    children: (0, $.jsxs)(Je, {
      className: `w-11/12 max-w-md`,
      showCloseButton: !1,
      children: [
        (0, $.jsx)(Ee, { children: (0, $.jsx)(q, { children: r(`com_ui_delete_project`) }) }),
        (0, $.jsx)(`div`, {
          className: `text-sm text-text-secondary`,
          children: r(`com_ui_delete_project_confirm`, { name: n.name }),
        }),
        (0, $.jsxs)(`div`, {
          className: `flex justify-end gap-4 pt-4`,
          children: [
            (0, $.jsx)(K, {
              asChild: !0,
              children: (0, $.jsx)(I, {
                'aria-label': r(`com_ui_cancel`),
                variant: `outline`,
                children: r(`com_ui_cancel`),
              }),
            }),
            (0, $.jsx)(I, {
              variant: `destructive`,
              onClick: () => {
                o.mutate(n._id, {
                  onSuccess: () => {
                    (t(!1), a.pathname === `/projects/${n._id}` && i(`/projects`));
                  },
                  onError: () =>
                    s({
                      message: r(`com_ui_project_delete_error`),
                      severity: J.ERROR,
                      showIcon: !0,
                    }),
                });
              },
              disabled: o.isLoading,
              children: o.isLoading ? (0, $.jsx)(Z, { className: `size-4` }) : r(`com_ui_delete`),
            }),
          ],
        }),
      ],
    }),
  });
}
function Sn({ open: e, onOpenChange: t, project: n }) {
  let r = Y(),
    i = (0, Q.useId)(),
    a = (0, Q.useRef)(null),
    [o, s] = (0, Q.useState)(n.name),
    [c, l] = (0, Q.useState)(n.description ?? ``),
    [u, d] = (0, Q.useState)(e),
    f = z(),
    { showToast: p } = N();
  (e !== u && (d(e), e && (s(n.name), l(n.description ?? ``))),
    (0, Q.useEffect)(() => {
      if (!e) return;
      let t = requestAnimationFrame(() => a.current?.focus());
      return () => cancelAnimationFrame(t);
    }, [e]));
  let m = o.trim(),
    h = c.trim(),
    g = m === n.name && h === (n.description ?? ``).trim();
  return (0, $.jsx)(H, {
    open: e,
    onOpenChange: t,
    children: (0, $.jsx)(V, {
      title: r(`com_ui_edit_project`),
      showCloseButton: !1,
      className: `w-11/12 max-w-md`,
      main: (0, $.jsxs)(`form`, {
        id: i,
        onSubmit: (e) => {
          (e.preventDefault(),
            !(!m || g || f.isLoading) &&
              f.mutate(
                { projectId: n._id, name: m, description: h },
                {
                  onSuccess: () => t(!1),
                  onError: () =>
                    p({
                      message: r(`com_ui_project_rename_error`),
                      severity: J.ERROR,
                      showIcon: !0,
                    }),
                },
              ));
        },
        className: `flex flex-col gap-4`,
        children: [
          (0, $.jsxs)(`div`, {
            className: `space-y-2`,
            children: [
              (0, $.jsx)(B, {
                htmlFor: `${i}-name`,
                className: `text-sm font-medium text-text-primary`,
                children: r(`com_ui_project_name`),
              }),
              (0, $.jsx)(tt, {
                id: `${i}-name`,
                ref: a,
                value: o,
                onChange: (e) => s(e.target.value),
                maxLength: 100,
                className: `w-full`,
              }),
            ],
          }),
          (0, $.jsxs)(`div`, {
            className: `space-y-2`,
            children: [
              (0, $.jsxs)(B, {
                htmlFor: `${i}-description`,
                className: `text-sm font-medium text-text-primary`,
                children: [
                  r(`com_ui_description`),
                  ` `,
                  (0, $.jsx)(`span`, {
                    className: `font-normal text-text-secondary`,
                    children: r(`com_ui_optional`),
                  }),
                ],
              }),
              (0, $.jsx)(je, {
                id: `${i}-description`,
                value: c,
                onChange: (e) => l(e.target.value),
                rows: 3,
                maxLength: Ye,
                className: `min-h-[4.5rem] bg-transparent`,
              }),
            ],
          }),
        ],
      }),
      buttons: (0, $.jsx)(I, {
        type: `submit`,
        form: i,
        variant: `submit`,
        disabled: !m || g || f.isLoading,
        className: `active:scale-[0.96]`,
        children: f.isLoading ? (0, $.jsx)(Z, { className: `size-4` }) : r(`com_ui_save`),
      }),
    }),
  });
}
export {
  ht as C,
  Ct as S,
  bt as _,
  vn as a,
  Et as b,
  $t as c,
  Ut as d,
  It as f,
  St as g,
  xt as h,
  yn as i,
  qt as l,
  _t as m,
  xn as n,
  mn as o,
  Mt as p,
  bn as r,
  on as s,
  Sn as t,
  Gt as u,
  yt as v,
  mt as w,
  wt as x,
  Ot as y,
};
