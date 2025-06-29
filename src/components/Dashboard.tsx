import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth/auth.store';
import { useDocumentStore } from '../store/document/document.store';
import { Document } from '../types';
import { runHarperAnalysis } from '../utils/harperLinter';
import DocumentList from './DocumentList';
import FeatureShowcaseSection from './dashboard/FeatureShowcaseSection';

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setLoading(true);
    setIsDropdownOpen(false);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user?.uid) {
      fetchDocuments(user.uid);
    }
  }, [user?.uid, fetchDocuments]);

  useEffect(() => {
    const calculateScore = async () => {
      if (documents.length === 0) {
        setAnalysisScore(null);
        return;
      }

      let totalChars = 0;
      let errorChars = 0;

      const promises = documents.map(async (doc) => {
        if (!doc.content) return { chars: 0, errors: 0 };
        
        const lints = await runHarperAnalysis(doc.content);
        const chars = doc.content.length;
        
        if (lints.length === 0) return { chars, errors: 0 };
        
        const spans = lints.map(lint => lint.span());
        const errors = spans.reduce((sum, span) => sum + (span.end - span.start), 0);
        
        return { chars, errors };
      });

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        totalChars += result.chars;
        errorChars += result.errors;
      });

      const score = totalChars > 0 ? 100 - (errorChars / totalChars) * 100 : 100;
      setAnalysisScore(Math.max(0, score));
    };

    calculateScore();
  }, [documents]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-white to-purple-100 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob z-0" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 z-0" />
      <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-4000 z-0" />
      
      {/* Navigation */}
      <nav className="relative bg-white/85 backdrop-blur-sm shadow-sm border-b border-gray-200/50 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">AlignWrite</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 px-3 py-2 rounded-md text-sm font-medium bg-white/95 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 z-40"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-medium">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        {user.email}
                        {user.role && (
                          <div className="text-xs text-gray-400 mt-1">
                            {user.role}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/90 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile Settings
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-3 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          {loading ? 'Signing out...' : 'Sign Out'}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 z-10">
        <div className="space-y-6">

          {/* Feature Showcase Section */}
          <FeatureShowcaseSection />

          {/* Documents Section */}
          <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-lg border border-white/60">
            <div className="p-6">
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white/90 backdrop-blur-sm overflow-hidden rounded-lg p-5 border border-white/40 shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Documents
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {documents.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm overflow-hidden rounded-lg p-5 border border-white/40 shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Words
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {documents.reduce(
                              (total: number, doc: Document) => total + doc.wordCount,
                              0
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm overflow-hidden rounded-lg p-5 border border-white/40 shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Document Analysis Score
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {analysisScore !== null ? (
                              <span className={getScoreColor(analysisScore)}>
                                {Math.round(analysisScore)}%
                              </span>
                            ) : (
                              <span className="text-gray-500">Analyzing...</span>
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <DocumentList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
