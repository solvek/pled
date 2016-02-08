/**
 * Created by solvek on 08.02.16.
 */


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
