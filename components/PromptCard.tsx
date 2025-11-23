import React, { useState } from 'react';
import { PromptSet } from '../types';
import Button from './Button';

interface PromptCardProps {
  data: PromptSet;
  onUpdatePrompt: (newPrompt: string) => void;
  onGenerateImage: () => void;
  isGeneratingImage: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  data, 
  onUpdatePrompt, 
  onGenerateImage, 
  isGeneratingImage 
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(data.fullPrompt);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Save changes
      onUpdatePrompt(localPrompt);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="bg-white border-2 border-black rounded-xl p-0 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <div className="bg-slate-100 border-b-2 border-black p-4 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {data.setId}
          </span>
          <h3 className="text-lg font-comic font-bold text-slate-800 leading-tight">
            {data.title}
          </h3>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={toggleEdit}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold border-2 border-black rounded-md transition-all 
              ${isEditing
                ? 'bg-indigo-100 text-indigo-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]'
                : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-none'
              }`}
          >
            {isEditing ? 'Save Text' : 'Edit Text'}
          </button>
          <button
            onClick={handleCopy}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold border-2 border-black rounded-md transition-all 
              ${copied 
                ? 'bg-green-400 text-black shadow-none translate-y-[2px]' 
                : 'bg-white hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-[1px] active:shadow-none'
              }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-4 bg-white space-y-4">
        {/* Prompt Text Input/Display */}
        <div className="relative">
          {isEditing ? (
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              className="w-full h-64 p-3 text-sm font-sans border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-60 overflow-y-auto">
              {data.fullPrompt}
            </pre>
          )}
        </div>

        {/* Image Generation Section */}
        <div className="border-t-2 border-dashed border-slate-200 pt-4">
          {!data.generatedImage ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500 italic">
                Ready to visualize? Confirm text above and generate.
              </div>
              <Button 
                variant="secondary" 
                onClick={onGenerateImage} 
                isLoading={isGeneratingImage}
                disabled={isEditing} // Force save before generate
                className="w-full sm:w-auto px-4 py-2 text-sm"
              >
                Generate Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="relative group">
                <img 
                  src={data.generatedImage} 
                  alt={`Generated comic for ${data.title}`}
                  className="w-full rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                />
                 <a 
                  href={data.generatedImage} 
                  download={`toonprompt-${data.setId}.png`}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-2 border-black p-2 rounded-md shadow-sm hover:bg-slate-100"
                  title="Download Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={onGenerateImage} 
                  isLoading={isGeneratingImage}
                  className="text-xs px-3 py-2"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptCard;