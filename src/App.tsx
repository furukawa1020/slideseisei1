import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import SlideGenerator from './components/SlideGenerator'
import { SlideViewer } from './components/SlideViewer'
import Header from './components/Header'
import './App.css'
import { useState } from 'react'

function App() {
  const [language, setLanguage] = useState<'ja' | 'en' | 'zh'>('ja')

  return (
    <Router>
      <div className="App">
        <Header language={language} setLanguage={setLanguage} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generate" element={<SlideGenerator />} />
            <Route path="/slides/:id" element={<SlideViewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App