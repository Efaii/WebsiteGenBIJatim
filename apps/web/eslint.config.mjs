import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/app/about/AboutClient.tsx", "**/app/admin/faqs/page.tsx", "**/app/admin/login/page.tsx", "**/app/admin/news/page.tsx", "**/app/admin/testimonials/page.tsx", "**/app/awardee/page.tsx", "**/app/calendar/CalendarClient.tsx", "**/app/commissariat/*/CommissariatClient.tsx", "**/app/commissariat/page.tsx", "**/app/docs/DocsClient.tsx", "**/components/Card.tsx", "**/components/admin/ProtectedRoute.tsx", "**/components/home/About.tsx", "**/components/home/Testimonials.tsx", "**/components/ui/sheet.tsx", "**/lib/services/calendar.service.ts", "**/lib/services/commissariat.service.ts", "**/lib/services/google.ts", "**/services/testimonial.service.ts", "**/actions/contact.ts", "**/app/admin/dashboard/page.tsx", "**/app/admin/layout.tsx", "**/app/admin/page.tsx", "**/app/calendar/*/EventDetailClient.tsx", "**/app/news/NewsClient.tsx", "**/components/CountUp.tsx", "**/components/home/CTA.tsx", "**/components/home/FAQ.tsx", "**/components/home/Portal.tsx", "**/content/calendarData.ts", "**/lib/services/profile.service.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off", "@typescript-eslint/no-empty-object-type": "off", "react-hooks/set-state-in-effect": "off", "react/no-unescaped-entities": "off" },
  },
]);

export default eslintConfig;
