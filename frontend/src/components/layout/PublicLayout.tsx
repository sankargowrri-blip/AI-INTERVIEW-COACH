import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <path d="M9 9h.01M15 9h.01" />
                  </svg>
                </div>
                <span className="font-bold text-white text-lg tracking-tight">AI Interview Coach</span>
              </div>
              <p className="text-sm text-surface-400">Practice. Improve. Get Hired.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#interview-types" className="hover:text-white transition-colors">Interview Types</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Careers</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white transition-colors cursor-default">Technology</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Business & Finance</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Sales & Marketing</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-10 pt-6 text-sm text-surface-600">
            © {new Date().getFullYear()} AI Interview Coach. All rights reserved. Interview evaluations are AI-generated practice feedback and do not represent professional assessments.
          </div>
        </div>
      </footer>
    </div>
  );
}
