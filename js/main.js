// Progressive enhancement: without JavaScript the navigation links stay visible,
// and the enquiry form falls back to the browser's own mailto handling.

document.documentElement.classList.add("js");

// Mobile navigation: a disclosure button that shows and hides the link list.
(() => {
  const header = document.querySelector(".site-header");
  const toggle = header?.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!header || !toggle || !nav) return;

  const desktop = window.matchMedia("(min-width: 62rem)");
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    header.toggleAttribute("data-nav-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && !header.contains(event.target)) setOpen(false);
  });

  header.addEventListener("focusout", (event) => {
    if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });

  desktop.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
})();

// Active navigation: marks the link for the section crossing the middle of the screen.
(() => {
  const links = [...document.querySelectorAll('.nav-list a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = links.find((item) => item.hash === `#${entry.target.id}`);
      if (entry.isIntersecting) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-50% 0px -50% 0px" });

  sections.forEach((section) => observer.observe(section));
})();

// Enquiry form: validates, then composes an email in the visitor's own mail app.
(() => {
  const form = document.getElementById("enquiry");
  if (!form) return;

  const ADDRESS = "nikhilmodi9638@gmail.com";
  const MAX_MAILTO_LENGTH = 1800; // Some browsers and mail apps cut off longer links.

  const result = document.getElementById("form-result");
  const resultText = document.getElementById("form-result-text");
  const message = document.getElementById("form-message");
  const retry = document.getElementById("retry-email");
  const copyStatus = document.getElementById("copy-status");
  const messages = {
    "f-name": "Enter your name.",
    "f-email": "Enter an email address like name@company.com.",
    "f-company": "Enter your business name.",
    "f-industry": "Choose an industry, or choose Other.",
    "f-type": "Choose what you want to build, or choose Not sure yet.",
    "f-description": "Describe your project in a sentence or two.",
  };

  form.noValidate = true;

  // Service, industry and case-study links preselect the matching form option.
  document.querySelectorAll("[data-project-type], [data-industry]").forEach((link) => {
    link.addEventListener("click", () => {
      const field = link.dataset.projectType ? form.elements.project_type : form.elements.industry;
      field.value = link.dataset.projectType || link.dataset.industry;
      clearError(field);
    });
  });

  function errorFor(field) {
    return document.getElementById(`${field.id}-error`);
  }

  function describedBy(field, withError) {
    const ids = (field.getAttribute("aria-describedby") || "").split(" ").filter((id) => id && id !== `${field.id}-error`);
    if (withError) ids.push(`${field.id}-error`);
    if (ids.length) field.setAttribute("aria-describedby", ids.join(" "));
    else field.removeAttribute("aria-describedby");
  }

  function clearError(field) {
    const error = errorFor(field);
    if (!error) return;
    error.hidden = true;
    error.textContent = "";
    field.removeAttribute("aria-invalid");
    describedBy(field, false);
  }

  function validate(field) {
    if (!messages[field.id]) return true;
    field.value = field.tagName === "SELECT" ? field.value : field.value.trim();
    if (field.checkValidity()) {
      clearError(field);
      return true;
    }
    const error = errorFor(field);
    error.textContent = messages[field.id];
    error.hidden = false;
    field.setAttribute("aria-invalid", "true");
    describedBy(field, true);
    return false;
  }

  [...form.elements].forEach((field) => {
    if (!messages[field.id]) return;
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid")) validate(field);
    });
  });

  function buildBody(data) {
    const lines = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Business name: ${data.get("company")}`,
      `Industry: ${data.get("industry")}`,
      `Wants to build: ${data.get("project_type")}`,
    ];
    if (data.get("budget").trim()) lines.push(`Budget: ${data.get("budget").trim()}`);
    if (data.get("timeline").trim()) lines.push(`Expected timeline: ${data.get("timeline").trim()}`);
    lines.push("", "Project description:", data.get("description"));
    return lines.join("\r\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const fields = [...form.elements].filter((field) => messages[field.id]);
    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    const body = buildBody(data);
    const base = `mailto:${ADDRESS}?subject=${encodeURIComponent(`Project enquiry from ${data.get("company")}`)}`;
    const full = `${base}&body=${encodeURIComponent(body)}`;
    const fits = full.length <= MAX_MAILTO_LENGTH;
    const link = fits ? full : `${base}&body=${encodeURIComponent("Please see my enquiry below:\r\n\r\n")}`;

    message.value = body;
    retry.href = link;
    copyStatus.textContent = "";
    resultText.textContent = fits
      ? `Your mail app should open with this enquiry filled in. Press send there to deliver it. If nothing opened, copy the message and email it to ${ADDRESS}.`
      : `This enquiry is too long to fill in automatically. Copy the message, paste it into the email that opens, and press send. If nothing opened, email it to ${ADDRESS}.`;
    result.hidden = false;
    result.focus();

    window.location.href = link;
  });

  document.getElementById("copy-message").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      copyStatus.textContent = "Message copied.";
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = "Message selected. Press Ctrl+C or Cmd+C to copy it.";
    }
  });
})();
