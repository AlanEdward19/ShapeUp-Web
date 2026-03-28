
export const logoutUser = async (token) => {
    console.log("3. Serviço logoutUser iniciado.");
    try {
        const url = `/api/users/logout`;
        console.log(`4a. Preparando POST para ${url} (via proxy local)`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`4b. Resposta da API de logout recebida. Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            throw new Error(`Logout failed with status: ${response.status}`);
        }

    } catch (error) {
        console.error("4c. Erro no serviço de logout (fetch falhou ou rede inacessível):", error);
        throw error;
    }
};
