/* One shared site shell for the product collection and Kanban. */
(function () {
  const home = new URL('../index.html', document.currentScript.src).href;
  const board = new URL('kanban/index.html', home).href;
  const isBoard = document.body.dataset.page === 'kanban';
  const mark = '<svg class="studio-mark" viewBox="0 0 64 72" aria-hidden="true" fill="none"><path d="M4 68V31L32 3l28 28v37H4Z"/><path d="M8 64V33L32 9l24 24v31H8Z"/></svg>';
  document.querySelector('[data-site-header]').innerHTML = `
    <header class="site-header">
      <a class="studio-brand" href="${home}" aria-label="NORHOLM Studio home">${mark}<span class="studio-wordmark">NORHOLM<span>STUDIO</span></span></a>
      <nav class="site-nav" aria-label="Main navigation">
        <a href="${home}" ${!isBoard?'aria-current="page"':''}>Product Hub</a>
        <a href="${board}" ${isBoard?'aria-current="page"':''}>Kanban</a>
      </nav>
      ${isBoard?`<a class="studio-capture" href="${home}?capture=1">＋ Capture idea</a>`:'<button id="new" class="studio-capture" type="button">＋ Capture idea</button>'}
    </header>`;
  document.querySelector('[data-site-footer]').innerHTML = `
    <footer class="site-footer"><a href="${home}" class="footer-brand">NORHOLM <span>Studio</span></a><span class="studio-tagline">Stylized minimalism. Thoughtfully made.</span><nav aria-label="Footer navigation"><a href="${home}">Product Hub</a><a href="${board}">Kanban</a></nav></footer>`;
})();
