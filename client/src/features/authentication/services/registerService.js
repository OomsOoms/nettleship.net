import axiosInstance from "../../../utils/axios-instance";

export const register = async (username, email, password, hCaptchaToken) => {
    try {
        const response = await axiosInstance.post('/api/users', {
            username,
            email,
            password,
            hCaptchaToken
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.status === 201) {
            window.location.href = '/';
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('There was a problem with the axios operation:', error);
        if (error.response) {
            return { ok: false, errors: error.response.data.errors };
        } else {
            return { ok: false, errors: [{ path: 'server', msg: 'Server error' }] };
        }
    }
};