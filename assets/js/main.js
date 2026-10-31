/* =========================================================
   Uroš Petrović – Portfolio scripts
   ========================================================= */

/* ---------- Skills data ----------
   icon: file name in assets/icons (svg) OR special: "fa:docker", "text:.NET"
   cat:  frontend | backend | tools
*/
const skillsData = [
    { name: "HTML",       icon: "htmlicon",       percent: 95, cat: "frontend" },
    { name: "CSS",        icon: "cssicon",        percent: 95, cat: "frontend" },
    { name: "JavaScript", icon: "javascripticon", percent: 90, cat: "frontend" },
    { name: "Bootstrap",  icon: "bootstrap",      percent: 90, cat: "frontend" },
    { name: "Tailwind",   icon: "tailwindicon",   percent: 75, cat: "frontend" },
    { name: "Sass",       icon: "sassicon",       percent: 80, cat: "frontend" },
    { name: "PHP",        icon: "phpicon",        percent: 80, cat: "backend" },
    { name: "Laravel",    icon: "laravelicon",    percent: 70, cat: "backend" },
    { name: "ASP.NET",    icon: "text:.NET",      percent: 65, cat: "backend" },
    { name: "C#",         icon: "csharpicon",     percent: 60, cat: "backend" },
    { name: "Java",       icon: "javaicon",       percent: 70, cat: "backend" },
    { name: "SQL",        icon: "sqlicon",        percent: 75, cat: "backend" },
    { name: "MySQL",      icon: "mysqlicon",      percent: 80, cat: "backend" },
    { name: "WordPress",  icon: "wordpressicon",  percent: 90, cat: "tools" },
    { name: "WooCommerce",icon: "wooicon",        percent: 85, cat: "tools" },
    { name: "Docker",     icon: "fa:docker",      percent: 60, cat: "tools" },
    { name: "Linux",      icon: "linuxicon",      percent: 55, cat: "tools" },
    { name: "GitHub",     icon: "fa:github",      percent: 90, cat: "tools" },
    { name: "Git",        icon: "fa:git-alt",     percent: 85, cat: "tools" }
];

function skillIcon(s) {
    if (s.icon.startsWith("fa:"))   return `<i class="fa-brands fa-${s.icon.slice(3)}" aria-hidden="true"></i>`;
    if (s.icon.startsWith("text:")) return `<span class="dotnet-badge">${s.icon.slice(5)}</span>`;
    return `<img src="assets/icons/${s.icon}.svg" alt="${s.name}" loading="lazy">`;
}

function renderSkills() {
    const grid = document.querySelector(".skills-grid");
    if (!grid) return;
    grid.innerHTML = skillsData.map((s, i) => `
        <div class="skill-card" data-cat="${s.cat}" data-reveal style="--reveal-delay:${(i % 4) * 0.07}s">
            <div class="skill-icon-wrap">${skillIcon(s)}</div>
            <div class="skill-head">
                <span class="skill-name">${s.name}</span>
                <span class="skill-percent" data-target="${s.percent}">0%</span>
            </div>
            <div class="skill-bar-bg"><div class="skill-bar-fill" data-width="${s.percent}"></div></div>
        </div>`).join("");
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

document.addEventListener("DOMContentLoaded", () => {
    renderSkills();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Header, progress bar, back-to-top ---------- */
    const header = document.getElementById("site-header");
    const progress = document.querySelector(".scroll-progress");
    const backTop = document.querySelector(".back-to-top");

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle("scrolled", y > 30);
        if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        if (backTop) backTop.classList.toggle("show", y > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile nav ---------- */
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("main-nav");
    if (toggle && nav) {
        const setOpen = (open) => {
            nav.classList.toggle("open", open);
            toggle.classList.toggle("open", open);
            toggle.setAttribute("aria-expanded", open);
        };
        toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
        nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
        document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    }

    /* ---------- Active nav link ---------- */
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = [...navLinks]
        .map(l => document.querySelector(l.getAttribute("href")))
        .filter(Boolean);

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const revealer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    revealer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        // small stagger for siblings in the same grid
        document.querySelectorAll(".services-4grid, .projects-3grid").forEach(grid => {
            [...grid.children].forEach((child, i) => child.style.setProperty("--reveal-delay", `${(i % 3) * 0.1}s`));
        });
        revealEls.forEach(el => revealer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add("revealed"));
    }

    /* ---------- Skill bars + counters ---------- */
    const animateSkill = (card) => {
        const fill = card.querySelector(".skill-bar-fill");
        const pct = card.querySelector(".skill-percent");
        const target = +fill.dataset.width;
        fill.style.width = target + "%";
        if (prefersReducedMotion) { pct.textContent = target + "%"; return; }
        const start = performance.now(), dur = 1400;
        const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            pct.textContent = Math.round(target * eased) + "%";
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };
    const skillObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkill(entry.target);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    document.querySelectorAll(".skill-card").forEach(c => skillObserver.observe(c));

    /* ---------- Skill filters ---------- */
    document.querySelectorAll(".skill-filter").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".skill-filter").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const cat = btn.dataset.cat;
            document.querySelectorAll(".skill-card").forEach(card => {
                const show = cat === "all" || card.dataset.cat === cat;
                card.classList.toggle("is-hidden", !show);
                if (show) { card.classList.add("revealed"); animateSkill(card); }
            });
        });
    });

    /* ---------- Spotlight effect on skill cards ---------- */
    document.addEventListener("pointermove", e => {
        const card = e.target.closest && e.target.closest(".skill-card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });

    /* ---------- Testimonials carousel ---------- */
    const carousel = document.querySelector(".testimonial-carousel");
    if (carousel) {
        const track = carousel.querySelector(".tc-track");
        const slides = [...track.children];
        const dotsWrap = carousel.querySelector(".tc-dots");
        const prev = carousel.querySelector(".tc-prev");
        const next = carousel.querySelector(".tc-next");
        let index = 0, timer = null;

        dotsWrap.innerHTML = slides.map((_, i) =>
            `<button class="tc-dot" role="tab" aria-label="Review ${i + 1}"></button>`).join("");
        const dots = [...dotsWrap.children];

        const goTo = (i) => {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            slides.forEach((s, n) => {
                s.classList.toggle("active", n === index);
                s.setAttribute("aria-hidden", n !== index);
            });
            dots.forEach((d, n) => {
                d.classList.toggle("active", n === index);
                d.setAttribute("aria-selected", n === index);
            });
        };
        const start = () => {
            if (prefersReducedMotion || slides.length < 2) return;
            stop();
            timer = setInterval(() => goTo(index + 1), 6000);
        };
        const stop = () => { if (timer) clearInterval(timer); timer = null; };

        prev.addEventListener("click", () => { goTo(index - 1); start(); });
        next.addEventListener("click", () => { goTo(index + 1); start(); });
        dots.forEach((d, n) => d.addEventListener("click", () => { goTo(n); start(); }));

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        carousel.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft")  { goTo(index - 1); start(); }
            if (e.key === "ArrowRight") { goTo(index + 1); start(); }
        });

        // swipe on touch screens
        let startX = null;
        const viewport = carousel.querySelector(".tc-viewport");
        viewport.addEventListener("touchstart", e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
        viewport.addEventListener("touchend", e => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
            startX = null;
            start();
        });

        if (slides.length < 2) carousel.querySelector(".tc-controls").style.display = "none";
        goTo(0);
        start();
    }

    /* ---------- Projects gallery filter ---------- */
    const tabBtns = document.querySelectorAll(".tab-btn");
    const projectCards = document.querySelectorAll(".all-projects-grid .project-card");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                const show = filter === "all" || card.classList.contains(filter);
                card.classList.remove("is-entering");
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    card.classList.add("revealed");
                    void card.offsetWidth; // restart animation
                    card.classList.add("is-entering");
                }
            });
        });
    });

    /* ---------- 3D tilt on device mockups ---------- */
    if (!isTouch && !prefersReducedMotion) {
        document.querySelectorAll(".tilt").forEach(el => {
            const max = el.classList.contains("device-laptop") ? 6 : 8;
            el.addEventListener("pointermove", e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-4px)`;
            });
            el.addEventListener("pointerleave", () => { el.style.transform = ""; });
        });
    }

    /* ---------- Cursor glow ---------- */
    const glow = document.querySelector(".cursor-glow");
    if (glow && !isTouch && !prefersReducedMotion) {
        let gx = 0, gy = 0, tx = 0, ty = 0, running = false;
        const loop = () => {
            gx += (tx - gx) * 0.12;
            gy += (ty - gy) * 0.12;
            glow.style.transform = `translate(${gx}px, ${gy}px)`;
            if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop);
            else running = false;
        };
        window.addEventListener("pointermove", e => {
            tx = e.clientX; ty = e.clientY;
            document.body.classList.add("has-cursor");
            if (!running) { running = true; requestAnimationFrame(loop); }
        }, { passive: true });
        document.addEventListener("pointerleave", () => document.body.classList.remove("has-cursor"));
    }

    /* ---------- Typing effect in hero ---------- */
    const typedEl = document.querySelector(".typed-text");
    if (typedEl && !prefersReducedMotion) {
        const words = JSON.parse(typedEl.dataset.words || "[]");
        let w = 0, c = words[0] ? words[0].length : 0, deleting = true;
        const step = () => {
            const word = words[w];
            typedEl.textContent = word.slice(0, c);
            let delay = deleting ? 40 : 85;
            if (!deleting && c === word.length) { delay = 1800; deleting = true; }
            else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
            c += deleting ? -1 : 1;
            setTimeout(step, delay);
        };
        setTimeout(step, 2200);
    }

    /* ---------- Contact form (PHPMailer via contact.php) ---------- */
    const form = document.getElementById("contact-form");
    if (form) {
        const status = form.querySelector(".form-status");
        const btn = form.querySelector(".btn-submit");
        const timeField = document.getElementById("form_time");
        if (timeField) timeField.value = Math.floor(Date.now() / 1000);

        const showStatus = (msg, type) => {
            status.textContent = msg;
            status.className = `form-status show ${type}`;
        };

        // show result after a non-JS fallback redirect (contact.php?sent=1)
        const params = new URLSearchParams(location.search);
        if (params.has("sent")) {
            params.get("sent") === "1"
                ? showStatus("Thank you! Your message has been sent. I'll get back to you within 24 hours.", "success")
                : showStatus("Something went wrong. Please try again or email me directly.", "error");
        }

        form.querySelectorAll(".form-input").forEach(inp =>
            inp.addEventListener("input", () => inp.classList.remove("invalid")));

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // client-side validation
            let valid = true;
            form.querySelectorAll("[required]").forEach(inp => {
                const bad = !inp.value.trim() || (inp.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()));
                inp.classList.toggle("invalid", bad);
                if (bad) valid = false;
            });
            if (!valid) {
                showStatus("Please fill in your name, a valid email address and a message.", "error");
                return;
            }

            btn.disabled = true;
            btn.classList.add("loading");
            status.className = "form-status";

            try {
                const res = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" }
                });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data.success) {
                    showStatus(data.message || "Thank you! Your message has been sent.", "success");
                    form.reset();
                    if (timeField) timeField.value = Math.floor(Date.now() / 1000);
                } else {
                    showStatus(data.message || "Something went wrong. Please try again or email me directly.", "error");
                }
            } catch (err) {
                showStatus("Network error. Please check your connection or email me at petrovicuros052@gmail.com.", "error");
            } finally {
                btn.disabled = false;
                btn.classList.remove("loading");
            }
        });
    }
});
