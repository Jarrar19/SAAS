import { Testimonial } from "@/lib/api";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 md:py-28 border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Feedback from engineering leaders
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            How managers and directors maintain team momentum without manual reporting friction.
          </p>
        </div>

        {/* Plain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-border bg-surface p-6 flex flex-col justify-between"
            >
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                "{item.quote}"
              </p>

              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="h-9 w-9 rounded-full object-cover border border-border"
                />
                <div>
                  <div className="text-xs font-semibold text-ink">{item.name}</div>
                  <div className="text-[11px] text-ink-muted">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
