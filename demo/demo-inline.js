'use strict';

var tmplThead = document.querySelector('template#thead');
var tmplTheadCol = document.querySelector('template#thead-col');
var tmplRow = document.querySelector('template#row');
var tmplCol = document.querySelector('template#col');

var table = document.querySelector('table');
var tbody = table.querySelector('tbody');

function setupCol(el, key, entry, description) {
  var td = el.querySelector('td');
  description.type = description.type || 'text';
  if (description.type === 'hidden') {
    td.hidden = true;
    return;
  }

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
    console.log(fd);
  });
}

fetch('describe-dummy.json').then(response => response.json()).then(columns => {
  var cloneThead = document.importNode(tmplThead.content, true);
  Object.keys(columns).forEach(key => {
    var cloneTheadCol = document.importNode(tmplTheadCol.content, true);
    var span = cloneTheadCol.querySelector('span');
    span.textContent = columns[key].text;
    if (columns[key].type === 'hidden') {
      cloneTheadCol.querySelector('td').hidden = true;
    }
    cloneThead.querySelector('tr').appendChild(cloneTheadCol);
  });
  table.appendChild(cloneThead);

  fetch('dummy.json').then(response => response.json()).then(entries => {
    entries.forEach(entry => {
      var cloneRow = document.importNode(tmplRow.content, true);
      Object.keys(entry).forEach(key => {
        var cloneCol = document.importNode(tmplCol.content, true);
        setupCol(cloneCol, key, entry, columns[key]);
        cloneRow.querySelector('tr').appendChild(cloneCol);
      });
      tbody.appendChild(cloneRow);
    });
  });
});
