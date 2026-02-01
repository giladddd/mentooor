
import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { LogIn, UserPlus, ShieldAlert, Loader2, Sparkles, Phone, Mail, Lock, User, Info, CheckCircle2, Check } from 'lucide-react';

const ORGANIZATIONS = [
  'סיירת גבעתי',
  'עמותת 504',
  'עמותת דרך ארץ',
  'עמותת 8200',
  'ההזדמנות שלי',
  'אחר'
];

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [referral, setReferral] = useState(ORGANIZATIONS[0]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingMessage(false);

    try {
      if (isLogin) {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const isAdmin = data.role === 'admin';
          const isApproved = data.status === 'approved';

          if (!isAdmin && !isApproved) {
            await signOut(auth);
            setError('החשבון ממתין לאישור מנהל. תוכל להתחבר רק לאחר האישור.');
            setLoading(false);
            return;
          }
        } else {
            setError('לא נמצא פרופיל משתמש במערכת. אנא הירשם מחדש.');
            await signOut(auth);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: email.toLowerCase(),
          fullName,
          phone,
          referral,
          status: 'pending',
          role: 'user',
          createdAt: new Date().toISOString()
        });
        
        await signOut(auth);
        setPendingMessage(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('אימייל או סיסמה שגויים');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('אימייל זה כבר רשום במערכת');
      } else {
        setError('אירעה שגיאה בתהליך. אנא נסה שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -ml-48 -mb-48"></div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8">
            {/* Ikigai-inspired symbol (3 connected circles) */}
            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute top-0 w-16 h-16 bg-blue-500/30 rounded-full border border-blue-400/20 backdrop-blur-sm transform translate-y-1"></div>
              <div className="absolute bottom-2 left-2 w-16 h-16 bg-indigo-600/30 rounded-full border border-indigo-400/20 backdrop-blur-sm transform -translate-x-1"></div>
              <div className="absolute bottom-2 right-2 w-16 h-16 bg-purple-600/30 rounded-full border border-purple-400/20 backdrop-blur-sm transform translate-x-1"></div>
              <div className="relative z-10 p-4 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
                  <Sparkles size={32} className="text-white drop-shadow-glow" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-white tracking-tight">מנטור עצמי</h1>
            <p className="text-slate-400 mt-3 font-medium text-lg leading-relaxed">לוקחים שליטה על החיים</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
            {!pendingMessage && (
                <div className="flex p-2 bg-slate-100/50 m-6 mb-0 rounded-2xl">
                    <button onClick={() => { setIsLogin(true); setError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>התחברות</button>
                    <button onClick={() => { setIsLogin(false); setError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>הרשמה</button>
                </div>
            )}

            <div className="p-8 pt-6">
                {pendingMessage ? (
                    <div className="py-6 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><CheckCircle2 size={40} /></div>
                        <h3 className="text-2xl font-bold text-slate-800">הבקשה נשלחה!</h3>
                        <p className="text-slate-600 mt-4 leading-relaxed font-medium">חשבונך נוצר ונוסף לרשימת ההמתנה. <br /><span className="text-blue-600 font-bold text-lg">המנהל יאשר אותך בהקדם.</span></p>
                        <button onClick={() => { setPendingMessage(false); setIsLogin(true); }} className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg">חזור להתחברות</button>
                    </div>
                ) : (
                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3 animate-shake"><ShieldAlert size={18} className="shrink-0" /><span>{error}</span></div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 mr-1 uppercase">שם מלא</label>
                                    <div className="relative">
                                        <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium" placeholder="ישראל ישראלי" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 mr-1 uppercase">טלפון</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium" placeholder="050-0000000" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 mr-1 uppercase">אימייל</label>
                            <div className="relative">
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium" placeholder="name@company.com" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 mr-1 uppercase">סיסמה</label>
                            <div className="relative">
                                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium" placeholder="••••••••" />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" 
                                        />
                                        {rememberMe && <Check size={12} className="absolute text-white pointer-events-none" strokeWidth={4} />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">זכור אותי</span>
                                </label>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 mr-1 uppercase">שיוך ארגוני</label>
                                <div className="relative">
                                    <Info size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <select value={referral} onChange={(e) => setReferral(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none cursor-pointer">
                                        {ORGANIZATIONS.map(org => <option key={org} value={org}>{org}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-70 group active:scale-95">
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
                            <span className="text-lg">{isLogin ? 'כניסה למערכת' : 'הגשת בקשת הצטרפות'}</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
        <div className="mt-8 text-center text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Life OS - מנטור עצמי</div>
      </div>
    </div>
  );
};
