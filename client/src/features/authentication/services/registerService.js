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
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
            return error.response;
        } else {
            console.error('Server error or network issue:', error);
        }
        console.error('There was a problem with the register user axios operation:');
    }
};
