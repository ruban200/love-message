
import React, { useState, useEffect, useCallback } from 'react';
import FloatingHearts from './components/FloatingHearts';
import TeddyBear from './components/TeddyBear';
import { ProposalData, GeneratedContent, AspectRatio, ImageSize } from './types';
import { generateLoveContent, generateRomanticImage } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'customize' | 'generating' | 'proposal' | 'success'>('welcome');
  const [data, setData] = useState<ProposalData>({
    senderName: 'ruban',
    receiverName: '',
    specialMemory: '',
    vibe: 'Romantic'
  });
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageConfig, setImageConfig] = useState({
    ratio: AspectRatio.RATIO_1_1,
    size: ImageSize.SIZE_1K
  });
  const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});

  const isApology = data.vibe === 'Sincere Apology';

  const handleStart = () => setStep('customize');

  const handleGenerate = async () => {
    setStep('generating');
    try {
      const loveData = await generateLoveContent(data.senderName, data.receiverName, data.specialMemory, data.vibe);
      setContent({ ...loveData });
      setStep('proposal');
    } catch (error) {
      console.error(error);
      alert("Failed to generate your message. Please try again.");
      setStep('customize');
    }
  };

  const handleImageGen = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio?.openSelectKey();
    }

    setIsGeneratingImage(true);
    const prompt = isApology 
      ? `A sweet scene with two teddy bears making up, ${data.specialMemory || 'one holding a sorry sign'}`
      : `A sweet romantic scene with two teddy bears, ${data.specialMemory || 'holding hands under a starry sky'}`;
      
    const url = await generateRomanticImage(prompt, imageConfig.ratio, imageConfig.size);
    if (url && content) {
      setContent({ ...content, imageUrl: url });
    } else if (!url) {
      alert("Image generation failed. Please ensure you have selected a valid API key from a project with billing enabled.");
    }
    setIsGeneratingImage(false);
  };

  const handleNoHover = () => {
    const randomX = Math.random() * 200 - 100;
    const randomY = Math.random() * 200 - 100;
    setNoButtonStyle({
      transform: `translate(${randomX}px, ${randomY}px)`,
      transition: 'all 0.2s ease'
    });
  };

  const handleYes = () => setStep('success');

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-[#fff5f7] overflow-hidden">
      <FloatingHearts />
      
      <div className="z-10 w-full max-w-2xl bg-white/60 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/40 transition-all duration-700">
        
        {step === 'welcome' && (
          <div className="text-center animate-fadeIn">
            <TeddyBear mood="happy" className="mb-6" />
            <h1 className="text-5xl font-cursive text-[#ff4d6d] mb-4">Teddy Love Messages</h1>
            <p className="text-gray-600 mb-8 text-lg">Send a proposal or a sincere apology with the help of AI magic.</p>
            <button 
              onClick={handleStart}
              className="bg-[#ff4d6d] hover:bg-[#ff758f] text-white px-8 py-3 rounded-full font-bold text-xl shadow-lg transition-all transform hover:scale-105"
            >
              Get Started 🧸
            </button>
          </div>
        )}

        {step === 'customize' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-cursive text-[#ff4d6d] text-center">Tell us more</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-500 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={data.senderName}
                  onChange={e => setData({...data, senderName: e.target.value})}
                  placeholder="e.g. Romeo"
                  className="p-3 rounded-xl border-2 border-pink-100 focus:border-[#ff4d6d] outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-500 mb-1">Their Name</label>
                <input 
                  type="text" 
                  value={data.receiverName}
                  onChange={e => setData({...data, receiverName: e.target.value})}
                  placeholder="e.g. Juliet"
                  className="p-3 rounded-xl border-2 border-pink-100 focus:border-[#ff4d6d] outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-500 mb-1">{isApology ? 'What happened? (Optional)' : 'A Special Memory or Theme'}</label>
              <textarea 
                value={data.specialMemory}
                onChange={e => setData({...data, specialMemory: e.target.value})}
                placeholder={isApology ? "e.g. I forgot our anniversary, I was grumpy..." : "e.g. Our first date at the beach, or 'Starry Night'"}
                className="p-3 rounded-xl border-2 border-pink-100 focus:border-[#ff4d6d] outline-none h-24 resize-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-500 mb-1">Message Type / Vibe</label>
              <select 
                value={data.vibe}
                onChange={e => setData({...data, vibe: e.target.value})}
                className="p-3 rounded-xl border-2 border-pink-100 focus:border-[#ff4d6d] outline-none"
              >
                <option>Romantic</option>
                <option>Cute & Playful</option>
                <option>Poetic</option>
                <option>Deeply Emotional</option>
                <option>Sincere Apology</option>
              </select>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={!data.senderName || !data.receiverName}
              className="w-full bg-[#ff4d6d] disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-all"
            >
              {isApology ? 'Prepare Apology 🙏' : 'Prepare Magic ✨'}
            </button>
          </div>
        )}

        {step === 'generating' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#ff4d6d] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 font-cursive">Teddy is writing the perfect words for you...</p>
          </div>
        )}

        {step === 'proposal' && content && (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <TeddyBear mood={isApology ? "shy" : "happy"} className="h-24 mx-auto" />
              <h2 className="text-4xl font-cursive text-[#ff4d6d] mt-2">For {data.receiverName}...</h2>
            </div>
            
            <div className="bg-white/80 p-6 rounded-2xl shadow-inner mb-6 max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap text-gray-700 italic text-lg leading-relaxed">
                {content.letter}
              </p>
              <p className="mt-4 text-center font-bold text-[#ff4d6d] text-xl font-cursive">
                {content.poem}
              </p>
            </div>

            <div className="mb-6 border-t pt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-600">Generate a {isApology ? 'Sweet' : 'Romantic'} Poster?</h3>
                <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold uppercase">Pro Feature</span>
              </div>
              <p className="text-xs text-gray-400 mb-4 italic">Note: Requires selecting a paid API key.</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400">Ratio</label>
                  <select 
                    className="w-full text-sm border rounded p-1"
                    value={imageConfig.ratio}
                    onChange={e => setImageConfig({...imageConfig, ratio: e.target.value as AspectRatio})}
                  >
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400">Quality</label>
                  <select 
                    className="w-full text-sm border rounded p-1"
                    value={imageConfig.size}
                    onChange={e => setImageConfig({...imageConfig, size: e.target.value as ImageSize})}
                  >
                    {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleImageGen}
                disabled={isGeneratingImage}
                className="w-full border-2 border-[#ff4d6d] text-[#ff4d6d] hover:bg-[#ff4d6d] hover:text-white transition-all py-2 rounded-xl font-bold text-sm uppercase tracking-widest"
              >
                {isGeneratingImage ? 'Drawing with Pro AI...' : 'Generate Pro Image 🎨'}
              </button>
              {content.imageUrl && (
                <div className="mt-4 flex justify-center">
                  <img src={content.imageUrl} alt="Message Graphic" className="max-h-64 rounded-xl shadow-md border-4 border-white" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 border-t pt-6">
              <h3 className="text-2xl font-cursive text-gray-800">
                {isApology ? 'Will you forgive me?' : 'Will you married me?'}
              </h3>
              <div className="flex gap-8 relative w-full justify-center">
                <button 
                  onClick={handleYes}
                  className="bg-green-500 hover:bg-green-600 text-white px-10 py-3 rounded-full font-bold text-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
                >
                  Yes! ❤️
                </button>
                <button 
                  onMouseEnter={handleNoHover}
                  onClick={handleNoHover}
                  style={noButtonStyle}
                  className="bg-gray-400 text-white px-10 py-3 rounded-full font-bold text-2xl shadow-md cursor-not-allowed whitespace-nowrap"
                >
                  No 😢
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8 animate-bounceIn">
            <TeddyBear mood="love" className="mb-6 scale-125" />
            <h1 className="text-6xl font-cursive text-[#ff4d6d] mb-4">
              {isApology ? 'Forgiven! ❤️' : 'She/He Said YES!'}
            </h1>
            <p className="text-2xl text-gray-600 font-cursive mb-8">
              {isApology ? "Thank you for giving me another chance." : "This is the start of our forever story..."}
            </p>
            <div className="flex justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-3xl animate-pulse">❤️</span>
              ))}
            </div>
            <button 
              onClick={() => {
                setData(prev => ({ ...prev, receiverName: '', specialMemory: '', vibe: 'Romantic' }));
                setStep('welcome');
              }}
              className="text-[#ff4d6d] underline font-bold"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      <footer className="mt-12 text-gray-400 text-xs text-center z-10">
        Developed by Ruban • Created with love & AI for a lifetime of happiness.
      </footer>
    </div>
  );
};

export default App;
