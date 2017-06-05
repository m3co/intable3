'use strict';
document.currentFragment.loaded.then(fragment => {

  var headers = new Headers();
  headers.append('Content-Type', 'application/json');

  var tmplThead = fragment.querySelector('template#thead');
  var tmplTheadCol = fragment.querySelector('template#thead-col');
  var tmplRow = fragment.querySelector('template#row');
  var tmplCol = fragment.querySelector('template#col');
  var tmplTableSpace = fragment.querySelector('template#inline3-space');

  function bringAboutURL(url, entry) {
    var concreteUrl = url;
    var params = url.match(/:\w+/g);
    if (params) {
      var values = params.map(item => entry[item.slice(1)]);
      concreteUrl = params.reduce((url, param, i) => {
        url = url.replace(param, values[i])
        return url;
      }, concreteUrl);
    }
    return concreteUrl;
  }
  class InlineTable3HTMLElement extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
  var urlDescribe = this.getAttribute('url-describe');
  var urlCreate = this.getAttribute('url-create');
  var urlIndex = this.getAttribute('url-index');
  var urlShow = this.getAttribute('url-show');
  var urlUpdate = this.getAttribute('url-update');
  var urlDelete = this.getAttribute('url-delete');

  var cloneTableSpace = document.importNode(tmplTableSpace.content, true);
  var table = cloneTableSpace.querySelector('table');
  var tbody = table.querySelector('tbody');

  table.addEventListener('submit-entry', e => {
    var form = e.detail.form;
    var entry = e.detail.entry;
    var update = e.detail.update;

    Object.keys(form).forEach(key => {
      entry[key] = form[key];
    });

    var action;
    if (!entry.id) {
      action = fetch(bringAboutURL(urlCreate, entry), {
        method: 'post',
        headers: headers,
        body: JSON.stringify(form)
      });
    } else {
      action = fetch(bringAboutURL(urlUpdate, entry), {
        method: 'put',
        headers: headers,
        body: JSON.stringify(form)
      });
    }
    action.then(response => response.json()).then(newEntry => {
      Object.keys(newEntry).forEach(key => {
        entry[key] = newEntry[key];
      });
      update(entry);
    });
  });

  table.addEventListener('delete-entry', e => {
    var entry = e.detail.entry;
    var update = e.detail.update;
    var url = bringAboutURL(urlDelete, entry);
    fetch(url, {
      method: 'delete',
      headers: headers
    }).then(response => response.json()).then(result => {
      if (result.status === 'error') {
        console.error(entry, url, result.message);
      }
      update();
    });
  });

  fetch(urlDescribe).then(response => response.json()).then(columns => {
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

    var createEntry = (entry, editMode = false) => {
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
        var _tmplCol = this.querySelector(`template[col="${key}"]`) || tmplCol;
        var cloneCol = document.importNode(_tmplCol.content, true);
        setupCol(cloneCol, key, entry, columns[key], editMode);
        tr.appendChild(cloneCol);
      });
      // move actions to the last place
      tr.appendChild(tr.querySelector('[actions=""]'));
      return cloneRow;
    };

    fetch(urlIndex).then(response => response.json()).then(entries => {
      entries.forEach(entry => {
        tbody.appendChild(createEntry.bind(this)(entry));
      });
    });

    var btnAdd = cloneTableSpace.querySelector('button#add');
    btnAdd.addEventListener('click', () => {
      tbody.insertBefore(createEntry.bind(this)(Object.keys(columns).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}), true), tbody.firstElementChild);
    });

    this.appendChild(cloneTableSpace);
  });

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

    }
  }
  customElements.define('x-inline-table', InlineTable3HTMLElement);

});
