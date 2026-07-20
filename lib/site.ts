// Absolute origin for metadata, sitemap, and robots. Vercel injects
// VERCEL_PROJECT_PRODUCTION_URL (host only, no scheme) in all environments.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
