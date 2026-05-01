import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, ChevronRight, AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn, generateId } from '../lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

// Use a CDN worker to avoid Vite bundling issues with the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text.trim();
}

async function parseSyllabusWithAI(text) {
  const prompt = `You are an academic syllabus parser. Extract all units/chapters and their topics from the syllabus text below.

Return ONLY a valid JSON object. No explanation, no markdown, no code fences.
Format: { "Unit I: Title": ["Topic 1", "Topic 2"], "Unit II: Title": ["Topic A"] }

Syllabus:
${text.slice(0, 8000)}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content.trim();
  // Strip possible markdown fences
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(jsonStr);
}

function jsonToUnits(parsed) {
  return Object.entries(parsed).map(([title, topics]) => ({
    id: generateId(),
    title,
    topics: Array.isArray(topics) ? topics.map(t => ({ id: generateId(), title: String(t) })) : [],
  }));
}

const STEP_LABELS = ['Input Syllabus', 'Review & Save'];

export default function SyllabusImporter({ onSubjectCreated }) {
  const [step, setStep] = useState(0);
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'pdf'
  const [syllabusText, setSyllabusText] = useState('');
  const [parsedUnits, setParsedUnits] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [subjectEmoji, setSubjectEmoji] = useState('📚');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const text = await extractTextFromPdf(file);
      setSyllabusText(text);
    } catch (err) {
      setError('Failed to read PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async () => {
    if (!syllabusText.trim()) return setError('Please provide syllabus text first.');
    setLoading(true);
    setError('');
    try {
      const parsed = await parseSyllabusWithAI(syllabusText);
      setParsedUnits(jsonToUnits(parsed));
      setStep(1);
    } catch (err) {
      setError('AI parsing failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!subjectName.trim()) return setError('Please enter a subject name.');
    const newSubject = {
      id: generateId(),
      name: subjectName,
      emoji: subjectEmoji,
      units: parsedUnits
    };
    onSubjectCreated(newSubject);
  };

  return (
    <div className="space-y-8 pb-10 text-text">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-1">AI Syllabus Import</h2>
          <p className="text-text-muted text-sm font-medium">Paste text or upload a PDF to instantly generate your study tracker.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-surface-2 p-1.5 rounded-2xl border border-border shadow-sm">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 px-3">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black',
                step === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-border text-text-muted')}>
                {i + 1}
              </div>
              <span className={cn('text-[10px] font-black uppercase tracking-widest',
                step === i ? 'text-text' : 'text-text-muted')}>
                {label}
              </span>
              {i === 0 && <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-30" />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6">
            
            <div className="flex gap-2 p-1.5 bg-surface-2 rounded-2xl border border-border w-fit shadow-sm">
              <button onClick={() => setInputMode('text')}
                className={cn('px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest',
                  inputMode === 'text' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text')}>
                Direct Text
              </button>
              <button onClick={() => setInputMode('pdf')}
                className={cn('px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest',
                  inputMode === 'pdf' ? 'bg-surface text-primary shadow-sm border border-border' : 'text-text-muted hover:text-text')}>
                PDF Upload
              </button>
            </div>

            <div className="glass-panel-strong p-6 rounded-[2.5rem] border-border shadow-xl">
              {inputMode === 'text' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Paste Syllabus Text</label>
                    <span className="text-[10px] text-text-muted/40 font-medium italic">{syllabusText.length} / 8000 chars</span>
                  </div>
                  <textarea 
                    value={syllabusText} onChange={e => setSyllabusText(e.target.value)}
                    placeholder="e.g. Unit 1: Introduction to Calculus. Topics: Limits, Derivatives, Integrals..."
                    className="w-full h-80 bg-surface-2 border border-border rounded-3xl p-6 text-sm focus:outline-none focus:border-primary/50 transition-all text-text font-medium leading-relaxed resize-none shadow-inner"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-border rounded-3xl bg-surface-2/50 group transition-all hover:bg-surface-2 hover:border-primary/30">
                  <input type="file" ref={fileRef} onChange={handlePdfUpload} accept=".pdf" className="hidden" />
                  <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {loading ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <Upload className="w-10 h-10 text-primary" />}
                  </div>
                  <h4 className="text-lg font-black text-text mb-2">Upload Syllabus PDF</h4>
                  <p className="text-text-muted text-sm mb-6 max-w-xs text-center font-medium">We'll automatically extract and organize the topics for you.</p>
                  <button onClick={() => fileRef.current?.click()} disabled={loading}
                    className="btn-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                    Select File
                  </button>
                </div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-xs flex items-center gap-3 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}

              <div className="mt-8 pt-8 border-t border-border flex justify-end">
                <button 
                  onClick={handleParse} disabled={loading || !syllabusText.trim()}
                  className="btn-primary text-white px-10 py-4.5 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-primary/20 group uppercase tracking-widest text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>AI Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />
                      <span>Generate Tracker</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel-strong p-8 rounded-[2.5rem] border-border shadow-xl">
                  <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.2em] mb-6">Subject Identity</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Emoji Icon</label>
                      <input 
                        type="text" value={subjectEmoji} onChange={e => setSubjectEmoji(e.target.value)}
                        placeholder="📚"
                        className="w-full bg-surface-2 border border-border rounded-2xl px-4 py-4 text-2xl focus:outline-none focus:border-primary/50 text-center shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Subject Name</label>
                      <input 
                        type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)}
                        placeholder="e.g. Advanced Calculus"
                        className="w-full bg-surface-2 border border-border rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:border-primary/50 text-text shadow-inner"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <button onClick={handleSave}
                        className="w-full btn-primary text-white py-4.5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 uppercase tracking-widest text-xs">
                        <CheckCircle2 className="w-5 h-5" /> Save Tracker
                      </button>
                      <button onClick={() => setStep(0)}
                        className="w-full mt-3 text-text-muted hover:text-text text-xs font-black uppercase tracking-widest py-2 transition-colors">
                        Back to Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">Preview & Refine</h3>
                  <p className="text-[10px] text-text-muted/60 font-black uppercase tracking-widest">
                    {parsedUnits.length} Units · {parsedUnits.reduce((a,u) => a+u.topics.length, 0)} Topics
                  </p>
                </div>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
                  {parsedUnits.map((unit, uIdx) => (
                    <motion.div key={unit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: uIdx * 0.05 }}
                      className="bg-surface rounded-3xl border border-border p-6 shadow-sm group">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                          {uIdx + 1}
                        </div>
                        <input 
                          value={unit.title} 
                          onChange={e => setParsedUnits(units => units.map(u => u.id === unit.id ? {...u, title: e.target.value} : u))}
                          className="flex-1 bg-transparent border-none text-text font-black text-sm focus:outline-none focus:ring-0 truncate"
                        />
                        <button onClick={() => setParsedUnits(units => units.filter(u => u.id !== unit.id))}
                          className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 ml-11">
                        {unit.topics.map((topic, tIdx) => (
                          <div key={topic.id} className="flex items-center gap-2 group/topic">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                            <input 
                              value={topic.title} 
                              onChange={e => setParsedUnits(units => units.map(u => u.id === unit.id ? {
                                ...u, topics: u.topics.map(t => t.id === topic.id ? {...t, title: e.target.value} : t)
                              } : u))}
                              className="flex-1 bg-transparent border-none text-text-muted font-medium text-xs focus:outline-none focus:ring-0 py-0.5"
                            />
                            <button onClick={() => setParsedUnits(units => units.map(u => u.id === unit.id ? {
                              ...u, topics: u.topics.filter(t => t.id !== topic.id)
                            } : u))}
                              className="opacity-0 group-hover/topic:opacity-100 p-1 text-text-muted hover:text-red-500 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setParsedUnits(units => units.map(u => u.id === unit.id ? {
                            ...u, topics: [...u.topics, { id: generateId(), title: 'New Topic' }]
                          } : u))}
                          className="flex items-center gap-2 text-primary hover:text-primary/80 font-black text-[10px] uppercase tracking-widest pt-2 focus:outline-none"
                        >
                          <Plus className="w-3 h-3" /> Add Topic
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  <button onClick={() => setParsedUnits([...parsedUnits, { id: generateId(), title: 'New Unit', topics: [] }])}
                    className="w-full py-4 border-2 border-dashed border-border rounded-3xl text-text-muted hover:text-primary hover:bg-primary/5 transition-all font-black text-xs uppercase tracking-widest">
                    Add New Unit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
