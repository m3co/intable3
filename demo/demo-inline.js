'use strict';

var tmplRow = document.querySelector('template#row');
var tmplCol = document.querySelector('template#col');

var table = document.querySelector('table');
var tbody = table.querySelector('tbody');

function setupCol(el, key, entry, description) {
  var form = el.querySelector('form');
  var span = el.querySelector('span');
  span.textContent = entry[key];

  var inputId = form.querySelector('input[name="id"]');
  inputId.value = entry.id;

  var input = form.querySelector('input');
  input.value = entry[key];
  input.name = key;
  input.type = description.type;

  function toggle() {
    span.hidden = !span.hidden;
    form.hidden = !form.hidden;
    if (!form.hidden) {
      input.focus();
    }
  }

  span.addEventListener('click', toggle);
  input.addEventListener('blur', toggle);

  form.addEventListener('submit', e => {
    input.blur();
    e.preventDefault();

    var fd = new FormData(e.target).toJSON();
  });
}

fetch('describe-dummy.json').then(response => response.json()).then(columns => {
  fetch('dummy.json').then(response => response.json()).then(entries => {
    entries.forEach(entry => {
      var cloneRow = document.importNode(tmplRow.content, true);
      Object.keys(entry).forEach(key => {
        var cloneCol = document.importNode(tmplCol.content, true);
        setupCol(cloneCol, key, entry, columns[key]);
        cloneRow.appendChild(cloneCol);
      });
      tbody.appendChild(cloneRow);
    });
  });
});
