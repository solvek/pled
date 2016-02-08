/**
 * Created by solvek on 08.02.16.
 */
"use strict";

let should = require('chai').should();

let Pled = require('../index');

describe("Pled utils", function(){
    it("should load local file", function(){
        return Pled.loadLocal('simplefile.txt')
            .then(fileContent => {
                fileContent.should.be.equal('simple text');
            });
    });
});