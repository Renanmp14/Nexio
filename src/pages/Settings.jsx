import { useNavigate } from 'react-router-dom'
import { useBrowser } from '../context/BrowserContext'
import { Icons } from '../icons/CustomIcons'
import { themes } from '../themes/themes'

const iconOptions = ['back', 'forward', 'reload', 'close', 'minimize', 'maximize', 'newTab', 'closeTab', 'home', 'settings', 'lock', 'palette']

const iconLabels = {
  back: 'Voltar',
  forward: 'Avançar',
  reload: 'Recarregar',
  close: 'Fechar janela',
  minimize: 'Minimizar',
  maximize: 'Expandir',
  newTab: 'Nova aba',
  closeTab: 'Fechar aba',
  home: 'Home',
  settings: 'Configurações',
  lock: 'Cadeado (URL)',
  palette: 'Paleta'
}

export default function Settings() {
  const navigate = useNavigate()
  const { theme, setTheme, currentTheme, activeIcons, updateIcon } = useBrowser()

  const controlKeys = ['back', 'forward', 'reload', 'close', 'minimize', 'maximize', 'newTab', 'closeTab']

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

        {/* ÍCONES */}
        <section>
          <h2 style={{
            fontSize: '16px', fontWeight: 600, marginBottom: '16px',
            color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ width: '20px', height: '20px' }}>{Icons.settings}</div>
            Ícones dos Controles
          </h2>
          <p style={{ color: currentTheme.textMuted, fontSize: '14px', marginBottom: '20px' }}>
            Para cada controle, escolha qual ícone será exibido.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {controlKeys.map(controlKey => (
              <div key={controlKey} style={{
                background: currentTheme.bg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '12px',
                padding: '16px'
              }}>
                <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px' }}>
                  {iconLabels[controlKey]}
                  <span style={{
                    marginLeft: '10px', fontSize: '12px', color: currentTheme.textMuted,
                    fontWeight: 400
                  }}>
                    Atual: {iconLabels[activeIcons[controlKey]]}
                  </span>
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {iconOptions.map(iconKey => (
                    <button
                      key={iconKey}
                      onClick={() => updateIcon(controlKey, iconKey)}
                      title={iconLabels[iconKey]}
                      style={{
                        background: activeIcons[controlKey] === iconKey ? currentTheme.accent + '22' : currentTheme.bgSecondary,
                        border: `2px solid ${activeIcons[controlKey] === iconKey ? currentTheme.accent : currentTheme.border}`,
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: activeIcons[controlKey] === iconKey ? currentTheme.accent : currentTheme.textMuted,
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ width: '22px', height: '22px' }}>{Icons[iconKey]}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}