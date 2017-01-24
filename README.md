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

* Now enter in browser `http://localhost:3000` and you'll get combined playlist in response. 
* If url is `http://localhost:3000?force=true` then data will be reloaded

# Stream filters
You can add filter to transform streams. Streams are transformed by filters sequentially.
Each filter is actually a function which accepts three arguments:
- Old track info
- Source (string)
- List of already collected tracks
It returns updated track or `undefined`. `undefined` means that this track should not outputted to the final result. When a filter processed a track this track will be passed to the next filters.
There many examples of preloaded filters. See example

```javascript
var Pled = require('pled');
var f = Pled.filters;

var filters = [
    f.forStream('http://iptv.proline.net.ua/files/video/notv_vip.wmv', f.remove),
    f.forSource('http://iptv.proline.net.ua/playlist/iptv.m3u', f.setGroup('Інші')),
    f.forSource("http://iptv.slynet.tv/FreeSlyNet.m3u", f.setGroup('FreeSlyNet')),
    
    f.forGroup("Sport", fsetGroup('Action'))
    
    // 1+1
    f.forStream('udp://@226.226.1.1:1234', f.setGroup('Новини')),
    f.forStream('udp://@226.226.1.1:1234', f.setImage('http://iptv.proline.net.ua/images/channel/1plus1.jpg')),
        
    f.udpProxy('http://192.168.0.1:4000/udp/')    
    ];
    
var pled = new Pled({
       sources: ['http://iptv.slynet.tv/FreeSlyNet.m3u', 'http://iptv.slynet.tv/FreeBestTV.m3u'],
       filters: filters
   });
```

# Caching response
A response can be stored in a cache file. If handler finds a existing file and it is up to date it does not regenerate the playlist.

```javascript
var pled = new Pled({
       sources: ['http://iptv.slynet.tv/FreeSlyNet.m3u', 'http://iptv.slynet.tv/FreeBestTV.m3u'],
       cachePath: '/path/to/file', // Optional
       cacheTime: 7*24*60*60*1000 // Time to cache in milliseconds, by default 5 days
   });
```

# API Documentation

[Here](api.md)
