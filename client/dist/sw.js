if (!self.define) {
  let s,
    e = {};
  const l = (l, i) => (
    (l = new URL(l + '.js', i).href),
    e[l] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = l), (s.onload = e), document.head.appendChild(s));
        } else ((s = l), importScripts(l), e());
      }).then(() => {
        let s = e[l];
        if (!s) throw new Error(`Module ${l} didn’t register its module`);
        return s;
      })
  );
  self.define = (i, r) => {
    const n = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[n]) return;
    let t = {};
    const u = (s) => l(s, n),
      a = { module: { uri: n }, exports: t, require: u };
    e[n] = Promise.all(i.map((s) => a[s] || u(s))).then((s) => (r(...s), t));
  };
}
define(['./workbox-1b73dcc2'], function (s) {
  'use strict';
  (importScripts('sw-heal.js'),
    self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '402b66900e731ca748771b6fc5e7a068' },
        { url: 'assets/virtualization.DcU0xlek.js', revision: null },
        { url: 'assets/vendor.D0DpYPgQ.js', revision: null },
        { url: 'assets/validation.Bd3jvxDI.js', revision: null },
        { url: 'assets/utilities.HUTk6tC6.js', revision: null },
        { url: 'assets/tanstack-vendor.2R6Ja_-H.js', revision: null },
        { url: 'assets/SubagentThreadPanel.XzU3zPPy.js', revision: null },
        { url: 'assets/SkillsView.BnkwV6tW.js', revision: null },
        { url: 'assets/SetKeyDialog.JfrlEezG.js', revision: null },
        { url: 'assets/security-ui.B17a9jwF.js', revision: null },
        { url: 'assets/sandpack.CM9tvzTe.js', revision: null },
        { url: 'assets/SandboxArtifactTabs.CBr4L2RN.js', revision: null },
        { url: 'assets/routing.CgoqFSAd.js', revision: null },
        { url: 'assets/rolldown-runtime.B0Z9INg1.js', revision: null },
        { url: 'assets/react-vtree.BInx5Ne5.js', revision: null },
        { url: 'assets/react-interactions.BEfrmSAG.js', revision: null },
        { url: 'assets/radix-ui.BGubVf3o.js', revision: null },
        { url: 'assets/queries.NT745P4K.js', revision: null },
        { url: 'assets/Projects.B82T953r.js', revision: null },
        { url: 'assets/ProjectEditDialog.vuwkOqZb.js', revision: null },
        { url: 'assets/polyfills.DO65XH-F.js', revision: null },
        { url: 'assets/MyFilesModal.CPmyStjl.js', revision: null },
        { url: 'assets/mermaid.C3Ct62iP.js', revision: null },
        { url: 'assets/math-katex.uZ8_QngQ.css', revision: null },
        { url: 'assets/math-katex.dI9Ti9PO.js', revision: null },
        { url: 'assets/markdown.BjfKJW2c.js', revision: null },
        { url: 'assets/markdown-processing.CjMf2xPH.js', revision: null },
        { url: 'assets/Insights.CsXigeU5.js', revision: null },
        { url: 'assets/index.z14idlKa.js', revision: null },
        { url: 'assets/index.oqSyh1NB.css', revision: null },
        { url: 'assets/i18n.CenFdT2j.js', revision: null },
        { url: 'assets/http-client.C5fr6Lnu.js', revision: null },
        { url: 'assets/hooks.CT2XGurp.js', revision: null },
        { url: 'assets/heicConverter.G1USXmEZ.js', revision: null },
        { url: 'assets/heic-converter.D068xdPA.js', revision: null },
        { url: 'assets/headlessui.8omgZzEp.js', revision: null },
        { url: 'assets/framer-motion.6mTbS3M5.js', revision: null },
        { url: 'assets/forms.DQMwNapF.js', revision: null },
        { url: 'assets/forms.Do8E8O0r.js', revision: null },
        { url: 'assets/eventSelection.BVcZZFFx.js', revision: null },
        { url: 'assets/date-utils.C_DbPEjY.js', revision: null },
        { url: 'assets/codemirror-core.r8uhyzQ3.js', revision: null },
        { url: 'assets/code-editor.D4qHd5re.js', revision: null },
        { url: 'assets/avatars.DwBzmTCp.js', revision: null },
        { url: 'assets/Artifacts.DDelIBVK.js', revision: null },
        { url: 'assets/animations.BHEQrG-H.js', revision: null },
        { url: 'assets/advanced-inputs.0gHsBjsU.js', revision: null },
        { url: 'assets/AccountSettings.yL0_peif.js', revision: null },
        { url: 'assets/favicon-32x32.png', revision: 'eb123edfbf0477095fce9a584c3552bf' },
        { url: 'assets/favicon-16x16.png', revision: '576d6a43e8f233d830de116024acf33d' },
        { url: 'assets/icon-192x192.png', revision: 'defb5ac1edae8315e15bd8053fed102a' },
        {
          url: 'assets/apple-touch-icon-180x180.png',
          revision: '0265dbac793fe970021036ddfa50861e',
        },
        { url: 'assets/maskable-icon.png', revision: 'dbe693d9dec612cbb6e6c146e8b73cb3' },
        { url: 'manifest.webmanifest', revision: 'bf06332aaa4d3cf0e3a94c5208b9dee9' },
      ],
      {},
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(
      ({ url: s }) => /\/assets\/locale-[^/]+\.js$/.test(s.pathname),
      new s.StaleWhileRevalidate({
        cacheName: 'locale-chunks',
        plugins: [
          new s.CacheableResponsePlugin({ statuses: [0, 200] }),
          new s.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET',
    ));
});
