/**
 * Created by solvek on 08.02.16.
 */

"use strict";

var fs = require('fs');

var http = require("http");
var urlParse = require("url").parse;

var m3u = require('m3ujs');

class Pled{
    /**
     * @param {Object|string[]} options Pled options object or array of sources
     * @param {string[]} options.sources Sources of m3u files. Each source is either a path
     * to local file of a url to an http file (starting from "http://" or "https://")
     * @param {FilterFunction[]} [options.filters] Sequence of filters
     * @param {string} [options.cachePath] Path to cache file
     * @param {int} [options.cacheTime=5*24*60*60*1000] Time for cache in milliseconds. By default 5 days
     * to not use the cache but regenerate content (however resulting content still can be saved to the cache)
     */
    constructor(options){
        if (Array.isArray(options)){
            options = {sources: options};
        }

        if (!options.cacheTime){
            options.cacheTime = 5*24*60*60*1000;
        }

        if (!options.filters){
            options.filters = [];
        }

        this.options = options;
    }

    /**
     * @name FilterFunction
     * @function
     * @param {Object} stream Stream object
     * @param {string} [source] Source
     * @param {Object[]} [collected] Already collected streams for result
     * @return Either modified Stream Object of undefined. Undefined means that the stream should not be outputted in result.
     */

    /**
     * It is possible to use Pled in pair with [Express.js]{@link http://expressjs.com/}. Handles HTTP request.
     * Query string can have "force=true" (or request.query.force true) query parameter. This allows to force reload data (ignoring cache)
     * See `samples` directory for an example.
     */
    handleRequest(request, response){
        let loader = request.query.force ? executeNoCache : execute;

        loader()
            .then(content =>{
                //response.status(200);
                response.setHeader('Content-type', 'audio/x-mpegurl');
                response.setHeader("Content-Disposition", "attachment;filename=playlist.m3u");
                response.charset = 'UTF-8';
                response.write(content);
                response.end();
            })
            .catch(error => {
                response.status(500);
                response.send("Failed to generate the playlist.m3u. Error: "+error.message);
            });
    }

    /**
     * Processes play list sources and generates resulting playlist as string
     * If up to date cache content is available then cache will be returned without reloading
     * @returns {Promise<string>} Promise with a string value - content of m3u
     */
    execute(){
        if (!this.options.cachePath){
            return this.executeNoCache();
        }

        let obj = this;

        return this.loadCache()
            .then(cache => {
                if (cache.status == Pled.CACHE_STATUS_OK){
                    return cache.content;
                }

                return obj.executeNoCache();
            });
    }

    /**
     * Creates content from sources omitting cache
     * @returns {Promise<string>} Promise with a string value - content of m3u
     */
    executeNoCache(){
        let obj = this;
        return this._handleSourceTail(0, {tracks: []})
            .then(result => {
                let content = m3u.format(result);
                if (obj.options.cachePath){
                    obj.saveCache(content);
                }
                return content;
            });
    }

    /**
     * @typedef CacheStatus
     * @type Object
     * @property {Symbol} status Cache status: CACHE_STATUS_OK, CACHE_STATUS_MISSING, CACHE_STATUS_OUTDATED
     * @property {string} [content] Optional content. Specified only if cache status is CACHE_STATUS_OK
     */

    /**
     * Loads playlist from cache file.
     * @returns {Promise<CacheStatus>}
     */
    loadCache(){
        let options = this.options;

        if (!options.cachePath){
            return Promise.reject(new Error("Path to cache file not specified"));
        }

        return new Promise(function (resolve) {
            fs.stat(options.cachePath, (err, stat) => {
                if (err){
                    resolve({status : Pled.CACHE_STATUS_MISSING});
                    return;
                }

                let now = new Date();
                let age = now - stat.mtime;

                //console.log(`Cache time: ${options.cacheTime}, now: ${now}, file time: ${stat.mtime}, age: ${age}`);

                if (age > options.cacheTime){
                    resolve({status : Pled.CACHE_STATUS_OUTDATED});
                    return;
                }

                resolve(Pled.loadLocal(options.cachePath)
                    .then(content => {
                        return {status: Pled.CACHE_STATUS_OK, content: content};
                    }));
            });
        });
    }

    saveCache(content){
        let obj = this;
        return new Promise(
            function(resolve, reject){
                fs.writeFile(obj.options.cachePath, content, err => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
    }

    _handleSourceTail(sourceIdx, result){
        if (sourceIdx >= this.options.sources.length){
            return result;
        }

        let source = this.options.sources[sourceIdx];
        let obj = this;

        return this._handleSource(source, result)
            .then(function(){
                return obj._handleSourceTail(sourceIdx+1, result);
            });
    }

    _handleSource(source, result){
        let filters = this.options.filters;

        return Pled.loadSource(source)
         .then(content => {
                let parsed = m3u.parse(content);
                var filter;

                parsed.tracks.forEach(track => {
                    for(var idx in filters){
                        filter = filters[idx];

                        track = filter(track, source, result);

                        if (!track) break;
                    }

                    if (track){
                        result.tracks.push(track);
                    }
                });
            });
    }

    static loadLocal(path){
        return new Promise(
            function(resolve, reject) {
                fs.readFile(path, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
    }

    static loadRemote(url){
        return new Promise(
            function(resolve, reject){
                var req = http.get(urlParse(url), function (res) {
                    if (res.statusCode !== 200) {
                        reject(new Error("Http returned status: "+req.statusCode));
                        return;
                    }

                    var data = '';

                    res.on('data', function (chunk) {
                        data += chunk;
                    });
                    res.on('end', function () {
                        resolve(data);
                    });
                });

                req.on('error', function (e) {
                    reject(e);
                });
                req.end();
            }
        );
    }

    static loadSource(url){
        if (url.startsWith('http://')||url.startsWith('http://')){
            return Pled.loadRemote(url);
        }

        return Pled.loadLocal(url);
    }
}

Pled.CACHE_STATUS_OK = Symbol();
Pled.CACHE_STATUS_MISSING = Symbol();
Pled.CACHE_STATUS_OUTDATED = Symbol();

module.exports = Pled;