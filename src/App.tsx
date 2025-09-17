import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { SlideGenerator } from './components/SlideGenerator'
import { SlideViewer } from './components/SlideViewer'
import { Header } from './components/Header'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
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