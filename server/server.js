'use strict';

const express = require('express');
const bodyParser= require('body-parser');
const app = express();
const fs = require('fs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/api/data', (req, res) => {
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    var datas = JSON.parse(data);
    var lastId = datas.reduce((max, curr) => {
      if (max < curr.id) {
        max = Number(curr.id);
      }
      return max;
    }, -1);

    var newItem = req.body;
    newItem.id = ++lastId;
    newItem.firstName = newItem.firstName || '';
    newItem.lastName = newItem.lastName || '';
    newItem.email = newItem.email || '';
    newItem.ip_address = newItem.ip_address || '';
    newItem.createdAt = new Date().toISOString();

    datas.unshift(newItem);
    fs.writeFile('dummy.json', JSON.stringify(datas), (err) => {
      res.json(newItem);
    });
  });
});

app.get('/api/datas/describe', (req, res) => {
  fs.readFile('describe-dummy.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  });
});

app.get('/api/datas/sliced2', (req, res) => {
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data).slice(0, 5).map(item => {
      item.email = "my email is: " + item.email;
      return item;
    }));
  });
});

app.get('/api/datas/sliced', (req, res) => {
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data).slice(0, 3));
  });
});

app.get('/api/datas', (req, res) => {
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data));
  });
});

app.get('/api/data/:id', (req, res) => {
  var id = Number(req.params.id);
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    res.json(JSON.parse(data).find(item => id === item.id));
  });
});

app.put('/api/data/:id', (req, res) => {
  var id = Number(req.params.id);
  var newItem = req.body;
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    var datas = JSON.parse(data);
    var item = datas.find(item => id === Number(item.id));
    Object.keys(newItem).forEach(key => {
      item[key] = newItem[key];
    });
    fs.writeFile('dummy.json', JSON.stringify(datas), (err) => {
      res.json(item);
    });
  });
});

app.delete('/api/data/:id', (req, res) => {
  var id = Number(req.params.id);
  fs.readFile('dummy.json', 'utf8', (err, data) => {
    var datas = JSON.parse(data);
    var itemIndex = datas.findIndex(item => id === item.id);
    var item = datas.find(item => id === item.id);
    if (itemIndex !== -1) {
      datas.splice(itemIndex, 1);
      fs.writeFile('dummy.json', JSON.stringify(datas), (err) => {
        res.json({
          status: 'success'
        });
      });
    } else {
      res.json({
        status: 'error',
        message: 'not found'
      });
    }
  });
});

app.listen(5554, 'localhost', function () {
  var host = this.address().address;
  var port = this.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
