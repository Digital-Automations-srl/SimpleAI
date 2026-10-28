import { v as e } from './tanstack-vendor.2R6Ja_-H.js';
import { M_ as t, u_ as n } from './hooks.DHfa_SP2.js';
var r = (r, i) =>
    e([n.insights, r], () => t.getInsights(r), {
      keepPreviousData: !0,
      refetchOnWindowFocus: !1,
      ...i,
    }),
  i = (r, i) =>
    e([n.insightsAccess, r ?? `anonymous`], () => t.getInsightsAccess(), {
      retry: !1,
      staleTime: 6e4,
      refetchOnWindowFocus: !1,
      ...i,
    });
export { r as n, i as t };
