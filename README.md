# Personal security research site

Requires Hugo **extended 0.166.0** and the `themes/freaky` Git submodule.

## Development

Run `hugo server --disableFastRender --poll 1s`. Development is noindex and uses localhost. Add `-D` only when reviewing drafts.

## Production

Run `powershell -File scripts/build-production.ps1`. The script checks the Hugo version, initializes submodules, builds into a fresh temporary directory, and rejects localhost URLs and LiveReload. Publish the printed directory, not the development `public/` folder. The production URL is https://baranertemir.com/.

GitHub Pages is the selected host; repository connection is pending. Configure HTTPS, preferred-domain redirects and a real 404 response. Verify those on the deployed site. Preview builds must use `--environment preview`; private previews also need hosting access control. robots.txt does not protect private content.

### GitHub Pages setup

The workflow in `.github/workflows/pages.yml` installs Hugo Extended 0.166.0 with a verified release SHA-256, checks out submodules, tests publication rules, and builds production. Pull requests only build; deployment runs only on the default branch. Push triggers cover main/master; adjust if the repository uses another default branch.

In repository Settings > Pages choose **GitHub Actions**, set the custom domain to **baranertemir.com**, configure the domain's DNS, then enable Enforce HTTPS after certificate provisioning. For Actions deployments a CNAME file does not configure the custom domain: the repository setting is required. See [GitHub custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

The workflow has not run on GitHub yet. A repository URL and its existing state must be checked before connecting and pushing this checkout.

## Content conventions

Create drafts with `hugo new content articles/my-research.md` or `hugo new content blogs/my-note.md`.

- Write a unique title and description. Publish only after replacing every placeholder.
- Suggested categories: Web Application Security, Threat Intelligence, Reverse Engineering, Linux. Use only categories represented by real content; do not create empty landing pages.
- Use a few specific tags supported by the text, such as authentication or session-security. Add CVE/CWE/ATT&CK identifiers only with verified relevance and authoritative references.
- Record tested versions, dates, methodology, evidence, limitations, mitigations and disclosure details where relevant. Never invent research or credentials.
- Set `lastmod` only for substantive updates; it defaults to the publication date.
- `images` accepts site-relative paths or page resource names. Set `image_alt` to describe the actual image. The global fallback is images/social-card.png.
- `noindex: true` excludes a page from the sitemap and emits a robots meta directive. Empty section/taxonomy pages are also noindex and omitted.
- English is currently the only language. Add real Hugo translations before using hreflang; the template emits translation links automatically.
- Add contextual links to related research as it becomes available.

## Pending live verification

- Hosting HTTPS, redirects, cache and actual HTTP 404 behavior.
- Search Console ownership verification, sitemap submission and URL inspection.
- Google Rich Results Test on the deployed homepage and a completed article.
- Replace the two existing placeholder drafts with original content before publishing them.

Site-level templates override the theme so SEO changes survive theme updates. Existing modifications inside the theme remain in place.

## Validation and maintenance

### Turnstile activation

Create a Managed Cloudflare Turnstile widget for `baranertemir.com` and `www.baranertemir.com`. Store its secret ONLY in Formspree Settings > CAPTCHA > Cloudflare Turnstile and enable CAPTCHA protection. Put the public site key in `params.turnstile_site_key`. Until both steps are complete, the integration is not active. Never put the secret in Hugo configuration or Git. Use a separate test widget/key for local testing.

The browser sends `cf-turnstile-response` with the AJAX payload and refreshes the challenge after every attempted request. Missing/expired tokens prevent client submissions, while Formspree must enforce validation server-side. Verify both a valid submission and rejection without a token before calling the protection complete.

Run `powershell -File scripts/check-site.ps1` for isolated draft/future/noindex/metadata checks. Test fixtures and output live in a new temporary directory, leaving site content unchanged.

Site CSS and JavaScript now live in `assets/css/style.css` and `assets/js/main.js`. Hugo minifies and fingerprints these resources. The site index and base templates override the theme to load them. Edit those copies for future changes. The source avatar is in `assets/images/` and Hugo generates 168/336px WebP variants. The original static avatar remains available for existing URLs and schema.

The contact form submits email, purpose and message to the Formspree endpoint configured by `params.contact_endpoint`. The recipient address and email verification are managed in the owner's Formspree dashboard. The public endpoint is not an API secret. The form prevents concurrent submissions, preserves text on failure and resets only on an accepted response. Provider acceptance does not prove delivery to the recipient's inbox. Enable domain restrictions and spam protection in Formspree as needed.

Hosting follow-up: configure compression and long-lived cache for fingerprinted assets, shorter cache for HTML, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a tested CSP. Account for inline role configuration, optional inline theme styles, Google Fonts and development LiveReload before enforcing CSP. Add HSTS only once HTTPS and all affected subdomains are verified. These are deployment tasks, not active headers supplied by this repository.
