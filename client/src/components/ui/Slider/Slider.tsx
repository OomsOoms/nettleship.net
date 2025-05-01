import React from 'react';
import './Slider.scss';

interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: number[];
    onValueChange: (value: number[]) => void;
    className?: string;
}

const Slider: React.FC<SliderProps> = ({
    min,
    max,
    step,
    value,
    onValueChange,
    className = ''
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);
        onValueChange([newValue]);
    };

    return (
        <div className={`slider-container ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={handleChange}
                className="slider"
            />
        </div>
    );
};

export default Slider;