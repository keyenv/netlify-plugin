import { describe, it, mock, before, after } from 'node:test';
import assert from 'node:assert/strict';

// We test the exported module by loading it directly and calling onPreBuild.
const { onPreBuild } = await import('../index.js');

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeUtils({ failMessages = [] } = {}) {
  return {
    build: {
      failBuild: (msg) => {
        failMessages.push(msg);
        throw new Error(msg);
      },
    },
  };
}

function mockFetch(secrets, { status = 200 } = {}) {
  global.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => ({ data: secrets }),
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('@keyenv/netlify-plugin', () => {
  let origEnv;

  before(() => {
    origEnv = { ...process.env };
  });

  after(() => {
    // Restore original env
    for (const key of Object.keys(process.env)) {
      if (!(key in origEnv)) delete process.env[key];
    }
    Object.assign(process.env, origEnv);
  });

  it('injects secrets into process.env', async () => {
    process.env.KEYENV_TOKEN = 'test-token';
    process.env.CONTEXT = 'production';
    delete process.env.MY_SECRET;

    mockFetch([{ key: 'MY_SECRET', value: 'hello' }]);

    const utils = makeUtils();
    await onPreBuild({ inputs: {}, utils });

    assert.equal(process.env.MY_SECRET, 'hello');
  });

  it('fails build when KEYENV_TOKEN is missing', async () => {
    delete process.env.KEYENV_TOKEN;
    const messages = [];
    const utils = makeUtils({ failMessages: messages });

    await assert.rejects(
      () => onPreBuild({ inputs: {}, utils }),
      /KEYENV_TOKEN/
    );
  });

  it('maps deploy-preview context to staging by default', async () => {
    process.env.KEYENV_TOKEN = 'test-token';
    process.env.CONTEXT = 'deploy-preview';

    let capturedUrl;
    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      };
    };

    const utils = makeUtils();
    await onPreBuild({ inputs: {}, utils });

    assert.ok(capturedUrl.includes('/staging/'), `Expected staging in URL, got: ${capturedUrl}`);
  });

  it('uses explicit environment input over context detection', async () => {
    process.env.KEYENV_TOKEN = 'test-token';
    process.env.CONTEXT = 'deploy-preview';

    let capturedUrl;
    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      };
    };

    const utils = makeUtils();
    await onPreBuild({ inputs: { environment: 'production' }, utils });

    assert.ok(capturedUrl.includes('/production/'), `Expected production in URL, got: ${capturedUrl}`);
  });

  it('respects custom context_mapping', async () => {
    process.env.KEYENV_TOKEN = 'test-token';
    process.env.CONTEXT = 'deploy-preview';

    let capturedUrl;
    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      };
    };

    const utils = makeUtils();
    await onPreBuild({
      inputs: { context_mapping: { 'deploy-preview': 'preview' } },
      utils,
    });

    assert.ok(capturedUrl.includes('/preview/'), `Expected preview in URL, got: ${capturedUrl}`);
  });

  it('includes project_id in the URL when provided', async () => {
    process.env.KEYENV_TOKEN = 'test-token';
    process.env.CONTEXT = 'production';

    let capturedUrl;
    global.fetch = async (url) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      };
    };

    const utils = makeUtils();
    await onPreBuild({ inputs: { project_id: 'proj_123' }, utils });

    assert.ok(capturedUrl.includes('/proj_123/'), `Expected project_id in URL, got: ${capturedUrl}`);
  });

  it('fails build on 401 response', async () => {
    process.env.KEYENV_TOKEN = 'bad-token';
    process.env.CONTEXT = 'production';

    global.fetch = async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Invalid token' }),
    });

    const messages = [];
    const utils = makeUtils({ failMessages: messages });

    await assert.rejects(
      () => onPreBuild({ inputs: {}, utils }),
      /Authentication failed/
    );
  });
});
