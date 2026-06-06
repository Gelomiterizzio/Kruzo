/**
 * Pure review-aggregation helpers (no Firebase imports → unit-testable).
 * The business document is the source of truth; ratingDistribution drives both
 * reviewCount and the average rating, so they can never disagree.
 */
const STARS = [1, 2, 3, 4, 5]

function normalizeDist(dist) {
  const d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (dist) for (const s of STARS) d[s] = Math.max(0, Math.round(Number(dist[s] ?? dist[String(s)] ?? 0)))
  return d
}

function summarize(dist) {
  const d = normalizeDist(dist)
  const total = STARS.reduce((a, s) => a + d[s], 0)
  const sum = STARS.reduce((a, s) => a + s * d[s], 0)
  return {
    ratingDistribution: d,
    reviewCount: total,
    rating: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
  }
}

function applyReviewDelta(dist, beforeRating, afterRating) {
  const d = normalizeDist(dist)
  if (beforeRating != null && STARS.includes(beforeRating)) d[beforeRating] = Math.max(0, d[beforeRating] - 1)
  if (afterRating != null && STARS.includes(afterRating)) d[afterRating] = d[afterRating] + 1
  return summarize(d)
}

// A review only contributes to the stats while it is visible (not hidden).
function visibleRating(data) {
  if (!data || data.isHidden === true) return null
  const r = Number(data.rating)
  return STARS.includes(r) ? r : null
}

module.exports = { STARS, normalizeDist, summarize, applyReviewDelta, visibleRating }
