import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function normalizeSiteUrl(value) {
  if (!value) {
    return 'https://time-manager-web.vercel.app';
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value.replace(/\/+$/, '');
  }

  return `https://${value.replace(/\/+$/, '')}`;
}

const siteUrl = normalizeSiteUrl(
  process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL,
);

const routes = ['/', '/today', '/week', '/pomodoro', '/stats'];
const distDir = resolve(process.cwd(), 'dist');
const isoDate = new Date().toISOString();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${isoDate}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' || route === '/today' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await mkdir(distDir, { recursive: true });
await writeFile(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(resolve(distDir, 'robots.txt'), robots, 'utf8');
