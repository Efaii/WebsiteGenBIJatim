import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Portal } from "@/components/home/Portal";
import { Testimonials } from "@/components/home/Testimonials";
import { News } from "@/components/home/News";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { getHomeData } from "@/services/home.service";
import { getLatestNews } from "@/services/news.service";

/**
 * Landing Page Root Component
 * * Purpose: Acts as the primary entry point and layout orchestrator for the GenBI Jatim landing page.
 * Architecture:
 * - Data Fetching: Implements asynchronous server-side fetching to populate dynamic sections (News, FAQ, Testimonials).
 * - Layout: Composes modular sections into a unified scrollable experience with consistent global branding.
 * - UX: Defines global selection styles and background containers to ensure visual continuity.
 */
export default async function Home() {
  /* --- ASYNCHRONOUS DATA ORCHESTRATION --- */
  // Executes parallel data retrieval for organizational metrics and site content
  const homeData = await getHomeData();
  const latestNews = await getLatestNews();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* --- GLOBAL NAVIGATION INTERFACE --- */}
      <Navbar />

      {/* --- PRIMARY NARRATIVE SECTIONS --- */}
      <main className="flex-1">
        {/* Entrance & Identity */}
        <Hero />

        {/* Organizational Context & Metrics */}
        <About commissariats={homeData.commissariats} />

        {/* Strategic Program Access */}
        <Portal />

        {/* Social Proof & Community Impact */}
        <Testimonials testimonials={homeData.testimonials} />

        {/* Dynamic Content & Updates */}
        <News initialNews={latestNews} />

        {/* Knowledge Base & Support */}
        <FAQ faqs={homeData.faqs} />

        {/* Conversion & Final Call-to-Action */}
        <CTA />
      </main>

      {/* --- GLOBAL FOOTER ARCHITECTURE --- */}
      <Footer />
    </div>
  );
}
