// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const header = document.getElementById('header');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const heroTitle = document.getElementById('heroTitle');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header styling on scroll - FIXED to maintain dark theme
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.background = 'rgba(19, 20, 20, 0.95)'; // Dark background
        header.style.backdropFilter = 'blur(20px)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
        
        // Change logo and nav links color for visibility on dark background
        document.querySelector('.logo').style.color = '#E73364';
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.style.color = '#FEFCE9';
        });
        
        // Change menu toggle color
        document.querySelectorAll('.menu-toggle span').forEach(span => {
            span.style.background = '#FEFCE9';
        });
    } else {
        header.style.background = 'rgba(254, 252, 233, 0.95)'; // Original light background
        header.style.backdropFilter = 'blur(10px)';
        header.style.boxShadow = 'none';
        
        // Reset colors
        document.querySelector('.logo').style.color = '#E73364';
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.style.color = '#131414';
        });
        
        document.querySelectorAll('.menu-toggle span').forEach(span => {
            span.style.background = '#131414';
        });
    }
});

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Form submission with enhanced validation and feedback

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const position = formData.get('position').trim();
    const message = formData.get('message').trim();

    // Enhanced validation
    if (!name || name.length < 2) {
        showFormMessage('Please enter a valid name (at least 2 characters).', 'error');
        return;
    }
    if (!email || !isValidEmail(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
    }
    if (!message || message.length < 10) {
        showFormMessage('Please tell us more about yourself (at least 10 characters).', 'error');
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Prepare data for Formspree
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(async response => {
        if (response.ok) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Application Sent!';
            submitBtn.style.background = '#28a745';
            showFormMessage(`Thank you, ${name}! Your application has been received. We'll get back to you soon.`, 'success');
            form.reset();
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '#E73364';
                submitBtn.disabled = false;
            }, 3000);
        } else {
            let errorMsg = 'Oops! Something went wrong. Please try again.';
            try {
                const data = await response.json();
                if (data && data.errors && data.errors.length > 0) {
                    errorMsg = data.errors.map(e => e.message).join(' ');
                }
            } catch (err) {
                // Not JSON, keep generic errorMsg
            }
            throw new Error(errorMsg);
        }
    })
    .catch(error => {
        submitBtn.innerHTML = '<i class=\"fas fa-times\"></i> Error!';
        submitBtn.style.background = '#c33';
        showFormMessage(error.message || 'Oops! Something went wrong. Please try again.', 'error');
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '#E73364';
            submitBtn.disabled = false;
        }, 3000);
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Form message display
function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    // Style the message
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        ${type === 'error' ? 
            'background: #fee; color: #c33; border: 1px solid #fcc;' : 
            'background: #efe; color: #363; border: 1px solid #cfc;'
        }
    `;
    
    // Insert message
    contactForm.insertBefore(messageDiv, contactForm.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            const currentValue = Math.floor(start);
            const suffix = element.textContent.match(/[+%/].*$/)?.[0] || '';
            element.textContent = currentValue + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            const suffix = element.textContent.match(/[+%/].*$/)?.[0] || '';
            element.textContent = target + suffix;
        }
    }
    updateCounter();
}

// Animate counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target.querySelector('.stat-number');
            const text = counter.textContent;
            // Custom animation for '24/7'
            if (text.trim() === '24/7' && !counter.classList.contains('animated')) {
                counter.classList.add('animated');
                let current = 0;
                const end = 24;
                const duration = 2000;
                const increment = end / (duration / 16);
                function animate247() {
                    current += increment;
                    if (current < end) {
                        counter.textContent = Math.floor(current) + '/7';
                        requestAnimationFrame(animate247);
                    } else {
                        counter.textContent = '24/7';
                    }
                }
                counter.textContent = '0/7';
                setTimeout(() => {
                    animate247();
                }, 500);
                return;
            }
            // Default animation for other stats
            if (text.includes('/')) return;
            const number = parseInt(text.replace(/[^0-9]/g, ''));
            if (number && !counter.classList.contains('animated')) {
                counter.classList.add('animated');
                // Reset counter
                const suffix = text.match(/[+%/].*$/)?.[0] || '';
                counter.textContent = '0' + suffix;
                // Animate
                setTimeout(() => {
                    animateCounter(counter, number);
                }, 500);
            }
        }
    });
}, { threshold: 0.5 });

// Observe stat items
document.querySelectorAll('.stat-item').forEach(item => {
    counterObserver.observe(item);
});

// Add ripple effect to CTA button
document.querySelector('.cta-button').addEventListener('click', function(e) {
    // Create ripple effect
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
});

// Portfolio item hover effects
document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// Add focus management for accessibility
document.querySelectorAll('a, button, input, textarea').forEach(element => {
    element.addEventListener('focus', function() {
        this.style.outline = '2px solid #E73364';
        this.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', function() {
        this.style.outline = 'none';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroElement = document.querySelector('.hero::before');
    
    // Apply parallax to hero pseudo-element via CSS custom property
    document.documentElement.style.setProperty('--parallax-offset', `${scrolled * 0.5}px`);
});

// Add CSS animations and styles via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .menu-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .menu-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    /* Parallax support */
    .hero::before {
        transform: translateY(var(--parallax-offset, 0px));
    }
    
    /* Enhanced mobile responsiveness */
    @media (max-width: 480px) {
        .hero-text h1 {
            font-size: 2rem;
        }
        
        .hero-text p {
            font-size: 1rem;
        }
        
        .section-title {
            font-size: 1.8rem;
        }
        
        .portfolio-grid {
            gap: 1.5rem;
        }
        
        .contact-form {
            padding: 1.5rem;
        }
        
        .hero-card {
            padding: 1.5rem;
        }
        
        .hero-card i {
            font-size: 3rem;
        }
    }
    
    /* Ensure icons load properly */
    i[class*="fa"]:before {
        display: inline-block;
        font-style: normal;
        font-variant: normal;
        text-rendering: auto;
        line-height: 1;
    }
    
    /* Loading state for icons */
    i[class*="fa"] {
        min-width: 1em;
        text-align: center;
    }
`;
document.head.appendChild(style);

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial parallax value
    document.documentElement.style.setProperty('--parallax-offset', '0px');
    
    // Trigger initial fade-in animations for visible elements
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }, 100);
    
    console.log('MARKTIST website loaded successfully! 🚀');
});

// Add typing animation to hero text (optional)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    const originalHTML = element.innerHTML;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '<') {
                // Handle HTML tags
                const tagEnd = text.indexOf('>', i);
                element.innerHTML += text.substring(i, tagEnd + 1);
                i = tagEnd + 1;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        }
    }
    type();
}

// Uncomment to enable typing animation
// window.addEventListener('load', () => {
//     setTimeout(() => {
//         typeWriter(heroTitle, 'We Create <span class="highlight">Digital</span> Experiences That Matter');
//     }, 1000);
// });
// Enhanced performance and features
(function() {
    'use strict';
    
    // Throttle function for scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Debounce function for resize events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Enhanced scroll handler with throttling
    const handleScroll = throttle(() => {
        const header = document.getElementById('header');
        if (window.scrollY > 100) {
            header.classList.add('dark-theme-nav');
        } else {
            header.classList.remove('dark-theme-nav');
        }
        
        // Update parallax
        document.documentElement.style.setProperty('--parallax-offset', `${window.pageYOffset * 0.3}px`);
    }, 16);
    
    window.addEventListener('scroll', handleScroll);
    
    // Enhanced resize handler
    const handleResize = debounce(() => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    // Intersection Observer for better performance
    const createObserver = (callback, options = {}) => {
        const defaultOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
            ...options
        };
        return new IntersectionObserver(callback, defaultOptions);
    };
    
    // Enhanced fade-in animation
    const fadeInObserver = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once animated
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '50px' });
    
    // Apply observers
    document.querySelectorAll('.fade-in').forEach(el => {
        fadeInObserver.observe(el);
    });
    
    // Enhanced form handling with better UX
    const enhancedFormHandler = (form) => {
        const inputs = form.querySelectorAll('input, textarea');
        
        // Add real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
        
        function validateField(e) {
            const field = e.target;
            const value = field.value.trim();
            
            // Remove existing error styling
            field.classList.remove('error');
            
            if (field.hasAttribute('required') && !value) {
                showFieldError(field, 'This field is required');
                return false;
            }
            
            if (field.type === 'email' && value && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            
            if (field.name === 'name' && value && value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters');
                return false;
            }
            
            if (field.name === 'message' && value && value.length < 10) {
                showFieldError(field, 'Message must be at least 10 characters');
                return false;
            }
            
            return true;
        }
        
        function showFieldError(field, message) {
            field.classList.add('error');
            
            // Remove existing error message
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }
        
        function clearFieldError(e) {
            const field = e.target;
            field.classList.remove('error');
            const errorMsg = field.parentNode.querySelector('.field-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    };
    
    // Apply enhanced form handling
    if (contactForm) {
        enhancedFormHandler(contactForm);
    }
    
    // Add loading indicator for the entire page
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Add entrance animations with stagger
        const animatedElements = document.querySelectorAll('.fade-in');
        animatedElements.forEach((el, index) => {
            setTimeout(() => {
                if (el.getBoundingClientRect().top < window.innerHeight) {
                    el.classList.add('visible');
                }
            }, index * 100);
        });
    });
    
    // Add CSS for enhanced styling
    const enhancedStyles = `
        /* Loading state */
        body:not(.loaded) {
            overflow: hidden;
        }
        
        body:not(.loaded)::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Field validation styling */
        .form-group input.error,
        .form-group textarea.error {
            border-color: #e74c3c;
            box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
        }
        
        .field-error {
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 0.25rem;
            animation: shake 0.3s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* Enhanced dark theme navigation */
        .dark-theme-nav {
            background: rgba(19, 20, 20, 0.95) !important;
            backdrop-filter: blur(20px);
            box-shadow: 0 2px 20px rgba(0,0,0,0.3);
            border-bottom: 1px solid rgba(231, 51, 100, 0.2);
        }
        
        /* Improved mobile experience */
        @media (max-width: 768px) {
            .dark-theme-nav .nav-links {
                background: rgba(19, 20, 20, 0.98) !important;
                backdrop-filter: blur(20px);
            }
        }
        
        /* Performance optimizations */
        * {
            will-change: auto;
        }
        
        .hero-card,
        .portfolio-item,
        .about-card {
            will-change: transform;
        }
        
        .fade-in {
            will-change: opacity, transform;
        }
        
        .fade-in.visible {
            will-change: auto;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = enhancedStyles;
    document.head.appendChild(styleSheet);
    
})();

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
