document.addEventListener('DOMContentLoaded', () => {
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Data paths
    const dataPaths = {
        images: 'data/images.json',
        videos: 'data/videos.json'
    };

    // Load Images
    async function loadImages() {
        try {
            const response = await fetch(dataPaths.images);
            if (!response.ok) throw new Error('Failed to load images');
            const imageUrls = await response.json();
            
            const gallery = document.getElementById('imageGallery');
            if(!gallery) return;

            imageUrls.forEach((url, index) => {
                const item = document.createElement('div');
                item.className = 'card animate-fade-up';
                item.style.animationDelay = `${(index * 0.1) + 0.2}s`;
                item.style.opacity = '0';
                
                const wrapper = document.createElement('div');
                wrapper.className = 'card-img-wrapper';

                const img = document.createElement('img');
                img.src = url.trim();
                img.alt = 'Portfolio Image';
                img.loading = 'lazy';
                
                wrapper.appendChild(img);
                item.appendChild(wrapper);
                
                item.addEventListener('click', () => openLightbox(url.trim()));
                gallery.appendChild(item);
            });

            // Hide loader and show gallery
            const loader = document.getElementById('gallery-loader');
            if (loader) loader.classList.add('hidden');
            gallery.classList.remove('hidden');

        } catch (error) {
            console.error('Error loading images:', error);
        }
    }

    // Load Videos
    async function loadVideos() {
        try {
            const response = await fetch(dataPaths.videos);
            if (!response.ok) throw new Error('Failed to load videos');
            const videoUrls = await response.json();
            
            const videoGallery = document.getElementById('videoGallery');
            if(!videoGallery) return;

            videoUrls.forEach((url, index) => {
                const videoId = extractYouTubeID(url.trim());
                if (videoId) {
                    const item = document.createElement('div');
                    item.className = 'card animate-fade-up';
                    item.style.animationDelay = `${(index * 0.1) + 0.2}s`;
                    item.style.opacity = '0';
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'video-wrapper';

                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.allowFullscreen = true;
                    iframe.loading = 'lazy';
                    
                    wrapper.appendChild(iframe);
                    item.appendChild(wrapper);
                    videoGallery.appendChild(item);
                }
            });

            // Hide loader and show gallery
            const loader = document.getElementById('video-loader');
            if (loader) loader.classList.add('hidden');
            videoGallery.classList.remove('hidden');

        } catch (error) {
            console.error('Error loading videos:', error);
        }
    }

    function extractYouTubeID(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
            /youtube\.com\/embed\/([^&\n?#]+)/
        ];
        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-lightbox');

    function openLightbox(imageSrc) {
        if(!lightbox || !lightboxImg) return;
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeLightbox() {
        if(!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }

    // Escape key to close lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Count-up Animation for Metrics
    const animateMetrics = () => {
        const metrics = document.querySelectorAll('.metric-number');
        
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers: just show the numbers
            metrics.forEach(metric => {
                metric.textContent = metric.getAttribute('data-target');
            });
            return;
        }

        const options = {
            threshold: 0.1, // Lower threshold to ensure it triggers earlier
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    const duration = 1500; 
                    const startTime = performance.now();
                    
                    const updateCount = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const currentCount = Math.floor(easeOut * target);
                        
                        entry.target.textContent = currentCount;

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            entry.target.textContent = target;
                        }
                    };

                    requestAnimationFrame(updateCount);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        metrics.forEach(metric => observer.observe(metric));
    };

    // Discord Status via Lanyard
    const statusDot = document.getElementById('discord-status');
    if (statusDot) {
        const STATUS_LABELS = {
            online: 'Online',
            idle: 'Idle',
            dnd: 'Do Not Disturb',
            offline: 'Offline'
        };

        function updateStatus(status) {
            statusDot.setAttribute('data-status', status);
            statusDot.title = 'Discord: ' + (STATUS_LABELS[status] || status);
        }

        function fetchStatus() {
            fetch('https://api.lanyard.rest/v1/users/727818104846942230')
                .then(r => r.json())
                .then(data => {
                    if (data.success) updateStatus(data.data.discord_status);
                })
                .catch(() => {});
        }

        // Fetch immediately on load
        fetchStatus();

        // REST polling every 30s as baseline
        setInterval(fetchStatus, 30000);

        // WebSocket for real-time updates
        let ws;
        let reconnectTimeout;

        function connectWS() {
            ws = new WebSocket('wss://api.lanyard.rest/socket');

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    op: 2,
                    d: { subscribe_id: '727818104846942230' }
                }));
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                if (msg.op === 0 && msg.t === 'INIT_STATE') {
                    updateStatus(msg.d.discord_status);
                } else if (msg.op === 0 && msg.t === 'PRESENCE_UPDATE') {
                    updateStatus(msg.d.discord_status);
                }
            };

            ws.onclose = () => {
                reconnectTimeout = setTimeout(connectWS, 10000);
            };

            ws.onerror = () => {
                ws.close();
            };
        }

        connectWS();
    }

    // Initialize
    loadImages();
    loadVideos();
    animateMetrics();
});
