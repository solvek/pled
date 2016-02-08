/**
 * Created by solvek on 08.02.16.
 */

"use strict";

class Pled{
    /**
     * @param {Object|string[]} options Pled options object or array of sources
     * @param {string[]} options.sources Sources of m3u files. Each source is either a path to local file of a url to an http file (starting from "http://" or "https://")
     * @param {FilterFunction[]} [options.filters] Sequence of filters
     */
    constructor(options){
        if (Array.isArray(options)){
            options = {sources: options};
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
}

exports.module = Pled;