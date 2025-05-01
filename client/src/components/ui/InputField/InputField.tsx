import { useEffect, useState } from 'react';
import useValidation from '../../../hooks/useValidation';
import { validationSchemas } from '../../../validations/validationSchemas';
import './InputField.scss';

interface InputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: keyof typeof validationSchemas;
  validate?: Boolean;
  compareValue?: string;
  className?: string;
}

const InputField = ({ value, onChange, name, validate, compareValue, className }: InputFieldProps) => {
  const [label, setLabel] = useState<string>(name);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { errors, validateField, setErrors } = useValidation();
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Validate the field when it changes if validate is true
    if (validate) {
      const error = validateField(name, e.target.value, compareValue);
      
      // Update the error state
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error ?? '',
      }));
    }
    // Call the parent onChange handler to update the form state
    onChange(e);
  };

  useEffect(() => {
    if (validate && compareValue) {
      const error = validateField(name, value, compareValue);
      
      // Update the error state
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error ?? '',
      }));
    }
  }, [compareValue]);

  // Update the label when the error changes
  useEffect(() => {
      setLabel(errors[name] || name);
  }, [errors, name]);

  const isPasswordField = name === 'password' || name === 'confirmPassword' || name === 'newPassword';

  return (
      <div className={`input-field ${className}`}>
        <input
          style={isPasswordField ? { paddingRight: '40px' } : {}}
          type={isPasswordField ? (isPasswordVisible ? 'text' : 'password') : 'text'}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder=" "
        />
        <label>{label}</label>
        {isPasswordField && (
          <button type="button" onClick={togglePasswordVisibility}>
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
  );
};

export default InputField;
