'use strict';
(() => {
  var td = document.currentScript.parentElement;
  var tmpl = td.querySelector('template');
  var clone = document.importNode(tmpl.content, true);

  var table = clone.querySelector('x-inline-table');
  var entryId = td.getAttribute('entry-id');
  table.setAttribute('url-index', '/api/datas/sliced?apuid=' + entryId);

  var tr1 = td.closest('tr');
  var tr2 = tr1.previousElementSibling;
  tr2.querySelector('#delete').addEventListener('click', () => {
    tr1.remove();
  });
  td.appendChild(clone);
})();

