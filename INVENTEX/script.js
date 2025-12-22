document.addEventListener('DOMContentLoaded', () => {
    const parallaxItems = document.querySelectorAll('.parallax-item');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    parallaxItems.forEach(item => {
        observer.observe(item);
    });

    // Advanced Parallax on Scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-speed]');

        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed');
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
});
