import { Context, Next } from "hono";
import { isAuthenticationValid } from "../common/is-authentication-valid";

const PREFIX = "Bearer";

function cleanToken(token: string) {
  return token.replace("bearer ", "").replace("Bearer ", "").trim();
}

export const gaiaConfigValidationMiddleware = () => {
  return async (c: Context, next: Next) => {
    const address = c.req.param("address");
    const token = c.req.headers.get("Authorization");

    if (!token || !address) {
      c.res = new Response("No token or address", {
        status: 401,
      });
    } else {
      try {
        const isValid = isAuthenticationValid({
          address,
          token: cleanToken(token),
        });
        if (!isValid) {
          // Invalid Token
          c.res = new Response("Invalid token", {
            status: 401,
            headers: {
              "WWW-Authenticate": `${PREFIX} error="invalid_token"`,
            },
          });
        } else {
          // Authorize OK
          await next();
          return;
        }
      } catch (e) {
        c.res = new Response(e.message, {
          status: 401,
          headers: {
            "WWW-Authenticate": `${PREFIX} error="invalid_token"`,
          },
        });
      }
    }
  };
};
