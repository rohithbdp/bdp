"use strict";

// Undo the former site's manual restoration setting and respect shared section URLs.
history.scrollRestoration = "auto";
window.addEventListener("pageshow", () => {
  if (!location.hash) return;
  try {
    const target = document.getElementById(
      decodeURIComponent(location.hash.slice(1)),
    );
    if (target)
      requestAnimationFrame(() => {
        const headerHeight =
          document.querySelector(".site-header").offsetHeight;
        window.scrollTo({
          top:
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            24,
          behavior: "instant",
        });
      });
  } catch (error) {
    /* An invalid fragment should not interrupt the page. */
  }
});

const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function setTheme(dark) {
  root.dataset.theme = dark ? "dark" : "light";
  themeButton.setAttribute(
    "aria-label",
    dark ? "Switch to light theme" : "Switch to dark theme",
  );
  themeButton.setAttribute("aria-pressed", String(dark));
  themeColor.content = dark ? "#0a1224" : "#f8faff";
}
setTheme(root.dataset.theme === "dark");
themeButton.addEventListener("click", () => {
  const dark = root.dataset.theme !== "dark";
  setTheme(dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch (error) {
    /* Theme still works without storage. */
  }
});
systemTheme.addEventListener("change", (event) => {
  try {
    if (localStorage.getItem("theme")) return;
  } catch (error) {
    /* Follow system preference. */
  }
  setTheme(event.matches);
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function setMenu(open, restoreFocus = false) {
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenu(false);
  // Keep keyboard focus on the destination when the mobile link is hidden.
  if (wasOpen && link.hash) {
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  )
    setMenu(false, true);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) setMenu(false);
});
window.matchMedia("(min-width: 651px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

const navLinks = [...navigation.querySelectorAll("a")];
const navSections = navLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);
if ("IntersectionObserver" in window) {
  const visible = new Map();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        visible.set(entry.target.id, entry.isIntersecting),
      );
      const active = navSections.find((section) => visible.get(section.id));
      navLinks.forEach((link) => {
        if (active && link.hash === `#${active.id}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-15% 0px -45% 0px", threshold: 0 },
  );
  navSections.forEach((section) => observer.observe(section));
}

const contactForm = document.querySelector("#contact-form");
const submitButton = document.querySelector("#submit-btn");
const formStatus = document.querySelector("#form-status");
let submitting = false;
function showStatus(message, state) {
  formStatus.textContent = message;
  formStatus.dataset.state = state;
  if (state === "error") {
    formStatus.append(document.createTextNode(" You can also "));
    const fallback = document.createElement("a");
    fallback.href = "mailto:rbolamala@gmail.com";
    fallback.textContent = "email me directly";
    formStatus.append(fallback, document.createTextNode("."));
  }
}
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitting) return;
  const data = new FormData(contactForm);
  for (const key of ["name", "email", "message"]) {
    const value = String(data.get(key) || "").trim();
    if (!value) {
      showStatus("Please fill in your name, email, and message.", "error");
      document.getElementById(key).focus();
      return;
    }
    data.set(key, value);
  }
  if (!contactForm.reportValidity()) return;
  submitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  showStatus("Sending your message…", "pending");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const result = await response.json().catch(() => null);
    if (
      !response.ok ||
      !result ||
      result.ok === false ||
      result.errors?.length ||
      (result.ok !== true && typeof result.next !== "string")
    ) {
      throw new Error("Delivery was not confirmed");
    }
    showStatus(
      "Thanks for your note. Your message was sent successfully.",
      "success",
    );
    contactForm.reset();
  } catch (error) {
    const message =
      error.name === "AbortError"
        ? "The request timed out, so I couldn’t confirm delivery. Your message is still here."
        : "I couldn’t confirm delivery. Your message is still here; please try again.";
    showStatus(message, "error");
  } finally {
    window.clearTimeout(timeout);
    submitting = false;
    submitButton.disabled = false;
    submitButton.replaceChildren(document.createTextNode("Send message "));
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    submitButton.append(arrow);
  }
});
document.getElementById("year").textContent = String(new Date().getFullYear());

// Relative scope supports both a root domain and GitHub Pages project paths.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* The portfolio remains usable without offline caching. */
    });
  });
}
