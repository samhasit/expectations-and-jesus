(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navScroller = document.querySelector(".section-nav__scroll");
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const pageProgress = document.querySelector(".reading-progress span");

  function centerNavLinkHorizontally(link) {
    if (!navScroller) return;

    const linkRect = link.getBoundingClientRect();
    const scrollerRect = navScroller.getBoundingClientRect();
    const edgePadding = 16;
    const isOutside =
      linkRect.left < scrollerRect.left + edgePadding ||
      linkRect.right > scrollerRect.right - edgePadding;

    if (!isOutside) return;

    const centeredLeft =
      navScroller.scrollLeft +
      (linkRect.left - scrollerRect.left) -
      (scrollerRect.width - linkRect.width) / 2;

    navScroller.scrollTo({
      left: Math.max(0, centeredLeft),
      behavior: reducedMotion ? "auto" : "smooth"
    });
  }

  function setActiveSection(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.dataset.nav === sectionId;
      if (isActive) {
        link.setAttribute("aria-current", "true");
        centerNavLinkHorizontally(link);
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-24% 0px -58% 0px", threshold: [0, 0.05, 0.15] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  let progressFrame;
  function updatePageProgress() {
    cancelAnimationFrame(progressFrame);
    progressFrame = requestAnimationFrame(() => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const value = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
      pageProgress.style.width = `${value * 100}%`;
    });
  }

  window.addEventListener("scroll", updatePageProgress, { passive: true });
  window.addEventListener("resize", updatePageProgress);
  updatePageProgress();

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveSection(link.dataset.nav));
  });

  const auditContent = {
    comfort: {
      title: "Comfort is a gift, not the measure of his love.",
      copy: "Jesus cares about suffering, but he never makes an easy life the proof that we belong to him. The cross prevents us from equating love with the absence of pain.",
      question: "Can I trust Jesus’ love without using comfort as the evidence?"
    },
    control: {
      title: "Trust does not require seeing the whole route.",
      copy: "We may ask Jesus for guidance while quietly demanding control. Faith can move forward with enough light for the next faithful step, even when the ending remains hidden.",
      question: "What would trust look like if I never received the full explanation?"
    },
    timeline: {
      title: "Delay is not the same as indifference.",
      copy: "A delayed answer can feel like a verdict on God’s care. Scripture gives us language for waiting, lament, and persistent prayer without promising that every good desire will arrive on our schedule.",
      question: "Have I turned my preferred timing into a test of God’s goodness?"
    },
    success: {
      title: "The cross changes how we recognize victory.",
      copy: "Jesus’ apparent defeat became the place of his triumph. Visible success can be a gift, but failure, weakness, or loss cannot automatically tell us whether God is present and at work.",
      question: "Am I measuring faithfulness by results Jesus never promised?"
    },
    relief: {
      title: "Jesus meets a need deeper than immediate relief.",
      copy: "It is right to ask for rescue from suffering. Jesus also frees us from sin and death, gives his Spirit, and promises resurrection, gifts no temporary change can replace.",
      question: "Can I ask boldly for relief while receiving the deeper rescue already given?"
    }
  };

  const auditTitle = document.getElementById("audit-title");
  const auditCopy = document.getElementById("audit-copy");
  const auditQuestion = document.getElementById("audit-question");

  document.querySelectorAll("[data-audit]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = auditContent[button.dataset.audit];
      document.querySelectorAll("[data-audit]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      auditTitle.textContent = selected.title;
      auditCopy.textContent = selected.copy;
      auditQuestion.textContent = selected.question;
    });
  });

  const surrenderResponse = document.querySelector(".surrender-response");
  const surrenderButtons = [...document.querySelectorAll(".surrender-item > button")];
  surrenderButtons.forEach((button) => {
    const question = button.parentElement.querySelector("p").textContent.trim();
    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      surrenderButtons.forEach((item) => item.setAttribute("aria-expanded", "false"));
      button.setAttribute("aria-expanded", String(willOpen));
      surrenderResponse.textContent = willOpen
        ? question
        : "Start with the question that feels hardest to answer.";
    });
  });

  const questionCards = [...document.querySelectorAll("[data-question]")];
  questionCards.forEach((card, index) => {
    const button = card.querySelector("button");
    const followUp = card.querySelector("p");
    followUp.id = `followup-${index + 1}`;
    button.setAttribute("aria-controls", followUp.id);

    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(willOpen));
      button.childNodes[0].nodeValue = willOpen ? "Hide follow-up " : "Show follow-up ";
      followUp.hidden = !willOpen;
    });
  });

  const dialog = document.getElementById("discussion-dialog");
  if (!dialog || !questionCards.length) return;

  const questions = questionCards.map((card) => ({
    question: card.querySelector("h3").textContent.trim(),
    followUp: card.querySelector("p").textContent.trim()
  }));
  const count = document.getElementById("dialog-count");
  const dialogQuestion = document.getElementById("dialog-question");
  const dialogFollowUp = document.getElementById("dialog-followup");
  const followUpButton = dialog.querySelector(".dialog-followup");
  const dialogProgress = dialog.querySelector(".dialog-progress span");
  const previousButton = dialog.querySelector("[data-dialog-prev]");
  const nextButton = dialog.querySelector("[data-dialog-next]");
  const closeButton = dialog.querySelector("[data-close-discussion]");
  let current = 0;
  let returnFocus = null;

  function renderQuestion() {
    const item = questions[current];
    count.textContent = `Question ${current + 1} of ${questions.length}`;
    dialogQuestion.textContent = item.question;
    dialogFollowUp.textContent = item.followUp;
    dialogFollowUp.hidden = true;
    followUpButton.setAttribute("aria-expanded", "false");
    followUpButton.childNodes[0].nodeValue = "Show a deeper follow-up ";
    dialogProgress.style.width = `${((current + 1) / questions.length) * 100}%`;
    previousButton.disabled = current === 0;
    nextButton.textContent = current === questions.length - 1 ? "Finish ✓" : "Next →";
    dialogQuestion.focus({ preventScroll: true });
  }

  function openDialog(event) {
    returnFocus = event.currentTarget;
    current = 0;
    renderQuestion();
    dialog.showModal();
    document.body.classList.add("dialog-open");
    closeButton.focus({ preventScroll: true });
  }

  function closeDialog() {
    dialog.close();
  }

  document.querySelectorAll("[data-open-discussion]").forEach((button) => {
    button.addEventListener("click", openDialog);
  });

  closeButton.addEventListener("click", closeDialog);

  previousButton.addEventListener("click", () => {
    if (current > 0) {
      current -= 1;
      renderQuestion();
    }
  });

  nextButton.addEventListener("click", () => {
    if (current < questions.length - 1) {
      current += 1;
      renderQuestion();
    } else {
      closeDialog();
    }
  });

  followUpButton.addEventListener("click", () => {
    const willOpen = followUpButton.getAttribute("aria-expanded") !== "true";
    followUpButton.setAttribute("aria-expanded", String(willOpen));
    followUpButton.childNodes[0].nodeValue = willOpen
      ? "Hide the deeper follow-up "
      : "Show a deeper follow-up ";
    dialogFollowUp.hidden = !willOpen;
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    returnFocus?.focus({ preventScroll: true });
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && current < questions.length - 1) {
      current += 1;
      renderQuestion();
    }
    if (event.key === "ArrowLeft" && current > 0) {
      current -= 1;
      renderQuestion();
    }
  });
})();
