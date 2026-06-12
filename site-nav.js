(function () {
  var items = [
    { href: 'index.html', label: 'Proposal', files: ['', 'index.html'] },
    { href: 'pitch.html', label: 'Pitch', files: ['pitch.html'] },
    { href: 'simulator.html', label: 'Simulator', files: ['simulator.html'] }
  ];

  function currentFile() {
    var path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function renderNav() {
    var target = document.querySelector('[data-site-nav]');
    if (!target) return false;

    var file = currentFile();
    var links = items.map(function (item) {
      var active = item.files.indexOf(file) !== -1;
      return '<a class="nav-tab' + (active ? ' active' : '') + '" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    target.outerHTML =
      '<nav class="site-nav">' +
        '<div class="site-nav-inner">' +
          '<a class="site-nav-title" href="index.html">Team-Building Credits</a>' +
          links +
        '</div>' +
      '</nav>';
    return true;
  }

  if (!renderNav() && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNav);
  }
}());
