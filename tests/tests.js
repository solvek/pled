/**
 * Created by solvek on 08.02.16.
 */
"use strict";

let should = require('chai').should();
let assert = require('chai').assert;

let nock = require('nock');

let Pled = require('../index');

describe("Pled utils", function(){
    it("should create pled with sources", function(){
       let pled = new Pled(['source1', 'source2']);

        pled.options.should.be.an('object');
        pled.options.should.have.hasOwnProperty('sources');
        pled.options.sources.should.be.an('array');
        pled.options.sources.length.should.equal(2);
        pled.options.sources[0].should.equal('source1');
        pled.options.sources[1].should.equal('source2');
    });

    it("should load local file", function(){
        return Pled.loadLocal('simplefile.txt')
            .then(fileContent => {
                fileContent.should.be.equal('simple text');
            });
    });

    it("should load remote file", function(){
        let remote = nock('http://solvek.com')
            .get('/playlist.m3u')
            .reply(200, 'Remote response');

        return Pled.loadRemote('http://solvek.com/playlist.m3u')
            .then(content => {
                assert(remote.isDone, "HTTP request must be already completed");
                content.should.be.equal('Remote response');
            });
    });

    it("should load source", function() {
        let promise1 = Pled.loadSource('simplefile.txt')
            .then(fileContent => {
                fileContent.should.be.equal('simple text');
            });

        let remote = nock('http://solvek.com')
            .get('/playlist.m3u')
            .reply(200, 'Remote response');

        let promise2 = Pled.loadSource('http://solvek.com/playlist.m3u')
            .then(content => {
                assert(remote.isDone, "HTTP request must be already completed");
                content.should.be.equal('Remote response');
            });

        return Promise.all([promise1, promise2]);
    });
});

describe("Loading cache", function(){
    let fs = require('fs');

    it("should fail loading from cache if cachePath not specified", function(){
        let pled = new Pled(['ddddd']);

        return pled.loadCache()
            .then(function(){
                assert.fail("Success", "Error");
            })
            .catch(err => {
                err.message.should.be.equal("Path to cache file not specified");
            });
    });

    it("loading non existing cache file", function() {
        let pled = new Pled({
            sources: ['ddddd'],
            cachePath: 'nonexisting.file'
        });

        return pled.loadCache()
            .then(cache => {
                cache.should.be.an('object');
                cache.should.have.ownProperty('status');
                assert.isTrue(cache.status == Pled.CACHE_STATUS_MISSING);
                assert.isUndefined(cache.content);
            });
    });

    it("loading outdating cache file", function() {
        let stat = fs.statSync('simplefile.txt');

        let pled = new Pled({
            sources: ['ddddd'],
            cachePath: 'simplefile.txt',
            cacheTime: (new Date()-stat.mtime)/2
        });

        return pled.loadCache()
            .then(cache => {
                cache.should.be.an('object');
                cache.should.have.ownProperty('status');
                assert.isTrue(cache.status == Pled.CACHE_STATUS_OUTDATED);
                assert.isUndefined(cache.content);
            });
    });

    it("loading up-to-date cache file", function() {
        let stat = fs.statSync('simplefile.txt');

        let pled = new Pled({
            sources: ['ddddd'],
            cachePath: 'simplefile.txt',
            cacheTime: stat.mtime*2
        });

        return pled.loadCache()
            .then(cache => {
                cache.should.be.an('object');
                cache.should.have.ownProperty('status');
                assert.isTrue(cache.status == Pled.CACHE_STATUS_OK);
                cache.should.have.ownProperty('content');
                cache.content.should.be.equal('simple text');
            });
    });
});