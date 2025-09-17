import Dexie, { Table } from 'dexie'
import { SlidePresentation, RepositoryData, StoryStructure } from '../types'

export interface StoredPresentation {
  id: string
  title: string
  mode: 'ted' | 'imrad'
  language: 'ja' | 'en' | 'zh'
  duration: 3 | 5
  repositoryUrl: string
  repositoryData: RepositoryData
  storyData: StoryStructure
  presentationData: SlidePresentation
  createdAt: string
  updatedAt: string
  lastAccessed: string
}

export interface CachedRepository {
  url: string
  data: RepositoryData
  cachedAt: string
  expiresAt: string
}

export interface UserSettings {
  id: string
  defaultMode: 'ted' | 'imrad'
  defaultLanguage: 'ja' | 'en' | 'zh'
  defaultDuration: 3 | 5
  theme: 'light' | 'dark'
  autoSave: boolean
  githubToken?: string
}

class Repo2TalkDatabase extends Dexie {
  presentations!: Table<StoredPresentation>
  repositories!: Table<CachedRepository>
  settings!: Table<UserSettings>

  constructor() {
    super('Repo2TalkDatabase')
    
    this.version(1).stores({
      presentations: 'id, title, mode, language, repositoryUrl, createdAt, lastAccessed',
      repositories: 'url, cachedAt, expiresAt',
      settings: 'id'
    })
  }
}

export class StorageService {
  private db: Repo2TalkDatabase

  constructor() {
    this.db = new Repo2TalkDatabase()
  }

  // Presentation Management
  async savePresentation(presentation: SlidePresentation): Promise<void> {
    const stored: StoredPresentation = {
      id: presentation.id,
      title: presentation.title,
      mode: presentation.mode,
      language: presentation.language,
      duration: presentation.duration,
      repositoryUrl: presentation.repository.url,
      repositoryData: presentation.repository,
      storyData: presentation.story,
      presentationData: presentation,
      createdAt: presentation.createdAt,
      updatedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    }

    await this.db.presentations.put(stored)
  }

  async getPresentation(id: string): Promise<StoredPresentation | undefined> {
    const presentation = await this.db.presentations.get(id)
    if (presentation) {
      // Update last accessed time
      await this.db.presentations.update(id, { 
        lastAccessed: new Date().toISOString() 
      })
    }
    return presentation
  }

  async getAllPresentations(): Promise<StoredPresentation[]> {
    return await this.db.presentations
      .orderBy('lastAccessed')
      .reverse()
      .toArray()
  }

  async deletePresentation(id: string): Promise<void> {
    await this.db.presentations.delete(id)
  }

  async searchPresentations(query: string): Promise<StoredPresentation[]> {
    const lowerQuery = query.toLowerCase()
    return await this.db.presentations
      .filter(p => 
        p.title.toLowerCase().includes(lowerQuery) ||
        p.repositoryUrl.toLowerCase().includes(lowerQuery)
      )
      .toArray()
  }

  // Repository Caching
  async cacheRepository(url: string, data: RepositoryData): Promise<void> {
    const cached: CachedRepository = {
      url,
      data,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    await this.db.repositories.put(cached)
  }

  async getCachedRepository(url: string): Promise<RepositoryData | null> {
    const cached = await this.db.repositories.get(url)
    
    if (!cached) {
      return null
    }

    // Check if cache is expired
    if (new Date(cached.expiresAt) < new Date()) {
      await this.db.repositories.delete(url)
      return null
    }

    return cached.data
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date().toISOString()
    await this.db.repositories
      .where('expiresAt')
      .below(now)
      .delete()
  }

  // Settings Management
  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    const currentSettings = await this.getSettings()
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...settings,
      id: 'user_settings'
    }

    await this.db.settings.put(updatedSettings)
  }

  async getSettings(): Promise<UserSettings> {
    const settings = await this.db.settings.get('user_settings')
    
    if (!settings) {
      // Return default settings
      const defaultSettings: UserSettings = {
        id: 'user_settings',
        defaultMode: 'ted',
        defaultLanguage: 'ja',
        defaultDuration: 5,
        theme: 'light',
        autoSave: true
      }
      
      await this.db.settings.put(defaultSettings)
      return defaultSettings
    }

    return settings
  }

  // Backup and Restore
  async exportData(): Promise<{
    presentations: StoredPresentation[]
    settings: UserSettings
    exportedAt: string
  }> {
    const presentations = await this.getAllPresentations()
    const settings = await this.getSettings()

    return {
      presentations,
      settings,
      exportedAt: new Date().toISOString()
    }
  }

  async importData(data: {
    presentations: StoredPresentation[]
    settings: UserSettings
  }): Promise<void> {
    // Clear existing data
    await this.db.presentations.clear()
    await this.db.settings.clear()

    // Import new data
    await this.db.presentations.bulkAdd(data.presentations)
    await this.db.settings.put(data.settings)
  }

  // Statistics
  async getUsageStatistics(): Promise<{
    totalPresentations: number
    presentationsByMode: Record<'ted' | 'imrad', number>
    presentationsByLanguage: Record<'ja' | 'en' | 'zh', number>
    mostUsedDuration: 3 | 5
    recentActivity: StoredPresentation[]
  }> {
    const presentations = await this.getAllPresentations()
    
    const stats = {
      totalPresentations: presentations.length,
      presentationsByMode: { ted: 0, imrad: 0 },
      presentationsByLanguage: { ja: 0, en: 0, zh: 0 },
      mostUsedDuration: 5 as 3 | 5,
      recentActivity: presentations.slice(0, 5)
    }

    presentations.forEach(p => {
      stats.presentationsByMode[p.mode]++
      stats.presentationsByLanguage[p.language]++
    })

    // Calculate most used duration
    const duration3Count = presentations.filter(p => p.duration === 3).length
    const duration5Count = presentations.filter(p => p.duration === 5).length
    stats.mostUsedDuration = duration3Count > duration5Count ? 3 : 5

    return stats
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.clearExpiredCache()
    
    // Remove old presentations (keep last 50)
    const presentations = await this.db.presentations
      .orderBy('lastAccessed')
      .reverse()
      .toArray()
    
    if (presentations.length > 50) {
      const toDelete = presentations.slice(50).map(p => p.id)
      await this.db.presentations.bulkDelete(toDelete)
    }
  }

  // Database Health
  async getDatabaseInfo(): Promise<{
    version: number
    size: number
    presentationCount: number
    cacheCount: number
  }> {
    const presentationCount = await this.db.presentations.count()
    const cacheCount = await this.db.repositories.count()

    return {
      version: this.db.verno,
      size: 0, // IndexedDB doesn't provide direct size info
      presentationCount,
      cacheCount
    }
  }
}

// Service Worker and PWA utilities
export class PWAService {
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)
        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return null
      }
    }
    return null
  }

  async checkForUpdates(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        return !!registration.waiting
      }
    }
    return false
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }

  async getOfflineCapabilities(): Promise<{
    canCreatePresentations: boolean
    canEditPresentations: boolean
    canExportPresentations: boolean
    canAnalyzeRepositories: boolean
  }> {
    const isOnline = await this.isOnline()
    
    return {
      canCreatePresentations: true, // Always available offline with cached data
      canEditPresentations: true,
      canExportPresentations: true,
      canAnalyzeRepositories: isOnline // Requires GitHub API
    }
  }

  async installPrompt(): Promise<void> {
    // This would be triggered by the beforeinstallprompt event
    console.log('PWA installation prompt would be shown here')
  }
}

// Create singleton instances
export const storageService = new StorageService()
export const pwaService = new PWAService()