import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Video, 
  FileText, 
  Settings, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Key,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Types
interface TranscriptionResult {
  text: string;
  summary?: string;
  duration?: string;
  title?: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  urls: string[];
  result: TranscriptionResult;
  model: string;
  prompt: string;
}

interface AIModel {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const AI_MODELS: AIModel[] = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    icon: <Sparkles className="w-4 h-4" />, 
    description: 'Powerful multimodal AI for accurate transcription and summary.' 
  },
  { 
    id: 'openai', 
    name: 'OpenAI GPT-4', 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Industry standard for text processing (Coming Soon).' 
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic Claude', 
    icon: <BrainCircuit className="w-4 h-4" />, 
    description: 'Nuanced and safe language model (Coming Soon).' 
  }
];

const DEFAULT_PROMPT = "Summarize the following data in 250 words. Process it in a way that it looks like class notes needs to be submitted based on it.";

export default function App() {
  const [vimeoUrls, setVimeoUrls] = useState<string[]>(['']);
  const [summarizePrompt, setSummarizePrompt] = useState(DEFAULT_PROMPT);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load API keys and history from local storage
  useEffect(() => {
    const savedKeys = localStorage.getItem('vimeo-scribe-keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }

    const savedHistory = localStorage.getItem('vimeo-scribe-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (newItem: HistoryItem) => {
    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('vimeo-scribe-history', JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setVimeoUrls(item.urls);
    setSummarizePrompt(item.prompt);
    setSelectedModel(item.model);
    setResult(item.result);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('vimeo-scribe-history');
  };

  const saveApiKeys = (keys: typeof apiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('vimeo-scribe-keys', JSON.stringify(keys));
    setShowSettings(false);
  };

  const addUrlField = () => {
    setVimeoUrls([...vimeoUrls, '']);
  };

  const removeUrlField = (index: number) => {
    if (vimeoUrls.length > 1) {
      const newUrls = [...vimeoUrls];
      newUrls.splice(index, 1);
      setVimeoUrls(newUrls);
    }
  };

  const updateUrlField = (index: number, value: string) => {
    const newUrls = [...vimeoUrls];
    newUrls[index] = value;
    setVimeoUrls(newUrls);
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = vimeoUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
      
      // Call the multiple summary endpoint
      const response = await axios.post(`${backendUrl}/vimeo-scribe/v1/summarize/multiple`, {
        videoIds: validUrls,
        summarizePrompt: summarizePrompt,
        model: selectedModel,
        apiKey: apiKeys[selectedModel as keyof typeof apiKeys]
      });

      setResult(response.data);
      
      // Save to history
      saveToHistory({
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        urls: validUrls,
        result: response.data,
        model: selectedModel,
        prompt: summarizePrompt
      });
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.response?.data?.message || 'Failed to process videos. Please check the URLs and your API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-[#E4E3E0] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] flex items-center justify-center rounded-sm">
            <Video className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif italic text-2xl leading-none">vimeo-scribe</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono mt-1">Multi-Video Transcription & Summary</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-transparent hover:text-[#141414] border border-[#141414] transition-all"
          >
            <Key className="w-3 h-3" />
            BYOK Configuration
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-12">
          {/* BYOK Status Section */}
          <section className="p-6 border border-[#141414] bg-white/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-widest font-mono font-bold">BYOK Status</h3>
              <div className={cn(
                "w-2 h-2 rounded-full",
                apiKeys.gemini ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              )} />
            </div>
            <p className="text-xs opacity-60 leading-relaxed">
              {apiKeys.gemini 
                ? "Your Gemini API key is configured and ready for use." 
                : "No API key detected. Please configure your key in the BYOK section to enable processing."}
            </p>
            {!apiKeys.gemini && (
              <button 
                onClick={() => setShowSettings(true)}
                className="text-[10px] uppercase tracking-widest font-bold underline hover:no-underline"
              >
                Configure Now
              </button>
            )}
          </section>

          <form onSubmit={handleProcess} className="space-y-8">
            {/* Video URLs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-widest opacity-50 font-mono block">Vimeo Video URLs</label>
                <button 
                  type="button"
                  onClick={addUrlField}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add URL
                </button>
              </div>
              
              <div className="space-y-3">
                {vimeoUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={url}
                        onChange={(e) => updateUrlField(index, e.target.value)}
                        placeholder="https://vimeo.com/123456789"
                        className="w-full bg-transparent border-b border-[#141414] py-3 pr-10 focus:outline-none focus:border-b-2 transition-all font-mono text-sm placeholder:opacity-30"
                      />
                      <Video className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 w-4 h-4" />
                    </div>
                    {vimeoUrls.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeUrlField(index)}
                        className="p-2 opacity-30 hover:opacity-100 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest opacity-50 font-mono block">AI Intelligence</label>
              <div className="relative">
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-transparent border-b border-[#141414] py-3 focus:outline-none focus:border-b-2 transition-all font-mono text-sm appearance-none cursor-pointer"
                >
                  {AI_MODELS.map(model => (
                    <option key={model.id} value={model.id} disabled={model.id !== 'gemini'}>
                      {model.name} {model.id !== 'gemini' ? '(Soon)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 opacity-30 w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest opacity-50 font-mono block">Summarization Prompt</label>
              <textarea 
                value={summarizePrompt}
                onChange={(e) => setSummarizePrompt(e.target.value)}
                rows={4}
                className="w-full bg-white/20 border border-[#141414] p-4 focus:outline-none focus:bg-white/40 transition-all font-sans text-sm resize-none"
                placeholder="Enter custom instructions for the AI..."
              />
              <div className="flex items-center gap-2 opacity-40">
                <Info className="w-3 h-3" />
                <span className="text-[9px] uppercase tracking-tighter font-mono">Custom prompts allow you to shape the output format.</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || vimeoUrls.every(u => !u.trim())}
              className={cn(
                "w-full py-6 flex items-center justify-center gap-3 transition-all font-serif italic text-xl border border-[#141414]",
                isLoading ? "bg-transparent cursor-not-allowed" : "bg-[#141414] text-[#E4E3E0] hover:bg-transparent hover:text-[#141414]"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <span>Generate Multi-Scribe</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* History Section */}
          <section className="space-y-6 pt-12 border-t border-[#141414]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 opacity-50" />
                <h3 className="text-[11px] uppercase tracking-widest font-mono font-bold">Recent Scribes</h3>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-[9px] uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-red-600 transition-all font-mono"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="w-full text-left p-4 border border-[#141414]/10 bg-white/20 hover:bg-white/50 hover:border-[#141414] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-serif italic text-sm group-hover:underline truncate pr-4">
                        {item.result.title || 'Batch Transcription'}
                      </span>
                      <span className="text-[9px] font-mono opacity-40 whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40 text-[9px] font-mono uppercase tracking-tighter">
                      <Video className="w-2 h-2" />
                      <span>{item.urls.length} Video{item.urls.length !== 1 ? 's' : ''}</span>
                      <span className="mx-1">•</span>
                      <span>{item.model}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 border border-dashed border-[#141414]/10 text-center opacity-30">
                  <p className="text-[10px] uppercase tracking-widest font-mono">No history available</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 border border-red-500/50 bg-red-500/5 text-red-700 flex items-start gap-4 mb-8"
              >
                <AlertCircle className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold uppercase text-xs tracking-widest mb-1">Error Encountered</h3>
                  <p className="font-mono text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {result ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                {/* Summary Card */}
                <div className="border border-[#141414] p-8 bg-white shadow-[12px_12px_0px_rgba(20,20,20,0.05)]">
                  <div className="flex justify-between items-start mb-8 border-b border-[#141414]/10 pb-6">
                    <div>
                      <h2 className="font-serif italic text-4xl mb-3">{result.title || 'Collective Summary'}</h2>
                      <div className="flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-widest opacity-50">
                        <span>Videos Processed: {vimeoUrls.filter(u => u.trim()).length}</span>
                        <span>AI Engine: {AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result.summary || '')}
                      className="p-3 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors border border-[#141414]"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none font-sans leading-relaxed text-xl whitespace-pre-wrap">
                    {result.summary || 'No summary generated.'}
                  </div>
                </div>

                {/* Transcription Card */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[#141414] pb-2">
                    <h3 className="font-serif italic text-xl">Combined Transcription</h3>
                    <button 
                      onClick={() => copyToClipboard(result.text)}
                      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      Copy Full Text
                    </button>
                  </div>
                  <div className="font-mono text-sm leading-loose p-8 bg-[#141414] text-[#E4E3E0] max-h-[600px] overflow-y-auto selection:bg-[#E4E3E0] selection:text-[#141414]">
                    {result.text}
                  </div>
                </div>
              </motion.div>
            ) : !isLoading && !error && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 opacity-10 border-2 border-dashed border-[#141414] p-12">
                <FileText className="w-24 h-24" />
                <div className="space-y-2">
                  <p className="font-serif italic text-3xl">Awaiting Input</p>
                  <p className="font-mono text-xs uppercase tracking-widest">Results will be displayed here after processing</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal (BYOK) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-[#141414]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#E4E3E0] border border-[#141414] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6" />
                  <h2 className="font-serif italic text-3xl">BYOK Config</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="opacity-50 hover:opacity-100 p-2">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-8">
                <p className="text-xs font-mono opacity-60 leading-relaxed uppercase tracking-tight">
                  Enter your personal API keys to enable direct communication with AI providers. These keys are never stored on our servers.
                </p>

                {AI_MODELS.map(model => (
                  <div key={model.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {model.icon}
                        <label className="text-[11px] uppercase tracking-widest font-bold font-mono">{model.name}</label>
                      </div>
                      {apiKeys[model.id as keyof typeof apiKeys] && (
                        <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Configured</span>
                      )}
                    </div>
                    <input 
                      type="password"
                      value={apiKeys[model.id as keyof typeof apiKeys]}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [model.id]: e.target.value }))}
                      placeholder={`Paste ${model.name} API Key`}
                      className="w-full bg-white/50 border border-[#141414] p-4 font-mono text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#141414] transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 space-y-4">
                <button 
                  onClick={() => saveApiKeys(apiKeys)}
                  className="w-full bg-[#141414] text-[#E4E3E0] py-5 font-serif italic text-xl hover:bg-transparent hover:text-[#141414] border border-[#141414] transition-all"
                >
                  Apply Configuration
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 font-mono text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
                >
                  Cancel and Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#141414] p-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 font-mono text-[10px] uppercase tracking-[0.3em]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#141414] rounded-full" />
          <span>vimeo-scribe v2.0.0</span>
        </div>
        <div className="flex gap-12">
          <a href="#" className="hover:underline">Docs</a>
          <a href="#" className="hover:underline">Security</a>
          <a href="#" className="hover:underline">Source</a>
        </div>
      </footer>
    </div>
  );
}
