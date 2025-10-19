import React, { useCallback, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { IconSearch, IconAlertTriangle, IconClockHour4 } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import useNgoStore from '../../app/ngoStore';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'picked', label: 'Picked' },
  { key: 'expired', label: 'Expired' },
];

const riskColor = (risk) => {
  switch (risk) {
    case 'high': return 'text-red-700';
    case 'medium': return 'text-amber-600';
    case 'low': return 'text-green-700';
    default: return 'text-primary-content/70';
  }
};

const ManageDonations = () => {
  const getAllDonations = useNgoStore((s) => s.getAllDonations);
  const sentenceCase = useNgoStore((s) => s.sentenceCase);
  const getEligibleVolunteersForDonation = useNgoStore((s) => s.getEligibleVolunteersForDonation);
  const getDonationAssignee = useNgoStore((s) => s.getDonationAssignee);
  const assignDonation = useNgoStore((s) => s.assignDonation);
  const [donations, setDonations] = useState([]);
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [eligible, setEligible] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [getAllDonations]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Manage Donations | ZeroWasteBite';
    load();
    return () => { document.title = prev; };
  }, [load]);

  const filtered = useMemo(() => {
    let list = donations;
    if (active !== 'all') list = list.filter(d => d.status === active);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(d =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      );
    }
    // sort by urgency if available: remainingHours ascending
    return list.slice().sort((a, b) => {
      const ra = typeof a.remainingHours === 'number' ? a.remainingHours : 9999;
      const rb = typeof b.remainingHours === 'number' ? b.remainingHours : 9999;
      return ra - rb;
    });
  }, [donations, active, query]);

  const openDonationModal = useCallback(async (donation) => {
    setSelected(donation);
    setEligible([]);
    setAssignee(null);
    setModalOpen(true);
    setModalLoading(true);
    try {
      if (donation.status === 'available' && !donation.claimedBy) {
        const list = await getEligibleVolunteersForDonation(donation._id);
        setEligible(Array.isArray(list) ? list : []);
      } else {
        const info = await getDonationAssignee(donation._id);
        setAssignee(info);
      }
    } catch {
      toast.error('Failed to load details');
    } finally {
      setModalLoading(false);
    }
  }, [getEligibleVolunteersForDonation, getDonationAssignee]);

  const handleAssign = useCallback(async (volUserId) => {
    if (!selected) return;
    try {
      const updated = await assignDonation(selected._id, volUserId);
      toast.success('Donation assigned');
      // Update local list
      setDonations((prev) => prev.map((d) => d._id === updated._id ? updated : d));
      setAssignee(null);
      const info = await getDonationAssignee(selected._id);
      setAssignee(info);
      setEligible([]);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Assignment failed';
      toast.error(msg);
    }
  }, [assignDonation, getDonationAssignee, selected]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelected(null);
    setEligible([]);
    setAssignee(null);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-sm shadow-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-primary-content">Manage Donations</h1>
          <div className="relative w-full md:w-96">
            <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-primary-content/20 pl-9 pr-3 py-2 text-sm text-primary-content placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none"
              placeholder="Search by title or description"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
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
            <div className="col-span-full text-center text-primary-content/70">No donations found</div>
          ) : (
            filtered.map((d) => (
              <button key={d._id} onClick={() => openDonationModal(d)} className="text-left rounded-xl border border-white/30 bg-white/70 backdrop-blur-sm p-5 shadow hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-secondary/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-lg font-semibold text-primary-content">{d.title}</h1>
                    <div className="text-xs text-primary-content/60">{new Date(d.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded bg-white/60 border border-white/30 text-primary-content`}>{sentenceCase(d.status)}</span>
                </div>
                {d.description && (
                  <div className="text-sm text-primary-content/80 mt-2 line-clamp-3">{d.description}</div>
                )}
                <div className="mt-3 text-sm flex items-center gap-2 text-primary-content/80">
                  <IconAlertTriangle size={16} className={riskColor(d?.expiryPrediction?.riskLevel)} />
                  <span className={riskColor(d?.expiryPrediction?.riskLevel)}>
                    {d?.expiryPrediction?.riskLevel ? `${d.expiryPrediction.riskLevel} risk` : '—'}
                  </span>
                </div>
                <div className="mt-1 text-sm flex items-center gap-2 text-primary-content/80">
                  <IconClockHour4 size={16} className="text-primary-content/70" />
                  <span>
                    {typeof d.remainingHours === 'number' ? `${d.remainingHours}h remaining` : (d?.expiryPrediction?.safeForHours ? `${d.expiryPrediction.safeForHours}h safe` : '—')}
                  </span>
                </div>
                <div className="mt-3 text-xs text-primary-content/60">
                  {sentenceCase(d.food_type)} • {sentenceCase(d.storage)} • {d.is_sealed ? 'Sealed' : 'Unsealed'} • {sentenceCase(d.environment)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/30 bg-white/80 backdrop-blur-md shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-primary-content">{selected?.title}</h2>
                <p className="text-xs text-primary-content/60">{selected ? new Date(selected.createdAt).toLocaleString() : ''}</p>
              </div>
              <button onClick={closeModal} className="text-primary-content/60 hover:text-primary-content">✕</button>
            </div>
            <div className="mt-4">
              {modalLoading ? (
                <div className="text-center text-primary-content/70 py-8">Loading details…</div>
              ) : (
                <>
                  {(assignee || (selected && (selected.status !== 'available' || selected.claimedBy))) ? (
                    <div>
                      <h3 className="text-sm font-semibold text-primary-content/80">Assigned Volunteer</h3>
                      {assignee?.user ? (
                        <div className="mt-2 rounded-lg border border-white/40 bg-white/70 p-4">
                          <div className="text-primary-content font-medium">{assignee.user.name}</div>
                          <div className="text-sm text-primary-content/70">{assignee.user.email} • {assignee.user.phone}</div>
                          {assignee.volunteer && (
                            <div className="mt-2 text-xs text-primary-content/70">
                              {assignee.volunteer.vehicleType} • {assignee.volunteer.availability} • {assignee.volunteer.serviceRadius} km radius
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-primary-content/70">No assignee details available.</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-sm font-semibold text-primary-content/80">Available Volunteers</h3>
                      {eligible.length === 0 ? (
                        <div className="text-sm text-primary-content/70 mt-2">No eligible volunteers nearby.</div>
                      ) : (
                        <ul className="mt-3 space-y-2 max-h-80 overflow-auto pr-1">
                          {eligible.map((v) => (
                            <li key={v._id} className="rounded-lg border border-white/40 bg-white/70 p-3 flex items-center justify-between gap-3">
                              <div>
                                <div className="text-primary-content font-medium">{v.user?.name}</div>
                                <div className="text-xs text-primary-content/70">{v.user?.email} • {v.user?.phone}</div>
                                <div className="text-xs text-primary-content/60 mt-1">{v.vehicleType} • {v.availability} • {Math.round((v.distance/100)/10)} km away • {v.serviceRadius} km radius</div>
                              </div>
                              <button onClick={() => handleAssign(v.user?._id)} className="px-3 py-1.5 rounded-md bg-secondary text-primary-content text-xs font-semibold hover:opacity-90">
                                Assign
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDonations;
