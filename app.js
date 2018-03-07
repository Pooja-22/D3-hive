var express = require('express');
var app = express();
var path = require('path');

var PythonShell = require('python-shell');

function fetch() {
    return new Promise(function(resolve, reject) {
        PythonShell.run('data.py', function (err, data) {
            if (err) reject(err);
            resolve(data);
        });
    });
}

app.use(express.static(path.resolve(__dirname + './client')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/index.html'));
});

app.get('/data', function (req, res) {
    fetch().then(function (data) {
        res.status(201).send(data)
    });
});

app.listen(8100);
