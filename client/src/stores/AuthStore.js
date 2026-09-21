import { makeAutoObservable, runInAction } from 'mobx';
import httpClient from '../plugins/interceptor';
import Cookies from 'js-cookie';

class AuthStore {
  user = null;
  isAuthenticated = false;
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    
    // Initial check on load
    const token = Cookies.get('token');
    const savedUser = localStorage.getItem('userData');
    if (token && savedUser) {
      this.isAuthenticated = true;
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        this.logout();
      }
    }
  }

  // --- Login Action ---
  async login(credentials) {
    this.loading = true;
    this.error = null;
    try {
      const response = await httpClient.post('login/', credentials);
      const { access, refresh, userData } = response.data;

      // Save tokens and user info
      Cookies.set('token', access, { expires: 1 }); // 1 day expiry matching JWT
      if (refresh) Cookies.set('refreshToken', refresh, { expires: 7 });
      localStorage.setItem('userData', JSON.stringify(userData));

      runInAction(() => {
        this.isAuthenticated = true;
        this.user = userData;
        this.loading = false;
      });
      return true;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data?.detail || err.response?.data || 'Login failed. Please check your credentials.';
        this.loading = false;
      });
      return false;
    }
  }

  // --- Registration Action ---
  async register(registrationData) {
    this.loading = true;
    this.error = null;
    try {
      await httpClient.post('register/', registrationData);
      runInAction(() => {
        this.loading = false;
      });
      return true;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data || 'Registration failed.';
        this.loading = false;
      });
      return false;
    }
  }

  // --- Logout Action ---
  logout() {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    localStorage.removeItem('userData');
    this.user = null;
    this.isAuthenticated = false;
  }
}

export const authStore = new AuthStore();