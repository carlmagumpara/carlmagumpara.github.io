// Runs before the page renders so the saved/system theme is applied without a
// flash of the wrong colors. Kept in sync with ThemeToggle via the .dark class.
const themeInit = `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var useDark = saved
      ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', useDark);
  } catch (_) {}
})();
`

export function Head() {
  return (
    <>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      {/* Without JavaScript the loader timer never runs, so hide it entirely. */}
      <noscript><style>{'.loader-overlay{display:none!important}'}</style></noscript>
    </>
  )
}
