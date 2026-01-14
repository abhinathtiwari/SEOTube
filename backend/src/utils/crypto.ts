import crypto from "crypto";

const SECRET = process.env.REFRESH_TOKEN_SECRET || "";
const KEY = crypto.createHash("sha256").update(SECRET).digest(); // 32 bytes

export const encryptRefreshToken = (plain?: string | null): string | undefined => {
  if (!plain) return undefined;
  const iv = crypto.randomBytes(12); // 96 bits for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store as iv(12) + tag(16) + encrypted
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decryptRefreshToken = (ciphertext?: string | null): string | undefined => {
  if (!ciphertext) return undefined;
  try {
    const data = Buffer.from(ciphertext, "base64");
    const iv = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const encrypted = data.slice(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    // If decryption fails, return the original value (it may be plaintext)
    return ciphertext;
  }
};
