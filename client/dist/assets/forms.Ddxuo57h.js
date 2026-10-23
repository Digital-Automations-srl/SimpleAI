import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import {
  $r as r,
  Bt as i,
  Fa as a,
  Fn as o,
  G as s,
  Gn as c,
  Gt as l,
  Ki as u,
  Pa as d,
  Rn as f,
  Ut as p,
  Yr as m,
  br as h,
  fn as g,
  it as _,
  kn as v,
  la as y,
  li as b,
  pi as x,
  pt as S,
  qt as C,
  xi as w,
  z as T,
} from './vendor.DMhDOqx5.js';
import { n as E, u as D } from './routing.CgoqFSAd.js';
import { r as O } from './query-devtools.DIz6FZCX.js';
import { h as k } from './tanstack-vendor.2R6Ja_-H.js';
import {
  $h as A,
  $s as j,
  Bn as M,
  C as N,
  C_ as ee,
  Dh as P,
  Dp as F,
  Hp as I,
  I_ as L,
  In as te,
  Ll as ne,
  Ln as re,
  Mm as ie,
  Nl as ae,
  Rl as oe,
  Sn as se,
  Wd as ce,
  Wp as le,
  Wu as R,
  Xh as z,
  Zp as ue,
  _h as de,
  ds as B,
  eg as fe,
  ig as V,
  k_ as H,
  l_ as pe,
  ng as me,
  nv as he,
  rg as U,
  rh as W,
  s_ as G,
  sh as ge,
  tg as K,
  tm as _e,
  tv as ve,
  uh as ye,
  vh as q,
  vm as J,
  w as be,
  wm as Y,
  wn as xe,
  x as X,
} from './hooks.CJk6e4LS.js';
import {
  _ as Se,
  f as Ce,
  i as we,
  l as Te,
  o as Ee,
  s as De,
  u as Oe,
} from './markdown-processing.CjMf2xPH.js';
import { c as ke } from './date-utils.C_DbPEjY.js';
import { a as Ae, i as je, n as Me, t as Z } from './forms.DQMwNapF.js';
function Ne(e) {
  return Array.isArray(e.pages);
}
function Pe(e, t) {
  e.setQueriesData([G.skills], (e) => {
    if (!e) return e;
    if (Ne(e)) {
      let n = e.pages.map((e) => ({ ...e, skills: e.skills.filter((e) => e._id !== t._id) }));
      return { ...e, pages: n.map((e, n) => (n === 0 ? { ...e, skills: [t, ...e.skills] } : e)) };
    }
    return { ...e, skills: [t, ...e.skills.filter((e) => e._id !== t._id)] };
  });
}
function Fe(e, t) {
  e.setQueriesData(
    [G.skills],
    (e) =>
      e &&
      (Ne(e)
        ? {
            ...e,
            pages: e.pages.map((e) => ({
              ...e,
              skills: e.skills.map((e) => (e._id === t._id ? t : e)),
            })),
          }
        : { ...e, skills: e.skills.map((e) => (e._id === t._id ? t : e)) }),
  );
}
function Ie(e, t) {
  e.setQueriesData(
    [G.skills],
    (e) =>
      e &&
      (Ne(e)
        ? {
            ...e,
            pages: e.pages.map((e) => ({ ...e, skills: e.skills.filter((e) => e._id !== t) })),
          }
        : { ...e, skills: e.skills.filter((e) => e._id !== t) }),
  );
}
var Le = (e) => {
    let t = O(),
      { onSuccess: n, ...r } = e ?? {};
    return k({
      mutationFn: (e) => H.createSkill(e),
      ...r,
      onSuccess: async (e, r, i) => {
        (await t.cancelQueries([G.skills]),
          t.setQueryData([G.skill, e._id], e),
          Pe(t, e),
          t.invalidateQueries([G.skills]),
          n && n(e, r, i));
      },
    });
  },
  Re = (e) => {
    let t = O(),
      { onError: n, onSuccess: r, ...i } = e ?? {};
    return k({
      mutationFn: (e) => H.importSkill(e),
      ...i,
      onSuccess: async (e, n, i) => {
        (await t.cancelQueries([G.skills]),
          t.setQueryData([G.skill, e._id], e),
          Pe(t, e),
          t.invalidateQueries([G.skills]),
          r && r(e, n, i));
      },
      onError: (e, r, i) => {
        let a = e?.response?.data;
        ((a?.error === `skill_import_incomplete` ||
          a?.error === `skill_import_rollback_failed` ||
          a?.error === `skill_import_cleanup_incomplete`) &&
          (t.removeQueries([G.skills], { type: `inactive` }), t.invalidateQueries([G.skills])),
          n && n(e, r, i));
      },
    });
  },
  ze = (e) => {
    let t = O(),
      { onMutate: n, onError: r, onSuccess: i, ...a } = e ?? {};
    return k({
      mutationFn: (e) => H.updateSkill(e),
      ...a,
      onMutate: async (e) => {
        (await t.cancelQueries([G.skill, e.id]), await t.cancelQueries([G.skills]));
        let r = t.getQueryData([G.skill, e.id]),
          i = t.getQueriesData([G.skills]);
        if (r) {
          let n = {
            ...r,
            ...e.payload,
            frontmatter: { ...(r.frontmatter ?? {}), ...(e.payload.frontmatter ?? {}) },
          };
          (t.setQueryData([G.skill, e.id], n), Fe(t, n));
        }
        return { previousSkill: r, previousListSnapshots: i, userContext: await n?.(e) };
      },
      onError: (e, n, i) => {
        if (
          (i?.previousSkill && t.setQueryData([G.skill, n.id], i.previousSkill),
          i?.previousListSnapshots)
        )
          for (let [e, n] of i.previousListSnapshots) t.setQueryData(e, n);
        r && r(e, n, i);
      },
      onSuccess: (e, n, r) => {
        (t.setQueryData([G.skill, e._id], e), Fe(t, e), i && i(e, n, r));
      },
    });
  },
  Be = (e) => {
    let t = O(),
      { onSuccess: n, ...r } = e ?? {};
    return k({
      mutationFn: ({ id: e }) => H.deleteSkill(e),
      ...r,
      onSuccess: (e, r, i) => {
        (t.removeQueries([G.skill, r.id]),
          t.removeQueries([G.skillFiles, r.id]),
          Ie(t, r.id),
          n && n(e, r, i));
      },
    });
  },
  Ve = (e) => {
    let t = O(),
      { onSuccess: n, ...r } = e ?? {};
    return k({
      mutationFn: ({ skillId: e, formData: t }) => H.uploadSkillFile(e, t),
      ...r,
      onSuccess: async (e, r, i) => {
        (await Promise.all([
          t.cancelQueries([G.skillFiles, r.skillId]),
          t.cancelQueries([G.skillFileContent, r.skillId, e.relativePath]),
        ]),
          t.setQueryData(
            [G.skillFiles, r.skillId],
            (t) => t && { files: [...t.files.filter((t) => t.relativePath !== e.relativePath), e] },
          ),
          t.invalidateQueries([G.skill, r.skillId]),
          n && n(e, r, i),
          t.invalidateQueries([G.skillFiles, r.skillId]),
          t.invalidateQueries([G.skillFileContent, r.skillId, e.relativePath]));
      },
    });
  },
  Q = e(t(), 1),
  $ = n();
function He({
  isOpen: e,
  setIsOpen: t,
  defaultName: n = ``,
  defaultDescription: r = ``,
  defaultBody: i = ``,
  onCreated: a,
}) {
  let o = B(),
    s = D(),
    { showToast: c } = z(),
    {
      register: l,
      handleSubmit: u,
      reset: d,
      formState: { isValid: f, isSubmitting: p, errors: m },
    } = je({ defaultValues: { name: n, description: r, body: i }, mode: `onChange` }),
    h = Le({
      onSuccess: (e) => {
        if ((c({ status: `success`, message: o(`com_ui_skill_created`) }), t(!1), d(), a)) {
          a(e);
          return;
        }
        s(`/skills/${e._id}`);
      },
      onError: (e) => {
        let t = e?.response,
          n = ({ field: e, code: t }) =>
            e === `name` && t === `REQUIRED`
              ? o(`com_ui_skill_name_required`)
              : e === `name` && t === `TOO_LONG`
                ? o(`com_ui_skill_name_too_long`, { 0: 64 })
                : e === `name` && t === `INVALID_FORMAT`
                  ? o(`com_ui_skill_name_invalid`)
                  : e === `name` && (t === `RESERVED_PREFIX` || t === `RESERVED_WORD`)
                    ? o(`com_ui_skill_name_reserved`)
                    : e === `description` && t === `REQUIRED`
                      ? o(`com_ui_skill_description_required`)
                      : e === `description` && t === `TOO_LONG`
                        ? o(`com_ui_skill_description_too_long`, { 0: U })
                        : e === `body` && t === `TOO_LONG`
                          ? o(`com_ui_skill_instructions_too_long`, { 0: me })
                          : o(`com_ui_skill_validation_error`),
          r = t?.data,
          i = r?.message || o(`com_ui_skill_create_error`);
        (t?.status === 409 && (i = o(`com_ui_skill_name_exists`)),
          r?.issues?.length && (i = r.issues.map(n).join(`; `)),
          c({ status: `error`, message: i }));
      },
    }),
    g = (e) => {
      h.isLoading ||
        h.mutate({ name: e.name.trim(), description: e.description.trim(), body: e.body });
    },
    _ = () => {
      (t(!1), d());
    },
    v = (e) => (e.stopPropagation(), u(g)(e)),
    y = !f || p || h.isLoading;
  return (0, $.jsx)(I, {
    open: e,
    onOpenChange: t,
    children: (0, $.jsx)(le, {
      className: `w-11/12 max-w-5xl overflow-hidden`,
      showCloseButton: !1,
      children: (0, $.jsxs)(`form`, {
        onSubmit: v,
        className: `flex max-h-[80vh] min-w-0 flex-col gap-3 overflow-hidden p-1 sm:gap-4 sm:p-2`,
        children: [
          (0, $.jsx)(`h2`, {
            className: `text-lg font-bold text-text-primary`,
            children: o(`com_ui_skill_write_instructions`),
          }),
          (0, $.jsxs)(`div`, {
            className: `flex flex-col gap-1.5`,
            children: [
              (0, $.jsx)(Y, {
                htmlFor: `create-skill-name`,
                className: `text-sm font-medium text-text-secondary`,
                children: o(`com_ui_name`),
              }),
              (0, $.jsx)(J, {
                id: `create-skill-name`,
                placeholder: o(`com_ui_skill_name_placeholder`),
                'aria-invalid': m.name ? `true` : `false`,
                autoComplete: `off`,
                className: `flex h-10 w-full rounded-xl border border-border-medium bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary disabled:cursor-not-allowed disabled:opacity-50`,
                ...l(`name`, {
                  required: o(`com_ui_skill_name_required`),
                  pattern: { value: V, message: o(`com_ui_skill_name_invalid`) },
                  maxLength: { value: 64, message: o(`com_ui_skill_name_too_long`, { 0: `64` }) },
                }),
              }),
              m.name &&
                (0, $.jsx)(`p`, {
                  className: `text-xs text-text-destructive`,
                  children: m.name.message,
                }),
            ],
          }),
          (0, $.jsxs)(`div`, {
            className: `flex flex-col gap-1.5`,
            children: [
              (0, $.jsx)(`label`, {
                htmlFor: `create-skill-description`,
                className: `text-sm font-medium text-text-secondary`,
                children: o(`com_ui_description`),
              }),
              (0, $.jsx)(q, {
                id: `create-skill-description`,
                minRows: 2,
                maxRows: 4,
                placeholder: o(`com_ui_skill_description_placeholder`),
                'aria-label': o(`com_ui_description`),
                'aria-invalid': m.description ? `true` : `false`,
                'aria-describedby': m.description ? `create-skill-description-error` : void 0,
                className: `w-full resize-none rounded-xl border border-border-medium bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary`,
                ...l(`description`, {
                  required: o(`com_ui_skill_description_required`),
                  maxLength: {
                    value: U,
                    message: o(`com_ui_skill_description_too_long`, { 0: String(U) }),
                  },
                }),
              }),
              m.description &&
                (0, $.jsx)(`p`, {
                  id: `create-skill-description-error`,
                  className: `mt-1 text-sm text-text-destructive`,
                  role: `alert`,
                  children: m.description.message,
                }),
            ],
          }),
          (0, $.jsxs)(`div`, {
            className: `flex flex-col gap-1.5`,
            children: [
              (0, $.jsx)(`label`, {
                htmlFor: `create-skill-body`,
                className: `text-sm font-medium text-text-secondary`,
                children: o(`com_ui_skill_instructions`),
              }),
              (0, $.jsx)(q, {
                id: `create-skill-body`,
                minRows: 6,
                maxRows: 12,
                placeholder: o(`com_ui_skill_instructions_placeholder`),
                'aria-label': o(`com_ui_skill_instructions`),
                className: `w-full resize-none rounded-xl border border-border-medium bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary`,
                ...l(`body`),
              }),
            ],
          }),
          (0, $.jsxs)(`div`, {
            className: `flex items-center justify-end gap-2 pt-2`,
            children: [
              (0, $.jsx)(F, {
                type: `button`,
                variant: `outline`,
                onClick: _,
                children: o(`com_ui_cancel`),
              }),
              (0, $.jsx)(F, {
                type: `submit`,
                variant: `submit`,
                disabled: y,
                'aria-busy': h.isLoading,
                className: R(y && `opacity-50`),
                children: o(h.isLoading ? `com_ui_creating` : `com_ui_create`),
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
function Ue({ skillId: e, skillName: t, disabled: n, onDelete: r }) {
  let i = B(),
    { showToast: a } = z(),
    o = Be({
      onSuccess: (e) => {
        let t = e.cleanupComplete !== !1;
        (a({
          status: t ? `success` : `error`,
          message: i(t ? `com_ui_skill_deleted` : `com_ui_skill_delete_partial`),
        }),
          r?.());
      },
      onError: () => {
        a({ status: `error`, message: i(`com_ui_skill_delete_error`) });
      },
    }),
    s = () => {
      o.isLoading || o.mutate({ id: e });
    },
    c = n || o.isLoading;
  return (0, $.jsxs)(I, {
    children: [
      (0, $.jsx)(ue, {
        asChild: !0,
        children: (0, $.jsx)(P, {
          description: i(`com_ui_delete`),
          side: `bottom`,
          render: (0, $.jsx)(F, {
            variant: `destructive`,
            size: `icon`,
            className: `size-9`,
            'aria-label': i(`com_ui_delete`),
            disabled: c,
            onClick: (e) => e.stopPropagation(),
            children: (0, $.jsx)(C, { className: `size-5`, 'aria-hidden': `true` }),
          }),
        }),
      }),
      (0, $.jsx)(ie, {
        showCloseButton: !1,
        title: i(`com_ui_delete`),
        className: `max-w-[450px]`,
        main: (0, $.jsx)(`p`, {
          className: `text-left text-sm text-text-primary`,
          children: i(`com_ui_skill_delete_confirm`, { 0: t }),
        }),
        selection: {
          selectHandler: s,
          selectClasses: `bg-surface-destructive hover:bg-surface-destructive-hover transition-colors duration-200 text-text-on-status`,
          selectText: i(`com_ui_delete`),
        },
      }),
    ],
  });
}
var We = (0, Q.memo)(Ue);
function Ge(e) {
  let t = e / ve;
  return Number.isInteger(t) ? `${t}` : t.toFixed(1);
}
var Ke = {
  invalid_path: `com_ui_skill_upload_reason_invalid_path`,
  file_too_large: `com_ui_skill_upload_reason_file_too_large`,
  archive_too_large: `com_ui_skill_upload_reason_archive_too_large`,
  archive_entry_changed: `com_ui_skill_upload_reason_archive_entry_changed`,
  persistence_failed: `com_ui_skill_upload_reason_persistence_failed`,
};
function qe(e) {
  let t = e?.response?.data;
  if (typeof t != `object` || !t) return null;
  let n = t;
  return (n.error !== `skill_import_incomplete` &&
    n.error !== `skill_import_rollback_failed` &&
    n.error !== `skill_import_cleanup_incomplete`) ||
    !Array.isArray(n.failedFiles)
    ? null
    : { code: n.error, files: n.failedFiles };
}
function Je(e) {
  return e === `skill_import_rollback_failed`
    ? `com_ui_skill_upload_rollback_failed`
    : e === `skill_import_cleanup_incomplete`
      ? `com_ui_skill_upload_cleanup_incomplete`
      : `com_ui_skill_upload_incomplete`;
}
function Ye(e) {
  return e === `skill_import_rollback_failed`
    ? `com_ui_skill_upload_rollback_failed_files`
    : e === `skill_import_cleanup_incomplete`
      ? `com_ui_skill_upload_cleanup_incomplete_files`
      : `com_ui_skill_upload_failed_files`;
}
function Xe({ isOpen: e, setIsOpen: t }) {
  let n = B(),
    r = D(),
    { showToast: i } = z(),
    a = (0, Q.useRef)(null),
    [o, s] = (0, Q.useState)(!1),
    [c, l] = (0, Q.useState)(null),
    u = (0, Q.useRef)(0),
    d = (0, Q.useRef)(0),
    { data: f = { configuredSizeLimitMb: void 0, fileConfig: L } } = ae({
      select: (e) => ({ configuredSizeLimitMb: e?.skills?.fileSizeLimit, fileConfig: he(e) }),
    }),
    { configuredSizeLimitMb: m, fileConfig: h } = f,
    g = h.skills?.fileSizeLimit ?? L.skills?.fileSizeLimit ?? 0,
    _ = m === void 0 ? Ge(g) : `${m}`,
    v = Re({
      onSuccess: (e) => {
        d.current === u.current &&
          (l(null),
          i({ status: `success`, message: n(`com_ui_skill_created`) }),
          t(!1),
          r(`/skills/${e._id}`));
      },
      onError: (e) => {
        if (d.current !== u.current) return;
        let t = qe(e);
        if (t != null) {
          (l(t), i({ status: `error`, message: n(Je(t.code), { 0: `${t.files.length}` }) }));
          return;
        }
        let r = e?.response?.data,
          a = r?.message ?? r?.error ?? n(`com_ui_create_skill_upload_error`);
        (l(null), i({ status: `error`, message: a }));
      },
    }),
    y = (0, Q.useCallback)(
      (e) => {
        if (v.isLoading) return;
        if ((l(null), e.size > g)) {
          i({ status: `error`, message: n(`com_ui_skill_upload_size_error`, { 0: _ }) });
          return;
        }
        let t = new FormData();
        (t.append(`file`, e, e.name), (d.current = u.current), v.mutate(t));
      },
      [_, v, n, i, g],
    ),
    b = (0, Q.useCallback)(
      (e) => {
        let t = e.target.files?.[0];
        (t && y(t), (e.target.value = ``));
      },
      [y],
    ),
    x = (0, Q.useCallback)(
      (e) => {
        (e.preventDefault(), s(!1));
        let t = e.dataTransfer.files?.[0];
        t && y(t);
      },
      [y],
    );
  return (0, $.jsx)(I, {
    open: e,
    onOpenChange: (e) => {
      (e || ((u.current += 1), l(null)), t(e));
    },
    children: (0, $.jsx)(le, {
      className: `w-11/12 max-w-lg overflow-hidden`,
      children: (0, $.jsxs)(`div`, {
        className: `flex flex-col gap-6 p-1 sm:p-2`,
        children: [
          (0, $.jsx)(`h2`, {
            className: `text-lg font-bold text-text-primary`,
            children: n(`com_ui_skill_upload_title`),
          }),
          (0, $.jsxs)(`div`, {
            className: `flex flex-col gap-3`,
            children: [
              (0, $.jsxs)(`button`, {
                type: `button`,
                onClick: () => a.current?.click(),
                onDragOver: (e) => {
                  (e.preventDefault(), s(!0));
                },
                onDragLeave: () => s(!1),
                onDrop: x,
                disabled: v.isLoading,
                className: R(
                  `flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-text-secondary transition-colors`,
                  o
                    ? `border-border-heavy bg-surface-hover`
                    : `border-border-medium hover:bg-surface-hover`,
                  v.isLoading && `cursor-wait opacity-50`,
                ),
                children: [
                  v.isLoading
                    ? (0, $.jsx)(ge, { className: `size-8` })
                    : (0, $.jsx)(p, {
                        className: `size-8 text-text-secondary`,
                        'aria-hidden': `true`,
                      }),
                  n(`com_ui_skill_upload_drag`),
                ],
              }),
              c != null &&
                c.files.length > 0 &&
                (0, $.jsxs)(`div`, {
                  role: `alert`,
                  className: `flex flex-col gap-1 rounded-lg border border-border-medium bg-surface-secondary p-3 text-xs`,
                  children: [
                    (0, $.jsx)(`p`, {
                      className: `font-medium text-text-destructive`,
                      children: n(Ye(c.code)),
                    }),
                    (0, $.jsx)(`ul`, {
                      className: `max-h-40 list-inside list-disc overflow-y-auto text-text-secondary`,
                      children: c.files.map((e) =>
                        (0, $.jsxs)(
                          `li`,
                          {
                            children: [
                              (0, $.jsx)(`span`, {
                                className: `break-all font-medium text-text-primary`,
                                children: e.path,
                              }),
                              Ke[e.reason] == null
                                ? ``
                                : ` — ${n(Ke[e.reason], { 0: `${e.limitMb ?? ``}` })}`,
                            ],
                          },
                          e.path,
                        ),
                      ),
                    }),
                  ],
                }),
              (0, $.jsx)(`div`, {
                className: `flex flex-col gap-3 text-xs text-text-secondary`,
                children: (0, $.jsxs)(`div`, {
                  children: [
                    (0, $.jsx)(`p`, {
                      className: `font-medium`,
                      children: n(`com_ui_skill_upload_requirements`),
                    }),
                    (0, $.jsxs)(`ul`, {
                      className: `mt-1 list-inside list-disc`,
                      children: [
                        (0, $.jsx)(`li`, { children: n(`com_ui_skill_upload_req_md`) }),
                        (0, $.jsx)(`li`, { children: n(`com_ui_skill_upload_req_zip`) }),
                        (0, $.jsx)(`li`, { children: n(`com_ui_skill_upload_req_size`, { 0: _ }) }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          (0, $.jsx)(`input`, {
            ref: a,
            type: `file`,
            accept: `.zip,.skill,.md`,
            className: `hidden`,
            onChange: b,
          }),
        ],
      }),
    }),
  });
}
var Ze = [
    { permission: K.USE, labelKey: `com_ui_skills_allow_use` },
    { permission: K.CREATE, labelKey: `com_ui_skills_allow_create` },
    { permission: K.SHARE, labelKey: `com_ui_skills_allow_share` },
    { permission: K.SHARE_PUBLIC, labelKey: `com_ui_skills_allow_share_public` },
  ],
  Qe = () => {
    let e = B(),
      { showToast: t } = z(),
      n = j({
        onSuccess: () => {
          t({ status: `success`, message: e(`com_ui_saved`) });
        },
        onError: () => {
          t({ status: `error`, message: e(`com_ui_error_save_admin_settings`) });
        },
      });
    return (0, $.jsx)(xe, {
      permissionType: fe.SKILLS,
      sectionKey: `com_ui_skills`,
      permissions: Ze,
      menuId: `skill-role-dropdown`,
      mutation: n,
    });
  };
function $e({ enabled: e, onChange: t }) {
  let n = B(),
    r = (0, Q.useId)(),
    i = (0, Q.useId)();
  return (0, $.jsx)(P, {
    description: n(`com_ui_skill_available_hint`),
    side: `top`,
    render: (0, $.jsxs)(`span`, {
      onClick: (e) => e.stopPropagation(),
      className: `inline-flex h-9 items-center gap-2 rounded-md px-2 transition-colors hover:bg-surface-hover`,
      children: [
        (0, $.jsx)(ye, { id: r, checked: e, onCheckedChange: () => t(), 'aria-labelledby': i }),
        (0, $.jsx)(Y, {
          id: i,
          htmlFor: r,
          className: `cursor-pointer select-none whitespace-nowrap text-xs font-medium text-text-secondary`,
          children: n(`com_ui_skill_available`),
        }),
      ],
    }),
  });
}
var et = (0, Q.memo)($e);
function tt({ skill: e, disabled: t }) {
  let n = B(),
    r = X(e),
    i = re({ permissionType: fe.SKILLS, permission: K.SHARE });
  return r.isLoading || !i || !r.canShare
    ? null
    : (0, $.jsx)(se, {
        resourceDbId: e._id,
        resourceName: e.name,
        resourceType: pe.SKILL,
        disabled: t,
        children: (0, $.jsx)(P, {
          description: n(`com_ui_share`),
          side: `bottom`,
          render: (0, $.jsx)(F, {
            variant: `outline`,
            size: `icon`,
            className: `size-9 border-border-medium`,
            'aria-label': n(`com_ui_share`),
            disabled: t,
            children: (0, $.jsx)(g, { className: `size-5`, 'aria-hidden': `true` }),
          }),
        }),
      });
}
var nt = (0, Q.memo)(tt);
function rt() {
  let e = B(),
    [t, n] = (0, Q.useState)(!1),
    [r, i] = (0, Q.useState)(!1),
    [o, s] = (0, Q.useState)(!1),
    c = e(`com_ui_create_skill`),
    l = (0, Q.useMemo)(
      () => [
        {
          label: e(`com_ui_skill_write_instructions`),
          onClick: () => i(!0),
          icon: (0, $.jsx)(f, { className: `icon-md`, 'aria-hidden': `true` }),
        },
        {
          label: e(`com_ui_skill_upload`),
          onClick: () => s(!0),
          icon: (0, $.jsx)(p, { className: `icon-md`, 'aria-hidden': `true` }),
        },
      ],
      [e],
    );
  return (0, $.jsxs)($.Fragment, {
    children: [
      (0, $.jsx)(_e, {
        gutter: 2,
        menuId: `create-skill-menu`,
        isOpen: t,
        setIsOpen: n,
        unmountOnHide: !0,
        trigger: (0, $.jsx)(P, {
          description: c,
          side: `bottom`,
          render: (0, $.jsx)(a, {
            'aria-label': c,
            className: `inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-light bg-transparent text-text-primary transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-text-primary`,
            children: (0, $.jsx)(v, { className: `size-4`, 'aria-hidden': `true` }),
          }),
        }),
        items: l,
      }),
      (0, $.jsx)(He, { isOpen: r, setIsOpen: i }),
      (0, $.jsx)(Xe, { isOpen: o, setIsOpen: s }),
    ],
  });
}
var it = [Te, Se, [Ce, { singleDollarTextMath: !1 }]],
  at = [[Oe], [we, { detect: !0, ignoreMissing: !0, subset: ce }]],
  ot = { code: te },
  st = /^[a-zA-Z][a-zA-Z\d+.-]*:/,
  ct = /^tel:/i;
function lt(e) {
  return (
    e.length > 0 && !e.startsWith(`/`) && !e.startsWith(`#`) && !e.startsWith(`?`) && !st.test(e)
  );
}
function ut(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}
function dt(e, t) {
  return [...e.split(`/`).slice(0, -1), ...ut(t).split(`/`)]
    .reduce((e, t) => (!t || t === `.` ? e : t === `..` ? (e.pop(), e) : (e.push(t), e)), [])
    .join(`/`);
}
function ft(e, t, n) {
  if (!lt(n)) return null;
  let r = n.search(/[?#]/),
    i = r === -1 ? n : n.slice(0, r),
    a = r === -1 ? `` : n.slice(r),
    o = dt(t, i);
  if (!o) return null;
  let s = `/skills/${encodeURIComponent(e)}?file=${encodeURIComponent(o)}`;
  return a.startsWith(`?`) ? `${s}&${a.slice(1)}` : `${s}${a}`;
}
function pt({ node: e, href: t, skillId: n, currentFilePath: r, children: i, ...a }) {
  let o = t ? ft(n, r, t) : null;
  return o
    ? (0, $.jsx)(E, { to: o, ...a, children: i })
    : (0, $.jsx)(`a`, { href: t, ...a, children: i });
}
function mt(e) {
  return ct.test(e) ? e : De(e);
}
function ht({ content: e, skillId: t, currentFilePath: n, className: r }) {
  let i = (0, Q.useMemo)(
    () => ({ ...ot, a: (e) => (0, $.jsx)(pt, { ...e, skillId: t, currentFilePath: n }) }),
    [t, n],
  );
  return (0, $.jsx)(Ee, {
    remarkPlugins: it,
    rehypePlugins: at,
    components: i,
    urlTransform: mt,
    className:
      r ??
      `markdown prose dark:prose-invert light w-full break-words leading-[1.65rem] text-text-primary`,
    children: e,
  });
}
var gt = (0, Q.memo)(ht);
function _t(e, t) {
  let n = e.trim();
  if (!n.startsWith(`---`)) return { fields: [], body: e };
  let r = n.slice(3),
    i = r.indexOf(`
---`);
  if (i === -1) return { fields: [], body: e };
  let a = r.slice(0, i),
    o = r.slice(i + 4).trim(),
    s = [],
    c = a.split(`
`);
  for (let e = 0; e < c.length; e++) {
    let n = c[e],
      r = n.indexOf(`:`);
    if (r === -1) continue;
    let i = n.slice(0, r).trim();
    if (!i) continue;
    let a = n.slice(r + 1).trim();
    if (!a) {
      let t = [];
      for (; e + 1 < c.length; ) {
        let n = c[e + 1].trim();
        if (!n.startsWith(`-`)) break;
        (t.push(n.slice(1).trim()), e++);
      }
      a = t.join(`,`);
    }
    t?.has(i.toLowerCase()) || (a && s.push({ key: i, value: a }));
  }
  return { fields: s, body: o };
}
new Set(Object.values(A));
var vt = [
  { mode: `rendered`, Icon: b, labelKey: `com_ui_skill_view_rendered` },
  { mode: `source`, Icon: w, labelKey: `com_ui_skill_view_source` },
];
function yt({ viewMode: e, setViewMode: t }) {
  let n = B();
  return (0, $.jsxs)(`div`, {
    role: `group`,
    'aria-label': `${n(`com_ui_skill_view_rendered`)} / ${n(`com_ui_skill_view_source`)}`,
    className: `relative inline-flex h-7 rounded-lg bg-surface-tertiary p-0.5 text-sm font-medium`,
    children: [
      (0, $.jsx)(`span`, {
        'aria-hidden': `true`,
        className: R(
          `absolute start-0.5 top-0.5 h-6 w-7 rounded-md bg-surface-primary shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none`,
          e === `source` && `translate-x-7 rtl:-translate-x-7`,
        ),
      }),
      vt.map(({ mode: r, Icon: i, labelKey: a }) =>
        (0, $.jsx)(
          `button`,
          {
            type: `button`,
            onClick: () => t(r),
            className: R(
              `relative flex w-7 items-center justify-center rounded-md transition-colors`,
              e === r ? `text-text-primary` : `text-text-secondary hover:text-text-primary`,
            ),
            'aria-label': n(a),
            'aria-pressed': e === r,
            children: (0, $.jsx)(i, { className: `size-4`, 'aria-hidden': `true` }),
          },
          r,
        ),
      ),
    ],
  });
}
var bt = new Set([`name`, `description`]);
function xt({ skill: e, onEdit: t, onDelete: n }) {
  let r = B(),
    { user: a } = M(),
    s = X(e),
    { isActive: c, toggle: l } = N(),
    [d, f] = (0, Q.useState)(`rendered`),
    p = c(e),
    m = e.isPublic === !0,
    h = e.author !== a?.id && e.authorName ? e.authorName : r(`com_ui_you`),
    g = e.updatedAt ? ke(new Date(e.updatedAt), `MMM d, yyyy`) : void 0,
    { fields: _, body: v } = (0, Q.useMemo)(() => _t(e.body ?? ``, bt), [e.body]);
  return (0, $.jsxs)(`article`, {
    className: `flex h-full min-w-0 flex-col gap-2 overflow-y-auto px-5 pb-5`,
    'aria-label': e.name,
    children: [
      (0, $.jsxs)(`div`, {
        className: `flex flex-col gap-3 pb-1 sm:flex-row sm:items-start sm:gap-4`,
        children: [
          (0, $.jsxs)(`div`, {
            className: `min-w-0 flex-1 overflow-hidden sm:pt-3`,
            children: [
              (0, $.jsxs)(`div`, {
                className: `flex min-w-0 items-center gap-2`,
                children: [
                  (0, $.jsx)(`h2`, {
                    className: `truncate text-xl font-bold text-text-primary`,
                    title: e.name,
                    children: e.name,
                  }),
                  m &&
                    (0, $.jsx)(P, {
                      description: r(`com_ui_skill_sr_public`),
                      side: `top`,
                      render: (0, $.jsx)(x, {
                        className: `size-5 shrink-0 text-accent-primary`,
                        'aria-label': r(`com_ui_skill_sr_public`),
                      }),
                    }),
                ],
              }),
              (0, $.jsxs)(`div`, {
                className: `mt-0.5 flex flex-wrap items-center gap-3 text-xs text-text-secondary`,
                children: [
                  (0, $.jsxs)(`span`, {
                    className: `flex items-center gap-1`,
                    children: [(0, $.jsx)(i, { className: `size-3`, 'aria-hidden': `true` }), h],
                  }),
                  g &&
                    (0, $.jsxs)(`span`, {
                      className: `flex items-center gap-1`,
                      children: [(0, $.jsx)(u, { className: `size-3`, 'aria-hidden': `true` }), g],
                    }),
                ],
              }),
            ],
          }),
          (0, $.jsxs)(`div`, {
            className: `flex shrink-0 flex-wrap items-center gap-2 sm:pt-1`,
            children: [
              (0, $.jsx)(et, { enabled: p, onChange: () => l(e) }),
              (0, $.jsx)(nt, { skill: e }),
              s.canEdit &&
                t &&
                (0, $.jsx)(P, {
                  description: r(`com_ui_edit`),
                  side: `bottom`,
                  render: (0, $.jsx)(F, {
                    variant: `outline`,
                    size: `icon`,
                    className: `size-9 border-border-medium`,
                    'aria-label': r(`com_ui_edit`),
                    onClick: t,
                    children: (0, $.jsx)(o, { className: `size-5`, 'aria-hidden': `true` }),
                  }),
                }),
              s.canDelete &&
                n &&
                (0, $.jsx)(We, { skillId: e._id, skillName: e.name, onDelete: n }),
            ],
          }),
        ],
      }),
      (0, $.jsxs)(`div`, {
        className: `flex flex-col gap-1`,
        children: [
          (0, $.jsx)(`h3`, {
            className: `text-xs leading-4 text-text-secondary`,
            children: r(`com_ui_description`),
          }),
          (0, $.jsx)(`p`, {
            className: `whitespace-pre-wrap text-sm text-text-secondary`,
            children: e.description,
          }),
        ],
      }),
      (0, $.jsxs)(`div`, {
        className: `flex items-center gap-3 py-1`,
        children: [
          (0, $.jsx)(`hr`, { className: `flex-1 border-border-medium` }),
          (0, $.jsx)(yt, { viewMode: d, setViewMode: f }),
        ],
      }),
      d === `rendered` &&
        _.length > 0 &&
        (0, $.jsx)(`div`, {
          className: `grid grid-cols-[max-content_1fr] items-baseline gap-x-8 gap-y-2 pb-2`,
          children: _.map(({ key: e, value: t }) =>
            (0, $.jsxs)(
              Q.Fragment,
              {
                children: [
                  (0, $.jsx)(`span`, { className: `text-xs text-text-secondary`, children: e }),
                  (0, $.jsx)(`span`, { className: `text-sm text-text-primary`, children: t }),
                ],
              },
              e,
            ),
          ),
        }),
      (0, $.jsx)(`div`, {
        className: `min-h-0 flex-1 overflow-auto`,
        children:
          d === `rendered`
            ? (0, $.jsx)(gt, { content: v, skillId: e._id, currentFilePath: `SKILL.md` })
            : (0, $.jsx)(`pre`, {
                className: `whitespace-pre-wrap font-mono text-sm leading-relaxed text-text-primary`,
                children: e.body ?? ``,
              }),
      }),
    ],
  });
}
function St({ skillId: e, relativePath: t, file: n, canEdit: r, onClose: i }) {
  let a = B(),
    { showToast: o } = z(),
    s = O(),
    [c, l] = (0, Q.useState)(n.content),
    [u, d] = (0, Q.useState)(!1),
    f = Ve({
      onSuccess: (r) => {
        (s.setQueryData([G.skillFileContent, e, t], {
          ...n,
          content: c,
          fileId: r.file_id,
          bytes: new Blob([c]).size,
          filename: r.filename,
          mimeType: r.mimeType,
          isBinary: !1,
        }),
          o({ status: `success`, message: a(`com_ui_edited_file`, { 0: n.filename }) }),
          i());
      },
      onError: (n) => {
        let r = n?.response?.status === 409;
        (d(r),
          r && s.invalidateQueries([G.skillFileContent, e, t]),
          o({
            status: `error`,
            message: a(r ? `com_ui_skill_file_conflict` : `com_ui_skill_file_save_error`),
          }));
      },
    }),
    p = () => {
      if (!r || !n.fileId || u || f.isLoading || c === n.content) return;
      let i = new FormData();
      (i.append(`relativePath`, t),
        i.append(`expectedFileId`, n.fileId),
        i.append(`file`, new File([c], n.filename, { type: n.mimeType })),
        f.mutate({ skillId: e, formData: i }));
    };
  return (0, $.jsxs)(`div`, {
    className: `flex h-full min-h-0 flex-col gap-3`,
    children: [
      (0, $.jsx)(de, {
        value: c,
        onChange: (e) => l(e.target.value),
        onKeyDown: (e) => {
          (e.ctrlKey || e.metaKey) && e.key === `s` && (e.preventDefault(), p());
        },
        disabled: f.isLoading,
        spellCheck: !1,
        'aria-label': `${a(`com_ui_edit`)} ${n.filename}`,
        className: `min-h-0 flex-1 resize-none font-mono text-sm text-text-primary`,
      }),
      f.isError &&
        (0, $.jsx)(`p`, {
          role: `alert`,
          className: `text-sm text-text-destructive`,
          children: a(u ? `com_ui_skill_file_conflict` : `com_ui_skill_file_save_error`),
        }),
      !r &&
        (0, $.jsx)(`p`, {
          role: `note`,
          className: `text-sm text-text-secondary`,
          children: a(`com_ui_skill_no_edit_permission`),
        }),
      (0, $.jsxs)(`div`, {
        className: `flex justify-end gap-2`,
        children: [
          (0, $.jsx)(F, {
            type: `button`,
            variant: `outline`,
            onClick: i,
            disabled: f.isLoading,
            children: a(`com_ui_cancel`),
          }),
          (0, $.jsx)(F, {
            type: `button`,
            onClick: p,
            disabled: !r || !n.fileId || u || f.isLoading || c === n.content,
            children: f.isLoading ? a(`com_ui_saving`) : a(`com_ui_save`),
          }),
        ],
      }),
    ],
  });
}
var Ct = new Set([`name`, `description`]);
function wt({ skillId: e, relativePath: t, skill: n }) {
  let i = D(),
    a = B(),
    { showToast: s } = z(),
    { data: c, isLoading: l, isError: u, isFetching: d, refetch: f } = ne(e, t),
    p = X(n),
    [h, g] = (0, Q.useState)(null),
    [v, b] = (0, Q.useState)(`rendered`),
    [x, C] = (0, Q.useState)(!1),
    w = (0, Q.useRef)(null),
    E = t.endsWith(`.md`),
    O = c?.mimeType?.startsWith(`image/`) ?? !1,
    k = t === `SKILL.md`,
    A = c != null && !c.isBinary && c.content != null,
    j = h != null,
    M = n?.source === `inline` && !p.isLoading && p.canEdit && c != null && (k || !!c.fileId),
    N = (0, Q.useMemo)(
      () => `${ee()}/api/skills/${e}/files/${encodeURIComponent(t)}?raw=true`,
      [e, t],
    ),
    I = (0, Q.useMemo)(
      () => (!E || !c?.content ? null : _t(c.content, k ? Ct : void 0)),
      [E, k, c?.content],
    ),
    L = (0, Q.useCallback)(async () => {
      if (!(x || !c?.content))
        try {
          (await navigator.clipboard.writeText(c.content),
            C(!0),
            s({ message: a(`com_ui_copied_to_clipboard`), status: `success` }),
            w.current && clearTimeout(w.current),
            (w.current = setTimeout(() => C(!1), 2e3)));
        } catch {
          s({ message: a(`com_ui_copy_failed`), status: `error` });
        }
    }, [c?.content, x, s, a]);
  return (0, $.jsxs)(`div`, {
    className: `flex h-full flex-col`,
    children: [
      (0, $.jsxs)(`div`, {
        className: `flex h-10 items-center gap-2 border-b border-border-medium px-4`,
        children: [
          (0, $.jsx)(`button`, {
            type: `button`,
            onClick: () => i(`/skills/${e}`),
            className: `rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary`,
            'aria-label': a(`com_ui_back`),
            children: (0, $.jsx)(y, { className: `size-4` }),
          }),
          (0, $.jsx)(m, {
            className: `size-4 shrink-0 text-text-secondary`,
            'aria-hidden': `true`,
          }),
          (0, $.jsx)(`span`, {
            className: `min-w-0 flex-1 truncate text-sm font-medium text-text-primary`,
            children: c?.filename ?? t,
          }),
          (0, $.jsxs)(`div`, {
            className: `flex shrink-0 items-center gap-1`,
            children: [
              M &&
                !j &&
                !l &&
                (k || A) &&
                (0, $.jsx)(P, {
                  description: a(`com_ui_edit`),
                  render: (0, $.jsx)(`button`, {
                    type: `button`,
                    onClick: () => {
                      k
                        ? i(`/skills/${e}/edit`)
                        : c?.content != null && g({ ...c, content: c.content });
                    },
                    className: `rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary`,
                    'aria-label': a(`com_ui_edit`),
                    children: (0, $.jsx)(o, { className: `size-4` }),
                  }),
                }),
              !j &&
                A &&
                (0, $.jsx)(P, {
                  description: a(x ? `com_ui_copied` : `com_ui_copy`),
                  render: (0, $.jsx)(`button`, {
                    type: `button`,
                    onClick: L,
                    className: `rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary`,
                    'aria-label': a(`com_ui_copy_to_clipboard`),
                    children: (0, $.jsx)(T, { icon: x ? S : _, className: `size-4` }),
                  }),
                }),
              !j && E && A && (0, $.jsx)(yt, { viewMode: v, setViewMode: b }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(`div`, {
        className: `min-h-0 flex-1 overflow-y-auto px-5 py-4`,
        children: h
          ? (0, $.jsx)(St, {
              skillId: e,
              relativePath: t,
              file: h,
              canEdit: M,
              onClose: () => g(null),
            })
          : (0, $.jsxs)($.Fragment, {
              children: [
                l &&
                  (0, $.jsx)(`div`, {
                    className: `flex items-center justify-center py-12`,
                    children: (0, $.jsx)(ge, { className: `size-6 text-text-secondary` }),
                  }),
                (u || c === null) &&
                  !c &&
                  (0, $.jsxs)(`div`, {
                    className: `flex flex-col items-center justify-center gap-2 py-12 text-text-secondary`,
                    children: [
                      (0, $.jsx)(r, { className: `size-8` }),
                      (0, $.jsx)(`p`, {
                        className: `text-sm`,
                        children: a(`com_ui_skill_file_load_error`),
                      }),
                      (0, $.jsx)(F, {
                        type: `button`,
                        variant: `outline`,
                        onClick: () => void f(),
                        disabled: d,
                        children: a(`com_ui_retry`),
                      }),
                    ],
                  }),
                c &&
                  !l &&
                  (0, $.jsxs)($.Fragment, {
                    children: [
                      c.isBinary &&
                        O &&
                        (0, $.jsx)(`img`, {
                          src: N,
                          alt: c.filename,
                          className: `max-h-[600px] max-w-full rounded-lg object-contain`,
                        }),
                      c.isBinary &&
                        !O &&
                        (0, $.jsxs)(`div`, {
                          className: `flex flex-col items-center justify-center gap-2 py-12 text-text-secondary`,
                          children: [
                            (0, $.jsx)(r, { className: `size-8` }),
                            (0, $.jsx)(`p`, {
                              className: `text-sm`,
                              children: a(`com_ui_skill_file_binary`),
                            }),
                            (0, $.jsx)(`a`, {
                              href: N,
                              download: !0,
                              className: `text-sm text-text-primary underline hover:no-underline`,
                              children: a(`com_ui_skill_file_download`),
                            }),
                          ],
                        }),
                      A &&
                        E &&
                        I &&
                        (0, $.jsxs)($.Fragment, {
                          children: [
                            v === `rendered` &&
                              I.fields.length > 0 &&
                              (0, $.jsx)(`div`, {
                                className: `mb-3 grid grid-cols-[max-content_1fr] items-baseline gap-x-8 gap-y-2`,
                                children: I.fields.map(({ key: e, value: t }) =>
                                  (0, $.jsxs)(
                                    Q.Fragment,
                                    {
                                      children: [
                                        (0, $.jsx)(`span`, {
                                          className: `text-xs capitalize text-text-secondary`,
                                          children: e,
                                        }),
                                        (0, $.jsx)(`span`, {
                                          className: `text-sm text-text-primary`,
                                          children: t,
                                        }),
                                      ],
                                    },
                                    e,
                                  ),
                                ),
                              }),
                            v === `rendered`
                              ? (0, $.jsx)(gt, { content: I.body, skillId: e, currentFilePath: t })
                              : (0, $.jsx)(`pre`, {
                                  className: `whitespace-pre-wrap font-mono text-sm leading-relaxed text-text-primary`,
                                  children: c.content,
                                }),
                          ],
                        }),
                      A &&
                        !E &&
                        (0, $.jsx)(`pre`, {
                          className: `whitespace-pre-wrap font-mono text-sm leading-relaxed text-text-primary`,
                          children: c.content,
                        }),
                      !c.isBinary &&
                        c.content == null &&
                        (0, $.jsxs)(`div`, {
                          className: `flex flex-col items-center justify-center gap-2 py-12 text-text-secondary`,
                          children: [
                            (0, $.jsx)(m, { className: `size-8` }),
                            (0, $.jsx)(`p`, {
                              className: `text-sm`,
                              children: a(`com_ui_skill_file_download`),
                            }),
                            (0, $.jsx)(`a`, {
                              href: N,
                              download: !0,
                              className: `text-sm text-text-primary underline hover:no-underline`,
                              children: a(`com_ui_skill_file_download`),
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
      }),
    ],
  });
}
var Tt = (0, Q.memo)(wt),
  Et = { empty: c, error: l },
  Dt = {
    empty: { icon: `text-text-primary`, wrap: `bg-surface-tertiary` },
    error: { icon: `text-status-warning`, wrap: `bg-status-warning-subtle` },
  };
function Ot({
  title: e,
  description: t,
  actionLabel: n,
  onAction: r,
  variant: i = `empty`,
  className: a = ``,
}) {
  let o = Et[i],
    s = Dt[i];
  return (0, $.jsx)(`div`, {
    className: R(`flex h-full w-full items-center justify-center px-6 py-12`, a),
    children: (0, $.jsxs)(`div`, {
      className: `flex max-w-sm flex-col items-center text-center`,
      children: [
        (0, $.jsx)(`div`, {
          className: R(`mb-4 flex size-12 items-center justify-center rounded-xl`, s.wrap),
          children: (0, $.jsx)(o, { className: R(`size-6`, s.icon), 'aria-hidden': `true` }),
        }),
        (0, $.jsx)(`p`, { className: `text-[15px] font-semibold text-text-primary`, children: e }),
        (0, $.jsx)(`p`, {
          className: `mt-1.5 text-sm leading-relaxed text-text-secondary`,
          children: t,
        }),
        n &&
          r &&
          (0, $.jsx)(F, {
            type: `button`,
            variant: `outline`,
            className: `mt-5`,
            'aria-label': n,
            onClick: r,
            children: n,
          }),
      ],
    }),
  });
}
var kt = ({ className: e = `` }) => {
    let t = B(),
      { control: n, watch: r, setValue: i } = Ae(),
      [o, s] = (0, Q.useState)(!1),
      { categories: c, emptyCategory: l } = be({ hasAccess: !0 }),
      u = r(`category`),
      f = (0, Q.useMemo)(() => (c ?? []).find((e) => e.value === u) ?? l, [c, u, l]),
      p = (0, Q.useMemo)(
        () =>
          c
            ? c.map((e) => ({
                id: e.value,
                label: e.label,
                icon: e.icon,
                onClick: () => {
                  (i(`category`, e.value || ``, { shouldDirty: !0 }), s(!1));
                },
              }))
            : [],
        [c, i],
      ),
      m = (0, $.jsxs)(a, {
        className: R(
          `relative inline-flex h-9 items-center justify-between rounded-xl border border-border-medium bg-transparent px-3 text-sm text-text-primary transition-all duration-200 ease-in-out hover:bg-surface-hover hover:text-text-primary focus:ring-2 focus:ring-ring-primary`,
          `gap-2 sm:w-fit`,
          e,
        ),
        onClick: () => s(!o),
        'aria-label': t(`com_ui_category`),
        children: [
          (0, $.jsxs)(`div`, {
            className: `flex items-center space-x-2`,
            children: [
              `icon` in f && f.icon != null && (0, $.jsx)(`span`, { children: f.icon }),
              (0, $.jsx)(`span`, { children: f.value ? f.label : t(`com_ui_category`) }),
            ],
          }),
          (0, $.jsx)(d, {}),
        ],
      });
    return (0, $.jsx)(Z, {
      name: `category`,
      control: n,
      render: () =>
        (0, $.jsx)(_e, {
          trigger: m,
          items: p,
          isOpen: o,
          setIsOpen: s,
          menuId: `skill-category-selector-menu`,
          className: `mt-2`,
          portal: !0,
        }),
    });
  },
  At = [Te, Se, [Ce, { singleDollarTextMath: !1 }]],
  jt = [[Oe], [we, { detect: !0, ignoreMissing: !0, subset: ce }]],
  Mt = { code: te },
  Nt = (0, Q.memo)(({ name: e, isEditing: t, setIsEditing: n, rules: r }) => {
    let i = B(),
      {
        control: a,
        formState: { errors: o },
      } = Ae();
    return (0, $.jsxs)(`div`, {
      className: `flex max-h-[85vh] flex-col sm:max-h-[85vh]`,
      children: [
        (0, $.jsx)(`h2`, { className: `sr-only`, children: i(`com_ui_skill_content`) }),
        (0, $.jsxs)(`div`, {
          className: R(
            `relative w-full flex-1 overflow-auto rounded-xl border border-border-medium p-3 text-left transition-all duration-200 sm:p-4`,
            t ? `` : `cursor-pointer hover:bg-surface-tertiary`,
          ),
          children: [
            (0, $.jsx)(`div`, {
              className: `absolute right-2 top-2 z-10`,
              children: (0, $.jsx)(P, {
                description: i(t ? `com_ui_save` : `com_ui_edit`),
                render: (0, $.jsx)(F, {
                  type: `button`,
                  size: `icon`,
                  variant: `ghost`,
                  onMouseDown: (e) => e.preventDefault(),
                  onClick: () => n((e) => !e),
                  'aria-label': i(t ? `com_ui_save` : `com_ui_edit`),
                  className: `size-8 p-0 hover:bg-surface-tertiary`,
                  children: (0, $.jsx)(T, {
                    icon: t ? S : s,
                    className: `size-4 text-text-secondary`,
                  }),
                }),
              }),
            }),
            !t &&
              (0, $.jsx)(`button`, {
                type: `button`,
                'aria-label': i(`com_ui_edit`),
                className: `absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary`,
                onClick: () => n(!0),
              }),
            (0, $.jsx)(Z, {
              name: e,
              control: a,
              rules: r,
              render: ({ field: e }) =>
                t
                  ? (0, $.jsx)(q, {
                      ...e,
                      autoFocus: !0,
                      className: `w-full resize-none overflow-y-auto bg-transparent font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary sm:text-base`,
                      minRows: 4,
                      maxRows: 16,
                      onKeyDown: (e) => {
                        e.key === `Escape` && (e.preventDefault(), n(!1));
                      },
                      placeholder: i(`com_ui_skill_content_placeholder`),
                      'aria-label': i(`com_ui_skill_content`),
                    })
                  : (0, $.jsxs)(`div`, {
                      className: `group/preview relative min-h-[6rem] overflow-y-auto text-sm sm:text-base`,
                      style: { maxHeight: `24rem` },
                      children: [
                        e.value
                          ? (0, $.jsx)(Ee, {
                              remarkPlugins: At,
                              rehypePlugins: jt,
                              components: Mt,
                              className: `markdown prose dark:prose-invert light w-full break-words text-text-primary`,
                              children: e.value,
                            })
                          : (0, $.jsx)(`p`, {
                              className: `italic text-text-secondary`,
                              children: i(`com_ui_click_to_edit`),
                            }),
                        (0, $.jsx)(`div`, {
                          className: `pointer-events-none sticky bottom-1/2 z-10 flex translate-y-1/2 items-center justify-center opacity-0 transition-all duration-200 group-hover/preview:opacity-100`,
                          children: (0, $.jsxs)(`div`, {
                            className: `flex items-center gap-2 rounded-lg border border-border-light bg-surface-primary px-3 py-1.5 shadow-md`,
                            children: [
                              (0, $.jsx)(T, { icon: s, className: `size-4 text-text-secondary` }),
                              (0, $.jsx)(`span`, {
                                className: `text-sm font-medium text-text-primary`,
                                children: i(`com_ui_click_to_edit`),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
            }),
            o[e] &&
              (0, $.jsx)(`p`, {
                className: `mt-1 text-sm text-text-destructive`,
                role: `alert`,
                children: o[e]?.message,
              }),
          ],
        }),
      ],
    });
  }),
  Pt = {
    name: ``,
    description: ``,
    body: `# Overview

Describe what this skill does and how it should be applied.

## When to use

- List concrete signals that should trigger this skill
- Add examples that make the trigger unambiguous

## How to apply

Walk through the steps the agent should take.
`,
    category: ``,
    invocationMode: A.auto,
  };
function Ft({ defaultValues: e, onCancel: t, onSuccess: n }) {
  let r = B(),
    i = D(),
    { showToast: a } = z(),
    [o, s] = (0, Q.useState)(!0),
    c = je({ defaultValues: { ...Pt, ...e }, mode: `onChange` }),
    {
      control: u,
      handleSubmit: d,
      setError: f,
      formState: { isSubmitting: p, isValid: m, errors: h },
    } = c,
    g = Le({
      onSuccess: (e) => {
        let t = e.warnings;
        (a({
          status: t && t.length > 0 ? `warning` : `success`,
          message: r(`com_ui_skill_created`),
        }),
          n ? n(e) : i(`/skills/${e._id}`));
      },
      onError: (e) => {
        let t = e?.response?.data?.message ?? r(`com_ui_skill_create_error`);
        a({ status: `error`, message: t });
      },
    }),
    _ = (e) => {
      if (g.isLoading) return;
      let t = {
        name: e.name.trim(),
        description: e.description.trim(),
        body: e.body,
        category: e.category || void 0,
      };
      if (!V.test(t.name)) {
        f(`name`, { message: r(`com_ui_skill_name_invalid`) });
        return;
      }
      g.mutate(t);
    },
    v = () => {
      t ? t() : i(-1);
    },
    y = !m || p || g.isLoading;
  return (0, $.jsx)(Me, {
    ...c,
    children: (0, $.jsxs)(`form`, {
      onSubmit: d(_),
      className: `w-full px-4 py-2`,
      'aria-label': r(`com_ui_skill_create_title`),
      children: [
        (0, $.jsx)(`h1`, { className: `sr-only`, children: r(`com_ui_skill_create_title`) }),
        (0, $.jsx)(`div`, {
          className: `mb-1 flex flex-col items-center justify-between font-bold sm:text-xl md:mb-0 md:text-2xl`,
          children: (0, $.jsxs)(`div`, {
            className: `flex w-full flex-col items-center justify-between sm:flex-row`,
            children: [
              (0, $.jsx)(Z, {
                name: `name`,
                control: u,
                rules: {
                  required: r(`com_ui_skill_name_required`),
                  pattern: { value: V, message: r(`com_ui_skill_name_invalid`) },
                  maxLength: { value: 64, message: r(`com_ui_skill_name_too_long`, { 0: `64` }) },
                },
                render: ({ field: e }) =>
                  (0, $.jsxs)(`div`, {
                    className: `relative mb-1 flex w-full flex-col sm:w-auto md:mb-0`,
                    children: [
                      (0, $.jsx)(J, {
                        ...e,
                        id: `skill-name`,
                        type: `text`,
                        className: `peer mr-2 w-full border border-border-medium p-2 text-2xl text-text-primary`,
                        placeholder: ` `,
                        tabIndex: 0,
                        'aria-label': r(`com_ui_name`),
                        'aria-required': `true`,
                        'aria-invalid': h.name ? `true` : `false`,
                        'aria-describedby': h.name ? `skill-name-error` : void 0,
                      }),
                      (0, $.jsxs)(Y, {
                        htmlFor: `skill-name`,
                        className: `pointer-events-none absolute -top-1 left-3 origin-[0] translate-y-3 scale-100 rounded bg-presentation px-1 text-base text-text-secondary transition-transform duration-200 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75`,
                        children: [r(`com_ui_name`), `*`],
                      }),
                      (0, $.jsx)(`div`, {
                        id: `skill-name-error`,
                        className: R(
                          `mt-1 w-56 text-sm text-text-destructive`,
                          h.name ? `visible h-auto` : `invisible h-0`,
                        ),
                        role: h.name ? `alert` : void 0,
                        children: h.name ? h.name.message : ` `,
                      }),
                    ],
                  }),
              }),
              (0, $.jsx)(`div`, {
                className: `flex items-center gap-2`,
                children: (0, $.jsx)(kt, {}),
              }),
            ],
          }),
        }),
        (0, $.jsxs)(`div`, {
          className: `flex w-full flex-col gap-4 md:mt-[1.075rem]`,
          children: [
            (0, $.jsx)(Z, {
              name: `description`,
              control: u,
              rules: {
                required: r(`com_ui_skill_description_required`),
                maxLength: {
                  value: U,
                  message: r(`com_ui_skill_description_too_long`, { 0: String(U) }),
                },
              },
              render: ({ field: e }) =>
                (0, $.jsxs)(`div`, {
                  className: `flex flex-col`,
                  children: [
                    (0, $.jsxs)(Y, {
                      htmlFor: `skill-description`,
                      className: `mb-1 text-sm font-medium text-text-secondary`,
                      children: [
                        r(`com_ui_description`),
                        (0, $.jsx)(`span`, {
                          className: `ml-0.5 text-text-destructive`,
                          children: `*`,
                        }),
                      ],
                    }),
                    (0, $.jsx)(q, {
                      ...e,
                      id: `skill-description`,
                      minRows: 2,
                      maxRows: 6,
                      placeholder: r(`com_ui_skill_description_placeholder`),
                      'aria-label': r(`com_ui_description`),
                      'aria-invalid': h.description ? `true` : `false`,
                      'aria-describedby': h.description ? `skill-description-error` : void 0,
                      className: `w-full resize-none rounded-xl border border-border-medium bg-transparent p-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary`,
                    }),
                    (0, $.jsx)(`p`, {
                      className: `mt-1 text-xs text-text-secondary`,
                      children: r(`com_ui_skill_description_field_hint`),
                    }),
                    h.description &&
                      (0, $.jsx)(`p`, {
                        id: `skill-description-error`,
                        className: `mt-1 text-sm text-text-destructive`,
                        role: `alert`,
                        children: h.description.message,
                      }),
                  ],
                }),
            }),
            (0, $.jsx)(Nt, { name: `body`, isEditing: o, setIsEditing: s }),
            g.error != null &&
              (0, $.jsxs)(`div`, {
                role: `alert`,
                className: `flex items-start gap-2 rounded-md border border-status-error-border bg-status-error-subtle p-3 text-sm text-text-destructive`,
                children: [
                  (0, $.jsx)(l, { className: `mt-0.5 size-4 shrink-0`, 'aria-hidden': `true` }),
                  (0, $.jsx)(`span`, { children: r(`com_ui_skill_create_error`) }),
                ],
              }),
            (0, $.jsxs)(`div`, {
              className: `mt-4 flex items-center justify-end gap-2`,
              children: [
                (0, $.jsx)(F, {
                  type: `button`,
                  variant: `outline`,
                  onClick: v,
                  children: r(`com_ui_cancel`),
                }),
                (0, $.jsx)(F, {
                  'aria-label': r(`com_ui_skill_create_title`),
                  type: `submit`,
                  disabled: y,
                  'aria-disabled': y || void 0,
                  className: R(`w-full sm:w-auto`, y && `opacity-50`),
                  children: r(`com_ui_skill_create_title`),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function It(e) {
  if (e)
    return {
      name: e.name,
      description: e.description,
      body: e.body ?? ``,
      category: e.category ?? ``,
      invocationMode: e.invocationMode ?? A.auto,
    };
}
function Lt({ skillId: e }) {
  let t = B(),
    n = D(),
    { showToast: r } = z(),
    [i, a] = (0, Q.useState)(null),
    o = oe(e),
    s = o.data,
    c = X(s),
    u = (0, Q.useMemo)(() => It(s), [s]),
    [d, f] = (0, Q.useState)(!1),
    p = je({
      defaultValues: { name: ``, description: ``, body: ``, category: ``, invocationMode: A.auto },
      values: u,
      mode: `onChange`,
    }),
    {
      control: m,
      handleSubmit: g,
      reset: _,
      setError: v,
      formState: { isDirty: y, isValid: b, isSubmitting: x, errors: S },
    } = p;
  (0, Q.useEffect)(() => {
    a(null);
  }, [e]);
  let C = ze({
      onSuccess: (e) => {
        (r({
          status: e.warnings && e.warnings.length > 0 ? `warning` : `success`,
          message: t(`com_ui_skill_updated`),
        }),
          a(e.warnings ?? null),
          _(It(e)));
      },
      onError: (e) => {
        if (e?.response?.status === 409) {
          (r({ status: `warning`, message: t(`com_ui_skill_update_conflict`) }), o.refetch());
          return;
        }
        let n = e?.response?.data?.message ?? t(`com_ui_skill_update_error`);
        r({ status: `error`, message: n });
      },
    }),
    w = (e) => {
      if (!s || C.isLoading) return;
      let n = e.name.trim();
      if (!V.test(n)) {
        v(`name`, { message: t(`com_ui_skill_name_invalid`) });
        return;
      }
      let r = {
        name: n,
        description: e.description.trim(),
        body: e.body,
        category: e.category || void 0,
      };
      C.mutate({ id: s._id, expectedVersion: s.version, payload: r });
    };
  if (o.isLoading || c.isLoading)
    return (0, $.jsxs)(`div`, {
      className: `w-full px-4 py-2`,
      children: [
        (0, $.jsx)(W, { className: `mb-3 h-10 w-72` }),
        (0, $.jsx)(W, { className: `mb-3 h-20 w-full` }),
        (0, $.jsx)(W, { className: `h-64 w-full` }),
      ],
    });
  if (o.isError || !s)
    return (0, $.jsxs)(`div`, {
      className: `w-full px-4 py-6 text-sm text-text-secondary`,
      children: [
        (0, $.jsx)(`p`, {
          className: `font-medium text-text-primary`,
          children: t(`com_ui_skill_not_found`),
        }),
        (0, $.jsx)(`p`, { children: t(`com_ui_skill_not_found_description`) }),
      ],
    });
  let T = !c.canEdit,
    E = !y || !b || x || C.isLoading;
  return (0, $.jsx)(Me, {
    ...p,
    children: (0, $.jsxs)(`form`, {
      onSubmit: g(w),
      className: `w-full px-4 py-2`,
      'aria-label': t(`com_ui_skill_edit_title`),
      children: [
        (0, $.jsx)(`h1`, { className: `sr-only`, children: t(`com_ui_skill_edit_title`) }),
        (0, $.jsx)(`div`, {
          className: `mb-1 flex flex-col items-center justify-between font-bold sm:text-xl md:mb-0 md:text-2xl`,
          children: (0, $.jsxs)(`div`, {
            className: `flex w-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center`,
            children: [
              (0, $.jsx)(Z, {
                name: `name`,
                control: m,
                rules: {
                  required: t(`com_ui_skill_name_required`),
                  pattern: { value: V, message: t(`com_ui_skill_name_invalid`) },
                  maxLength: { value: 64, message: t(`com_ui_skill_name_too_long`, { 0: `64` }) },
                },
                render: ({ field: e }) =>
                  (0, $.jsxs)(`div`, {
                    className: `relative mb-1 flex w-full flex-col sm:w-auto md:mb-0`,
                    children: [
                      (0, $.jsx)(J, {
                        ...e,
                        id: `skill-name`,
                        type: `text`,
                        readOnly: T,
                        className: `peer mr-2 w-full border border-border-medium p-2 text-2xl text-text-primary`,
                        placeholder: ` `,
                        tabIndex: 0,
                        'aria-label': t(`com_ui_name`),
                        'aria-required': `true`,
                        'aria-invalid': S.name ? `true` : `false`,
                        'aria-describedby': S.name ? `skill-name-error` : void 0,
                      }),
                      (0, $.jsxs)(`label`, {
                        htmlFor: `skill-name`,
                        className: `pointer-events-none absolute -top-1 left-3 origin-[0] translate-y-3 scale-100 rounded bg-presentation px-1 text-base text-text-secondary transition-transform duration-200 peer-placeholder-shown:translate-y-3 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:scale-75`,
                        children: [t(`com_ui_name`), `*`],
                      }),
                      (0, $.jsx)(`div`, {
                        id: `skill-name-error`,
                        className: R(
                          `mt-1 w-56 text-sm text-text-destructive`,
                          S.name ? `visible h-auto` : `invisible h-0`,
                        ),
                        role: S.name ? `alert` : void 0,
                        children: S.name ? S.name.message : ` `,
                      }),
                    ],
                  }),
              }),
              (0, $.jsxs)(`div`, {
                className: `flex shrink-0 items-center gap-2`,
                children: [
                  (0, $.jsx)(kt, {}),
                  (0, $.jsx)(nt, { skill: s }),
                  c.canDelete &&
                    (0, $.jsx)(We, {
                      skillId: s._id,
                      skillName: s.name,
                      onDelete: () => n(`/skills`, { replace: !0 }),
                    }),
                ],
              }),
            ],
          }),
        }),
        (0, $.jsxs)(`div`, {
          className: `mt-1 flex items-center gap-2 text-xs text-text-secondary`,
          children: [
            (0, $.jsx)(`span`, { children: t(`com_ui_skill_version`, { 0: String(s.version) }) }),
            (0, $.jsx)(`span`, { 'aria-hidden': `true`, children: `·` }),
            (0, $.jsx)(`span`, { children: s.authorName }),
          ],
        }),
        T &&
          (0, $.jsxs)(`div`, {
            role: `note`,
            className: `mt-4 flex items-start gap-2 rounded-md border border-status-warning-border bg-status-warning-subtle p-3 text-sm text-status-warning`,
            children: [
              (0, $.jsx)(h, { className: `mt-0.5 size-4 shrink-0`, 'aria-hidden': `true` }),
              (0, $.jsx)(`span`, { children: t(`com_ui_skill_no_edit_permission`) }),
            ],
          }),
        i &&
          i.length > 0 &&
          (0, $.jsxs)(`div`, {
            role: `alert`,
            className: `mt-4 flex flex-col gap-1 rounded-md border border-status-warning-border bg-status-warning-subtle p-3 text-sm text-status-warning`,
            children: [
              (0, $.jsxs)(`div`, {
                className: `flex items-center gap-2 font-semibold`,
                children: [
                  (0, $.jsx)(l, { className: `size-4`, 'aria-hidden': `true` }),
                  t(`com_ui_skill_warnings`),
                ],
              }),
              (0, $.jsx)(`ul`, {
                className: `ml-6 list-disc`,
                children: i.map((e) =>
                  (0, $.jsx)(`li`, { children: e.message }, `${e.field}:${e.code}`),
                ),
              }),
            ],
          }),
        (0, $.jsxs)(`div`, {
          className: `mt-4 flex w-full flex-col gap-4`,
          children: [
            (0, $.jsx)(Z, {
              name: `description`,
              control: m,
              rules: {
                required: t(`com_ui_skill_description_required`),
                maxLength: {
                  value: U,
                  message: t(`com_ui_skill_description_too_long`, { 0: String(U) }),
                },
              },
              render: ({ field: e }) =>
                (0, $.jsxs)(`div`, {
                  className: `flex flex-col`,
                  children: [
                    (0, $.jsxs)(Y, {
                      htmlFor: `skill-description`,
                      className: `mb-1 text-sm font-medium text-text-secondary`,
                      children: [
                        t(`com_ui_description`),
                        (0, $.jsx)(`span`, {
                          className: `ml-0.5 text-text-destructive`,
                          children: `*`,
                        }),
                      ],
                    }),
                    (0, $.jsx)(q, {
                      ...e,
                      id: `skill-description`,
                      readOnly: T,
                      minRows: 2,
                      maxRows: 6,
                      'aria-label': t(`com_ui_description`),
                      'aria-invalid': S.description ? `true` : `false`,
                      'aria-describedby': S.description ? `skill-description-error` : void 0,
                      className: `w-full resize-none rounded-xl border border-border-medium bg-transparent p-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-primary`,
                    }),
                    (0, $.jsx)(`p`, {
                      className: `mt-1 text-xs text-text-secondary`,
                      children: t(`com_ui_skill_description_field_hint`),
                    }),
                    S.description &&
                      (0, $.jsx)(`p`, {
                        id: `skill-description-error`,
                        className: `mt-1 text-sm text-text-destructive`,
                        role: `alert`,
                        children: S.description.message,
                      }),
                  ],
                }),
            }),
            (0, $.jsx)(Nt, { name: `body`, isEditing: d, setIsEditing: f }),
            !T &&
              (0, $.jsxs)(`div`, {
                className: `mt-4 flex items-center justify-end gap-2`,
                children: [
                  (0, $.jsx)(F, {
                    type: `button`,
                    variant: `outline`,
                    onClick: () => _(u),
                    disabled: !y,
                    className: R(!y && `opacity-50`),
                    children: t(`com_ui_reset`),
                  }),
                  (0, $.jsx)(F, {
                    type: `submit`,
                    disabled: E,
                    'aria-disabled': E || void 0,
                    className: R(`w-full sm:w-auto`, E && `opacity-50`),
                    children: t(`com_ui_save`),
                  }),
                ],
              }),
          ],
        }),
      ],
    }),
  });
}
export { xt as a, He as c, Tt as i, Ft as n, rt as o, Ot as r, Qe as s, Lt as t };
