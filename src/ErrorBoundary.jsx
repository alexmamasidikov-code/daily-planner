import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Planner ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 space-y-4" style={{ background: '#0C0C0C', minHeight: '100vh', color: '#fff' }}>
          <h2 className="text-lg font-bold text-red-400">Ошибка загрузки</h2>
          <pre className="text-sm text-[#9CA3AF] overflow-auto p-4 rounded-lg bg-[#1B1B1B]">
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-lg bg-[#7B61FF] text-white"
          >
            Повторить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
