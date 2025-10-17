import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { get } from 'mongoose';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// Use a dedicated key for Zustand-persist storage
const PERSIST_KEY = 'zwb_volunteer_store';

const volunteerStore = (set,get) => ({
    volunteer: null,
    loading: false,
    stats: null,

    setVolunteer: (volunteer) => set({ volunteer }),
    setLoading: (loading) => set({ loading }),

    // Auth: Volunteer login/register
    login: async (email, password) => {
        const resp = await axios.post('/volunteer/login', { email, password }, { withCredentials: true });
        // Backend wraps payload in ApiResponse { data: { volunteer, accessToken, refreshToken }, ... }
        const volunteer = resp.data?.data?.volunteer;
        const user = resp.data?.data?.user;
        console.log("Login response data:", resp.data);
        console.log("Volunteer data:", volunteer);
        if (volunteer) set({ volunteer });
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
        return volunteer;
    },

    register: async ({ name, email, phone, password, coordinates, availability, vehicleType, serviceRadius }) => {
        const resp = await axios.post('/volunteer/register', {
            name,
            email,
            password,
            phone,
            coordinates,
            availability,
            vehicleType,
            serviceRadius,
        }, { withCredentials: true });
        const volunteer = resp.data?.data;
        set({ volunteer });
        return volunteer;
    },

    // Token refresh using common users endpoint
    refresh: async () => {
        await axios.post('/users/refresh-token', {}, { withCredentials: true });
    },

    // Hydrate persisted volunteer and renew tokens silently
    hydrate: async () => {
        try {
            await new Promise((r) => setTimeout(r, 0));
            const current = getPersistedVolunteer();
            if (current) {
                await axios.post('/users/refresh-token', {}, { withCredentials: true });
            }
            return true;
        } catch {
            set({ volunteer: null });
            return false;
        }
    },

    // Logout and clear volunteer state
    logout: async () => {
        try {
            await axios.post('/users/logout', {}, { withCredentials: true });
        } catch {
            // ignore network errors on logout
        } finally {
            set({ volunteer: null });
        }
    },
    getDonations: async () => {
        const resp = await axios.get('/donation/view/all', { withCredentials: true });
        return resp.data?.data;
    },

    claimDonation: async (donationId) => {
        const resp = await axios.patch('/donation/claim', { donationId }, { withCredentials: true });
        return resp.data?.data;
    },

    updateDonationStatus: async (donationId, status) => {
        const resp = await axios.patch('/donation/update', { donationId, status }, { withCredentials: true });
        return resp.data?.data;
    },

    getAssignedDonations: async () => {
        const resp = await axios.get(`/donation/view/claimed`, { withCredentials: true });
        return resp.data?.data;
    },

    donationStats: async () => {
      const resp = await get().getAssignedDonations();
      const availableResp = await get().getDonations();

      let stats = resp.reduce(
        (acc, donation) => {
          if (donation.status === "picked") {
            acc.totalAssigned += 1;
            acc.picked += 1;
          } else if (donation.status === "claimed") {
            acc.totalAssigned += 1;
            acc.pending += 1;
          } else if (donation.status === "expired") {
            acc.totalAssigned += 1;
            acc.expired += 1;
          }
          return acc;
        },
        { totalAssigned: 0, expired: 0, pending: 0, picked: 0 }
      );

      stats = { ...stats, available:availableResp.length }

      set({ stats });
      return stats;
    }


});

// Helper to read persisted volunteer from localStorage (persist middleware format)
function getPersistedVolunteer() {
    try {
        const raw = localStorage.getItem('zwb_volunteer_store');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.volunteer || null;
    } catch {
        return null;
    }
}

const useVolunteerStore = create(
    persist(volunteerStore, {
        name: PERSIST_KEY,
        partialize: (state) => ({ volunteer: state.volunteer })
    })
);

export default useVolunteerStore;
