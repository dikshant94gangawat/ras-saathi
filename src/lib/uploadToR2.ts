import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export class R2Error extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export const r2Configured = () =>
  Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);

let client: S3Client | null = null;
function r2() {
  if (!r2Configured()) throw new R2Error("Storage not configured", 503);
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  return client;
}
const bucket = () => process.env.R2_BUCKET!;

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
const UPLOAD_TTL = 300;
const DOWNLOAD_TTL = 600;

// Key is built server-side from the user id so clients cannot choose where to write.
export function buildAnswerKey(userId: string, questionId: string) {
  const safeQ = questionId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  if (!safeQ) throw new R2Error("Invalid question id");
  return `mains-answers/${userId}/${safeQ}/${randomUUID()}.pdf`;
}

export async function createUploadUrl(opts: { userId: string; questionId: string; sizeBytes: number; contentType: string }) {
  if (opts.contentType !== "application/pdf") throw new R2Error("Only PDF allowed");
  if (!Number.isInteger(opts.sizeBytes) || opts.sizeBytes <= 0 || opts.sizeBytes > MAX_PDF_BYTES) {
    throw new R2Error("File must be between 1 byte and 10 MB");
  }
  const key = buildAnswerKey(opts.userId, opts.questionId);
  try {
    const url = await getSignedUrl(
      r2(),
      new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: opts.contentType, ContentLength: opts.sizeBytes }),
      { expiresIn: UPLOAD_TTL }
    );
    return { url, key, expiresIn: UPLOAD_TTL };
  } catch (e) {
    if (e instanceof R2Error) throw e;
    throw new R2Error("Could not create upload URL", 500);
  }
}

export async function verifyUpload(key: string, userId: string) {
  if (!key.startsWith(`mains-answers/${userId}/`)) throw new R2Error("Forbidden", 403);
  try {
    const head = await r2().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    if ((head.ContentLength ?? 0) > MAX_PDF_BYTES) throw new R2Error("File too large");
    return head;
  } catch (e) {
    if (e instanceof R2Error) throw e;
    throw new R2Error("Upload not found", 404);
  }
}

export async function createDownloadUrl(key: string, filename?: string) {
  try {
    return await getSignedUrl(
      r2(),
      new GetObjectCommand({
        Bucket: bucket(), Key: key,
        ResponseContentDisposition: filename ? `attachment; filename="${filename.replace(/[^\w.\- ]/g, "")}"` : undefined,
      }),
      { expiresIn: DOWNLOAD_TTL }
    );
  } catch (e) {
    if (e instanceof R2Error) throw e;
    throw new R2Error("Could not create download URL", 500);
  }
}

export async function uploadBuffer(key: string, body: Buffer, contentType = "application/pdf") {
  await r2().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }));
  return key;
}
