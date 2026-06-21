// MůjFlix TMDB Image Proxy → ulož jako: functions/api/tmdb-img/[[catchall]].js
//
// Důvod: image.tmdb.org běží za Cloudflare Polish, která obrázky automaticky
// konvertuje na WebP podle Accept headeru prohlížeče. Na některých systémech
// se tahle konkrétní WebP varianta nevykresluje správně (zůstává černá/
// průhledná, i když se reálně stáhne). Tento proxy si vždy vyžádá čistý JPEG
// přímo od TMDB a takový ho i vrátí — obchází tak WebP negotiation úplně.

export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/tmdb-img', '');

  if (!path) {
    return new Response('Chybí path', { status: 400 });
  }

  const tmdbUrl = `https://image.tmdb.org${path}`;

  let resp;
  try {
    resp = await fetch(tmdbUrl, {
      headers: {
        // Vědomě NEuvádíme image/webp ani image/avif, aby Cloudflare Polish
        // na straně TMDB neměla důvod konvertovat z JPEG.
        'Accept': 'image/jpeg,image/png,image/*;q=0.5,*/*;q=0.1',
      },
    });
  } catch (err) {
    return new Response('Chyba při načítání obrázku', { status: 502 });
  }

  if (!resp.ok) {
    return new Response('Obrázek se nepodařilo načíst', { status: resp.status });
  }

  const headers = new Headers(resp.headers);
  headers.set('Cache-Control', 'public, max-age=604800, immutable');
  headers.delete('vary'); // ať si Cloudflare necachuje zvlášť podle Accept headeru klienta

  return new Response(resp.body, { status: 200, headers });
};
