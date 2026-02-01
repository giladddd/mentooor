
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Briefcase, DollarSign, User, Menu, X, 
  LayoutDashboard, Shield, Map, LogOut, Users, 
  Share2, Mail, Send, CheckCircle2, UserCircle, Eye,
  Loader2, Archive, HelpCircle, BookOpen, Smartphone, PlusSquare, Sparkles, Pencil, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatWidget } from './ui/ChatWidget';
import { PWAInstallPrompt } from './ui/PWAInstallPrompt';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [mentorEmail, setMentorEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
  
  // Name editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const navigate = useNavigate();
  const { isAdmin, userProfile, logout, mentees, viewingStudent, setViewingStudent, isReadOnly } = useApp();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !mentorEmail.trim()) return;

    setShareLoading(true);
    try {
      const userRef = doc(db, "users", userProfile.uid);
      await updateDoc(userRef, {
        mentors: arrayUnion(mentorEmail.toLowerCase().trim())
      });
      setShareSuccess(true);
      setMentorEmail('');
      setTimeout(() => {
        setShareSuccess(false);
        setIsShareModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Sharing error:", err);
      alert("שגיאה בשיתוף. נסה שוב מאוחר יותר.");
    } finally {
      setShareLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!userProfile || !newName.trim() || newName === userProfile.fullName) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    try {
      const userRef = doc(db, "users", userProfile.uid);
      await updateDoc(userRef, {
        fullName: newName.trim()
      });
      setIsEditingName(false);
    } catch (err) {
      console.error("Update name error:", err);
      alert("שגיאה בעדכון השם.");
    } finally {
      setIsUpdatingName(false);
    }
  };

  const startEditingName = () => {
    if (isReadOnly) return;
    setNewName(userProfile?.fullName || '');
    setIsEditingName(true);
  };

  const triggerPwaPrompt = () => {
    window.dispatchEvent(new CustomEvent('show-pwa-prompt'));
    setIsSidebarOpen(false);
  };

  const AppLogoIcon = ({ size = 20 }: { size?: number }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute top-0 w-1/2 h-1/2 bg-blue-500/50 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-600/50 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-600/50 rounded-full"></div>
        <Sparkles size={size * 0.6} className="relative z-10 text-white" />
    </div>
  );

  const navItems = [
    { path: '/', label: 'מנטור עצמי', icon: <AppLogoIcon size={20} /> },
    { path: '/occupational', label: 'תעסוקתי', icon: <Briefcase size={20} /> },
    { path: '/financial', label: 'כלכלי', icon: <DollarSign size={20} /> },
    { path: '/personal', label: 'אישי', icon: <User size={20} /> },
    { path: '/strategy', label: 'מפת דרכים', icon: <Map size={20} /> },
    { path: '/archive', label: 'ארכיון משימות', icon: <Archive size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-800 font-sans bg-slate-50/50" dir="rtl">
      {/* Read-Only Mentor Banner */}
      {isReadOnly && viewingStudent && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Eye size={16} />
            <span>מצב צפייה בלבד: אתה צופה בנתונים של {viewingStudent.fullName}</span>
          </div>
          <button 
            onClick={() => setViewingStudent(null)}
            className="bg-white/20 hover:bg-white/40 px-3 py-1 rounded-lg text-xs font-bold transition-all"
          >
            חזור לחשבון שלי
          </button>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl"><Share2 size={20} /></div>
                <h3 className="text-xl font-bold">שיתוף</h3>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-8">
              {shareSuccess ? (
                <div className="text-center py-4 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="font-bold text-slate-800">הגישה שותפה בהצלחה!</p>
                </div>
              ) : (
                <form onSubmit={handleShare} className="space-y-6">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    הזן את כתובת האימייל של המנטור שלך. הוא יוכל לצפות בנתונים שלך (לקריאה בלבד).
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">אימייל המנטור</label>
                    <div className="relative">
                      <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        value={mentorEmail}
                        onChange={(e) => setMentorEmail(e.target.value)}
                        placeholder="mentor@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={shareLoading}
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {shareLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    <span className="text-lg">אשר שיתוף גישה</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 z-30 w-72 bg-[#0f172a] text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isReadOnly ? 'pt-10' : ''}`}
      >
        <div className="p-6 pb-2">
            <button 
              onClick={triggerPwaPrompt}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white p-4 rounded-2xl shadow-xl transition-all flex items-center gap-4 group border border-white/10"
            >
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                 <Smartphone size={20} strokeWidth={2.5} />
               </div>
               <div className="text-right">
                  <h2 className="text-sm font-bold tracking-tight text-white leading-tight">התקן אפליקציה</h2>
                  <p className="text-[10px] text-blue-100/70 font-medium">למסך הבית</p>
               </div>
            </button>
        </div>

        <div className="px-6 mb-6 mt-4 flex gap-2">
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-xs group"
          >
            <Share2 size={16} className="group-hover:scale-110 transition-transform" />
            שיתוף
          </button>
          <button 
            onClick={() => { navigate('/guide'); setIsSidebarOpen(false); }}
            className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-xs group"
          >
            <BookOpen size={16} className="group-hover:scale-110 transition-transform" />
            מדריך
          </button>
        </div>

        <nav className="px-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pr-2 text-right">ניווט</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-600/10 text-white shadow-inner font-medium'
                    : 'hover:bg-slate-800/50 hover:text-white text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 rounded-l-full"></div>}
                  <span className={`transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>{item.icon}</span>
                  <span className="flex-1 text-right">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-3 pr-2 text-right">ניהול מערכת</div>
              <NavLink
                to="/admin/users"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                    isActive ? 'bg-amber-600/10 text-amber-400' : 'hover:bg-slate-800/50 text-slate-400'
                  }`
                }
              >
                <span className="text-amber-500"><Users size={20} /></span>
                <span className="flex-1 text-right">ניהול משתמשים</span>
              </NavLink>
            </>
          )}

          {mentees.length > 0 && (
            <>
              <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-3 pr-2 text-right">תלמידים שלי (צפייה)</div>
              {mentees.map((student) => (
                <button
                  key={student.uid}
                  onClick={() => {
                    setViewingStudent(student);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                    viewingStudent?.uid === student.uid ? 'bg-emerald-600/10 text-emerald-400' : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <UserCircle size={18} className={viewingStudent?.uid === student.uid ? 'text-emerald-500' : 'text-slate-500'} />
                  <span className="flex-1 text-right text-xs font-bold truncate">{student.fullName}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 mt-auto space-y-3">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className={`p-2 rounded-full shrink-0 ${isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {isAdmin ? <Shield size={16} /> : <User size={16} />}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden group/name text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <div className="text-xs font-bold text-white truncate max-w-[100px]">{userProfile?.fullName || 'משתמש'}</div>
                            {!isReadOnly && (
                                <button onClick={startEditingName} className="opacity-0 group-hover/name:opacity-100 transition-opacity">
                                    <Pencil size={10} className="text-slate-500" />
                                </button>
                            )}
                        </div>
                        <div className="text-[10px] text-slate-500">{isAdmin ? 'מנהל מערכת' : 'משתמש מאושר'}</div>
                    </div>
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors bg-slate-900/50 rounded-lg shrink-0"
                  title="התנתק"
                >
                  <LogOut size={16} />
                </button>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 overflow-y-auto w-full text-right relative flex flex-col ${isReadOnly ? 'pt-12' : ''}`} dir="rtl">
        {/* Global Top Header */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm">
            <div className="flex-1 text-right">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">שלום גלעד</h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 shadow-inner">
                    <Check size={10} className="text-emerald-500" /> סנכרון: {lastSync}
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Menu size={24} />
                </button>
            </div>
        </div>

        <div className={`relative z-10 transition-all duration-300 flex-1 p-4 md:p-8 md:px-12 max-w-7xl mx-auto w-full`}>
             <Outlet />
        </div>
      </main>
      
      {!isReadOnly && <ChatWidget />}
      {!isReadOnly && <PWAInstallPrompt />}
    </div>
  );
};
