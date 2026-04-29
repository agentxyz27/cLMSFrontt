/**
 * errorBoundary.tsx
 *
 * Catches JavaScript errors anywhere in the component tree.
 * Shows a friendly error screen instead of a blank page.
 *
 * Usage:
 *   Wrap any part of the app in <ErrorBoundary>
 *   In main.tsx it wraps the entire app.
 *
 * Note: Error boundaries must be class components — React limitation.
 * Hooks cannot be used here.
 */

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  // Called when a child component throws an error
  // Returns new state to trigger the error UI
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.message}</p>
          <button onClick={() => window.location.href = '/'}>
            Go Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}