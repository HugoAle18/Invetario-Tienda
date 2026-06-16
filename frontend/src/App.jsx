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
            className: 'dark:bg-bg-card dark:text-text-primary',
            duration: 4000,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
