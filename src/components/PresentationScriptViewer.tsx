import React, { useState, useEffect, useRef } from 'react'
import { PresentationScript, SpeakerNote } from '../services/scriptGenerator'

interface PresentationScriptViewerProps {
  script: PresentationScript
  currentSlideIndex: number
  isPresenting: boolean
  onTimingUpdate?: (elapsed: number, remaining: number) => void
}

export const PresentationScriptViewer: React.FC<PresentationScriptViewerProps> = ({
  script,
  currentSlideIndex,
  isPresenting,
  onTimingUpdate
}) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPracticeMode, setIsPracticeMode] = useState(false)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentSection = script.sections[currentSlideIndex]
  const currentNote = currentSection?.speakerNotes[currentNoteIndex]

  // タイマー機能
  useEffect(() => {
    if (isPresenting || isPracticeMode) {
      const startTime = practiceStartTime || Date.now()
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(elapsed)
        
        const totalEstimated = script.totalDuration
        const remaining = Math.max(0, totalEstimated - elapsed)
        onTimingUpdate?.(elapsed, remaining)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPresenting, isPracticeMode, practiceStartTime, script.totalDuration, onTimingUpdate])

  // 練習モード開始
  const startPractice = () => {
    setIsPracticeMode(true)
    setPracticeStartTime(Date.now())
    setElapsedTime(0)
    setCurrentNoteIndex(0)
  }

  // 練習モード停止
  const stopPractice = () => {
    setIsPracticeMode(false)
    setPracticeStartTime(null)
    setElapsedTime(0)
  }

  // 次のノートに進む
  const nextNote = () => {
    if (currentSection && currentNoteIndex < currentSection.speakerNotes.length - 1) {
      setCurrentNoteIndex(currentNoteIndex + 1)
    }
  }

  // 前のノートに戻る
  const prevNote = () => {
    if (currentNoteIndex > 0) {
      setCurrentNoteIndex(currentNoteIndex - 1)
    }
  }

  // ノートのスタイリング
  const getNoteStyle = (note: SpeakerNote) => {
    const baseStyle = "p-4 rounded-lg mb-4 border-l-4"
    
    switch (note.type) {
      case 'opening':
        return `${baseStyle} bg-blue-50 border-blue-500 text-blue-900`
      case 'explanation':
        return `${baseStyle} bg-green-50 border-green-500 text-green-900`
      case 'emphasis':
        return `${baseStyle} bg-orange-50 border-orange-500 text-orange-900`
      case 'transition':
        return `${baseStyle} bg-purple-50 border-purple-500 text-purple-900`
      case 'interaction':
        return `${baseStyle} bg-pink-50 border-pink-500 text-pink-900`
      case 'conclusion':
        return `${baseStyle} bg-indigo-50 border-indigo-500 text-indigo-900`
      default:
        return `${baseStyle} bg-gray-50 border-gray-500 text-gray-900`
    }
  }

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'confident': return '💪'
      case 'enthusiastic': return '✨'
      case 'thoughtful': return '🤔'
      case 'urgent': return '⚡'
      case 'friendly': return '😊'
      case 'inspiring': return '🌟'
      case 'empathetic': return '🤗'
      default: return '💬'
    }
  }

  if (!currentSection) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <p className="text-gray-600">スライドが選択されていません</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* ヘッダー - タイミング情報と制御 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">📝 話者原稿</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="opacity-75">経過時間:</span>
              <span className="font-mono ml-1">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="text-sm">
              <span className="opacity-75">予定時間:</span>
              <span className="font-mono ml-1">{Math.floor(currentSection.timing.estimatedDuration / 60)}:{(currentSection.timing.estimatedDuration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{currentSection.title}</h3>
          <div className="flex space-x-2">
            {!isPracticeMode ? (
              <button
                onClick={startPractice}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
              >
                練習開始
              </button>
            ) : (
              <button
                onClick={stopPractice}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
              >
                練習終了
              </button>
            )}
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-1000"
            style={{ 
              width: `${Math.min(100, (elapsedTime / currentSection.timing.estimatedDuration) * 100)}%` 
            }}
          ></div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden flex">
        {/* 左側: 原稿内容 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="prose max-w-none">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">📄 セクション内容</h4>
              <div className="text-blue-800 whitespace-pre-line leading-relaxed">
                {currentSection.content}
              </div>
            </div>

            {/* 話者ノート */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">🎤 話者ノート</h4>
              {currentSection.speakerNotes.map((note, index) => (
                <div
                  key={index}
                  className={`${getNoteStyle(note)} ${index === currentNoteIndex && isPracticeMode ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getToneIcon(note.tone)}</span>
                      <span className="font-semibold capitalize">{note.type}</span>
                      <span className="text-sm opacity-75">({note.tone})</span>
                    </div>
                    <div className="text-sm font-mono opacity-75">
                      {Math.floor(note.timing / 60)}:{(note.timing % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  <p className="leading-relaxed">{note.content}</p>
                  
                  {note.gestures && note.gestures.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs font-medium opacity-75">ジェスチャー:</span>
                      {note.gestures.map((gesture, i) => (
                        <span key={i} className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                          {gesture}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {note.pauseAfter && (
                    <div className="mt-2 text-xs opacity-75">
                      ⏸️ {note.pauseAfter}秒間の間を取る
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 強調ポイント */}
            {currentSection.emphasis.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">⚡ 強調ポイント</h4>
                <div className="space-y-3">
                  {currentSection.emphasis.map((emphasis, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-yellow-800">"{emphasis.text}"</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          emphasis.importance === 'critical' ? 'bg-red-100 text-red-800' :
                          emphasis.importance === 'high' ? 'bg-orange-100 text-orange-800' :
                          emphasis.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {emphasis.importance}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-2">
                        技法: <span className="font-medium">{emphasis.technique}</span>
                      </p>
                      <p className="text-sm text-yellow-600">{emphasis.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 聴衆参加技法 */}
            {currentSection.engagementTechniques.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">🤝 聴衆参加技法</h4>
                <div className="space-y-3">
                  {currentSection.engagementTechniques.map((technique, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-green-800">{technique.type}</span>
                        <span className="text-xs text-green-600 font-mono">
                          {Math.floor(technique.timing / 60)}:{(technique.timing % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-green-700 mb-2">{technique.content}</p>
                      {technique.expectedResponse && (
                        <p className="text-sm text-green-600">
                          <span className="font-medium">期待される反応:</span> {technique.expectedResponse}
                        </p>
                      )}
                      {technique.fallbackResponse && (
                        <p className="text-sm text-green-600">
                          <span className="font-medium">代替案:</span> {technique.fallbackResponse}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側: 練習モード制御 */}
        {isPracticeMode && (
          <div className="w-80 bg-gray-50 p-4 border-l">
            <h4 className="font-semibold text-gray-800 mb-4">🎯 練習モード</h4>
            
            {/* 現在のノート */}
            {currentNote && (
              <div className="bg-white p-4 rounded-lg mb-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">現在のノート</span>
                  <span className="text-sm text-gray-500">
                    {currentNoteIndex + 1} / {currentSection.speakerNotes.length}
                  </span>
                </div>
                <div className={`p-3 rounded ${getNoteStyle(currentNote).split(' ').slice(3).join(' ')}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span>{getToneIcon(currentNote.tone)}</span>
                    <span className="font-medium">{currentNote.type}</span>
                  </div>
                  <p className="text-sm">{currentNote.content}</p>
                </div>
              </div>
            )}

            {/* ナビゲーション */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={prevNote}
                disabled={currentNoteIndex === 0}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ← 前
              </button>
              <button
                onClick={nextNote}
                disabled={currentNoteIndex >= currentSection.speakerNotes.length - 1}
                className="flex-1 px-3 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                次 →
              </button>
            </div>

            {/* タイミング情報 */}
            <div className="bg-white p-3 rounded-lg">
              <h5 className="font-medium mb-2">⏱️ タイミング分析</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>経過時間:</span>
                  <span className="font-mono">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span>予定時間:</span>
                  <span className="font-mono">{Math.floor(currentSection.timing.estimatedDuration / 60)}:{(currentSection.timing.estimatedDuration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span>進捗:</span>
                  <span className={`font-medium ${
                    elapsedTime < currentSection.timing.minDuration ? 'text-blue-600' :
                    elapsedTime > currentSection.timing.maxDuration ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {Math.round((elapsedTime / currentSection.timing.estimatedDuration) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}