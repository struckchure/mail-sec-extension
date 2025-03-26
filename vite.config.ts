import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "content.js"),
      formats: ["es"], // Adjust as needed
      fileName: (format) => `bundle.${format}.js`,
    },
    outDir: "dist",
  },
});
