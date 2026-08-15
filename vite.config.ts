// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import type { Logger, Plugin, PluginOption } from "vite";
import { createLogger } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * The wrapper config package injects `vite-tsconfig-paths` with no way to turn
 * it off. Vite 8 resolves tsconfig paths natively via `resolve.tsconfigPaths`,
 * so this strips the plugin from the effective plugin list and the native
 * option below takes over.
 */
function stripTsconfigPathsPlugin(): Plugin {
  return {
    name: "strip-vite-tsconfig-paths",
    config(config) {
      const filter = (plugins: PluginOption[]): PluginOption[] =>
        plugins
          .flatMap((plugin) => (Array.isArray(plugin) ? filter(plugin) : [plugin]))
          .filter((plugin) => plugin && plugin.name !== "vite-tsconfig-paths");
      config.plugins = filter(config.plugins ?? []);
      return config;
    },
  };
}

/**
 * Vite still emits its "plugin is detected" advisory warning against the plugin
 * list captured *before* config hooks run, so stripping the plugin is not
 * enough to silence it. The wrapper package gives no way to disable the
 * plugin, so filter that one advisory message out of the logger instead —
 * everything else passes through untouched.
 */
function silencePluginDetectedWarning(): Plugin {
  return {
    name: "silence-plugin-detected-warning",
    config(config) {
      const base = createLogger(config.logLevel, {
        allowClearScreen: config.clearScreen,
      });
      const customLogger = new Proxy(base, {
        get(target, prop, receiver) {
          if (prop === "warn" || prop === "warnOnce") {
            return (msg: unknown, opts?: unknown) => {
              if (String(msg).includes('"vite-tsconfig-paths" is detected')) return;
              return Reflect.get(target, prop, receiver)(msg, opts);
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      }) as Logger;
      config.customLogger = customLogger;
      return config;
    },
  };
}

export default defineConfig({
  plugins: [stripTsconfigPathsPlugin(), silencePluginDetectedWarning()],
  vite: {
    resolve: { tsconfigPaths: true },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
