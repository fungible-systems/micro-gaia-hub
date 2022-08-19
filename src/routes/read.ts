import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";

import { getDriver } from "../common/get-driver";
import { sha1 } from "hono/utils/crypto";
import { etag } from "../lib/etag";

const app = new Hono<{ MY_BUCKET: R2Bucket }>();

app.use("*", etag());

app.get("/:address/:filename", prettyJSON(), async (c) => {
  const driver = getDriver(c);

  const address = c.req.param("address");
  const filename = c.req.param("filename");

  const result = await driver.read(`${address}/${filename}`);

  if (result) {
    const hash = await sha1(result.data);
    const etag = `"${hash}"`;
    return c.body(result.data, 200, {
      "Content-Type": result.contentType ?? "application/json",
      ETag: etag,
    });
  } else {
    return c.json({ message: "not found" }, 404);
  }
});

export default app;
