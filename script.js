// Loading Animation
window.addEventListener('load', () => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const loader = document.querySelector('.loader-wrapper');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }, 800);
});

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const progressBar = document.querySelector('.progress-bar');
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / scrollHeight) * 100;
    progressBar.style.width = scrolled + '%';
});

// Force scroll to top on initial page load
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// Remove any hash from URL on load to prevent auto-scrolling
if (window.location.hash) {
    window.location.hash = '';
}

// Check if device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Get navbar element first
const navbar = document.querySelector('.navbar');

// Function to update navbar background
function updateNavbarBackground() {
    const scrolled = window.scrollY > 100;
    
    // Remove inline styles to let CSS handle it
    navbar.style.background = '';
    navbar.style.boxShadow = '';
    
    if (scrolled) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const toggleIcon = themeToggle.querySelector('.toggle-icon');

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
    // No need to call updateNavbarBackground as CSS handles it automatically
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        // In dark mode, show sun emoji
        toggleIcon.textContent = '☀️';
    } else {
        // In light mode, show moon emoji
        toggleIcon.textContent = '🌙';
    }
}

// Update navbar on scroll
window.addEventListener('scroll', updateNavbarBackground);

// Initial navbar background
updateNavbarBackground();

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on a nav link and smooth scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Close mobile menu
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
        
        // Smooth scroll to section
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for Fade In Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply observer to sections
const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});

// Contact Form Handler - Button click instead of form submit
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('submit-btn');
    const contactForm = document.getElementById('contact-form');
    
    if (submitButton && contactForm) {
        submitButton.addEventListener('click', async function() {
            // Manual validation since it's not a form anymore
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Create form data manually
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('message', message);
            
            // Disable submit button and show loading
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            
            try {
                // Submit to Formspree via AJAX
                const response = await fetch('https://formspree.io/f/xblygbnn', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    },
                    mode: 'cors'
                });
                
                if (response.ok) {
                    // Success - show message and reset form
                    alert('Thank you for your message! I will get back to you soon.');
                    // Clear the form fields manually
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('message').value = '';
                } else {
                    // Check if it's actually successful (Formspree returns 200 even with CORS)
                    const data = await response.json().catch(() => null);
                    if (response.status === 200 || response.status === 201) {
                        alert('Thank you for your message! I will get back to you soon.');
                        // Clear the form fields
                        document.getElementById('name').value = '';
                        document.getElementById('email').value = '';
                        document.getElementById('message').value = '';
                    } else {
                        alert('Oops! There was a problem sending your message. Please try again.');
                    }
                }
            } catch (error) {
                // Check if it's a CORS error but the message was still sent
                if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                    // Assume success if CORS error (Formspree often sends despite CORS)
                    alert('Thank you for your message! I will get back to you soon.');
                    // Clear the form fields
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('message').value = '';
                } else {
                    console.error('Error:', error);
                    alert('Failed to send message. Please try again later.');
                }
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            }
        });
    }
});

// Typing Effect for Hero Title (adjusted for mobile)
const heroTitle = document.querySelector('.hero-text h1');
const text = heroTitle.textContent;
heroTitle.textContent = '';
let index = 0;

function typeWriter() {
    if (index < text.length) {
        heroTitle.textContent += text.charAt(index);
        index++;
        // Faster typing on mobile for better UX
        const delay = isMobile ? 50 : 100;
        setTimeout(typeWriter, delay);
    }
}

// Start typing effect when page loads
window.addEventListener('load', () => {
    // Shorter delay on mobile
    const initialDelay = isMobile ? 200 : 500;
    setTimeout(typeWriter, initialDelay);
});

// Parallax Effect for Hero Background (disabled on mobile for performance)
if (!isMobile) {
    const heroBg = document.querySelector('.animated-bg');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    });
}


// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Add names to form inputs (already in HTML now, but keeping for safety)
    const nameInput = document.querySelector('input[placeholder="Your Name"]');
    const emailInput = document.querySelector('input[placeholder="Your Email"]');
    const messageInput = document.querySelector('textarea[placeholder="Your Message"]');
    
    if (nameInput && !nameInput.name) nameInput.setAttribute('name', 'name');
    if (emailInput && !emailInput.name) emailInput.setAttribute('name', 'email');
    if (messageInput && !messageInput.name) messageInput.setAttribute('name', 'message');
});

// Force download of resume
document.addEventListener('DOMContentLoaded', function() {
    const resumeLink = document.querySelector('a[download="Rohith_Devapriya_Resume.pdf"]');
    if (resumeLink) {
        resumeLink.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                // Fetch the PDF file
                const response = await fetch('resume.pdf');
                const blob = await response.blob();
                
                // Create a blob URL
                const url = window.URL.createObjectURL(blob);
                
                // Create a temporary link and trigger download
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Rohith_Devapriya_Resume.pdf';
                document.body.appendChild(a);
                a.click();
                
                // Cleanup
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error('Download failed:', error);
                // Fallback to normal download
                window.location.href = 'resume.pdf';
            }
            
            return false;
        });
    }
});