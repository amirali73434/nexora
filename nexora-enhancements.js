
/* =====================================================
   NEXORA — SITE INTERACTIONS
   Navigation, portfolio, search, order form and details
===================================================== */

(function () {
    "use strict";

    function byId(id) {
        return document.getElementById(id);
    }

    function isConfigured(value) {
        if (!value) return false;

        value = String(value).trim();

        return value !== "" &&
            value !== "YOUR_ID" &&
            value.indexOf("example.com") === -1;
    }

    function buildPortfolioCard(work) {
        var card = document.createElement("a");

        card.className = "p-card";
        card.href = "portfolio.html?item=" +
            encodeURIComponent(work.key);

        var media;

        if (work.video) {
            media = document.createElement("video");
            media.src = work.video;
            media.muted = true;
            media.playsInline = true;
            media.preload = "metadata";
            media.setAttribute("aria-label", work.title);
        } else {
            media = document.createElement("img");
            media.src = work.image || "";
            media.alt = work.title || "نمونه‌کار NEXORA";
            media.loading = "lazy";
            media.decoding = "async";

            media.addEventListener("error", function () {
                var fallback = document.createElement("div");
                fallback.className = "image-fallback";
                fallback.textContent =
                    "تصویر پیدا نشد: " + (work.image || "بدون مسیر");

                media.replaceWith(fallback);
            }, { once: true });
        }

        var title = document.createElement("h2");
        title.textContent = work.title || "نمونه‌کار";

        var type = document.createElement("p");
        type.textContent = work.type || "پروژه دیجیتال";

        card.append(media, title, type);

        return card;
    }

    function renderPortfolio() {
        var grid = byId("portfolioGrid");

        if (!grid) return;

        grid.replaceChildren();

        if (!Array.isArray(window.WORKS) || !window.WORKS.length) {
            var empty = document.createElement("p");
            empty.className = "empty-state";
            empty.textContent =
                "اطلاعات نمونه‌کارها بارگذاری نشده است. فایل data.js را بررسی کن.";

            grid.appendChild(empty);
            return;
        }

        window.WORKS.forEach(function (work) {
            grid.appendChild(buildPortfolioCard(work));
        });
    }

    function setupNavigation() {
        var pages = Array.from(
            document.querySelectorAll(".page")
        );

        var navLinks = Array.from(
            document.querySelectorAll("[data-page]")
        );

        if (!pages.length) return;

        function showPage(id, updateHistory) {
            var target = document.getElementById(id);

            if (!target || !target.classList.contains("page")) {
                id = "home";
                target = byId("home");
            }

            pages.forEach(function (page) {
                page.classList.toggle(
                    "active-page",
                    page.id === id
                );
            });

            navLinks.forEach(function (link) {
                var active = link.getAttribute("data-page") === id;

                if (link.classList.contains("menu-btn")) {
                    link.classList.toggle("active", active);
                }

                if (link.hasAttribute("aria-current")) {
                    link.removeAttribute("aria-current");
                }

                if (active && link.classList.contains("menu-btn")) {
                    link.setAttribute("aria-current", "page");
                }
            });

            if (updateHistory) {
                history.replaceState(null, "", "#" + id);
            }

            window.scrollTo({
                top: 0,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth"
            });
        }

        navLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                var id = link.getAttribute("data-page");

                if (!id || !byId(id)) return;

                event.preventDefault();
                showPage(id, true);
            });
        });

        var initial = location.hash.replace("#", "") || "home";
        showPage(initial, false);

        window.addEventListener("hashchange", function () {
            var id = location.hash.replace("#", "") || "home";
            showPage(id, false);
        });
    }

    function setupSearch() {
        var button = byId("searchBtn");
        var panel = byId("searchPanel");
        var close = byId("searchClose");
        var input = byId("siteSearch");
        var results = byId("searchResults");

        if (!button || !panel || !input || !results) return;

        function closeSearch() {
            panel.classList.remove("open");
            input.value = "";
            results.replaceChildren();
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("open");

            if (panel.classList.contains("open")) {
                window.setTimeout(function () {
                    input.focus();
                }, 50);
            } else {
                closeSearch();
            }
        });

        if (close) {
            close.addEventListener("click", closeSearch);
        }

        input.addEventListener("input", function () {
            results.replaceChildren();

            var query = input.value.trim().toLowerCase();

            if (!query) return;

            var works = Array.isArray(window.WORKS)
                ? window.WORKS
                : [];

            var matches = works.filter(function (work) {
                return [
                    work.title,
                    work.type,
                    work.desc
                ].some(function (value) {
                    return String(value || "")
                        .toLowerCase()
                        .includes(query);
                });
            });

            if (!matches.length) {
                var empty = document.createElement("div");
                empty.className = "search-empty";
                empty.textContent = "نمونه‌کاری پیدا نشد.";
                results.appendChild(empty);
                return;
            }

            matches.forEach(function (work) {
                var link = document.createElement("a");
                link.className = "search-result-item";
                link.href = "portfolio.html?item=" +
                    encodeURIComponent(work.key);

                var copy = document.createElement("span");
                copy.className = "search-result-copy";

                var title = document.createElement("strong");
                title.textContent = work.title;

                var type = document.createElement("small");
                type.textContent = work.type;

                copy.append(title, type);
                link.appendChild(copy);
                results.appendChild(link);
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeSearch();
            }
        });

        document.addEventListener("click", function (event) {
            if (
                panel.classList.contains("open") &&
                !panel.contains(event.target) &&
                !button.contains(event.target)
            ) {
                closeSearch();
            }
        });
    }

    function setupReviewSection(container, item) {
        var section = document.createElement("section");
        section.className = "nx-reviews";

        var heading = document.createElement("div");
        heading.className = "nx-reviews-heading";

        var title = document.createElement("h2");
        title.textContent = "امتیاز و دیدگاه‌ها";

        var demoLabel = document.createElement("span");
        demoLabel.className = "nx-demo-label";
        demoLabel.textContent = "نسخه نمایشی";

        var intro = document.createElement("p");
        intro.className = "nx-reviews-note";
        intro.textContent = "این بخش فعلاً نمایشی است؛ دیدگاه‌های ثبت‌شده فقط در همین صفحه و تا زمان بارگذاری مجدد دیده می‌شوند.";

        var summary = document.createElement("div");
        summary.className = "nx-review-summary";

        var score = document.createElement("strong");
        score.className = "nx-review-score";
        score.textContent = "۴٫۸";

        var summaryStars = document.createElement("span");
        summaryStars.className = "nx-review-stars";
        summaryStars.textContent = "★★★★★";

        var summaryCount = document.createElement("small");
        summaryCount.textContent = "۲ دیدگاه نمایشی";

        summary.append(score, summaryStars, summaryCount);
        heading.append(title, demoLabel);
        section.append(heading, intro, summary);

        var list = document.createElement("div");
        list.className = "nx-review-list";

        var reviews = [
            { name: "کاربر نمونه", rating: 5, text: "طراحی تمیز و جذابی دارد. این یک دیدگاه نمونه برای نمایش ظاهر بخش است." },
            { name: "بازدیدکننده آزمایشی", rating: 4, text: "ترکیب‌بندی و توجه به جزئیات خوب است. این نظر واقعی مشتری نیست." }
        ];

        function renderReviews() {
            list.replaceChildren();
            reviews.forEach(function (review) {
                var card = document.createElement("article");
                card.className = "nx-review-card";

                var top = document.createElement("div");
                top.className = "nx-review-card-top";

                var author = document.createElement("strong");
                author.textContent = review.name;

                var stars = document.createElement("span");
                stars.className = "nx-review-stars";
                stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

                var text = document.createElement("p");
                text.textContent = review.text;

                top.append(author, stars);
                card.append(top, text);
                list.appendChild(card);
            });
            summaryCount.textContent = reviews.length + " دیدگاه نمایشی";
        }

        var form = document.createElement("form");
        form.className = "nx-review-form";

        var formTitle = document.createElement("h3");
        formTitle.textContent = "نظر آزمایشی خودت را بنویس";

        var nameLabel = document.createElement("label");
        nameLabel.textContent = "نام نمایشی";

        var nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.maxLength = 30;
        nameInput.placeholder = "مثلاً: بازدیدکننده";
        nameInput.required = true;

        var ratingLabel = document.createElement("label");
        ratingLabel.textContent = "امتیاز شما";

        var ratingPicker = document.createElement("div");
        ratingPicker.className = "nx-rating-picker";
        ratingPicker.setAttribute("role", "group");
        ratingPicker.setAttribute("aria-label", "انتخاب امتیاز از یک تا پنج");

        var selectedRating = 5;
        for (var n = 1; n <= 5; n++) {
            (function (value) {
                var starButton = document.createElement("button");
                starButton.type = "button";
                starButton.className = "nx-rating-star";
                starButton.textContent = "★";
                starButton.setAttribute("aria-label", value + " از ۵");
                starButton.setAttribute("aria-pressed", value === selectedRating ? "true" : "false");
                starButton.addEventListener("click", function () {
                    selectedRating = value;
                    Array.from(ratingPicker.children).forEach(function (button, index) {
                        button.classList.toggle("selected", index < selectedRating);
                        button.setAttribute("aria-pressed", index + 1 === selectedRating ? "true" : "false");
                    });
                });
                if (value <= selectedRating) starButton.classList.add("selected");
                ratingPicker.appendChild(starButton);
            })(n);
        }

        var commentLabel = document.createElement("label");
        commentLabel.textContent = "متن دیدگاه";

        var commentInput = document.createElement("textarea");
        commentInput.rows = 4;
        commentInput.maxLength = 400;
        commentInput.placeholder = "نظرت درباره این نمونه‌کار...";
        commentInput.required = true;

        var submit = document.createElement("button");
        submit.type = "submit";
        submit.className = "button-primary";
        submit.textContent = "ثبت دیدگاه نمایشی";

        var formStatus = document.createElement("p");
        formStatus.className = "form-status";
        formStatus.setAttribute("role", "status");

        form.append(formTitle, nameLabel, nameInput, ratingLabel, ratingPicker, commentLabel, commentInput, submit, formStatus);
        section.append(list, form);
        container.appendChild(section);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var author = nameInput.value.trim();
            var comment = commentInput.value.trim();
            if (!author || !comment) {
                formStatus.textContent = "نام و متن دیدگاه را وارد کن.";
                return;
            }
            reviews.unshift({ name: author, rating: selectedRating, text: comment });
            renderReviews();
            form.reset();
            selectedRating = 5;
            Array.from(ratingPicker.children).forEach(function (button, index) {
                button.classList.toggle("selected", index < 5);
                button.setAttribute("aria-pressed", index === 4 ? "true" : "false");
            });
            formStatus.textContent = "دیدگاه نمایشی اضافه شد؛ با بارگذاری مجدد صفحه پاک می‌شود.";
        });

        renderReviews();
    }

    function setupPortfolioDetail() {
        var container = byId("portfolioDetail");

        if (!container) return;

        var params = new URLSearchParams(location.search);
        var item = typeof getWorkByKey === "function"
            ? getWorkByKey(params.get("item"))
            : null;

        container.replaceChildren();

        if (!item) {
            var heading = document.createElement("h1");
            heading.textContent = "نمونه‌کار پیدا نشد";

            var desc = document.createElement("p");
            desc.textContent =
                "این نمونه‌کار در فایل data.js وجود ندارد یا لینک اشتباه است.";

            var link = document.createElement("a");
            link.className = "button-primary";
            link.href = "index.html#portfolio";
            link.textContent = "بازگشت به نمونه‌کارها";

            container.append(heading, desc, link);
            return;
        }

        document.title = item.title + " | NEXORA";

        var media;

        if (item.video) {
            media = document.createElement("video");
            media.className = "detail-media";
            media.src = item.video;
            media.controls = true;
            media.playsInline = true;
            media.preload = "metadata";
        } else {
            media = document.createElement("img");
            media.className = "detail-media";
            media.src = item.image || "";
            media.alt = item.title;
        }

        var heading = document.createElement("h1");
        heading.textContent = item.title;

        var type = document.createElement("span");
        type.className = "chip";
        type.textContent = item.type || "پروژه دیجیتال";

        var desc = document.createElement("p");
        desc.className = "desc";
        desc.textContent = item.desc || "";

        container.append(media, heading, type, desc);

        setupReviewSection(container, item);\n\n        if (item.key !== "nexora") {
            var notice = document.createElement("p");
            notice.className = "notice";
            notice.textContent =
                "این یک پروژه تمرینی یا مفهومی است و به معنی همکاری رسمی با برند نمایش‌داده‌شده نیست.";

            container.appendChild(notice);
        }

        var actions = document.createElement("div");
        actions.className = "detail-actions";

        var more = document.createElement("article");
        more.className = "service-card";

        var moreTitle = document.createElement("h2");
        moreTitle.textContent = "نمونه‌کارهای بیشتر";

        var moreText = document.createElement("p");
        moreText.textContent = "دیگر پروژه‌های نکسورا را مشاهده کن.";

        var moreLink = document.createElement("a");
        moreLink.className = "button-primary";
        moreLink.href = "index.html#portfolio";
        moreLink.textContent = "مشاهده نمونه‌کارها";

        more.append(moreTitle, moreText, moreLink);

        var order = document.createElement("article");
        order.className = "service-card";

        var orderTitle = document.createElement("h2");
        orderTitle.textContent = "ثبت سفارش";

        var orderText = document.createElement("p");
        orderText.textContent = "برای شروع پروژه خودت اقدام کن.";

        var orderLink = document.createElement("a");
        orderLink.className = "button-primary";
        orderLink.href = "index.html#order";
        orderLink.textContent = "ثبت سفارش";

        order.append(orderTitle, orderText, orderLink);

        actions.append(more, order);
        container.appendChild(actions);
    }

    function setupContactLinks() {
        var site = window.SITE || {};

        document.querySelectorAll("[data-link]").forEach(function (link) {
            var value = site[link.getAttribute("data-link")];

            if (isConfigured(value) && /^https?:\/\//i.test(String(value).trim())) {
                link.href = String(value).trim();
                link.classList.remove("is-disabled");
            } else {
                link.href = "#";
                link.classList.add("is-disabled");

                link.addEventListener("click", function (event) {
                    event.preventDefault();
                });
            }
        });
    }

    function setupOrderForm() {
        var form = byId("orderForm");
        if (!form) return;

        var service = byId("orderService");
        var name = byId("orderName");
        var description = byId("orderDescription");
        var preview = byId("orderPreview");
        var status = byId("orderStatus");
        var botUrl = window.SITE && window.SITE.telegramBot;

        function createMessage() {
            preview.value = [
                "سلام، برای ثبت سفارش در NEXORA پیام می‌دهم.",
                "",
                "خدمت: " + service.value,
                "نام: " + (name.value.trim() || "ثبت نشده"),
                "توضیحات: " + description.value.trim()
            ].join("\\n");
            return preview.value;
        }

        [service, name, description].forEach(function (field) {
            field.addEventListener("input", createMessage);
            field.addEventListener("change", createMessage);
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            var message = createMessage();
            if (!isConfigured(botUrl) || !/^https:\\/\\/t\\.me\\//i.test(String(botUrl))) {
                status.textContent = "لینک بات تلگرام تنظیم نشده است. لطفاً بعداً دوباره تلاش کن.";
                return;
            }

            // Open the bot directly from the user's click to avoid popup blockers.
            window.open(String(botUrl), "_blank", "noopener,noreferrer");

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(message).then(function () {
                    status.textContent = "بات NEXORA باز شد و متن سفارش کپی شد؛ داخل گفت‌وگو Paste کن و دکمه ارسال را بزن.";
                }).catch(function () {
                    preview.focus();
                    preview.select();
                    status.textContent = "بات NEXORA باز شد. متن داخل کادر را کپی کن، در بات Paste کن و ارسال را بزن.";
                });
            } else {
                preview.focus();
                preview.select();
                status.textContent = "بات NEXORA باز شد. متن داخل کادر را کپی کن، در بات Paste کن و ارسال را بزن.";
            }
        });

        createMessage();
    }

    function setupScrollControls() {
        var progress = document.createElement("div");
        progress.id = "nx-scroll-progress";
        progress.setAttribute("aria-hidden", "true");
        document.body.appendChild(progress);

        var topButton = byId("toTop");

        function update() {
            var root = document.documentElement;
            var max = root.scrollHeight - window.innerHeight;
            var value = max > 0
                ? window.scrollY / max
                : 0;

            progress.style.transform =
                "scaleX(" + Math.max(0, Math.min(1, value)) + ")";

            if (topButton) {
                topButton.classList.toggle(
                    "show",
                    window.scrollY > 400
                );
            }
        }

        window.addEventListener("scroll", update, {
            passive: true
        });

        window.addEventListener("resize", update, {
            passive: true
        });

        if (topButton) {
            topButton.addEventListener("click", function () {
                window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth"
                });
            });
        }

        update();
    }


    function setupScrollReveal() {
        var activePage = document.querySelector(".page.active-page");
        if (!activePage) return;
        var selector = ".hero-copy h1,.hero-copy h2,.hero-copy .hero-description,.hero-copy .hero-actions,.feature-copy,.feature-visual,.video-section,.section-heading,.service-card,.p-card,.tutorial-card,.page-heading,.about-panel,.order-panel,.price-panel,.contact-card,.simple-cta,.notice";
        var items = Array.prototype.slice.call(activePage.querySelectorAll(selector));
        items.forEach(function(el,i){
            el.classList.add("nx-scroll-item");
            el.style.setProperty("--nx-delay",(i%4)*90+"ms");
        });
        function check(){
            var vh=window.innerHeight || document.documentElement.clientHeight;
            items.forEach(function(el){
                if(el.classList.contains("nx-scroll-shown")) return;
                if(el.getBoundingClientRect().top < vh-45){
                    el.classList.add("nx-scroll-shown");
                }
            });
        }
        check();
        window.addEventListener("scroll",check,{passive:true});
        window.addEventListener("resize",check,{passive:true});
        document.querySelectorAll("[data-page]").forEach(function(link){
            link.addEventListener("click",function(){
                setTimeout(function(){
                    activePage=document.querySelector(".page.active-page");
                    items=Array.prototype.slice.call(activePage.querySelectorAll(selector));
                    items.forEach(function(el,i){
                        el.classList.remove("nx-scroll-shown");
                        el.classList.add("nx-scroll-item");
                        el.style.setProperty("--nx-delay",(i%4)*90+"ms");
                    });
                    check();
                },180);
            });
        });
    }

    function init() {
        renderPortfolio();
        setupNavigation();
        setupSearch();
        setupPortfolioDetail();
        setupContactLinks();
        setupOrderForm();
        setupScrollControls();
        setupScrollReveal();

        console.info("[NEXORA] سایت آماده است.");
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }
})();
