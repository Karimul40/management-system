"use client";

import React from "react";

const Input = ({ label, type = "text", placeholder, value, onChange, icon: Icon }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">

      {/* Label */}
      {label && (
        <label className="text-xs font-semibold text-slate-700">{label}</label>
      )}

      {/* Input Box with Icon - Taller & more spacious along Y axis */}
      <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3.5 bg-slate-50/60 focus-within:border-[#5243E8] focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100/60 transition duration-150">
        
        {Icon && <Icon className="h-5 w-5 text-slate-400 shrink-0" />}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
        />

      </div>
    </div>
  );
};

export default Input;