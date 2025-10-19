import React, { useCallback, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { IconSearch, IconUserCheck, IconUserX } from '@tabler/icons-react';
import useNgoStore from '../../app/ngoStore';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'all', label: 'All' },
];

const VolunteerApproval = () => {
  const getVolunteers = useNgoStore((s) => s.getVolunteers);
  const approveVolunteer = useNgoStore((s) => s.approveVolunteer);
  const [volunteers, setVolunteers] = useState([]);
  const [active, setActive] = useState('pending');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVolunteers();
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  }, [getVolunteers]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Volunteer Approvals | ZeroWasteBite';
    load();
    return () => { document.title = prev; };
  }, [load]);

  const filtered = useMemo(() => {
    let list = volunteers;
    if (active === 'pending') list = list.filter(v => !v.volunteer.isVerified);
    else if (active === 'approved') list = list.filter(v => v.volunteer.isVerified);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(v =>
        (v.user?.name || '').toLowerCase().includes(q) ||
        (v.user?.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [volunteers, active, query]);

  const onApprove = async (id,status) => {
    try {
      await approveVolunteer(id,status);
      toast.success('Volunteer approved');
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Approval failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-sm shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary-content">Volunteer Approvals</h1>
          <div className="relative w-full md:w-80">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-primary-content/20 pl-9 pr-3 py-2 text-sm text-primary-content placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none"
              placeholder="Search by name or email"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex gap-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${active === t.key ? 'bg-secondary text-primary-content border-secondary' : 'bg-white/70 border-white/30 text-primary-content hover:bg-white'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-primary-content/70">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center text-primary-content/70">No volunteers found</div>
            ) : (
              filtered.map((v) => (
                <div key={v.volunteer._id} className="rounded-xl border border-green-600 bg-white/70 backdrop-blur-sm p-5 shadow-2xl">
                  <div className="font-semibold text-secondary">{v.user?.name || '—'}</div>
                  <div className="text-sm text-primary-content/70">{v.user?.email || ''}</div>
                  <div className="text-xs text-primary-content/60 mt-1">Service radius: {v.volunteer.serviceRadius || 0} km</div>
                  <div className="mt-3 flex items-center gap-2">
                    {v.volunteer.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                        <IconUserCheck size={16} /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 text-sm">
                        <IconUserX size={16} /> Pending
                      </span>
                    )}
                  </div>
                  {!v.volunteer.isVerified && (
                    <button onClick={() => onApprove(v.volunteer._id,"true")} className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-secondary text-primary-content font-semibold px-4 py-2 shadow hover:shadow-md transition-shadow">
                      Approve
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerApproval;
