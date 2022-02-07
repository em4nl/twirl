var fs = require("fs");
require("../src/twirl");
var twirl = window.twirl;

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

var mockAjaxTimeout = 0;
var mockAjaxFail = false;
var mockAjaxCalls = [];

function mockAjax(href, callback) {
  var mockXHR = {
    aborted: false,
    abort: function () {
      this.aborted = true;
    },
  };
  setTimeout(function () {
    if (mockAjaxFail) {
      callback(true, "");
    } else {
      callback(false, "");
    }
  }, mockAjaxTimeout);
  mockAjaxCalls.push({
    href: href,
    callback: callback,
    mockXHR: mockXHR,
  });
  return mockXHR;
}

window.ajax = mockAjax;

beforeAll(function () {
  var bodyStartHTML = fs.readFileSync("./tests/body-start.html");
  document.body.classList.add("page-type-0");
  document.body.innerHTML = bodyStartHTML;
});

test("registering routes does not throw", function () {
  expect(function () {
    twirl("page-type-0", function (body) {
      if (body) {
        callCounters.pageType0.withBody++;
      } else {
        callCounters.pageType0.withoutBody++;
      }
    });
    twirl("page-type-1", function (body) {
      if (body) {
        callCounters.pageType1.withBody++;
      } else {
        callCounters.pageType1.withoutBody++;
      }
    });
    twirl("page-type-2", function (body) {
      if (body) {
        callCounters.pageType2.withBody++;
      } else {
        callCounters.pageType2.withoutBody++;
      }
    });
    twirl("page-type-3", function (body) {
      if (body) {
        callCounters.pageType3.withBody++;
      } else {
        callCounters.pageType3.withoutBody++;
      }
    });
  }).not.toThrow();
});

test("initial dispatch calls right callback", function () {
  resetCallCounters();
  twirl.start();
  expect(callCounters.pageType0.withoutBody).toBe(1);
  expect(callCounters.pageType0.withBody).toBe(0);
  expect(callCounters.pageType1.withoutBody).toBe(0);
  expect(callCounters.pageType1.withBody).toBe(0);
  expect(callCounters.pageType2.withoutBody).toBe(0);
  expect(callCounters.pageType2.withBody).toBe(0);
  expect(callCounters.pageType3.withoutBody).toBe(0);
  expect(callCounters.pageType3.withBody).toBe(0);
  resetCallCounters();
  document.body.classList.remove("page-type-0");
  document.body.classList.add("page-type-1");
  twirl.start();
  expect(callCounters.pageType0.withoutBody).toBe(0);
  expect(callCounters.pageType0.withBody).toBe(0);
  expect(callCounters.pageType1.withoutBody).toBe(1);
  expect(callCounters.pageType1.withBody).toBe(0);
  expect(callCounters.pageType2.withoutBody).toBe(0);
  expect(callCounters.pageType2.withBody).toBe(0);
  expect(callCounters.pageType3.withoutBody).toBe(0);
  expect(callCounters.pageType3.withBody).toBe(0);
  resetCallCounters();
  document.body.classList.remove("page-type-1");
  document.body.classList.add("zamperoni");
  document.body.classList.add("cabrio");
  document.body.classList.add("gehaltsvorstellungen");
  document.body.classList.add("page-type-3");
  document.body.classList.add("wurmrausch");
  twirl.start();
  expect(callCounters.pageType0.withoutBody).toBe(0);
  expect(callCounters.pageType0.withBody).toBe(0);
  expect(callCounters.pageType1.withoutBody).toBe(0);
  expect(callCounters.pageType1.withBody).toBe(0);
  expect(callCounters.pageType2.withoutBody).toBe(0);
  expect(callCounters.pageType2.withBody).toBe(0);
  expect(callCounters.pageType3.withoutBody).toBe(1);
  expect(callCounters.pageType3.withBody).toBe(0);
});

test("clicking link will fire route", function () {
  var link1 = document.querySelector(".first-link");
  mockAjaxCalls = [];
  link1.dispatchEvent(new Event("click", { bubbles: true }));
  expect(mockAjaxCalls.length).toBe(1);
});
