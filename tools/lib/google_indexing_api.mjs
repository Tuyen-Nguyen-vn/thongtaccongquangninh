import { existsSync, readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import path from "node:path";

const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing";
const INDEXING_API = "https://indexing.googleapis.com/v3/urlNotifications:publish";

function base64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: INDEXING_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = base64url(signer.sign(sa.private_key));
  const assertion = `${header}.${claim}.${signature}`;
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`OAuth token lỗi: ${JSON.stringify(payload)}`);
  }
  return payload.access_token;
}

export async function submitIndexingUrl(projectRoot, url, type = "URL_UPDATED") {
  const saKeyPath = path.join(projectRoot, "secrets", "indexing_service_account.json");
  if (!existsSync(saKeyPath)) {
    return { ok: false, skipped: true, reason: `Thiếu file service account: ${saKeyPath}` };
  }
  const sa = JSON.parse(readFileSync(saKeyPath, "utf8"));
  const accessToken = await getGoogleAccessToken(sa);
  const response = await fetch(INDEXING_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, type }),
  });
  const payload = await response.json();
  return {
    ok: response.ok && Boolean(payload.urlNotificationMetadata),
    status: response.status,
    payload,
  };
}
