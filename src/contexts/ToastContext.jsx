import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev.slice(-2), { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              background: t.type === 'error' ? '#2D0E0E' : t.type === 'success' ? '#0E2D1F' : '#1B1B1B',
              color: t.type === 'error' ? '#F87171' : t.type === 'success' ? '#34D399' : '#FFFFFF',
              border: t.type === 'error' ? '1px solid rgba(248,113,113,0.3)' : t.type === 'success' ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const noop = () => {}
export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx?.toast ?? noop
}
