# Journal API for n8n

This staging-only endpoint creates and edits unpublished Contao Journal news. It uses the installed `webwerkwien/contao-ai-core-bundle` commands, so Contao versions and audit logging remain intact. There is no publish or delete endpoint.

## Request

`POST https://staging.ertnerundso.de/_automation/journal`

Headers: `Authorization: Bearer <server token>` and `Content-Type: application/json`.

```json
{
  "locale": "de",
  "headline": "Beispielüberschrift",
  "teaser": "Kurze Zusammenfassung.",
  "body": "Erster Absatz.\n\nZweiter Absatz.",
  "date": "2026-10-07"
}
```

`date` is optional. `locale` selects the existing Journal (DE) or Journal (EN) archive. The response contains the news ID and always has `published: false`.

`PATCH https://staging.ertnerundso.de/_automation/journal/{id}` accepts one or more of `headline`, `teaser`, and `body`. Body updates are refused if the article no longer has exactly one API-created text element. Published articles are always refused. Plain text is HTML-escaped and blank lines create paragraphs; raw HTML is not accepted.

The bearer token lives only on the staging server in `/opt/ertnerundso-contao-staging/journal-api-token` and must be put into an n8n credential, never this public repository. The API has no production endpoint until separately deployed and approved.

## Staging integration

The staging Docker Compose service mounts the three source files into Contao and mounts the token read-only at `/run/secrets/journal_api_token`. The staging Composer autoload maps `App\\` to `journal-api/`; after deployment, refresh the Composer autoloader and clear the Contao cache. A dedicated Traefik router exposes only `/_automation/journal` without staging's HTTP basic auth, applies a rate limit, and leaves bearer authentication to this controller.

The current staging archive IDs are 3 (DE) and 4 (EN). Update `services.php` if those archives are ever recreated. The endpoint intentionally does not accept HTML, images, publish operations or arbitrary Contao fields. Review and publish drafts in the Contao backend.
