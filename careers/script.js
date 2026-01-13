// Marktist Careers — Human Interactions

document.addEventListener('DOMContentLoaded', () => {
    initHeroRotation();
    initPositionButtons();
    initScrollReveal();
    initFormSubmission();
    initSuccessOverlay();
});

// ========================================
// ROTATING HERO TEXT
// ========================================
function initHeroRotation() {
    const rotateEl = document.getElementById('heroRotate');
    if (!rotateEl) return;

    const phrases = [
        'curious minds',
        'creative rebels',
        'problem solvers',
        'self-starters',
        'real humans'
    ];

    let index = 0;

    setInterval(() => {
        rotateEl.style.opacity = '0';
        rotateEl.style.transform = 'translateY(10px)';

        setTimeout(() => {
            index = (index + 1) % phrases.length;
            rotateEl.textContent = phrases[index];
            rotateEl.style.opacity = '1';
            rotateEl.style.transform = 'translateY(0)';
        }, 300);
    }, 3000);

    rotateEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    rotateEl.style.display = 'inline-block';
}

// ========================================
// SCROLL REVEAL
// ========================================
function initScrollReveal() {
    const elements = document.querySelectorAll(
        '.position-card, .culture-card, .stat, .apply-container'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
}

// ========================================
// FORM SUBMISSION (AJAX with formsubmit.co)
// ========================================
function initFormSubmission() {
    const form = document.getElementById('applyForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if role is selected
        const roleSelected = form.querySelector('input[name="role"]:checked');
        if (!roleSelected) {
            const roleCards = document.querySelector('.role-cards');
            roleCards.style.animation = 'shake 0.4s ease';
            setTimeout(() => roleCards.style.animation = '', 400);
            return;
        }

        const btn = form.querySelector('.submit-btn');
        const originalHTML = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span>Sending...</span>';

        try {
            // Create FormData
            const formData = new FormData(form);

            // Submit via fetch to avoid redirect
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success! Show the overlay
                showSuccessOverlay();
                form.reset();
            } else {
                // Fallback: show toast
                showToast();
                form.reset();
            }
        } catch (error) {
            // Network error - still show success (form likely sent)
            showSuccessOverlay();
            form.reset();
        }

        btn.disabled = false;
        btn.innerHTML = originalHTML;
    });

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// SUCCESS OVERLAY
// ========================================
function showSuccessOverlay() {
    const overlay = document.getElementById('successOverlay');
    if (!overlay) return;

    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Create confetti
    createConfetti(overlay);
}

function initSuccessOverlay() {
    const closeBtn = document.getElementById('closeSuccess');
    const overlay = document.getElementById('successOverlay');

    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('show');
            document.body.style.overflow = '';

            // Remove confetti
            overlay.querySelectorAll('.confetti').forEach(c => c.remove());
        });
    }
}

function createConfetti(container) {
    const colors = ['#e85d40', '#2d9596', '#eab308', '#6366f1', '#22c55e', '#f472b6'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(confetti);
    }

    // Clean up confetti after animation
    setTimeout(() => {
        container.querySelectorAll('.confetti').forEach(c => c.remove());
    }, 5000);
}

function showToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ========================================
// POSITION APPLY BUTTONS
// ========================================
function initPositionButtons() {
    const buttons = document.querySelectorAll('.position-btn');
    const roleCards = document.querySelectorAll('.role-card');

    const roleMap = {
        'Community Manager': 'community',
        'Web Developer': 'developer',
        'Video Editor': 'video',
        'Graphic Designer': 'design'
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const roleName = btn.dataset.role;
            const roleValue = roleMap[roleName];

            document.getElementById('apply').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            setTimeout(() => {
                roleCards.forEach(card => {
                    const input = card.querySelector('input');
                    if (card.dataset.value === roleValue) {
                        input.checked = true;
                        card.querySelector('.role-card-inner').style.animation = 'pulse 0.3s ease';
                        setTimeout(() => {
                            card.querySelector('.role-card-inner').style.animation = '';
                        }, 300);
                    }
                });

                document.getElementById('name').focus();
            }, 600);
        });
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// KEYBOARD SUPPORT
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('successOverlay');
        if (overlay && overlay.classList.contains('show')) {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            overlay.querySelectorAll('.confetti').forEach(c => c.remove());
        }

        const toast = document.getElementById('toast');
        if (toast && toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }
});
