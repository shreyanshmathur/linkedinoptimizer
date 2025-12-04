import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Usage limits for free tier
const FREE_TIER_LIMITS = {
    analyses: 3,
    exports: 3
};

// Demo mode when Firebase is not configured
const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY ||
    import.meta.env.VITE_FIREBASE_API_KEY === 'your_firebase_api_key';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize Firebase only if configured
    useEffect(() => {
        if (DEMO_MODE) {
            console.log('🎮 Running in DEMO MODE - Firebase not configured');
            // Auto-login with demo user
            const demoUser = {
                uid: 'demo-user-123',
                email: 'demo@linkedin-optimizer.com',
                displayName: 'Demo User',
                photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0a66c2&color=fff'
            };
            setUser(demoUser);

            // Load demo userData from localStorage
            const savedData = localStorage.getItem('linkedin_optimizer_demo_data');
            if (savedData) {
                setUserData(JSON.parse(savedData));
            } else {
                setUserData({
                    email: demoUser.email,
                    displayName: demoUser.displayName,
                    subscription: 'free',
                    subscriptionEnd: null,
                    usage: {
                        analysesCount: 0,
                        exportsCount: 0,
                        lastAnalysis: null
                    }
                });
            }
            setLoading(false);
        } else {
            // Firebase mode
            import('../firebase/config').then(async ({ auth, db, ADMIN_EMAIL }) => {
                const { onAuthStateChanged } = await import('firebase/auth');
                const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');

                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    setUser(firebaseUser);
                    if (firebaseUser) {
                        try {
                            const userRef = doc(db, 'users', firebaseUser.uid);
                            const userSnap = await getDoc(userRef);

                            if (userSnap.exists()) {
                                setUserData(userSnap.data());
                            } else {
                                const newUserData = {
                                    email: firebaseUser.email,
                                    displayName: firebaseUser.displayName,
                                    photoURL: firebaseUser.photoURL,
                                    createdAt: serverTimestamp(),
                                    subscription: 'free',
                                    subscriptionEnd: null,
                                    usage: {
                                        analysesCount: 0,
                                        exportsCount: 0,
                                        lastAnalysis: null
                                    }
                                };
                                await setDoc(userRef, newUserData);
                                setUserData(newUserData);
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                        }
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                });

                return () => unsubscribe();
            }).catch(err => {
                console.error('Firebase init error:', err);
                setLoading(false);
            });
        }
    }, []);

    // Save demo data to localStorage
    const saveDemoData = (data) => {
        if (DEMO_MODE) {
            localStorage.setItem('linkedin_optimizer_demo_data', JSON.stringify(data));
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        if (DEMO_MODE) {
            // Demo mode - already logged in
            return user;
        }

        try {
            const { auth, googleProvider } = await import('../firebase/config');
            const { signInWithPopup } = await import('firebase/auth');
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    // Sign out
    const logout = async () => {
        if (DEMO_MODE) {
            // Clear demo data and redirect to login
            localStorage.removeItem('linkedin_optimizer_demo_data');
            setUser(null);
            setUserData(null);
            return;
        }

        try {
            const { auth } = await import('../firebase/config');
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
            setUserData(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    // Check if user is admin
    const isAdmin = () => {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'shreyanshmathur12@gmail.com';
        return user?.email === adminEmail;
    };

    // Check if user can analyze (within limits or has subscription)
    const canAnalyze = () => {
        if (!userData) return false;
        if (userData.subscription !== 'free') return true;
        return userData.usage.analysesCount < FREE_TIER_LIMITS.analyses;
    };

    // Check if user can export (within limits or has subscription)
    const canExport = () => {
        if (!userData) return false;
        if (userData.subscription !== 'free') return true;
        return userData.usage.exportsCount < FREE_TIER_LIMITS.exports;
    };

    // Increment analysis count
    const incrementAnalysisCount = async () => {
        if (!user || !userData) return;

        const newUserData = {
            ...userData,
            usage: {
                ...userData.usage,
                analysesCount: (userData.usage?.analysesCount || 0) + 1,
                lastAnalysis: new Date().toISOString()
            }
        };

        setUserData(newUserData);

        if (DEMO_MODE) {
            saveDemoData(newUserData);
        } else {
            try {
                const { db } = await import('../firebase/config');
                const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    'usage.analysesCount': newUserData.usage.analysesCount,
                    'usage.lastAnalysis': serverTimestamp()
                });
            } catch (error) {
                console.error('Error updating analysis count:', error);
            }
        }
    };

    // Increment export count
    const incrementExportCount = async () => {
        if (!user || !userData) return;

        const newUserData = {
            ...userData,
            usage: {
                ...userData.usage,
                exportsCount: (userData.usage?.exportsCount || 0) + 1
            }
        };

        setUserData(newUserData);

        if (DEMO_MODE) {
            saveDemoData(newUserData);
        } else {
            try {
                const { db } = await import('../firebase/config');
                const { doc, updateDoc } = await import('firebase/firestore');
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    'usage.exportsCount': newUserData.usage.exportsCount
                });
            } catch (error) {
                console.error('Error updating export count:', error);
            }
        }
    };

    // Update subscription
    const updateSubscription = async (plan, endDate = null) => {
        if (!user) return;

        const newUserData = {
            ...userData,
            subscription: plan,
            subscriptionEnd: endDate
        };

        setUserData(newUserData);

        if (DEMO_MODE) {
            saveDemoData(newUserData);
        } else {
            try {
                const { db } = await import('../firebase/config');
                const { doc, updateDoc } = await import('firebase/firestore');
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    subscription: plan,
                    subscriptionEnd: endDate
                });
            } catch (error) {
                console.error('Error updating subscription:', error);
            }
        }
    };

    // Get remaining uses
    const getRemainingUses = () => {
        if (!userData) return { analyses: 0, exports: 0 };
        if (userData.subscription !== 'free') return { analyses: Infinity, exports: Infinity };
        return {
            analyses: Math.max(0, FREE_TIER_LIMITS.analyses - (userData.usage?.analysesCount || 0)),
            exports: Math.max(0, FREE_TIER_LIMITS.exports - (userData.usage?.exportsCount || 0))
        };
    };

    const value = {
        user,
        userData,
        loading,
        signInWithGoogle,
        logout,
        isAdmin,
        canAnalyze,
        canExport,
        incrementAnalysisCount,
        incrementExportCount,
        updateSubscription,
        getRemainingUses,
        FREE_TIER_LIMITS,
        DEMO_MODE
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
