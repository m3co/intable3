'use strict';

var tmplThead = document.querySelector('template#thead');
var tmplTheadCol = document.querySelector('template#thead-col');
var tmplRow = document.querySelector('template#row');
var tmplCol = document.querySelector('template#col');

var table = document.querySelector('table');
var tbody = table.querySelector('tbody');

function setupCol(el, key, entry, description, editMode = false) {
  var td = el.querySelector('td');
  description.type = description.type || 'text';
  if (description.type === 'hidden') {
    td.hidden = true;
  }

  var form = el.querySelector('form');
  var span = el.querySelector('span');
  span.textContent = entry[key];

  checkPlaceholder();

  var input = form.querySelector('input');
  input.value = entry[key];
  input.name = key;
  input.type = description.type;
  input.placeholder = description.text;

  function toggle(doFocus = true) {
    span.hidden = !span.hidden;
    form.hidden = !form.hidden;
    if (!form.hidden && doFocus) {
      input.focus();
    }
    checkPlaceholder();
  }

  span.addEventListener('click', toggle);
  input.addEventListener('blur', toggle);

  form.addEventListener('submit', e => {
    input.blur();
    e.preventDefault();

    var id = e.target.closest('tr').querySelector('input[name="id"]').value;
    var fd = new FormData(e.target).toJSON();
    fd.id = id;
  });

  if (editMode) {
    toggle(false);
  }

  function checkPlaceholder() {
    if (!entry[key]) {
      span.innerHTML = `<span style="color:gray;">${description.text}</span>`;
    }
  }
}

fetch('describe-dummy.json').then(response => response.json()).then(columns => {
  var cloneThead = document.importNode(tmplThead.content, true);
  var tr = cloneThead.querySelector('tr');
  Object.keys(columns).forEach(key => {
    var cloneTheadCol = document.importNode(tmplTheadCol.content, true);
    var span = cloneTheadCol.querySelector('span');
    span.textContent = columns[key].text;
    if (columns[key].type === 'hidden') {
      cloneTheadCol.querySelector('td').hidden = true;
    }
    tr.appendChild(cloneTheadCol);
  });
  // move actions to the last place
  tr.appendChild(tr.querySelector('[actions=""]'));
  table.appendChild(cloneThead);

  function createEntry(entry, editMode = false) {
    var cloneRow = document.importNode(tmplRow.content, true);
    var tr = cloneRow.querySelector('tr');
    var btnDelete = cloneRow.querySelector('button#delete');
    btnDelete.addEventListener('click', () => {
      tr.remove();
    });

    Object.keys(entry).forEach(key => {
      var cloneCol = document.importNode(tmplCol.content, true);
      setupCol(cloneCol, key, entry, columns[key], editMode);
      tr.appendChild(cloneCol);
    });
    // move actions to the last place
    tr.appendChild(tr.querySelector('[actions=""]'));
    return cloneRow;
  }

  fetch('dummy.json').then(response => response.json()).then(entries => {
    entries.forEach(entry => {
      tbody.appendChild(createEntry(entry));
    });
  });

  var btnAdd = document.querySelector('button#add');
  btnAdd.addEventListener('click', () => {
    tbody.insertBefore(createEntry(Object.keys(columns).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {}), true), tbody.firstElementChild);
  });
});
