# Overview
Merging and transforming m3u playlists

# Installation

`npm install pled`

# Web server for playlists processing

It is the best to use Pled in pair with express.js. Directory `sample` contains simple web server which returns combined playlist.

```javascript
var express = require('express');
var app = express();

var Pled = require('../index');


var sources = ['http://iptv.slynet.tv/FreeSlyNet.m3u', 'http://iptv.slynet.tv/FreeBestTV.m3u'];

app.get('/', function (req, res) {
    var pled = new Pled({
        sources: sources
    });

    pled.handleRequest(req, res);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

```

Now enter in browser `http://localhost:3000` and you'll get combined playlist in response. 
If url is `http://localhost:3000?force=true` then data will be reloaded

# API Documentation

[Here](api.md)
