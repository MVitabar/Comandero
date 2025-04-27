import type { MetadataRoute } from "next"

const manifest = {
  name: "Comandero",
  short_name: "Comandero",
  description: "A comprehensive restaurant management system",
  start_url: "/login",
  display: "standalone",
  background_color: "#000033",
  theme_color: "#000066",
  gcm_sender_id: "482941778795", // Requerido para OneSignal
  icons: [
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icons/icon-maskable-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/icons/icon-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  serviceworker: {
    src: "/OneSignalSDKWorker.js",
    scope: "/"
  }
} as any;

export default manifest;
