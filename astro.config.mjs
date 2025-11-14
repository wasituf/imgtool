import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import Icons from "unplugin-icons/vite"

// https://astro.build/config
export default defineConfig({
  vite: {
    worker: {
      format: "es",
    },
    plugins: [Icons({ compiler: "astro" }), tailwindcss()],
    optimizeDeps: {
      exclude: [
        "@jsquash/avif",
        "@jsquash/jpeg",
        "@jsquash/oxipng",
        "@jsquash/png",
        "@jsquash/webp",
      ],
    },
  },
  integrations: [react()],
})
