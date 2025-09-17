import { Octokit } from 'octokit'
import { RepositoryData, CommitData, FileData } from '../types'

export class GitHubService {
  private octokit: Octokit

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token
    })
  }

  async analyzeRepository(url: string): Promise<RepositoryData> {
    try {
      const { owner, repo } = this.parseGitHubUrl(url)
      
      // Get repository basic info
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      })

      // Get languages
      const { data: languages } = await this.octokit.rest.repos.listLanguages({
        owner,
        repo
      })

      // Get recent commits
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 50
      })

      // Get file tree
      const { data: tree } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: repoData.default_branch,
        recursive: 'true'
      })

      // Get README
      let readme = ''
      try {
        const { data: readmeData } = await this.octokit.rest.repos.getReadme({
          owner,
          repo
        })
        readme = Buffer.from(readmeData.content, 'base64').toString('utf-8')
      } catch (error) {
        console.warn('README not found')
      }

      // Analyze dependencies
      const dependencies = await this.analyzeDependencies(owner, repo)

      // Process commits data
      const commitData: CommitData[] = commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || 'Unknown',
        date: commit.commit.author?.date || '',
        additions: 0, // This would need additional API calls
        deletions: 0
      }))

      // Process file data
      const fileData: FileData[] = tree.tree
        .filter(item => item.type === 'blob')
        .map(file => ({
          path: file.path || '',
          type: this.getFileType(file.path || ''),
          size: file.size || 0,
          importance: this.calculateFileImportance(file.path || '')
        }))
        .slice(0, 100) // Limit for performance

      return {
        url,
        name: repoData.name,
        description: repoData.description || '',
        language: repoData.language || 'Unknown',
        languages,
        dependencies,
        commits: commitData,
        files: fileData,
        readme,
        screenshots: [], // Will be populated from user uploads
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count
      }
    } catch (error) {
      console.error('Error analyzing repository:', error)
      throw new Error('Failed to analyze repository')
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, '')
    }
  }

  private async analyzeDependencies(owner: string, repo: string) {
    const dependencies: { name: string; version: string; type: 'dependency' | 'devDependency' }[] = []
    
    try {
      // Try to get package.json
      const { data: packageJson } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'package.json'
      })

      if ('content' in packageJson) {
        const content = Buffer.from(packageJson.content, 'base64').toString('utf-8')
        const parsed = JSON.parse(content)
        
        if (parsed.dependencies) {
          Object.entries(parsed.dependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              type: 'dependency' as const
            })
          })
        }

        if (parsed.devDependencies) {
          Object.entries(parsed.devDependencies).forEach(([name, version]) => {
            dependencies.push({
              name,
              version: version as string,
              type: 'devDependency' as const
            })
          })
        }
      }
    } catch (error) {
      // Try requirements.txt for Python
      try {
        const { data: requirements } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'requirements.txt'
        })

        if ('content' in requirements) {
          const content = Buffer.from(requirements.content, 'base64').toString('utf-8')
          content.split('\n').forEach(line => {
            if (line.trim()) {
              const [name, version] = line.trim().split('==')
              dependencies.push({
                name,
                version: version || 'latest',
                type: 'dependency' as const
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

  private getFileType(path: string): string {
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

  private calculateFileImportance(path: string): number {
    // Calculate importance based on file patterns
    if (path.match(/^(README|readme)/)) return 10
    if (path.match(/package\.json|requirements\.txt|pom\.xml|Cargo\.toml/)) return 9
    if (path.match(/src\/|lib\/|app\//)) return 8
    if (path.match(/test\/|spec\/|__tests__\//)) return 7
    if (path.match(/\.config\.|\.env|Dockerfile/)) return 6
    if (path.match(/docs\/|documentation\//)) return 5
    return 3
  }
}