import React, { useRef } from 'react';
import Button from './Button';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  count: number;
  onCountChange: (count: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ 
  value, 
  onChange, 
  count,
  onCountChange,
  onSubmit, 
  isLoading 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onChange(text);
      };
      reader.readAsText(file);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= 20) {
      onCountChange(val);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-comic font-bold text-slate-800">
          Manuscript Input
        </h2>
        <div>
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-2"
          >
            Upload .txt
          </button>
        </div>
      </div>

      <div className="flex-grow relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your story, article, or manuscript here..."
          className="w-full h-full min-h-[300px] p-4 text-base bg-white border-2 border-black rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]"
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none bg-white/80 p-1 rounded">
          {value.length} characters
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <label htmlFor="panelCount" className="text-sm font-bold text-slate-700 whitespace-nowrap">
            Length (Sets):
          </label>
          <input
            id="panelCount"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={handleCountChange}
            className="w-16 p-1 text-center font-bold border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <Button 
          onClick={onSubmit} 
          disabled={value.trim().length === 0} 
          isLoading={isLoading}
          className="w-full sm:flex-grow"
        >
          Generate Webtoon Prompts
        </Button>
      </div>
    </div>
  );
};

export default TextInput;