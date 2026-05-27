import React, { useState } from 'react';
import { Star, MessageSquare, Quote, UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
  onAddTestimonial: (testimonial: Omit<Testimonial, 'id' | 'createdAt'>) => void;
}

export default function Testimonials({ testimonials, onAddTestimonial }: TestimonialsProps) {
  // Form submission states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) {
      alert('Please fill out all required fields (Name and Review text).');
      return;
    }

    onAddTestimonial({
      name: name.trim(),
      company: company.trim() || undefined,
      rating,
      review: review.trim(),
      isVerified: true
    });

    // Reset fields
    setName('');
    setCompany('');
    setRating(5);
    setReview('');
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setShowForm(false);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-8 shadow-sm" id="testimonials-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-semibold border border-emerald-100">
            <Sparkles className="h-3 w-3 text-emerald-600 animate-pulse" />
            <span>Real Feedback, Impeccable Execution</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-950 font-sans uppercase">
            Success Stories From Our Clients
          </h3>
          <p className="text-xs text-neutral-500 font-light max-w-xl">
            Read how we have helped academic researchers, schools, and business executives format document grids, design master templates, and secure high-stakes approvals.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm shrink-0 border cursor-pointer ${
            showForm 
              ? 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200' 
              : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white animate-pulse'
          }`}
          id="toggle-testimonial-form-btn"
        >
          <UserPlus className="h-4 w-4" />
          <span>{showForm ? 'Cancel Submission' : 'Write A Review'}</span>
        </button>
      </div>

      {showForm && (
        <form 
          onSubmit={handleSubmit} 
          className="bg-neutral-50 rounded-2xl p-6 border border-emerald-250 space-y-4 animate-fade-in"
          id="testimonial-submit-form"
        >
          <div className="border-b border-neutral-200 pb-3">
            <h4 className="font-bold text-neutral-900 text-sm font-sans flex items-center gap-2 uppercase tracking-tight">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Provide Your Digital Formatting Feedback
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">Share your real experience. Custom ratings help maintain stellar academic and corporate typography standards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full text-xs py-2.5 px-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                id="testimonial-input-name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Organization / Company <span className="text-neutral-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stanford University or TechCorp Inc."
                className="w-full text-xs py-2.5 px-3 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                id="testimonial-input-company"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block text-xs">Star Rating</span>
            <div className="flex items-center space-x-1" id="star-rating-selector">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isSelected = starValue <= rating;
                const isHovered = hoveredStar !== null && starValue <= hoveredStar;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredStar(starValue)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-1 transition-all focus:outline-none translate-y-0 active:translate-y-0.5"
                    id={`rating-star-btn-${starValue}`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        isHovered || (hoveredStar === null && isSelected)
                          ? 'text-yellow-400 fill-yellow-400 font-bold scale-110'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-mono font-bold text-neutral-600 ml-2">({rating} / 5 Stars)</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Your Review / Endorsement <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Detail our precision regarding LaTeX codes, bibliography layouts, margins, slide deck colors, and general digital delivery timings."
              className="w-full text-xs py-2.5 px-3.5 border border-neutral-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
              id="testimonial-input-review"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <p className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
              🛡 Verified testimonials comply with Latep Hub digital publishing guidelines.
            </p>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider text-[11px] text-white py-2.5 px-5 rounded-xl transition-colors shadow-sm cursor-pointer"
              id="submit-testimonial-btn"
            >
              Post Experience
            </button>
          </div>
        </form>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Testimonial Published Successfully!</p>
            <p className="text-emerald-700/95 font-light">Your valuable feedback is now actively populated inside our local service page.</p>
          </div>
        </div>
      )}

      {/* Grid displaying the reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="testimonials-list-grid">
        {testimonials.map((item) => (
          <div 
            key={item.id} 
            className="bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-150 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md animate-fade-in relative"
            id={`testimonial-card-${item.id}`}
          >
            <Quote className="absolute right-4 top-4 h-8 w-8 text-emerald-600/5 pointer-events-none select-none" />

            {/* Stars */}
            <div className="space-y-4">
              <div className="flex items-center space-x-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`h-4 w-4 ${
                      s <= item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'
                    }`} 
                  />
                ))}
              </div>

              {/* Text review */}
              <p className="text-xs text-neutral-600 leading-relaxed font-light italic">
                "{item.review}"
              </p>
            </div>

            {/* User credentials */}
            <div className="border-t border-neutral-100/80 pt-4 mt-5 flex items-center justify-between gap-2.5">
              <div className="truncate">
                <p className="text-xs font-bold font-sans text-neutral-900 truncate flex items-center gap-1">
                  {item.name}
                  {item.isVerified && (
                    <span className="inline-block h-3 w-3 text-emerald-600" title="Verified Customer">
                      ✓
                    </span>
                  )}
                </p>
                {item.company && (
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                    {item.company}
                  </p>
                )}
              </div>
              <span className="text-[9px] font-mono text-neutral-400 shrink-0">
                {new Date(item.createdAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
