import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;
const portValue = rawPort ?? "21716";
const port = Number(portValue);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${portValue}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const apiPort = Number(process.env.API_PORT ?? "8080");
const apiTarget = `http://127.0.0.1:${apiPort}`;

export default defineConfig(async () => {
  const plugins = [react(), tailwindcss(), runtimeErrorOverlay()];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const [{ cartographer }, { devBanner }] = await Promise.all([
      import("@replit/vite-plugin-cartographer"),
      import("@replit/vite-plugin-dev-banner"),
    ]);
    plugins.push(
      cartographer({ root: path.resolve(import.meta.dirname, "..") }),
      devBanner()
    );
  }

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
