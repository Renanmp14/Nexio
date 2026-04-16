import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrowser } from '../context/BrowserContext'
import { Icons } from '../icons/CustomIcons'
import { themes } from '../themes/themes'

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme, currentTheme } = useBrowser()
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [catalog, setCatalog] = useState({
    sites: [],
    logins: [],
    cookies: [],
    cache: []
  })
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadCatalog = async () => {
    if (!window.electronAPI?.getBrowserDataCatalog) return

    setIsLoadingCatalog(true)
    try {
      const data = await window.electronAPI.getBrowserDataCatalog()
      setCatalog(data)
    } catch (error) {
      setFeedback('Nao foi possivel carregar os dados salvos.')
    } finally {
      setIsLoadingCatalog(false)
    }
  }

  useEffect(() => {
    if (showDataPanel) {
      loadCatalog()
    }
  }, [showDataPanel])

  const handleDeleteItem = async (category, id) => {
    if (!window.electronAPI?.deleteBrowserDataItem) return

    setIsDeletingItem(true)
    setFeedback('')
    try {
      const result = await window.electronAPI.deleteBrowserDataItem({ category, id })
      if (result?.success && result?.catalog) {
        setCatalog(result.catalog)
        setFeedback('Item excluido com sucesso.')
      } else {
        setFeedback(result?.message || 'Nao foi possivel excluir este item.')
      }
    } catch (error) {
      setFeedback('Falha ao excluir item.')
    } finally {
      setIsDeletingItem(false)
    }
  }

  const handleDeleteGroup = async (category) => {
    if (!window.electronAPI?.deleteBrowserDataGroup) return

    setIsDeletingItem(true)
    setFeedback('')
    try {
      const result = await window.electronAPI.deleteBrowserDataGroup({ category })
      if (result?.success && result?.catalog) {
        setCatalog(result.catalog)
        setFeedback('Grupo excluido com sucesso.')
      } else {
        setFeedback(result?.message || 'Nao foi possivel excluir este grupo.')
      }
    } catch (error) {
      setFeedback('Falha ao excluir grupo.')
    } finally {
      setIsDeletingItem(false)
    }
  }

  const handleDeleteAllGroups = async () => {
    if (!window.electronAPI?.deleteAllBrowserDataGroups) return

    setIsDeletingItem(true)
    setFeedback('')
    try {
      const result = await window.electronAPI.deleteAllBrowserDataGroups()
      if (result?.success && result?.catalog) {
        setCatalog(result.catalog)
        setFeedback('Todos os grupos foram excluidos com sucesso.')
      } else {
        setFeedback('Nao foi possivel excluir todos os grupos.')
      }
    } catch (error) {
      setFeedback('Falha ao excluir todos os grupos.')
    } finally {
      setIsDeletingItem(false)
    }
  }

  const renderItemSubtitle = (category, item) => {
    if (category === 'sites') return `Ultimo acesso: ${new Date(item.lastVisitedAt).toLocaleString('pt-BR')}`
    if (category === 'logins') return `${item.domain}${item.path || ''}`
    if (category === 'cookies') return `${item.domain}${item.path || ''}`
    if (category === 'cache') return item.origin
    return ''
  }

  const renderItemTitle = (category, item) => {
    if (category === 'sites') return item.origin
    if (category === 'logins') return item.name
    if (category === 'cookies') return item.name
    if (category === 'cache') return item.origin
    return item.id
  }

  const renderCategorySection = (title, categoryKey, items) => (
    <div style={{
      background: currentTheme.bg,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '12px',
      padding: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>
          {title} ({items.length})
        </p>
        <button
          onClick={() => handleDeleteGroup(categoryKey)}
          disabled={isDeletingItem || items.length === 0}
          style={{
            background: '#b42318',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: isDeletingItem || items.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '11px',
            opacity: isDeletingItem || items.length === 0 ? 0.6 : 1,
            flexShrink: 0
          }}
        >
          Excluir grupo
        </button>
      </div>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: '12px', color: currentTheme.textMuted }}>
          Nenhum item encontrado.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              background: currentTheme.bgSecondary,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px',
              padding: '8px 10px'
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {renderItemTitle(categoryKey, item)}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: currentTheme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {renderItemSubtitle(categoryKey, item)}
                </p>
              </div>
              <button
                onClick={() => handleDeleteItem(categoryKey, item.id)}
                disabled={isDeletingItem}
                style={{
                  background: '#b42318',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: isDeletingItem ? 'not-allowed' : 'pointer',
                  fontSize: '11px',
                  opacity: isDeletingItem ? 0.7 : 1,
                  flexShrink: 0
                }}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      flex: 1,
      background: currentTheme.bgSecondary,
      color: currentTheme.text,
      overflowY: 'auto',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: currentTheme.hover,
              border: 'none',
              color: currentTheme.text,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              width: '36px',
              height: '36px'
            }}
          >
            {Icons.back}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Configurações</h1>
            <p style={{ margin: 0, color: currentTheme.textMuted, fontSize: '14px' }}>Personalize sua experiência</p>
          </div>
        </div>

        {/* TEMA */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '16px', fontWeight: 600, marginBottom: '16px',
            color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ width: '20px', height: '20px' }}>{Icons.palette}</div>
            Tema
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  background: t.bg,
                  border: `2px solid ${theme === key ? t.accent : t.border}`,
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  transform: theme === key ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[t.bg, t.accent, t.bgTertiary].map((c, i) => (
                    <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: c, border: `1px solid ${t.border}` }} />
                  ))}
                </div>
                <span style={{ color: t.text, fontSize: '13px', fontWeight: theme === key ? 700 : 400 }}>{t.name}</span>
                {theme === key && (
                  <span style={{ fontSize: '10px', color: t.accent, fontWeight: 700 }}>✓ Ativo</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* INTERFACE */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <h2 style={{
              fontSize: '16px', fontWeight: 600, margin: 0,
              color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{ width: '20px', height: '20px' }}>{Icons.settings}</div>
              Customizacao de Interface
            </h2>
            <button
              onClick={() => setShowDataPanel(prev => !prev)}
              style={{
                background: showDataPanel ? currentTheme.accent + '22' : currentTheme.bg,
                border: `1px solid ${showDataPanel ? currentTheme.accent : currentTheme.border}`,
                color: showDataPanel ? currentTheme.accent : currentTheme.text,
                borderRadius: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {showDataPanel ? 'Ocultar dados salvos' : 'Gerenciar dados salvos'}
            </button>
          </div>
          <p style={{ color: currentTheme.textMuted, fontSize: '14px', marginBottom: '20px' }}>
            #Ferramenta Desabilitada - Icon
          </p>

          {showDataPanel && (
            <div style={{
              background: currentTheme.bg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '15px' }}>Dados salvos no perfil do app</h3>
              <p style={{ margin: '0 0 12px', color: currentTheme.textMuted, fontSize: '13px', lineHeight: 1.5 }}>
                Aqui voce pode visualizar e excluir item por item de cada categoria.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button
                  onClick={handleDeleteAllGroups}
                  disabled={isDeletingItem}
                  style={{
                    background: '#7a271a',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: isDeletingItem ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    opacity: isDeletingItem ? 0.7 : 1
                  }}
                >
                  Excluir tudo de todos os grupos
                </button>
              </div>

              {isLoadingCatalog ? (
                <p style={{ margin: 0, color: currentTheme.textMuted, fontSize: '13px' }}>
                  Carregando dados...
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {renderCategorySection('Lista de sites acessados', 'sites', catalog.sites || [])}
                  {renderCategorySection('Logins salvos', 'logins', catalog.logins || [])}
                  {renderCategorySection('Cookie', 'cookies', catalog.cookies || [])}
                  {renderCategorySection('Cache', 'cache', catalog.cache || [])}
                </div>
              )}

              {feedback && (
                <p style={{ margin: '12px 0 0', fontSize: '12px', color: currentTheme.textMuted }}>{feedback}</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}