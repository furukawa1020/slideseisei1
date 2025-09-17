# Repo2Talk - GitHub Repository to Slide Generation System

This project automatically generates TED-style and IMRAD structured slides from GitHub repositories, code implementations, and screenshots.

## Project Overview
- **Frontend**: React + Vite + TypeScript
- **Backend**: Netlify Functions
- **Slide Engine**: Reveal.js
- **OCR**: Tesseract.js
- **Storage**: IndexedDB (local) + optional cloud sync
- **AI**: LLM/WebLLM integration for content enhancement

## Key Features
- Automatic repository analysis (languages, dependencies, commit history)
- OCR and image caption generation
- Story generation (Why/Problem/Approach/Result/Next)
- TED-style and IMRAD mode slide templates
- Multi-format export (PDF, PPTX, Keynote)
- PWA with offline capabilities
- Multi-language support (Japanese, English, Chinese)

## Development Guidelines
- Use TypeScript for type safety
- Implement component-based architecture
- Follow accessibility standards (AA compliance)
- Optimize for performance (60s analysis for 100k+ lines)
- External API dependency should be minimal

## Progress Tracking
- [x] Create workspace structure
- [x] Setup React/Vite/TypeScript foundation
- [x] Implement basic UI components and routing
- [x] Create GitHub API service foundation
- [x] Build story generation engine
- [ ] Implement GitHub API integration
- [ ] Build repository analysis engine
- [ ] Implement Reveal.js slide system
- [ ] Add OCR and image analysis
- [ ] Build export functionality
- [ ] Implement PWA features
- [ ] Add LLM agent integration