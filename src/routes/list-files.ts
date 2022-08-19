import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { getDriver } from "../common/get-driver";
import { gaiaConfigValidationMiddleware } from "../lib/bearer-auth-middleware";
import { etag } from "../lib/etag";

const app = new Hono<{ MY_BUCKET: R2Bucket }>();

app.use("*", gaiaConfigValidationMiddleware(), etag());

app.post("/:address/:filename", prettyJSON(), async (c) => {
  const driver = getDriver(c);

  const address = c.req.param("address");
  const filename = c.req.param("filename");

  const result = await driver.list(`${address}`, { suffix: filename });

  return c.json(result);
});

export default app;
