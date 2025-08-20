# MARKTIST Beta Website

Welcome to the beta version of the MARKTIST website! This project showcases a modern digital marketing agency landing page, built with HTML, CSS, and JavaScript, featuring custom fonts, responsive design, and progressive web app (PWA) support.

## Features

- **Responsive Design:** Mobile-first layout with smooth navigation and animations.
- **Custom Fonts:** Uses Clash Display and League Spartan for a unique look.
- **Portfolio Showcase:** Highlights recent projects and marketing campaigns.
- **Contact Form:** Integrated with Web3Forms for secure submissions.
- **PWA Support:** Offline access and caching via a service worker (`sw.js`).
- **Accessibility:** Keyboard navigation and focus management.
- **Modern UI:** Includes Font Awesome icons and interactive effects.

## Folder Structure

```
beta testing/
├── 404.html
├── beta.html
├── index.html
├── script.js
├── styles.css
├── sw.js
├── Fonts/
│   ├── CD/ (Clash Display fonts)
│   └── LS/ (League Spartan fonts)
└── ...
```

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/marktist-beta.git
   cd marktist-beta/beta\ testing
   ```
2. **Open `index.html` in your browser.**
3. **For PWA features:**
   - The service worker (`sw.js`) is registered automatically if served from the root of the `beta testing` folder.
   - For full offline support, use a local server (e.g., VS Code Live Server, Python's `http.server`, etc.).

## Deployment

- Upload the contents of the `beta testing` folder to your web server.
- Ensure the root path matches the asset paths in `index.html` and `sw.js`.

## Customization

- Update portfolio items, contact info, and branding in `index.html`.
- Adjust styles in `styles.css` as needed.
- Add or remove fonts in the `Fonts/` directory.

## License

This project is for demonstration and beta testing purposes. Please contact the MARKTIST team for production use or licensing inquiries.

---

**Contact:** contactmarktist@proton.me

**© 2025 MARKTIST. All rights reserved.**
