/**
 * Created by solvek on 08.02.16.
 */
"use strict";

let should = require('chai').should();
let nock = require('nock');

let Pled = require('../index');

describe("Pled utils", function(){
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
                content.should.be.equal('Remote response');
            });
    });
});