import { Hono } from "hono";
import { getChallengeText, LATEST_AUTH_VERSION } from "../common/utils";
import { API_URL } from "../common/constants";
import { cache } from "../lib/cache";

const app = new Hono<{ MY_BUCKET: R2Bucket }>();

app.use(
  "/",
  cache({
    cacheName: "my-app",
    cacheControl: "private, max-age=3600",
    statusCodes: [200],
  })
);

app.get("/", async (c) => {
  return c.json({
    challenge_text: getChallengeText(API_URL),
    latest_auth_version: LATEST_AUTH_VERSION,
    max_file_upload_size_megabytes: 20,
    read_url_prefix: `${API_URL}/hub/`,
  });
});

export default app;
