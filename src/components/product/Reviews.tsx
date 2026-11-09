"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listReviews, saveReview, type Review } from "@/lib/repository";
import { useAuth } from "@/store/auth";
import { errorMessage } from "@/lib/validation";
import { dataChanged } from "@/lib/feedback";
export function Reviews({ productId }: { productId: string }) {
  const user = useAuth((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    listReviews(productId)
      .then((r) => {
        if (active) setReviews(r);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [productId]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await saveReview(productId, rating, body);
      setReviews(await listReviews(productId));
      setBody("");
      setMessage("Your review has been saved.");
      dataChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="panel mt-10 p-5">
      <h2 className="mb-4 font-display text-xl font-bold">Customer reviews</h2>
      <p className="mb-4 text-xs text-muted">
        Catalog seed ratings are sample data. Submitted reviews replace the
        sample rating for this product.
      </p>
      {reviews.length === 0 && (
        <p className="mb-4 text-muted">No submitted reviews yet.</p>
      )}
      {reviews.map((r) => (
        <article key={r.id} className="mb-4 border-b border-border pb-3">
          <p className="text-sm text-primary">
            {r.rating}/5 · {new Date(r.created_at).toLocaleDateString()}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{r.body}</p>
        </article>
      ))}
      {user ? (
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">
            Rating
            <select
              className="input mt-1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Your review
            <textarea
              required
              minLength={3}
              maxLength={2000}
              className="input mt-1"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <button disabled={busy} className="btn btn-primary">
            {busy ? "Saving…" : "Save my review"}
          </button>
          <p className="text-xs text-muted">
            One review per account per product. Submitting again updates your
            review.
          </p>
        </form>
      ) : (
        <Link className="text-primary" href="/login">
          Sign in to write a review
        </Link>
      )}
      {error && (
        <p role="alert" className="mt-3 text-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-success">
          {message}
        </p>
      )}
    </section>
  );
}
