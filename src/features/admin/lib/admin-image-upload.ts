import { apiFetch } from "@/lib/api/backend";
import {
  resolveContentType,
  signOrThrow,
  UploadError,
  type SignedUpload,
} from "@/lib/api/vendor";

export const MAX_ADMIN_IMAGE_BYTES = 10 * 1024 * 1024;
export const ADMIN_IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

/** Returns a user-facing problem with the file, or null when it can upload. */
export function checkAdminImage(file: File): string | null {
  if (
    !/^image\/(png|jpe?g|webp)$/.test(file.type) &&
    !/\.(png|jpe?g|webp)$/i.test(file.name)
  ) {
    return "Use a PNG, JPEG or WebP image.";
  }
  if (file.size > MAX_ADMIN_IMAGE_BYTES) {
    return "Images must be 10 MB or smaller.";
  }
  return null;
}

// Same two hops as uploadAdminImage (sign with the admin endpoint, PUT to the
// bucket) but over XHR so the form can show real upload progress (0–100).
export async function uploadAdminImageWithProgress(
  token: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> {
  const contentType = resolveContentType(file);
  const signed = await signOrThrow(() =>
    apiFetch<SignedUpload>("/admin/uploads/sign", {
      method: "POST",
      token,
      body: { fileName: file.name, contentType },
    }),
  );
  onProgress(0);
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        const code = /<Code>([^<]+)<\/Code>/.exec(xhr.responseText ?? "")?.[1];
        reject(
          new UploadError(
            "storage",
            xhr.status,
            code ?? (xhr.statusText || "rejected"),
          ),
        );
      }
    };
    xhr.onerror = () =>
      reject(new UploadError("storage", null, "unreachable (network or CORS)"));
    xhr.send(file);
  });
  if (!signed.publicUrl) throw new Error("Upload has no public URL");
  return signed.publicUrl;
}
