import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// Use a dedicated key for Zustand-persist storage
const PERSIST_KEY = 'zwb_user_store';

const userStore = (set, get) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ user: null }),

  // Call backend login and return user object
  login: async (email, password) => {
    const resp = await axios.post('/users/login', { email, password }, { withCredentials: true });
    return resp.data?.data?.user;
  },

  // Call backend register and return user object
  register: async (name, email, phone, password, coordinates,userType) => {
    const resp = await axios.post(
      "/users/register",
      { name, email, phone, password, coordinates, userType },
      { withCredentials: true }
    );
    console.log(resp.data.data);
    return resp.data?.data;
  },

  // Hit refresh-token endpoint to renew cookies
  refresh: async () => {
    await axios.post('/users/refresh-token', {}, { withCredentials: true });
  },

  // Load user from storage and try to refresh tokens silently
  hydrate: async () => {
    try {
      // Allow a microtask so Zustand persist can rehydrate state
      await new Promise((r) => setTimeout(r, 0));
      const user = get().user;
      if (user) {
        await get().refresh();
      }
      return true;
    } catch {
      set({ user: null });
      return false;
    }
  },

  // Logout server-side and clear local user
  logout: async () => {
    try {
      await axios.post('/users/logout', {}, { withCredentials: true });
    } catch {
      // ignore network errors on logout
    } finally {
      get().clearUser();
    }
  },
});

const useUserStore = create(
  persist(userStore, {
    name: PERSIST_KEY,
    // Persist only the user slice
    partialize: (state) => ({ user: state.user }),
  })
);

export default useUserStore;
