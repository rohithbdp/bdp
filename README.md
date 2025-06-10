# Portfolio Website

A modern, responsive portfolio website showcasing my experience as a Senior Software Engineer and AWS Solutions Architect.

## Features

- **Responsive Design**: Fully responsive layout that works on all devices
- **Dark/Light Theme**: Toggle between dark and light modes with persistent preference
- **Interactive Elements**: Custom cursor, smooth scrolling, and hover effects
- **Modern Animations**: Loading animation, scroll progress bar, CSS animations
- **Professional Timeline**: Work experience displayed in an elegant timeline format
- **Skills Showcase**: Technical skills organized by category (Languages, Leadership, Cloud, Architecture)
- **AWS Certification**: Direct link to Credly badge
- **Resume Download**: Downloadable PDF resume
- **Client Section**: Featured companies with logos

## Technologies Used

- HTML5
- CSS3 (with CSS Variables, Grid, and Flexbox)
- Vanilla JavaScript
- Font Awesome Icons
- Google Fonts (Inter)

## Structure

```
portfolio/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── script.js           # JavaScript for interactivity
├── profile-photo.jpg   # Profile image
├── resume.pdf          # Downloadable resume
└── README.md          # This file
```

## How to Run Locally

For the resume download feature to work properly, you need to serve the site through a web server:

### Option 1: Python (Recommended)
```bash
# Navigate to the project directory
cd /Users/bdprohith/bdp

# Start a local server
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Option 2: VS Code Live Server
If using VS Code, install the "Live Server" extension and right-click on index.html → "Open with Live Server"

### Note
Opening the HTML file directly (file://) will cause the resume download to navigate to the PDF instead of downloading it due to browser security restrictions.

## Customization

- Update personal information in `index.html`
- Modify color scheme using CSS variables in `style.css`
- Replace `resume.pdf` with your updated resume
- Add or remove sections as needed

## Contact

- Email: rbolamala@gmail.com
- LinkedIn: [linkedin.com/in/rbolamala](https://www.linkedin.com/in/rbolamala/)
- Phone: +1 (214) 506-8251