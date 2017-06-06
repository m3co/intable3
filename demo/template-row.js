'use strict';
(() => {
  var td = document.currentScript.parentElement;
  var tmpl = td.querySelector('template');
  var clone = document.importNode(tmpl.content, true);

  var table = clone.querySelector('x-inline-table');
  var apuid = td.getAttribute('entry-apu-id');
  table.setAttribute('url-index', '/api/datas/sliced?apuid=' + apuid);

  td.appendChild(clone);
})();

