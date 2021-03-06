'use strict';
document.currentFragment.loaded.then(fragment => {

  function orderDescription(description) {
    return Object.keys(description).map(key => {
      return { name: key, order: Number(description[key].order || 0) };
    }).sort((a, b) => {
      if (a.order < b.order) { return -1; }
      if (a.order > b.order) { return 1; }
      return 0;
    }).map(item => item.name);
  }

  var headers = new Headers();
  headers.append('Content-Type', 'application/json');

  var tmplThead = fragment.querySelector('template#thead');
  var tmplTheadCol = fragment.querySelector('template#thead-col');
  var tmplRow = fragment.querySelector('template#row');
  var tmplCol = fragment.querySelector('template#col');
  var tmplTable = fragment.querySelector('template#table');

  function doTemplateOverText(text, entry) {
    var concreteText = text;
    var params = text.match(/:\w+/g);
    if (params) {
      var values = params.map(item => entry[item.slice(1)]);
      concreteText = params.reduce((url, param, i) => {
        url = url.replace(param, values[i]);
        return url;
      }, concreteText);
    }
    return concreteText;
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
      this.tmplthead = (this.querySelector('template#thead') || tmplThead).content;
      this.tmplrow = (this.querySelector('template#row') || tmplRow).content;
      this.tmplcols = [];

      var cloneTable = document.importNode((
    this.querySelector('template#table') || tmplTable).content, true);
      var table = cloneTable.querySelector('table');
      var tbody = table.querySelector('tbody');

      table.addEventListener('submit-entry', e => {
        var form = e.detail.form;
        var entry = e.detail.entry;
        var update = e.detail.update;

        Object.keys(form).forEach(key => {
          entry[key] = form[key];
          if (form[key] === '') {
            delete form[key];
          }
        });

        var action;
        if (!entry.id) {
          action = fetch(doTemplateOverText(urlCreate, entry), {
            method: 'post',
            headers: headers,
            body: JSON.stringify(form)
          });
        } else {
          action = fetch(doTemplateOverText(urlUpdate, entry), {
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
        if (!entry.id) {
          return update();
        }
        var url = doTemplateOverText(urlDelete, entry);
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
        var cloneThead = document.importNode(this.tmplthead, true);
        var tr = cloneThead.querySelector('tr');
        var requiredFields = [];
        var orderedDescription = orderDescription(columns);
        this.tmplcols = orderedDescription.reduce((cols, key) => {
          cols[key] = (this.querySelector(`template[col="${key}"]`) || tmplCol).content;
          return cols;
        }, {});
        orderedDescription.forEach(key => {
          var cloneTheadCol = document.importNode(tmplTheadCol.content, true);
          var span = cloneTheadCol.querySelector('span');
          span.textContent = columns[key].text;
          var td = cloneTheadCol.querySelector('td');
          if (columns[key].type === 'hidden') {
            td.hidden = true;
          }
          td.id = key;
          if (columns[key].required) {
            requiredFields.push(key);
          }
          tr.appendChild(cloneTheadCol);
        });
    // move actions to the last place
        tr.appendChild(tr.querySelector('[actions=""]'));
        table.appendChild(cloneThead);
        this.dispatchEvent(new CustomEvent('setup-head', {
          detail: {
            element: table.querySelector('thead')
          }
        }));

        var createEntry = (entry) => {
          var cloneRow = document.importNode(this.tmplrow, true);

          var tw = document.createTreeWalker(cloneRow,
        NodeFilter.SHOW_ELEMENT);
          while(tw.nextNode()) {
            [...tw.currentNode.attributes].forEach(attribute => {
              if (/^entry/.test(attribute.name)) {
                attribute.value = doTemplateOverText(attribute.value, entry);
              }
            });
          }
          var tr = cloneRow.querySelector('tr');
          var btnDelete = cloneRow.querySelector('#delete');
          btnDelete.addEventListener('click', () => {
            table.dispatchEvent(new CustomEvent('delete-entry', {
              detail: {
                entry: entry,
                update: () => {
                  this.dispatchEvent(new CustomEvent('delete-row', {
                    detail: {
                      element: tr,
                      entry: entry
                    }
                  }));
                  tr.remove();
                }
              }
            }));
          });

          orderedDescription.forEach(key => {
            var cloneCol = document.importNode(this.tmplcols[key], true);
            setupCol.bind(this)(cloneCol, key, entry, columns[key], requiredFields);
            tr.appendChild(cloneCol);
          });
          // move actions to the last place
          tr.appendChild(tr.querySelector('[actions=""]'));
          this.dispatchEvent(new CustomEvent('create-row', {
            detail: {
              element: tr,
              entry: entry
            }
          }));
          return cloneRow;
        };

        fetch(urlIndex).then(response => response.json()).then(entries => {
          entries.forEach(entry => {
            tbody.appendChild(createEntry.bind(this)(entry));
          });
        });

        var btnAdd = cloneTable.querySelector('#add');
        btnAdd.addEventListener('click', () => {
          tbody.insertBefore(createEntry.bind(this)(Object.keys(columns).reduce((acc, key) => {
            acc[key] = '';
            return acc;
          }, {})), tbody.firstElementChild);
        });

        this.appendChild(cloneTable);
      });

      var setupCol = (el, key, entry, description, requiredFields) => {
        var td = el.querySelector('td');
        td.id = key;
        description.type = description.type || 'text';
        if (description.type === 'hidden') {
          td.hidden = true;
        }

        var form = el.querySelector('form');
        var span = el.querySelector('span');
        var input = form.querySelector('input');
        input.name = key;
        input.type = description.type;
        if (description.is) {
          input.setAttribute('is', description.is);
        }
        if (description.step) {
          input.setAttribute('step', description.step);
        }
        input.placeholder = description.text;
        update(entry);

        if (description.readonly) {
          return;
        }
        function showForm() {
          var tr = form.closest('tr');
          requiredFields.forEach(field => {
            var inputOriginal = tr.querySelector(`#${field} input[name="${field}"]`);
            var inputExtra = form.querySelector(`[name="${field}"]`);
            inputExtra.value = inputOriginal.value;
          });
          span.hidden = true;
          form.hidden = false;
          input.focus();
        }
        function hideForm() {
          span.hidden = false;
          form.hidden = true;
        }

        var alreadySubmit = false;
        span.addEventListener('click', showForm);
        input.addEventListener('blur', hideForm);
        input.addEventListener('change', e => {
          form.dispatchEvent(new Event('submit'));
          alreadySubmit = true;
        });
        setTimeout(() => {
          var tr = form.closest('tr');
          Object.keys(entry).forEach(field => {
            var td = tr.querySelector(`#${field}`);
            if (td) {
              requiredFields.forEach(field => {
                var input = td.querySelector(`[name="${field}"]`);
                if (!input) {
                  input = document.createElement('input');
                  input.name = field;
                  input.required = true;
                  input.hidden = true;
                  td.querySelector('form')
                .insertBefore(input,
                  td.querySelector('form input[type="submit"]'));
                }
                input.required = true;
              });
            }
          });
        }, 0);

        form.addEventListener('submit', e => {
          e.preventDefault();
          if (alreadySubmit) {
            setTimeout(() => { // let's see the evil's face here in this line
              alreadySubmit = false;
            }, 0);
            return;
          }
          if (!form.checkValidity()) {
            return;
          }

          var tr = e.target.closest('tr');
          var idEl = tr.querySelector('input[name="id"]');
          var id = idEl.value;
          var fd = new FormData(e.target).toJSON();
          fd.id = id;
          table.dispatchEvent(new CustomEvent('submit-entry', {
            detail: {
              entry: entry,
              form: fd,
              update: (entry) => {
                update(entry);
                this.dispatchEvent(new CustomEvent('update-row', {
                  detail: {
                    element: tr,
                    entry: entry
                  }
                }));
                hideForm();
              }
            }
          }));
        });

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
      };

    }
  }
  customElements.define('x-inline-table', InlineTable3HTMLElement);

});
