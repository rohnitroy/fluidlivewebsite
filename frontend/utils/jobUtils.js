// FluidJobs API base URL
export const FLUIDJOBS_API = 'https://api.fluidjobs.ai/api'

/**
 * Convert a job title to a URL-friendly slug (no numbers, no IDs)
 * e.g. "Senior Frontend Engineer" → "senior-frontend-engineer"
 */
export function titleToSlug(title) {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')            // spaces → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim leading/trailing hyphens
}

/**
 * Find a job from a list by matching its title slug
 */
export function findJobBySlug(jobs, slug) {
  return jobs.find(job => titleToSlug(job.title) === slug) || null
}

/**
 * Format salary display
 */
export function formatSalary(min, max, show) {
  if (!show) return null
  if (!min && !max) return null
  const fmt = (n) => `₹${(n / 100000).toFixed(1)}L`
  if (min && max) return `${fmt(min)} – ${fmt(max)} PA`
  if (min) return `${fmt(min)}+ PA`
  if (max) return `Up to ${fmt(max)} PA`
  return null
}

/**
 * Format experience range
 */
export function formatExperience(min, max) {
  if (!min && !max) return null
  if (min && max) return `${min}–${max} yrs`
  if (min) return `${min}+ yrs`
  if (max) return `Up to ${max} yrs`
  return null
}

/**
 * Format posted date as "May 2026" or "3 days ago"
 */
export function formatPostedDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

/**
 * Fetch all published jobs from FluidJobs API
 */
export async function fetchPublishedJobs() {
  const res = await fetch(`${FLUIDJOBS_API}/jobs-enhanced/published`, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error('Failed to fetch jobs')
  const data = await res.json()
  return data.success ? data.jobs : []
}

/**
 * Submit job application to FluidJobs backend
 * Accepts a FormData object (with cv file)
 */
export async function submitApplication(formData) {
  const res = await fetch(`${FLUIDJOBS_API}/job-applications/public-apply`, {
    method: 'POST',
    body: formData   // multipart/form-data — browser sets Content-Type automatically
  })
  const data = await res.json()
  return data
}
