import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en MARCEL:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <h3 className="font-bold text-sm tracking-wide">MARCEL AI</h3>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 p-6 h-full min-h-[300px]">
            <AlertTriangle className="text-amber-500" size={32} />
            <p className="text-slate-800 dark:text-slate-200 text-sm text-center font-medium">
              MARCEL tuvo un problema inesperado
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center">
              Esto no afecta el resto del sistema
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ChatErrorBoundary
