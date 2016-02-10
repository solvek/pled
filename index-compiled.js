/**
 * Created by solvek on 08.02.16.
 */

"use strict";

var fs = require('fs');

var http = require("http");
var urlParse = require("url").parse;

class Pled {
    /**
     * @param {Object|string[]} options Pled options object or array of sources
     * @param {string[]} options.sources Sources of m3u files. Each source is either a path
     * to local file of a url to an http file (starting from "http://" or "https://")
     * @param {FilterFunction[]} [options.filters] Sequence of filters
     * @param {string} [options.cachePath] Path to cache file
     * @param {int} [options.cacheTime=5*24*60*60*1000] Time for cache in milliseconds. By default 5 days
     * @param {boolean} [options.forceReload] If cache file is specified this parameter allows
     * to not use the cache but regenerate content (however resulting content still can be saved to the cache)
     */
    constructor(options) {
        if (Array.isArray(options)) {
            options = { sources: options };
        }

        if (!options.cacheTime) {
            options.cacheTime = 5 * 24 * 60 * 60 * 1000;
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
     * See `samples` directory for an example.
     */
    handleRequest(request, response) {}

    /**
     * Processes play list sources and generates resulting playlist as string
     * @returns Promise with a string value - content of m3u
     */
    execute() {}

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
    loadCache() {
        let options = this.options;

        if (!options.cachePath) {
            return Promise.reject(new Error("Path to cache file not specified"));
        }

        return new Promise(function (resolve) {
            fs.stat(options.cachePath, (err, stat) => {
                if (err) {
                    resolve({ status: Pled.CACHE_STATUS_MISSING });
                    return;
                }

                let now = new Date();
                let age = now - stat.mtime;

                //console.log(`Cache time: ${options.cacheTime}, now: ${now}, file time: ${stat.mtime}, age: ${age}`);

                if (age > options.cacheTime) {
                    resolve({ status: Pled.CACHE_STATUS_OUTDATED });
                    return;
                }

                resolve(Pled.loadLocal(options.cachePath).then(content => {
                    return { status: Pled.CACHE_STATUS_OK, content: content };
                }));
            });
        });
    }

    static loadLocal(path) {
        return new Promise(function (resolve, reject) {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    static loadRemote(url) {
        return new Promise(function (resolve, reject) {
            var req = http.get(urlParse(url), function (res) {
                if (res.statusCode !== 200) {
                    reject(new Error("Http returned status: " + req.statusCode));
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
        });
    }

    static loadSource(url) {
        if (url.startsWith('http://') || url.startsWith('http://')) {
            return Pled.loadRemote(url);
        }

        return Pled.loadLocal(url);
    }
}

Pled.CACHE_STATUS_OK = Symbol();
Pled.CACHE_STATUS_MISSING = Symbol();
Pled.CACHE_STATUS_OUTDATED = Symbol();

module.exports = Pled;

//# sourceMappingURL=index-compiled.js.map