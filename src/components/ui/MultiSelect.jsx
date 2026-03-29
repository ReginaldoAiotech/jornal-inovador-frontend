import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function MultiSelect({ label, options, selected, onChange, placeholder = 'Selecionar...' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-left transition-all',
          open ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <div className="flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selected.slice(0, 2).map((v) => (
                <span key={v} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-md max-w-[120px] truncate">
                  {v}
                </span>
              ))}
              {selected.length > 2 && (
                <span className="text-xs text-gray-500 font-medium">+{selected.length - 2}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selected.length > 0 && (
            <span
              role="button"
              onClick={clearAll}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-400" />
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/50 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-400 text-center">Nenhuma opcao</p>
          ) : (
            options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50',
                    isSelected && 'bg-primary-50/50'
                  )}
                >
                  <span className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                  )}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>
                  <span className={cn('truncate', isSelected ? 'text-gray-900 font-medium' : 'text-gray-600')}>
                    {opt.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
