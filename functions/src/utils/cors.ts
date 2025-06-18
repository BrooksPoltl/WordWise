import cors from 'cors';
import { Response } from 'express';
import { Request } from 'firebase-functions/v2/https';

// CORS middleware
const allowedOrigins: string[] = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsHandler = cors({ origin: allowedOrigins });

/**
 * Set CORS headers on response
 */
export function setCorsHeaders(request: Request, response: Response): void {
  const requestOrigin = request.headers.origin as string | undefined;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    response.set('Access-Control-Allow-Origin', requestOrigin);
  }
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptionsRequest(request: Request, response: Response): boolean {
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return true;
  }
  return false;
} 