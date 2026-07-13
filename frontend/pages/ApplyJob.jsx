import { useParams, useLocation, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import SEO from '../components/SEO'
import { staticJobs } from '../data/staticJobs'

export default function ApplyJob() {
  const { paperformId } = useParams()
  const { search } = useLocation()
  const activePaperformId = paperformId || 'poytmtv2'
  
  // Find the job matching the paperformId to show title
  const job = paperformId ? staticJobs.find(j => j.paperformId === paperformId) : null
  const jobTitle = job ? job.title : 'General Application'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <SEO
        title={`Apply - ${jobTitle}`}
        path={paperformId ? `/careers/apply/${paperformId}` : '/careers/apply'}
        description={`Application form for ${jobTitle} at FluidLive.`}
      />
      
      <div 
        className="w-full pt-36 pb-28 bg-cover bg-center bg-no-repeat relative text-center border-b border-gray-100 flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('/IT-ADMIN.jpg')" }}
      >
        {/* Centered blue container with reduced width and rounded corners */}
        <div className="relative z-10 w-full max-w-2xl bg-[#3b82f6]/95 py-5 sm:py-6 shadow-md rounded-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-wide">
            Job Application
          </h1>
        </div>
        
        {job && (
          <div className="relative z-10 mt-4 max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-gray-700 font-medium text-lg bg-white/80 px-4 py-1.5 rounded-full border border-gray-100 inline-block">{jobTitle}</p>
          </div>
        )}
      </div>
      
      {/* Section 2: Form/IFrame Area */}
      <div className="w-full max-w-4xl px-4 sm:px-6 py-12">
        <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Openings
        </Link>
        
        {/* Render the iframe with scrolling auto and responsive heights to prevent mobile overlaps */}
        <iframe
          src={`https://${activePaperformId}.paperform.co${search}`}
          title="Job Application Form"
          className="w-full min-h-[650px] md:min-h-[900px] h-[75vh] md:h-auto border-0 bg-transparent"
          scrolling="auto"
          allow="geolocation; microphone; camera"
        />
      </div>
    </div>
  )
}
