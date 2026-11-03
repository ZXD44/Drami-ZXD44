// Centralized API and WebSocket endpoint configuration

export function getServerUrl(): string {
    // 1. Check environment variable (configured in Vercel or .env)
    const envUrl = import.meta.env.VITE_SERVER_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
        return envUrl.replace(/\/+$/, '');
    }

    // 2. Browser runtime fallback
    if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            return `http://${window.location.hostname}:2567`;
        }
    }

    return 'http://localhost:2567';
}
