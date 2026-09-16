import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updatePassword,
    updateProfile,
    sendPasswordResetEmail,
    confirmPasswordReset,
    reauthenticateWithPopup,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { logoutUser, syncCurrentUserScopes } from '../services/authService';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with its Provider, standard pattern
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileVersion, setProfileVersion] = useState(0);

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
     */
    const signIn = async (email, password, remember = true) => {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        
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
     */
    const signInWithGoogle = async (remember = true) => {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        const credential = await signInWithPopup(auth, googleProvider);

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
            'shapeup_user_id',
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

    const updateProfilePhoto = async (file) => {
        if (!currentUser) throw new Error('auth/no-current-user');
        let photoURL = null;
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) throw new Error('profile/invalid-photo');
            const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
            const imageRef = ref(getStorage(auth.app), `users/${currentUser.uid}/profile/${crypto.randomUUID()}`);
            await uploadBytes(imageRef, file, { contentType: file.type });
            photoURL = await getDownloadURL(imageRef);
        }
        await updateProfile(currentUser, { photoURL });
        setProfileVersion(version => version + 1);
    };

    // --------------- helpers ---------------

    const persistSession = (user, email, role) => {
        localStorage.setItem('shapeup_role', role);
        localStorage.setItem('shapeup_user_email', email);

        localStorage.setItem('shapeup_user_name', user.displayName || email.split('@')[0]);
        const knownUserId = localStorage.getItem('shapeup_user_id');
        if (knownUserId) localStorage.setItem('shapeup_client_id', knownUserId);

    };

    const value = { currentUser, loading, profileVersion, updateProfilePhoto, signIn, signInWithGoogle, register, signOut, updateUserPassword, resetPassword, confirmReset, persistSession };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
