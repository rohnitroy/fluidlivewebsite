import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../public/logo.png'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img 
              src={logo}
              alt="FLUID.LIVE Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">Home</Link>
            <Link to="/services" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">Services</Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">About</Link>
            <Link to="/insights" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">Insights</Link>
            <Link to="/careers" className="text-gray-600 hover:text-gray-900 transition-colors duration-300">Careers</Link>
            <Link 
              to="/contact" 
              className="btn-primary"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 pt-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900 transition">Home</Link>
              <Link to="/services" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900 transition">Services</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900 transition">About</Link>
              <Link to="/insights" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900 transition">Insights</Link>
              <Link to="/careers" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-900 transition">Careers</Link>
              <Link 
                to="/contact" 
                onClick={() => setIsOpen(false)}
                className="btn-primary text-center"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
