import { decodeToken } from "micro-stacks/crypto";

enum AuthScopesTypes {
  putFile = "putFile",
  putFilePrefix = "putFilePrefix",
  deleteFile = "deleteFile",
  deleteFilePrefix = "deleteFilePrefix",
  putFileArchival = "putFileArchival",
  putFileArchivalPrefix = "putFileArchivalPrefix",
}

export const AuthScopeTypeArray: string[] = Object.values(
  AuthScopesTypes
).filter((val) => typeof val === "string");

export interface AuthScopeEntry {
  scope: string;
  domain: string;
}

export interface TokenPayloadType {
  gaiaChallenge: string;
  iss: string;
  exp: number;
  iat?: number;
  salt: string;
  hubUrl?: string;
  associationToken?: string;
  scopes?: AuthScopeEntry[];
  childToAssociate?: string;
}

export function decodeBearerToken(authorization: string) {
  const [version, token] = authorization.split(":");
  if (version !== "v1") throw Error("incorrect version");
  const decoded = decodeToken(token);
  return {
    signature: decoded.signature,
    header: decoded.header,
    payload: decoded.payload as unknown as TokenPayloadType,
  };
}

export function validateScopes(scopes: AuthScopeEntry[]) {
  if (scopes.length > 8) throw new Error("Too many authentication scopes");

  for (const scope of scopes)
    if (!AuthScopeTypeArray.includes(scope.scope))
      throw new Error(`Unrecognized scope ${scope.scope}`);
}

export function getChallengeText(myURL: string) {
  const header = "gaiahub";
  const allowedSpan = "0";
  const myChallenge = "sign_this_message_pls";
  return JSON.stringify([header, allowedSpan, myURL, myChallenge]);
}

export const LATEST_AUTH_VERSION = "v1";
