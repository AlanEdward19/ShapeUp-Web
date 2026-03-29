import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updatePassword,
    sendPasswordResetEmail,
    confirmPasswordReset,
    reauthenticateWithPopup,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { logoutUser, syncCurrentUserScopes } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Monitor Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    /**
     * Sign in with email + password.
     * After signing in, persists role info in localStorage.
     */
    const signIn = async (email, password, role) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        _persistSession(credential.user, email, role);
        
        // Sync scopes on the backend and force-refresh the Firebase token
        // so the user immediately gets an up-to-date token with the latest claims.
        try {
            await syncCurrentUserScopes();
            await credential.user.getIdToken(/* forceRefresh= */ true);
            console.log("Token atualizado após sincronização de scopes.");
        } catch (err) {
            // Non-fatal: log but don't block the login flow
            console.warn("Falha ao sincronizar scopes após login:", err);
        }
        
        return credential;
    };

    /**
     * Sign in with Google popup.
     * Role defaults to what the user had previously selected (passed as arg).
     */
    const signInWithGoogle = async (role) => {
        const credential = await signInWithPopup(auth, googleProvider);
        const email = credential.user.email || '';
        _persistSession(credential.user, email, role || 'independent');
        
        // Sync scopes on the backend and force-refresh the Firebase token
        try {
            await syncCurrentUserScopes();
            await credential.user.getIdToken(/* forceRefresh= */ true);
            console.log("Token atualizado após sincronização de scopes (Google).");
        } catch (err) {
            console.warn("Falha ao sincronizar scopes após login Google:", err);
        }
        
        return credential;
    };

    /**
     * Create a new account with email + password.
     */
    const register = async (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    /**
     * Sign out and clear session data.
     */
    const signOut = async () => {
        console.log("1. signOut iniciado. currentUser está presente?", !!currentUser);
        if (currentUser) {
            try {
                const token = await currentUser.getIdToken();
                console.log("2. Token recuperado. Enviando para logoutUser()...");
                await logoutUser(token);
                console.log("5. logoutUser() finalizou sem exceptions na promessa.");
            } catch (error) {
                console.error("Erro detectado no bloco do signOut:", error);
            }
        }

        console.log("6. Chamando firebaseSignOut() local...");
        await firebaseSignOut(auth);

        // Remove only user-specific datastore keys
        const userKeys = [
            'shapeup_role',
            'shapeup_user_name',
            'shapeup_user_email',
            'shapeup_client_id',
            'shapeup_clients',
            'shapeup_pro_plans',
            'shapeup_pro_bank',
        ];

        // Find dynamic keys directly related to the user session
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('shapeup_notif_prefs_') || key.startsWith('shapeup_client_card_'))) {
                userKeys.push(key);
            }
        }

        userKeys.forEach(key => localStorage.removeItem(key));
    };

    /**
     * Send a password reset email
     */
    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    /**
     * Confirm a password reset using the OOB code from the email link
     */
    const confirmReset = (code, newPassword) => {
        return confirmPasswordReset(auth, code, newPassword);
    };

    /**
     * Update current user's password with automatic reauthentication if needed
     */
    const updateUserPassword = async (newPassword, currentPassword = null) => {
        if (!currentUser) throw new Error("No user is currently signed in.");

        try {
            await updatePassword(currentUser, newPassword);
        } catch (error) {
            if (error.code === 'auth/requires-recent-login' || error.message.includes('CREDENTIAL_TOO_OLD_LOGIN_AGAIN')) {
                const providerId = currentUser.providerData[0]?.providerId;

                if (providerId === 'google.com') {
                    await reauthenticateWithPopup(currentUser, googleProvider);
                    await updatePassword(currentUser, newPassword);
                } else if (providerId === 'password') {
                    if (!currentPassword) {
                        throw new Error('auth/requires-recent-login-password');
                    }
                    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
                    await reauthenticateWithCredential(currentUser, credential);
                    await updatePassword(currentUser, newPassword);
                } else {
                    throw error;
                }
            } else {
                throw error;
            }
        }
    };

    // --------------- helpers ---------------

    const _persistSession = (user, email, role) => {
        localStorage.setItem('shapeup_role', role);
        localStorage.setItem('shapeup_user_email', email);

        if (role === 'professional') {
            localStorage.setItem('shapeup_user_name', user.displayName || 'Coach');
        } else if (role === 'gym') {
            localStorage.setItem('shapeup_user_name', user.displayName || 'Gym Admin');
        } else if (role === 'independent') {
            localStorage.setItem('shapeup_client_id', 'independent');
            localStorage.setItem('shapeup_user_name', user.displayName || email.split('@')[0]);
        } else {
            // coached client — keep existing client-list logic untouched
            const storedClients = localStorage.getItem('shapeup_clients');
            let matchedId = Date.now();
            let userName = user.displayName || email.split('@')[0];

            if (storedClients) {
                const clients = JSON.parse(storedClients);
                const match = clients.find(c => c.email?.toLowerCase() === email.toLowerCase());
                if (match) {
                    matchedId = match.id;
                    userName = match.name;
                }
            }
            localStorage.setItem('shapeup_client_id', matchedId);
            localStorage.setItem('shapeup_user_name', userName);
        }
    };

    const value = { currentUser, loading, signIn, signInWithGoogle, register, signOut, updateUserPassword, resetPassword, confirmReset };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
