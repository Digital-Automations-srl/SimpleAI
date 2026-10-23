import { rt as e } from './advanced-inputs.0gHsBjsU.js';
import { c as t, f as n, m as r, r as i, u as a } from './routing.CgoqFSAd.js';
import {
  Ba as o,
  Bn as s,
  Il as c,
  Ln as l,
  ds as u,
  eg as d,
  qh as f,
  sh as p,
  tg as m,
} from './hooks.CTs3gcEO.js';
import { a as h, i as g, n as _, r as v, t as y } from './forms.Br82YNia.js';
var b = e();
function x() {
  let { skillId: e } = n(),
    r = t(),
    a = u(),
    { user: o, roles: c } = s(),
    f = l({ permissionType: d.SKILLS, permission: m.USE }),
    h = l({ permissionType: d.SKILLS, permission: m.CREATE }),
    g = r.pathname.endsWith(`/new`),
    _ = r.pathname.endsWith(`/edit`);
  return o?.role == null || c?.[o.role] == null
    ? (0, b.jsx)(`div`, {
        className: `flex h-full w-full items-center justify-center bg-presentation`,
        children: (0, b.jsx)(p, {
          className: `text-text-secondary`,
          'aria-label': a(`com_ui_loading`),
        }),
      })
    : f
      ? g && !h
        ? (0, b.jsx)(i, { to: `/skills`, replace: !0 })
        : g
          ? (0, b.jsx)(S, {})
          : e
            ? _
              ? (0, b.jsx)(w, { skillId: e })
              : (0, b.jsx)(C, { skillId: e })
            : (0, b.jsxs)(`div`, {
                className: `flex h-full w-full flex-col bg-presentation`,
                children: [
                  (0, b.jsx)(T, {}),
                  (0, b.jsx)(`div`, {
                    className: `flex flex-1 flex-col items-center justify-center`,
                    children: (0, b.jsx)(v, {
                      title: a(`com_ui_skill_no_selection`),
                      description: a(`com_ui_skill_no_selection_desc`),
                    }),
                  }),
                ],
              })
      : (0, b.jsx)(i, { to: `/c/new`, replace: !0 });
}
function S() {
  return (0, b.jsxs)(`div`, {
    className: `flex h-full w-full flex-col overflow-y-auto bg-presentation`,
    children: [(0, b.jsx)(T, {}), (0, b.jsx)(_, {})],
  });
}
function C({ skillId: e }) {
  let t = u(),
    n = a(),
    [i] = r(),
    o = i.get(`file`),
    s = c(e, { enabled: !!e });
  return o
    ? (0, b.jsxs)(`div`, {
        className: `flex h-full w-full flex-col bg-presentation`,
        children: [
          (0, b.jsx)(T, {}),
          (0, b.jsx)(g, { skillId: e, relativePath: o, skill: s.data }, `${e}:${o}`),
        ],
      })
    : s.isLoading
      ? (0, b.jsx)(`div`, {
          className: `flex h-full w-full items-center justify-center bg-presentation`,
          children: (0, b.jsx)(p, {
            className: `text-text-secondary`,
            'aria-label': t(`com_ui_loading`),
          }),
        })
      : s.isError || !s.data
        ? (0, b.jsxs)(`div`, {
            className: `flex h-full w-full flex-col bg-presentation`,
            children: [
              (0, b.jsx)(T, {}),
              (0, b.jsx)(v, {
                variant: `error`,
                title: t(`com_ui_skill_not_found`),
                description: t(`com_ui_skill_not_found_description`),
              }),
            ],
          })
        : (0, b.jsxs)(`div`, {
            className: `flex h-full w-full flex-col bg-presentation`,
            children: [
              (0, b.jsx)(T, {}),
              (0, b.jsx)(h, {
                skill: s.data,
                onEdit: () => n(`/skills/${e}/edit`),
                onDelete: () => n(`/skills`, { replace: !0 }),
              }),
            ],
          });
}
function w({ skillId: e }) {
  return (0, b.jsxs)(`div`, {
    className: `flex h-full w-full flex-col overflow-y-auto bg-presentation`,
    children: [(0, b.jsx)(T, {}), (0, b.jsx)(y, { skillId: e })],
  });
}
function T() {
  return f(`(max-width: 768px)`)
    ? (0, b.jsx)(`div`, {
        className: `flex shrink-0 items-center px-4 pt-3`,
        children: (0, b.jsx)(o, {}),
      })
    : null;
}
export { x as default };
