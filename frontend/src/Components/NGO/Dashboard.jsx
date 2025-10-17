import React, { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import useNgoStore from '../../app/ngoStore';
import { IconBuildingCommunity, IconShieldCheck, IconShieldX, IconId, IconMapPin } from '@tabler/icons-react';

const NGODashboard = () => {
  const ngo = useNgoStore((s) => s.ngo);

  useEffect(() => {
    const prev = document.title;
    document.title = 'NGO Dashboard | ZeroWasteBite';
    return () => { document.title = prev; };
  }, []);

  const addr = ngo?.address || {};

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

        <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-sm shadow p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-primary-content">Next steps</h2>
            <a href="/ngo/volunteers" className="inline-flex items-center rounded-lg bg-secondary text-primary-content font-semibold px-4 py-2 shadow hover:shadow-md transition-shadow">Manage Volunteer Approvals</a>
          </div>
          <ul className="list-disc list-inside text-primary-content/80 mt-3 space-y-1">
            <li>Complete verification with our team.</li>
            <li>Coordinate with volunteers for efficient pickups.</li>
            <li>Track donations received in future updates.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default NGODashboard;
