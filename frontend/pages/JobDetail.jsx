import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { MapPin, Briefcase, Clock, DollarSign, ChevronLeft, Loader2, Calendar } from 'lucide-react'
import SEO from '../components/SEO'
import {
  fetchPublishedJobs, findJobBySlug,
  formatSalary, formatExperience, formatPostedDate
} from '../utils/jobUtils'

/* ═══════════════════════════════════════════════════════════════
   JOB DETAIL PAGE (with Paperform Redirect)
   ═══════════════════════════════════════════════════════════════ */
export default function JobDetail() {
  const { slug } = useParams()
  const location = useLocation()
  const [job, setJob] = useState(location.state?.job || null)
  const [loading, setLoading] = useState(!job)

  useEffect(() => {
    if (job) return
    fetchPublishedJobs()
      .then(jobs => setJob(findJobBySlug(jobs, slug)))
      .catch(() => setJob(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-6xl mb-2">🌊</div>
        <h1 className="text-3xl font-medium text-gray-900">Job Not Found</h1>
        <p className="text-gray-500 max-w-md">This opening may no longer be available or the link might be outdated.</p>
        <Link to="/careers" className="btn-primary mt-4 text-base">← View All Openings</Link>
      </div>
    )
  }

  const salary    = formatSalary(job.minSalary || job.min_salary, job.maxSalary || job.max_salary, job.showSalaryToCandidate ?? job.show_salary_to_candidate)
  const exp       = formatExperience(job.minExperience || job.min_experience, job.maxExperience || job.max_experience)
  const posted    = formatPostedDate(job.postedDate || job.created_at)
  const location_ = typeof job.location === 'string' ? job.location : (Array.isArray(job.locations) ? job.locations.join(', ') : '')
  const mode      = job.modeOfJob || job.mode_of_job
  const type      = job.jobType || job.job_type
  const company   = job.company || 'FluidLive Solutions'
  const coverImg  = job.selectedImage || job.selected_image
  const skills    = Array.isArray(job.skills) ? job.skills : []
  const desc      = (job.description || job.job_description || '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")

  return (
    <div className="pt-4 min-h-screen bg-white">
      <SEO
        title={job.title}
        path={`/careers/${slug}`}
        description={`${job.title} at ${company} - ${location_}. ${type ? type + ' · ' : ''}${exp ? exp + ' experience required.' : ''}`}
        keywords={`${job.title}, ${company}, ${location_}, jobs, careers, fluid live`}
      />

      {/* Cover image banner */}
      {coverImg && (
        <div className="w-full h-56 md:h-72 overflow-hidden">
          <img src={coverImg} alt={job.title} className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.display = 'none' }} />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Breadcrumb */}
        <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Openings
        </Link>

        {/* Header */}
        <div className="mb-10">
          {type && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-4">
              {type}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-3" style={{ letterSpacing: '-0.02em' }}>
            {job.title}
          </h1>
        </div>

        {/* Info bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          {location_ && (
            <InfoCell icon={<MapPin className="w-4 h-4 text-blue-500" />} label="Location" value={location_} />
          )}
          {mode && (
            <InfoCell icon={<Briefcase className="w-4 h-4 text-blue-500" />} label="Work Mode" value={mode} />
          )}
          {exp && (
            <InfoCell icon={<Clock className="w-4 h-4 text-blue-500" />} label="Experience" value={exp} />
          )}
          {salary && (
            <InfoCell icon={<DollarSign className="w-4 h-4 text-blue-500" />} label="Salary" value={salary} />
          )}
          {posted && (
            <InfoCell icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Posted" value={posted} />
          )}
        </div>

        {/* Apply button (top) */}
        <div className="mb-12">
          <Link to="#" className="btn-primary inline-block text-center w-full md:w-auto text-lg">
            Apply for This Role →
          </Link>
        </div>

        {/* Description */}
        {desc && (
          <div className="mb-10">
            <h2 className="text-2xl font-medium text-gray-900 mb-5" style={{ letterSpacing: '-0.02em' }}>About the Role</h2>
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed job-description-html"
              dangerouslySetInnerHTML={{ __html: desc }}
            />
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-5" style={{ letterSpacing: '-0.02em' }}>Required Skills</h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply button (bottom) */}
        <div className="border-t border-gray-100 pt-10">
          <Link to="#" className="btn-primary inline-block text-center w-full text-lg">
            Apply Now
          </Link>
        </div>

      </div>
    </div>
  )
}

/* ─── Info cell helper ────── */
function InfoCell({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wider font-medium">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  )
}
