
import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare, MoreVertical, Smartphone } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Listen for custom event to show prompt manually (e.g. from a settings menu)
    const handleShowPrompt = () => {
      setIsVisible(true);
    };
    window.addEventListener('show-pwa-prompt', handleShowPrompt);

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      return () => window.removeEventListener('show-pwa-prompt', handleShowPrompt);
    }

    // Check if user has dismissed it before in the last 14 days for production
    const lastPrompt = localStorage.getItem('pwa_prompt_dismissed');
    if (lastPrompt) {
      const lastPromptDate = new Date(parseInt(lastPrompt));
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      if (lastPromptDate > fourteenDaysAgo) {
        return () => window.removeEventListener('show-pwa-prompt', handleShowPrompt);
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Show after 5 seconds to let the user settle in
    const timer = setTimeout(() => setIsVisible(true), 5000);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('show-pwa-prompt', handleShowPrompt);
    };
  }, []);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[200] animate-fade-in" dir="rtl">
      <div className="bg-[#1e293b] text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
              <Download size={24} className="text-white" />
            </div>
            <button onClick={dismiss} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <h3 className="text-2xl font-black mb-3 leading-tight">מנטור עצמי בנייד שלך</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            הפוך את האתר לאפליקציה אמיתית שזמינה תמיד במסך הבית, ללא צורך בדפדפן.
          </p>

          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-5">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">מדריך התקנה מהיר</p>
            
            {isIOS ? (
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl shrink-0"><Share size={18} /></div>
                <p className="text-sm text-slate-300">
                  לחץ על כפתור <span className="font-bold text-white text-base">השיתוף</span> (מלבן עם חץ) בתחתית, וגלול מטה ל- <span className="font-bold text-white text-base">"הוספה למסך הבית"</span>.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-2.5 rounded-xl shrink-0"><MoreVertical size={18} /></div>
                <p className="text-sm text-slate-300">
                  לחץ על <span className="font-bold text-white text-base">שלוש הנקודות</span> למעלה (או למטה), ובחר באפשרות <span className="font-bold text-white text-base">"התקן אפליקציה"</span>.
                </p>
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl shrink-0 text-emerald-400"><PlusSquare size={18} /></div>
              <p className="text-sm text-slate-300">זהו! האייקון ימתין לך בשולחן העבודה של הנייד.</p>
            </div>
          </div>

          <button 
            onClick={dismiss}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black transition-all shadow-2xl shadow-blue-600/20 active:scale-95"
          >
            הבנתי, תודה!
          </button>
        </div>
      </div>
    </div>
  );
};
