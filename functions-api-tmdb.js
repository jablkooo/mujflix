// MůjFlix TMDB Proxy → ulož jako: functions/api/tmdb/[[catchall]].js
// Nastav: wrangler secret put TMDB_KEY

export const onRequest = async ({ request, env }) => {
  const TMDB_KEY = env.TMDB_KEY || "36a429855b5872e5db851b6e04db81f0";
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || url.pathname.replace('/api/tmdb', '');

  if (!path) return new Response('{"error":"Chybí path"}', { status: 400, headers: { 'Content-Type': 'application/json' } });

  const tmdbUrl = new URL(`https://api.themoviedb.org/3${path.startsWith('/') ? path : '/' + path}`);
  tmdbUrl.searchParams.set('api_key', TMDB_KEY);
  tmdbUrl.searchParams.set('language', 'cs-CZ');
  url.searchParams.forEach((v, k) => k !== 'path' && tmdbUrl.searchParams.set(k, v));

  const resp = await fetch(tmdbUrl.toString());
  const data = await resp.json();
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' } });
};