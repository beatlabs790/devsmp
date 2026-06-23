// Apply theme immediately before window load to prevent white flashes
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
})();

// Globals for database-driven IPs (used to override copy parameters)
window.currentJavaIP = 'DevuncopySMP.aternos.me:60456';
window.currentBedrockIP = 'DevuncopySMP.aternos.me';
window.currentBedrockPort = '60456';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    const FIREBASE_DB_URL = "https://devsmp-83a81-default-rtdb.asia-southeast1.firebasedatabase.app/";

    // 1. FIREBASE REALTIME DATABASE LOAD & SYNC
    async function loadDatabaseConfig() {
        try {
            const response = await fetch(`${FIREBASE_DB_URL}.json`);
            if (!response.ok) throw new Error('Failed to load database config');
            const data = await response.json();

            if (data) {
                // Check Maintenance Mode
                if (data.maintenance === true) {
                    showMaintenanceScreen();
                    return; // Stop further rendering
                }

                // Load dynamic IPs & Ports
                window.currentJavaIP = data.javaIP || 'DevuncopySMP.aternos.me:60456';
                window.currentBedrockIP = data.bedrockIP || 'DevuncopySMP.aternos.me';
                window.currentBedrockPort = data.bedrockPort || '60456';

                // Update UI elements dynamically with loaded configs
                updateConnectionDetailsUI();
            }
        } catch (error) {
            console.error('Firebase config load error:', error);
            // Fallback to defaults already loaded in window variables
            updateConnectionDetailsUI();
        }

        // Initialize status tracker after configurations are loaded
        initStatusTracker();
    }

    // 2. DYNAMIC UI POPULATOR
    function updateConnectionDetailsUI() {
        const javaIpElement = document.getElementById('java-ip');
        const bedrockIpElement = document.getElementById('bedrock-ip');

        if (javaIpElement) {
            javaIpElement.textContent = window.currentJavaIP;
        }
        if (bedrockIpElement) {
            bedrockIpElement.textContent = `${window.currentBedrockIP} (Port: ${window.currentBedrockPort})`;
        }

        // Update footer connection detail lists dynamically
        const footerLines = document.querySelectorAll('.mini-status-line');
        footerLines.forEach(line => {
            const labelSpan = line.querySelector('span:first-child');
            const valueSpan = line.querySelector('span:last-child');
            if (labelSpan && valueSpan) {
                const label = labelSpan.textContent || '';
                if (label.includes('Java IP:')) {
                    valueSpan.textContent = window.currentJavaIP;
                } else if (label.includes('Bedrock IP:')) {
                    valueSpan.textContent = window.currentBedrockIP;
                } else if (label.includes('Bedrock Port:')) {
                    valueSpan.textContent = window.currentBedrockPort;
                }
            }
        });
    }

    // 3. GLOBAL MAINTENANCE SCREEN OVERLAY
    function showMaintenanceScreen() {
        // Prevent blocking the admin page itself so the admin can turn it off!
        if (window.location.pathname.includes('fb.html')) {
            return;
        }

        // Create background overlay
        const overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = '#030014';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.textAlign = 'center';
        overlay.style.padding = '20px';
        overlay.style.color = '#f8fafc';
        overlay.style.fontFamily = "'Plus Jakarta Sans', sans-serif";

        // Ambient glow blobs
        const glow1 = document.createElement('div');
        glow1.className = 'ambient-glow glow-1';
        glow1.style.opacity = '0.15';
        glow1.style.top = '20%';
        glow1.style.left = '20%';
        overlay.appendChild(glow1);

        const glow2 = document.createElement('div');
        glow2.className = 'ambient-glow glow-2';
        glow2.style.opacity = '0.15';
        glow2.style.bottom = '20%';
        glow2.style.right = '20%';
        overlay.appendChild(glow2);

        // Glass panel card
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.maxWidth = '550px';
        card.style.padding = '50px 40px';
        card.style.position = 'relative';
        card.style.boxShadow = '0 0 40px rgba(139, 92, 246, 0.2)';
        card.style.borderRadius = '24px';
        card.style.background = 'rgba(15, 23, 42, 0.55)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        card.style.backdropFilter = 'blur(16px)';

        // Icon
        const icon = document.createElement('div');
        icon.style.fontSize = '3.5rem';
        icon.style.marginBottom = '25px';
        icon.style.animation = 'pulseLogo 2s infinite ease-in-out';
        icon.textContent = '🛠️';
        card.appendChild(icon);

        // Title
        const title = document.createElement('h1');
        title.style.fontFamily = "'Outfit', sans-serif";
        title.style.fontSize = '2.5rem';
        title.style.fontWeight = '800';
        title.style.marginBottom = '15px';
        title.style.letterSpacing = '-0.5px';
        title.innerHTML = 'Maintenance <span style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Mode</span>';
        card.appendChild(title);

        // Description
        const desc = document.createElement('p');
        desc.style.color = '#94a3b8';
        desc.style.fontSize = '1.02rem';
        desc.style.lineHeight = '1.6';
        desc.style.marginBottom = '30px';
        desc.textContent = 'Dev SMP is currently undergoing updates to improve your gameplay experience. We will be back online shortly!';
        card.appendChild(desc);

        // Status Badge
        const badge = document.createElement('div');
        badge.className = 'hero-badge';
        badge.style.margin = '0 auto';
        badge.style.background = 'rgba(239, 68, 68, 0.1)';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        badge.style.color = '#ef4444';
        badge.innerHTML = '<span style="background-color: #ef4444; box-shadow: 0 0 8px #ef4444; width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span> Server Undergoing Maintenance';
        card.appendChild(badge);

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // Block scrolling
        document.body.style.overflow = 'hidden';
    }


    // 4. UNIVERSAL LIGHT/DARK THEME TOGGLER
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    const syncThemeTogglerIcon = () => {
        const isLight = document.body.classList.contains('light-theme');
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }
    };
    syncThemeTogglerIcon();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            syncThemeTogglerIcon();
        });
    }


    // 5. LOADING SCREEN CONTROLLER
    const loadingScreen = document.getElementById('loading-screen');
    const loaderBar = document.querySelector('.loader-bar');
    
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        if (loaderBar) {
            loaderBar.style.width = `${progress}%`;
        }
        
        if (progress === 100) {
            clearInterval(progressInterval);
        }
    }, 80);

    window.addEventListener('load', () => {
        clearInterval(progressInterval);
        if (loaderBar) {
            loaderBar.style.width = '100%';
        }
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
            }
        }, 400);
    });

    // Fallback loader closer
    setTimeout(() => {
        if (loadingScreen && loadingScreen.style.visibility !== 'hidden') {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
        }
    }, 4000);


    // 6. MOBILE NAVIGATION MENU
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isOpened = navLinks.classList.contains('active');
            navToggle.style.transform = isOpened ? 'rotate(90deg)' : 'rotate(0deg)';
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.style.transform = 'rotate(0deg)';
            });
        });
    }

    // Header scroll background modification
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // 7. LIVE MINIMALIST PARTICLE CANVAS BACKGROUND
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 45;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
                const hue = Math.random() > 0.5 ? 263 : 189; 
                const lightness = hue === 263 ? 65 : 43;
                this.color = `hsla(${hue}, 90%, ${lightness}%, ${Math.random() * 0.25 + 0.05})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };
        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }


    // 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (revealElements.length > 0) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    }


    // 9. MCSTATUS.IO STATUS TRACKER
    function initStatusTracker() {
        const statusText = document.getElementById('status-text');
        const statusIndicatorBadge = document.getElementById('status-indicator-badge');
        const statusPlayers = document.getElementById('status-players');
        const statusVersion = document.getElementById('status-version');
        const statusMOTD = document.getElementById('status-motd');
        const playerListContainer = document.getElementById('player-list-container');
        const playerTagsList = document.getElementById('player-tags-list');

        if (statusText) {
            // Re-resolve API url using loaded window.currentJavaIP
            const apiURL = `https://api.mcstatus.io/v2/status/java/${window.currentJavaIP}`;

            const fetchServerStatus = async () => {
                try {
                    const response = await fetch(apiURL);
                    if (!response.ok) throw new Error('API fetch error');
                    
                    const data = await response.json();
                    
                    statusText.classList.remove('skeleton', 'skeleton-text');
                    statusPlayers.classList.remove('skeleton', 'skeleton-text');
                    statusVersion.classList.remove('skeleton', 'skeleton-text');
                    statusMOTD.classList.remove('skeleton', 'skeleton-text');
                    statusText.removeAttribute('style');

                    if (data.online) {
                        statusIndicatorBadge.className = 'status-indicator online';
                        statusText.textContent = 'ONLINE';

                        const playersOnline = data.players.online;
                        const playersMax = data.players.max;
                        statusPlayers.textContent = `${playersOnline} / ${playersMax}`;

                        statusVersion.textContent = (data.version && data.version.name_clean) || '1.20+';

                        if (data.motd && data.motd.html) {
                            statusMOTD.innerHTML = data.motd.html;
                        } else if (data.motd && data.motd.clean) {
                            statusMOTD.textContent = data.motd.clean;
                        } else {
                            statusMOTD.textContent = 'Welcome to Dev SMP!';
                        }

                        if (data.players.list && data.players.list.length > 0) {
                            playerListContainer.style.display = 'block';
                            playerTagsList.innerHTML = '';

                            data.players.list.forEach(player => {
                                const playerName = player.name_clean || player.name_raw || player.name || player;
                                if (!playerName) return;

                                const playerTag = document.createElement('span');
                                playerTag.className = 'player-tag';
                                
                                const avatarImg = document.createElement('img');
                                avatarImg.className = 'player-avatar';
                                avatarImg.src = `https://minotar.net/avatar/${playerName}/18`;
                                avatarImg.alt = playerName;
                                avatarImg.onerror = () => {
                                    avatarImg.src = 'https://minotar.net/avatar/MHF_Steve/18';
                                };

                                playerTag.appendChild(avatarImg);
                                playerTag.appendChild(document.createTextNode(` ${playerName}`));
                                playerTagsList.appendChild(playerTag);
                            });
                        } else {
                            playerListContainer.style.display = 'none';
                        }
                    } else {
                        setServerOffline();
                    }
                } catch (error) {
                    console.error('Error fetching Minecraft server status:', error);
                    setServerOffline();
                }
            };

            const setServerOffline = () => {
                statusText.classList.remove('skeleton', 'skeleton-text');
                statusPlayers.classList.remove('skeleton', 'skeleton-text');
                statusVersion.classList.remove('skeleton', 'skeleton-text');
                statusMOTD.classList.remove('skeleton', 'skeleton-text');
                statusText.removeAttribute('style');

                statusIndicatorBadge.className = 'status-indicator offline';
                statusText.textContent = 'OFFLINE';
                statusPlayers.textContent = '0 / 0';
                statusVersion.textContent = '1.20+';
                statusMOTD.innerHTML = `<span style="color: var(--danger)">Server is currently sleeping.</span><br>Start it up on Aternos to join the adventure!`;
                playerListContainer.style.display = 'none';
            };

            fetchServerStatus();
            setInterval(fetchServerStatus, 60000);
        }
    }

    // Initialize config fetch on load
    loadDatabaseConfig();
});

// 10. COPY TO CLIPBOARD FUNCTION
function copyIP(ipAddress, platformName, port = '') {
    // Dynamic override from global firebase configurations
    let textToCopy = port ? `${ipAddress}:${port}` : ipAddress;
    if (platformName === 'Java IP' && window.currentJavaIP) {
        textToCopy = window.currentJavaIP;
    } else if (platformName === 'Bedrock IP' && window.currentBedrockIP) {
        const bdPort = window.currentBedrockPort || '19132';
        textToCopy = `${window.currentBedrockIP}:${bdPort}`;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied ${platformName} Address!`);
    }).catch(err => {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast(`Copied ${platformName} Address!`);
        } catch (copyErr) {
            console.error('Failed to copy IP address: ', copyErr);
        }
        document.body.removeChild(textArea);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast-alert');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
