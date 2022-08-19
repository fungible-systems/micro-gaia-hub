import { Context, Next } from "hono";

export const cache = (options: {
  cacheName: string;
  wait?: boolean;
  cacheControl?: string;
  statusCodes?: number[];
}) => {
  if (options.wait === undefined) {
    options.wait = false;
  }

  const addHeader = (response: Response) => {
    if (options.cacheControl)
      response.headers.append("Cache-Control", options.cacheControl);
  };

  return async (c: Context, next: Next) => {
    const key = c.req;
    const cache = await caches.open(options.cacheName);
    const response = await cache.match(key);
    if (!response) {
      await next();
      const shouldAddHeader =
        !options.statusCodes || options.statusCodes.includes(c.res.status);

      if (shouldAddHeader) addHeader(c.res);

      const response = c.res.clone();
      if (options.wait) {
        await cache.put(key, response);
      } else {
        c.executionCtx.waitUntil(cache.put(key, response));
      }
    } else {
      return response;
    }
  };
};
