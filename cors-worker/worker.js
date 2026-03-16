export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url') || url.pathname.slice(1) + url.search;

    if (!targetUrl) {
      return new Response('Usage: ?url=https://target-url', { status: 400 });
    }

    // Only allow Yahoo Finance domains
    const parsed = new URL(targetUrl);
    if (!parsed.hostname.endsWith('yahoo.com')) {
      return new Response('Only Yahoo Finance URLs allowed', { status: 403 });
    }

    const headers = new Headers(request.headers);
    headers.delete('origin');
    headers.delete('referer');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: responseHeaders });
      }

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  },
};
