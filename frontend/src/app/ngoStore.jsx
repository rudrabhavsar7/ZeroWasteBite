import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const PERSIST_KEY = 'zwb_ngo_store';

const ngoStore = (set) => ({
  ngo: null,
  loading: false,

  setNgo: (ngo) => set({ ngo }),
  setLoading: (loading) => set({ loading }),

  login: async (email, password) => {
    const resp = await axios.post('/ngo/login', { email, password }, { withCredentials: true });
    const ngo = resp.data?.data?.ngo;
    const user = resp.data?.data?.user;
    if (ngo) set({ ngo });
    if (user) {
      try {
        const { default: useUserStore } = await import('./userStore');
        const userState = useUserStore.getState?.();
        if (userState?.setUser) {
          userState.setUser(user);
        } else if (useUserStore.setState) {
          useUserStore.setState({ user });
        }
      } catch (err) {
        console.warn('Unable to set user in userStore:', err);
      }
    }
    return ngo;
  },

  register: async ({ name, email, phone, password, coordinates, organizationName, street, city, state, zip }) => {
    const resp = await axios.post('/ngo/register', {
      name,
      email,
      password,
      phone,
      coordinates,
      organizationName,
      street,
      city,
      state,
      zip,
    }, { withCredentials: true });
    const ngo = resp.data?.data;
    set({ ngo });
    return ngo;
  },

  refresh: async () => {
    await axios.post('/users/refresh-token', {}, { withCredentials: true });
  },

  hydrate: async () => {
    try {
      await new Promise((r) => setTimeout(r, 0));
      const current = getPersistedNgo();
      if (current) {
        await axios.post('/users/refresh-token', {}, { withCredentials: true });
      }
      return true;
    } catch {
      set({ ngo: null });
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post('/users/logout', {}, { withCredentials: true });
    } catch {
      // ignore network errors on logout
    } finally {
      set({ ngo: null });
    }
  },

  // NGO-only: volunteer management
  getVolunteers: async () => {
    const resp = await axios.get('/ngo/list', { withCredentials: true });
    return resp.data?.data || [];
  },
  approveVolunteer: async (volunteerId,status) => {
    const resp = await axios.patch('/ngo/approve', { volunteerId,status }, { withCredentials: true });
    return resp.data?.data;
  },
  // NGO-only: donation overview
  getAllDonations: async () => {
    const resp = await axios.get('/donation/view/all', { withCredentials: true });
    return resp.data?.data || [];
  },

  getVolunteersDonations: async () => {
    const resp = await axios.get("/ngo/donations", { withCredentials: true });
    return resp.data?.data || [];
  },

  // Assignment helpers
  getEligibleVolunteersForDonation: async (donationId) => {
    const resp = await axios.get(`/ngo/eligible-volunteers`, { params: { donationId }, withCredentials: true });
    return resp.data?.data || [];
  },
  getDonationAssignee: async (donationId) => {
    const resp = await axios.get(`/ngo/donation-assignee`, { params: { donationId }, withCredentials: true });
    return resp.data?.data || null;
  },
  assignDonation: async (donationId, volunteerUserId) => {
    const resp = await axios.patch('/ngo/assign', { donationId, volunteerUserId }, { withCredentials: true });
    return resp.data?.data;
  },

  sentenceCase: (str) => {
    if (typeof str !== 'string' || str.length === 0) return str;
    str = str.split('_');
    return str.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
  }
});

function getPersistedNgo() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.ngo || null;
  } catch {
    return null;
  }
}

const useNgoStore = create(
  persist(ngoStore, {
    name: PERSIST_KEY,
    partialize: (state) => ({ ngo: state.ngo })
  })
);

export default useNgoStore;
