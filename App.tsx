import React, { useState, useEffect } from 'react';
import TextInput from './components/TextInput.tsx';
import PromptCard from './components/PromptCard.tsx';
import Button from './components/Button.tsx';
import { generateComicPrompts, generateComicImage } from './services/geminiService.ts';
import { PromptSet, ProcessingStatus } from './types.ts';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  const [manuscript, setManuscript] = useState('');
  const [panelCount, setPanelCount] = useState<number>(6);
  const [prompts, setPrompts] = useState<PromptSet[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Track which card is currently generating an image
  const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success after closing dialog to mitigate race condition
      setHasApiKey(true);
    }
  };

  const handleApiError = (err: any) => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Requested entity was not found") || message.includes("404")) {
      setHasApiKey(false);
      alert("API Key not found or invalid. Please select a valid API Key to continue.");
    } else {
      setError(message);
    }
  };

  const handleGenerate = async () => {
    if (!manuscript.trim()) return;

    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    setPrompts([]);

    try {
      const result = await generateComicPrompts(manuscript, panelCount);
      setPrompts(result);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err) {
      handleApiError(err);
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleUpdatePrompt = (index: number, newFullPrompt: string) => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index] = { ...updatedPrompts[index], fullPrompt: newFullPrompt };
    setPrompts(updatedPrompts);
  };

  const handleGenerateImage = async (index: number) => {
    const promptData = prompts[index];
    if (!promptData.fullPrompt) return;

    setGeneratingImages(prev => ({ ...prev, [index]: true }));

    try {
      const base64Image = await generateComicImage(promptData.fullPrompt);
      const updatedPrompts = [...prompts];
      updatedPrompts[index] = { ...updatedPrompts[index], generatedImage: base64Image };
      setPrompts(updatedPrompts);
    } catch (err) {
      console.error("Image generation failed:", err);
      handleApiError(err);
      // If it wasn't a key error, keep the specific image error alert
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("Requested entity was not found")) {
         alert("Failed to generate image. Please check the prompt.");
      }
    } finally {
      setGeneratingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-comic font-bold text-slate-800 mb-2">
            API Key Required
          </h1>
          <p className="text-slate-600 mb-6">
            To use <strong>Nano Banana Pro (Gemini 3 Pro)</strong> for high-quality comic generation, please select a valid API Key.
          </p>
          <Button onClick={handleSelectKey} className="w-full">
            Select API Key
          </Button>
          <div className="mt-4 text-xs text-slate-400">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">
              Billing Information
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900 pb-20">
      {/* Navbar / Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             {/* Logo Icon */}
            <div className="w-8 h-8 bg-indigo-600 rounded-full border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-xl font-comic font-black tracking-tight text-slate-800">
              ToonPrompt <span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <div className="text-sm font-bold text-slate-500 hidden sm:block">
            Gemini 3 Pro Powered
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Input */}
          <section className="h-auto lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 flex flex-col">
            <TextInput 
              value={manuscript} 
              onChange={setManuscript} 
              count={panelCount}
              onCountChange={setPanelCount}
              onSubmit={handleGenerate}
              isLoading={status === ProcessingStatus.PROCESSING}
            />
            
            {/* Context/Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-sm text-yellow-800">
              <h3 className="font-bold mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                How it works
              </h3>
              <p className="mb-2">
                1. Paste your raw manuscript or story.
              </p>
              <p className="mb-2">
                2. Adjust the length (number of sets) and click Generate.
              </p>
              <p>
                3. Review and <strong>Edit</strong> the prompts, then click <strong>Generate Image</strong> to create comics with Nano Banana Pro.
              </p>
            </div>
          </section>

          {/* Right Column: Output */}
          <section className="flex flex-col space-y-6">
            <h2 className="text-2xl font-comic font-bold text-slate-800 flex items-center">
              Generated Prompts
              {status === ProcessingStatus.SUCCESS && (
                <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">
                  {prompts.length} Sets Ready
                </span>
              )}
            </h2>

            {status === ProcessingStatus.IDLE && (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 min-h-[400px]">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">Input your manuscript to generate prompts.</p>
              </div>
            )}

            {status === ProcessingStatus.PROCESSING && (
              <div className="flex-grow flex flex-col items-center justify-center p-12 min-h-[400px]">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-slate-700">Analyzing Manuscript...</h3>
                <p className="text-slate-500 mt-2">Crafting storyboard and visual descriptions.</p>
              </div>
            )}

            {status === ProcessingStatus.ERROR && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-bold mb-2">Generation Failed</p>
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {status === ProcessingStatus.SUCCESS && (
              <div className="grid gap-6 animate-fade-in-up">
                {prompts.map((prompt, index) => (
                  <PromptCard 
                    key={index} 
                    data={prompt}
                    onUpdatePrompt={(newText) => handleUpdatePrompt(index, newText)}
                    onGenerateImage={() => handleGenerateImage(index)}
                    isGeneratingImage={!!generatingImages[index]}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default App;