import { getSupabase } from "@/lib/supabase";

/**
 * Image uploads for /admin, backed by the public `media` bucket created in
 * supabase/schema.sql.
 *
 * Reads are open so `<img src>` works for visitors; every write requires a
 * staff session. The limits below mirror the ones enforced on the bucket, so a
 * bad file is rejected here with a readable message instead of a raw 400.
 */

const BUCKET = "media";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

/** `accept` attribute for a file input, kept in step with the list above. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_IMAGE_TYPES.join(",");

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** Human-readable size for error messages, e.g. "6.2 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns an error message when the file cannot be uploaded, or null when it is
 * acceptable.
 */
export function validateImage(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "That file type is not supported. Use a JPG, PNG, WebP, AVIF or GIF image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That image is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}, so please compress it first.`;
  }
  return null;
}

/**
 * Builds a collision-proof object path. The original filename is kept in a
 * readable form so the storage browser stays navigable, with a random suffix
 * because two students can easily upload `photo.jpg`.
 */
function buildPath(folder: string, file: File): string {
  const extension = EXTENSIONS[file.type] ?? "jpg";
  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "image";

  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${folder}/${base}-${suffix}.${extension}`;
}

/**
 * Uploads an image and returns its public URL, ready to store on the record.
 * Throws with the Supabase message when the request fails, which surfaces
 * "new row violates row-level security policy" if the session has expired.
 */
export async function uploadImage(file: File, folder: "blog" | "stories" | "team"): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);

  const path = buildPath(folder, file);

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extracts the object path from a public URL, or null when the URL points
 * somewhere else. Used so we only ever delete our own uploads.
 */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Removes an uploaded image. Externally hosted URLs are ignored rather than
 * treated as an error, so callers can fire this on any image swap.
 *
 * Failures are logged and swallowed: an orphaned file in storage is a smaller
 * problem than blocking a save the admin has already committed to.
 */
export async function deleteImage(url: string | null): Promise<void> {
  if (!url) return;
  const path = pathFromPublicUrl(url);
  if (!path) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("Could not remove the old image:", error.message);
}
