// @keyenv/netlify-plugin
// Netlify Build Plugin that injects KeyEnv secrets before the build starts.

const DEFAULT_API_URL = 'https://api.keyenv.dev';

// Default mapping from Netlify deploy contexts to KeyEnv environment names.
const DEFAULT_CONTEXT_MAP = {
  production: 'production',
  'deploy-preview': 'staging',
  'branch-deploy': 'development',
  dev: 'development',
};

/**
 * Fetch secrets from the KeyEnv API and return them as an array of key-value objects.
 */
async function fetchSecrets({ token, projectId, environment, apiUrl }) {
  const url = projectId
    ? `${apiUrl}/api/v1/projects/${projectId}/environments/${environment}/secrets/export`
    : `${apiUrl}/api/v1/environments/${environment}/secrets/export`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'keyenv-netlify-plugin/1.0.0',
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // ignore JSON parse errors
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication failed: ${message}`);
    }
    if (response.status === 404) {
      throw new Error(`Project or environment not found: ${message}`);
    }
    throw new Error(`KeyEnv API error (${response.status}): ${message}`);
  }

  const data = await response.json();
  return data.data ?? [];
}

/**
 * Resolve the KeyEnv environment name from plugin inputs and the Netlify deploy context.
 */
function resolveEnvironment({ inputs, deployContext }) {
  // Explicit environment input takes priority.
  if (inputs.environment) {
    return inputs.environment;
  }

  // Apply custom context_mapping if provided.
  const contextMapping = inputs.context_mapping ?? {};
  const merged = { ...DEFAULT_CONTEXT_MAP, ...contextMapping };

  return merged[deployContext] ?? 'production';
}

// ─── Plugin Definition ───────────────────────────────────────────────────────

export const onPreBuild = async ({ inputs, utils }) => {
  const token = process.env.KEYENV_TOKEN;

  if (!token) {
    utils.build.failBuild(
      'Plugin failed: KEYENV_TOKEN environment variable is not set. ' +
        'Add it in Site settings → Environment variables.'
    );
    return;
  }

  const apiUrl = (inputs.api_url ?? process.env.KEYENV_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');
  const projectId = inputs.project_id ?? process.env.KEYENV_PROJECT_ID ?? undefined;

  // Netlify exposes the deploy context via CONTEXT env var.
  const deployContext = process.env.CONTEXT ?? 'production';
  const environment = resolveEnvironment({ inputs, deployContext });

  console.log(`[KeyEnv] Fetching secrets for environment "${environment}" (Netlify context: "${deployContext}")`);

  let secrets;
  try {
    secrets = await fetchSecrets({ token, projectId, environment, apiUrl });
  } catch (error) {
    utils.build.failBuild(`Plugin failed: ${error.message}`);
    return;
  }

  // Inject secrets into process.env so they are available during the build.
  let injected = 0;
  for (const secret of secrets) {
    if (secret.key && secret.value !== undefined) {
      process.env[secret.key] = secret.value;
      injected++;
    }
  }

  console.log(`[KeyEnv] Injected ${injected} secret(s) into the build environment.`);
};

