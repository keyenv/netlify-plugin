# Changelog

## 1.0.0 (2026-02-25)


### Features

* initial release of @keyenv/netlify-plugin v1.0.0 ([950dacd](https://github.com/keyenv/netlify-plugin/commit/950dacd7a2fbd239176cbf942b2e6462b39421ce))

## [1.0.0] - Initial release

### Features

- Netlify Build Plugin that injects KeyEnv secrets before the build starts
- Auto-detects KeyEnv environment from Netlify deploy context
- Default mapping: `production` → `production`, `deploy-preview` → `staging`, `branch-deploy` → `development`
- Custom `context_mapping` support
- Explicit `environment` input override
- Optional `project_id` and `api_url` inputs
- Fails the build with a clear message on auth errors
