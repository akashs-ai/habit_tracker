import { app } from '../server/app';

export default function handler(req: any, res: any) {
  const forwarded = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || req.headers?.['x-real-path'];
  if (typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    req.url = forwarded;
  }
  return (app as any)(req, res);
}
