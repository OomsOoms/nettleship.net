import axiosInstance from "../../../utils/axios-instance";

export const login = async (username, password) => {
    try {
        const response = await axiosInstance.post('/api/auth/login', {
            username,
            password
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        console.log(response.status);
        if (response.status === 200) {
            window.location.href = '/';
        } else {
            return response.data;
        }
    } catch (error) {
        console.error('There was a problem with the axios operation:', error);
        if (error.response) {
            return error.response.data;
        } else {
            throw error;
        }
    }
};