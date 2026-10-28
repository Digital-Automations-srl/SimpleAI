import { a as e } from './rolldown-runtime.B0Z9INg1.js';
import { at as t, rt as n } from './advanced-inputs.0gHsBjsU.js';
import { Jr as r } from './vendor.BQmuAj0u.js';
import { h as i, p as a } from './validation.Bd3jvxDI.js';
import {
  $h as o,
  Ap as s,
  Dm as c,
  Fs as l,
  Gp as u,
  Gt as d,
  Is as f,
  Qp as p,
  T_ as m,
  Ug as h,
  X_ as g,
  Xn as _,
  Xp as v,
  Yg as y,
  Yp as b,
  Z_ as x,
  ap as S,
  ds as C,
  em as w,
  nm as ee,
  qm as T,
  qp as E,
  qu as D,
  rp as O,
  uh as k,
  xm as A,
} from './hooks.DHfa_SP2.js';
import { a as j, i as M, n as N, t as P } from './forms.DQMwNapF.js';
function F(e) {
  try {
    JSON.parse(e);
  } catch {
    return !1;
  }
  return !0;
}
function I(e) {
  try {
    return JSON.stringify(JSON.parse(e), null, 2);
  } catch {
    return e;
  }
}
function L(e) {
  let t = 0,
    n = -1,
    r = !1,
    i = !1;
  for (let a = 0; a < e.length; a++) {
    if (r) {
      i ? (i = !1) : e[a] === `\\` ? (i = !0) : e[a] === `"` && (r = !1);
      continue;
    }
    if (e[a] === `"` && t > 0) r = !0;
    else if (e[a] === `{`) (t === 0 && (n = a), t++);
    else if (e[a] === `}` && t > 0 && (t--, t === 0 && n !== -1)) return e.slice(n, a + 1);
  }
  return ``;
}
function R(e) {
  function t(e, t) {
    return F(t) ? JSON.parse(t)[e] : ``;
  }
  function n(t, n, r) {
    let i = {};
    (F(r) && (i = JSON.parse(r)), (i[t] = n), e(JSON.stringify(i)));
  }
  return { getMultiKey: t, setMultiKey: n };
}
var z = (e) =>
    e
      ? !!e.userProvide ||
        !!e.userProvideAccessKeyId ||
        !!e.userProvideSecretAccessKey ||
        !!e.userProvideSessionToken ||
        !!e.userProvideBearerToken
      : !1,
  B = ({ endpointsConfig: e, modelSpecs: t, hasAgentAccess: n }) => {
    let r = Object.keys(e),
      i = t?.list ?? [];
    if (i.length === 0) return new Set(r);
    let a = new Set();
    for (let e of i) {
      let t = e.preset?.endpoint;
      t && a.add(t);
    }
    for (let e of t?.addedEndpoints ?? []) a.add(e);
    if (!n || !a.has(y.agents)) return a;
    let o = e[y.agents]?.allowedProviders ?? [];
    if (o.length > 0) {
      for (let e of o) a.add(e);
      return a;
    }
    for (let e of r) !g(e) && !x(e) && a.add(e);
    return a;
  },
  V = ({ endpointsConfig: e, modelSpecs: t, hasAgentAccess: n }) => {
    if (!e) return [];
    let r = B({ endpointsConfig: e, modelSpecs: t, hasAgentAccess: n }),
      i = [];
    for (let [t, n] of Object.entries(e)) r.has(t) && z(n) && i.push(t);
    return i;
  },
  H = e(t(), 1);
function U(e, t, n) {
  let r = new Date(t).toLocaleString(void 0, { hour12: n }),
    i = e(`com_endpoint_config_key_encryption`, { 0: r });
  return i.includes(r) ? i : `${i} ${r}`;
}
var W = n(),
  G = (0, H.forwardRef)((e, t) => {
    let {
        id: n,
        value: r,
        label: i,
        secret: a = !1,
        subLabel: o,
        onChange: s,
        labelClassName: l = ``,
        inputClassName: u = ``,
      } = e,
      d = C();
    return (0, W.jsxs)(W.Fragment, {
      children: [
        (0, W.jsxs)(`div`, {
          className: D(`mt-4 flex flex-row`, l),
          children: [
            (0, W.jsx)(c, { htmlFor: n, className: `text-left text-sm font-medium`, children: i }),
            o &&
              (0, W.jsx)(c, {
                className: `mx-1 text-right text-sm text-text-secondary`,
                children: o,
              }),
            (0, W.jsx)(`br`, {}),
          ],
        }),
        (0, W.jsx)(`div`, { className: `h-1` }),
        a
          ? (0, W.jsx)(T, {
              id: n,
              'data-testid': `input-${n}`,
              value: r ?? ``,
              onChange: s,
              ref: t,
              autoComplete: `new-password`,
              'data-lpignore': `true`,
              'data-1p-ignore': `true`,
              controlsOnHover: !0,
              placeholder: `${d(`com_endpoint_config_value`)} ${i}`,
              className: D(`flex h-10 max-h-10 w-full resize-none px-3 py-2`, u),
            })
          : (0, W.jsx)(A, {
              id: n,
              'data-testid': `input-${n}`,
              value: r ?? ``,
              onChange: s,
              ref: t,
              placeholder: `${d(`com_endpoint_config_value`)} ${i}`,
              className: D(`flex h-10 max-h-10 w-full resize-none px-3 py-2`, u),
            }),
      ],
    });
  }),
  K = ({ endpoint: e, userProvideURL: t }) => {
    let { control: n } = j();
    return (0, W.jsxs)(`form`, {
      className: `flex-wrap`,
      children: [
        (0, W.jsx)(P, {
          name: `apiKey`,
          control: n,
          render: ({ field: t }) =>
            (0, W.jsx)(G, {
              id: `apiKey`,
              ...t,
              label: `${e} API Key`,
              labelClassName: `mb-1`,
              inputClassName: `mb-2`,
              secret: !0,
            }),
        }),
        t &&
          (0, W.jsx)(P, {
            name: `baseURL`,
            control: n,
            render: ({ field: t }) =>
              (0, W.jsx)(G, { id: `baseURL`, ...t, label: `${e} API URL`, labelClassName: `mb-1` }),
          }),
      ],
    });
  },
  q = ({
    userProvideAccessKeyId: e,
    userProvideSecretAccessKey: t,
    userProvideSessionToken: n,
    userProvideBearerToken: r,
  }) => {
    let { control: i } = j(),
      a = C();
    return (0, W.jsx)(`form`, {
      className: `flex-wrap`,
      children: (() => {
        let o = [];
        return (
          e &&
            o.push(
              (0, W.jsx)(
                P,
                {
                  name: `bedrockAccessKeyId`,
                  control: i,
                  render: ({ field: e }) =>
                    (0, W.jsx)(G, {
                      id: `bedrockAccessKeyId`,
                      ...e,
                      label: a(`com_endpoint_config_bedrock_access_key_id`),
                      labelClassName: `mb-1`,
                      inputClassName: `mb-2`,
                    }),
                },
                `bedrockAccessKeyId`,
              ),
            ),
          t &&
            (o.length > 0 && o.push((0, W.jsx)(`div`, { className: `mt-3` }, `spacer1`)),
            o.push(
              (0, W.jsx)(
                P,
                {
                  name: `bedrockSecretAccessKey`,
                  control: i,
                  render: ({ field: e }) =>
                    (0, W.jsx)(G, {
                      id: `bedrockSecretAccessKey`,
                      ...e,
                      label: a(`com_endpoint_config_bedrock_secret_access_key`),
                      labelClassName: `mb-1`,
                      inputClassName: `mb-2`,
                    }),
                },
                `bedrockSecretAccessKey`,
              ),
            )),
          n &&
            (o.length > 0 && o.push((0, W.jsx)(`div`, { className: `mt-3` }, `spacer2`)),
            o.push(
              (0, W.jsx)(
                P,
                {
                  name: `bedrockSessionToken`,
                  control: i,
                  render: ({ field: e }) =>
                    (0, W.jsx)(G, {
                      id: `bedrockSessionToken`,
                      ...e,
                      label: a(`com_endpoint_config_bedrock_session_token`),
                      labelClassName: `mb-1`,
                      inputClassName: `mb-2`,
                    }),
                },
                `bedrockSessionToken`,
              ),
            )),
          r &&
            (o.length > 0 && o.push((0, W.jsx)(`div`, { className: `mt-3` }, `spacer3`)),
            o.push(
              (0, W.jsx)(
                P,
                {
                  name: `bedrockBearerToken`,
                  control: i,
                  render: ({ field: e }) =>
                    (0, W.jsx)(G, {
                      id: `bedrockBearerToken`,
                      ...e,
                      label: a(`com_endpoint_config_bedrock_bearer_token`),
                      labelClassName: `mb-1`,
                      inputClassName: `mb-2`,
                    }),
                },
                `bedrockBearerToken`,
              ),
            )),
          (0, W.jsx)(W.Fragment, { children: o })
        );
      })(),
    });
  },
  J = ({
    onFileSelected: e,
    className: t = ``,
    containerClassName: n = ``,
    successText: i = null,
    invalidText: a = null,
    validator: o = null,
    text: c = null,
    id: l = `1`,
  }) => {
    let [u, d] = (0, H.useState)(`text-text-secondary`),
      [f, p] = (0, H.useState)(null),
      m = C(),
      h = (t) => {
        let n = t.target.files?.[0];
        if (!n) return;
        let r = new FileReader();
        ((r.onload = (t) => {
          let n = JSON.parse(t.target?.result);
          if (o && !o(n)) {
            (p(`invalid`), d(`text-text-destructive`));
            return;
          }
          (o && (p(`success`), d(`text-status-success`)), e(n));
        }),
          r.readAsText(n));
      },
      g;
    return (
      (g = f
        ? f === `success`
          ? (i ?? m(`com_ui_upload_success`))
          : (a ?? m(`com_ui_upload_invalid`))
        : (c ?? m(`com_ui_import`))),
      (0, W.jsxs)(W.Fragment, {
        children: [
          (0, W.jsxs)(s, {
            type: `button`,
            variant: `ghost`,
            size: `sm`,
            onClick: () => {
              let e = document.getElementById(`file-upload-${l}`);
              e && e.click();
            },
            className: D(
              `mr-1 flex h-auto cursor-pointer items-center rounded bg-transparent px-2 py-1 text-xs font-normal text-text-secondary transition-colors hover:bg-surface-hover hover:text-status-success focus:ring-text-primary`,
              u,
              n,
            ),
            'aria-label': g,
            children: [
              (0, W.jsx)(r, {
                className: `mr-1 flex w-[22px] items-center stroke-1`,
                'aria-hidden': `true`,
              }),
              (0, W.jsx)(`span`, { className: `flex text-xs`, children: g }),
            ],
          }),
          (0, W.jsx)(`input`, {
            id: `file-upload-${l}`,
            value: ``,
            type: `file`,
            className: D(`hidden`, t),
            accept: `.json`,
            onChange: h,
            tabIndex: -1,
          }),
        ],
      })
    );
  },
  Y = a({ client_email: i().email().min(3), project_id: i().min(3), private_key: i().min(601) }),
  te = (e) => Y.safeParse(e).success,
  ne = ({ userKey: e, setUserKey: t }) => {
    let n = C(),
      { getMultiKey: r, setMultiKey: i } = R(t);
    return (0, W.jsxs)(W.Fragment, {
      children: [
        (0, W.jsxs)(`div`, {
          className: `flex flex-row`,
          children: [
            (0, W.jsx)(c, {
              htmlFor: h.GOOGLE_SERVICE_KEY,
              className: `text-left text-sm font-medium`,
              children: n(`com_endpoint_config_google_service_key`),
            }),
            (0, W.jsx)(c, {
              className: `mx-1 text-right text-sm text-text-secondary`,
              children: n(`com_endpoint_config_google_cloud_platform`),
            }),
            (0, W.jsx)(`br`, {}),
          ],
        }),
        (0, W.jsx)(J, {
          id: h.GOOGLE_SERVICE_KEY,
          className: `w-full`,
          containerClassName: `bg-surface-secondary h-10 max-h-10 w-full resize-none py-2`,
          text: n(`com_endpoint_config_key_import_json_key`),
          successText: n(`com_endpoint_config_key_import_json_key_success`),
          invalidText: n(`com_endpoint_config_key_import_json_key_invalid`),
          validator: te,
          onFileSelected: (t) => {
            i(h.GOOGLE_SERVICE_KEY, JSON.stringify(t), e);
          },
        }),
        (0, W.jsx)(G, {
          id: h.GOOGLE_API_KEY,
          value: r(h.GOOGLE_API_KEY, e) ?? ``,
          onChange: (t) => i(h.GOOGLE_API_KEY, t.target.value ?? ``, e),
          label: n(`com_endpoint_config_google_api_key`),
          subLabel: n(`com_endpoint_config_google_gemini_api`),
          secret: !0,
        }),
      ],
    });
  },
  X = ({ endpoint: e, userProvideURL: t }) => {
    let { control: n } = j(),
      r = e === y.azureOpenAI;
    return (0, W.jsxs)(`form`, {
      className: `flex-wrap`,
      children: [
        !r &&
          (0, W.jsx)(P, {
            name: `apiKey`,
            control: n,
            render: ({ field: e }) =>
              (0, W.jsx)(G, {
                id: `apiKey`,
                ...e,
                label: `${r ? `Azure q` : ``}OpenAI API Key`,
                labelClassName: `mb-1`,
                inputClassName: `mb-2`,
                secret: !0,
              }),
          }),
        r &&
          (0, W.jsxs)(W.Fragment, {
            children: [
              (0, W.jsx)(P, {
                name: `azureOpenAIApiKey`,
                control: n,
                render: ({ field: e }) =>
                  (0, W.jsx)(G, {
                    id: `azureOpenAIApiKey`,
                    ...e,
                    label: `Azure OpenAI API Key`,
                    labelClassName: `mb-1`,
                    secret: !0,
                  }),
              }),
              (0, W.jsx)(`div`, { className: `mt-3` }),
              (0, W.jsx)(P, {
                name: `azureOpenAIApiInstanceName`,
                control: n,
                render: ({ field: e }) =>
                  (0, W.jsx)(G, {
                    id: `azureOpenAIApiInstanceName`,
                    ...e,
                    label: `Azure OpenAI Instance Name`,
                    labelClassName: `mb-1`,
                  }),
              }),
              (0, W.jsx)(`div`, { className: `mt-3` }),
              (0, W.jsx)(P, {
                name: `azureOpenAIApiDeploymentName`,
                control: n,
                render: ({ field: e }) =>
                  (0, W.jsx)(G, {
                    id: `azureOpenAIApiDeploymentName`,
                    ...e,
                    label: `Azure OpenAI Deployment Name`,
                    labelClassName: `mb-1`,
                  }),
              }),
              (0, W.jsx)(`div`, { className: `mt-3` }),
              (0, W.jsx)(P, {
                name: `azureOpenAIApiVersion`,
                control: n,
                render: ({ field: e }) =>
                  (0, W.jsx)(G, {
                    id: `azureOpenAIApiVersion`,
                    ...e,
                    label: `Azure OpenAI API Version`,
                    labelClassName: `mb-1`,
                  }),
              }),
            ],
          }),
        t &&
          (0, W.jsx)(`div`, {
            className: `mt-3`,
            children: (0, W.jsx)(P, {
              name: `baseURL`,
              control: n,
              render: ({ field: e }) =>
                (0, W.jsx)(G, {
                  id: `baseURL`,
                  ...e,
                  label: `API Base URL`,
                  subLabel: `(Optional)`,
                  labelClassName: `mb-1`,
                }),
            }),
          }),
      ],
    });
  },
  re = ({ userKey: e, setUserKey: t, endpoint: n }) => {
    let r = C();
    return (0, W.jsx)(G, {
      id: n,
      value: e ?? ``,
      onChange: (e) => t(e.target.value ?? ``),
      label: r(`com_endpoint_config_key_name`),
      secret: !0,
    });
  };
function ie({ endpoint: e }) {
  let t = C();
  return (
    {
      [y.google]: (0, W.jsxs)(W.Fragment, {
        children: [
          (0, W.jsxs)(`small`, {
            className: `mt-4 break-all text-text-secondary`,
            children: [
              t(`com_endpoint_config_google_service_key`),
              `: `,
              t(`com_endpoint_config_key_google_need_to`),
              ` `,
              (0, W.jsx)(`a`, {
                target: `_blank`,
                href: `https://console.cloud.google.com/vertex-ai`,
                rel: `noreferrer`,
                className: `text-link underline`,
                children: t(`com_endpoint_config_key_google_vertex_ai`),
              }),
              ` `,
              t(`com_endpoint_config_key_google_vertex_api`),
              ` `,
              (0, W.jsx)(`a`, {
                target: `_blank`,
                href: `https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts/create?walkthrough_id=iam--create-service-account#step_index=1`,
                rel: `noreferrer`,
                className: `text-link underline`,
                children: t(`com_endpoint_config_key_google_service_account`),
              }),
              `. `,
              t(`com_endpoint_config_key_google_vertex_api_role`),
            ],
          }),
          (0, W.jsxs)(`small`, {
            className: `break-all text-text-secondary`,
            children: [
              t(`com_endpoint_config_google_api_key`),
              `: `,
              t(`com_endpoint_config_google_api_info`),
              ` `,
              (0, W.jsx)(`a`, {
                target: `_blank`,
                href: `https://makersuite.google.com/app/apikey`,
                rel: `noreferrer`,
                className: `text-link underline`,
                children: t(`com_endpoint_config_click_here`),
              }),
              ` `,
            ],
          }),
        ],
      }),
    }[e] || null
  );
}
var ae = (0, H.memo)(ie),
  Z = {
    [y.google]: ne,
    [y.openAI]: X,
    [y.custom]: K,
    [y.azureOpenAI]: X,
    [y.assistants]: X,
    [y.azureAssistants]: X,
    [y.bedrock]: q,
    default: re,
  },
  Q = new Set([y.openAI, y.custom, y.azureOpenAI, y.assistants, y.azureAssistants, y.bedrock]),
  $ = {
    THIRTY_MINUTES: { label: `in 30 minutes`, value: 18e5 },
    TWO_HOURS: { label: `in 2 hours`, value: 72e5 },
    TWELVE_HOURS: { label: `in 12 hours`, value: 432e5 },
    ONE_DAY: { label: `in 1 day`, value: 864e5 },
    ONE_WEEK: { label: `in 7 days`, value: 6048e5 },
    ONE_MONTH: { label: `in 30 days`, value: 2592e6 },
    NEVER: { label: `never`, value: 0 },
  },
  oe = ({ endpoint: e, disabled: t, setDialogOpen: n }) => {
    let r = C(),
      [i, a] = (0, H.useState)(!1),
      { showToast: d } = o(),
      m = f(e),
      h = l(),
      g = () => {
        (d({ message: r(`com_ui_revoke_key_success`), status: S.SUCCESS }), n && n(!1));
      },
      _ = () => {
        d({ message: r(`com_ui_revoke_key_error`), status: S.ERROR });
      },
      y = () => {
        m.mutate({}, { onSuccess: g, onError: _ });
      },
      x = m.isLoading || h.isLoading;
    return (0, W.jsx)(`div`, {
      className: `flex items-center justify-between`,
      children: (0, W.jsxs)(u, {
        open: i,
        onOpenChange: a,
        children: [
          (0, W.jsx)(w, {
            asChild: !0,
            children: (0, W.jsx)(s, {
              variant: `destructive`,
              className: `flex items-center justify-center rounded-lg transition-colors duration-200`,
              onClick: () => a(!0),
              disabled: t,
              children: r(`com_ui_revoke`),
            }),
          }),
          (0, W.jsxs)(E, {
            className: `max-w-[450px]`,
            children: [
              (0, W.jsx)(v, {
                children: (0, W.jsx)(p, { children: r(`com_ui_revoke_key_endpoint`, { 0: e }) }),
              }),
              (0, W.jsx)(`div`, {
                className: `py-4`,
                children: (0, W.jsx)(c, {
                  className: `text-left text-sm font-medium`,
                  children: r(`com_ui_revoke_key_confirm`),
                }),
              }),
              (0, W.jsxs)(b, {
                children: [
                  (0, W.jsx)(s, {
                    variant: `outline`,
                    onClick: () => a(!1),
                    children: r(`com_ui_cancel`),
                  }),
                  (0, W.jsx)(s, {
                    variant: `destructive`,
                    onClick: y,
                    disabled: x,
                    className: `bg-surface-destructive text-text-on-status transition-all duration-200 hover:bg-surface-destructive-hover`,
                    children: x ? (0, W.jsx)(k, {}) : r(`com_ui_revoke`),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  se = ({
    open: e,
    onOpenChange: t,
    endpoint: n,
    endpointType: r,
    userProvideURL: i,
    userProvideAccessKeyId: a,
    userProvideSecretAccessKey: c,
    userProvideSessionToken: l,
    userProvideBearerToken: f,
  }) => {
    let h = M({
        defaultValues: {
          apiKey: ``,
          baseURL: ``,
          azureOpenAIApiKey: ``,
          azureOpenAIApiInstanceName: ``,
          azureOpenAIApiDeploymentName: ``,
          azureOpenAIApiVersion: ``,
          bedrockAccessKeyId: ``,
          bedrockSecretAccessKey: ``,
          bedrockSessionToken: ``,
          bedrockBearerToken: ``,
        },
      }),
      [g, w] = (0, H.useState)(``),
      [T, D] = (0, H.useState)($.TWELVE_HOURS.label),
      { getExpiry: k, saveUserKey: A } = d(n),
      { showToast: j } = o(),
      P = C(),
      F = Object.values($),
      I = r ?? n,
      L = (e) => {
        D(e);
      },
      R = () => {
        let e = F.find((e) => e.label === T),
          o;
        o = e?.value === 0 ? null : Date.now() + (e ? e.value : 0);
        let s = (e) => {
          try {
            (A(e, o), j({ message: P(`com_ui_save_key_success`), status: S.SUCCESS }), t(!1));
          } catch (e) {
            (O.error(`Error saving user key:`, e),
              j({ message: P(`com_ui_save_key_error`), status: S.ERROR }));
          }
        };
        if (Q.has(n) || Q.has(r ?? ``)) {
          h.handleSubmit((e) => {
            let n = I === y.azureOpenAI,
              r = I === y.bedrock,
              o = n || I === y.openAI || x(I);
            n && (e.apiKey = `n/a`);
            let u = Object.keys(e).filter((t) =>
              (!n && t.startsWith(`azure`)) ||
              (!r && t.startsWith(`bedrock`)) ||
              (o && t === `baseURL`) ||
              (t === `baseURL` && !(i ?? !1))
                ? !1
                : e[t] === ``,
            );
            if (r) {
              let n = f ? e.bedrockBearerToken?.trim() : ``,
                r = a ? e.bedrockAccessKeyId?.trim() : ``,
                i = c ? e.bedrockSecretAccessKey?.trim() : ``,
                o = l ? e.bedrockSessionToken?.trim() : ``,
                s = P(`com_endpoint_config_bedrock_access_key_id`),
                u = P(`com_endpoint_config_bedrock_secret_access_key`),
                d = P(`com_endpoint_config_bedrock_session_token`),
                p = P(`com_endpoint_config_bedrock_bearer_token`),
                m = !!n,
                h = !!a || !!c || !!l,
                g = [
                  !m && !h && f ? p : ``,
                  !m && a && !r ? s : ``,
                  !m && c && !i ? u : ``,
                  !m && l && !o ? d : ``,
                ].filter(Boolean);
              if (!m && g.length > 0) {
                (j({
                  message: `${P(`com_endpoint_config_required_fields`)} ${g.join(`, `)}`,
                  status: S.ERROR,
                }),
                  t(!0));
                return;
              }
              if (!m && !h) {
                (j({
                  message: P(`com_endpoint_config_bedrock_credentials_required`),
                  status: S.ERROR,
                }),
                  t(!0));
                return;
              }
            } else if (u.length > 0) {
              (j({
                message: `${P(`com_endpoint_config_required_fields`)} ${u.join(`, `)}`,
                status: S.ERROR,
              }),
                t(!0));
              return;
            }
            let {
                apiKey: d,
                baseURL: p,
                bedrockAccessKeyId: m,
                bedrockSecretAccessKey: g,
                bedrockSessionToken: _,
                bedrockBearerToken: v,
                ...b
              } = e,
              C = { apiKey: d, baseURL: p };
            if (n)
              C.apiKey = JSON.stringify({
                azureOpenAIApiKey: b.azureOpenAIApiKey,
                azureOpenAIApiInstanceName: b.azureOpenAIApiInstanceName,
                azureOpenAIApiDeploymentName: b.azureOpenAIApiDeploymentName,
                azureOpenAIApiVersion: b.azureOpenAIApiVersion,
              });
            else if (r) {
              let e = f ? v.trim() : ``,
                t = a ? m.trim() : ``,
                n = c ? g.trim() : ``,
                r = l ? _.trim() : ``;
              C.apiKey = JSON.stringify(
                e
                  ? { bearerToken: e }
                  : {
                      ...(t && { accessKeyId: t }),
                      ...(n && { secretAccessKey: n }),
                      ...(r && { sessionToken: r }),
                    },
              );
            }
            (s(JSON.stringify(C)), h.reset());
          })();
          return;
        }
        if (!g.trim()) {
          j({ message: P(`com_ui_key_required`), status: S.ERROR });
          return;
        }
        (s(g), w(``));
      },
      z = Z[I] ?? Z.default,
      B = k(),
      V = _(),
      G = null;
    return (
      B === `never`
        ? (G = P(`com_endpoint_config_key_never_expires`))
        : B !== void 0 && (G = U(P, B, V)),
      (0, W.jsx)(u, {
        open: e,
        onOpenChange: t,
        children: (0, W.jsxs)(E, {
          className: `w-11/12 max-w-2xl`,
          children: [
            (0, W.jsx)(v, {
              children: (0, W.jsx)(p, {
                children: `${P(`com_endpoint_config_key_for`)} ${m[n] ?? n}`,
              }),
            }),
            (0, W.jsxs)(`div`, {
              className: `grid w-full items-center gap-2 py-2`,
              children: [
                G && (0, W.jsx)(`small`, { className: `text-text-destructive`, children: G }),
                (0, W.jsx)(ee, {
                  label: `${P(`com_endpoint_config_new_key_expiration`)}: `,
                  value: T,
                  onChange: L,
                  options: F.map((e) => e.label),
                  sizeClasses: `w-[185px]`,
                  portal: !1,
                }),
                (0, W.jsx)(N, {
                  ...h,
                  children: (0, W.jsx)(z, {
                    userKey: g,
                    endpoint: n,
                    setUserKey: w,
                    userProvideURL: i,
                    userProvideAccessKeyId: a,
                    userProvideSecretAccessKey: c,
                    userProvideSessionToken: l,
                    userProvideBearerToken: f,
                  }),
                }),
                (0, W.jsx)(ae, { endpoint: n }),
              ],
            }),
            (0, W.jsxs)(b, {
              children: [
                (0, W.jsx)(oe, { endpoint: n, disabled: !(B ?? ``), setDialogOpen: t }),
                (0, W.jsx)(s, { variant: `submit`, onClick: R, children: P(`com_ui_submit`) }),
              ],
            }),
          ],
        }),
      })
    );
  };
export { L as a, z as i, U as n, I as o, V as r, F as s, se as t };
