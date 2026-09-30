# ERTNER&SO Contao CSS delivery

This public repository contains only the compiled stylesheet used on the
ERTNER&SO Contao staging site. The source, images, and font files are kept in
the private `ertnerundso-contao-frontend` repository and on the staging site.

Do not edit the CSS directly. Build and export it from the private source with
`npm run export:staging-css`, then commit and push both the current `site.css`
and the immutable `site-<hash>.css`. The Contao template loads the immutable
file so a later CSS release cannot silently break an existing page.
