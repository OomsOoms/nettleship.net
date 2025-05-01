export type Validator = (value: string, compareValue?: string) => string | null;

export const validationSchemas: Record<string, Validator[]> = {
    username: [
        (value: string) => !value ? 'username is required' : null,
        (value: string) => value.length < 3 ? 'username must be at least 3 characters' : null,
        (value: string) => value.length > 20 ? 'username must be at most 20 characters' : null,
        (value: string) => !/^[a-z0-9_.-]+$/.test(value) ? 'only lowercase letters, numbers, ., _,- allowed' : null
    ],
    email: [
        (value: string) => !value ? 'email is required' : null,
        (value: string) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'invalid email' : null
    ],
    password: [
        (value: string) => !value ? 'password is required' : null,
        (value: string) => value.length < 8 ? 'password must be at least 8 characters long' : null,
        (value: string) => value.length > 128 ? 'password must be less than 128 characters long' : null,
        (value: string) => !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) ? 'password must include an uppercase, lowercase, and number' : null
    ],
    newPassword: [
        (value: string) => !value ? 'password is required' : null,
        (value: string) => value.length < 8 ? 'password must be at least 8 characters long' : null,
        (value: string) => value.length > 128 ? 'password must be less than 128 characters long' : null,
        (value: string) => !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) ? 'password must include an uppercase, lowercase, and number' : null
    ],
    confirmPassword: [
        (value: string) => !value ? 'confirm Password is required' : null,
        (value: string, compareValue?: string) => value !== compareValue ? 'passwords do not match' : null
    ],
    gameCode: [
        (value: string) => !value ? 'game code' : null,
        (value: string) => value.length !== 6 ? 'game code must be 6 characters' : null,
        (value: string) => !/^\d+$/.test(value) ? 'game code must be numeric' : null
    ],
};
