import { a as e, r as t } from './rolldown-runtime.B0Z9INg1.js';
import { at as n, rt as r } from './advanced-inputs.0gHsBjsU.js';
import { c as i } from './radix-ui.BGubVf3o.js';
import { Bo as a, Ma as o, Ul as s, Wl as c, ba as l, qo as u } from './hooks.wwWU0zYC.js';
import { n as d, t as f } from './sandpack.CM9tvzTe.js';
import { n as p, r as m } from './Artifacts.DrTIPo66.js';
var h = e(n(), 1),
  g = r(),
  _ = (0, h.memo)(function ({
    files: e,
    fileKey: t,
    template: n,
    sharedProps: r,
    previewRef: i,
    currentCode: a,
    startupConfig: s,
  }) {
    let c = (0, h.useMemo)(() => {
        if (Object.keys(e).length === 0) return e;
        let n = a ?? ``;
        return n ? { ...e, [t]: { code: n } } : e;
      }, [a, e, t]),
      u = (0, h.useMemo)(() => l(n, s), [s, n]);
    return Object.keys(c).length === 0
      ? null
      : (0, g.jsx)(d, {
          files: { ...c, ...o },
          options: u,
          ...r,
          template: n,
          children: (0, g.jsx)(f, {
            showOpenInCodeSandbox: !1,
            showRefreshButton: !1,
            tabIndex: 0,
            ref: i,
          }),
        });
  }),
  v = t({ default: () => y });
function y({ artifact: e, previewRef: t, isSharedConvo: n }) {
  let { currentCode: r, setCurrentCode: o } = a(),
    { shareId: l } = u(),
    d = n === !0 && typeof l == `string` && l.length > 0,
    { data: f } = c({ enabled: !d }),
    { data: v } = s(l, { enabled: d }),
    y = d ? v : f,
    b = (0, h.useRef)(null),
    x = (0, h.useRef)(null),
    S = x.current === e.id;
  (0, h.useEffect)(() => {
    (e.id !== x.current && o(void 0), (x.current = e.id));
  }, [e.id, o]);
  let { files: C, fileKey: w, template: T, sharedProps: E, deriveFiles: D } = m({ artifact: e }),
    O = S ? r : void 0,
    k = (0, h.useMemo)(() => (D != null && O ? D(O) : C), [D, O, C]);
  return (0, g.jsxs)(`div`, {
    className: `flex h-full w-full flex-col`,
    children: [
      (0, g.jsx)(i, {
        value: `code`,
        id: `artifacts-code`,
        className: `h-full w-full flex-grow overflow-auto`,
        tabIndex: -1,
        children: (0, g.jsx)(p, { artifact: e, monacoRef: b, readOnly: n === !0 }),
      }),
      (0, g.jsx)(i, {
        value: `preview`,
        className: `h-full w-full flex-grow overflow-hidden`,
        tabIndex: -1,
        children: (0, g.jsx)(_, {
          files: k,
          fileKey: w,
          template: T,
          previewRef: t,
          sharedProps: E,
          currentCode: O,
          startupConfig: y,
        }),
      }),
    ],
  });
}
export { y as default, v as t };
