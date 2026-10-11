// Exercise the actual submission handler with simulated transport responses.
// No requests are sent to Formspree.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { runInNewContext } = require("node:vm");

function setup(transport, { timeout = false, values = {} } = {}) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        dataset: {},
        attributes: {},
        listeners: {},
        children: [],
        textContent: "",
        value: "",
        disabled: false,
        hidden: true,
        classList: { toggle() {} },
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        getAttribute(name) {
          return this.attributes[name] || null;
        },
        removeAttribute(name) {
          delete this.attributes[name];
        },
        addEventListener(type, handler) {
          this.listeners[type] = handler;
        },
        querySelectorAll() {
          return [];
        },
        focus() {
          this.focused = true;
        },
        replaceChildren(...children) {
          this.children = children;
        },
        append(...children) {
          this.children.push(...children);
        },
        reportValidity() {
          return true;
        },
      });
    }
    return elements.get(id);
  }
  for (const [name, value] of Object.entries({
    name: "Test Visitor",
    email: "visitor@example.com",
    message: "A test note",
    ...values,
  }))
    element(name).value = value;
  const form = element("contact-form");
  form.action = "https://formspree.io/f/xblygbnn";
  form.resetCount = 0;
  form.reset = () => {
    form.resetCount++;
    ["name", "email", "message"].forEach((name) => {
      element(name).value = "";
    });
  };
  element(".case-toggle").attributes["aria-controls"] = "optum-case";
  let requests = 0;
  let sentData;
  const document = {
    documentElement: element("root"),
    querySelector(selector) {
      return element(selector.startsWith("#") ? selector.slice(1) : selector);
    },
    getElementById: element,
    createElement: () => element(Symbol()),
    createTextNode: (text) => ({ textContent: text }),
    addEventListener() {},
  };
  class MockFormData {
    constructor() {
      this.data = new Map(
        ["name", "email", "message"].map((name) => [name, element(name).value]),
      );
    }
    get(key) {
      return this.data.get(key);
    }
    set(key, value) {
      this.data.set(key, value);
    }
  }
  const media = { matches: false, addEventListener() {} };
  const source = readFileSync(join(__dirname, "..", "script.js"), "utf8");
  runInNewContext(source, {
    document,
    history: {},
    location: { hash: "" },
    navigator: {},
    Date,
    AbortController,
    FormData: MockFormData,
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    window: {
      matchMedia() {
        return media;
      },
      addEventListener() {},
      setTimeout(handler) {
        if (timeout) queueMicrotask(handler);
        return 1;
      },
      clearTimeout() {},
    },
    fetch: async (url, options) => {
      requests++;
      sentData = options.body;
      return transport(url, options);
    },
  });
  return {
    form,
    status: element("form-status"),
    button: element("submit-btn"),
    element,
    requests: () => requests,
    data: () => sentData,
    submit: () => form.listeners.submit({ preventDefault() {} }),
  };
}

for (const [label, transport] of [
  [
    "network failure",
    async () => {
      throw new TypeError("Failed to fetch");
    },
  ],
  [
    "HTTP error",
    async () => ({
      ok: false,
      json: async () => ({ errors: [{ message: "Unavailable" }] }),
    }),
  ],
  [
    "unconfirmed success",
    async () => ({ ok: true, json: async () => ({ ok: false }) }),
  ],
  [
    "invalid response",
    async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("Invalid JSON");
      },
    }),
  ],
]) {
  test(`${label} preserves the message and restores the button`, async () => {
    const app = setup(transport);
    await app.submit();
    assert.equal(app.form.resetCount, 0);
    assert.equal(app.element("message").value, "A test note");
    assert.equal(app.status.dataset.state, "error");
    assert.match(app.status.textContent, /couldn’t confirm delivery/);
    assert.equal(app.button.disabled, false);
    assert.ok(
      app.status.children.some(
        (child) => child.href === "mailto:rbolamala@gmail.com",
      ),
    );
  });
}

test("only confirmed success clears the form", async () => {
  const app = setup(async () => ({
    ok: true,
    json: async () => ({ ok: true }),
  }));
  await app.submit();
  assert.equal(app.form.resetCount, 1);
  assert.equal(app.element("message").value, "");
  assert.equal(app.status.dataset.state, "success");
  assert.equal(app.button.disabled, false);
});

test("whitespace-only fields are rejected before a request", async () => {
  const app = setup(
    async () => {
      throw new Error("Should not be called");
    },
    { values: { name: "   " } },
  );
  await app.submit();
  assert.equal(app.requests(), 0);
  assert.equal(app.element("name").focused, true);
  assert.equal(app.status.dataset.state, "error");
});

test("submitted data is trimmed", async () => {
  const app = setup(
    async () => ({ ok: true, json: async () => ({ ok: true }) }),
    { values: { message: "  A test note  " } },
  );
  await app.submit();
  assert.equal(app.data().get("message"), "A test note");
});

test("duplicate submission is blocked while a request is pending", async () => {
  let complete;
  const app = setup(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  );
  const pending = app.submit();
  assert.equal(app.button.disabled, true);
  await app.submit();
  assert.equal(app.requests(), 1);
  complete({ ok: true, json: async () => ({ ok: true }) });
  await pending;
  assert.equal(app.form.resetCount, 1);
});

test("timeout preserves the message without claiming success", async () => {
  const app = setup(
    (url, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => {
          const error = new Error("Timed out");
          error.name = "AbortError";
          reject(error);
        });
      }),
    { timeout: true },
  );
  await app.submit();
  assert.equal(app.form.resetCount, 0);
  assert.match(app.status.textContent, /timed out/);
  assert.equal(app.button.disabled, false);
});

test("the Formspree redirect response confirms success without an ok property", async () => {
  const app = setup(async () => ({
    ok: true,
    json: async () => ({ next: "/thanks" }),
  }));
  await app.submit();
  assert.equal(app.form.resetCount, 1);
  assert.equal(app.status.dataset.state, "success");
});

test("server validation errors never clear the form, even with HTTP 200", async () => {
  const app = setup(async () => ({
    ok: true,
    json: async () => ({
      next: "/thanks",
      errors: [{ message: "Invalid email" }],
    }),
  }));
  await app.submit();
  assert.equal(app.form.resetCount, 0);
  assert.equal(app.status.dataset.state, "error");
});
