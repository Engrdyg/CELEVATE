import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The JSON question bank is read at request time by the API routes (file store).
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/question-bank/*.json", "./data/question-bank/reports/student-reports.json"],
  },
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
