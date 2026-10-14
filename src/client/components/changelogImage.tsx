import Image from "next/image";

export function ChangelogImage({
  src,
  alt,
  hero = false,
}: {
  src: string;
  alt: string;
  hero?: boolean;
}) {
  const optimized =
    (src.startsWith("/") && !src.startsWith("//")) || isSupportedHost(src);
  const sizes = hero
    ? "100vw"
    : "(max-width: 639px) 100vw, (max-width: 1024px) 33vw, 320px";

  return (
    <div
      className={`relative w-full ${hero ? "aspect-video max-h-[480px]" : "aspect-video"}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        unoptimized={!optimized}
        loading={hero ? "eager" : "lazy"}
        fetchPriority={hero ? "high" : "auto"}
      />
    </div>
  );
}

function isSupportedHost(src: string) {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".public.blob.vercel-storage.com") ||
        [
          "images.ctfassets.net",
          "lh7-qw.googleusercontent.com",
          "lh3.googleusercontent.com",
        ].includes(url.hostname))
    );
  } catch {
    return false;
  }
}
