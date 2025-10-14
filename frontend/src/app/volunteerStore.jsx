import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

// Use a dedicated key for Zustand-persist storage
const PERSIST_KEY = 'zwb_user_store';

const volunteerStore = (set, get) => ({
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
        console.log("Response from getAssignedDonations:", resp.data);
        return resp.data?.data;
    }
});

const useVolunteerStore = create(
  persist(volunteerStore, {
    name: PERSIST_KEY,
  })
);

export default useVolunteerStore;
