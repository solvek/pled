/**
 * Created by solvek on 08.02.16.
 */
"use strict";

let util = require('util');

let should = require('chai').should();
let assert = require('chai').assert;

let nock = require('nock');
var m3u = require('m3ujs');

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

describe("Content generation", function(){
    it("should do simple merge", function(){
        let remote = nock('http://solvek.com')
            .get('/playlist.m3u')
            .reply(200, '#EXTM3U\n#EXTINF:0, Test from web\nhttp://stream.ua\n#EXTINF:50, Test from web2\nhttp://stream2.ua');

        let pled = new Pled(['test.m3u', 'http://solvek.com/playlist.m3u']);

        return pled.executeNoCache()
            .then(content => {
                let parsed = m3u.parse(content);

                parsed.should.be.an('object');

                let tracks = parsed.tracks;

                tracks.should.be.an('array');

                tracks.length.should.be.equal(5);
            });
    });

    it("should handle request", function(done){
        let pled = new Pled(['test.m3u']);

        let response = {
            setHeader: function () {
            },
            end: function () {
            },
            write: function (text) {
                //console.log(`Received http response: ${text}`);
                let parsed = m3u.parse(text);
                //console.log(`Parsed response: ${util.inspect(parsed)}`);
                parsed.should.be.an('object');
                parsed.should.have.ownProperty('tracks');
                parsed.tracks.should.be.an('array');
                parsed.tracks.length.should.equal(3);
                done();
            },
            status: function () {
            },
            send: function (text) {
                console.log("Sent content: " + text);
            }
        };

        pled.handleRequest({}, response);
    });
});

describe("Filters", function(){
    it("should replace for udp proxy", function(){
        let track = {file: 'udp://@226.226.1.7:1234'};

        let filter = Pled.filters.udpProxy('http://192.168.0.1:4000/udp/');

        let newTrack = filter(track);

        newTrack.file.should.be.equal('http://192.168.0.1:4000/udp/226.226.1.7:1234');
    });

    it("should run modifier for forStream", function(){
        let track1 = {file: 'file1'},
            track2 = {file: 'file2'};

        var track1Called = false,
            track2Called = false;

        let modifier = function(track){
            if (track.file == track1.file){
                track1Called = true;
                return 123;
            }
            if (track.file == track2.file){
                track2Called = true;
                return 456;
            }
        };

        let filter = Pled.filters.forStream('file1', modifier);

        assert(filter(track1), 123);
        let track2Returned = filter(track2);
        track2Returned.should.be.an('object');
        track2Returned.should.have.ownProperty('file');
        track2Returned.file.should.be.equal('file2');

        assert(track1Called, "Track 1 should be modified");
        assert(!track2Called, "Track 2 should not be modified");
    });

    it("should set image if no params", function(){
        let track = {};

        let newTrack = Pled.filters.setImage("some image")(track);

        track.should.have.ownProperty('params');
        track.params.should.have.ownProperty('logo');
        track.params.logo.should.be.equal('some image');
    });

    it("should replace image", function(){
        let track = {params: {logo: 'old image'}};

        let newTrack = Pled.filters.setImage("some image")(track);

        track.should.have.ownProperty('params');
        track.params.should.have.ownProperty('logo');
        track.params.logo.should.be.equal('some image');
    });
});