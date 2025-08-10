import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuration for InfinityFree static hosting
export default defineConfig({
  plugins: [react()],
  base: "./", // Important for InfinityFree static hosting
  root: "./client", // Set root to client directory
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "../dist-frontend", // Output relative to root (client/)
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot'],
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  envPrefix: 'VITE_'
});
