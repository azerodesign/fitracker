import { supabase } from './supabaseClient';

export const registerUser = async (username, password) => {
    // We use the email field for username by appending a fake domain, 
    // since Supabase Auth defaults to email/password.
    const email = `${username}@fitracker.local`;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
            },
        },
    });

    if (error) return { success: false, message: error.message };

    // ERROR HANDLING: Check if session is missing (implies email verification is ON)
    if (data.user && !data.session) {
        return {
            success: false,
            message: "Registrasi berhasil, tapi sesi tidak dibuat. Harap matikan 'Confirm email' di Supabase Dashboard -> Authentication -> Providers -> Email."
        };
    }

    return { success: true, user: data.user };
};

export const loginUser = async (username, password) => {
    const email = `${username}@fitracker.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return { success: false, message: error.message };
    return { success: true, user: data.user };
};

export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, message: error.message };
    return { success: true };
}

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin, // Ensure you have this URL in Supabase Redirect URLs
        },
    });

    if (error) return { success: false, message: error.message };
    return { success: true, data };
};
