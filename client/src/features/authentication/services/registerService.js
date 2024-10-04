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
        return response;
    } catch (error) {
        return error.response;
    }
};
