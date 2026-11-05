const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const pathEl = document.getElementById("path");
if (pathEl) pathEl.textContent = location.pathname;


// show more projects
(function () {
  const btn = document.getElementById("show-more-projects");
  const list = document.getElementById("project-list");
  if (!btn || !list) return;

  btn.addEventListener("click", () => {
    const expanded = list.classList.toggle("is-expanded");
    btn.textContent = expanded ? "show less" : "show more";
    btn.dataset.expanded = String(expanded);
  });
})();

// terminal typing — fixed Currently: + cycling roles
(function () {
  const el = document.getElementById("typer");
  const fixed = document.getElementById("term-fixed");
  if (!el || !fixed) return;

  const roles =
    window.CURRENT_ROLES && window.CURRENT_ROLES.length
      ? window.CURRENT_ROLES
      : [];

  // No roles configured — hide the terminal line instead of typing placeholder text.
  if (!roles.length) {
    const term = el.closest(".term");
    if (term) term.style.display = "none";
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fixed.textContent = "Currently: ";
    el.textContent = roles.join(" · ");
    return;
  }

  const typeInto = (node, text, onDone) => {
    let i = 0;
    node.textContent = "";
    const step = () => {
      i++;
      node.textContent = text.slice(0, i);
      if (i >= text.length) return onDone();
      setTimeout(step, 36 + Math.random() * 40);
    };
    step();
  };

  const deleteFrom = (node, onDone) => {
    const step = () => {
      const t = node.textContent;
      if (!t.length) return onDone();
      node.textContent = t.slice(0, -1);
      setTimeout(step, 28);
    };
    step();
  };

  let i = 0;

  const nextRole = () => {
    typeInto(el, roles[i], () => {
      setTimeout(() => {
        deleteFrom(el, () => {
          i = (i + 1) % roles.length;
          setTimeout(nextRole, 280);
        });
      }, 2000);
    });
  };

  // type Currently: once, then keep it forever
  typeInto(fixed, "Currently: ", nextRole);
})();

// scroll reveal
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
})();

// contact form — submit to the configured Formspree endpoint
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const select = document.getElementById("purpose-select") || form.querySelector("[data-select]");
  const trigger = document.getElementById("purpose-trigger");
  const menu = document.getElementById("purpose-menu") || select?.querySelector(".purpose-menu");
  const valueEl = document.getElementById("purpose-placeholder") || select?.querySelector(".purpose-value");
  const hidden = document.getElementById("contact-purpose");
  const status = document.getElementById("contact-status");
  const sendBtn = document.getElementById("contact-send");
  const options = menu ? [...menu.querySelectorAll('[role="option"]')] : [];
  let isOpen = false;
  const setStatus = (msg, kind) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle("is-error", kind === "error");
    status.classList.toggle("is-ok", kind === "ok");
  };
  const resetPlaceholder = () => {
    if (!valueEl) return;
    valueEl.dataset.placeholder = "true";
    valueEl.textContent = "Select a purpose";
  };
  const emailField = document.getElementById("contact-email");
  const messageField = document.getElementById("contact-message");
  const clearInvalid = (field) => {
    field?.removeAttribute("aria-invalid");
    field?.removeAttribute("aria-describedby");
  };
  const markInvalid = (field, message) => {
    setStatus(message, "error");
    field?.setAttribute("aria-invalid", "true");
    field?.setAttribute("aria-describedby", "contact-status");
    field?.focus();
  };
  [emailField, messageField].forEach((field) => {
    field?.addEventListener("input", () => clearInvalid(field));
  });

  const closeMenu = () => {
    if (!select || !trigger || !menu) return;
    isOpen = false;
    select.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };

  const openMenu = () => {
    if (!select || !trigger || !menu) return;
    isOpen = true;
    select.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    (options.find((o) => o.getAttribute("aria-selected") === "true") || options[0])?.focus();
  };

  const choose = (option) => {
    if (!option || !valueEl || !hidden) return;
    clearInvalid(trigger);
    options.forEach((o) => o.setAttribute("aria-selected", "false"));
    option.setAttribute("aria-selected", "true");
    valueEl.textContent = option.textContent.trim();
    valueEl.dataset.placeholder = "false";

    hidden.value = option.getAttribute("data-value") || option.dataset.value || "";
    closeMenu();
    trigger?.focus();
  };

  trigger?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) closeMenu();
    else openMenu();
  });

  trigger?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
      if (e.key === "ArrowUp") options[options.length - 1]?.focus();
    }
  });
  select?.addEventListener("focusout", (e) => {
    if (!select.contains(e.relatedTarget)) closeMenu();
  });

  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      choose(option);
    });
    option.addEventListener("keydown", (e) => {
      const i = options.indexOf(option);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        options[(i + 1) % options.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        options[(i - 1 + options.length) % options.length]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose(option);
      } else if (e.key === "Escape") {
        closeMenu();
        trigger?.focus();
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!isOpen) return;
    if (select && !select.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
      trigger?.focus();
    }
  });

  if (!hidden?.value) resetPlaceholder();

  let submitting = false;
  const captcha = document.getElementById("contact-captcha");
  let captchaToken = "";
  let captchaId = null;
  const captchaStatus = document.getElementById("captcha-status");
  const setCaptchaStatus = (message) => {
    if (!captchaStatus) return;
    captchaStatus.textContent = message;
    captchaStatus.classList.toggle("is-error", Boolean(message));
  };
  if (captcha) {
    if (window.turnstile) {
      try {
        captchaId = window.turnstile.render("#contact-captcha", {
          sitekey: captcha.dataset.sitekey,
          theme: "dark",
          size: "compact",
          callback: (token) => { captchaToken = token; setCaptchaStatus(""); },
          "expired-callback": () => {
            captchaToken = "";
            setCaptchaStatus("Verification expired. Please complete the anti-spam check again.");
          },
          "timeout-callback": () => {
            captchaToken = "";
            setCaptchaStatus("Verification timed out. Please try the anti-spam check again.");
          },
          "error-callback": () => {
            captchaToken = "";
            setCaptchaStatus("Verification could not load. Please reload the page or contact me through LinkedIn or X.");
          },
        });
      } catch {
        setCaptchaStatus("Verification could not start. Please reload the page or use the social links below.");
      }
    } else {
      setCaptchaStatus("Verification could not load. Please reload the page or use the social links below.");
    }
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting) return;
    const email = (document.getElementById("contact-email")?.value || "").trim();
    const purpose = (hidden?.value || "").trim();
    const purposeLabel = valueEl?.dataset.placeholder === "true"
      ? ""
      : (valueEl?.textContent || "").trim();
    const message = (document.getElementById("contact-message")?.value || "").trim();

    [emailField, trigger, messageField].forEach(clearInvalid);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markInvalid(emailField, "Please enter a valid email.");
      return;
    }
    if (!purpose) {
      markInvalid(trigger, "Please select a purpose.");
      openMenu();
      return;
    }
    if (!message) {
      markInvalid(messageField, "Please add a short description.");
      return;
    }

    if (captcha && !captchaToken) {
      setStatus("", "");
      setCaptchaStatus("Please complete the anti-spam verification. If it does not appear, reload the page or use the social links below.");
      return;
    }
    const payload = { email, purpose: purposeLabel || purpose, message };
    if (captcha) payload["cf-turnstile-response"] = captchaToken;
    submitting = true;
    const label = sendBtn?.querySelector(".send-label");
    const controls = [sendBtn, trigger, document.getElementById("contact-email"), document.getElementById("contact-message")].filter(Boolean);
    controls.forEach((control) => { control.disabled = true; });
    closeMenu();
    form.setAttribute("aria-busy", "true");
    sendBtn?.classList.remove("is-sent");
    sendBtn?.classList.add("is-sending");
    if (label) label.textContent = "Sending…";
    setStatus("Sending your message…", "");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        setStatus(response.status === 429
          ? "Too many requests. Please try again later or contact me through LinkedIn or X."
          : "Your message could not be sent. Please try again later or contact me through LinkedIn or X.", "error");
        return;
      }
      form.reset();
      if (hidden) hidden.value = "";
      options.forEach((option) => option.setAttribute("aria-selected", "false"));
      if (valueEl) valueEl.dataset.placeholder = "true";
      resetPlaceholder();
      sendBtn?.classList.add("is-sent");
      setStatus("Thank you! Your message has been submitted successfully.", "ok");
    } catch {
      setStatus("Delivery could not be confirmed. Your text is still here; please try again later or contact me through LinkedIn or X.", "error");
    } finally {
      clearTimeout(timeout);
      if (captcha) {
        captchaToken = "";
        try {
          if (captchaId !== null && window.turnstile) window.turnstile.reset(captchaId);
        } catch {
          // Keep the form usable for recovery; an empty token still blocks submission.
        }
      }
      submitting = false;
      controls.forEach((control) => { control.disabled = false; });
      form.setAttribute("aria-busy", "false");
      sendBtn?.classList.remove("is-sending");
      if (label) label.textContent = "Send message";
    }
  });
})();

// site views counter (optional — requires [params.siteviews] with count_url)
(function () {
  const siteViews = document.getElementById("site-views");
  const countEl = document.getElementById("site-views-count");

  if (!siteViews || !countEl) return;

  const countUrl = siteViews.dataset.countUrl;
  if (!countUrl) return;

  const label = countEl.textContent.replace(/^--\s*/, "") || "Site Views";

  fetch(countUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch site views");
      return response.json();
    })
    .then((data) => {
      if (typeof data.count === "number") {
        countEl.textContent = `${data.count} ${label}`;
        siteViews.classList.add("connected");
      }
    })
    .catch(() => {
      countEl.textContent = `-- ${label}`;
      siteViews.classList.remove("connected");
    });
})();

// active nav on scroll
(function () {
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const ids = navLinks
    .map((a) => (a.getAttribute("href") || "").split("#")[1])
    .filter((id) => id && document.getElementById(id));
  if (!ids.length) return;
  if (!ids.includes("home") && document.getElementById("home")) ids.unshift("home");

  const onScroll = () => {
    let current = "home";
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.getBoundingClientRect().top <= 100) current = id;
    });
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", href.endsWith(`#${current}`));
    });
  };

  if (!document.getElementById("home")) return;

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
