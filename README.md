# @keyenv/netlify-plugin

Netlify Build Plugin that automatically injects KeyEnv secrets into your builds.

## Features

- Injects secrets **before** the build starts
- Auto-detects the KeyEnv environment from the Netlify deploy context
- Supports custom context → environment mappings
- Zero configuration for standard setups

## Installation

```bash
npm install @keyenv/netlify-plugin --save-dev
```

Add the plugin to your `netlify.toml`:

```toml
[[plugins]]
  package = "@keyenv/netlify-plugin"
```

Then set `KEYENV_TOKEN` in **Site settings → Environment variables**.

## Configuration

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `environment` | KeyEnv environment name | No | Auto-detected |
| `project_id` | Project ID (optional if token is project-scoped) | No | – |
| `api_url` | KeyEnv API URL | No | `https://api.keyenv.dev` |
| `context_mapping` | Map Netlify contexts to KeyEnv environments | No | See below |

### Default context mapping

| Netlify context | KeyEnv environment |
|----------------|--------------------|
| `production` | `production` |
| `deploy-preview` | `staging` |
| `branch-deploy` | `development` |
| `dev` | `development` |

## Examples

### Basic setup

```toml
[[plugins]]
  package = "@keyenv/netlify-plugin"
```

### With explicit environment

```toml
[[plugins]]
  package = "@keyenv/netlify-plugin"

  [plugins.inputs]
    environment = "production"
```

### Custom context mapping

```toml
[[plugins]]
  package = "@keyenv/netlify-plugin"

  [plugins.inputs.context_mapping]
    production = "prod"
    deploy-preview = "preview"
    branch-deploy = "dev"
```

## Development

```bash
# Run tests
node --test src/__tests__/index.test.js
```

## License

MIT
