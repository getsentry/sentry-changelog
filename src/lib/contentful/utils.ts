type ImageConfig = {
  widths: number[];
  quality?: number;
  format?: string;
};

const imageConfigs: Record<string, ImageConfig> = {
  featuredContentImage: {
    widths: [200, 400],
    quality: 85,
    format: "webp",
  },
  buttonIcon: {
    widths: [16, 32, 48],
    quality: 90,
  },
};

export function generateResponsiveSrcsets(
  url: string,
  configName: keyof typeof imageConfigs = "featuredContentImage",
) {
  const config = imageConfigs[configName];

  if (!url) {
    return {
      src: "",
      srcset: "",
      sizes: "",
    };
  }

  const baseUrl = url.startsWith("//") ? `https:${url}` : url;
  const urlObj = new URL(baseUrl);

  const srcset = config.widths
    .map((width) => {
      urlObj.searchParams.set("w", width.toString());
      if (config.quality) {
        urlObj.searchParams.set("q", config.quality.toString());
      }
      if (config.format) {
        urlObj.searchParams.set("fm", config.format);
      }
      return `${urlObj.toString()} ${width}w`;
    })
    .join(", ");

  const defaultWidth = config.widths[Math.floor(config.widths.length / 2)];
  urlObj.searchParams.set("w", defaultWidth.toString());
  if (config.quality) {
    urlObj.searchParams.set("q", config.quality.toString());
  }
  if (config.format) {
    urlObj.searchParams.set("fm", config.format);
  }

  return {
    src: urlObj.toString(),
    srcset,
    sizes: `(max-width: ${config.widths[0]}px) 100vw, ${config.widths[config.widths.length - 1]}px`,
  };
}
