'use strict';

var tmplRow = document.querySelector('template#row');
var tmplCol = document.querySelector('template#col');

var table = document.querySelector('table');
var tbody = table.querySelector('tbody');

function setupCol(el) {
  var span = el.querySelector('span');
  var form = el.querySelector('form');
  var input = form.querySelector('input');

  function toggle() {
    span.hidden = !span.hidden;
    form.hidden = !form.hidden;
  }

  span.addEventListener('click', toggle);

  form.addEventListener('submit', e => {
    toggle();
    e.preventDefault();
  });
}

[1, 2, 3, 4, 5].forEach(() => {
  var cloneRow = document.importNode(tmplRow.content, true);
  [1, 2].forEach(() => {
    var cloneCol = document.importNode(tmplCol.content, true);
    setupCol(cloneCol);
    cloneRow.appendChild(cloneCol);
  });

  tbody.appendChild(cloneRow);
});
