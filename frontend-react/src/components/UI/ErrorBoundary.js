import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Quelque chose s'est mal passé</h2>
            <p>Nous rencontrons des difficultés techniques. Veuillez rafraîchir la page.</p>
            <button 
              className="btn-modern"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-redo"></i>
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;