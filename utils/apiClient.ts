import { request, APIRequestContext } from '@playwright/test';

export async function createApiClient(baseURL?: string): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL: baseURL || process.env.API_BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json'
    }
  });
}
