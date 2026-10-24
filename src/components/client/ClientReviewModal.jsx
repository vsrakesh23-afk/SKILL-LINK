// src/components/client/ClientReviewModal.jsx
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Star, X, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClientReviewModal({ job, isOpen, onClose }) {
  const { submitReview } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    setTimeout(() => {
      submitReview(job.id, {
        rating,
        comment: comment.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 border border-amber-200 rounded-xl text-amber-700">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rate & Review Work</h3>
              <p className="text-xs text-slate-500">Job #{job.id} • {job.workerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-center">
          <div>
            <p className="text-xs text-slate-600 mb-2">How satisfied were you with the trade service?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="inline-block mt-2 text-xs font-semibold text-amber-700 font-mono">
              {rating === 5 && 'Outstanding Work (5.0)'}
              {rating === 4 && 'Very Good Quality (4.0)'}
              {rating === 3 && 'Acceptable (3.0)'}
              {rating === 2 && 'Needs Improvement (2.0)'}
              {rating === 1 && 'Unsatisfactory (1.0)'}
            </span>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Write a Public Testimonial
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the tradesperson punctual? Did they explain the repair clearly? How clean was the finish?"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-amber-500 focus:outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Posting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
