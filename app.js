// Main JavaScript for web3-secret-lit-protocol website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initScrollAnimations();
    initHeaderEffects();
    initParallaxEffects();
    initTypewriterEffect();
    
    // Show all content immediately to avoid hidden sections
    showAllContent();
});

// Show all content immediately
function showAllContent() {
    const allElements = document.querySelectorAll('.fade-in-up, .feature-card, .tech-item, .step');
    allElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.classList.add('visible');
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    const ctaButton = document.querySelector('.hero__cta[href^="#"]');
    
    // Add smooth scrolling to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state
                updateActiveNavLink(targetId);
            }
        });
    });
    
    // Add smooth scrolling to CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Ensure GitHub button works
    const githubButton = document.querySelector('a[href*="github.com"]');
    if (githubButton) {
        githubButton.addEventListener('click', function(e) {
            // Don't prevent default for external links
            console.log('Opening GitHub repository...');
        });
    }
}

// Scroll-triggered animations (simplified to avoid hiding content)
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add staggered animation for cards (but keep them visible)
                if (entry.target.classList.contains('features__grid')) {
                    const cards = entry.target.children;
                    Array.from(cards).forEach((card, index) => {
                        setTimeout(() => {
                            card.style.transform = 'translateY(0) scale(1.02)';
                            setTimeout(() => {
                                card.style.transform = 'translateY(0) scale(1)';
                            }, 200);
                        }, index * 100);
                    });
                }
                
                // Add staggered animation for tech items
                if (entry.target.classList.contains('tech-grid')) {
                    const items = entry.target.children;
                    Array.from(items).forEach((item, index) => {
                        setTimeout(() => {
                            item.style.transform = 'translateY(0) scale(1.05)';
                            setTimeout(() => {
                                item.style.transform = 'translateY(0) scale(1)';
                            }, 200);
                        }, index * 100);
                    });
                }
                
                // Add staggered animation for steps
                if (entry.target.classList.contains('steps')) {
                    const steps = entry.target.children;
                    Array.from(steps).forEach((step, index) => {
                        setTimeout(() => {
                            step.style.transform = 'translateX(10px)';
                            setTimeout(() => {
                                step.style.transform = 'translateX(0)';
                            }, 200);
                        }, index * 150);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .features__grid,
        .steps,
        .tech-grid
    `);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Header effects on scroll
function initHeaderEffects() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let isHeaderVisible = true;

    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;
        
        // Header background opacity based on scroll
        if (currentScrollY > 50) {
            header.style.background = 'rgba(17, 24, 34, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.background = 'rgba(17, 24, 34, 0.95)';
            header.style.boxShadow = 'none';
        }

        // Hide/show header on scroll direction change
        if (currentScrollY > lastScrollY && currentScrollY > 100 && isHeaderVisible) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
            isHeaderVisible = false;
        } else if (currentScrollY < lastScrollY && !isHeaderVisible) {
            // Scrolling up
            header.style.transform = 'translateY(0)';
            isHeaderVisible = true;
        }

        lastScrollY = currentScrollY;
        
        // Update active nav link
        updateActiveNavLinkOnScroll();
    }, 16));
}

// Update active navigation link based on scroll position
function updateActiveNavLinkOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Manual update for clicked nav items
function updateActiveNavLink(targetId) {
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

// Parallax effects for hero section
function initParallaxEffects() {
    const heroGlow = document.querySelector('.hero__glow');
    
    if (heroGlow) {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.scrollY;
            const rate = scrolled * -0.3;
            
            if (scrolled < window.innerHeight) {
                heroGlow.style.transform = `translateY(${rate}px) scale(${1 + scrolled * 0.0003})`;
            }
        }, 16));
    }
}

// Typewriter effect for hero subtitle
function initTypewriterEffect() {
    const subtitle = document.querySelector('.hero__subtitle');
    if (!subtitle) return;
    
    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.opacity = '1';
    
    let index = 0;
    const typeSpeed = 80;
    
    function typeWriter() {
        if (index < text.length) {
            subtitle.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, typeSpeed);
        }
    }
    
    // Start typewriter effect after a delay
    setTimeout(typeWriter, 800);
}

// Add mouse tracking effect to hero glow
document.addEventListener('mousemove', throttle((e) => {
    const heroGlow = document.querySelector('.hero__glow');
    if (heroGlow && window.scrollY < window.innerHeight) {
        const rect = heroGlow.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const deltaX = (mouseX - centerX) * 0.05;
        const deltaY = (mouseY - centerY) * 0.05;
        
        heroGlow.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
    }
}, 16));

// Easter egg: Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konami.length && 
        konamiCode.every((val, i) => val === konami[i])) {
        
        // Activate special effect
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 3000);
        
        konamiCode = [];
        console.log('🎉 Easter egg activated! Web3 colors inverted!');
    }
});

// Performance optimization: Throttle function
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

// Add enhanced hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards enhanced hover
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0deg)';
        });
    });
    
    // Tech items enhanced hover
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-6px) scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Steps enhanced hover
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            const number = this.querySelector('.step__number');
            if (number) {
                number.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            const number = this.querySelector('.step__number');
            if (number) {
                number.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
});

// Console message for developers
console.log(`
🔐 web3-secret-lit-protocol
Privacy • Security • Web3 Empowerment

Built with ❤️ for Web3 privacy
GitHub: https://github.com/govinda777/web3-secret-lit-protocol

Try the Konami code: ↑↑↓↓←→←→BA
`);

// Ensure all external links work properly
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
        console.log('Opening external link:', link.href);
    }
});

// Add loading states for better UX
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    console.log('🚀 Site loaded successfully!');
});