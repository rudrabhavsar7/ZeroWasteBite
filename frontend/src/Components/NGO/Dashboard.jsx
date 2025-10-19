import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import useNgoStore from '../../app/ngoStore';
import { IconBuildingCommunity, IconShieldCheck, IconShieldX, IconId, IconMapPin } from '@tabler/icons-react';

const NGODashboard = () => {
  const ngo = useNgoStore((s) => s.ngo);
  const getAllDonations = useNgoStore((s) => s.getAllDonations);
  const getVolunteers = useNgoStore((s) => s.getVolunteers);
  const getVolunteersDonations = useNgoStore((s) => s.getVolunteersDonations);

  const [availableCount, setAvailableCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [donationsCount, setDonationsCount] = useState(0);

  useEffect(() => {
    const prev = document.title;
    document.title = 'NGO Dashboard | ZeroWasteBite';
    return () => { document.title = prev; };
  }, []);

  const addr = ngo?.address || {};

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [donations, volunteers] = await Promise.all([
          getAllDonations().catch(() => []),
          getVolunteers().catch(() => []),
        ]);
        const available = donations.filter(d => d.status === 'available').length;

        const receivedDonations = await getVolunteersDonations();

        setAvailableCount(available);
        setVolunteerCount(volunteers.length);
        setDonationsCount(receivedDonations.length);
      } catch {
        // ignore errors; counts will remain 0
      }
    };
    fetchCounts();
  }, [getAllDonations, getVolunteers, getVolunteersDonations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-sm shadow-xl p-6">
          <div className="flex items-center gap-3">
            <IconBuildingCommunity className="text-secondary" size={28} />
            <h1 className="text-2xl font-bold text-primary-content">NGO Dashboard</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">Welcome{ngo?.organizationName ? `, ${ngo.organizationName}` : ''}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow">
            <div className="flex items-center gap-2 text-primary-content font-semibold">
              <IconId className="text-secondary" size={20} />
              <span>Registration</span>
            </div>
            <div className="mt-3 text-primary-content/90">
              <div className="text-sm">Number</div>
              <div className="text-lg font-semibold">{ngo?.registrationNumber || '—'}</div>
            </div>
          </div>

          <div className="rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow">
            <div className="flex items-center gap-2 text-primary-content font-semibold">
              {ngo?.verified ? (
                <IconShieldCheck className="text-green-600" size={20} />
              ) : (
                <IconShieldX className="text-amber-600" size={20} />
              )}
              <span>Verification</span>
            </div>
            <div className="mt-3 text-lg font-semibold text-primary-content/90">
              {ngo?.verified ? 'Verified' : 'Pending'}
            </div>
          </div>

          <div className="rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow">
            <div className="flex items-center gap-2 text-primary-content font-semibold">
              <IconMapPin className="text-secondary" size={20} />
              <span>Address</span>
            </div>
            <div className="mt-3 text-primary-content/90">
              <div className="text-sm">{[addr.street, addr.city, addr.state].filter(Boolean).join(', ')}</div>
              <div className="text-sm">{addr.zip || ''}</div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow">
            <div className="text-sm text-primary-content/70">Total donations received</div>
            <div className="text-3xl font-bold text-primary-content mt-1">{donationsCount}</div>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow">
            <div className="text-sm text-primary-content/70">Available donations</div>
            <div className="text-3xl font-bold text-primary-content mt-1">{availableCount}</div>
          </div>
          <div className="rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow">
            <div className="text-sm text-primary-content/70">Total volunteers</div>
            <div className="text-3xl font-bold text-primary-content mt-1">{volunteerCount}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-sm shadow p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-primary-content">Quick actions</h2>
            <div className="flex items-center gap-2">
              <a href="/ngo/volunteers" className="inline-flex items-center rounded-lg bg-secondary text-primary-content font-semibold px-4 py-2 shadow hover:shadow-md transition-shadow">Manage Volunteer Approvals</a>
              <a href="/ngo/donations" className="inline-flex items-center rounded-lg bg-secondary text-primary-content font-semibold px-4 py-2 shadow hover:shadow-md transition-shadow">Manage Donations</a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NGODashboard;
