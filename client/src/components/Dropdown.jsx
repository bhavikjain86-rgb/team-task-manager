import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ label, options, onSelect, icon: Icon, className = "", variant = "dark" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseStyles = variant === "dark" 
    ? "bg-[#4A1E0D] text-white hover:bg-[#5A2E1D]" 
    : "bg-white text-app hover:bg-slate-50 border border-black/5";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all text-sm font-medium ${baseStyles} ${className}`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-2xl border border-black/5 z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-app hover:bg-slate-50 transition-colors font-medium"
            >
              {opt.label || opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
