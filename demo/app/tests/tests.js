var Tglib = require("nativescript-tglib").Tglib;
var tglib = new Tglib();

describe("greet function", function() {
    it("exists", function() {
        expect(tglib.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(tglib.greet()).toEqual("Hello, NS");
    });
});