import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { closeConnections } from '../src/lib/connections.js';

afterAll(async () => closeConnections());

describe('GET /health', () => {
  it('reports API and dependency connectivity', async () => {
    const response = await request(app).get('/health');
    expect([200, 503]).toContain(response.status);
    expect(response.body).toMatchObject({
      status: expect.stringMatching(/^(ok|degraded)$/),
      services: { api: 'ok' },
    });
    expect(response.body.services).toHaveProperty('mongodb');
    expect(response.body.services).toHaveProperty('redis');
  });
});
