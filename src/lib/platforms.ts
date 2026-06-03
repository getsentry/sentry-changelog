// Platform options for scoping a changelog entry to specific Sentry platforms.
// This mirrors the admin broadcast targeting dropdown, which is built in
// getsentry/sentry from the platform picker's exposed categories:
//   - groups/values: sentry static/app/data/platformPickerCategories.tsx
//     (the browser/server/mobile/desktop/serverless sets)
//   - display labels: sentry static/app/data/platforms.tsx
//   - assembled in: sentry static/gsApp/utils/broadcasts.tsx (platformOptions)
// Keep in sync when Sentry changes the platform picker. Values are platform
// slugs; getsentry validates them against GETTING_STARTED_DOCS_PLATFORMS (a
// superset) when scoping broadcasts.
export interface PlatformOption {
  value: string;
  label: string;
}

export interface PlatformGroup {
  label: string;
  options: PlatformOption[];
}

export const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    label: "Browser",
    options: [
      { value: "dart", label: "Dart" },
      { value: "flutter", label: "Flutter" },
      { value: "javascript", label: "Browser JavaScript" },
      { value: "javascript-angular", label: "Angular" },
      { value: "javascript-astro", label: "Astro" },
      { value: "javascript-ember", label: "Ember" },
      { value: "javascript-gatsby", label: "Gatsby" },
      { value: "javascript-nextjs", label: "Next.js" },
      { value: "javascript-nuxt", label: "Nuxt" },
      { value: "javascript-react", label: "React" },
      { value: "javascript-react-router", label: "React Router Framework" },
      { value: "javascript-remix", label: "Remix" },
      { value: "javascript-solid", label: "Solid" },
      { value: "javascript-solidstart", label: "SolidStart" },
      { value: "javascript-svelte", label: "Svelte" },
      { value: "javascript-sveltekit", label: "SvelteKit" },
      {
        value: "javascript-tanstackstart-react",
        label: "TanStack Start React",
      },
      { value: "javascript-vue", label: "Vue" },
      { value: "react-native", label: "React Native" },
      { value: "unity", label: "Unity" },
    ],
  },
  {
    label: "Server",
    options: [
      { value: "bun", label: "Bun" },
      { value: "dart", label: "Dart" },
      { value: "deno", label: "Deno" },
      { value: "dotnet", label: ".NET" },
      { value: "dotnet-aspnet", label: "ASP.NET" },
      { value: "dotnet-aspnetcore", label: "ASP.NET Core" },
      { value: "elixir", label: "Elixir" },
      { value: "go", label: "Go" },
      { value: "go-http", label: "Net/Http" },
      { value: "go-echo", label: "Echo" },
      { value: "go-fasthttp", label: "FastHTTP" },
      { value: "go-fiber", label: "Fiber" },
      { value: "go-gin", label: "Gin" },
      { value: "go-iris", label: "Iris" },
      { value: "go-negroni", label: "Negroni" },
      { value: "java", label: "Java" },
      { value: "java-log4j2", label: "Log4j 2.x" },
      { value: "java-logback", label: "Logback" },
      { value: "java-spring", label: "Spring" },
      { value: "java-spring-boot", label: "Spring Boot" },
      { value: "kotlin", label: "Kotlin" },
      { value: "native", label: "Native" },
      { value: "node", label: "Node.js" },
      { value: "node-cloudflare-pages", label: "Cloudflare Pages" },
      { value: "node-cloudflare-workers", label: "Cloudflare Workers" },
      { value: "node-connect", label: "Connect" },
      { value: "node-express", label: "Express" },
      { value: "node-fastify", label: "Fastify" },
      { value: "node-hapi", label: "Hapi" },
      { value: "node-hono", label: "Hono" },
      { value: "node-koa", label: "Koa" },
      { value: "node-nestjs", label: "Nest.js" },
      { value: "php", label: "PHP" },
      { value: "php-laravel", label: "Laravel" },
      { value: "php-symfony", label: "Symfony" },
      { value: "powershell", label: "PowerShell" },
      { value: "python", label: "Python" },
      { value: "python-aiohttp", label: "AIOHTTP" },
      { value: "python-asgi", label: "ASGI" },
      { value: "python-bottle", label: "Bottle" },
      { value: "python-celery", label: "Celery" },
      { value: "python-chalice", label: "Chalice" },
      { value: "python-django", label: "Django" },
      { value: "python-falcon", label: "Falcon" },
      { value: "python-fastapi", label: "FastAPI" },
      { value: "python-flask", label: "Flask" },
      { value: "python-litestar", label: "Litestar" },
      { value: "python-pyramid", label: "Pyramid" },
      { value: "python-quart", label: "Quart" },
      { value: "python-rq", label: "RQ (Redis Queue)" },
      { value: "python-sanic", label: "Sanic" },
      { value: "python-starlette", label: "Starlette" },
      { value: "python-tornado", label: "Tornado" },
      { value: "python-tryton", label: "Tryton" },
      { value: "python-wsgi", label: "WSGI" },
      { value: "ruby", label: "Ruby" },
      { value: "ruby-rack", label: "Rack Middleware" },
      { value: "ruby-rails", label: "Rails" },
      { value: "rust", label: "Rust" },
    ],
  },
  {
    label: "Mobile",
    options: [
      { value: "android", label: "Android" },
      { value: "apple-ios", label: "iOS" },
      { value: "capacitor", label: "Capacitor" },
      { value: "cordova", label: "Cordova" },
      { value: "dotnet-maui", label: ".NET MAUI" },
      { value: "dotnet-xamarin", label: "Xamarin" },
      { value: "dart", label: "Dart" },
      { value: "flutter", label: "Flutter" },
      { value: "ionic", label: "Ionic" },
      { value: "react-native", label: "React Native" },
      { value: "unity", label: "Unity" },
      { value: "unreal", label: "Unreal Engine" },
    ],
  },
  {
    label: "Desktop",
    options: [
      { value: "apple-macos", label: "macOS" },
      { value: "dotnet", label: ".NET" },
      { value: "dotnet-maui", label: ".NET MAUI" },
      { value: "dotnet-winforms", label: "Windows Forms" },
      { value: "dotnet-wpf", label: "WPF" },
      { value: "electron", label: "Electron" },
      { value: "dart", label: "Dart" },
      { value: "flutter", label: "Flutter" },
      { value: "godot", label: "Godot" },
      { value: "java", label: "Java" },
      { value: "kotlin", label: "Kotlin" },
      { value: "minidump", label: "Minidump" },
      { value: "native", label: "Native" },
      { value: "native-qt", label: "Qt" },
      { value: "unity", label: "Unity" },
      { value: "unreal", label: "Unreal Engine" },
    ],
  },
  {
    label: "Serverless",
    options: [
      { value: "dotnet-awslambda", label: "AWS Lambda (.NET)" },
      { value: "dotnet-gcpfunctions", label: "Google Cloud Functions (.NET)" },
      { value: "node-awslambda", label: "AWS Lambda (Node)" },
      { value: "node-azurefunctions", label: "Azure Functions (Node)" },
      { value: "node-gcpfunctions", label: "Google Cloud Functions (Node)" },
      { value: "node-cloudflare-pages", label: "Cloudflare Pages" },
      { value: "node-cloudflare-workers", label: "Cloudflare Workers" },
      { value: "python-awslambda", label: "AWS Lambda (Python)" },
      {
        value: "python-gcpfunctions",
        label: "Google Cloud Functions (Python)",
      },
      { value: "python-serverless", label: "Serverless (Python)" },
    ],
  },
];

const PLATFORM_LABELS: ReadonlyMap<string, string> = new Map(
  PLATFORM_GROUPS.flatMap((group) =>
    group.options.map((option) => [option.value, option.label] as const),
  ),
);

export function isValidPlatform(value: string): boolean {
  return PLATFORM_LABELS.has(value);
}

// Human-readable name for a platform slug, e.g. "javascript-react" -> "React".
// Falls back to the slug for values not in the picker (e.g. a platform Sentry
// has since removed that an older entry still references).
export function platformLabel(value: string): string {
  return PLATFORM_LABELS.get(value) ?? value;
}
