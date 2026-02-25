# Changelog

## [1.1.0](https://github.com/keyenv/netlify-plugin/compare/netlify-plugin-v1.0.0...netlify-plugin-v1.1.0) (2026-02-25)


### Features

* rename package to @keyenv/netlify-plugin ([c11c39a](https://github.com/keyenv/netlify-plugin/commit/c11c39a093ae6c2651b6d3036d9d1cd1bd5de138))
* rename package to @keyenv/netlify-plugin ([c11c39a](https://github.com/keyenv/netlify-plugin/commit/c11c39a093ae6c2651b6d3036d9d1cd1bd5de138))
* rename package to @keyenv/netlify-plugin ([1d624fd](https://github.com/keyenv/netlify-plugin/commit/1d624fd37351a41ed6621e2f9c6a0e3d634d0752))


### Bug Fixes

* rename package to keyenv-netlify-plugin (unscoped) ([350cc9a](https://github.com/keyenv/netlify-plugin/commit/350cc9ae41736005f857f5923d36c0d99be5ef50))

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
