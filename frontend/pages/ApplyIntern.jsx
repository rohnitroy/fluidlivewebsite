import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import SEO from '../components/SEO'
import { staticJobs } from '../data/staticJobs'

export default function ApplyIntern() {
  const { paperformId } = useParams()
  
  // Find the job matching the paperformId to show title
  const job = staticJobs.find(j => j.paperformId === paperformId)
  const jobTitle = job ? job.title : 'Internship Application'

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50 flex flex-col items-center">
      <SEO
        title={`Apply - ${jobTitle}`}
        path={`/careers/intern/${paperformId}`}
        description={`Internship application form for ${jobTitle} at FluidLive.`}
      />
      
      <div className="w-full max-w-4xl px-4 sm:px-6">
        <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Openings
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Internship Form</span>
            <h1 className="text-2xl sm:text-3xl font-medium text-gray-900 mt-1">{jobTitle}</h1>
            {job && <p className="text-gray-500 mt-1">{job.company} · {job.location}</p>}
          </div>
          
          <div className="relative w-full min-h-[700px] border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
            <iframe
              src={`https://${paperformId}.paperform.co`}
              title="Internship Application Form"
              className="absolute inset-0 w-full h-full border-0"
              allow="geolocation; microphone; camera"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
