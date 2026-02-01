
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { UserCheck, UserX, Clock, ShieldCheck, Mail, Phone, Loader2, Search, Building2, UserCircle, Filter, CheckCircle } from 'lucide-react';
import { Table } from '../components/ui/Table';
import { SectionContainer } from '../components/ui/SectionContainer';

interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  referral: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // מאזין בזמן אמת אך ורק למשתמשים שהם pending
    const q = query(
      collection(db, "users"), 
      where("status", "==", "pending")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
      
      const sorted = usersData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setUsers(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const approveUser = async (id: string) => {
    if (processingId) return; // מניעת לחיצות כפולות
    
    setProcessingId(id);
    try {
      // עדכון מסמך המשתמש הספציפי ב-Firestore
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { 
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
      // ברגע שהסטטוס משתנה ל-approved, הוא ייצא אוטומטית מהרשימה בגלל ה-onSnapshot
    } catch (err) {
      console.error(err);
      alert("שגיאה באישור המשתמש. ודא שיש לך הרשאות מנהל.");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectUser = async (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק בקשה זו? המשתמש לא יוכל להתחבר.")) {
      setProcessingId(id);
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) {
        console.error(err);
        alert("שגיאה במחיקת המשתמש.");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.referral?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in text-right pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <ShieldCheck size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">ניהול משתמשים</h1>
                <p className="text-slate-500 text-lg mt-1 font-light">אישור בקשות המתנה (אתה מחובר כמנהל)</p>
            </div>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock size={24} className={users.length > 0 ? "animate-pulse" : ""} />
            </div>
            <div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">בקשות פתוחות</div>
                <div className="text-3xl font-black text-slate-800">{users.length}</div>
            </div>
        </div>
      </div>

      <SectionContainer 
        id="admin_users_list" 
        title="רשימת המתנה" 
        icon={<UserCircle size={20} className="text-blue-500" />}
        headerAction={
            <div className="relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="חיפוש..." 
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 w-48 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        }
      >
        {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-400 font-bold">טוען רשימה...</p>
            </div>
        ) : (
            <div className="p-2">
                <Table<UserProfile> 
                    data={filteredUsers} 
                    columns={[
                        { 
                            header: 'שם ופרטים', 
                            accessor: (row) => (
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">{row.fullName}</span>
                                    <span className="text-[10px] text-slate-400">{row.email}</span>
                                </div>
                            ) 
                        },
                        { 
                            header: 'טלפון', 
                            accessor: (row) => <span className="text-xs font-mono">{row.phone}</span>
                        },
                        { 
                            header: 'שיוך', 
                            accessor: (row) => <span className="bg-slate-100 px-2 py-1 rounded text-[11px] font-bold text-slate-600">{row.referral}</span>
                        },
                        { 
                            header: <div className="text-center">פעולות</div>, 
                            accessor: (row) => (
                                <div className="flex items-center justify-center gap-2">
                                    <button 
                                        disabled={processingId !== null}
                                        onClick={() => approveUser(row.id)}
                                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold disabled:opacity-50"
                                    >
                                        {processingId === row.id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                        אשר
                                    </button>
                                    <button 
                                        disabled={processingId !== null}
                                        onClick={() => rejectUser(row.id)}
                                        className="bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white p-2 rounded-xl transition-all"
                                    >
                                        <UserX size={16} />
                                    </button>
                                </div>
                            ), 
                            width: '180px' 
                        }
                    ]} 
                />
                
                {filteredUsers.length === 0 && !loading && (
                    <div className="py-20 text-center">
                        <CheckCircle size={48} className="mx-auto text-emerald-100 mb-4" />
                        <p className="text-slate-400 font-bold">אין בקשות הממתינות לאישור</p>
                    </div>
                )}
            </div>
        )}
      </SectionContainer>
    </div>
  );
};
