
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  referral: string;
  status: 'pending' | 'approved';
  role: 'user' | 'admin';
  mentors?: string[]; // Array of emails authorized to view this user
}

interface AppContextType {
  isAdmin: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  
  // Mentor related
  mentees: UserProfile[]; // Students who shared access with current user
  viewingStudent: UserProfile | null; // Currently selected student to view
  setViewingStudent: (student: UserProfile | null) => void;
  isReadOnly: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [mentees, setMentees] = useState<UserProfile[]>([]);
  const [viewingStudent, setViewingStudent] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
        });

        // Listen for students who have shared their data with this user's email
        const menteesQuery = query(
          collection(db, "users"),
          where("mentors", "array-contains", user.email?.toLowerCase())
        );

        const unsubscribeMentees = onSnapshot(menteesQuery, (snapshot) => {
          const menteesData = snapshot.docs.map(doc => doc.data() as UserProfile);
          setMentees(menteesData);
          setLoading(false);
        }, (err) => {
          console.error("Mentees fetch error:", err);
          setLoading(false);
        });

        return () => {
          unsubscribeProfile();
          unsubscribeMentees();
        };
      } else {
        setUserProfile(null);
        setMentees([]);
        setViewingStudent(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      isAdmin: userProfile?.role === 'admin', 
      currentUser, 
      userProfile, 
      loading,
      logout,
      mentees,
      viewingStudent,
      setViewingStudent,
      isReadOnly: !!viewingStudent // If we are viewing a student, it's read-only
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
