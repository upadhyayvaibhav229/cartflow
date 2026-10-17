import "server-only";

export function wordpressApiUrl(path: string) {
  const baseUrl = process.env.WORDPRESS_URL;
  if (!baseUrl) {
    throw new Error("WORDPRESS_URL is not configured.");
  }
  return new URL(path.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);
}
