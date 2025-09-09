const API_BASE_URL = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:3002/api';

class ApiService {
    constructor() {
        this.currentUser = null;
    }

    async login(email, firstName, lastName) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, firstName, lastName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            this.currentUser = data.user;
            
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userId', data.user.id);
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async updateProgress(messagesDecoded) {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User not logged in');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/progress/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: parseInt(userId), messagesDecoded })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Progress update error:', error);
            throw error;
        }
    }

    async getLeaderboard() {
        try {
            const response = await fetch(`${API_BASE_URL}/leaderboard`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            return await response.json();
        } catch (error) {
            console.error('Leaderboard error:', error);
            throw error;
        }
    }

    isLoggedIn() {
        return localStorage.getItem('userId') !== null;
    }

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
    }
}

const apiService = new ApiService();
export default apiService;