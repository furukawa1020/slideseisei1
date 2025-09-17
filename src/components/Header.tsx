
interface HeaderProps {
  language: 'ja' | 'en' | 'zh'
  setLanguage: (lang: 'ja' | 'en' | 'zh') => void
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const texts = {
    ja: {
      title: 'Repo2Talk',
      subtitle: 'GitHubリポジトリからプレゼンテーションを自動生成',
      features: '機能',
      about: 'About',
      docs: 'ドキュメント'
    },
    en: {
      title: 'Repo2Talk',
      subtitle: 'Auto-generate presentations from GitHub repositories',
      features: 'Features',
      about: 'About',
      docs: 'Documentation'
    },
    zh: {
      title: 'Repo2Talk',
      subtitle: '从GitHub仓库自动生成演示文稿',
      features: '功能',
      about: '关于',
      docs: '文档'
    }
  }

  const t = texts[language]

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            {t.title}
          </h1>
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {t.subtitle}
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            {t.features}
          </button>
          
          <button style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            {t.about}
          </button>

          <button style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#374151',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            {t.docs}
          </button>

          {/* Language Selector */}
          <select
            style={{
              padding: '6px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'ja' | 'en' | 'zh')}
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </nav>
      </div>
    </header>
  )
}