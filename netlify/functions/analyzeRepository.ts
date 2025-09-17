// Netlify Function for scraping repository data without API
import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { repoUrl } = JSON.parse(event.body || '{}')
    
    if (!repoUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Repository URL is required' })
      }
    }

    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid GitHub URL' })
      }
    }

    const [, owner, repo] = match.map((s: string) => s.replace(/\.git$/, ''))

    // Scrape repository page directly
    const repoPageUrl = `https://github.com/${owner}/${repo}`
    const response = await fetch(repoPageUrl)
    
    if (!response.ok) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Repository not found' })
      }
    }

    const html = await response.text()
    
    // Extract basic information from HTML
    const repositoryData = {
      id: `${owner}/${repo}`,
      name: repo,
      owner,
      url: repoUrl,
      description: extractDescription(html),
      language: extractPrimaryLanguage(html),
      languages: extractLanguages(html),
      stars: extractStarCount(html),
      forks: extractForkCount(html),
      files: await extractFileList(owner, repo),
      readme: await extractReadme(owner, repo),
      commits: await extractRecentCommits(owner, repo),
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      watchers: 0,
      openIssues: 0
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(repositoryData)
    }

  } catch (error) {
    console.error('Error analyzing repository:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to analyze repository' })
    }
  }
}

function extractDescription(html: string): string {
  // Extract description from meta tags or repository about section
  const metaDescMatch = html.match(/<meta name="description" content="([^"]+)"/)
  if (metaDescMatch) return metaDescMatch[1]
  
  const aboutMatch = html.match(/<p[^>]*class="[^"]*repository-content[^"]*"[^>]*>([^<]+)<\/p>/)
  if (aboutMatch) return aboutMatch[1].trim()
  
  return 'A GitHub repository'
}

function extractPrimaryLanguage(html: string): string {
  const langMatch = html.match(/<span[^>]*class="[^"]*color-fg-default[^"]*"[^>]*>([^<]+)<\/span>/)
  return langMatch ? langMatch[1].trim() : 'Unknown'
}

function extractLanguages(html: string): Record<string, number> {
  // This would require more sophisticated parsing
  // For now, return based on primary language
  const primary = extractPrimaryLanguage(html)
  return primary !== 'Unknown' ? { [primary]: 100 } : {}
}

function extractStarCount(html: string): number {
  const starMatch = html.match(/(\d+)\s*<\/span>\s*<span[^>]*>\s*star/i)
  return starMatch ? parseInt(starMatch[1]) : 0
}

function extractForkCount(html: string): number {
  const forkMatch = html.match(/(\d+)\s*<\/span>\s*<span[^>]*>\s*fork/i)
  return forkMatch ? parseInt(forkMatch[1]) : 0
}

async function extractFileList(owner: string, repo: string): Promise<any[]> {
  try {
    const treeUrl = `https://github.com/${owner}/${repo}/tree/main`
    const response = await fetch(treeUrl)
    const html = await response.text()
    
    // Extract file list from repository tree page
    const fileMatches = html.matchAll(/<a[^>]*href="\/[^"]*\/blob\/[^"]*\/([^"]+)"[^>]*>([^<]+)<\/a>/g)
    const files = []
    
    for (const match of fileMatches) {
      const [, path, filename] = match
      files.push({
        path: path,
        type: getFileType(filename),
        size: 0,
        content: ''
      })
    }
    
    return files.slice(0, 50) // Limit to prevent excessive processing
  } catch (error) {
    return []
  }
}

async function extractReadme(owner: string, repo: string): Promise<string> {
  try {
    // Try different README variations
    const readmeVariations = ['README.md', 'readme.md', 'README.txt', 'readme.txt']
    
    for (const filename of readmeVariations) {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filename}`
      const response = await fetch(readmeUrl)
      
      if (response.ok) {
        return await response.text()
      }
    }
    
    return '' // No README found
  } catch (error) {
    return ''
  }
}

async function extractRecentCommits(owner: string, repo: string): Promise<any[]> {
  try {
    const commitsUrl = `https://github.com/${owner}/${repo}/commits`
    const response = await fetch(commitsUrl)
    const html = await response.text()
    
    // Extract commit information from commits page
    const commitMatches = html.matchAll(/<a[^>]*class="[^"]*Link--primary[^"]*"[^>]*>([^<]+)<\/a>/g)
    const commits = []
    
    let count = 0
    for (const match of commitMatches) {
      if (count >= 10) break
      commits.push({
        sha: `commit_${count}`,
        message: match[1].trim(),
        author: owner,
        date: new Date(Date.now() - count * 24 * 60 * 60 * 1000).toISOString()
      })
      count++
    }
    
    return commits
  } catch (error) {
    return []
  }
}

function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript', 
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'vue': 'vue',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'txt': 'text'
  }
  return typeMap[extension || ''] || 'unknown'
}