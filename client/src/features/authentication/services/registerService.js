export const register = async (username, email, password, hCaptchaToken) => {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, hCaptchaToken }),
            credentials: 'include' // Include credentials (cookies)
        });

        if (response.ok) {
            return { ok: true, message: 'Registration successful' };
        } else {
            const data = await response.json();
            return { ok: false, errors: data.errors };
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return { ok: false, errors: [{ path: 'server', msg: 'Server error' }] };
    }
};