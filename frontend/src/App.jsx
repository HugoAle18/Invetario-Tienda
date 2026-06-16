import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--glass-strong-bg)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            duration: 4000,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
