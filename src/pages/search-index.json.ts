import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(_context: APIContext) {
  const posts = await getCollection('blog');
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const searchData = posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description || '',
    date: post.data.date.toISOString().split('T')[0],
    tags: post.data.tags || [],
    url: `/posts/${post.id}/`,
  }));

  return new Response(JSON.stringify(searchData), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
