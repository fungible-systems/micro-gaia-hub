import { decodeBearerToken, getChallengeText, validateScopes } from "./utils";
import { publicKeyToBase58Address, TokenVerifier } from "micro-stacks/crypto";
import { API_URL } from "./constants";

export function isAuthenticationValid({
  address,
  token,
}: {
  address: string;
  token: string;
}): boolean {
  const { payload } = decodeBearerToken(token);

  if (!payload.iss) throw new Error("Must provide `iss` claim in JWT.");

  const { iss: publicKey, gaiaChallenge, scopes, exp: expiresAt } = payload;

  const signerAddress = publicKeyToBase58Address(publicKey);

  if (signerAddress !== address)
    throw new Error(
      `Address (${signerAddress}) not allowed to write on this path`
    );

  if (scopes) validateScopes(scopes);

  if (!verifyTokenSignature(publicKey, token))
    throw new Error("Failed to verify supplied authentication JWT");

  if (getChallengeText(API_URL) !== gaiaChallenge)
    throw new Error(
      `Invalid gaiaChallenge text in supplied JWT: "${gaiaChallenge}"` +
        ` not found in ${getChallengeText(API_URL)}`
    );

  if (expiresAt && expiresAt < Date.now() / 1000)
    throw new Error(
      `Expired authentication token: expire time of ${expiresAt} (secs since epoch)`
    );

  return true;
}

function verifyTokenSignature(publicKey: string, token: string) {
  let isValid: boolean = false;
  try {
    isValid = new TokenVerifier("ES256K", publicKey).verify(
      token.replace("v1:", "")
    );
  } catch (e) {}
  return isValid;
}
