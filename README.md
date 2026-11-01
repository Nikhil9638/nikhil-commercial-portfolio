# Nikhil Modi: commercial portfolio

The commercial portfolio of Nikhil Modi, an independent website and web application developer. It's aimed at business owners, startups and companies looking for a professional website or custom digital solution.

**Live site:** <https://nikhil9638.github.io/nikhil-commercial-portfolio/>

## Features

- Services, industries, featured work, process, FAQ and enquiry sections written for non-technical readers
- A case study of Velora 2 using real screenshots
- An enquiry form that composes an email, with no backend or stored data
- Responsive layouts, keyboard and screen reader support, and reduced-motion support
- Search and link-preview metadata, a sitemap and `robots.txt`

## Project structure

```
index.html               All page content
css/styles.css           Design tokens, then one numbered block per section
js/main.js               Mobile menu, active navigation, enquiry form
favicon.svg, robots.txt, sitemap.xml
assets/fonts/            Bricolage Grotesque and IBM Plex Sans, with OFL licences
assets/icons/            PNG favicons
assets/og/og-image.png   Link-preview image, 1200 x 630
assets/projects/velora/  Real Velora 2 screenshots
tools/set-site-url.mjs   Writes canonical and sharing URLs, sitemap and robots.txt
tools/og.html            Source of the link-preview image
```

The site is plain HTML, CSS and JavaScript, with no build step or dependencies.

## Local setup

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

GitHub Pages publishes the `main` branch from the repository root, so pushing to `main` updates the live site. Every asset path is relative, which is what lets the site work under the `/nikhil-commercial-portfolio/` project path.

If the address changes, for example to a custom domain, run this and commit the result:

```bash
node tools/set-site-url.mjs https://example.com/
```

## Enquiry form

The form composes an email in the visitor's mail app, and the visitor sends it from there. The visitor also sees the full message with a copy button, in case no mail app opens. Very long messages are copied and pasted, because mail links have a length limit.

## Content rules

- **Public copy stays non-technical:** describe business benefits, not programming languages or tools.
- **Velora 2 stays accurate:** it was developed independently and tested locally, production deployment isn't confirmed, customers pay staff in person, and online card payment isn't implemented. Update the page when this changes. Its source code is private and must not be linked.
- **Illustrations stay labelled:** service drawings are examples, not completed work.
- **Industries aren't clients:** they're examples of solutions Nikhil can build.
- **Don't add** testimonials, client names, statistics or fixed prices unless they're real.
