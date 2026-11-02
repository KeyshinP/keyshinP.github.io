import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function wrapText(text: string, maxCharsPerLine: number = 24): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    current += char;
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3); // Max 3 lines
}

export async function GET({ props }: APIContext) {
  const { post } = props as any;
  const title = post.data.title || 'Technical Post';
  const date = post.data.date.toISOString().split('T')[0];
  const author = post.data.author || 'Keyshin';
  const tags = (post.data.tags || []).slice(0, 4);

  const titleLines = wrapText(title, 26);
  const titleSvgTspans = titleLines
    .map((line, idx) => `<tspan x="80" dy="${idx === 0 ? '0' : '1.3em'}">${escapeXml(line)}</tspan>`)
    .join('');

  const tagPills = tags
    .map((t: string, i: number) => {
      const xPos = 80 + i * 150;
      return `
        <g transform="translate(${xPos}, 520)">
          <rect width="130" height="38" rx="19" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
          <text x="65" y="24" text-anchor="middle" fill="#60a5fa" font-size="16" font-weight="600" font-family="-apple-system, sans-serif">#${escapeXml(t)}</text>
        </g>
      `;
    })
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="100%" stop-color="#131b2e" />
        </linearGradient>
        <radialGradient id="glow" cx="85%" cy="15%" r="65%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      <rect width="1200" height="630" fill="url(#glow)" />
      <rect x="0" y="0" width="1200" height="8" fill="url(#accentGrad)" />

      <!-- Inner Border -->
      <rect x="30" y="30" width="1140" height="570" rx="16" fill="none" stroke="#1e293b" stroke-width="2" />

      <!-- Brand / Header -->
      <g transform="translate(80, 85)">
        <circle cx="20" cy="20" r="20" fill="#2563eb" />
        <text x="20" y="26" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold" font-family="-apple-system, sans-serif">K</text>
        <text x="56" y="26" fill="#f8fafc" font-size="24" font-weight="700" font-family="-apple-system, sans-serif">Keyshin&apos;s Engineering Blog</text>
      </g>

      <!-- Article Title -->
      <text x="80" y="250" fill="#f8fafc" font-size="44" font-weight="800" font-family="-apple-system, sans-serif" letter-spacing="-0.02em">
        ${titleSvgTspans}
      </text>

      <!-- Meta Info -->
      <g transform="translate(80, 450)">
        <text fill="#94a3b8" font-size="20" font-family="-apple-system, monospace">
          ${escapeXml(date)} · ${escapeXml(author)}
        </text>
      </g>

      <!-- Tags -->
      ${tagPills}
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
