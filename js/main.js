document.addEventListener("DOMContentLoaded", () => {
  // Drag-to-scroll for screenshot strip
  const strip = document.querySelector(".screen-strip");
  if (strip) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const start = (clientX) => {
      isDown = true;
      startX = clientX - strip.getBoundingClientRect().left;
      scrollLeft = strip.scrollLeft;
    };

    const move = (clientX) => {
      if (!isDown) return;
      const x = clientX - strip.getBoundingClientRect().left;
      const walk = x - startX;
      strip.scrollLeft = scrollLeft - walk;
    };

    strip.addEventListener("mousedown", (e) => {
      e.preventDefault();
      start(e.clientX);
    });

    strip.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      move(e.clientX);
    });

    strip.addEventListener("mouseleave", () => {
      isDown = false;
    });

    strip.addEventListener("mouseup", () => {
      isDown = false;
    });

    // Touch support
    strip.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      start(e.touches[0].clientX);
    });

    strip.addEventListener("touchmove", (e) => {
      if (!isDown || e.touches.length !== 1) return;
      move(e.touches[0].clientX);
    });

    strip.addEventListener("touchend", () => {
      isDown = false;
    });
  }

  // Copy email button
  const copyBtn = document.getElementById("copy-email-btn");
  const emailEl = document.getElementById("contact-email");
  const statusEl = document.getElementById("copy-status");

  if (copyBtn && emailEl) {
    const emailText = emailEl.textContent.trim();

    const showStatus = (message) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      setTimeout(() => {
        statusEl.textContent = "";
      }, 2000);
    };

    const tryExecCommandCopy = () => {
      // Try execCommand copy using a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = emailText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      let ok = false;
      try {
        ok = document.execCommand && document.execCommand("copy");
      } catch (e) {
        ok = false;
      }

      document.body.removeChild(textarea);
      return ok;
    };

    const selectEmailElement = () => {
      const range = document.createRange();
      range.selectNodeContents(emailEl);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    };

    /* NEW: pressed visual state for copy button (works on mobile + desktop) */
    const setPressed = (pressed) => {
      if (pressed) {
        copyBtn.classList.add("is-pressed");
      } else {
        copyBtn.classList.remove("is-pressed");
      }
    };

    copyBtn.addEventListener("pointerdown", () => setPressed(true));
    copyBtn.addEventListener("pointerup", () => setPressed(false));
    copyBtn.addEventListener("pointerleave", () => setPressed(false));
    copyBtn.addEventListener("pointercancel", () => setPressed(false));
    copyBtn.addEventListener("blur", () => setPressed(false));
    /* END NEW */

    copyBtn.addEventListener("click", async () => {
      let copied = false;

      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(emailText);
          copied = true;
        } catch (err) {
          copied = false;
        }
      }

      // Fallback: execCommand
      if (!copied) {
        copied = tryExecCommandCopy();
      }

      if (copied) {
        showStatus("Copied");
        return;
      }

      // Last resort: select text and ask for manual copy
      try {
        selectEmailElement();
        showStatus("Copy manually");
      } catch (err) {
        showStatus("Failed");
      }
    });
  }
});
