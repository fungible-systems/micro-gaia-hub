import { Hono } from "hono";

// middleware
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { etag } from "./lib/etag";

// routes
import listFiles from "./routes/list-files";
import store from "./routes/store";
import read from "./routes/read";
import hub_info from "./routes/hub_info";

/** ------------------------------------------------------------------------------------------------------------------
 *   App & Middleware
 *  ------------------------------------------------------------------------------------------------------------------
 */
const app = new Hono<{ MY_BUCKET: R2Bucket }>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    // Set the Access-Control-Max-Age header to 24 hours.
    maxAge: 86400,
    allowMethods: "DELETE,POST,GET,OPTIONS,HEAD".split(","),
    allowHeaders:
      "Authorization,Content-Type,etag,If-Match,If-None-Match".split(","),
    exposeHeaders: ["etag", "Content-Type", "Cache-Control"],
  })
);

/** ------------------------------------------------------------------------------------------------------------------
 *   Routes
 *  ------------------------------------------------------------------------------------------------------------------
 */
app.route("/hub_info", hub_info);
app.route("/store", store);
app.route("/hub", read);
app.route("/list-files", listFiles);

app.get("/", (c) => {
  return c.text("micro-gaia-hub welcomes you");
});

export default {
  port: 8181,
  fetch: app.fetch,
};
