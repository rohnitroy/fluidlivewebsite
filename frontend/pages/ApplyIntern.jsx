import { useParams, useLocation, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import SEO from '../components/SEO'
import { staticJobs } from '../data/staticJobs'

export default function ApplyIntern() {
  const { paperformId } = useParams()
  const { search } = useLocation()
  const activePaperformId = paperformId || 'v2xctmpy'
  
  // Find the job matching the paperformId to show title
  const job = paperformId ? staticJobs.find(j => j.paperformId === paperformId) : null
  const jobTitle = job ? job.title : 'Internship Application'

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <SEO
        title={`Apply - ${jobTitle}`}
        path={paperformId ? `/careers/intern/${paperformId}` : '/careers/intern'}
        description={`Internship application form for ${jobTitle} at FluidLive.`}
      />
      
      {/* Section 1: Header Banner with Background Image */}
      <div 
        className="w-full pt-36 pb-28 bg-cover bg-center bg-no-repeat relative text-center border-b border-gray-100 flex flex-col items-center justify-center"
        style={{ backgroundImage: "url('/IT-ADMIN.jpg')" }}
      >
        {/* Centered blue container with reduced width and rounded corners */}
        <div className="relative z-10 w-full max-w-2xl bg-[#3b82f6]/95 py-5 sm:py-6 shadow-md rounded-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-wide">
            Internship Application
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
        
        {/* Render the iframe directly with scrolling disabled and large min-height to fit form completely */}
        <iframe
          src={`https://${activePaperformId}.paperform.co${search}`}
          title="Internship Application Form"
          className="w-full min-h-[900px] border-0 bg-transparent"
          scrolling="no"
          allow="geolocation; microphone; camera"
        />
      </div>
    </div>
  )
}
