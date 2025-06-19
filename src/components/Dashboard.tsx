import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth/auth.store';
import { useDocumentStore } from '../store/document/document.store';
import { Document } from '../types';
import DocumentList from './DocumentList';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchDocuments(user.uid);
    }
  }, [user?.uid, fetchDocuments]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">WordWise</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block">
                  {user.displayName || user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome back, {user.displayName || 'there'}!
              </h2>
              <p className="text-gray-600">
                Ready to improve your writing with lightning-fast browser spell checking?
              </p>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-gray-50 overflow-hidden rounded-lg p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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

                  <div className="bg-gray-50 overflow-hidden rounded-lg p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
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

                  <div className="bg-gray-50 overflow-hidden rounded-lg p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
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
                            Spell Checker
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            <span className="text-green-600 font-medium">⚡ Browser</span>
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
