import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <span className="text-white font-bold text-lg">R2T</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Repo2Talk
            </span>
          </Link>
          
          <nav className="flex space-x-8">
            <Link 
              to="/" 
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link 
              to="/generate" 
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 relative group"
            >
              Generate
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 group-hover:w-full transition-all duration-200"></span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}