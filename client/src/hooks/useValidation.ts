import { useState } from 'react';
import { validationSchemas, Validator } from '../validations/validationSchemas';

const useValidation = () => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    // validateField function takes a fieldName, value
    const validateField = (
        fieldName: keyof typeof validationSchemas,
        value: string,
        compareValue?: string
    ) => {
        // get the error messages for the field
        const errorMessages: string[] = [];

        // iterate over the validators for the field
        validationSchemas[fieldName].forEach((validator: Validator) => {
            const errorMessage = validator(value, compareValue);
            if (errorMessage) errorMessages.push(errorMessage);
        });
        // return the first error message, if any
        return errorMessages.length ? errorMessages[0] : null;
    };

    return {
        errors,
        validateField,
        setErrors,
    };
};

export default useValidation;
