window.addEventListener('load', function() {
AOS.init({ duration: 800, once: true });
        initPartnerSwiper();
        initHeroSwiper();
        initHeroVideo();
        initGaleriFilter();
        initLightbox();

        // ===== GOOGLE MAPS FACADE — loads iframe only on user click (saves 456 KiB JS) =====
        function loadMap(facade) {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://maps.google.com/maps?q=Mensana+Tower+Cibubur,+Jl.+Raya+Kranggan,+Jatisampurna&t=&z=15&ie=UTF8&iwloc=&output=embed';
            iframe.className = 'rounded-3';
            iframe.style.cssText = 'border:0;width:100%;height:100%;';
            iframe.allowFullscreen = true;
            iframe.title = 'Lokasi PT Pesona Lintang Kemukus';
            facade.innerHTML = '';
            facade.style.cursor = 'default';
            facade.appendChild(iframe);
        }

        function initHeroSwiper() {
            const dots = document.querySelectorAll('.hero-pagination .dot');
            const heroSwiper = new Swiper('.hero-swiper', {
                loop: true,
                autoplay: { delay: 5000, disableOnInteraction: false },
                navigation: { nextEl: '.hero-swiper-button-next', prevEl: '.hero-swiper-button-prev' },
                on: { slideChange: function () { updateHeroPagination(this.realIndex); } }
            });
            function updateHeroPagination(index) {
                dots.forEach((dot, i) => {
                    if (i === index) dot.classList.add('active');
                    else dot.classList.remove('active');
                });
            }
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => { heroSwiper.slideToLoop(index); });
            });
            updateHeroPagination(0);
        }

        // ===== HERO VIDEO: pastikan selalu autoplay & muted, dan auto-resume jika di-pause browser =====
        function initHeroVideo() {
            const video = document.getElementById('heroVideo');
            const heroSection = document.getElementById('home');
            if (!video || !heroSection) return;

            video.muted = true;
            video.volume = 0.3;
            video.setAttribute('muted', '');

            // Coba play, retry singkat jika browser belum siap (autoplay policy)
            function tryPlay() {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // beberapa browser butuh sedikit delay setelah load, retry sekali
                        setTimeout(() => { video.muted = true; video.play().catch(() => { }); }, 300);
                    });
                }
            }
            tryPlay();

            // Beberapa browser (terutama mobile/Data Saver) otomatis men-pause video
            // saat resource dianggap tidak terlihat / hemat baterai. Jika itu terjadi,
            // langsung coba resume kembali secara otomatis.
            video.addEventListener('pause', () => {
                // Jangan paksa play kalau tab sedang tidak aktif (hindari error browser)
                if (document.visibilityState === 'visible') {
                    tryPlay();
                }
            });

            // Saat hero section kembali terlihat di viewport (misal user scroll balik ke atas),
            // pastikan video kembali bermain.
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && video.paused) {
                        tryPlay();
                    }
                });
            }, { threshold: 0.05 });
            io.observe(heroSection);

            // Saat user kembali ke tab (misal sempat pindah tab lalu balik lagi)
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && video.paused) {
                    tryPlay();
                }
            });

            // Safety net: cek berkala selama beberapa detik pertama setelah load,
            // untuk menangani kasus video di-pause tepat saat browser mengintervensi resource.
            window.addEventListener('scroll', () => {
                if (video.paused) tryPlay();
            }, { passive: true });
        }

        function initPartnerSwiper() {
            new Swiper('.partner-swiper', {
                slidesPerView: 'auto',
                spaceBetween: 30,
                loop: true,
                speed: 5000,
                autoplay: { delay: 0, disableOnInteraction: false },
                allowTouchMove: false,
                breakpoints: { 640: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }
            });
        }

        function initGaleriFilter() {
            const btns = document.querySelectorAll('.galeri-tab-btn');
            const items = document.querySelectorAll('.galeri-item');
            function filter(category) {
                items.forEach(item => {
                    if (category === 'all' || item.dataset.category === category) item.classList.add('visible');
                    else item.classList.remove('visible');
                });
            }
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filter(btn.dataset.filter);
                });
            });
            filter('tol');
        }

        function initLightbox() {
            const lightbox = document.getElementById('galeriLightbox');
            const lbImg = document.getElementById('lightboxImg');
            const lbTitle = document.getElementById('lightboxTitle');
            const lbDesc = document.getElementById('lightboxDesc');
            const lbClose = document.getElementById('lightboxClose');
            const lbPrev = document.getElementById('lightboxPrev');
            const lbNext = document.getElementById('lightboxNext');
            let currentIndex = 0, visibleItems = [];

            function openLightbox(index) {
                visibleItems = Array.from(document.querySelectorAll('.galeri-item.visible'));
                currentIndex = index;
                showItem(currentIndex);
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
            function closeLightbox() {
                lightbox.classList.remove('open');
                document.body.style.overflow = '';
            }
            function showItem(i) {
                const item = visibleItems[i];
                if (!item) return;
                lbImg.src = item.querySelector('img').src;
                lbImg.alt = item.dataset.title;
                lbTitle.textContent = item.dataset.title;
                lbDesc.textContent = item.dataset.desc;
            }
            document.querySelectorAll('.galeri-item').forEach((item, idx) => {
                item.addEventListener('click', () => {
                    visibleItems = Array.from(document.querySelectorAll('.galeri-item.visible'));
                    const visIdx = visibleItems.indexOf(item);
                    openLightbox(visIdx >= 0 ? visIdx : 0);
                });
            });
            lbClose.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
            lbPrev.addEventListener('click', () => { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showItem(currentIndex); });
            lbNext.addEventListener('click', () => { currentIndex = (currentIndex + 1) % visibleItems.length; showItem(currentIndex); });
            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('open')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') lbPrev.click();
                if (e.key === 'ArrowRight') lbNext.click();
            });
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('mainNavbar');
            if (window.scrollY > 50) navbar.classList.add('navbar-scrolled');
            else navbar.classList.remove('navbar-scrolled');
        });

        // Active section observer
        const desktopLinks = document.querySelectorAll('.navbar .nav-link[data-section]');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link[data-section]');
        function setActiveSection(id) {
            desktopLinks.forEach(link => link.classList.toggle('active', link.dataset.section === id));
            mobileLinks.forEach(link => link.classList.toggle('active', link.dataset.section === id));
        }
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveSection(entry.target.id);
            });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
        sections.forEach(sec => observer.observe(sec));

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                if (target && href !== '#') {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        const mobileNavClose = document.getElementById('mobileNavClose');
        const mobileCta = document.getElementById('mobileCta');
        function openMobileMenu() {
            mobileNavOverlay.classList.remove('closing');
            mobileNavOverlay.classList.add('open');
            mobileMenuBtn.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeMobileMenu() {
            mobileNavOverlay.classList.add('closing');
            mobileMenuBtn.classList.remove('open');
            document.body.style.overflow = '';
            setTimeout(() => { mobileNavOverlay.classList.remove('open', 'closing'); }, 280);
        }
        mobileMenuBtn.addEventListener('click', () => {
            if (mobileNavOverlay.classList.contains('open')) closeMobileMenu();
            else openMobileMenu();
        });
        mobileNavClose.addEventListener('click', closeMobileMenu);
        mobileLinks.forEach(link => { link.addEventListener('click', () => closeMobileMenu()); });
        if (mobileCta) mobileCta.addEventListener('click', () => closeMobileMenu());

        // WhatsApp form
        const waForm = document.getElementById('waForm'), successAlert = document.getElementById('successAlert');
        if (waForm) {
            waForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const nama = document.getElementById('namaPerusahaan').value;
                const email = document.getElementById('email').value;
                const telp = document.getElementById('nomorTelepon').value;
                const kebutuhan = document.getElementById('kebutuhan').value;
                const detail = document.getElementById('detail').value;
                if (!nama || !email || !telp) { alert('Harap lengkapi data'); return; }
                let msg = `*Permintaan Sewa Armada*\nNama: ${nama}\nEmail: ${email}\nTelp: ${telp}\nKebutuhan: ${kebutuhan}\nDetail: ${detail}`;
                window.open(`https://wa.me/6281331795070?text=${encodeURIComponent(msg)}`, '_blank');
                successAlert.style.display = 'block';
                waForm.reset();
                setTimeout(() => successAlert.style.display = 'none', 4000);
            });
        }

        // Sound indicator for video
        const soundIndicator = document.getElementById('soundIndicator'), video = document.getElementById('heroVideo');
        if (soundIndicator && video) {
            let unlocked = false;

            function updateSoundUI() {
                document.getElementById('soundIcon').className = video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
                document.getElementById('soundText').innerText = video.muted ? 'Suara Mati' : 'Suara Aktif';
            }

            soundIndicator.addEventListener('click', () => {
                if (!unlocked) {
                    // First tap: full-page overlay click — Chrome treats this as direct media interaction
                    unlocked = true;
                    soundIndicator.classList.add('dismissed');
                    // Move icon+text out of .sound-badge into the outer div for dismissed state
                    const badge = soundIndicator.querySelector('.sound-badge');
                    const icon = document.getElementById('soundIcon');
                    const text = document.getElementById('soundText');
                    soundIndicator.appendChild(icon);
                    soundIndicator.appendChild(text);
                    badge.remove();
                    video.muted = false;
                    if (video.paused) video.play().catch(() => { video.muted = true; });
                    updateSoundUI();
                } else {
                    // Subsequent taps: toggle mute
                    video.muted = !video.muted;
                    updateSoundUI();
                }
            });

            window.addEventListener('scroll', () => {
                if (!unlocked) return;
                if (window.scrollY > 150) {
                    video.muted = true;
                    updateSoundUI();
                } else if (window.scrollY <= 50 && video.muted) {
                    video.muted = false;
                    updateSoundUI();
                }
            });
        }

        // Swiper untuk Our Partner (baru) - dengan autoplay dan loop
        const ourPartnerSwiper = new Swiper('.ourpartner-swiper', {
            slidesPerView: 2,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 1000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            speed: 600,
            breakpoints: {
                576: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 25 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
                1280: { slidesPerView: 5, spaceBetween: 35 }
            },
            pagination: {
                el: '.ourpartner-pagination',
                clickable: true,
                dynamicBullets: true
            },
            navigation: {
                nextEl: '.ourpartner-next',
                prevEl: '.ourpartner-prev',
            },
            grabCursor: true,
        });

        // ===== WhatsApp Float Badge Auto Hide =====
        // Sembunyikan badge setelah 5 detik (opsional)
        setTimeout(() => {
            const badge = document.querySelector('.wa-badge');
            if (badge) {
                badge.style.transition = 'opacity 0.8s ease';
                badge.style.opacity = '0';
                setTimeout(() => { badge.style.display = 'none'; }, 800);
            }
        }, 5000);
});