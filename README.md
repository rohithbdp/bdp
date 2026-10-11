# Devapriya Rohith Bolamala - Portfolio

A responsive portfolio for Devapriya Rohith Bolamala, based in Livonia, Michigan.

## Run locally

From this repository:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. No build step or production dependencies are required.

## Features

- Cream/navy/orange design with a matching dark theme. The initial theme follows the device preference; an explicit choice is remembered.
- Featured Optum IMN Batch / healthcare EDI overview, past cloud services work, and this portfolio's source.
- Career history, technical skills, education, AWS credential, and a nine-film cinema gallery with uncropped posters.
- Keyboard-accessible mobile menu, labeled form fields, visible focus states, reduced-motion support, and direct section links.
- Updated one-page resume, lightweight portrait, favicon, app icon, and social preview.
- Contact form with browser validation, duplicate-submit protection, timeout handling, accessible feedback, and direct email fallback. Only a confirmed success clears the fields.
- Network-first offline cache with paths that work at both a root domain and a GitHub Pages project URL.

## Content and assets

- `index.html`: content and semantic structure
- `style.css`: themes and responsive layouts
- `script.js`: navigation, themes, project disclosure, and contact handling
- `assets/rohith-portrait.jpg`: optimized portrait
- `assets/social-card.jpg`: social preview
- `resume.pdf`: current downloadable resume
- `sw.js` / `manifest.json`: offline support and installable app metadata

The healthcare diagram is a conceptual overview, not an internal architecture diagram. Project descriptions use information supplied in the portfolio and project notes; no performance metrics are invented.

## Checks

```sh
node --check script.js
node --check sw.js
node --test tests/contact-form.test.cjs
```

The contact tests simulate success, transport errors, invalid responses, timeouts, whitespace validation, and concurrent submissions. They do not send messages.

## Deployment

The current GitHub Pages address is https://rohithbdp.github.io/bdp/. Relative asset and service worker paths support that prefix. Update the canonical URL and social preview URL in `index.html` if using a custom domain.

The contact form uses the existing Formspree endpoint. A real delivery test still requires sending a message and checking the recipient inbox.

## Contact

- Email: rbolamala@gmail.com
- LinkedIn: https://www.linkedin.com/in/rbolamala/
- GitHub: https://github.com/rohithbdp
