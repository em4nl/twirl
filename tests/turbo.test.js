var fs = require("fs");
require("../src/turbo");
var turbo = window.turbo;

var callCounters = {
  pageType0: {
    withBody: 0,
    withoutBody: 0,
  },
  pageType1: {
    withBody: 0,
    withoutBody: 0,
  },
  pageType2: {
    withBody: 0,
    withoutBody: 0,
  },
  pageType3: {
    withBody: 0,
    withoutBody: 0,
  },
};

function resetCallCounters() {
  callCounters.pageType0.withoutBody = 0;
  callCounters.pageType0.withBody = 0;
  callCounters.pageType1.withoutBody = 0;
  callCounters.pageType1.withBody = 0;
  callCounters.pageType2.withoutBody = 0;
  callCounters.pageType2.withBody = 0;
  callCounters.pageType3.withoutBody = 0;
  callCounters.pageType3.withBody = 0;
}

beforeAll(function () {
  var bodyStartHTML = fs.readFileSync("./tests/body-start.html");
  document.body.classList.add("page-type-0");
  document.body.innerHTML = bodyStartHTML;
});

test("registering routes does not throw", function () {
  expect(function () {
    turbo("page-type-0", function (body) {
      if (body) {
        callCounters.pageType0.withBody++;
      } else {
        callCounters.pageType0.withoutBody++;
      }
    });
    turbo("page-type-1", function (body) {
      if (body) {
        callCounters.pageType1.withBody++;
      } else {
        callCounters.pageType1.withoutBody++;
      }
    });
    turbo("page-type-2", function (body) {
      if (body) {
        callCounters.pageType2.withBody++;
      } else {
        callCounters.pageType2.withoutBody++;
      }
    });
    turbo("page-type-3", function (body) {
      if (body) {
        callCounters.pageType3.withBody++;
      } else {
        callCounters.pageType3.withoutBody++;
      }
    });
  }).not.toThrow();
});

test("initial dispatch calls right callback", function () {
  turbo.start();
  expect(callCounters.pageType0.withoutBody).toBe(1);
  expect(callCounters.pageType0.withBody).toBe(0);
  expect(callCounters.pageType1.withoutBody).toBe(0);
  expect(callCounters.pageType1.withBody).toBe(0);
  expect(callCounters.pageType2.withoutBody).toBe(0);
  expect(callCounters.pageType2.withBody).toBe(0);
  expect(callCounters.pageType3.withoutBody).toBe(0);
  expect(callCounters.pageType3.withBody).toBe(0);
  document.body.classList.remove("page-type-0");
  resetCallCounters();
  document.body.classList.add("page-type-1");
  turbo.start();
  expect(callCounters.pageType0.withoutBody).toBe(0);
  expect(callCounters.pageType0.withBody).toBe(0);
  expect(callCounters.pageType1.withoutBody).toBe(1);
  expect(callCounters.pageType1.withBody).toBe(0);
  expect(callCounters.pageType2.withoutBody).toBe(0);
  expect(callCounters.pageType2.withBody).toBe(0);
  expect(callCounters.pageType3.withoutBody).toBe(0);
  expect(callCounters.pageType3.withBody).toBe(0);
  document.body.classList.remove("page-type-1");
  resetCallCounters();
  document.body.classList.add("zamperoni");
  document.body.classList.add("cabrio");
  document.body.classList.add("gehaltsvorstellungen");
  document.body.classList.add("page-type-3");
  document.body.classList.add("wurmrausch");
  turbo.start();
  expect(callCounters.pageType0.withoutBody).toBe(0);
  expect(callCounters.pageType0.withBody).toBe(0);
  expect(callCounters.pageType1.withoutBody).toBe(0);
  expect(callCounters.pageType1.withBody).toBe(0);
  expect(callCounters.pageType2.withoutBody).toBe(0);
  expect(callCounters.pageType2.withBody).toBe(0);
  expect(callCounters.pageType3.withoutBody).toBe(1);
  expect(callCounters.pageType3.withBody).toBe(0);
});
