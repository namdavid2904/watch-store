const LOCALSTACK_IMAGE_BASE = "http://localhost:4566/watch-store-images";

function resolveImageBaseUrl(): string {
  const publicBase = process.env.NEXT_PUBLIC_S3_IMAGE_BASE_URL;
  if (publicBase) {
    return publicBase.replace(/\/$/, "");
  }

  const hostname = process.env.S3_IMAGE_HOSTNAME;
  if (hostname) {
    return `https://${hostname.replace(/\/$/, "")}`;
  }

  return LOCALSTACK_IMAGE_BASE;
}

export function getProductImageUrl(imageRef: string | null | undefined): string | null {
  if (!imageRef) {
    return null;
  }

  if (imageRef.startsWith("http://") || imageRef.startsWith("https://")) {
    return imageRef;
  }

  const key = imageRef.startsWith("/") ? imageRef.slice(1) : imageRef;
  return `${resolveImageBaseUrl()}/${key}`;
}

export function getPrimaryProductImageUrl(images: string[] | null | undefined): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  return getProductImageUrl(images[0]);
}
