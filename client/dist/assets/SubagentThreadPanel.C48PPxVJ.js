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
import { r as ee } from './query-devtools.DIz6FZCX.js';
import {
  $h as p,
  Ap as m,
  Bn as h,
  Bp as g,
  E_ as _,
  M_ as v,
  Of as te,
  Rp as ne,
  Xh as re,
  _r as ie,
  ar as ae,
  cg as oe,
  cr as se,
  do as ce,
  dr as y,
  ds as le,
  e_ as ue,
  fc as de,
  fl as fe,
  fr as pe,
  gr as me,
  ho as he,
  hr as b,
  hs as ge,
  ir as _e,
  l as ve,
  ll as ye,
  lr as be,
  mp as xe,
  mr as Se,
  or as Ce,
  pl as we,
  pr as Te,
  ps as Ee,
  qu as De,
  rr as Oe,
  sr as x,
  tr as ke,
  u_ as S,
  ul as Ae,
  ur as je,
  vr as Me,
} from './hooks.DHfa_SP2.js';
import {
  F as Ne,
  V as Pe,
  b as Fe,
  i as Ie,
  n as Le,
  o as Re,
  s as ze,
  y as Be,
} from './eventSelection.CGwpDjsi.js';
var C = e(t(), 1),
  Ve = 500,
  He = 5e3,
  Ue = (e) => {
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
function We(e, t = !0) {
  let { token: n, isAuthenticated: r } = h(),
    i = ee(),
    a = ie(e.parentMessageId, e.event?.progressKey ?? e.toolCallId, e.partIndex),
    s = o(me(a)),
    c = d(b(a)),
    u = o(b(a)),
    f = (0, C.useRef)(c),
    p = e.durable,
    m = p?.threadId,
    g = p?.taskId;
  ((0, C.useEffect)(() => {
    ((f.current = c), c || s(je));
  }, [c, s]),
    (0, C.useEffect)(() => {
      e.isSubmitting && (pe(a), (f.current = !0), u(!0));
    }, [a, e.isSubmitting, u]),
    (0, C.useEffect)(() => {
      if (e.host !== `conversation` || m == null || g == null || !t || !r || n == null) return;
      let o = [S.subagentThread, e.parentConversationId, m, g],
        c = `${_()}/api/convos/${encodeURIComponent(e.parentConversationId)}/subagents/${encodeURIComponent(m)}/tasks/${encodeURIComponent(g)}/activity`,
        u,
        d,
        ee = 0,
        p = !1,
        h = !1,
        v = () => {
          let e = u;
          ((u = void 0), e?.close());
        },
        te = () => {
          if (((d = void 0), p || h)) return;
          let t = new l(c, { method: `GET`, headers: { Authorization: `Bearer ${n}` } });
          ((u = t),
            t.addEventListener(`message`, (n) => {
              if (u !== t || p) return;
              let r;
              try {
                r = JSON.parse(n.data);
              } catch {
                return;
              }
              if (r.final === !0 && r.subagentActivity === !0) {
                ((h = !0), v(), i.invalidateQueries(o));
                return;
              }
              let c = r.data;
              r.event !== oe.ON_SUBAGENT_UPDATE ||
                !Ue(c) ||
                ((e.event != null ||
                  c.parentToolCallId == null ||
                  c.parentToolCallId === e.toolCallId) &&
                  ((ee = 0), pe(a), s((e) => y(e, [c], `detached`, f.current))));
            }),
            t.addEventListener(`error`, () => {
              if (u !== t || p || h || d != null) return;
              v();
              let e = Math.min(Ve * 2 ** ee, He);
              ((ee += 1), (d = setTimeout(te, e)));
            }));
        };
      return (
        te(),
        () => {
          ((p = !0), d != null && clearTimeout(d), v());
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
      m,
      n,
    ]));
}
var w = n(),
  Ge = 3,
  T = new Set([`task_not_running`, `task_completed`, `task_cancelled`, `task_failed`]),
  E = (e) => e != null && T.has(e),
  Ke = (e) => E(e.reason) || (e.action === `cancel` && e.status === `applied`),
  qe = (e) =>
    typeof e == `object` &&
    e &&
    `response` in e &&
    typeof e.response == `object` &&
    e.response != null &&
    `status` in e.response &&
    typeof e.response.status == `number`
      ? e.response.status
      : void 0,
  Je = (e, t) => (e ? `task_inaccessible` : t ? `owner_unavailable` : `invalid_command`),
  Ye = { submit: `steer`, other: `queue`, interrupt: `interrupt`, preempt: `interrupt` },
  Xe = (e) =>
    e === `task_inaccessible`
      ? `com_ui_subagent_control_reason_task_inaccessible`
      : e === `owner_unavailable`
        ? `com_ui_subagent_control_reason_owner_unavailable`
        : `com_ui_subagent_control_reason_invalid_command`;
function Ze({ selection: e }) {
  let t = Re(),
    n = le(),
    l = i(),
    { showToast: d } = p(),
    { navigateToConvo: ee } = Ee(),
    h = (0, C.useRef)(null),
    _ = re(`(max-width: 767px)`),
    oe = re(`(hover: none)`),
    {
      enterToSend: y,
      handOffComposerText: pe,
      composerBindings: { shortcutsEnabled: me, submitOverride: b, yieldedChords: S },
    } = ke(),
    [je, Ve] = (0, C.useState)(!1),
    [He, Ue] = (0, C.useState)(!1),
    [T, E] = (0, C.useState)(``),
    Ze = He || T.trim() !== ``,
    D = o(be),
    $e = (0, C.useCallback)(() => D(null), [D]),
    et = ge(),
    { byMessageId: tt, byThreadId: nt, refresh: rt } = Ie(),
    O = Me(ie(e.parentMessageId, e.event?.progressKey ?? e.toolCallId, e.partIndex)),
    it = Oe(O, e.subagentIdentity),
    at = it == null ? void 0 : et?.[it],
    ot =
      e.subagentType === `self`
        ? n(`com_ui_subagent_dialog_title_self`)
        : n(`com_ui_subagent_dialog_title`, { 0: at?.name || e.subagentType }),
    k = e.durable?.threadId ?? ``,
    A = e.durable?.taskId ?? ``,
    j = Se(e.parentConversationId, k, A),
    [st, ct] = r(Te(j)),
    lt = (0, C.useCallback)((e, t) => l.set(Te(e), t), [l]),
    M = st?.receipt ?? null,
    N = st?.retry ?? null,
    P = e.event == null ? void 0 : nt.get(k),
    F = P?.tasks.length ?? 0,
    [ut, dt] = (0, C.useState)(() => ({ threadId: k, count: Ge, taskCount: P == null ? null : F }));
  (0, C.useEffect)(() => {
    dt((e) => {
      if (e.threadId !== k || e.taskCount == null) return { threadId: k, count: Ge, taskCount: F };
      let t = Math.max(0, F - e.taskCount);
      return { threadId: k, count: Math.min(F, e.count + t), taskCount: F };
    });
  }, [F, k]);
  let ft = Math.min(F, ut.threadId === k ? ut.count : Ge),
    pt = (0, C.useMemo)(() => (P?.tasks ?? []).slice(0, ft).reverse(), [P?.tasks, ft]),
    mt = ft < F,
    ht = P?.tasks.find((e) => e.taskId === A)?.status === `running`,
    gt = (0, C.useMemo)(() => {
      if (e.event == null) return [];
      let t = new Set();
      return (e.event.siblingParentMessageIds ?? [e.parentMessageId])
        .flatMap((e) => tt.get(e) ?? [])
        .filter((e) => !t.has(e.threadId) && (t.add(e.threadId), !0));
    }, [tt, e.event, e.parentMessageId]),
    _t = gt.find((e) => e.threadId === k),
    vt = (_t?.agentId == null ? void 0 : et?.[_t.agentId]?.name) ?? _t?.actorId ?? P?.actorId ?? ot,
    {
      data: yt,
      isLoading: bt,
      isError: xt,
      isPreviousData: St,
      isReadinessPending: Ct,
      refetch: wt,
    } = we(e.parentConversationId, k, A, {
      keepPreviousData: !0,
      ...(ht ? { refetchInterval: ye } : {}),
    }),
    I = yt?.threadId === k ? yt : void 0,
    L = St ? void 0 : I,
    R = JSON.stringify([I?.nextCursor ?? null, ...(I?.turns?.map((e) => e.taskId) ?? [])]),
    Tt = (0, C.useRef)(R);
  Tt.current = R;
  let z =
      Ae(L, A) &&
      (L?.status === `completed` ||
        L?.status === `failed` ||
        L?.status === `interrupted` ||
        L?.status === `cancelled`),
    Et = (0, C.useRef)(!1);
  (We(e, !z || ht),
    (0, C.useEffect)(() => {
      e.event != null && rt();
    }, [rt, e.event, k]),
    (0, C.useEffect)(() => {
      Et.current = !1;
    }, [A, k]),
    (0, C.useEffect)(() => {
      e.event != null && (z && !Et.current && rt(), (Et.current = z));
    }, [z, rt, e.event]),
    (0, C.useEffect)(() => {
      e.event == null || !ht || !z || wt();
    }, [z, ht, wt, e.event]),
    (0, C.useEffect)(() => {
      if (
        e.event == null ||
        e.event.pinnedTask === !0 ||
        Ze ||
        P?.latestTaskId == null ||
        P.latestTaskId === A
      )
        return;
      let t = Le(e.parentConversationId, P, e.event.siblingParentMessageIds);
      t != null && D(t);
    }, [P, e, Ze, D, A]));
  let Dt = e.durable != null && O != null && O.status !== `stop` && O.status !== `error`,
    Ot = (0, C.useRef)(T);
  Ot.current = T;
  let kt = (0, C.useRef)(null),
    At = de({
      onSuccess: (e) => {
        let t = e.conversation?.conversationId,
          n = kt.current;
        ((kt.current = null), Ue(!1));
        let r = n?.identity === ln.current,
          i = r ? Ot.current.trim() : (n?.text ?? ``);
        (t != null && i !== `` && pe(t, i), r && E(``), $e(), ee(e.conversation));
      },
      onError: () => {
        ((kt.current = null),
          Ue(!1),
          d({ message: n(`com_ui_continue_chat_error`), status: `error` }));
      },
    }),
    [jt, Mt] = (0, C.useState)(() => new Map()),
    [Nt, Pt] = (0, C.useState)(() => new Map()),
    [Ft, It] = (0, C.useState)([]),
    [Lt, Rt] = (0, C.useState)([]),
    [zt, Bt] = (0, C.useState)([]),
    [Vt, Ht] = (0, C.useState)([]),
    B = (0, C.useRef)(Vt),
    [V, Ut] = (0, C.useState)(!1),
    Wt = (0, C.useRef)(V),
    [H, Gt] = (0, C.useState)(void 0),
    [Kt, qt] = (0, C.useState)(),
    [U, Jt] = (0, C.useState)(`idle`),
    [Yt, Xt] = (0, C.useState)(!1),
    Zt = (0, C.useRef)(k),
    Qt = (0, C.useRef)(k),
    W = (0, C.useRef)(0),
    $t = (0, C.useRef)(0),
    en = (0, C.useRef)(new Set()),
    tn = (0, C.useRef)(null),
    nn = (0, C.useRef)(!1);
  (Qt.current !== k && ((Qt.current = k), (W.current += 1)), (Zt.current = k));
  let [rn, an] = (0, C.useState)(!1),
    [on, sn] = (0, C.useState)(!1),
    cn = (0, C.useRef)(!1),
    ln = (0, C.useRef)(j);
  ((0, C.useEffect)(
    () => (
      (ln.current = j),
      E(``),
      an(!1),
      sn(!1),
      (cn.current = !1),
      () => {
        ln.current = ``;
      }
    ),
    [j],
  ),
    (0, C.useEffect)(() => {
      (Mt(new Map()),
        Pt(new Map()),
        It([]),
        Rt([]),
        Bt([]),
        Ht([]),
        ($t.current = W.current),
        (B.current = []),
        Ut(!1),
        (Wt.current = !1),
        Gt(void 0),
        qt(void 0),
        Jt(`idle`),
        Xt(!1),
        en.current.clear(),
        (tn.current = null),
        (nn.current = !1));
    }, [k]),
    (0, C.useEffect)(() => {
      I != null &&
        (I.historyUnavailable === !0 || (I.historyTruncated === !0 && I.nextCursor == null)) &&
        Xt(!0);
    }, [I]));
  let un = (0, C.useCallback)(
      async (t) => {
        let n = k,
          r = W.current,
          i = `${r}\u0000${n}\u0000${t}`;
        if (!(Nt.get(t) === `loading` || en.current.has(i))) {
          (en.current.add(i), Pt((e) => new Map(e).set(t, `loading`)));
          try {
            let i = await v.getSubagentThread(e.parentConversationId, n, t);
            if (Zt.current !== n || W.current !== r) return;
            if (!Ae(i, t)) {
              Pt((e) => new Map(e).set(t, `unavailable`));
              return;
            }
            let a = _e(i, t);
            (Mt((e) => new Map(e).set(t, a)),
              Pt((e) => new Map(e).set(t, a.activityTruncated === !0 ? `unavailable` : `idle`)));
          } catch {
            if (Zt.current !== n || W.current !== r) return;
            Pt((e) => new Map(e).set(t, `error`));
          } finally {
            en.current.delete(i);
          }
        }
      },
      [e.parentConversationId, k, Nt],
    ),
    dn = (0, C.useCallback)(async () => {
      let t = k,
        n = W.current,
        r = V ? (Kt ?? R) : R,
        i = !V && H !== void 0 && Kt !== r,
        a = i || V,
        o = H === void 0 || i ? I?.nextCursor : H,
        s = `${n}\u0000${t}\u0000${o ?? ``}\u0000${r}`;
      if (o != null && U !== `loading` && tn.current == null) {
        ((tn.current = s), Jt(`loading`));
        try {
          let s = await v.getSubagentThread(e.parentConversationId, t, void 0, o);
          if (Zt.current !== t || W.current !== n) return;
          if (!V && Tt.current !== r) {
            Jt(`idle`);
            return;
          }
          let c = ae(s),
            l = !1;
          if (a) {
            let e = i ? se(Lt, zt) : Lt,
              t = x(c, i ? [] : zt),
              n = new Set(x(Ft, e, B.current).map((e) => e.taskId));
            if (c.some((e) => n.has(e.taskId)) || s.nextCursor == null) {
              l = !0;
              let n = B.current;
              ((B.current = []),
                It((r) => x(r, e, t, n)),
                Rt([]),
                Bt([]),
                Ht([]),
                Ut(!1),
                (Wt.current = !1));
            } else (i && Rt(e), Bt(t), Ut(!0), (Wt.current = !0));
          } else It((e) => x(c, e));
          ((nn.current = !0),
            Gt(s.nextCursor ?? null),
            qt(l ? Tt.current : r),
            Xt(
              (e) =>
                e || s.historyUnavailable === !0 || (s.historyTruncated && s.nextCursor == null),
            ),
            Jt(`idle`));
        } catch {
          if (Zt.current !== t || W.current !== n) return;
          Jt(`error`);
        } finally {
          tn.current === s && (tn.current = null);
        }
      }
    }, [I?.nextCursor, H, Kt, V, U, R, Lt, Ft, zt, e.parentConversationId, k]),
    fn = fe({
      onSuccess: ({ receipt: e }, t) => {
        let n = Se(t.parentConversationId, t.threadId, t.command.taskId);
        (lt(n, { receipt: e }),
          ln.current === n &&
            ((cn.current = !1),
            Ke(e) && sn(!0),
            t.command.action !== `cancel_message` &&
              (e.status === `accepted` || e.status === `applied`) &&
              E(``)));
      },
      onError: (e, t) => {
        let n = qe(e),
          r = n === 404,
          i = n == null || n >= 500,
          a = t.command,
          o = Se(t.parentConversationId, t.threadId, a.taskId);
        (lt(o, {
          receipt: {
            invocationId: a.invocationId,
            ...(a.controlId == null ? {} : { controlId: a.controlId }),
            action: a.action,
            status: `failed`,
            createdAt: t.submittedAt,
            updatedAt: new Date().toISOString(),
            ...(a.message == null ? {} : { message: a.message }),
            reason: Je(r, i),
          },
          ...(i ? { retry: a } : {}),
        }),
          ln.current === o && ((cn.current = !1), r && (an(!0), sn(!0))));
      },
    });
  ((0, C.useEffect)(() => {
    if (M == null) return;
    let e = L?.controlReceipts?.find((e) => e.invocationId === M.invocationId);
    e != null &&
      (N != null &&
        N.action !== `cancel` &&
        N.action !== `cancel_message` &&
        (e.status === `accepted` || e.status === `applied`) &&
        E((e) => (e === N.message ? `` : e)),
      Ke(e) && sn(!0),
      ct(null));
  }, [N, ct, L?.controlReceipts, M]),
    (0, C.useEffect)(() => {
      L?.controlReceipts?.some(Ke) && sn(!0);
    }, [L?.controlReceipts]));
  let G = (0, C.useCallback)(
      (t, n, r) => {
        if (e.durable == null || fn.isLoading || cn.current || (N != null && r == null)) return;
        let i;
        if (
          ((i =
            r ??
            (t === `cancel_message`
              ? { taskId: e.durable.taskId, invocationId: f(), action: t, controlId: n }
              : t === `cancel`
                ? { taskId: e.durable.taskId, invocationId: f(), action: t }
                : { taskId: e.durable.taskId, invocationId: f(), action: t, message: T.trim() })),
          t !== `cancel` && t !== `cancel_message` && (i.message == null || i.message === ``))
        )
          return;
        let a = new Date().toISOString();
        (ct({
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
          (cn.current = !0),
          fn.mutate({
            parentConversationId: e.parentConversationId,
            threadId: e.durable.threadId,
            command: i,
            submittedAt: a,
          }));
      },
      [T, fn, N, e.durable, e.parentConversationId, ct],
    ),
    pn = (0, C.useCallback)(() => {
      ($e(),
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
    }, [$e, e.parentMessageId, e.partIndex, e.toolCallId]);
  ve(h, _);
  let mn = (0, C.useCallback)(
    (e) => {
      !_ || e.key !== `Escape` || e.defaultPrevented || (e.preventDefault(), pn());
    },
    [pn, _],
  );
  (0, C.useEffect)(() => {
    let e = document.activeElement;
    if (!(!_ || !(e instanceof HTMLElement)))
      return () => {
        e.isConnected && e.focus();
      };
  }, [_]);
  let K = (0, C.useMemo)(
      () =>
        Ce({
          title: ot,
          prompt: e.prompt,
          progress: O,
          persistedContent: e.persistedContent,
          isDetached: e.durable != null,
          legacyOutput: e.legacyOutput,
          initialProgress: e.durable == null ? e.initialProgress : 0,
          isSubmitting: e.durable == null ? e.isSubmitting : Dt,
          runStepStatus: e.durable == null ? e.runStepStatus : void 0,
        }),
      [Dt, ot, O, e],
    ),
    q = (0, C.useMemo)(() => {
      if (e.durable == null) return K;
      if (L == null) {
        let e = O == null ? { ...K, status: `dispatched` } : K;
        return M == null ? e : { ...e, controls: [M] };
      }
      let t = _e(L, e.durable.taskId),
        n =
          !((t.status === `running` || t.status === `dispatched`) && K.items.length > 0) &&
          t.items.length > 0
            ? t.items
            : K.items,
        r = { ...t, prompt: t.prompt ?? K.prompt, items: n };
      return M == null || (r.controls ?? []).some((e) => e.invocationId === M.invocationId)
        ? r
        : { ...r, controls: [...(r.controls ?? []), M] };
    }, [K, O, e.durable, L, M]),
    hn = e.event == null ? q.title : vt,
    gn = (0, C.useMemo)(
      () =>
        e.event == null
          ? []
          : gt
              .filter((e) => e.latestTaskId != null || e.threadId === k)
              .map((e) => {
                let t = e.agentId == null ? void 0 : et?.[e.agentId],
                  n = t?.name || e.actorId || e.title;
                return {
                  value: e.threadId,
                  label: t?.name != null && e.actorId != null ? `${n} · ${e.actorId}` : n,
                  icon: te(t, { size: `icon`, showBorder: !1 }),
                };
              }),
      [et, gt, e.event, k],
    ),
    _n = gn.find((e) => e.value === k)?.label ?? hn,
    vn = _t?.agentId ?? I?.agentId ?? it,
    yn = te(vn == null ? void 0 : et?.[vn], { size: `icon`, showBorder: !1 }),
    J = (0, C.useMemo)(() => (I == null ? [] : ae(I)), [I]),
    bn = (0, C.useRef)({ threadId: k, generation: R, turns: J });
  (0, C.useEffect)(() => {
    if (I == null) return;
    let e = bn.current;
    if (e.threadId === k) {
      let t = new Set(J.map((e) => e.taskId)),
        n = e.turns.filter((e) => !t.has(e.taskId));
      if (n.length > 0 && nn.current) {
        if (Wt.current) {
          let e = se(B.current, n);
          ((B.current = e), Ht(e));
        } else Rt((e) => se(e, n));
      }
    }
    bn.current = { threadId: k, generation: R, turns: J };
  }, [V, J, R, k, I]);
  let xn = $t.current === W.current,
    Sn = (0, C.useMemo)(() => {
      let t = xn ? x(Ft, Lt, zt, Vt, J) : x(J);
      if (t.length > 0) {
        let n = t.findIndex((e) => e.taskId === A);
        if (n >= 0)
          return t.map((e, t) => {
            let r = t === n ? { ...e, activity: q } : e,
              i = jt.get(e.taskId);
            return i == null ? r : { ...r, activity: i };
          });
        let r = nt.get(k),
          i = r?.tasks.find((e) => e.taskId === A)?.createdAt,
          a = {
            taskId: A || `${e.parentMessageId}:${e.toolCallId}`,
            trigger: {
              kind: e.event == null ? `parent_continuation` : `external_event`,
              summary: e.prompt ?? q.prompt ?? ``,
              ...(i == null ? {} : { createdAt: i }),
            },
            activity: q,
          },
          o = t[t.length - 1]?.trigger.createdAt;
        return (
          (i != null && o != null ? i >= o : r?.latestTaskId === A) ? [...t, a] : [a, ...t]
        ).map((e) => {
          let t = jt.get(e.taskId);
          return t == null ? e : { ...e, activity: t };
        });
      }
      return [
        {
          taskId: A || `${e.parentMessageId}:${e.toolCallId}`,
          trigger: {
            kind: e.event == null ? `parent_dispatch` : `external_event`,
            summary: e.prompt ?? q.prompt ?? ``,
          },
          activity: q,
        },
      ];
    }, [q, nt, J, Lt, Ft, Vt, zt, xn, k, e, A, jt]),
    Cn = (0, C.useMemo)(() => {
      let e = new Map(Nt);
      return (q.activityTruncated === !0 && A !== `` && e.set(A, `unavailable`), e);
    }, [q.activityTruncated, A, Nt]),
    wn = !V && (H === void 0 || Kt !== R),
    Tn = wn ? I?.nextCursor : H,
    En =
      Yt ||
      I?.historyUnavailable === !0 ||
      (wn && I?.historyTruncated === !0 && I.nextCursor == null),
    Dn = e.durable == null || I == null || Array.isArray(I.turns),
    On = rn || M?.reason === `task_inaccessible`,
    kn = L != null && Pe(L.status),
    An = L != null && (L.status === `running` || (L.status === `dispatched` && Ae(L, A))),
    Y = e.durable != null && An && !On && !on,
    X = fn.isLoading || M?.status === `submitted` || N != null,
    jn = Y || N != null || M?.reason === `task_inaccessible`,
    Mn =
      e.host === `conversation` &&
      e.durable != null &&
      L?.subagentKind === `agent` &&
      L.agentId != null &&
      L.status === `completed` &&
      Ae(L, A) &&
      L.messages.some((e) => e.messageId === `${A}:assistant`),
    Nn = (0, C.useCallback)(() => {
      !Mn ||
        e.durable == null ||
        At.isLoading ||
        ((kt.current = { identity: j, text: T.trim() }),
        Ue(!0),
        At.mutate({
          conversationId: e.durable.threadId,
          messageId: `${e.durable.taskId}:assistant`,
          option: ue.DIRECT_PATH,
        }));
    }, [Mn, At, j, T, e.durable]),
    Z = null;
  Y ? (Z = `control`) : Mn && (Z = `continue`);
  let Pn = (0, C.useRef)(null);
  Z == null
    ? Pn.current != null && Pn.current.threadId !== k && (Pn.current = null)
    : (Pn.current = { threadId: k, mode: Z });
  let Fn = Z == null && (L == null || (kn && !on && !On)),
    Q = Z;
  Q == null && Fn && (Q = Pn.current?.mode ?? (kn ? `control` : null));
  let In = oe || _,
    Ln = n(`com_endpoint_message_new`, { 0: hn }),
    Rn = n(Q === `control` ? `com_ui_steer_send` : `com_ui_subagent_continue_new_chat`),
    zn = (0, C.useCallback)(() => G(`cancel`), [G]),
    Bn = Y && !X ? { onStop: zn, stopLabel: n(`com_ui_subagent_cancel_task`) } : {},
    Vn = (0, C.useRef)(!1),
    Hn = (0, C.useRef)(null);
  Vn.current = Q === `control`;
  let Un;
  Un = Fn ? !1 : Q === `control` ? !X && T.trim() !== `` : !At.isLoading;
  let Wn = (0, C.useMemo)(() => {
      if (Q !== `control`) return [];
      let e = {
          isComposing: !1,
          isSubmitting: !0,
          allowSubmitWhileGenerating: !0,
          hasDuringRunModifier: !0,
          shortcutsEnabled: me,
          enterToSend: y,
          submitOverride: b,
          yieldedChords: S,
        },
        t = { key: `Enter`, altKey: !1, ctrlKey: !1, metaKey: !1, shiftKey: !1 },
        r = he(t, e),
        i = he({ ...t, ctrlKey: !ce, metaKey: ce }, e),
        a = he({ ...t, altKey: !0 }, e),
        o = ce ? `⌘⏎` : `Ctrl ⏎`,
        l = ce ? `⌥⏎` : `Alt ⏎`,
        d;
      r === `submit` ? (d = `⏎`) : i === `submit` && (d = o);
      let f = !Y || X || T.trim() === ``;
      return [
        {
          key: `steer`,
          label: n(`com_ui_steer`),
          kbd: d,
          icon: (0, w.jsx)(c, { className: `h-4 w-4 text-status-warning`, 'aria-hidden': `true` }),
          disabled: f,
          onClick: () => G(`steer`),
        },
        {
          key: `queue`,
          label: n(`com_ui_queue`),
          kbd: i === `other` ? o : void 0,
          icon: (0, w.jsx)(u, { className: `h-4 w-4 text-status-info`, 'aria-hidden': `true` }),
          disabled: f,
          onClick: () => G(`queue`),
        },
        {
          key: `interrupt`,
          label: n(`com_ui_subagent_interrupt`),
          kbd: a === `interrupt` ? l : void 0,
          icon: (0, w.jsx)(s, { className: `h-4 w-4 text-status-error`, 'aria-hidden': `true` }),
          disabled: f,
          onClick: () => G(`interrupt`),
        },
      ];
    }, [Q, Y, T, X, y, n, me, G, b, S]),
    Gn = (0, C.useCallback)(
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
            yieldedChords: S,
          }),
          i = Ye[r];
        return i == null
          ? r === `newline`
            ? `newline`
            : r === `block`
              ? `block`
              : `none`
          : ((Hn.current = { event: e, control: i }), `submit`);
      },
      [y, me, b, S],
    ),
    Kn = (0, C.useCallback)(
      (e) => {
        if (!Y) {
          Nn();
          return;
        }
        let t = Hn.current;
        ((Hn.current = null), G(e != null && t?.event === e ? t.control : `steer`));
      },
      [Nn, Y, G],
    ),
    qn = (0, C.useCallback)(
      (t) => {
        let n = gt.find((e) => e.threadId === t);
        if (n == null) return;
        let r = Le(e.parentConversationId, n, e.event?.siblingParentMessageIds);
        r != null && D(r);
      },
      [gt, e.event?.siblingParentMessageIds, e.parentConversationId, D],
    ),
    $ = `ready`;
  e.durable != null && K.items.length === 0 && (bt || Ct)
    ? ($ = `loading`)
    : e.durable != null && K.items.length === 0 && xt && ($ = `error`);
  let Jn = (t) =>
      t.taskId === A
        ? (0, w.jsx)(
            Be,
            {
              activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${t.taskId}`,
              activity: q,
              state: $,
              embedded: !0,
              onCancelControl: Y && !X ? (e) => G(`cancel_message`, e) : void 0,
            },
            t.taskId,
          )
        : (0, w.jsx)(Qe, { selection: e, task: t, title: q.title }, t.taskId),
    Yn = () => {
      dt({ threadId: k, count: Math.min(F, ft + Ge), taskCount: F });
    },
    Xn = null;
  mt
    ? (Xn = (0, w.jsx)(`div`, {
        className: `flex justify-center border-b border-border-light px-4 py-2`,
        children: (0, w.jsx)(m, {
          type: `button`,
          variant: `ghost`,
          size: `sm`,
          onClick: Yn,
          children: n(`com_ui_load_more`),
        }),
      }))
    : P?.tasksTruncated === !0 &&
      (Xn = (0, w.jsx)(`div`, {
        role: `status`,
        'aria-label': n(`com_ui_subagent_thread_history_truncated`),
        className: `flex h-7 items-center justify-center border-b border-border-light text-text-tertiary`,
        children: (0, w.jsx)(`span`, { 'aria-hidden': !0, children: `•••` }),
      }));
  let Zn = (0, C.useMemo)(() => new Map([[A || Sn[0]?.taskId || ``, $]]), [Sn, $, A]),
    Qn;
  return (
    (Qn = Dn
      ? (0, w.jsxs)(Fe, {
          padded: !1,
          headerInset: !0,
          children: [
            En &&
              (0, w.jsx)(`div`, {
                role: `status`,
                'aria-label': n(`com_ui_subagent_thread_history_truncated`),
                className: `flex h-7 items-center justify-center border-b border-border-light text-text-tertiary`,
                children: (0, w.jsx)(`span`, { 'aria-hidden': !0, children: `•••` }),
              }),
            Tn != null &&
              U !== `error` &&
              (0, w.jsx)(`div`, {
                className: `flex justify-center border-b border-border-light px-4 py-2`,
                children: (0, w.jsx)(m, {
                  type: `button`,
                  variant: `ghost`,
                  size: `sm`,
                  disabled: U === `loading`,
                  onClick: () => void dn(),
                  children: n(
                    U === `loading` ? `com_ui_loading` : `com_ui_subagent_load_earlier_activity`,
                  ),
                }),
              }),
            U === `error` &&
              (0, w.jsx)(`div`, {
                className: `flex justify-center border-b border-border-light px-4 py-2`,
                children: (0, w.jsx)(m, {
                  type: `button`,
                  variant: `ghost`,
                  size: `sm`,
                  onClick: () => void dn(),
                  children: n(`com_ui_retry`),
                }),
              }),
            (0, w.jsx)(ze, {
              turns: Sn,
              agentId: I?.agentId,
              conversationId: k || e.parentConversationId,
              stateByTask: Zn,
              controllableTaskId: Y && !X ? e.durable?.taskId : void 0,
              onCancelControl: (e, t) => G(`cancel_message`, t),
              detailStateByTask: Cn,
              onLoadTurnDetails: un,
            }),
          ],
        })
      : e.event != null && ((P?.tasks.length ?? 0) > 1 || P?.tasksTruncated === !0)
        ? (0, w.jsx)(Fe, {
            padded: !1,
            headerInset: !0,
            children: (0, w.jsxs)(`div`, {
              'data-subagent-thread-timeline': !0,
              children: [Xn, pt.map(Jn)],
            }),
          })
        : (0, w.jsx)(
            Be,
            {
              activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
              activity: q,
              state: $,
              showPrompt: !1,
              headerInset: !0,
              onCancelControl: Y && !X ? (e) => G(`cancel_message`, e) : void 0,
            },
            `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
          )),
    (0, w.jsxs)(`aside`, {
      ref: h,
      role: _ ? `dialog` : `region`,
      'aria-modal': _ || void 0,
      'aria-label': n(`com_ui_subagent_thread_panel`),
      onKeyDown: mn,
      className: `relative flex h-full w-full flex-col overflow-hidden bg-surface-primary-alt text-text-primary`,
      children: [
        (0, w.jsxs)(`header`, {
          className: `absolute top-0 z-10 flex h-[52px] w-full items-center gap-2 bg-gradient-to-b from-surface-primary-alt via-surface-primary-alt/70 to-transparent p-2 font-semibold text-text-primary`,
          children: [
            gn.length > 1
              ? (0, w.jsx)(`div`, {
                  className: `flex min-w-0 flex-1`,
                  onKeyDown: (e) => {
                    e.key === `Escape` && je && e.stopPropagation();
                  },
                  children: (0, w.jsx)(g, {
                    isCollapsed: !1,
                    selectedValue: k,
                    setValue: qn,
                    displayValue: _n,
                    selectPlaceholder: _n,
                    searchPlaceholder: n(`com_agents_search_name`),
                    ariaLabel: n(`com_ui_subagent_actor`),
                    items: gn,
                    SelectIcon: yn,
                    disabled: He,
                    portal: !1,
                    onOpenChange: Ve,
                    containerClassName: `min-w-0 flex-1 px-0`,
                    className: `h-9 w-full border-transparent bg-transparent font-semibold hover:bg-surface-hover`,
                    showCarat: !0,
                  }),
                })
              : (0, w.jsxs)(w.Fragment, {
                  children: [
                    (0, w.jsx)(`div`, {
                      className: `flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full`,
                      children: yn,
                    }),
                    (0, w.jsx)(`h2`, {
                      className: `min-w-0 flex-1 truncate text-sm font-semibold`,
                      title: hn,
                      children: hn,
                    }),
                  ],
                }),
            (0, w.jsx)(m, {
              type: `button`,
              variant: `ghost`,
              size: `icon`,
              onClick: pn,
              'aria-label': n(`com_ui_close`),
              className: `h-8 w-8 shrink-0`,
              children: (0, w.jsx)(a, { size: 17, 'aria-hidden': `true` }),
            }),
          ],
        }),
        (0, w.jsx)(
          Ne,
          { children: Qn },
          `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
        ),
        (jn || Q != null) &&
          (0, w.jsxs)(`div`, {
            className: De(`shrink-0 px-3 pt-2`, t ? `pb-10` : `pb-4`),
            children: [
              M?.status === `failed` &&
                (0, w.jsxs)(xe, {
                  variant: `error`,
                  className: `mb-2 flex items-center gap-2`,
                  children: [
                    (0, w.jsx)(`span`, { className: `min-w-0 flex-1`, children: n(Xe(M.reason)) }),
                    N != null &&
                      (0, w.jsx)(m, {
                        type: `button`,
                        size: `sm`,
                        variant: `outline`,
                        disabled: fn.isLoading,
                        onClick: () => G(N.action, N.controlId, N),
                        children: n(`com_ui_retry`),
                      }),
                  ],
                }),
              Q != null &&
                (0, w.jsx)(ne, {
                  value: T,
                  onChange: E,
                  onSubmit: Kn,
                  canSubmit: Un,
                  disabled: Q === `control` && X,
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
                        (0, w.jsx)(
                          m,
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
function Qe({ selection: e, task: t, title: n }) {
  let r = e.durable?.threadId ?? ``,
    {
      data: i,
      isLoading: a,
      isError: o,
      isReadinessPending: s,
    } = we(e.parentConversationId, r, t.taskId),
    c = (0, C.useMemo)(
      () => (i == null ? { title: n, status: t.status, items: [], controls: [] } : _e(i, t.taskId)),
      [i, t.status, t.taskId, n],
    ),
    l = `ready`;
  return (
    o ? (l = `error`) : (a || s) && (l = `loading`),
    (0, w.jsx)(Be, {
      activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${t.taskId}`,
      activity: c,
      state: l,
      showPrompt: !1,
      embedded: !0,
    })
  );
}
export { Ze as default };
