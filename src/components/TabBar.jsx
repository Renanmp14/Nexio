import { useBrowser } from '../context/BrowserContext'
import { Icons } from '../icons/CustomIcons'

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, addTab, closeTab, currentTheme, activeIcons } = useBrowser()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: currentTheme.bgSecondary,
      borderBottom: `1px solid ${currentTheme.border}`,
      padding: '6px 8px 0',
      gap: '4px',
      WebkitAppRegion: 'drag',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '8px 8px 0 0',
              background: activeTab === tab.id ? currentTheme.tabActive : currentTheme.tabInactive,
              color: activeTab === tab.id ? currentTheme.text : currentTheme.textMuted,
              cursor: 'pointer',
              minWidth: '140px',
              maxWidth: '200px',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s',
              borderTop: activeTab === tab.id ? `2px solid ${currentTheme.accent}` : '2px solid transparent',
              WebkitAppRegion: 'no-drag'
            }}
          >
            {tab.isLoading && (
              <div style={{
                width: '10px', height: '10px',
                border: `2px solid ${currentTheme.accent}`,
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0
              }} />
            )}
            <span style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {tab.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              style={{
                background: 'none',
                border: 'none',
                color: currentTheme.textMuted,
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
                width: '18px',
                height: '18px',
                WebkitAppRegion: 'no-drag'
              }}
            >
              <div style={{ width: '14px', height: '14px' }}>
                {Icons[activeIcons.closeTab]}
              </div>
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addTab}
        title="Nova aba"
        style={{
          background: 'none',
          border: 'none',
          color: currentTheme.textMuted,
          cursor: 'pointer',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '6px',
          width: '32px',
          height: '32px',
          flexShrink: 0,
          WebkitAppRegion: 'no-drag',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = currentTheme.accent}
        onMouseLeave={e => e.currentTarget.style.color = currentTheme.textMuted}
      >
        {Icons[activeIcons.newTab]}
      </button>
    </div>
  )
}