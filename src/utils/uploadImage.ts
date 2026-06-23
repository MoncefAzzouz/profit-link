import { API_BASE_URL } from "@/config/api";

/**
 * Upload an image file to the backend and return its hosted URL.
 * Storing a small URL (instead of a base64 data-URL) keeps the landing-page
 * config tiny so saving never hits the request body-size limit.
 */
export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem("token");
  const fd = new FormData();
  fd.append("image", file);
  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(json.error || "فشل رفع الصورة");
  }
  return json.url as string;
}

/** Upload a video file → hosted URL (avoids storing a huge base64 string in the config). */
export async function uploadVideo(file: File): Promise<string> {
  const token = localStorage.getItem("token");
  const fd = new FormData();
  fd.append("video", file);
  const res = await fetch(`${API_BASE_URL}/upload/video`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(json.error || "فشل رفع الفيديو");
  }
  return json.url as string;
}
