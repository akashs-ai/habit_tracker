import { app } from '../server/app';

export default function handler(req: any, res: any) {
  const forwarded = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || req.headers?.['x-real-path'];
  if (typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    req.url = forwarded;
  } else {
    const queryIdx = (req.url || '').indexOf('?');
    const query = queryIdx >= 0 ? req.url.slice(queryIdx) : '';
    req.url = `/api/quests${query}`;
  }
  return (app as any)(req, res);
}
