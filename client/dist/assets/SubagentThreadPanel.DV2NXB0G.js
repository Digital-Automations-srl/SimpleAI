import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  Ct as r,
  Et as i,
  Nt as a,
  Tt as o,
  Vn as s,
  jt as c,
  u as l,
  wi as u,
  wt as d,
} from './vendor.BQmuAj0u.js';
import { n as f } from './mermaid.C3Ct62iP.js';
import { r as p } from './query-devtools.DIz6FZCX.js';
import {
  Af as m,
  Bn as h,
  Bp as ee,
  Hp as g,
  Ju as te,
  Mp as _,
  O_ as v,
  P_ as ne,
  Qh as re,
  _r as ie,
  ar as ae,
  cr as oe,
  do as se,
  dr as ce,
  ds as le,
  f_ as y,
  fc as ue,
  fl as de,
  fr as fe,
  gp as pe,
  gr as me,
  ho as he,
  hr as b,
  hs as ge,
  ir as _e,
  l as ve,
  ll as ye,
  lr as be,
  mr as xe,
  n_ as Se,
  or as Ce,
  pl as we,
  pr as Te,
  ps as Ee,
  rr as De,
  sr as x,
  tg as Oe,
  tr as ke,
  ug as Ae,
  ul as je,
  ur as Me,
  vr as Ne,
} from './hooks.OIrsuUZX.js';
import {
  F as Pe,
  V as Fe,
  b as Ie,
  i as Le,
  n as Re,
  o as ze,
  s as Be,
  y as Ve,
} from './eventSelection.-qyy4EGG.js';
var S = e(t(), 1),
  He = 500,
  Ue = 5e3,
  We = (e) => {
    if (typeof e != `object` || !e) return !1;
    let t = e;
    return (
      typeof t.subagentRunId == `string` &&
      typeof t.subagentType == `string` &&
      (t.activityEventId == null || typeof t.activityEventId == `string`) &&
      (t.activitySequence == null ||
        (Number.isSafeInteger(t.activitySequence) && t.activitySequence >= 0)) &&
      (t.parentToolCallId == null || typeof t.parentToolCallId == `string`) &&
      typeof t.phase == `string`
    );
  };
function Ge(e, t = !0) {
  let { token: n, isAuthenticated: r } = h(),
    i = p(),
    a = ie(e.parentMessageId, e.event?.progressKey ?? e.toolCallId, e.partIndex),
    s = o(me(a)),
    c = d(b(a)),
    u = o(b(a)),
    f = (0, S.useRef)(c),
    m = e.durable,
    ee = m?.threadId,
    g = m?.taskId;
  ((0, S.useEffect)(() => {
    ((f.current = c), c || s(Me));
  }, [c, s]),
    (0, S.useEffect)(() => {
      e.isSubmitting && (fe(a), (f.current = !0), u(!0));
    }, [a, e.isSubmitting, u]),
    (0, S.useEffect)(() => {
      if (e.host !== `conversation` || ee == null || g == null || !t || !r || n == null) return;
      let o = [y.subagentThread, e.parentConversationId, ee, g],
        c = `${v()}/api/convos/${encodeURIComponent(e.parentConversationId)}/subagents/${encodeURIComponent(ee)}/tasks/${encodeURIComponent(g)}/activity`,
        u,
        d,
        p = 0,
        m = !1,
        h = !1,
        te = () => {
          let e = u;
          ((u = void 0), e?.close());
        },
        _ = () => {
          if (((d = void 0), m || h)) return;
          let t = new l(c, { method: `GET`, headers: { Authorization: `Bearer ${n}` } });
          ((u = t),
            t.addEventListener(`message`, (n) => {
              if (u !== t || m) return;
              let r;
              try {
                r = JSON.parse(n.data);
              } catch {
                return;
              }
              if (r.final === !0 && r.subagentActivity === !0) {
                ((h = !0), te(), i.invalidateQueries(o));
                return;
              }
              let c = r.data;
              r.event !== Ae.ON_SUBAGENT_UPDATE ||
                !We(c) ||
                ((e.event != null ||
                  c.parentToolCallId == null ||
                  c.parentToolCallId === e.toolCallId) &&
                  ((p = 0), fe(a), s((e) => ce(e, [c], `detached`, f.current))));
            }),
            t.addEventListener(`error`, () => {
              if (u !== t || m || h || d != null) return;
              te();
              let e = Math.min(He * 2 ** p, Ue);
              ((p += 1), (d = setTimeout(_, e)));
            }));
        };
      return (
        _(),
        () => {
          ((m = !0), d != null && clearTimeout(d), te());
        }
      );
    }, [
      t,
      r,
      a,
      i,
      e.host,
      e.event,
      e.parentConversationId,
      e.parentMessageId,
      e.partIndex,
      e.toolCallId,
      s,
      g,
      ee,
      n,
    ]));
}
var C = n(),
  Ke = 3,
  w = new Set([`task_not_running`, `task_completed`, `task_cancelled`, `task_failed`]),
  T = (e) => e != null && w.has(e),
  qe = (e) => T(e.reason) || (e.action === `cancel` && e.status === `applied`),
  Je = (e) =>
    typeof e == `object` &&
    e &&
    `response` in e &&
    typeof e.response == `object` &&
    e.response != null &&
    `status` in e.response &&
    typeof e.response.status == `number`
      ? e.response.status
      : void 0,
  Ye = (e, t) => (e ? `task_inaccessible` : t ? `owner_unavailable` : `invalid_command`),
  Xe = { submit: `steer`, other: `queue`, interrupt: `interrupt`, preempt: `interrupt` },
  Ze = (e) =>
    e === `task_inaccessible`
      ? `com_ui_subagent_control_reason_task_inaccessible`
      : e === `owner_unavailable`
        ? `com_ui_subagent_control_reason_owner_unavailable`
        : `com_ui_subagent_control_reason_invalid_command`;
function Qe({ selection: e }) {
  let t = ze(),
    n = le(),
    l = i(),
    { showToast: d } = Oe(),
    { navigateToConvo: p } = Ee(),
    h = (0, S.useRef)(null),
    v = re(`(max-width: 767px)`),
    ce = re(`(hover: none)`),
    {
      enterToSend: y,
      handOffComposerText: fe,
      composerBindings: { shortcutsEnabled: me, submitOverride: b, yieldedChords: Ae },
    } = ke(),
    [Me, He] = (0, S.useState)(!1),
    [Ue, We] = (0, S.useState)(!1),
    [w, T] = (0, S.useState)(``),
    Qe = Ue || w.trim() !== ``,
    E = o(be),
    et = (0, S.useCallback)(() => E(null), [E]),
    tt = ge(),
    { byMessageId: nt, byThreadId: rt, refresh: it } = Le(),
    D = Ne(ie(e.parentMessageId, e.event?.progressKey ?? e.toolCallId, e.partIndex)),
    at = De(D, e.subagentIdentity),
    ot = at == null ? void 0 : tt?.[at],
    st =
      e.subagentType === `self`
        ? n(`com_ui_subagent_dialog_title_self`)
        : n(`com_ui_subagent_dialog_title`, { 0: ot?.name || e.subagentType }),
    O = e.durable?.threadId ?? ``,
    k = e.durable?.taskId ?? ``,
    A = xe(e.parentConversationId, O, k),
    [ct, lt] = r(Te(A)),
    ut = (0, S.useCallback)((e, t) => l.set(Te(e), t), [l]),
    j = ct?.receipt ?? null,
    M = ct?.retry ?? null,
    N = e.event == null ? void 0 : rt.get(O),
    P = N?.tasks.length ?? 0,
    [dt, ft] = (0, S.useState)(() => ({ threadId: O, count: Ke, taskCount: N == null ? null : P }));
  (0, S.useEffect)(() => {
    ft((e) => {
      if (e.threadId !== O || e.taskCount == null) return { threadId: O, count: Ke, taskCount: P };
      let t = Math.max(0, P - e.taskCount);
      return { threadId: O, count: Math.min(P, e.count + t), taskCount: P };
    });
  }, [P, O]);
  let pt = Math.min(P, dt.threadId === O ? dt.count : Ke),
    mt = (0, S.useMemo)(() => (N?.tasks ?? []).slice(0, pt).reverse(), [N?.tasks, pt]),
    ht = pt < P,
    gt = N?.tasks.find((e) => e.taskId === k)?.status === `running`,
    _t = (0, S.useMemo)(() => {
      if (e.event == null) return [];
      let t = new Set();
      return (e.event.siblingParentMessageIds ?? [e.parentMessageId])
        .flatMap((e) => nt.get(e) ?? [])
        .filter((e) => !t.has(e.threadId) && (t.add(e.threadId), !0));
    }, [nt, e.event, e.parentMessageId]),
    vt = _t.find((e) => e.threadId === O),
    yt = (vt?.agentId == null ? void 0 : tt?.[vt.agentId]?.name) ?? vt?.actorId ?? N?.actorId ?? st,
    {
      data: bt,
      isLoading: xt,
      isError: St,
      isPreviousData: Ct,
      isReadinessPending: wt,
      refetch: Tt,
    } = we(e.parentConversationId, O, k, {
      keepPreviousData: !0,
      ...(gt ? { refetchInterval: ye } : {}),
    }),
    F = bt?.threadId === O ? bt : void 0,
    I = Ct ? void 0 : F,
    L = JSON.stringify([F?.nextCursor ?? null, ...(F?.turns?.map((e) => e.taskId) ?? [])]),
    Et = (0, S.useRef)(L);
  Et.current = L;
  let R =
      je(I, k) &&
      (I?.status === `completed` ||
        I?.status === `failed` ||
        I?.status === `interrupted` ||
        I?.status === `cancelled`),
    Dt = (0, S.useRef)(!1);
  (Ge(e, !R || gt),
    (0, S.useEffect)(() => {
      e.event != null && it();
    }, [it, e.event, O]),
    (0, S.useEffect)(() => {
      Dt.current = !1;
    }, [k, O]),
    (0, S.useEffect)(() => {
      e.event != null && (R && !Dt.current && it(), (Dt.current = R));
    }, [R, it, e.event]),
    (0, S.useEffect)(() => {
      e.event == null || !gt || !R || Tt();
    }, [R, gt, Tt, e.event]),
    (0, S.useEffect)(() => {
      if (
        e.event == null ||
        e.event.pinnedTask === !0 ||
        Qe ||
        N?.latestTaskId == null ||
        N.latestTaskId === k
      )
        return;
      let t = Re(e.parentConversationId, N, e.event.siblingParentMessageIds);
      t != null && E(t);
    }, [N, e, Qe, E, k]));
  let Ot = e.durable != null && D != null && D.status !== `stop` && D.status !== `error`,
    kt = (0, S.useRef)(w);
  kt.current = w;
  let At = (0, S.useRef)(null),
    jt = ue({
      onSuccess: (e) => {
        let t = e.conversation?.conversationId,
          n = At.current;
        ((At.current = null), We(!1));
        let r = n?.identity === un.current,
          i = r ? kt.current.trim() : (n?.text ?? ``);
        (t != null && i !== `` && fe(t, i), r && T(``), et(), p(e.conversation));
      },
      onError: () => {
        ((At.current = null),
          We(!1),
          d({ message: n(`com_ui_continue_chat_error`), status: `error` }));
      },
    }),
    [Mt, Nt] = (0, S.useState)(() => new Map()),
    [Pt, Ft] = (0, S.useState)(() => new Map()),
    [It, Lt] = (0, S.useState)([]),
    [Rt, zt] = (0, S.useState)([]),
    [Bt, Vt] = (0, S.useState)([]),
    [Ht, Ut] = (0, S.useState)([]),
    z = (0, S.useRef)(Ht),
    [B, Wt] = (0, S.useState)(!1),
    Gt = (0, S.useRef)(B),
    [V, Kt] = (0, S.useState)(void 0),
    [qt, Jt] = (0, S.useState)(),
    [H, Yt] = (0, S.useState)(`idle`),
    [Xt, Zt] = (0, S.useState)(!1),
    Qt = (0, S.useRef)(O),
    $t = (0, S.useRef)(O),
    U = (0, S.useRef)(0),
    en = (0, S.useRef)(0),
    tn = (0, S.useRef)(new Set()),
    nn = (0, S.useRef)(null),
    rn = (0, S.useRef)(!1);
  ($t.current !== O && (($t.current = O), (U.current += 1)), (Qt.current = O));
  let [an, on] = (0, S.useState)(!1),
    [sn, cn] = (0, S.useState)(!1),
    ln = (0, S.useRef)(!1),
    un = (0, S.useRef)(A);
  ((0, S.useEffect)(
    () => (
      (un.current = A),
      T(``),
      on(!1),
      cn(!1),
      (ln.current = !1),
      () => {
        un.current = ``;
      }
    ),
    [A],
  ),
    (0, S.useEffect)(() => {
      (Nt(new Map()),
        Ft(new Map()),
        Lt([]),
        zt([]),
        Vt([]),
        Ut([]),
        (en.current = U.current),
        (z.current = []),
        Wt(!1),
        (Gt.current = !1),
        Kt(void 0),
        Jt(void 0),
        Yt(`idle`),
        Zt(!1),
        tn.current.clear(),
        (nn.current = null),
        (rn.current = !1));
    }, [O]),
    (0, S.useEffect)(() => {
      F != null &&
        (F.historyUnavailable === !0 || (F.historyTruncated === !0 && F.nextCursor == null)) &&
        Zt(!0);
    }, [F]));
  let dn = (0, S.useCallback)(
      async (t) => {
        let n = O,
          r = U.current,
          i = `${r}\u0000${n}\u0000${t}`;
        if (!(Pt.get(t) === `loading` || tn.current.has(i))) {
          (tn.current.add(i), Ft((e) => new Map(e).set(t, `loading`)));
          try {
            let i = await ne.getSubagentThread(e.parentConversationId, n, t);
            if (Qt.current !== n || U.current !== r) return;
            if (!je(i, t)) {
              Ft((e) => new Map(e).set(t, `unavailable`));
              return;
            }
            let a = _e(i, t);
            (Nt((e) => new Map(e).set(t, a)),
              Ft((e) => new Map(e).set(t, a.activityTruncated === !0 ? `unavailable` : `idle`)));
          } catch {
            if (Qt.current !== n || U.current !== r) return;
            Ft((e) => new Map(e).set(t, `error`));
          } finally {
            tn.current.delete(i);
          }
        }
      },
      [e.parentConversationId, O, Pt],
    ),
    fn = (0, S.useCallback)(async () => {
      let t = O,
        n = U.current,
        r = B ? (qt ?? L) : L,
        i = !B && V !== void 0 && qt !== r,
        a = i || B,
        o = V === void 0 || i ? F?.nextCursor : V,
        s = `${n}\u0000${t}\u0000${o ?? ``}\u0000${r}`;
      if (o != null && H !== `loading` && nn.current == null) {
        ((nn.current = s), Yt(`loading`));
        try {
          let s = await ne.getSubagentThread(e.parentConversationId, t, void 0, o);
          if (Qt.current !== t || U.current !== n) return;
          if (!B && Et.current !== r) {
            Yt(`idle`);
            return;
          }
          let c = ae(s),
            l = !1;
          if (a) {
            let e = i ? oe(Rt, Bt) : Rt,
              t = x(c, i ? [] : Bt),
              n = new Set(x(It, e, z.current).map((e) => e.taskId));
            if (c.some((e) => n.has(e.taskId)) || s.nextCursor == null) {
              l = !0;
              let n = z.current;
              ((z.current = []),
                Lt((r) => x(r, e, t, n)),
                zt([]),
                Vt([]),
                Ut([]),
                Wt(!1),
                (Gt.current = !1));
            } else (i && zt(e), Vt(t), Wt(!0), (Gt.current = !0));
          } else Lt((e) => x(c, e));
          ((rn.current = !0),
            Kt(s.nextCursor ?? null),
            Jt(l ? Et.current : r),
            Zt(
              (e) =>
                e || s.historyUnavailable === !0 || (s.historyTruncated && s.nextCursor == null),
            ),
            Yt(`idle`));
        } catch {
          if (Qt.current !== t || U.current !== n) return;
          Yt(`error`);
        } finally {
          nn.current === s && (nn.current = null);
        }
      }
    }, [F?.nextCursor, V, qt, B, H, L, Rt, It, Bt, e.parentConversationId, O]),
    pn = de({
      onSuccess: ({ receipt: e }, t) => {
        let n = xe(t.parentConversationId, t.threadId, t.command.taskId);
        (ut(n, { receipt: e }),
          un.current === n &&
            ((ln.current = !1),
            qe(e) && cn(!0),
            t.command.action !== `cancel_message` &&
              (e.status === `accepted` || e.status === `applied`) &&
              T(``)));
      },
      onError: (e, t) => {
        let n = Je(e),
          r = n === 404,
          i = n == null || n >= 500,
          a = t.command,
          o = xe(t.parentConversationId, t.threadId, a.taskId);
        (ut(o, {
          receipt: {
            invocationId: a.invocationId,
            ...(a.controlId == null ? {} : { controlId: a.controlId }),
            action: a.action,
            status: `failed`,
            createdAt: t.submittedAt,
            updatedAt: new Date().toISOString(),
            ...(a.message == null ? {} : { message: a.message }),
            reason: Ye(r, i),
          },
          ...(i ? { retry: a } : {}),
        }),
          un.current === o && ((ln.current = !1), r && (on(!0), cn(!0))));
      },
    });
  ((0, S.useEffect)(() => {
    if (j == null) return;
    let e = I?.controlReceipts?.find((e) => e.invocationId === j.invocationId);
    e != null &&
      (M != null &&
        M.action !== `cancel` &&
        M.action !== `cancel_message` &&
        (e.status === `accepted` || e.status === `applied`) &&
        T((e) => (e === M.message ? `` : e)),
      qe(e) && cn(!0),
      lt(null));
  }, [M, lt, I?.controlReceipts, j]),
    (0, S.useEffect)(() => {
      I?.controlReceipts?.some(qe) && cn(!0);
    }, [I?.controlReceipts]));
  let W = (0, S.useCallback)(
      (t, n, r) => {
        if (e.durable == null || pn.isLoading || ln.current || (M != null && r == null)) return;
        let i;
        if (
          ((i =
            r ??
            (t === `cancel_message`
              ? { taskId: e.durable.taskId, invocationId: f(), action: t, controlId: n }
              : t === `cancel`
                ? { taskId: e.durable.taskId, invocationId: f(), action: t }
                : { taskId: e.durable.taskId, invocationId: f(), action: t, message: w.trim() })),
          t !== `cancel` && t !== `cancel_message` && (i.message == null || i.message === ``))
        )
          return;
        let a = new Date().toISOString();
        (lt({
          receipt: {
            invocationId: i.invocationId,
            ...(i.controlId == null ? {} : { controlId: i.controlId }),
            action: i.action,
            status: `submitted`,
            createdAt: a,
            updatedAt: a,
            ...(i.message == null ? {} : { message: i.message }),
          },
          retry: i,
        }),
          (ln.current = !0),
          pn.mutate({
            parentConversationId: e.parentConversationId,
            threadId: e.durable.threadId,
            command: i,
            submittedAt: a,
          }));
      },
      [w, pn, M, e.durable, e.parentConversationId, lt],
    ),
    mn = (0, S.useCallback)(() => {
      (et(),
        requestAnimationFrame(() => {
          Array.from(document.querySelectorAll(`[data-subagent-tool-call]`))
            .find(
              (t) =>
                t.dataset.subagentToolCall === e.toolCallId &&
                t.dataset.subagentParentMessage === e.parentMessageId &&
                t.dataset.subagentPartIndex === String(e.partIndex),
            )
            ?.focus();
        }));
    }, [et, e.parentMessageId, e.partIndex, e.toolCallId]);
  ve(h, v);
  let hn = (0, S.useCallback)(
    (e) => {
      !v || e.key !== `Escape` || e.defaultPrevented || (e.preventDefault(), mn());
    },
    [mn, v],
  );
  (0, S.useEffect)(() => {
    let e = document.activeElement;
    if (!(!v || !(e instanceof HTMLElement)))
      return () => {
        e.isConnected && e.focus();
      };
  }, [v]);
  let G = (0, S.useMemo)(
      () =>
        Ce({
          title: st,
          prompt: e.prompt,
          progress: D,
          persistedContent: e.persistedContent,
          isDetached: e.durable != null,
          legacyOutput: e.legacyOutput,
          initialProgress: e.durable == null ? e.initialProgress : 0,
          isSubmitting: e.durable == null ? e.isSubmitting : Ot,
          runStepStatus: e.durable == null ? e.runStepStatus : void 0,
        }),
      [Ot, st, D, e],
    ),
    K = (0, S.useMemo)(() => {
      if (e.durable == null) return G;
      if (I == null) {
        let e = D == null ? { ...G, status: `dispatched` } : G;
        return j == null ? e : { ...e, controls: [j] };
      }
      let t = _e(I, e.durable.taskId),
        n =
          !((t.status === `running` || t.status === `dispatched`) && G.items.length > 0) &&
          t.items.length > 0
            ? t.items
            : G.items,
        r = { ...t, prompt: t.prompt ?? G.prompt, items: n };
      return j == null || (r.controls ?? []).some((e) => e.invocationId === j.invocationId)
        ? r
        : { ...r, controls: [...(r.controls ?? []), j] };
    }, [G, D, e.durable, I, j]),
    gn = e.event == null ? K.title : yt,
    _n = (0, S.useMemo)(
      () =>
        e.event == null
          ? []
          : _t
              .filter((e) => e.latestTaskId != null || e.threadId === O)
              .map((e) => {
                let t = e.agentId == null ? void 0 : tt?.[e.agentId],
                  n = t?.name || e.actorId || e.title;
                return {
                  value: e.threadId,
                  label: t?.name != null && e.actorId != null ? `${n} · ${e.actorId}` : n,
                  icon: m(t, { size: `icon`, showBorder: !1 }),
                };
              }),
      [tt, _t, e.event, O],
    ),
    vn = _n.find((e) => e.value === O)?.label ?? gn,
    yn = vt?.agentId ?? F?.agentId ?? at,
    bn = m(yn == null ? void 0 : tt?.[yn], { size: `icon`, showBorder: !1 }),
    q = (0, S.useMemo)(() => (F == null ? [] : ae(F)), [F]),
    xn = (0, S.useRef)({ threadId: O, generation: L, turns: q });
  (0, S.useEffect)(() => {
    if (F == null) return;
    let e = xn.current;
    if (e.threadId === O) {
      let t = new Set(q.map((e) => e.taskId)),
        n = e.turns.filter((e) => !t.has(e.taskId));
      if (n.length > 0 && rn.current) {
        if (Gt.current) {
          let e = oe(z.current, n);
          ((z.current = e), Ut(e));
        } else zt((e) => oe(e, n));
      }
    }
    xn.current = { threadId: O, generation: L, turns: q };
  }, [B, q, L, O, F]);
  let Sn = en.current === U.current,
    Cn = (0, S.useMemo)(() => {
      let t = Sn ? x(It, Rt, Bt, Ht, q) : x(q);
      if (t.length > 0) {
        let n = t.findIndex((e) => e.taskId === k);
        if (n >= 0)
          return t.map((e, t) => {
            let r = t === n ? { ...e, activity: K } : e,
              i = Mt.get(e.taskId);
            return i == null ? r : { ...r, activity: i };
          });
        let r = rt.get(O),
          i = r?.tasks.find((e) => e.taskId === k)?.createdAt,
          a = {
            taskId: k || `${e.parentMessageId}:${e.toolCallId}`,
            trigger: {
              kind: e.event == null ? `parent_continuation` : `external_event`,
              summary: e.prompt ?? K.prompt ?? ``,
              ...(i == null ? {} : { createdAt: i }),
            },
            activity: K,
          },
          o = t[t.length - 1]?.trigger.createdAt;
        return (
          (i != null && o != null ? i >= o : r?.latestTaskId === k) ? [...t, a] : [a, ...t]
        ).map((e) => {
          let t = Mt.get(e.taskId);
          return t == null ? e : { ...e, activity: t };
        });
      }
      return [
        {
          taskId: k || `${e.parentMessageId}:${e.toolCallId}`,
          trigger: {
            kind: e.event == null ? `parent_dispatch` : `external_event`,
            summary: e.prompt ?? K.prompt ?? ``,
          },
          activity: K,
        },
      ];
    }, [K, rt, q, Rt, It, Ht, Bt, Sn, O, e, k, Mt]),
    wn = (0, S.useMemo)(() => {
      let e = new Map(Pt);
      return (K.activityTruncated === !0 && k !== `` && e.set(k, `unavailable`), e);
    }, [K.activityTruncated, k, Pt]),
    Tn = !B && (V === void 0 || qt !== L),
    En = Tn ? F?.nextCursor : V,
    Dn =
      Xt ||
      F?.historyUnavailable === !0 ||
      (Tn && F?.historyTruncated === !0 && F.nextCursor == null),
    On = e.durable == null || F == null || Array.isArray(F.turns),
    kn = an || j?.reason === `task_inaccessible`,
    An = I != null && Fe(I.status),
    jn = I != null && (I.status === `running` || (I.status === `dispatched` && je(I, k))),
    J = e.durable != null && jn && !kn && !sn,
    Y = pn.isLoading || j?.status === `submitted` || M != null,
    Mn = J || M != null || j?.reason === `task_inaccessible`,
    Nn =
      e.host === `conversation` &&
      e.durable != null &&
      I?.subagentKind === `agent` &&
      I.agentId != null &&
      I.status === `completed` &&
      je(I, k) &&
      I.messages.some((e) => e.messageId === `${k}:assistant`),
    Pn = (0, S.useCallback)(() => {
      !Nn ||
        e.durable == null ||
        jt.isLoading ||
        ((At.current = { identity: A, text: w.trim() }),
        We(!0),
        jt.mutate({
          conversationId: e.durable.threadId,
          messageId: `${e.durable.taskId}:assistant`,
          option: Se.DIRECT_PATH,
        }));
    }, [Nn, jt, A, w, e.durable]),
    X = null;
  J ? (X = `control`) : Nn && (X = `continue`);
  let Z = (0, S.useRef)(null);
  X == null
    ? Z.current != null && Z.current.threadId !== O && (Z.current = null)
    : (Z.current = { threadId: O, mode: X });
  let Fn = X == null && (I == null || (An && !sn && !kn)),
    Q = X;
  Q == null && Fn && (Q = Z.current?.mode ?? (An ? `control` : null));
  let In = ce || v,
    Ln = n(`com_endpoint_message_new`, { 0: gn }),
    Rn = n(Q === `control` ? `com_ui_steer_send` : `com_ui_subagent_continue_new_chat`),
    zn = (0, S.useCallback)(() => W(`cancel`), [W]),
    Bn = J && !Y ? { onStop: zn, stopLabel: n(`com_ui_subagent_cancel_task`) } : {},
    Vn = (0, S.useRef)(!1),
    Hn = (0, S.useRef)(null);
  Vn.current = Q === `control`;
  let Un;
  Un = Fn ? !1 : Q === `control` ? !Y && w.trim() !== `` : !jt.isLoading;
  let Wn = (0, S.useMemo)(() => {
      if (Q !== `control`) return [];
      let e = {
          isComposing: !1,
          isSubmitting: !0,
          allowSubmitWhileGenerating: !0,
          hasDuringRunModifier: !0,
          shortcutsEnabled: me,
          enterToSend: y,
          submitOverride: b,
          yieldedChords: Ae,
        },
        t = { key: `Enter`, altKey: !1, ctrlKey: !1, metaKey: !1, shiftKey: !1 },
        r = he(t, e),
        i = he({ ...t, ctrlKey: !se, metaKey: se }, e),
        a = he({ ...t, altKey: !0 }, e),
        o = se ? `⌘⏎` : `Ctrl ⏎`,
        l = se ? `⌥⏎` : `Alt ⏎`,
        d;
      r === `submit` ? (d = `⏎`) : i === `submit` && (d = o);
      let f = !J || Y || w.trim() === ``;
      return [
        {
          key: `steer`,
          label: n(`com_ui_steer`),
          kbd: d,
          icon: (0, C.jsx)(c, { className: `h-4 w-4 text-status-warning`, 'aria-hidden': `true` }),
          disabled: f,
          onClick: () => W(`steer`),
        },
        {
          key: `queue`,
          label: n(`com_ui_queue`),
          kbd: i === `other` ? o : void 0,
          icon: (0, C.jsx)(u, { className: `h-4 w-4 text-status-info`, 'aria-hidden': `true` }),
          disabled: f,
          onClick: () => W(`queue`),
        },
        {
          key: `interrupt`,
          label: n(`com_ui_subagent_interrupt`),
          kbd: a === `interrupt` ? l : void 0,
          icon: (0, C.jsx)(s, { className: `h-4 w-4 text-status-error`, 'aria-hidden': `true` }),
          disabled: f,
          onClick: () => W(`interrupt`),
        },
      ];
    }, [Q, J, w, Y, y, n, me, W, b, Ae]),
    Gn = (0, S.useCallback)(
      (e, t) => {
        let n = Vn.current,
          r = he(e, {
            isComposing: t,
            isSubmitting: n,
            allowSubmitWhileGenerating: n,
            hasDuringRunModifier: n,
            shortcutsEnabled: me,
            enterToSend: y,
            submitOverride: b,
            yieldedChords: Ae,
          }),
          i = Xe[r];
        return i == null
          ? r === `newline`
            ? `newline`
            : r === `block`
              ? `block`
              : `none`
          : ((Hn.current = { event: e, control: i }), `submit`);
      },
      [y, me, b, Ae],
    ),
    Kn = (0, S.useCallback)(
      (e) => {
        if (!J) {
          Pn();
          return;
        }
        let t = Hn.current;
        ((Hn.current = null), W(e != null && t?.event === e ? t.control : `steer`));
      },
      [Pn, J, W],
    ),
    qn = (0, S.useCallback)(
      (t) => {
        let n = _t.find((e) => e.threadId === t);
        if (n == null) return;
        let r = Re(e.parentConversationId, n, e.event?.siblingParentMessageIds);
        r != null && E(r);
      },
      [_t, e.event?.siblingParentMessageIds, e.parentConversationId, E],
    ),
    $ = `ready`;
  e.durable != null && G.items.length === 0 && (xt || wt)
    ? ($ = `loading`)
    : e.durable != null && G.items.length === 0 && St && ($ = `error`);
  let Jn = (t) =>
      t.taskId === k
        ? (0, C.jsx)(
            Ve,
            {
              activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${t.taskId}`,
              activity: K,
              state: $,
              embedded: !0,
              onCancelControl: J && !Y ? (e) => W(`cancel_message`, e) : void 0,
            },
            t.taskId,
          )
        : (0, C.jsx)($e, { selection: e, task: t, title: K.title }, t.taskId),
    Yn = () => {
      ft({ threadId: O, count: Math.min(P, pt + Ke), taskCount: P });
    },
    Xn = null;
  ht
    ? (Xn = (0, C.jsx)(`div`, {
        className: `flex justify-center border-b border-border-light px-4 py-2`,
        children: (0, C.jsx)(_, {
          type: `button`,
          variant: `ghost`,
          size: `sm`,
          onClick: Yn,
          children: n(`com_ui_load_more`),
        }),
      }))
    : N?.tasksTruncated === !0 &&
      (Xn = (0, C.jsx)(`div`, {
        role: `status`,
        'aria-label': n(`com_ui_subagent_thread_history_truncated`),
        className: `flex h-7 items-center justify-center border-b border-border-light text-text-tertiary`,
        children: (0, C.jsx)(`span`, { 'aria-hidden': !0, children: `•••` }),
      }));
  let Zn = (0, S.useMemo)(() => new Map([[k || Cn[0]?.taskId || ``, $]]), [Cn, $, k]),
    Qn;
  return (
    (Qn = On
      ? (0, C.jsxs)(Ie, {
          padded: !1,
          headerInset: !0,
          children: [
            Dn &&
              (0, C.jsx)(`div`, {
                role: `status`,
                'aria-label': n(`com_ui_subagent_thread_history_truncated`),
                className: `flex h-7 items-center justify-center border-b border-border-light text-text-tertiary`,
                children: (0, C.jsx)(`span`, { 'aria-hidden': !0, children: `•••` }),
              }),
            En != null &&
              H !== `error` &&
              (0, C.jsx)(`div`, {
                className: `flex justify-center border-b border-border-light px-4 py-2`,
                children: (0, C.jsx)(_, {
                  type: `button`,
                  variant: `ghost`,
                  size: `sm`,
                  disabled: H === `loading`,
                  onClick: () => void fn(),
                  children: n(
                    H === `loading` ? `com_ui_loading` : `com_ui_subagent_load_earlier_activity`,
                  ),
                }),
              }),
            H === `error` &&
              (0, C.jsx)(`div`, {
                className: `flex justify-center border-b border-border-light px-4 py-2`,
                children: (0, C.jsx)(_, {
                  type: `button`,
                  variant: `ghost`,
                  size: `sm`,
                  onClick: () => void fn(),
                  children: n(`com_ui_retry`),
                }),
              }),
            (0, C.jsx)(Be, {
              turns: Cn,
              agentId: F?.agentId,
              conversationId: O || e.parentConversationId,
              stateByTask: Zn,
              controllableTaskId: J && !Y ? e.durable?.taskId : void 0,
              onCancelControl: (e, t) => W(`cancel_message`, t),
              detailStateByTask: wn,
              onLoadTurnDetails: dn,
            }),
          ],
        })
      : e.event != null && ((N?.tasks.length ?? 0) > 1 || N?.tasksTruncated === !0)
        ? (0, C.jsx)(Ie, {
            padded: !1,
            headerInset: !0,
            children: (0, C.jsxs)(`div`, {
              'data-subagent-thread-timeline': !0,
              children: [Xn, mt.map(Jn)],
            }),
          })
        : (0, C.jsx)(
            Ve,
            {
              activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
              activity: K,
              state: $,
              showPrompt: !1,
              headerInset: !0,
              onCancelControl: J && !Y ? (e) => W(`cancel_message`, e) : void 0,
            },
            `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
          )),
    (0, C.jsxs)(`aside`, {
      ref: h,
      role: v ? `dialog` : `region`,
      'aria-modal': v || void 0,
      'aria-label': n(`com_ui_subagent_thread_panel`),
      onKeyDown: hn,
      className: `relative flex h-full w-full flex-col overflow-hidden bg-surface-primary-alt text-text-primary`,
      children: [
        (0, C.jsxs)(`header`, {
          className: `absolute top-0 z-10 flex h-[52px] w-full items-center gap-2 bg-gradient-to-b from-surface-primary-alt via-surface-primary-alt/70 to-transparent p-2 font-semibold text-text-primary`,
          children: [
            _n.length > 1
              ? (0, C.jsx)(`div`, {
                  className: `flex min-w-0 flex-1`,
                  onKeyDown: (e) => {
                    e.key === `Escape` && Me && e.stopPropagation();
                  },
                  children: (0, C.jsx)(g, {
                    isCollapsed: !1,
                    selectedValue: O,
                    setValue: qn,
                    displayValue: vn,
                    selectPlaceholder: vn,
                    searchPlaceholder: n(`com_agents_search_name`),
                    ariaLabel: n(`com_ui_subagent_actor`),
                    items: _n,
                    SelectIcon: bn,
                    disabled: Ue,
                    portal: !1,
                    onOpenChange: He,
                    containerClassName: `min-w-0 flex-1 px-0`,
                    className: `h-9 w-full border-transparent bg-transparent font-semibold hover:bg-surface-hover`,
                    showCarat: !0,
                  }),
                })
              : (0, C.jsxs)(C.Fragment, {
                  children: [
                    (0, C.jsx)(`div`, {
                      className: `flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full`,
                      children: bn,
                    }),
                    (0, C.jsx)(`h2`, {
                      className: `min-w-0 flex-1 truncate text-sm font-semibold`,
                      title: gn,
                      children: gn,
                    }),
                  ],
                }),
            (0, C.jsx)(_, {
              type: `button`,
              variant: `ghost`,
              size: `icon`,
              onClick: mn,
              'aria-label': n(`com_ui_close`),
              className: `h-8 w-8 shrink-0`,
              children: (0, C.jsx)(a, { size: 17, 'aria-hidden': `true` }),
            }),
          ],
        }),
        (0, C.jsx)(
          Pe,
          { children: Qn },
          `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
        ),
        (Mn || Q != null) &&
          (0, C.jsxs)(`div`, {
            className: te(`shrink-0 px-3 pt-2`, t ? `pb-10` : `pb-4`),
            children: [
              j?.status === `failed` &&
                (0, C.jsxs)(pe, {
                  variant: `error`,
                  className: `mb-2 flex items-center gap-2`,
                  children: [
                    (0, C.jsx)(`span`, { className: `min-w-0 flex-1`, children: n(Ze(j.reason)) }),
                    M != null &&
                      (0, C.jsx)(_, {
                        type: `button`,
                        size: `sm`,
                        variant: `outline`,
                        disabled: pn.isLoading,
                        onClick: () => W(M.action, M.controlId, M),
                        children: n(`com_ui_retry`),
                      }),
                  ],
                }),
              Q != null &&
                (0, C.jsx)(ee, {
                  value: w,
                  onChange: T,
                  onSubmit: Kn,
                  canSubmit: Un,
                  disabled: Q === `control` && Y,
                  submitLabel: Rn,
                  ...Bn,
                  ariaLabel: n(`com_ui_message_input`),
                  placeholder: Ln,
                  submitOnEnter: y,
                  resolveKeyVerdict: Gn,
                  maxLength: Q === `control` ? 4096 : void 0,
                  submitActions: In ? [] : Wn,
                  submitActionsLabel: n(`com_ui_during_run_actions`),
                  actions: In
                    ? Wn.filter((e) => e.key !== `steer`).map((e) =>
                        (0, C.jsx)(
                          _,
                          {
                            type: `button`,
                            size: `icon`,
                            variant: `ghost`,
                            'aria-label': e.label,
                            disabled: e.disabled,
                            onClick: e.onClick,
                            className: `size-9 rounded-full text-text-secondary hover:text-text-primary`,
                            children: e.icon,
                          },
                          e.key,
                        ),
                      )
                    : null,
                }),
            ],
          }),
      ],
    })
  );
}
function $e({ selection: e, task: t, title: n }) {
  let r = e.durable?.threadId ?? ``,
    {
      data: i,
      isLoading: a,
      isError: o,
      isReadinessPending: s,
    } = we(e.parentConversationId, r, t.taskId),
    c = (0, S.useMemo)(
      () => (i == null ? { title: n, status: t.status, items: [], controls: [] } : _e(i, t.taskId)),
      [i, t.status, t.taskId, n],
    ),
    l = `ready`;
  return (
    o ? (l = `error`) : (a || s) && (l = `loading`),
    (0, C.jsx)(Ve, {
      activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${t.taskId}`,
      activity: c,
      state: l,
      showPrompt: !1,
      embedded: !0,
    })
  );
}
export { Qe as default };
