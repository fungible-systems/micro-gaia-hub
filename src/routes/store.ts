import { gaiaConfigValidationMiddleware } from "../lib/bearer-auth-middleware";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { getDriver } from "../common/get-driver";
import { API_URL } from "../common/constants";
import { sha1 } from "hono/utils/crypto";
import { etag } from "../lib/etag";

const app = new Hono<{ MY_BUCKET: R2Bucket }>();

app.use("*", gaiaConfigValidationMiddleware(), etag());

app.post("/:address/:filename", prettyJSON(), async (c) => {
  const driver = getDriver(c);

  const address = c.req.param("address");
  const filename = c.req.param("filename");

  const path = `${address}/${filename}`;
  let etag = null;
  try {
    const data = await c.req.json();
    const contents = JSON.stringify(data);
    await driver.write(path, contents, {
      contentType: "application/json",
    });
    const hash = await sha1(contents);
    etag = `"${hash}"`;
  } catch (e) {
    console.error(e);
  }

  if (etag) c.res.headers.append("ETag", etag);

  return c.json({
    publicURL: API_URL + "/hub/" + path,
    eTag: etag ?? null,
  });
});

export default app;
