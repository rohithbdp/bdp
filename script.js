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
        }, 500);
    }, 1500);
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

// Custom Cursor (only for desktop)
if (!isMobile) {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });

    // Add hover effect to clickable elements
    const clickables = document.querySelectorAll('a, button, .skill-tag, .client-card');
    clickables.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursorFollower.style.transform = 'scale(2)';
        });
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorFollower.style.transform = 'scale(1)';
        });
    });
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// Smooth Scrolling for Navigation Links (moved after navLinks declaration)

// Navbar Background on Scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = body.getAttribute('data-theme') === 'dark' 
            ? 'rgba(10, 10, 10, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = body.getAttribute('data-theme') === 'dark' 
            ? 'rgba(10, 10, 10, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)';
        navbar.style.boxShadow = 'none';
    }
});

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

// Contact Form Handler with AJAX (no page redirect)
const contactForm = document.querySelector('.contact-form');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Get form data
    const formData = new FormData(contactForm);
    
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
            }
        });
        
        if (response.ok) {
            // Success - show message and reset form
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        } else {
            // Error - show message
            alert('Oops! There was a problem sending your message. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send message. Please try again later.');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
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


// Add names to form inputs
document.querySelector('input[placeholder="Your Name"]').setAttribute('name', 'name');
document.querySelector('input[placeholder="Your Email"]').setAttribute('name', 'email');
document.querySelector('textarea[placeholder="Your Message"]').setAttribute('name', 'message');

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