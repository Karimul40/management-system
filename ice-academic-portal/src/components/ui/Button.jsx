"use client";
import React from 'react';

const Button = ({
    children, type= "button", onClick, disabled = false, color="indigo",className="", icon: Icon,
}) => {
    const colorStyles = {
        indigo: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25" ,
        blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25",
        emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25",
        amber:"bg-amber-600 hover:bg-amber-700 shadow-amber-600/25",
        
    }
    return (
        <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-md flex items-center justify-center gap-2 transition duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${colorStyles[color]|| colorStyles.indigo} ${className}
         `}
        >
            <span>{children}</span>
            {Icon && <Icon className="h-4 w-4"/>}
        </button>
       
    );
};

export default Button;