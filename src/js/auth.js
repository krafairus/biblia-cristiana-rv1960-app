import { Client, Account, ID, Permission, Role } from 'appwrite';

class AuthService {
    constructor() {
        this.client = new Client();
        this.client
            .setEndpoint('https://nyc.cloud.appwrite.io/v1')
            .setProject('69c56807000b2c9bc9fd'); 

        this.account = new Account(this.client);
    }

    async getCurrentUser() {
        try {
            const user = await this.account.get();
            // Inyectar URL de avatar local si existe en prefs
            if (user.prefs && user.prefs.avatarId) {
                user.avatarUrl = this.getAvatarUrl(user.prefs.avatarId);
            }
            return user;
        } catch (error) {
            return null;
        }
    }

    async loginWithEmail(email, password) {
        return await this.account.createEmailPasswordSession(email, password);
    }

    async registerWithEmail(email, password, name) {
        try {
            await this.account.create(ID.unique(), email, password, name);
            return await this.loginWithEmail(email, password);
        } catch (error) {
            console.error("Error en registerWithEmail:", error);
            throw error;
        }
    }

    async logout() {
        await this.account.deleteSession('current');
        localStorage.removeItem('bible_auth_choice');
    }

    async updateAvatarSelection(avatarId) {
        // Guardar solo el ID del avatar (1-10) en las preferencias del usuario
        await this.account.updatePrefs({ avatarId: avatarId.toString() });
        return this.getAvatarUrl(avatarId);
    }

    getAvatarUrl(avatarId) {
        if (!avatarId) return null;
        // Mapear a imágenes locales en la carpeta del proyecto
        return `/src/assets/avatars/avatar_${avatarId}.png`;
    }

    setAuthChoice(choice) {
        localStorage.setItem('bible_auth_choice', choice);
    }

    getAuthChoice() {
        return localStorage.getItem('bible_auth_choice');
    }
}

export const auth = new AuthService();
