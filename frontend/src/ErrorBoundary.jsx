import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h3>Something went wrong.</h3>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>
            {String(this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}


