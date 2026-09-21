import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "**/app/about/AboutClient.tsx",
      "**/app/admin/faqs/page.tsx",
      "**/app/admin/login/page.tsx",
      "**/app/admin/news/page.tsx",
      "**/app/admin/testimonials/page.tsx",
      "**/app/calendar/CalendarClient.tsx",
      "**/app/commissariat/*/CommissariatClient.tsx",
      "**/app/commissariat/page.tsx",
      "**/app/news/*/page.tsx",
      "**/components/Card.tsx",
      "**/components/home/About.tsx",
      "**/components/home/FAQ.tsx",
      "**/components/home/Testimonials.tsx",
      "**/components/admin/ProtectedRoute.tsx",
      "**/components/ui/sheet.tsx",
      "**/lib/services/calendar.service.ts",
      "**/lib/services/commissariat.service.ts",
      "**/lib/services/google.ts",
      "**/services/news.service.ts",
      "**/services/testimonial.service.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/app/program/*/page.tsx"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
