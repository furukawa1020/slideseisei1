import React from 'react'
import { RepositoryData } from '../types'

interface RepositoryAnalysisDisplayProps {
  repository: RepositoryData
}

export const RepositoryAnalysisDisplay: React.FC<RepositoryAnalysisDisplayProps> = ({ repository }) => {
  const { languageStats, projectPurpose, architectureAnalysis, designPatterns, frameworkAnalysis } = repository

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">📊 Repository Analysis</h3>
      
      {/* Project Purpose Analysis */}
      {projectPurpose && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">🎯 プロジェクトの目的と価値</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded">
              <h5 className="font-medium text-blue-700 mb-2">主要目的</h5>
              <p className="text-sm text-gray-700">{projectPurpose.primaryPurpose}</p>
            </div>
            <div className="bg-white p-4 rounded">
              <h5 className="font-medium text-green-700 mb-2">解決する問題</h5>
              <p className="text-sm text-gray-700">{projectPurpose.problemSolved}</p>
            </div>
            <div className="bg-white p-4 rounded">
              <h5 className="font-medium text-purple-700 mb-2">対象ユーザー</h5>
              <p className="text-sm text-gray-700">{projectPurpose.targetAudience}</p>
            </div>
            <div className="bg-white p-4 rounded">
              <h5 className="font-medium text-orange-700 mb-2">ビジネス価値</h5>
              <p className="text-sm text-gray-700">{projectPurpose.businessValue}</p>
            </div>
          </div>
          
          {projectPurpose.technicalEvidence.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded">
              <h5 className="font-medium text-gray-700 mb-2">🔧 技術的根拠</h5>
              <ul className="list-disc list-inside space-y-1">
                {projectPurpose.technicalEvidence.map((evidence, index) => (
                  <li key={index} className="text-sm text-gray-600">{evidence}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 bg-white p-4 rounded">
            <h5 className="font-medium text-gray-700 mb-2">📈 市場背景</h5>
            <p className="text-sm text-gray-600">{projectPurpose.marketContext}</p>
          </div>
        </div>
      )}
      
      {/* Language Distribution */}
      {languageStats && languageStats.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">🔤 Language Distribution</h4>
          <div className="space-y-2">
            {languageStats.map((lang, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-700">{lang.language}</span>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* Architecture Analysis */}
      {architectureAnalysis && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">🏗️ Architecture Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-medium text-gray-700 mb-1">Pattern</h5>
              <p className="text-sm text-gray-600">{architectureAnalysis.pattern}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-medium text-gray-700 mb-1">Complexity</h5>
              <p className="text-sm text-gray-600 capitalize">{architectureAnalysis.complexity}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-medium text-gray-700 mb-1">Structure</h5>
              <p className="text-sm text-gray-600">{architectureAnalysis.structure.join(', ')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h5 className="font-medium text-gray-700 mb-1">Layering</h5>
              <p className="text-sm text-gray-600">{architectureAnalysis.layering.join(', ')}</p>
            </div>
          </div>
          
          {architectureAnalysis.designRationale && (
            <div className="mt-4 bg-blue-50 p-4 rounded">
              <h5 className="font-medium text-gray-700 mb-2">🎯 設計思想</h5>
              <p className="text-sm text-gray-600">{architectureAnalysis.designRationale}</p>
            </div>
          )}
          
          {architectureAnalysis.scalabilityIndicators && architectureAnalysis.scalabilityIndicators.length > 0 && (
            <div className="mt-4 bg-green-50 p-4 rounded">
              <h5 className="font-medium text-gray-700 mb-2">📈 スケーラビリティ指標</h5>
              <ul className="list-disc list-inside space-y-1">
                {architectureAnalysis.scalabilityIndicators.map((indicator, index) => (
                  <li key={index} className="text-sm text-gray-600">{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Design Patterns */}
      {designPatterns && designPatterns.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">🎨 Design Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {designPatterns.map((pattern, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Framework Analysis */}
      {frameworkAnalysis && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">⚡ Framework Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworkAnalysis.percentages.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">{item.category}</h5>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.percentage}%</span>
                </div>
                <p className="text-xs text-gray-600">{item.frameworks}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tech Stack Summary */}
      {frameworkAnalysis && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-gray-700">🚀 Tech Stack Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{frameworkAnalysis.frontend.length}</p>
              <p className="text-sm text-gray-600">Frontend</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{frameworkAnalysis.backend.length}</p>
              <p className="text-sm text-gray-600">Backend</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{frameworkAnalysis.database.length}</p>
              <p className="text-sm text-gray-600">Database</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{frameworkAnalysis.buildTools.length}</p>
              <p className="text-sm text-gray-600">Build Tools</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RepositoryAnalysisDisplay