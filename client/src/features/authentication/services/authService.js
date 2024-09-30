export const login = async (username, password) => {
    try {
        const response = await fetch('https://api.nettleship.net/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // Include credentials (cookies)
        });

        if (response.ok) {
            window.location.href = '/';
        } else {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
};
