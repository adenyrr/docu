interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let canonicalPath = url.pathname;

    if (canonicalPath === '/infra' || canonicalPath === '/infra/' || canonicalPath === '/infra.html') {
      return Response.redirect('https://adenyrr.me/infra', 308);
    }

    if (canonicalPath.endsWith('.html')) {
      canonicalPath = canonicalPath.slice(0, -5) || '/';
    }
    if (canonicalPath.length > 1 && canonicalPath.endsWith('/')) {
      canonicalPath = canonicalPath.slice(0, -1);
    }

    if (canonicalPath !== url.pathname) {
      url.pathname = canonicalPath;
      return Response.redirect(url, 308);
    }

    return env.ASSETS.fetch(request);
  },
};
