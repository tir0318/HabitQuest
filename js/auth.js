// ====================================
// HabitQuest - Authentication Module
// ====================================

const Auth = {
    currentUser: null,

    // Initialize Auth
    init() {
        // Monitor auth state
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in
                this.currentUser = user;
                console.log('User signed in:', user.email);

                // Initialize storage syncing for this user
                Storage.initSync(user.uid);

                // Update UI for logged in state
                this.updateAuthUI(true);
            } else {
                // User is signed out
                this.currentUser = null;
                console.log('User signed out');

                // Update UI for logged out state
                this.updateAuthUI(false);
            }
        });

        this.renderLoginButton();
    },

    // Sign in with Google
    login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                App.showToast(`ようこそ、${result.user.displayName}さん！`, 'success');
            })
            .catch((error) => {
                console.error('Login error:', error);
                App.showToast('ログインに失敗しました', 'error');
            });
    },

    // Sign out
    logout() {
        auth.signOut()
            .then(() => {
                App.showToast('ログアウトしました', 'info');
                // Reload to clear data from memory
                setTimeout(() => window.location.reload(), 1000);
            })
            .catch((error) => {
                console.error('Logout error:', error);
            });
    },

    // Render login/logout button in header
    renderLoginButton() {
        const header = document.querySelector('.header-right');
        if (!header) return;

        const authContainer = document.createElement('div');
        authContainer.className = 'auth-container';
        authContainer.id = 'auth-container';

        // Insert before theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        header.insertBefore(authContainer, themeToggle);
    },

    // Update UI based on auth state
    updateAuthUI(isLoggedIn) {
        const container = document.getElementById('auth-container');
        if (!container) return;

        if (isLoggedIn) {
            const userParams = this.currentUser.photoURL ?
                `<img src="${this.currentUser.photoURL}" class="user-avatar" alt="User">` :
                `<span class="user-initial">${this.currentUser.email[0].toUpperCase()}</span>`;

            container.innerHTML = `
                <div class="auth-user" onclick="Auth.logout()">
                    ${userParams}
                    <span class="auth-tooltip">ログアウト</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <button class="btn btn-small btn-primary" onclick="Auth.login()">
                    Googleでログイン
                </button>
            `;
        }
    }
};
