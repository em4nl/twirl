require("../src/turbo");
var turbo = window.turbo;

test("xyz", function () {
  turbo("test", function () {});
  turbo.start();
});
