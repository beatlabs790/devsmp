// Apply theme immediately before window load to prevent white flashes
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
})();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // 1. UNIVERSAL LIGHT/DARK THEME TOGGLER
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Sync toggle button icon state on page load
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


    // 2. LOADING SCREEN CONTROLLER
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


    // 3. MOBILE NAVIGATION MENU
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


    // 4. LIVE MINIMALIST PARTICLE CANVAS BACKGROUND
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
                // Colors match theme (Purple / Cyan)
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


    // 5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
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


    // 6. SERVER STATUS INTEGRATION (using mcstatus.io API)
    const serverIP = 'DevuncopySMP.aternos.me:60456';
    const apiURL = `https://api.mcstatus.io/v2/status/java/${serverIP}`;

    const statusText = document.getElementById('status-text');
    const statusIndicatorBadge = document.getElementById('status-indicator-badge');
    const statusPlayers = document.getElementById('status-players');
    const statusVersion = document.getElementById('status-version');
    const statusMOTD = document.getElementById('status-motd');
    const playerListContainer = document.getElementById('player-list-container');
    const playerTagsList = document.getElementById('player-tags-list');

    if (statusText) {
        const fetchServerStatus = async () => {
            try {
                const response = await fetch(apiURL);
                if (!response.ok) throw new Error('API fetch error');
                
                const data = await response.json();
                
                // Clear skeleton animation classes
                statusText.classList.remove('skeleton', 'skeleton-text');
                statusPlayers.classList.remove('skeleton', 'skeleton-text');
                statusVersion.classList.remove('skeleton', 'skeleton-text');
                statusMOTD.classList.remove('skeleton', 'skeleton-text');
                statusText.removeAttribute('style');

                if (data.online) {
                    // Online Badge
                    statusIndicatorBadge.className = 'status-indicator online';
                    statusText.textContent = 'ONLINE';

                    // Player count
                    const playersOnline = data.players.online;
                    const playersMax = data.players.max;
                    statusPlayers.textContent = `${playersOnline} / ${playersMax}`;

                    // Version
                    statusVersion.textContent = (data.version && data.version.name_clean) || '1.20+';

                    // MOTD HTML (mcstatus.io returns a single html string)
                    if (data.motd && data.motd.html) {
                        statusMOTD.innerHTML = data.motd.html;
                    } else if (data.motd && data.motd.clean) {
                        statusMOTD.textContent = data.motd.clean;
                    } else {
                        statusMOTD.textContent = 'Welcome to Dev SMP!';
                    }

                    // Render player list
                    if (data.players.list && data.players.list.length > 0) {
                        playerListContainer.style.display = 'block';
                        playerTagsList.innerHTML = '';

                        data.players.list.forEach(player => {
                            // Extract name (mcstatus.io structures list with player objects)
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

        // Fetch immediately and refresh every 60 seconds
        fetchServerStatus();
        setInterval(fetchServerStatus, 60000);
    }
});

// 7. COPY TO CLIPBOARD FUNCTION
function copyIP(ipAddress, platformName, port = '') {
    const textToCopy = port ? `${ipAddress}:${port}` : ipAddress;
    
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
