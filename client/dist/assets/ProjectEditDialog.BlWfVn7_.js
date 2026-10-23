import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  Bi as r,
  Br as i,
  Dn as a,
  Fa as o,
  In as s,
  Kt as c,
  Nn as l,
  Nt as u,
  Pn as d,
  Po as f,
  Tt as p,
  Ur as m,
  bi as h,
  dn as g,
  fi as _,
  fn as v,
  fr as y,
  ma as b,
  pa as x,
  pr as S,
  wt as C,
  xn as ee,
  zi as w,
  zr as T,
  zt as E,
} from './vendor.DMhDOqx5.js';
import { n as D } from './i18n.CenFdT2j.js';
import { a as te, s as O } from './react-interactions.BEfrmSAG.js';
import { c as k, f as ne, u as re } from './routing.CgoqFSAd.js';
import { r as A } from './query-devtools.DIz6FZCX.js';
import { m as ie, v as j } from './tanstack-vendor.2R6Ja_-H.js';
import {
  Ao as M,
  As as N,
  Bc as P,
  C_ as ae,
  Cl as F,
  Dh as I,
  Dl as L,
  Dp as R,
  El as z,
  Eu as oe,
  Gg as B,
  Gp as V,
  Hc as se,
  Hl as ce,
  Hp as H,
  I as le,
  Ku as ue,
  L as de,
  Lc as fe,
  Ln as U,
  Lp as pe,
  Mm as W,
  Oo as me,
  Ph as he,
  R as ge,
  S as _e,
  Sn as ve,
  Tl as ye,
  Uc as be,
  Up as xe,
  Vc as Se,
  Wl as Ce,
  Wp as G,
  Wu as K,
  Xh as q,
  Yp as J,
  _h as we,
  _m as Te,
  a_ as Ee,
  ac as De,
  bc as Oe,
  bl as ke,
  bu as Ae,
  cc as je,
  cn as Me,
  dc as Ne,
  ds as Y,
  e_ as Pe,
  eg as Fe,
  ep as Ie,
  ga as Le,
  gf as Re,
  hs as ze,
  k_ as Be,
  l_ as Ve,
  mc as He,
  na as Ue,
  nc as We,
  nm as Ge,
  np as X,
  ps as Ke,
  qh as qe,
  qp as Je,
  s_ as Ye,
  sh as Z,
  tg as Xe,
  tm as Ze,
  uc as Qe,
  uh as $e,
  vm as et,
  wl as tt,
  wm as nt,
  xs as rt,
  xu as it,
  yc as at,
  yt as ot,
  zc as st,
} from './hooks.CJk6e4LS.js';
import { n as ct, r as lt, t as ut } from './virtualization.B_GnC4Bm.js';
import { r as dt } from './utilities.HUTk6tC6.js';
import { t as ft } from './security-ui.B17a9jwF.js';
var pt = (e) => {
    let t = ae();
    return new URL(`${t}/share/${e}`, window.location.origin).toString();
  },
  mt = (e = {}, t) => {
    let { sortBy: n, sortDirection: r, search: i, limit: a } = e;
    return ie({
      queryKey: [Ye.projects, { sortBy: n, sortDirection: r, search: i, limit: a }],
      queryFn: ({ pageParam: e }) =>
        Be.listProjects({
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
    j([Ye.project, e], () => Be.getProjectById(e ?? ``), {
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
    let e = A();
    return (0, Q.useCallback)(
      (t) => {
        if (!t.conversationId) return t.chatProjectId;
        let n = F(t.conversationId);
        if (n) return n.projectId;
        let r = e.getQueryData([Ye.conversation, t.conversationId]);
        return r ? (r.chatProjectId ?? null) : t.chatProjectId;
      },
      [e],
    );
  },
  wt = () => {
    let e = Y(),
      { showToast: t } = q(),
      n = tt();
    return (0, Q.useCallback)(
      (r, i) => {
        let a = r.conversationId;
        return a
          ? n.mutateAsync({ conversationId: a, projectId: i }).then(
              (n) => (
                n.previousProjectId !== n.projectId &&
                  t({ message: e(`com_ui_project_updated`), severity: X.SUCCESS, showIcon: !0 }),
                !0
              ),
              () => (
                t({ message: e(`com_ui_project_update_error`), severity: X.ERROR, showIcon: !0 }),
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
      { showToast: t } = q(),
      n = He();
    return (0, Q.useCallback)(
      (r) => {
        let i = r.conversationId;
        !i ||
          r.pinned !== !0 ||
          n.mutate(
            { conversationId: i, pinned: !1 },
            {
              onError: () =>
                t({ message: e(`com_ui_unpin_error`), severity: X.ERROR, showIcon: !0 }),
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
  let { data: i = Pt } = ce(),
    a = ze(),
    o = M();
  return (0, $.jsx)(Ue, {
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
    s = re(),
    c = A(),
    { showToast: l } = q(),
    { newConversation: u } = Me(),
    { conversationId: d } = ne(),
    f = n ?? d,
    p = je({
      onSuccess: () => {
        (e(!1),
          (f === t || f === `new`) && (u(), s(`/c/new`, { replace: !0 })),
          r?.(!1),
          i(),
          l({ message: o(`com_ui_convo_delete_success`), severity: X.SUCCESS, showIcon: !0 }));
      },
      onError: () => {
        l({ message: o(`com_ui_convo_delete_error`), severity: X.ERROR, showIcon: !0 });
      },
    }),
    m = (0, Q.useCallback)(() => {
      let e = c.getQueryData([Ye.messages, t]),
        n = e?.[e.length - 1]?.thread_id,
        r = e?.[e.length - 1]?.endpoint;
      p.mutate({ conversationId: t, thread_id: n, endpoint: r, source: `button` });
    }, [t, p, c]);
  return (0, $.jsxs)(G, {
    className: `w-11/12 max-w-md`,
    showCloseButton: !1,
    'aria-describedby': `delete-conversation-description`,
    children: [
      (0, $.jsx)(Je, { children: (0, $.jsx)(J, { children: o(`com_ui_delete_conversation`) }) }),
      (0, $.jsx)(`div`, {
        id: `delete-conversation-description`,
        className: `w-full truncate`,
        children: (0, $.jsx)(D, {
          i18nKey: `com_ui_delete_confirm_strong`,
          values: { title: a },
          components: { strong: (0, $.jsx)(`strong`, {}) },
        }),
      }),
      (0, $.jsxs)(`div`, {
        className: `flex justify-end gap-4 pt-4`,
        children: [
          (0, $.jsx)(xe, {
            asChild: !0,
            children: (0, $.jsx)(R, {
              'aria-label': `cancel`,
              variant: `outline`,
              children: o(`com_ui_cancel`),
            }),
          }),
          (0, $.jsx)(R, {
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
  let i = Y(),
    { showToast: a } = q(),
    [o, s] = (0, Q.useState)(t ?? ``),
    c = tt(),
    {
      data: l,
      fetchNextPage: u,
      isFetchingNextPage: d,
    } = mt({ sortBy: `name`, sortDirection: `asc`, limit: 100 }),
    f = (0, Q.useMemo)(() => l?.pages.flatMap((e) => e.projects) ?? [], [l?.pages]),
    p = l?.pages[l.pages.length - 1]?.nextCursor != null,
    m = f.find((e) => e._id === o),
    h = (0, Q.useMemo)(
      () =>
        f.map((e) => ({
          label: e.name,
          value: e._id,
          icon: (0, $.jsx)(T, { className: `h-4 w-4 text-text-secondary`, 'aria-hidden': `true` }),
        })),
      [f],
    ),
    g = !!o && o !== (t ?? ``) && !c.isLoading;
  return (0, $.jsxs)(G, {
    id: `project-conversation-dialog`,
    className: `w-11/12 max-w-md overflow-visible`,
    showCloseButton: !1,
    children: [
      (0, $.jsx)(Je, { children: (0, $.jsx)(J, { children: i(`com_ui_change_project`) }) }),
      (0, $.jsxs)(`div`, {
        className: `flex flex-col gap-2`,
        children: [
          (0, $.jsx)(nt, {
            htmlFor: `change-project-select`,
            className: `text-sm font-medium text-text-primary`,
            children: i(`com_ui_select_project`),
          }),
          (0, $.jsx)(pe, {
            selectId: `change-project-select`,
            selectedValue: o,
            displayValue: m?.name,
            items: h,
            setValue: s,
            SelectIcon: (0, $.jsx)(T, {
              className: `h-4 w-4 text-text-secondary`,
              'aria-hidden': `true`,
            }),
            ariaLabel: i(`com_ui_select_project`),
            searchPlaceholder: i(`com_ui_search_projects`),
            selectPlaceholder: i(`com_ui_select_project`),
            isCollapsed: !1,
            showCarat: !0,
            placement: `bottom-start`,
            portal: !1,
            matchTriggerWidth: !0,
            containerClassName: `w-full px-0`,
            className: `h-10 w-full justify-start gap-2 rounded-xl border border-border-light bg-surface-tertiary px-3 text-sm text-text-primary hover:bg-surface-hover`,
          }),
          p
            ? (0, $.jsx)(R, {
                type: `button`,
                variant: `link`,
                className: `h-auto justify-start px-0 text-sm`,
                onClick: () => u(),
                disabled: d,
                children: i(d ? `com_ui_loading` : `com_ui_load_more`),
              })
            : null,
        ],
      }),
      (0, $.jsxs)(`div`, {
        className: `flex justify-end gap-2 pt-4`,
        children: [
          (0, $.jsx)(xe, {
            asChild: !0,
            children: (0, $.jsx)(R, {
              type: `button`,
              variant: `outline`,
              children: i(`com_ui_cancel`),
            }),
          }),
          (0, $.jsx)(R, {
            type: `button`,
            variant: `submit`,
            onClick: () => {
              g &&
                c.mutate(
                  { conversationId: e, projectId: o },
                  {
                    onSuccess: () => {
                      (r(!1),
                        n?.(!1),
                        a({
                          message: i(`com_ui_project_updated`),
                          severity: X.SUCCESS,
                          showIcon: !0,
                        }));
                    },
                    onError: () => {
                      a({
                        message: i(`com_ui_project_update_error`),
                        severity: X.ERROR,
                        showIcon: !0,
                      });
                    },
                  },
                );
            },
            disabled: !g,
            children: c.isLoading ? (0, $.jsx)(Z, {}) : i(`com_ui_save`),
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
    { announcePolite: n } = me(),
    [r, i] = (0, Q.useState)(!1),
    a = ot({ text: e });
  return (0, $.jsxs)(`div`, {
    className: `relative`,
    children: [
      (0, $.jsx)(et, {
        type: `text`,
        readOnly: !0,
        dir: `ltr`,
        value: e,
        'aria-label': t(`com_ui_shared_link`),
        onFocus: (e) => e.currentTarget.select(),
        className: `h-11 rounded-xl bg-surface-secondary pr-12 text-right text-sm text-text-primary`,
        'data-testid': `shared-link-url`,
      }),
      (0, $.jsx)(Le, {
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
  setShowQR: o,
  sharedLink: s,
  setSharedLink: c,
  snapshotFiles: l,
}) {
  let u = Y(),
    { showToast: d } = q(),
    f = (0, Q.useRef)(null),
    p = (0, Q.useRef)(null),
    [m, h] = (0, Q.useState)(!1),
    [_, v] = (0, Q.useState)(!1),
    [y, b] = (0, Q.useState)(0),
    [x, C] = (0, Q.useState)(!1),
    [w, T] = (0, Q.useState)(!1),
    [te, O] = (0, Q.useState)(``),
    k = e?.shareId ?? ``,
    ne = qe(`(max-width: 768px)`);
  (0, Q.useEffect)(() => {
    T(typeof navigator < `u` && typeof navigator.share == `function`);
  }, []);
  let { mutateAsync: re, isLoading: A } = De(),
    { mutateAsync: ie, isLoading: j } = Oe(),
    M = Qe({
      onSuccess: () => {
        (h(!1),
          setTimeout(() => {
            let e = document
              .getElementById(`share-conversation-dialog`)
              ?.closest(`[role="dialog"]`);
            e instanceof HTMLElement && e.focus();
          }, 0));
      },
      onError: (e) => {
        (console.error(`Delete error:`, e),
          d({ message: u(`com_ui_share_delete_error`), severity: X.ERROR }));
      },
    }),
    N = (e) => pt(e),
    P = (e) => {
      let t = Yt(e),
        n = u(`com_ui_share_error`);
      (t === `TARGET_MESSAGE_NOT_FOUND`
        ? (n = u(`com_ui_share_target_not_saved`))
        : t === `NO_MESSAGES` && (n = u(`com_ui_share_no_messages`)),
        d({ message: n, severity: X.ERROR, showIcon: !0 }));
    },
    ae = () => r?.() ?? Promise.resolve(n),
    F = async () => {
      if (k) {
        C(!0);
        try {
          let e = await Xt(ae, (e) => ie({ shareId: k, targetMessageId: e, snapshotFiles: l }));
          (b((e) => e + 1),
            c(N(e.shareId)),
            v(!1),
            O(u(`com_ui_link_refreshed`)),
            setTimeout(() => {
              O(``);
            }, 1e3));
        } catch (e) {
          (console.error(`Failed to update shared link:`, e), P(e));
        } finally {
          C(!1);
        }
      }
    },
    L = async () => {
      C(!0);
      try {
        let e = await Xt(ae, (e) =>
          re({ conversationId: t, targetMessageId: e, snapshotFiles: l }),
        );
        c(N(e.shareId));
      } catch (e) {
        (console.error(`Failed to create shared link:`, e), P(e));
      } finally {
        C(!1);
      }
    },
    z = async () => {
      if (k)
        try {
          (await M.mutateAsync({ shareId: k }),
            h(!1),
            c(``),
            d({ message: u(`com_ui_shared_link_delete_success`), severity: X.SUCCESS }));
        } catch (e) {
          (console.error(`Failed to delete shared link:`, e),
            d({ message: u(`com_ui_share_delete_error`), severity: X.ERROR }));
        }
    },
    oe = async () => {
      if (!(!w || !s))
        try {
          await navigator.share({ title: u(`com_ui_share_link_to_chat`), url: s });
        } catch (e) {
          if (e.name === `AbortError`) return;
          d({ message: u(`com_ui_share_error`), severity: X.ERROR, showIcon: !0 });
        }
    },
    B = U({ permissionType: Fe.SHARED_LINKS, permission: Xe.SHARE }),
    { hasPermission: se, isLoading: ce } = _e(Ve.SHARED_LINK, e?._id || ``),
    le = B && !ce && se(Ee.SHARE) && !!e?._id,
    ue = u(i ? `com_ui_hide_qr` : `com_ui_show_qr`);
  return (0, $.jsx)($.Fragment, {
    children: (0, $.jsxs)(`div`, {
      className: `flex w-full flex-wrap items-center gap-2`,
      children: [
        !k &&
          (0, $.jsxs)(R, {
            type: `button`,
            disabled: A || x,
            variant: `submit`,
            onClick: L,
            className: `ml-auto min-w-28`,
            children: [
              !A && !x && u(`com_ui_create_link`),
              (A || x) && (0, $.jsx)(Z, { className: `size-4` }),
            ],
          }),
        k &&
          (0, $.jsxs)($.Fragment, {
            children: [
              le &&
                (0, $.jsx)(ve, {
                  resourceType: Ve.SHARED_LINK,
                  resourceDbId: e?._id,
                  resourceName: e?.shareId ?? void 0,
                  children: (0, $.jsx)(I, {
                    description: u(`com_ui_shared_link_manage_access`),
                    render: (e) =>
                      (0, $.jsx)(R, {
                        ...e,
                        type: `button`,
                        size: `icon`,
                        variant: `outline`,
                        className: `size-9 sm:size-10`,
                        'aria-label': u(`com_ui_shared_link_manage_access`),
                        children: (0, $.jsx)(E, { className: `size-4`, 'aria-hidden': `true` }),
                      }),
                  }),
                }),
              (0, $.jsxs)(`div`, {
                className: `ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2`,
                children: [
                  ne &&
                    w &&
                    (0, $.jsx)(I, {
                      description: u(`com_ui_share`),
                      render: (e) =>
                        (0, $.jsx)(R, {
                          ...e,
                          type: `button`,
                          onClick: oe,
                          variant: `outline`,
                          size: `icon`,
                          className: `size-9 sm:size-10`,
                          'aria-label': u(`com_ui_share`),
                          children: (0, $.jsx)(g, { className: `size-4`, 'aria-hidden': `true` }),
                        }),
                    }),
                  (0, $.jsx)(`span`, {
                    className: `sr-only`,
                    'aria-live': `polite`,
                    'aria-atomic': `true`,
                    children: te,
                  }),
                  (0, $.jsx)(I, {
                    description: u(`com_ui_update_shared_link`),
                    render: (e) =>
                      (0, $.jsx)(R, {
                        ...e,
                        ref: p,
                        type: `button`,
                        onClick: () => v(!0),
                        variant: `outline`,
                        size: `icon`,
                        className: `size-9 sm:size-10`,
                        disabled: j || x,
                        'aria-label': u(`com_ui_update_shared_link`),
                        children: (0, $.jsx)(
                          ee,
                          {
                            className:
                              y > 0
                                ? `size-4 animate-refresh-link-spin motion-reduce:animate-none`
                                : `size-4`,
                            'aria-hidden': `true`,
                          },
                          y,
                        ),
                      }),
                  }),
                  (0, $.jsx)(I, {
                    description: ue,
                    render: (e) =>
                      (0, $.jsx)(R, {
                        ...e,
                        type: `button`,
                        onClick: () => o(!i),
                        variant: `outline`,
                        size: `icon`,
                        className: `size-9 sm:size-10`,
                        'aria-pressed': i,
                        'aria-label': ue,
                        children: (0, $.jsx)(a, { className: `size-4`, 'aria-hidden': `true` }),
                      }),
                  }),
                  (0, $.jsx)(I, {
                    description: u(`com_ui_delete_link`),
                    render: (e) =>
                      (0, $.jsx)(R, {
                        ...e,
                        ref: f,
                        type: `button`,
                        onClick: () => h(!0),
                        variant: `destructive`,
                        size: `icon`,
                        className: `size-9 sm:size-10`,
                        'aria-label': u(`com_ui_delete_link`),
                        children: (0, $.jsx)(S, { className: `size-4`, 'aria-hidden': `true` }),
                      }),
                  }),
                ],
              }),
            ],
          }),
        (0, $.jsx)(H, {
          open: _,
          triggerRef: p,
          onOpenChange: v,
          children: (0, $.jsxs)(G, {
            className: `w-11/12 max-w-md`,
            showCloseButton: !1,
            children: [
              (0, $.jsxs)(Je, {
                children: [
                  (0, $.jsx)(J, { children: u(`com_ui_update_shared_link_confirm_title`) }),
                  (0, $.jsx)(V, {
                    className: `text-text-secondary`,
                    children: u(`com_ui_update_shared_link_confirm_description`),
                  }),
                ],
              }),
              (0, $.jsxs)(`div`, {
                className: `flex justify-end gap-2 pt-4`,
                children: [
                  (0, $.jsx)(xe, {
                    asChild: !0,
                    children: (0, $.jsx)(R, { variant: `outline`, children: u(`com_ui_cancel`) }),
                  }),
                  (0, $.jsxs)(R, {
                    type: `button`,
                    variant: `submit`,
                    onClick: F,
                    disabled: j || x,
                    children: [
                      (j || x) && (0, $.jsx)(Z, { className: `size-4` }),
                      u(`com_ui_update_shared_link`),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
        (0, $.jsx)(H, {
          open: m,
          triggerRef: f,
          onOpenChange: h,
          children: (0, $.jsxs)(G, {
            role: `alertdialog`,
            className: `w-11/12 max-w-[450px]`,
            showCloseButton: !1,
            children: [
              (0, $.jsx)(Je, {
                children: (0, $.jsx)(J, { children: u(`com_ui_delete_shared_link_heading`) }),
              }),
              (0, $.jsx)(`div`, {
                className: `flex w-full flex-col items-center gap-2`,
                children: (0, $.jsx)(`div`, {
                  className: `grid w-full items-center gap-2`,
                  children: (0, $.jsx)(nt, {
                    htmlFor: `dialog-confirm-delete`,
                    className: `text-left text-sm font-medium`,
                    children: (0, $.jsx)(D, {
                      i18nKey: `com_ui_delete_confirm_strong`,
                      values: { title: k },
                      components: { strong: (0, $.jsx)(`strong`, {}) },
                    }),
                  }),
                }),
              }),
              (0, $.jsxs)(`div`, {
                className: `flex justify-end gap-4 pt-4`,
                children: [
                  (0, $.jsx)(xe, {
                    asChild: !0,
                    children: (0, $.jsx)(R, { variant: `outline`, children: u(`com_ui_cancel`) }),
                  }),
                  (0, $.jsx)(R, {
                    variant: `destructive`,
                    onClick: z,
                    disabled: M.isLoading,
                    children: M.isLoading
                      ? (0, $.jsx)(Z, { className: `size-4` })
                      : u(`com_ui_delete_link`),
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
    { data: o } = Ce(),
    s = o?.sharedLinksSnapshotFilesEnabled === !0,
    c = A(),
    [l, u] = (0, Q.useState)(!0),
    [d, p] = (0, Q.useState)(``),
    [m, h] = (0, Q.useState)(!0),
    g = Q.useRef(null),
    _ = f(oe.conversationIdByIndex(0)),
    v = it(0),
    y = Ae(0),
    b = _ === e,
    x = b ? v : null,
    S = (0, Q.useCallback)(async () => {
      let t = y()?.messageId ?? x;
      if (
        ((t ||=
          (await c.fetchQuery([Ye.messages, e], () => Be.getMessagesByConvoId(e), { staleTime: 0 }),
          y()?.messageId ?? null)),
        !t)
      )
        throw Qt(`NO_MESSAGES`);
      if (!(await Be.getMessageById(e, t)).some((e) => e.messageId === t))
        throw Qt(`TARGET_MESSAGE_NOT_FOUND`);
      return t;
    }, [e, y, x, c]),
    { data: C, isLoading: ee } = N(e),
    w = C?.shareId ?? ``;
  ((0, Q.useEffect)(() => {
    p(w ? pt(w) : ``);
  }, [e, w]),
    (0, Q.useEffect)(() => {
      h(C?.success === !0 && typeof C.snapshotFiles == `boolean` ? C.snapshotFiles : !0);
    }, [e, C?.success, C?.snapshotFiles]));
  let T =
    ee === !0
      ? null
      : (0, $.jsx)(Zt, {
          share: C,
          conversationId: e,
          targetMessageId: x ?? void 0,
          resolveTargetMessageId: b ? S : void 0,
          showQR: l,
          setShowQR: u,
          sharedLink: d,
          setSharedLink: p,
          snapshotFiles: s ? m : void 0,
        });
  return (0, $.jsxs)(H, {
    open: t,
    onOpenChange: n,
    triggerRef: r,
    children: [
      i,
      (0, $.jsxs)(G, {
        className: `flex max-h-[90vh] w-11/12 max-w-md flex-col gap-0 overflow-hidden p-0 shadow-2xl`,
        onOpenAutoFocus: (e) => {
          g.current && (e.preventDefault(), g.current.focus());
        },
        children: [
          (0, $.jsxs)(Je, {
            className: `shrink-0 px-6 pb-0 pr-14 pt-6 text-left`,
            children: [
              (0, $.jsxs)(`div`, {
                className: `flex items-center gap-2`,
                children: [
                  (0, $.jsx)(J, {
                    className: `text-xl font-semibold tracking-tight`,
                    children: a(`com_ui_share_link_to_chat`),
                  }),
                  (0, $.jsx)(Te, {
                    icon: `info`,
                    side: Ge.Bottom,
                    text:
                      C?.success === !0
                        ? a(`com_ui_share_update_message`)
                        : a(`com_ui_share_create_message`),
                  }),
                ],
              }),
              (0, $.jsx)(V, {
                className: `sr-only`,
                children:
                  C?.success === !0
                    ? a(`com_ui_share_update_message`)
                    : a(`com_ui_share_create_message`),
              }),
            ],
          }),
          ee === !0
            ? (0, $.jsx)(`div`, {
                className: `flex min-h-72 items-center justify-center px-6 pb-6`,
                children: (0, $.jsx)(Z, { className: `size-6` }),
              })
            : (0, $.jsxs)(`div`, {
                id: `share-conversation-dialog`,
                className: `min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-6 pt-6`,
                children: [
                  s &&
                    (0, $.jsxs)(`div`, {
                      className: `flex items-center justify-between gap-4`,
                      children: [
                        (0, $.jsxs)(`div`, {
                          className: `flex min-w-0 items-center gap-2`,
                          children: [
                            (0, $.jsx)(nt, {
                              id: `share-files-label`,
                              htmlFor: `share-files-switch`,
                              className: `cursor-pointer text-sm font-medium text-text-primary`,
                              children: a(`com_ui_share_files`),
                            }),
                            (0, $.jsx)(Te, {
                              icon: `info`,
                              side: Ge.Bottom,
                              text: `${a(`com_ui_share_files_description`)}${w ? ` ${a(`com_ui_share_files_update_note`)}` : ``}`,
                            }),
                          ],
                        }),
                        (0, $.jsx)($e, {
                          ref: g,
                          id: `share-files-switch`,
                          checked: m,
                          onCheckedChange: h,
                          'aria-labelledby': `share-files-label`,
                        }),
                      ],
                    }),
                  l &&
                    w &&
                    (0, $.jsx)(`div`, {
                      className: `flex min-h-56 items-center justify-center py-1`,
                      children: (0, $.jsx)(`div`, {
                        className: `rounded-2xl bg-surface-qr p-3 shadow-sm`,
                        children: (0, $.jsx)(ft, {
                          value: d,
                          size: 200,
                          marginSize: 1,
                          title: a(`com_ui_share_qr_code_description`),
                        }),
                      }),
                    }),
                  w && (0, $.jsx)(Jt, { sharedLink: d }),
                  (0, $.jsx)(`div`, { className: `pt-1`, children: T }),
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
  isArchived: a = !1,
  retainView: u,
  renameHandler: d,
  isPopoverActive: f,
  setIsPopoverActive: p,
  isActiveConvo: g,
  isShiftHeld: y = !1,
}) {
  let b = Y(),
    x = A(),
    S = qe(`(max-width: 768px)`),
    { index: C, setConversation: ee } = rt(),
    { data: w } = Ce(),
    { navigateToConvo: T } = Ke(C),
    { showToast: E } = q(),
    { announcePolite: D } = me(),
    te = re(),
    { conversationId: O } = ne(),
    k = (0, Q.useRef)(O);
  k.current = O;
  let { newConversation: ie } = Me(),
    j = (0, Q.useId)(),
    M = (0, Q.useRef)(null),
    N = (0, Q.useRef)(null),
    P = (0, Q.useRef)(null),
    ae = (0, Q.useRef)(null),
    [F, I] = (0, Q.useState)(!1),
    [L, R] = (0, Q.useState)(!1),
    [z, oe] = (0, Q.useState)(!1),
    B = U({ permissionType: Fe.SHARED_LINKS, permission: Xe.CREATE }),
    V = We(),
    se = tt(),
    ce = He(),
    H = je({
      onSuccess: () => {
        ((O === e || O === `new`) && (ie(), te(`/c/new`, { replace: !0 })),
          u(),
          E({ message: b(`com_ui_convo_delete_success`), severity: X.SUCCESS, showIcon: !0 }));
      },
      onError: () => {
        E({ message: b(`com_ui_convo_delete_error`), severity: X.ERROR, showIcon: !0 });
      },
    }),
    le = Ne({
      onSuccess: (e) => {
        (T(e.conversation),
          E({ message: b(`com_ui_duplication_success`), status: `success` }),
          p(!1));
      },
      onMutate: () => {
        E({ message: b(`com_ui_duplication_processing`), status: `info` });
      },
      onError: () => {
        E({ message: b(`com_ui_duplication_error`), status: `error` });
      },
    }),
    ue = le.isLoading,
    de = V.isLoading,
    fe = ce.isLoading,
    pe = H.isLoading,
    W = (0, Q.useCallback)(() => {
      I(!0);
    }, []),
    ge = (0, Q.useCallback)(() => {
      R(!0);
    }, []),
    _e = (0, Q.useCallback)(() => {
      oe(!0);
    }, []),
    ve = (0, Q.useCallback)(() => {
      let t = e ?? ``;
      t &&
        se.mutate(
          { conversationId: t, projectId: null },
          {
            onSuccess: () => {
              (p(!1),
                E({ message: b(`com_ui_project_updated`), severity: X.SUCCESS, showIcon: !0 }));
            },
            onError: () => {
              E({ message: b(`com_ui_project_update_error`), severity: X.ERROR, showIcon: !0 });
            },
          },
        );
    }, [se, e, b, p, E]),
    ye = (0, Q.useCallback)(
      (t) => {
        t.stopPropagation();
        let n = e ?? ``;
        if (!n) return;
        let r = x.getQueryData([Ye.messages, n]),
          i = r?.[r.length - 1]?.thread_id,
          a = r?.[r.length - 1]?.endpoint;
        H.mutate({ conversationId: n, thread_id: i, endpoint: a, source: `button` });
      },
      [e, H, x],
    ),
    be = (0, Q.useCallback)(
      async (t) => {
        t?.stopPropagation();
        let n = e ?? ``;
        n &&
          V.mutate(
            { conversationId: n, isArchived: !a },
            {
              onSuccess: () => {
                (ee((e) => (e?.conversationId === n ? { ...e, isArchived: !a } : e)),
                  D({
                    message: b(a ? `com_ui_convo_unarchived` : `com_ui_convo_archived`),
                    isStatus: !0,
                  }));
                let e = k.current;
                (!a && (e === n || e === `new`) && (ie(), te(`/c/new`, { replace: !0 })),
                  u(),
                  p(!1));
              },
              onError: () => {
                E({
                  message: b(a ? `com_ui_unarchive_error` : `com_ui_archive_error`),
                  severity: X.ERROR,
                  showIcon: !0,
                });
              },
            },
          );
      },
      [e, a, ee, V, te, ie, u, p, D, E, b],
    ),
    xe = (0, Q.useCallback)(() => {
      let t = e ?? ``;
      t &&
        ce.mutate(
          { conversationId: t, pinned: !r },
          {
            onSuccess: () => p(!1),
            onError: () => {
              E({
                message: b(r ? `com_ui_unpin_error` : `com_ui_pin_error`),
                severity: X.ERROR,
                showIcon: !0,
              });
            },
          },
        );
    }, [e, r, ce, p, E, b]),
    Se = (0, Q.useCallback)(() => {
      le.mutate({ conversationId: e ?? `` });
    }, [e, le]),
    G = (0, Q.useMemo)(
      () => [
        {
          label: b(`com_ui_share`),
          onClick: W,
          icon: (0, $.jsx)(v, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
          show: w && w.sharedLinksEnabled && B,
          ariaHasPopup: `dialog`,
          ariaControls: `share-conversation-dialog`,
          hideOnClick: !1,
          ref: N,
          render: (e) => (0, $.jsx)(`button`, { ...e }),
        },
        {
          label: b(r ? `com_ui_unpin` : `com_ui_pin`),
          onClick: xe,
          hideOnClick: !1,
          icon: fe
            ? (0, $.jsx)(Z, { className: `size-4` })
            : (0, $.jsx)(l, { className: `icon-sm mr-2 text-text-primary`, 'aria-hidden': `true` }),
        },
        {
          label: b(`com_ui_rename`),
          onClick: d,
          icon: (0, $.jsx)(s, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
        },
        {
          label: b(`com_ui_duplicate`),
          onClick: Se,
          hideOnClick: !1,
          icon: ue
            ? (0, $.jsx)(Z, { className: `size-4` })
            : (0, $.jsx)(h, { className: `icon-sm mr-2 text-text-primary`, 'aria-hidden': `true` }),
        },
        {
          label: b(`com_ui_change_project`),
          onClick: _e,
          icon: (0, $.jsx)(m, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
          ariaHasPopup: `dialog`,
          ariaControls: `project-conversation-dialog`,
          hideOnClick: !1,
          ref: ae,
          render: (e) => (0, $.jsx)(`button`, { ...e }),
        },
        {
          label: b(`com_ui_remove_from_project`),
          onClick: ve,
          show: !!t,
          hideOnClick: !1,
          icon: se.isLoading
            ? (0, $.jsx)(Z, { className: `size-4` })
            : (0, $.jsx)(i, { className: `icon-sm mr-2 text-text-primary`, 'aria-hidden': `true` }),
        },
        {
          label: b(a ? `com_ui_unarchive` : `com_ui_archive`),
          onClick: be,
          hideOnClick: !1,
          icon: en(de, a, `icon-sm mr-2 text-text-primary`),
        },
        {
          label: b(`com_ui_delete`),
          onClick: ge,
          icon: (0, $.jsx)(c, {
            className: `icon-sm mr-2 text-text-primary`,
            'aria-hidden': `true`,
          }),
          ariaHasPopup: `dialog`,
          ariaControls: `delete-conversation-dialog`,
          hideOnClick: !1,
          ref: P,
          render: (e) => (0, $.jsx)(`button`, { ...e }),
        },
      ],
      [b, r, fe, W, w, d, ge, de, a, ue, xe, be, B, Se, _e, ve, t, se.isLoading],
    ),
    J = K(
      he({ variant: `row-action`, size: `icon-xs` }),
      `text-text-secondary`,
      g === !0 || f || S
        ? `opacity-100`
        : `opacity-0 focus:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100`,
    );
  return y && g && !f && !F && !L
    ? (0, $.jsxs)(`div`, {
        className: `flex items-center gap-0.5`,
        children: [
          (0, $.jsx)(`button`, {
            'aria-label': b(a ? `com_ui_unarchive` : `com_ui_archive`),
            className: J,
            onClick: be,
            disabled: de,
            children: en(de, a, `icon-md text-text-secondary`),
          }),
          (0, $.jsx)(`button`, {
            'aria-label': b(`com_ui_delete`),
            className: J,
            onClick: ye,
            disabled: pe,
            children: pe
              ? (0, $.jsx)(Z, { className: `size-4` })
              : (0, $.jsx)(c, { className: `icon-md text-text-secondary`, 'aria-hidden': !0 }),
          }),
        ],
      })
    : (0, $.jsxs)($.Fragment, {
        children: [
          (0, $.jsx)(Ze, {
            portal: !0,
            menuId: j,
            focusLoop: !0,
            className: `z-[125]`,
            unmountOnHide: !0,
            isOpen: f,
            setIsOpen: p,
            trigger: (0, $.jsx)(o, {
              ref: M,
              id: `conversation-menu-${e}`,
              'aria-label': b(`com_nav_convo_menu_options`),
              'aria-expanded': f,
              className: K(J, `gap-2`, f && `bg-surface-active text-text-primary`),
              onClick: (e) => {
                e.stopPropagation();
              },
              onKeyDown: (e) => {
                (e.key === `Enter` || e.key === ` `) && e.stopPropagation();
              },
              children: (0, $.jsx)(_, { className: `icon-md`, 'aria-hidden': !0 }),
            }),
            items: G,
          }),
          F && (0, $.jsx)($t, { conversationId: e ?? ``, open: F, onOpenChange: I, triggerRef: N }),
          L &&
            (0, $.jsx)(Gt, {
              title: n ?? ``,
              retainView: u,
              triggerRef: P,
              setMenuOpen: p,
              showDeleteDialog: L,
              conversationId: e ?? ``,
              setShowDeleteDialog: R,
            }),
          z &&
            (0, $.jsx)(qt, {
              conversationId: e ?? ``,
              chatProjectId: t,
              setMenuOpen: p,
              triggerRef: M,
              showProjectDialog: z,
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
    o = qe(`(max-width: 768px)`),
    [s, c] = (0, Q.useState)(!1),
    l = (e) => {
      (e && c(!0), r(e));
    };
  return (o ? n || t || s : e || t)
    ? (0, $.jsx)(nn, { ...i, isActiveConvo: t, isPopoverActive: n, setIsPopoverActive: l })
    : o
      ? (0, $.jsx)(R, {
          size: `icon`,
          variant: `ghost`,
          'aria-label': a(`com_nav_convo_menu_options`),
          'data-testid': `convo-options-trigger`,
          className: `size-9 text-text-secondary`,
          onClick: (e) => {
            (e.stopPropagation(), l(!0));
          },
          children: (0, $.jsx)(_, { className: `icon-md`, 'aria-hidden': `true` }),
        })
      : null;
}
var an = (0, Q.memo)(rn);
function on({ onClick: e, onKeyDown: t, testId: n, keepVisible: r = !1, className: i }) {
  let a = Y(),
    o = qe(`(hover: hover)`);
  return (0, $.jsx)(I, {
    description: a(`com_ui_unpin`),
    side: `top`,
    render: (0, $.jsx)(R, {
      variant: `row-action`,
      size: `icon-xs`,
      'aria-label': a(`com_ui_unpin`),
      'data-testid': n,
      onClick: e,
      onKeyDown: t,
      className: K(
        `shrink-0 text-text-secondary`,
        o &&
          !r &&
          `pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100`,
        i,
      ),
      children: (0, $.jsx)(d, { className: `size-4`, 'aria-hidden': `true` }),
    }),
  });
}
var sn = ({ titleInput: e, setTitleInput: t, onSubmit: n, onCancel: i, localize: a }) => {
    let o = (0, Q.useRef)(null);
    return (
      (0, Q.useEffect)(() => {
        o.current && (o.current.focus(), o.current.select());
      }, []),
      (0, $.jsxs)(`div`, {
        className: `absolute inset-0 z-20 flex w-full items-center rounded-lg bg-surface-active-alt p-1.5`,
        role: `form`,
        'aria-label': a(`com_ui_rename_conversation`),
        children: [
          (0, $.jsx)(et, {
            ref: o,
            type: `text`,
            className: K(
              `h-auto w-full rounded border-0 bg-transparent p-0.5 text-sm leading-tight focus-visible:outline-none`,
            ),
            value: e,
            onChange: (e) => t(e.target.value),
            onKeyDown: (t) => {
              switch (t.key) {
                case `Escape`:
                  i();
                  break;
                case `Enter`:
                  n(e);
              }
            },
            maxLength: 100,
            'aria-label': a(`com_ui_new_conversation_title`),
          }),
          (0, $.jsxs)(`div`, {
            className: `flex gap-1`,
            role: `toolbar`,
            children: [
              (0, $.jsx)(R, {
                variant: `row-action`,
                size: `icon`,
                onClick: () => i(),
                className: K(
                  `size-auto p-1 focus:outline-none focus:ring-2 focus:ring-text-primary`,
                ),
                'aria-label': a(`com_ui_cancel`),
                type: `button`,
                children: (0, $.jsx)(u, { className: `h-4 w-4`, 'aria-hidden': `true` }),
              }),
              (0, $.jsx)(R, {
                variant: `row-action`,
                size: `icon`,
                onClick: () => n(e),
                className: K(
                  `size-auto p-1 focus:outline-none focus:ring-2 focus:ring-text-primary`,
                ),
                'aria-label': a(`com_ui_save`),
                type: `button`,
                children: (0, $.jsx)(r, { className: `h-4 w-4`, 'aria-hidden': `true` }),
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
        className: K(
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
            className: K(
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
  keyShortcuts: o,
}) {
  let s = ne(),
    c = Y(),
    { showToast: l } = q(),
    { navigateToConvo: u } = Ke(),
    d = (0, Q.useMemo)(() => s.conversationId, [s.conversationId]),
    p = at(d ?? ``),
    m = He(),
    h = f(oe.allConversationsSelector),
    g = qe(`(max-width: 768px)`),
    { data: _ } = Ce(),
    v = _?.sharedLinksEnabled === !0,
    b = e.isShared === !0 && v,
    x = ge(),
    { conversationId: S, title: C = `` } = e,
    [ee, w] = (0, Q.useState)(C || ``),
    [T, E] = (0, Q.useState)(!1),
    [D, te] = (0, Q.useState)(!1),
    [k, re] = (0, Q.useState)(!1),
    [A, ie] = (0, Q.useState)(!1),
    j = (0, Q.useRef)(C),
    M = (0, Q.useRef)(null),
    N = (0, Q.useRef)(a);
  N.current = a;
  let P = (0, Q.useCallback)((e) => {
    (E(e), N.current?.(e));
  }, []);
  (0, Q.useEffect)(
    () => () => {
      N.current?.(!1);
    },
    [],
  );
  let ae = qe(`(hover: hover)`),
    [, F] = O({
      type: _t,
      item: () => ({
        conversationId: S ?? ``,
        chatProjectId: e.chatProjectId ?? null,
        pinned: e.pinned === !0,
      }),
    });
  (F(i && ae && !T ? M : null),
    (0, Q.useEffect)(() => {
      C !== j.current && (w(C), (j.current = C));
    }, [C]));
  let I = (0, Q.useMemo)(
      () => (S === B.NEW_CONVO ? d === B.NEW_CONVO : d === B.NEW_CONVO ? h?.[0] === S : d === S),
      [d, S, h],
    ),
    L = () => {
      (te(!1), w(C), P(!0));
    },
    R = async (e) => {
      if (!S || e === C) {
        P(!1);
        return;
      }
      try {
        (await p.mutateAsync({ conversationId: S, title: e.trim() || c(`com_ui_untitled`) }),
          P(!1));
      } catch (e) {
        (Ie.error(`Error renaming conversation`, e),
          w(C),
          l({ message: c(`com_ui_rename_failed`), severity: X.ERROR, showIcon: !0 }),
          P(!1));
      }
    },
    z = () => {
      (w(C), P(!1));
    },
    V = (0, Q.useCallback)(() => {
      ie(!0);
    }, []),
    se = (0, Q.useCallback)(() => {
      if (!S) return;
      let e = M.current,
        t = e?.contains(document.activeElement) === !0 ? (Vt(e) ?? Ht(e)) : null;
      m.mutate(
        { conversationId: S, pinned: !1 },
        {
          onSuccess: () => {
            let n = document.activeElement,
              r = e?.contains(n) === !0,
              i = e?.isConnected === !1 && (n === document.body || n === document.documentElement);
            t?.isConnected && (r || i) && t.focus();
          },
          onError: () => {
            l({ message: c(`com_ui_unpin_error`), severity: X.ERROR, showIcon: !0 });
          },
        },
      );
    }, [S, m, l, c]),
    ce = (0, Q.useCallback)((e) => {
      te(e);
    }, []),
    H = (t) => {
      if (t && !r) {
        n();
        let e = window.location.origin,
          t = `/c/${S}`;
        window.open(e + t, `_blank`);
        return;
      }
      d === S ||
        D ||
        n(() => {
          (ue(C), u(e, { currentConvoId: d }));
        });
    },
    le = {
      title: C,
      isPinned: e.pinned,
      isArchived: e.isArchived === !0,
      retainView: t,
      renameHandler: L,
      isActiveConvo: I,
      conversationId: S,
      chatProjectId: e.chatProjectId,
      isPopoverActive: D,
      onOpenChange: ce,
      isShiftHeld: I ? x : !1,
    },
    de = (0, $.jsx)(`span`, {
      role: `img`,
      'aria-label': c(`com_ui_generating`),
      children: (0, $.jsx)(Z, { className: `h-5 w-5 flex-shrink-0 text-text-primary` }),
    }),
    fe = `pointer-events-none w-0 scale-x-0 opacity-0 group-focus-within:pointer-events-auto group-focus-within:scale-x-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:scale-x-100 group-hover:opacity-100`,
    U = g ? `group-focus-within:w-9 group-hover:w-9` : `group-focus-within:w-7 group-hover:w-7`;
  r
    ? ((fe = `pointer-events-none w-5 scale-x-100 opacity-100`), (U = ``))
    : (D || I || g) &&
      ((fe = `pointer-events-auto scale-x-100 opacity-100`),
      (U = !D && I && x ? `w-[60px]` : g ? `w-9` : `w-7`));
  let pe = null;
  return (
    r ? (pe = de) : T || (pe = (0, $.jsx)(an, { ...le, hasInteracted: A })),
    (0, $.jsxs)(`div`, {
      ref: M,
      className: K(
        `group relative flex h-12 w-full items-center rounded-lg outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text-primary md:h-9`,
        I || D
          ? `bg-surface-active-alt before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-full before:bg-text-primary`
          : `hover:bg-surface-active-alt`,
      ),
      onPointerEnter: (e) => {
        e.pointerType === `mouse` && re(!0);
      },
      onPointerLeave: () => re(!1),
      onPointerCancel: () => re(!1),
      onMouseEnter: V,
      onFocus: V,
      onClick: (e) => {
        T || (e.button === 0 && H(e.ctrlKey || e.metaKey));
      },
      style: { cursor: T ? `default` : `pointer` },
      'data-testid': `convo-item`,
      children: [
        T
          ? (0, $.jsx)(sn, {
              titleInput: ee,
              setTitleInput: w,
              onSubmit: R,
              onCancel: z,
              localize: c,
            })
          : (0, $.jsx)(fn, {
              isActiveConvo: I,
              isPopoverActive: D,
              isHovered: k,
              isSharedBadgeVisible: b,
              title: C,
              onRename: L,
              isSmallScreen: g,
              localize: c,
              keyShortcuts: o,
              children: (0, $.jsx)(It, { conversation: e, size: 20, context: `menu-item` }),
            }),
        b &&
          (0, $.jsx)(y, {
            className: `icon-sm mr-1 shrink-0 text-text-secondary`,
            'aria-hidden': `true`,
          }),
        e.pinned === !0 &&
          (0, $.jsx)(on, {
            testId: `convo-unpin-button`,
            className: `mr-1`,
            keepVisible: D,
            onClick: (e) => {
              (e.stopPropagation(), se());
            },
          }),
        (0, $.jsx)(`div`, {
          className: K(`mr-1 flex shrink-0 origin-left items-center justify-center`, fe, U),
          children: pe,
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
var _n = (0, Q.memo)(({ isExpanded: e, onToggle: t, trailing: n, highlight: r }) => {
  let i = Y();
  return (0, $.jsxs)(`div`, {
    className: K(`flex h-8 w-full items-center pr-2`, r && `rounded-lg bg-surface-active-alt`),
    children: [
      (0, $.jsxs)(`button`, {
        onClick: t,
        className: K(he({ variant: `section-header` }), `group min-w-0 flex-1`),
        type: `button`,
        'aria-expanded': e,
        children: [
          (0, $.jsx)(`span`, { className: `select-none truncate`, children: i(`com_ui_chats`) }),
          (0, $.jsx)(w, {
            className: K(
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
    className: K(`pl-1 pt-1 text-text-secondary`, t === !0 ? `mt-0` : `mt-2`),
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
    isSearchLoading: o,
    isChatsExpanded: s,
    setIsChatsExpanded: c,
    chatsHeaderTrailing: l,
    hasNextPage: u = !1,
    isError: d = !1,
    onRetry: m,
    scrollViewport: h,
    scrollContent: g,
  }) => {
    let _ = Y(),
      v = f(oe.search),
      y = C(P),
      b = C(se),
      x = C(fe),
      S = C(st),
      ee = p(be),
      w = qe(`(max-width: 768px)`),
      T = wt(),
      E = Tt(),
      D = Ct(),
      O = (0, Q.useRef)(null),
      [{ isDropOver: k, canDrop: ne }, re] = te({
        accept: _t,
        canDrop: (e) => D(e) != null || e.pinned === !0,
        hover: () => bt(),
        drop: (e) => {
          T(e, null).then((t) => {
            t && E(e);
          });
        },
        collect: (e) => ({ isDropOver: e.isOver(), canDrop: e.canDrop() }),
      });
    re(O);
    let A = w ? 44 : 34,
      { ref: ie, width: j } = de(),
      { ref: M, height: N, scrollTop: ae, isOnScreen: F } = le(h, g),
      I = (0, Q.useCallback)(
        (e) => {
          (ie(e), M(e));
        },
        [ie, M],
      ),
      { data: L } = ke(),
      R = (0, Q.useRef)(null),
      z = (0, Q.useMemo)(() => {
        let e = L?.activeJobIds ?? [],
          t = new Set(e),
          n = R.current;
        return n && t.size === n.size && e.every((e) => n.has(e)) ? n : ((R.current = t), t);
      }, [L?.activeJobIds]),
      B = (0, Q.useMemo)(() => e.filter(Boolean), [e]),
      V = b || !!v.query,
      ce = (0, Q.useMemo)(
        () => Re(B, { field: y.field, direction: y.direction, includePinned: V }),
        [B, V, y.direction, y.field],
      ),
      H = (0, Q.useMemo)(
        () => At(ce, z, { field: y.field, direction: y.direction, includePinned: b }),
        [ce, z, b, y.direction, y.field],
      ),
      ue = (0, Q.useRef)(null);
    ((0, Q.useEffect)(() => {
      s || (ue.current = null);
    }, [s]),
      (0, Q.useEffect)(() => {
        !s || a || o || H.length > 0 || (ue.current !== e && ((ue.current = e), i()));
      }, [s, a, o, H.length, e, i]));
    let U = (0, Q.useMemo)(() => {
        let e = [];
        return (
          s &&
            (H.forEach(([t, n]) => {
              (e.push({ type: `header`, groupName: t }),
                e.push(...n.map((e) => ({ type: `convo`, convo: e }))));
            }),
            a && e.push({ type: `loading` })),
          e
        );
      }, [H, a, s]),
      pe = (0, Q.useRef)(U);
    pe.current = U;
    let W = (0, Q.useMemo)(
      () =>
        new ct({
          fixedWidth: !0,
          defaultHeight: A,
          keyMapper: (e) => {
            let t = pe.current[e];
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
      [A],
    );
    ((0, Q.useEffect)(() => {
      let e = requestAnimationFrame(() => {
        (W.clearAll(),
          r.current && `recomputeRowHeights` in r.current && r.current.recomputeRowHeights(0));
      });
      return () => cancelAnimationFrame(e);
    }, [v.query, W, r]),
      (0, Q.useEffect)(() => {
        let e = requestAnimationFrame(() => {
          r.current && `recomputeRowHeights` in r.current && r.current.recomputeRowHeights(0);
        });
        return () => cancelAnimationFrame(e);
      }, [U, r]));
    let me = (0, Q.useRef)(0);
    (0, Q.useEffect)(() => {
      if (j === 0 || j === me.current) return;
      me.current = j;
      let e = requestAnimationFrame(() => {
        (W.clearAll(),
          r.current && `recomputeRowHeights` in r.current && r.current.recomputeRowHeights(0));
      });
      return () => cancelAnimationFrame(e);
    }, [j, W, r]);
    let he = (0, Q.useCallback)(
        ({ index: e, key: r, parent: i, style: a }) => {
          let o = U[e],
            s = { cache: W, rowKey: r, parent: i, index: e, style: a };
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
                  isAlphabetical: Se(y.field),
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
        [W, U, t, n, z, y.field],
      ),
      ge = (0, Q.useCallback)(({ index: e }) => W.getHeight(e, 0), [W]),
      _e = (0, Q.useMemo)(() => (0, gt.default)(i, 300), [i]),
      ve = (0, Q.useCallback)(
        ({ stopIndex: e }) => {
          F() && e >= U.length - 8 && _e();
        },
        [U.length, _e, F],
      ),
      ye = s && d && !a && !o && B.length === 0,
      xe = !v.query && S.length === 0 && !b && B.length > 0,
      Ce = s && !a && !o && !ye && !u && H.length === 0 && !xe,
      G = `com_ui_no_chats`;
    v.query
      ? (G = `com_ui_no_search_results`)
      : S.length > 0
        ? (G = `com_ui_no_chats_match_filters`)
        : b && (G = `com_ui_no_archived_chats`);
    let K = (0, $.jsx)(`div`, {
      ref: I,
      className: `flex-1`,
      children: (0, $.jsx)(ut, {
        ref: r,
        autoHeight: !0,
        width: j,
        height: N,
        scrollTop: ae,
        deferredMeasurementCache: W,
        rowCount: U.length,
        rowHeight: ge,
        rowRenderer: he,
        overscanRowCount: 10,
        'aria-readonly': !1,
        className: `outline-none`,
        'aria-label': `Conversations`,
        onRowsRendered: ve,
        tabIndex: -1,
        style: { outline: `none` },
        containerRole: `rowgroup`,
      }),
    });
    return (
      o
        ? (K = (0, $.jsxs)(`div`, {
            className: `flex flex-1 items-center justify-center`,
            children: [
              (0, $.jsx)(Z, { className: `text-text-primary` }),
              (0, $.jsx)(`span`, {
                className: `ml-2 text-text-primary`,
                children: _(`com_ui_loading`),
              }),
            ],
          }))
        : ye
          ? (K = (0, $.jsxs)(`div`, {
              className: `flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center`,
              'data-testid': `convo-list-error`,
              role: `alert`,
              children: [
                (0, $.jsx)(`span`, {
                  className: `text-sm text-text-secondary`,
                  children: _(`com_ui_chats_load_error`),
                }),
                m &&
                  (0, $.jsx)(`button`, {
                    type: `button`,
                    onClick: m,
                    className: `rounded-lg px-2 py-1 text-sm text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                    children: _(`com_ui_retry`),
                  }),
              ],
            }))
          : Ce &&
            (K = (0, $.jsxs)(`div`, {
              className: `flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center`,
              'data-testid': `convo-list-empty`,
              children: [
                (0, $.jsx)(`span`, { className: `text-sm text-text-secondary`, children: _(G) }),
                x > 0 &&
                  (0, $.jsx)(`button`, {
                    type: `button`,
                    onClick: () => ee(),
                    className: `rounded-lg px-2 py-1 text-sm text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
                    children: _(`com_ui_clear_filters`),
                  }),
              ],
            })),
      (0, $.jsxs)(`div`, {
        ref: O,
        className: `relative flex flex-1 flex-col pb-2 text-sm text-text-primary`,
        children: [
          (0, $.jsx)(`div`, {
            className: `px-3`,
            children: (0, $.jsx)(_n, {
              isExpanded: s,
              onToggle: () => c(!s),
              trailing: l,
              highlight: k && ne,
            }),
          }),
          K,
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
    f = ye(),
    { showToast: p } = q();
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
      (0, $.jsx)(W, {
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
                (0, $.jsx)(nt, {
                  htmlFor: `${o}-name`,
                  className: `text-sm font-medium text-text-primary`,
                  children: a(`com_ui_project_name`),
                }),
                (0, $.jsx)(et, {
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
                (0, $.jsxs)(nt, {
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
                (0, $.jsx)(we, {
                  id: `${o}-description`,
                  value: u,
                  onChange: (e) => d(e.target.value),
                  rows: 3,
                  maxLength: Pe,
                  className: `min-h-[4.5rem] bg-transparent`,
                }),
              ],
            }),
          ],
        }),
        buttons: (0, $.jsx)(R, {
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
    i = re(),
    a = k(),
    o = z(),
    { showToast: s } = q();
  return (0, $.jsx)(H, {
    open: e,
    onOpenChange: t,
    children: (0, $.jsxs)(G, {
      className: `w-11/12 max-w-md`,
      showCloseButton: !1,
      children: [
        (0, $.jsx)(Je, { children: (0, $.jsx)(J, { children: r(`com_ui_delete_project`) }) }),
        (0, $.jsx)(`div`, {
          className: `text-sm text-text-secondary`,
          children: r(`com_ui_delete_project_confirm`, { name: n.name }),
        }),
        (0, $.jsxs)(`div`, {
          className: `flex justify-end gap-4 pt-4`,
          children: [
            (0, $.jsx)(xe, {
              asChild: !0,
              children: (0, $.jsx)(R, {
                'aria-label': r(`com_ui_cancel`),
                variant: `outline`,
                children: r(`com_ui_cancel`),
              }),
            }),
            (0, $.jsx)(R, {
              variant: `destructive`,
              onClick: () => {
                o.mutate(n._id, {
                  onSuccess: () => {
                    (t(!1), a.pathname === `/projects/${n._id}` && i(`/projects`));
                  },
                  onError: () =>
                    s({
                      message: r(`com_ui_project_delete_error`),
                      severity: X.ERROR,
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
    f = L(),
    { showToast: p } = q();
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
    children: (0, $.jsx)(W, {
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
                      severity: X.ERROR,
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
              (0, $.jsx)(nt, {
                htmlFor: `${i}-name`,
                className: `text-sm font-medium text-text-primary`,
                children: r(`com_ui_project_name`),
              }),
              (0, $.jsx)(et, {
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
              (0, $.jsxs)(nt, {
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
              (0, $.jsx)(we, {
                id: `${i}-description`,
                value: c,
                onChange: (e) => l(e.target.value),
                rows: 3,
                maxLength: Pe,
                className: `min-h-[4.5rem] bg-transparent`,
              }),
            ],
          }),
        ],
      }),
      buttons: (0, $.jsx)(R, {
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
