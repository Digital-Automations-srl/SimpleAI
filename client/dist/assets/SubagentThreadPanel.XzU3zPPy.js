import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  Ct as r,
  Et as i,
  Nt as a,
  Ti as o,
  Tt as s,
  Vn as c,
  jt as l,
  u as ee,
  wt as u,
} from './vendor.D0DpYPgQ.js';
import { n as d } from './mermaid.C3Ct62iP.js';
import { r as te } from './query-devtools.DIz6FZCX.js';
import {
  Af as f,
  Bn as p,
  Bp as m,
  Hp as h,
  Ju as ne,
  Mp as g,
  O_ as _,
  P_ as re,
  Qh as ie,
  _r as ae,
  ar as oe,
  cr as se,
  do as ce,
  dr as le,
  ds as ue,
  f_ as v,
  fc as de,
  fl as fe,
  fr as pe,
  gp as me,
  gr as he,
  ho as ge,
  hr as y,
  hs as _e,
  ir as ve,
  l as ye,
  ll as be,
  lr as xe,
  mr as Se,
  n_ as Ce,
  or as we,
  pl as Te,
  pr as Ee,
  ps as De,
  rr as Oe,
  sr as b,
  tg as ke,
  tr as Ae,
  ug as je,
  ul as Me,
  ur as Ne,
  vr as Pe,
} from './hooks.CT2XGurp.js';
import {
  F as Fe,
  V as Ie,
  b as Le,
  i as Re,
  n as ze,
  o as Be,
  s as Ve,
  y as He,
} from './eventSelection.BVcZZFFx.js';
var x = e(t(), 1),
  Ue = 500,
  We = 5e3,
  Ge = (e) => {
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
function Ke(e, t = !0) {
  let { token: n, isAuthenticated: r } = p(),
    i = te(),
    a = ae(e.parentMessageId, e.event?.progressKey ?? e.toolCallId, e.partIndex),
    o = s(he(a)),
    c = u(y(a)),
    l = s(y(a)),
    d = (0, x.useRef)(c),
    f = e.durable,
    m = f?.threadId,
    h = f?.taskId;
  ((0, x.useEffect)(() => {
    ((d.current = c), c || o(Ne));
  }, [c, o]),
    (0, x.useEffect)(() => {
      e.isSubmitting && (pe(a), (d.current = !0), l(!0));
    }, [a, e.isSubmitting, l]),
    (0, x.useEffect)(() => {
      if (e.host !== `conversation` || m == null || h == null || !t || !r || n == null) return;
      let s = [v.subagentThread, e.parentConversationId, m, h],
        c = `${_()}/api/convos/${encodeURIComponent(e.parentConversationId)}/subagents/${encodeURIComponent(m)}/tasks/${encodeURIComponent(h)}/activity`,
        l,
        u,
        te = 0,
        f = !1,
        p = !1,
        ne = () => {
          let e = l;
          ((l = void 0), e?.close());
        },
        g = () => {
          if (((u = void 0), f || p)) return;
          let t = new ee(c, { method: `GET`, headers: { Authorization: `Bearer ${n}` } });
          ((l = t),
            t.addEventListener(`message`, (n) => {
              if (l !== t || f) return;
              let r;
              try {
                r = JSON.parse(n.data);
              } catch {
                return;
              }
              if (r.final === !0 && r.subagentActivity === !0) {
                ((p = !0), ne(), i.invalidateQueries(s));
                return;
              }
              let c = r.data;
              r.event !== je.ON_SUBAGENT_UPDATE ||
                !Ge(c) ||
                ((e.event != null ||
                  c.parentToolCallId == null ||
                  c.parentToolCallId === e.toolCallId) &&
                  ((te = 0), pe(a), o((e) => le(e, [c], `detached`, d.current))));
            }),
            t.addEventListener(`error`, () => {
              if (l !== t || f || p || u != null) return;
              ne();
              let e = Math.min(Ue * 2 ** te, We);
              ((te += 1), (u = setTimeout(g, e)));
            }));
        };
      return (
        g(),
        () => {
          ((f = !0), u != null && clearTimeout(u), ne());
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
      o,
      h,
      m,
      n,
    ]));
}
var S = n(),
  qe = 3,
  C = new Set([`task_not_running`, `task_completed`, `task_cancelled`, `task_failed`]),
  w = (e) => e != null && C.has(e),
  Je = (e) => w(e.reason) || (e.action === `cancel` && e.status === `applied`),
  Ye = (e) =>
    typeof e == `object` &&
    e &&
    `response` in e &&
    typeof e.response == `object` &&
    e.response != null &&
    `status` in e.response &&
    typeof e.response.status == `number`
      ? e.response.status
      : void 0,
  Xe = (e, t) => (e ? `task_inaccessible` : t ? `owner_unavailable` : `invalid_command`),
  Ze = { submit: `steer`, other: `queue`, interrupt: `interrupt`, preempt: `interrupt` },
  Qe = (e) =>
    e === `task_inaccessible`
      ? `com_ui_subagent_control_reason_task_inaccessible`
      : e === `owner_unavailable`
        ? `com_ui_subagent_control_reason_owner_unavailable`
        : `com_ui_subagent_control_reason_invalid_command`;
function $e({ selection: e }) {
  let t = Be(),
    n = ue(),
    ee = i(),
    { showToast: u } = ke(),
    { navigateToConvo: te } = De(),
    p = (0, x.useRef)(null),
    _ = ie(`(max-width: 767px)`),
    le = ie(`(hover: none)`),
    {
      enterToSend: v,
      handOffComposerText: pe,
      composerBindings: { shortcutsEnabled: he, submitOverride: y, yieldedChords: je },
    } = Ae(),
    [Ne, Ue] = (0, x.useState)(!1),
    [We, Ge] = (0, x.useState)(!1),
    [C, w] = (0, x.useState)(``),
    $e = We || C.trim() !== ``,
    T = s(xe),
    tt = (0, x.useCallback)(() => T(null), [T]),
    E = _e(),
    { byMessageId: nt, byThreadId: rt, refresh: it } = Re(),
    D = Pe(ae(e.parentMessageId, e.event?.progressKey ?? e.toolCallId, e.partIndex)),
    at = Oe(D, e.subagentIdentity),
    ot = at == null ? void 0 : E?.[at],
    st =
      e.subagentType === `self`
        ? n(`com_ui_subagent_dialog_title_self`)
        : n(`com_ui_subagent_dialog_title`, { 0: ot?.name || e.subagentType }),
    O = e.durable?.threadId ?? ``,
    k = e.durable?.taskId ?? ``,
    A = Se(e.parentConversationId, O, k),
    [ct, lt] = r(Ee(A)),
    ut = (0, x.useCallback)((e, t) => ee.set(Ee(e), t), [ee]),
    j = ct?.receipt ?? null,
    M = ct?.retry ?? null,
    N = e.event == null ? void 0 : rt.get(O),
    P = N?.tasks.length ?? 0,
    [dt, ft] = (0, x.useState)(() => ({ threadId: O, count: qe, taskCount: N == null ? null : P }));
  (0, x.useEffect)(() => {
    ft((e) => {
      if (e.threadId !== O || e.taskCount == null) return { threadId: O, count: qe, taskCount: P };
      let t = Math.max(0, P - e.taskCount);
      return { threadId: O, count: Math.min(P, e.count + t), taskCount: P };
    });
  }, [P, O]);
  let pt = Math.min(P, dt.threadId === O ? dt.count : qe),
    mt = (0, x.useMemo)(() => (N?.tasks ?? []).slice(0, pt).reverse(), [N?.tasks, pt]),
    ht = pt < P,
    gt = N?.tasks.find((e) => e.taskId === k)?.status === `running`,
    _t = (0, x.useMemo)(() => {
      if (e.event == null) return [];
      let t = new Set();
      return (e.event.siblingParentMessageIds ?? [e.parentMessageId])
        .flatMap((e) => nt.get(e) ?? [])
        .filter((e) => !t.has(e.threadId) && (t.add(e.threadId), !0));
    }, [nt, e.event, e.parentMessageId]),
    vt = _t.find((e) => e.threadId === O),
    yt = (vt?.agentId == null ? void 0 : E?.[vt.agentId]?.name) ?? vt?.actorId ?? N?.actorId ?? st,
    {
      data: bt,
      isLoading: xt,
      isError: St,
      isPreviousData: Ct,
      isReadinessPending: wt,
      refetch: Tt,
    } = Te(e.parentConversationId, O, k, {
      keepPreviousData: !0,
      ...(gt ? { refetchInterval: be } : {}),
    }),
    F = bt?.threadId === O ? bt : void 0,
    I = Ct ? void 0 : F,
    L = JSON.stringify([F?.nextCursor ?? null, ...(F?.turns?.map((e) => e.taskId) ?? [])]),
    Et = (0, x.useRef)(L);
  Et.current = L;
  let R =
      Me(I, k) &&
      (I?.status === `completed` ||
        I?.status === `failed` ||
        I?.status === `interrupted` ||
        I?.status === `cancelled`),
    Dt = (0, x.useRef)(!1);
  (Ke(e, !R || gt),
    (0, x.useEffect)(() => {
      e.event != null && it();
    }, [it, e.event, O]),
    (0, x.useEffect)(() => {
      Dt.current = !1;
    }, [k, O]),
    (0, x.useEffect)(() => {
      e.event != null && (R && !Dt.current && it(), (Dt.current = R));
    }, [R, it, e.event]),
    (0, x.useEffect)(() => {
      e.event == null || !gt || !R || Tt();
    }, [R, gt, Tt, e.event]),
    (0, x.useEffect)(() => {
      if (
        e.event == null ||
        e.event.pinnedTask === !0 ||
        $e ||
        N?.latestTaskId == null ||
        N.latestTaskId === k
      )
        return;
      let t = ze(e.parentConversationId, N, e.event.siblingParentMessageIds);
      t != null && T(t);
    }, [N, e, $e, T, k]));
  let Ot = e.durable != null && D != null && D.status !== `stop` && D.status !== `error`,
    kt = (0, x.useRef)(C);
  kt.current = C;
  let At = (0, x.useRef)(null),
    jt = de({
      onSuccess: (e) => {
        let t = e.conversation?.conversationId,
          n = At.current;
        ((At.current = null), Ge(!1));
        let r = n?.identity === ln.current,
          i = r ? kt.current.trim() : (n?.text ?? ``);
        (t != null && i !== `` && pe(t, i), r && w(``), tt(), te(e.conversation));
      },
      onError: () => {
        ((At.current = null),
          Ge(!1),
          u({ message: n(`com_ui_continue_chat_error`), status: `error` }));
      },
    }),
    [Mt, Nt] = (0, x.useState)(() => new Map()),
    [Pt, z] = (0, x.useState)(() => new Map()),
    [Ft, It] = (0, x.useState)([]),
    [Lt, Rt] = (0, x.useState)([]),
    [zt, Bt] = (0, x.useState)([]),
    [Vt, Ht] = (0, x.useState)([]),
    B = (0, x.useRef)(Vt),
    [V, Ut] = (0, x.useState)(!1),
    Wt = (0, x.useRef)(V),
    [H, Gt] = (0, x.useState)(void 0),
    [Kt, qt] = (0, x.useState)(),
    [U, Jt] = (0, x.useState)(`idle`),
    [Yt, Xt] = (0, x.useState)(!1),
    Zt = (0, x.useRef)(O),
    Qt = (0, x.useRef)(O),
    W = (0, x.useRef)(0),
    $t = (0, x.useRef)(0),
    en = (0, x.useRef)(new Set()),
    tn = (0, x.useRef)(null),
    nn = (0, x.useRef)(!1);
  (Qt.current !== O && ((Qt.current = O), (W.current += 1)), (Zt.current = O));
  let [rn, an] = (0, x.useState)(!1),
    [on, sn] = (0, x.useState)(!1),
    cn = (0, x.useRef)(!1),
    ln = (0, x.useRef)(A);
  ((0, x.useEffect)(
    () => (
      (ln.current = A),
      w(``),
      an(!1),
      sn(!1),
      (cn.current = !1),
      () => {
        ln.current = ``;
      }
    ),
    [A],
  ),
    (0, x.useEffect)(() => {
      (Nt(new Map()),
        z(new Map()),
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
    }, [O]),
    (0, x.useEffect)(() => {
      F != null &&
        (F.historyUnavailable === !0 || (F.historyTruncated === !0 && F.nextCursor == null)) &&
        Xt(!0);
    }, [F]));
  let un = (0, x.useCallback)(
      async (t) => {
        let n = O,
          r = W.current,
          i = `${r}\u0000${n}\u0000${t}`;
        if (!(Pt.get(t) === `loading` || en.current.has(i))) {
          (en.current.add(i), z((e) => new Map(e).set(t, `loading`)));
          try {
            let i = await re.getSubagentThread(e.parentConversationId, n, t);
            if (Zt.current !== n || W.current !== r) return;
            if (!Me(i, t)) {
              z((e) => new Map(e).set(t, `unavailable`));
              return;
            }
            let a = ve(i, t);
            (Nt((e) => new Map(e).set(t, a)),
              z((e) => new Map(e).set(t, a.activityTruncated === !0 ? `unavailable` : `idle`)));
          } catch {
            if (Zt.current !== n || W.current !== r) return;
            z((e) => new Map(e).set(t, `error`));
          } finally {
            en.current.delete(i);
          }
        }
      },
      [e.parentConversationId, O, Pt],
    ),
    dn = (0, x.useCallback)(async () => {
      let t = O,
        n = W.current,
        r = V ? (Kt ?? L) : L,
        i = !V && H !== void 0 && Kt !== r,
        a = i || V,
        o = H === void 0 || i ? F?.nextCursor : H,
        s = `${n}\u0000${t}\u0000${o ?? ``}\u0000${r}`;
      if (o != null && U !== `loading` && tn.current == null) {
        ((tn.current = s), Jt(`loading`));
        try {
          let s = await re.getSubagentThread(e.parentConversationId, t, void 0, o);
          if (Zt.current !== t || W.current !== n) return;
          if (!V && Et.current !== r) {
            Jt(`idle`);
            return;
          }
          let c = oe(s),
            l = !1;
          if (a) {
            let e = i ? se(Lt, zt) : Lt,
              t = b(c, i ? [] : zt),
              n = new Set(b(Ft, e, B.current).map((e) => e.taskId));
            if (c.some((e) => n.has(e.taskId)) || s.nextCursor == null) {
              l = !0;
              let n = B.current;
              ((B.current = []),
                It((r) => b(r, e, t, n)),
                Rt([]),
                Bt([]),
                Ht([]),
                Ut(!1),
                (Wt.current = !1));
            } else (i && Rt(e), Bt(t), Ut(!0), (Wt.current = !0));
          } else It((e) => b(c, e));
          ((nn.current = !0),
            Gt(s.nextCursor ?? null),
            qt(l ? Et.current : r),
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
    }, [F?.nextCursor, H, Kt, V, U, L, Lt, Ft, zt, e.parentConversationId, O]),
    fn = fe({
      onSuccess: ({ receipt: e }, t) => {
        let n = Se(t.parentConversationId, t.threadId, t.command.taskId);
        (ut(n, { receipt: e }),
          ln.current === n &&
            ((cn.current = !1),
            Je(e) && sn(!0),
            t.command.action !== `cancel_message` &&
              (e.status === `accepted` || e.status === `applied`) &&
              w(``)));
      },
      onError: (e, t) => {
        let n = Ye(e),
          r = n === 404,
          i = n == null || n >= 500,
          a = t.command,
          o = Se(t.parentConversationId, t.threadId, a.taskId);
        (ut(o, {
          receipt: {
            invocationId: a.invocationId,
            ...(a.controlId == null ? {} : { controlId: a.controlId }),
            action: a.action,
            status: `failed`,
            createdAt: t.submittedAt,
            updatedAt: new Date().toISOString(),
            ...(a.message == null ? {} : { message: a.message }),
            reason: Xe(r, i),
          },
          ...(i ? { retry: a } : {}),
        }),
          ln.current === o && ((cn.current = !1), r && (an(!0), sn(!0))));
      },
    });
  ((0, x.useEffect)(() => {
    if (j == null) return;
    let e = I?.controlReceipts?.find((e) => e.invocationId === j.invocationId);
    e != null &&
      (M != null &&
        M.action !== `cancel` &&
        M.action !== `cancel_message` &&
        (e.status === `accepted` || e.status === `applied`) &&
        w((e) => (e === M.message ? `` : e)),
      Je(e) && sn(!0),
      lt(null));
  }, [M, lt, I?.controlReceipts, j]),
    (0, x.useEffect)(() => {
      I?.controlReceipts?.some(Je) && sn(!0);
    }, [I?.controlReceipts]));
  let G = (0, x.useCallback)(
      (t, n, r) => {
        if (e.durable == null || fn.isLoading || cn.current || (M != null && r == null)) return;
        let i;
        if (
          ((i =
            r ??
            (t === `cancel_message`
              ? { taskId: e.durable.taskId, invocationId: d(), action: t, controlId: n }
              : t === `cancel`
                ? { taskId: e.durable.taskId, invocationId: d(), action: t }
                : { taskId: e.durable.taskId, invocationId: d(), action: t, message: C.trim() })),
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
          (cn.current = !0),
          fn.mutate({
            parentConversationId: e.parentConversationId,
            threadId: e.durable.threadId,
            command: i,
            submittedAt: a,
          }));
      },
      [C, fn, M, e.durable, e.parentConversationId, lt],
    ),
    pn = (0, x.useCallback)(() => {
      (tt(),
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
    }, [tt, e.parentMessageId, e.partIndex, e.toolCallId]);
  ye(p, _);
  let mn = (0, x.useCallback)(
    (e) => {
      !_ || e.key !== `Escape` || e.defaultPrevented || (e.preventDefault(), pn());
    },
    [pn, _],
  );
  (0, x.useEffect)(() => {
    let e = document.activeElement;
    if (!(!_ || !(e instanceof HTMLElement)))
      return () => {
        e.isConnected && e.focus();
      };
  }, [_]);
  let K = (0, x.useMemo)(
      () =>
        we({
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
    q = (0, x.useMemo)(() => {
      if (e.durable == null) return K;
      if (I == null) {
        let e = D == null ? { ...K, status: `dispatched` } : K;
        return j == null ? e : { ...e, controls: [j] };
      }
      let t = ve(I, e.durable.taskId),
        n =
          !((t.status === `running` || t.status === `dispatched`) && K.items.length > 0) &&
          t.items.length > 0
            ? t.items
            : K.items,
        r = { ...t, prompt: t.prompt ?? K.prompt, items: n };
      return j == null || (r.controls ?? []).some((e) => e.invocationId === j.invocationId)
        ? r
        : { ...r, controls: [...(r.controls ?? []), j] };
    }, [K, D, e.durable, I, j]),
    hn = e.event == null ? q.title : yt,
    gn = (0, x.useMemo)(
      () =>
        e.event == null
          ? []
          : _t
              .filter((e) => e.latestTaskId != null || e.threadId === O)
              .map((e) => {
                let t = e.agentId == null ? void 0 : E?.[e.agentId],
                  n = t?.name || e.actorId || e.title;
                return {
                  value: e.threadId,
                  label: t?.name != null && e.actorId != null ? `${n} · ${e.actorId}` : n,
                  icon: f(t, { size: `icon`, showBorder: !1 }),
                };
              }),
      [E, _t, e.event, O],
    ),
    _n = gn.find((e) => e.value === O)?.label ?? hn,
    vn = vt?.agentId ?? F?.agentId ?? at,
    yn = f(vn == null ? void 0 : E?.[vn], { size: `icon`, showBorder: !1 }),
    J = (0, x.useMemo)(() => (F == null ? [] : oe(F)), [F]),
    bn = (0, x.useRef)({ threadId: O, generation: L, turns: J });
  (0, x.useEffect)(() => {
    if (F == null) return;
    let e = bn.current;
    if (e.threadId === O) {
      let t = new Set(J.map((e) => e.taskId)),
        n = e.turns.filter((e) => !t.has(e.taskId));
      if (n.length > 0 && nn.current) {
        if (Wt.current) {
          let e = se(B.current, n);
          ((B.current = e), Ht(e));
        } else Rt((e) => se(e, n));
      }
    }
    bn.current = { threadId: O, generation: L, turns: J };
  }, [V, J, L, O, F]);
  let xn = $t.current === W.current,
    Sn = (0, x.useMemo)(() => {
      let t = xn ? b(Ft, Lt, zt, Vt, J) : b(J);
      if (t.length > 0) {
        let n = t.findIndex((e) => e.taskId === k);
        if (n >= 0)
          return t.map((e, t) => {
            let r = t === n ? { ...e, activity: q } : e,
              i = Mt.get(e.taskId);
            return i == null ? r : { ...r, activity: i };
          });
        let r = rt.get(O),
          i = r?.tasks.find((e) => e.taskId === k)?.createdAt,
          a = {
            taskId: k || `${e.parentMessageId}:${e.toolCallId}`,
            trigger: {
              kind: e.event == null ? `parent_continuation` : `external_event`,
              summary: e.prompt ?? q.prompt ?? ``,
              ...(i == null ? {} : { createdAt: i }),
            },
            activity: q,
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
            summary: e.prompt ?? q.prompt ?? ``,
          },
          activity: q,
        },
      ];
    }, [q, rt, J, Lt, Ft, Vt, zt, xn, O, e, k, Mt]),
    Cn = (0, x.useMemo)(() => {
      let e = new Map(Pt);
      return (q.activityTruncated === !0 && k !== `` && e.set(k, `unavailable`), e);
    }, [q.activityTruncated, k, Pt]),
    wn = !V && (H === void 0 || Kt !== L),
    Tn = wn ? F?.nextCursor : H,
    En =
      Yt ||
      F?.historyUnavailable === !0 ||
      (wn && F?.historyTruncated === !0 && F.nextCursor == null),
    Dn = e.durable == null || F == null || Array.isArray(F.turns),
    On = rn || j?.reason === `task_inaccessible`,
    kn = I != null && Ie(I.status),
    An = I != null && (I.status === `running` || (I.status === `dispatched` && Me(I, k))),
    Y = e.durable != null && An && !On && !on,
    X = fn.isLoading || j?.status === `submitted` || M != null,
    jn = Y || M != null || j?.reason === `task_inaccessible`,
    Mn =
      e.host === `conversation` &&
      e.durable != null &&
      I?.subagentKind === `agent` &&
      I.agentId != null &&
      I.status === `completed` &&
      Me(I, k) &&
      I.messages.some((e) => e.messageId === `${k}:assistant`),
    Nn = (0, x.useCallback)(() => {
      !Mn ||
        e.durable == null ||
        jt.isLoading ||
        ((At.current = { identity: A, text: C.trim() }),
        Ge(!0),
        jt.mutate({
          conversationId: e.durable.threadId,
          messageId: `${e.durable.taskId}:assistant`,
          option: Ce.DIRECT_PATH,
        }));
    }, [Mn, jt, A, C, e.durable]),
    Z = null;
  Y ? (Z = `control`) : Mn && (Z = `continue`);
  let Pn = (0, x.useRef)(null);
  Z == null
    ? Pn.current != null && Pn.current.threadId !== O && (Pn.current = null)
    : (Pn.current = { threadId: O, mode: Z });
  let Fn = Z == null && (I == null || (kn && !on && !On)),
    Q = Z;
  Q == null && Fn && (Q = Pn.current?.mode ?? (kn ? `control` : null));
  let In = le || _,
    Ln = n(`com_endpoint_message_new`, { 0: hn }),
    Rn = n(Q === `control` ? `com_ui_steer_send` : `com_ui_subagent_continue_new_chat`),
    zn = (0, x.useCallback)(() => G(`cancel`), [G]),
    Bn = Y && !X ? { onStop: zn, stopLabel: n(`com_ui_subagent_cancel_task`) } : {},
    Vn = (0, x.useRef)(!1),
    Hn = (0, x.useRef)(null);
  Vn.current = Q === `control`;
  let Un;
  Un = Fn ? !1 : Q === `control` ? !X && C.trim() !== `` : !jt.isLoading;
  let Wn = (0, x.useMemo)(() => {
      if (Q !== `control`) return [];
      let e = {
          isComposing: !1,
          isSubmitting: !0,
          allowSubmitWhileGenerating: !0,
          hasDuringRunModifier: !0,
          shortcutsEnabled: he,
          enterToSend: v,
          submitOverride: y,
          yieldedChords: je,
        },
        t = { key: `Enter`, altKey: !1, ctrlKey: !1, metaKey: !1, shiftKey: !1 },
        r = ge(t, e),
        i = ge({ ...t, ctrlKey: !ce, metaKey: ce }, e),
        a = ge({ ...t, altKey: !0 }, e),
        s = ce ? `⌘⏎` : `Ctrl ⏎`,
        ee = ce ? `⌥⏎` : `Alt ⏎`,
        u;
      r === `submit` ? (u = `⏎`) : i === `submit` && (u = s);
      let d = !Y || X || C.trim() === ``;
      return [
        {
          key: `steer`,
          label: n(`com_ui_steer`),
          kbd: u,
          icon: (0, S.jsx)(l, { className: `h-4 w-4 text-status-warning`, 'aria-hidden': `true` }),
          disabled: d,
          onClick: () => G(`steer`),
        },
        {
          key: `queue`,
          label: n(`com_ui_queue`),
          kbd: i === `other` ? s : void 0,
          icon: (0, S.jsx)(o, { className: `h-4 w-4 text-status-info`, 'aria-hidden': `true` }),
          disabled: d,
          onClick: () => G(`queue`),
        },
        {
          key: `interrupt`,
          label: n(`com_ui_subagent_interrupt`),
          kbd: a === `interrupt` ? ee : void 0,
          icon: (0, S.jsx)(c, { className: `h-4 w-4 text-status-error`, 'aria-hidden': `true` }),
          disabled: d,
          onClick: () => G(`interrupt`),
        },
      ];
    }, [Q, Y, C, X, v, n, he, G, y, je]),
    Gn = (0, x.useCallback)(
      (e, t) => {
        let n = Vn.current,
          r = ge(e, {
            isComposing: t,
            isSubmitting: n,
            allowSubmitWhileGenerating: n,
            hasDuringRunModifier: n,
            shortcutsEnabled: he,
            enterToSend: v,
            submitOverride: y,
            yieldedChords: je,
          }),
          i = Ze[r];
        return i == null
          ? r === `newline`
            ? `newline`
            : r === `block`
              ? `block`
              : `none`
          : ((Hn.current = { event: e, control: i }), `submit`);
      },
      [v, he, y, je],
    ),
    Kn = (0, x.useCallback)(
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
    qn = (0, x.useCallback)(
      (t) => {
        let n = _t.find((e) => e.threadId === t);
        if (n == null) return;
        let r = ze(e.parentConversationId, n, e.event?.siblingParentMessageIds);
        r != null && T(r);
      },
      [_t, e.event?.siblingParentMessageIds, e.parentConversationId, T],
    ),
    $ = `ready`;
  e.durable != null && K.items.length === 0 && (xt || wt)
    ? ($ = `loading`)
    : e.durable != null && K.items.length === 0 && St && ($ = `error`);
  let Jn = (t) =>
      t.taskId === k
        ? (0, S.jsx)(
            He,
            {
              activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${t.taskId}`,
              activity: q,
              state: $,
              embedded: !0,
              onCancelControl: Y && !X ? (e) => G(`cancel_message`, e) : void 0,
            },
            t.taskId,
          )
        : (0, S.jsx)(et, { selection: e, task: t, title: q.title }, t.taskId),
    Yn = () => {
      ft({ threadId: O, count: Math.min(P, pt + qe), taskCount: P });
    },
    Xn = null;
  ht
    ? (Xn = (0, S.jsx)(`div`, {
        className: `flex justify-center border-b border-border-light px-4 py-2`,
        children: (0, S.jsx)(g, {
          type: `button`,
          variant: `ghost`,
          size: `sm`,
          onClick: Yn,
          children: n(`com_ui_load_more`),
        }),
      }))
    : N?.tasksTruncated === !0 &&
      (Xn = (0, S.jsx)(`div`, {
        role: `status`,
        'aria-label': n(`com_ui_subagent_thread_history_truncated`),
        className: `flex h-7 items-center justify-center border-b border-border-light text-text-tertiary`,
        children: (0, S.jsx)(`span`, { 'aria-hidden': !0, children: `•••` }),
      }));
  let Zn = (0, x.useMemo)(() => new Map([[k || Sn[0]?.taskId || ``, $]]), [Sn, $, k]),
    Qn;
  return (
    (Qn = Dn
      ? (0, S.jsxs)(Le, {
          padded: !1,
          headerInset: !0,
          children: [
            En &&
              (0, S.jsx)(`div`, {
                role: `status`,
                'aria-label': n(`com_ui_subagent_thread_history_truncated`),
                className: `flex h-7 items-center justify-center border-b border-border-light text-text-tertiary`,
                children: (0, S.jsx)(`span`, { 'aria-hidden': !0, children: `•••` }),
              }),
            Tn != null &&
              U !== `error` &&
              (0, S.jsx)(`div`, {
                className: `flex justify-center border-b border-border-light px-4 py-2`,
                children: (0, S.jsx)(g, {
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
              (0, S.jsx)(`div`, {
                className: `flex justify-center border-b border-border-light px-4 py-2`,
                children: (0, S.jsx)(g, {
                  type: `button`,
                  variant: `ghost`,
                  size: `sm`,
                  onClick: () => void dn(),
                  children: n(`com_ui_retry`),
                }),
              }),
            (0, S.jsx)(Ve, {
              turns: Sn,
              agentId: F?.agentId,
              conversationId: O || e.parentConversationId,
              stateByTask: Zn,
              controllableTaskId: Y && !X ? e.durable?.taskId : void 0,
              onCancelControl: (e, t) => G(`cancel_message`, t),
              detailStateByTask: Cn,
              onLoadTurnDetails: un,
            }),
          ],
        })
      : e.event != null && ((N?.tasks.length ?? 0) > 1 || N?.tasksTruncated === !0)
        ? (0, S.jsx)(Le, {
            padded: !1,
            headerInset: !0,
            children: (0, S.jsxs)(`div`, {
              'data-subagent-thread-timeline': !0,
              children: [Xn, mt.map(Jn)],
            }),
          })
        : (0, S.jsx)(
            He,
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
    (0, S.jsxs)(`aside`, {
      ref: p,
      role: _ ? `dialog` : `region`,
      'aria-modal': _ || void 0,
      'aria-label': n(`com_ui_subagent_thread_panel`),
      onKeyDown: mn,
      className: `relative flex h-full w-full flex-col overflow-hidden bg-surface-primary-alt text-text-primary`,
      children: [
        (0, S.jsxs)(`header`, {
          className: `absolute top-0 z-10 flex h-[52px] w-full items-center gap-2 bg-gradient-to-b from-surface-primary-alt via-surface-primary-alt/70 to-transparent p-2 font-semibold text-text-primary`,
          children: [
            gn.length > 1
              ? (0, S.jsx)(`div`, {
                  className: `flex min-w-0 flex-1`,
                  onKeyDown: (e) => {
                    e.key === `Escape` && Ne && e.stopPropagation();
                  },
                  children: (0, S.jsx)(h, {
                    isCollapsed: !1,
                    selectedValue: O,
                    setValue: qn,
                    displayValue: _n,
                    selectPlaceholder: _n,
                    searchPlaceholder: n(`com_agents_search_name`),
                    ariaLabel: n(`com_ui_subagent_actor`),
                    items: gn,
                    SelectIcon: yn,
                    disabled: We,
                    portal: !1,
                    onOpenChange: Ue,
                    containerClassName: `min-w-0 flex-1 px-0`,
                    className: `h-9 w-full border-transparent bg-transparent font-semibold hover:bg-surface-hover`,
                    showCarat: !0,
                  }),
                })
              : (0, S.jsxs)(S.Fragment, {
                  children: [
                    (0, S.jsx)(`div`, {
                      className: `flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full`,
                      children: yn,
                    }),
                    (0, S.jsx)(`h2`, {
                      className: `min-w-0 flex-1 truncate text-sm font-semibold`,
                      title: hn,
                      children: hn,
                    }),
                  ],
                }),
            (0, S.jsx)(g, {
              type: `button`,
              variant: `ghost`,
              size: `icon`,
              onClick: pn,
              'aria-label': n(`com_ui_close`),
              className: `h-8 w-8 shrink-0`,
              children: (0, S.jsx)(a, { size: 17, 'aria-hidden': `true` }),
            }),
          ],
        }),
        (0, S.jsx)(
          Fe,
          { children: Qn },
          `${e.parentMessageId}\u0000${e.toolCallId}\u0000${e.partIndex}`,
        ),
        (jn || Q != null) &&
          (0, S.jsxs)(`div`, {
            className: ne(`shrink-0 px-3 pt-2`, t ? `pb-10` : `pb-4`),
            children: [
              j?.status === `failed` &&
                (0, S.jsxs)(me, {
                  variant: `error`,
                  className: `mb-2 flex items-center gap-2`,
                  children: [
                    (0, S.jsx)(`span`, { className: `min-w-0 flex-1`, children: n(Qe(j.reason)) }),
                    M != null &&
                      (0, S.jsx)(g, {
                        type: `button`,
                        size: `sm`,
                        variant: `outline`,
                        disabled: fn.isLoading,
                        onClick: () => G(M.action, M.controlId, M),
                        children: n(`com_ui_retry`),
                      }),
                  ],
                }),
              Q != null &&
                (0, S.jsx)(m, {
                  value: C,
                  onChange: w,
                  onSubmit: Kn,
                  canSubmit: Un,
                  disabled: Q === `control` && X,
                  submitLabel: Rn,
                  ...Bn,
                  ariaLabel: n(`com_ui_message_input`),
                  placeholder: Ln,
                  submitOnEnter: v,
                  resolveKeyVerdict: Gn,
                  maxLength: Q === `control` ? 4096 : void 0,
                  submitActions: In ? [] : Wn,
                  submitActionsLabel: n(`com_ui_during_run_actions`),
                  actions: In
                    ? Wn.filter((e) => e.key !== `steer`).map((e) =>
                        (0, S.jsx)(
                          g,
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
function et({ selection: e, task: t, title: n }) {
  let r = e.durable?.threadId ?? ``,
    {
      data: i,
      isLoading: a,
      isError: o,
      isReadinessPending: s,
    } = Te(e.parentConversationId, r, t.taskId),
    c = (0, x.useMemo)(
      () => (i == null ? { title: n, status: t.status, items: [], controls: [] } : ve(i, t.taskId)),
      [i, t.status, t.taskId, n],
    ),
    l = `ready`;
  return (
    o ? (l = `error`) : (a || s) && (l = `loading`),
    (0, S.jsx)(He, {
      activityId: `${e.parentMessageId}\u0000${e.toolCallId}\u0000${t.taskId}`,
      activity: c,
      state: l,
      showPrompt: !1,
      embedded: !0,
    })
  );
}
export { $e as default };
