import {
  fetchPublishedPlans,
  fetchPublishedPosts,
  fetchPublishedTestimonials,
} from "@/lib/api";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { BlogSection } from "@/components/landing/BlogSection";
import { Footer } from "@/components/landing/Footer";

// Disable all static caching to ensure immediate updates when posts or plans are modified in CMS
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Fetch live published data concurrently
  const [plans, posts, testimonials] = await Promise.all([
    fetchPublishedPlans(),
    fetchPublishedPosts(3), // Limit to 3 cards for the landing page blog section
    fetchPublishedTestimonials(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 5.1 Hero Section */}
      <Hero />

      {/* 5.2 Features Section */}
      <Features />

      {/* 5.3 Pricing Section (Dynamic from API, highlighted tier visually distinguished) */}
      <PricingSection plans={plans} />

      {/* 5.4 Testimonials Section (Dynamic from API) */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 5.5 Blog Listing Section (Dynamic from API, featured post visually distinguished) */}
      <BlogSection posts={posts} />

      {/* 5.6 Conversion CTA & Footer Section */}
      <Footer />
    </div>
  );
}
