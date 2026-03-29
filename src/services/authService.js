import { apiClient } from './apiClient';

export const logoutUser = async (token) => {
    console.log("3. Serviço logoutUser iniciado.");
    try {
        const url = `/api/users/logout`;
        console.log(`4a. Preparando POST para ${url} (via proxy local e com apiClient)`);
        
        // apiClient handle the token automatically, so we don't strictly need to pass it,
        // but since AuthContext still fetches it we can ignore the argument and let apiClient do its thing.
        await apiClient(url, { method: 'POST' });
        
        console.log(`4b. Resposta da API de logout recebida com Sucesso.`);
    } catch (error) {
        console.error("4c. Erro no serviço de logout (fetch falhou ou rede inacessível):", error);
        throw error;
    }
};

/**
 * Syncs the current user's scopes on the backend after login.
 * Called directly (not via hook) because AuthContext is not a React component.
 */
export const syncCurrentUserScopes = async () => {
    console.log("Sincronizando scopes do usuário após login...");
    await apiClient('/api/scopes/sync/me', { method: 'POST' });
    console.log("Scopes sincronizados com sucesso.");
};
