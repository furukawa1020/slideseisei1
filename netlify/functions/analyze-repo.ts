import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { Octokit } from 'octokit'

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { url, token } = JSON.parse(event.body || '{}')
    
    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Repository URL is required' })
      }
    }

    const octokit = new Octokit({ auth: token })
    
    // Parse GitHub URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid GitHub URL' })
      }
    }

    const owner = match[1]
    const repo = match[2].replace(/\.git$/, '')

    // Get repository data
    const [repoData, languages, commits, tree] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listLanguages({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 50 }),
      octokit.rest.git.getTree({ 
        owner, 
        repo, 
        tree_sha: 'HEAD',
        recursive: 'true' 
      }).catch(() => ({ data: { tree: [] } }))
    ])

    // Get README
    let readme = ''
    try {
      const readmeData = await octokit.rest.repos.getReadme({ owner, repo })
      readme = Buffer.from(readmeData.data.content, 'base64').toString('utf-8')
    } catch (error) {
      console.warn('README not found')
    }

    // Analyze dependencies
    const dependencies = await analyzeDependencies(octokit, owner, repo)

    const result = {
      url,
      name: repoData.data.name,
      description: repoData.data.description || '',
      language: repoData.data.language || 'Unknown',
      languages: languages.data,
      dependencies,
      commits: commits.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown',
        date: commit.commit.author?.date || '',
        additions: 0,
        deletions: 0
      })),
      files: tree.data.tree
        .filter(item => item.type === 'blob')
        .map(file => ({
          path: file.path || '',
          type: getFileType(file.path || ''),
          size: file.size || 0,
          importance: calculateFileImportance(file.path || '')
        }))
        .slice(0, 100),
      readme,
      screenshots: [],
      createdAt: repoData.data.created_at,
      updatedAt: repoData.data.updated_at,
      stars: repoData.data.stargazers_count,
      forks: repoData.data.forks_count
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }

  } catch (error) {
    console.error('Error analyzing repository:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to analyze repository',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

async function analyzeDependencies(octokit: Octokit, owner: string, repo: string) {
  const dependencies = []
  
  try {
    // Try package.json
    const packageJson = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'package.json'
    })

    if ('content' in packageJson.data) {
      const content = Buffer.from(packageJson.data.content, 'base64').toString('utf-8')
      const parsed = JSON.parse(content)
      
      if (parsed.dependencies) {
        Object.entries(parsed.dependencies).forEach(([name, version]) => {
          dependencies.push({
            name,
            version: version as string,
            type: 'dependency'
          })
        })
      }
    }
  } catch (error) {
    // Try requirements.txt
    try {
      const requirements = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'requirements.txt'
      })

      if ('content' in requirements.data) {
        const content = Buffer.from(requirements.data.content, 'base64').toString('utf-8')
        content.split('\n').forEach(line => {
          if (line.trim()) {
            const [name, version] = line.trim().split('==')
            dependencies.push({
              name,
              version: version || 'latest',
              type: 'dependency'
            })
          }
        })
      }
    } catch (pythonError) {
      console.warn('No dependency files found')
    }
  }

  return dependencies
}

function getFileType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'react',
    'tsx': 'react',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'md': 'markdown',
    'json': 'json',
    'yml': 'yaml',
    'yaml': 'yaml',
    'css': 'css',
    'html': 'html',
    'vue': 'vue',
    'go': 'go',
    'rs': 'rust'
  }
  return typeMap[extension || ''] || 'unknown'
}

function calculateFileImportance(path: string): number {
  if (path.match(/^(README|readme)/)) return 10
  if (path.match(/package\.json|requirements\.txt|pom\.xml|Cargo\.toml/)) return 9
  if (path.match(/src\/|lib\/|app\//)) return 8
  if (path.match(/test\/|spec\/|__tests__\//)) return 7
  if (path.match(/\.config\.|\.env|Dockerfile/)) return 6
  if (path.match(/docs\/|documentation\//)) return 5
  return 3
}

export { handler }