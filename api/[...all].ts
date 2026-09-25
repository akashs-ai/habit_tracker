import { app } from '../server/app';

export default function handler(req: any, res: any) {
  const forwarded = req.headers?.['x-forwarded-uri'] || req.headers?.['x-matched-path'] || req.headers?.['x-real-path'];
  if (typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    req.url = forwarded;
  } else if (req.query?.all) {
    const slug = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    req.url = `/api/${slug}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return (app as any)(req, res);
}
