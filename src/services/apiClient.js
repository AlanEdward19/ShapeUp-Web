import { auth } from '../firebase';

/**
 * apiClient é uma função wrapper em volta do fetch nativo.
 * Ela cuida automaticamente de anexar o token JWT do Firebase (se o usuário estiver logado)
 * no cabeçalho Authorization de toda requisição.
 */
export const apiClient = async (endpoint, options = {}) => {
    let token = '';
    
    // Sempre pega um token fresco caso o currentUser exista
    if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // A rota relativa se beneficia do proxy do Vite em ambiente de desenvolvimento
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Request to ${url} failed with status: ${response.status}`);
    }

    // Se a resposta for 204 No Content, apenas não dá erro e não faz parse de JSON
    if (response.status === 204) return null;
    
    try {
        return await response.json();
    } catch (e) {
        // Fallback p/ rotas que não voltam JSON, mas dão sucesso
        return null; 
    }
};
