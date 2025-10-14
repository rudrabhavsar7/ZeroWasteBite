import React, { useState, useEffect, useMemo } from "react";
import useUserStore from "../app/userStore";

const DonationHistory = () => {
  const [donationHistory, setDonationHistory] = useState([
    // Fallback sample to avoid empty UI before fetch
    {
      title: "Paneer Sabji",
      description: "Delicious paneer curry with vegetables",
      food_type: "cooked_veg",
      status: "available",
    },
    {
      title: "Mixed Vegetable Curry",
      description: "Fresh mixed vegetables cooked with spices",
      food_type: "cooked_veg",
      status: "picked",
    },
    {
      title: "Fresh Fruits",
      description: "Assorted seasonal fruits",
      food_type: "raw",
      status: "claimed",
    },
    {
      title: "Packaged Snacks",
      description: "Various packaged snacks and biscuits",
      food_type: "packaged",
      status: "available",
    },
    {
      title: "Chicken Curry",
      description: "Spicy chicken curry with rice",
      food_type: "non_veg",
      status: "expired",
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const getDonationHistory = useUserStore((state) => state.getDonationHistory);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getDonationHistory();
      setDonationHistory(Array.isArray(history) ? history : []);
      console.log("Fetched Donation History:", history);
    };
    fetchHistory();
  }, [getDonationHistory]);

  const counts = useMemo(() => {
    const base = { total: donationHistory.length, available: 0, picked: 0, claimed: 0, expired: 0 };
    return donationHistory.reduce((acc, d) => {
      const s = (d?.status || "").toLowerCase();
      if (s in acc) acc[s] += 1;
      return acc;
    }, base);
  }, [donationHistory]);

  const filtered = useMemo(() => {
    return donationHistory.filter((d) => {
      const statusOk = statusFilter === "all" || (d?.status || "").toLowerCase() === statusFilter;
      const q = search.trim().toLowerCase();
      if (!q) return statusOk;
      const inTitle = (d?.title || "").toLowerCase().includes(q);
      const inDesc = (d?.description || "").toLowerCase().includes(q);
      const inType = (d?.food_type || "").toLowerCase().includes(q);
      return statusOk && (inTitle || inDesc || inType);
    });
  }, [donationHistory, statusFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta; // newest first
    });
  }, [filtered]);

  const statusPill = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      picked: "bg-primary/20 text-primary-content border-primary/30",
      claimed: "bg-blue-100 text-blue-800 border-blue-200",
      available: "bg-secondary/20 text-secondary border-secondary/30",
      expired: "bg-red-100 text-red-800 border-red-200",
    };
    return map[s] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatType = (t) => (t ? t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "-");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-10 mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-content to-secondary bg-clip-text text-transparent">Donation Timeline</h1>
          <p className="text-gray-600 mt-2">Browse your donations in chronological order with quick filters.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, or type..."
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[{ key: "all", label: `All (${counts.total})` }, { key: "available", label: `Available (${counts.available})` }, { key: "picked", label: `Picked (${counts.picked})` }, { key: "claimed", label: `Claimed (${counts.claimed})` }, { key: "expired", label: `Expired (${counts.expired})` }].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${statusFilter === opt.key ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {sorted.length === 0 ? (
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/40 p-10 text-center">
            <div className="text-6xl mb-3">🍽️</div>
            <h3 className="text-xl font-semibold text-primary-content">No matching donations</h3>
            <p className="text-gray-600 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent" aria-hidden />
            <ul className="space-y-6">
              {sorted.map((d, idx) => {
                const s = (d?.status || '').toLowerCase();
                const dotClass = s === 'available' ? 'bg-green-500' : s === 'picked' ? 'bg-purple-600' : s === 'claimed' ? 'bg-blue-600' : s === 'expired' ? 'bg-red-500' : 'bg-gray-400';
                const created = d?.createdAt ? new Date(d.createdAt).toLocaleString() : null;
                return (
                  <li key={idx} className="relative pl-12 sm:pl-16">
                    <span className={`absolute left-3 sm:left-5 top-2 inline-block h-3.5 w-3.5 rounded-full ring-4 ring-white ${dotClass}`} />
                    <div className="bg-white/90 backdrop-blur border border-white/40 rounded-2xl p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{d?.title || 'Untitled'}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusPill(d?.status)}`}>
                              {(d?.status || '').toString().toUpperCase()}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 border border-gray-200">
                              {formatType(d?.food_type)}
                            </span>
                          </div>
                          {d?.description && (
                            <p className="mt-2 text-sm text-gray-700 italic">"{d.description}"</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{created || ''}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationHistory;
