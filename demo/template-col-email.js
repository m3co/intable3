'use strict';
(() => {
  var form = document.currentScript.previousElementSibling;
  var input = form.querySelector('input');
  var choicesEl = form.querySelector('#search-email');
  var choices = new Choices(choicesEl, {
    placeholder: true,
    placeholderValue: 'Select an email'
  });
  choicesEl.addEventListener('search', e => {
    fetch('/api/datas').then(response => response.json()).then(data => {
      choices.setChoices(data, 'email', 'email', true);
    });
  });
  choicesEl.addEventListener('choice', e => {
    input.value = e.detail.choice.value;
    form.dispatchEvent(new Event('submit'));
    form.previousElementSibling.dispatchEvent(new Event('click'));
  });
})();
