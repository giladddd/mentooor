
import React, { useState } from 'react';
import { 
  Play, BookOpen, Target, Sparkles, Map, 
  CheckCircle, Zap, MessageSquare, Share2, 
  Award, ArrowLeft, Lightbulb, TrendingUp
} from 'lucide-react';
import { SectionContainer } from '../components/ui/SectionContainer';
import { Link } from 'react-router-dom';

export const Guide: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState(() => localStorage.getItem('guide_video_url') || 'https://www.youtube.com/embed/dQw4w9WgXcQ'); // Placeholder
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [tempUrl, setTempUrl] = useState(videoUrl);

  const saveVideoUrl = () => {
    let embedUrl = tempUrl;
    if (tempUrl.includes('watch?v=')) {
        embedUrl = tempUrl.replace('watch?v=', 'embed/');
    } else if (tempUrl.includes('youtu.be/')) {
        embedUrl = tempUrl.replace('youtu.be/', 'youtube.com/embed/');
    }
    setVideoUrl(embedUrl);
    localStorage.setItem('guide_video_url', embedUrl);
    setIsEditingVideo(false);
  };

  const methodologySteps = [
    {
      icon: <Sparkles className="text-amber-500" />,
      title: "יצירת חזון",
      desc: "הכל מתחיל בראייה רחוקה. בכל תחום (אישי, תעסוקתי, כלכלי) אנחנו מתחילים בהגדרת החזון - לאן אנחנו רוצים להגיע?"
    },
    {
      icon: <Target className="text-blue-500" />,
      title: "מיקוד בפרויקט",
      desc: "בוחרים פרויקט אחד בולט שבו נתמקד עכשיו: מציאת לימודים, בניית קריירה או תוכנית חיסכון. מגדירים למה זה חשוב ומה דרכי הפעולה."
    },
    {
      icon: <Zap className="text-emerald-500" />,
      title: "פירוק למשימות",
      desc: "כל משימה שתסווג ל'טווח קצר' תעבור אוטומטית לרשימת המשימות הפעילה ותופיע בריכוז המשימות בדף הראשי."
    },
    {
      icon: <TrendingUp className="text-indigo-500" />,
      title: "קידום למוקד",
      desc: "בעזרת כפתור ה-(+) נוכל לבחור פרויקטים ספציפיים ולהעביר אותם ל'ריכוז המיקודים' בדף הראשי כדי שלא נפספס אותם."
    }
  ];

  return (
    <div className="pb-24 space-y-10 animate-fade-in text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-5 border-b border-slate-200/60 pb-8">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
            <BookOpen size={32} />
        </div>
        <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-800 tracking-tight">מדריך למנטור העצמי</h1>
            <p className="text-slate-500 text-lg mt-1 font-light">כל הכלים כדי להפוך למנהל המטרות של עצמך.</p>
        </div>
        <Link to="/" className="text-sm font-bold text-slate-400 flex items-center gap-1 hover:text-blue-600 transition-colors">
            חזור <ArrowLeft size={16} className="rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Video Section */}
        <div className="lg:col-span-7 space-y-6">
            <SectionContainer id="guide_video" title="הסבר בוידאו" icon={<Play size={20} className="text-rose-500" />}>
                <div className="p-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                        <iframe 
                            src={videoUrl} 
                            title="מדריך שימוש" 
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-xs text-slate-400">צפו בסרטון כדי להבין את זרימת העבודה באפליקציה.</p>
                        {isEditingVideo ? (
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={tempUrl} 
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="קישור ליוטיוב..."
                                    className="text-xs p-1 border border-slate-200 rounded outline-none w-48"
                                />
                                <button onClick={saveVideoUrl} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">שמור</button>
                                <button onClick={() => setIsEditingVideo(false)} className="text-xs bg-slate-100 px-2 py-1 rounded">ביטול</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditingVideo(true)} className="text-xs text-blue-500 hover:underline">עדכן קישור וידאו</button>
                        )}
                    </div>
                </div>
            </SectionContainer>

            <SectionContainer id="guide_tips" title="טיפים למנטור המתחיל" icon={<Lightbulb size={20} className="text-amber-500" />}>
                <div className="p-6 space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0"><CheckCircle size={18} /></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">ניהול זמן חכם</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">כל משימה יומית או שבועית שאתם יוצרים, כדאי להכניס ישר לקלנדר (לוח השנה) כדי להבטיח ביצוע.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-lg shrink-0"><MessageSquare size={18} /></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">הסוכן האישי שלכם</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">צ'אט ה-AI הוא הסוכן שלכם. הוא מכיר את המטרות שלכם הכי טוב ויעזור לכם בכל שאלה או התלבטות באתר.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg shrink-0"><Share2 size={18} /></div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">שיתוף וייעוץ</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">צריכים עין נוספת? השתמשו בכפתור השיתוף כדי לאפשר ליועץ לצפות בנתונים שלכם (לקריאה בלבד) ולתת הכוונה מקצועית.</p>
                        </div>
                    </div>
                </div>
            </SectionContainer>
        </div>

        {/* Text Guide Section */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="text-blue-600" size={24} />
                    <h2 className="text-2xl font-bold text-slate-800">המתודולוגיה</h2>
                </div>
                
                <p className="text-slate-600 leading-relaxed mb-8">
                    המטרה של <strong>המנטור העצמי</strong> היא שכל אחד יהיה המנטור של עצמו. אנחנו מאמינים שבעזרת סדר, ראייה קדימה ופירוק למשימות קטנות - הכל אפשרי.
                </p>

                <div className="space-y-8 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {methodologySteps.map((step, idx) => (
                        <div key={idx} className="relative pr-10">
                            <div className="absolute right-0 top-0 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:border-blue-500 transition-colors">
                                {step.icon}
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{step.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <Map size={20} className="text-blue-400" />
                        <h4 className="font-bold">מפת דרכים אסטרטגית</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        במפת הדרכים תוכלו ליצור גאנט שמרכז את ה-3 שנים הקרובות ויתן לכם תמונה ויזואלית של החזון המתגשם שלכם.
                    </p>
                </div>

                <div className="mt-6 p-4 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-xs text-slate-400 text-center italic">
                        "כל רעיון או הזדמנות שצצים - הוסיפו אותם ישר לפתקים או לריכוז ההזדמנויות. אל תשאירו שום רעיון בחוץ."
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-lg font-bold text-blue-600 animate-pulse">שיהיה בהצלחה מנטורים!</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
