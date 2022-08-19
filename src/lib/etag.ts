import { Context, Next } from "hono";
import { parseBody } from "hono/utils/body";
import { sha1 } from "hono/utils/crypto";

type ETagOptions = {
  weak: boolean;
};

export const etag = (options: ETagOptions = { weak: false }) => {
  return async (c: Context, next: Next) => {
    const ifNoneMatch =
      c.req.header("If-None-Match") || c.req.header("if-none-match");
    await next();

    const res = c.res as Response;
    const existingEtag = res.headers.get("etag");

    if (existingEtag) {
      if (ifNoneMatch && ifNoneMatch.includes(existingEtag)) {
        c.res = new Response(null, {
          status: 304,
          statusText: "Not Modified",
        });
        c.res.headers.delete("Content-Length");
      }
    } else {
      const body = await parseBody(c.res);
      const hash = await sha1(body);
      const etag = options.weak ? `W/"${hash}"` : `"${hash}"`;
      if (ifNoneMatch && ifNoneMatch.includes(etag)) {
        c.res = new Response(null, {
          status: 304,
          statusText: "Not Modified",
        });
        c.res.headers.delete("Content-Length");
      } else {
        c.res.headers.append("ETag", etag);
      }
    }
  };
};
