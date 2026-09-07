import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { logError } from '../utils/telemetry';
import './ErrorBoundary.css';

const COPY = {
    'pt-BR': {
        title: 'Algo deu errado',
        desc: 'Essa parte da tela travou. O resto do app continua funcionando -- tente recarregar.',
        reload: 'Recarregar',
    },
    en: {
        title: 'Something went wrong',
        desc: 'This part of the screen crashed. The rest of the app is still working -- try reloading.',
        reload: 'Reload',
    },
};

const getCopy = () => {
    const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('shapeup_language')) || 'en';
    return COPY[lang] || COPY.en;
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        logError(this.props.source || 'ErrorBoundary', error, { componentStack: errorInfo?.componentStack });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        const t = getCopy();
        return (
            <div className="su-error-boundary">
                <AlertTriangle size={32} />
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <button onClick={() => window.location.reload()}>{t.reload}</button>
            </div>
        );
    }
}

export default ErrorBoundary;
