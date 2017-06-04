'use strict';
document.currentFragment.loaded.then(fragment => {
  var table = document.querySelector('table');
  var tbody = table.querySelector('tbody');

  var lastId = 5500;
  table.addEventListener('submit-entry', e => {
    var form = e.detail.form;
    var entry = e.detail.entry;
    var update = e.detail.update;

    Object.keys(form).forEach(key => {
      entry[key] = form[key];
    });

    if (!entry.id) {
      entry.id = lastId++;
    }
    update(entry);
  });

  table.addEventListener('delete-entry', e => {
    var entry = e.detail.entry;
    var update = e.detail.update;

    update();
  });

  var tmplThead = document.querySelector('template#thead');
  var tmplTheadCol = document.querySelector('template#thead-col');
  var tmplRow = document.querySelector('template#row');
  var tmplCol = document.querySelector('template#col');

  function setupCol(el, key, entry, description, editMode = false) {
    var td = el.querySelector('td');
    description.type = description.type || 'text';
    if (description.type === 'hidden') {
      td.hidden = true;
    }

    var form = el.querySelector('form');
    var span = el.querySelector('span');
    var input = form.querySelector('input');
    input.name = key;
    input.type = description.type;
    input.placeholder = description.text;
    update(entry);

    function toggle(doFocus = true) {
      span.hidden = !span.hidden;
      form.hidden = !form.hidden;
      if (!form.hidden && doFocus) {
        input.focus();
      }
      update(entry);
    }

    span.addEventListener('click', toggle);
    input.addEventListener('blur', toggle);

    form.addEventListener('submit', e => {
      e.preventDefault();

      var idEl = e.target.closest('tr').querySelector('input[name="id"]');
      var id = idEl.value;
      var fd = new FormData(e.target).toJSON();
      fd.id = id;
      table.dispatchEvent(new CustomEvent('submit-entry', {
        detail: {
          entry: entry,
          form: fd,
          update: (entry) => {
            update(entry);
            input.blur();
          }
        }
      }));
    });

    if (editMode) {
      toggle(false);
    }

    function update(entry) {
      var tr = form.closest('tr');
      if (tr && entry.id) {
        tr.querySelector('input[name="id"]').value = entry.id;
      }
      input.value = entry[key];
      span.textContent = entry[key];
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
        table.dispatchEvent(new CustomEvent('delete-entry', {
          detail: {
            entry: entry,
            update: function() {
              tr.remove();
            }
          }
        }));
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
});
