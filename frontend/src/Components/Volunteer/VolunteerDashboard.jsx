import React, {  useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../app/userStore";
import useVolunteerStore from "../../app/volunteerStore";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const volunteer = useVolunteerStore((state) => state.volunteer);
  const getAssignedDonations = useVolunteerStore((s) => s.getAssignedDonations);
  const getDonations = useVolunteerStore((s) => s.getDonations);
  const [assignedDonations, setAssignedDonations] = useState([]);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [assigned, available] = await Promise.all([
          getAssignedDonations().catch(() => []),
          getDonations().catch(() => []),
        ]);
        if (!cancelled) {
          setAssignedDonations(Array.isArray(assigned) ? assigned : []);
          setAvailableDonations(Array.isArray(available) ? available : []);
        }
      } catch {
        if (!cancelled) setError("Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [getAssignedDonations, getDonations]);

  const stats = useMemo(() => {
    const totalAssigned = assignedDonations.length;
    const pending = assignedDonations.filter((d) => d.status === "claimed").length;
    const picked = assignedDonations.filter((d) => d.status === "picked").length;
    const expired = assignedDonations.filter((d) => d.status === "expired").length;
    const available = availableDonations.filter((d) => d.status === "available").length;
    return { totalAssigned, pending, picked, expired, available };
  }, [assignedDonations, availableDonations]);

  if(!volunteer.isVerified){
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-10 mt-20 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white/80 backdrop-blur rounded-2xl border border-red-300 p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Account Pending Verification</h1>
          <p className="text-gray-700 mb-6">Your volunteer account is currently pending verification by an NGO. You will be able to access all features once your account has been verified.</p>
          <button
            className="inline-flex items-center justify-center rounded-xl bg-red-600 text-white px-4 py-2.5 font-semibold text-sm hover:bg-red-700 transition"
            onClick={() => navigate("/")}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  if (!volunteer) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-content to-secondary bg-clip-text text-transparent">
            Welcome, {user?.name || "Volunteer"}!
          </h1>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-gray-600">Volunteer Dashboard</span>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
              volunteer.isVerified ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-800 border border-yellow-200"
            }`}>
              {volunteer.isVerified ? "Verified" : "Pending Verification"}
            </span>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 inline-block">{error}</div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-green-600">{stats.totalAssigned}</div>
            <div className="mt-1 text-sm text-gray-600">Total Assigned</div>
          </div>
          <div className="rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-amber-600">{stats.pending}</div>
            <div className="mt-1 text-sm text-gray-600">Pending Pickups</div>
          </div>
          <div className="rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-cyan-600">{stats.picked}</div>
            <div className="mt-1 text-sm text-gray-600">Completed</div>
          </div>
          <div className="rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-amber-500">{stats.available}</div>
            <div className="mt-1 text-sm text-gray-600">Available Nearby</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-content mb-2">My Profile</h3>
            <p className="text-gray-600 mb-4">View and manage your volunteer profile, preferences, and verification status.</p>
            <button
              className="w-full inline-flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground/90 px-4 py-2.5 font-semibold text-sm hover:opacity-90 transition"
              onClick={() => navigate("/volunteer/profile")}
            >
              View Profile
            </button>
          </div>

          {/* Available Donations Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-content mb-2">Available Donations</h3>
            <p className="text-gray-600 mb-4">Browse and claim food donations available in your service area.</p>
            <div className="mb-4 text-sm font-semibold text-green-600">
              {stats.available} donations available within {volunteer.serviceRadius} km
            </div>
            <button
              className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-semibold text-sm transition ${
                volunteer.isVerified ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              onClick={() => volunteer.isVerified && navigate("/volunteer/available-donations")}
            >
              {volunteer.isVerified ? "Browse Donations" : "Verification Required"}
            </button>
          </div>

          {/* Assigned Donations Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-green-600/35 bg-white/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-content mb-2">My Assignments</h3>
            <p className="text-gray-600 mb-4">Manage your claimed donations and update pickup status.</p>
            <div className="mb-4 text-sm">
              <div className="font-semibold text-amber-600">{stats.pending} pending pickups</div>
              <div className="text-green-600">{stats.picked} completed</div>
            </div>
            <button
              className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 text-white px-4 py-2.5 font-semibold text-sm hover:bg-cyan-700 transition"
              onClick={() => navigate("/volunteer/assigned-donations")}
            >
              View Assignments
            </button>
          </div>
        </div>

        {/* Loading Placeholder */}
        {loading && (
          <div className="rounded-2xl border border-green-600/35 bg-white/60 backdrop-blur p-6 text-center text-sm text-gray-600">
            Syncing latest donations and assignments…
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
