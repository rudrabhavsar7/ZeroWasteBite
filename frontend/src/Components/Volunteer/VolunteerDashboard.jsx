import React, {  useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../app/userStore";
import useVolunteerStore from "../../app/volunteerStore";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const getAssignedDonations = useVolunteerStore((state) => state.getAssignedDonations);
  const getDonations = useVolunteerStore((state) => state.getDonations);
  const [volunteer, setVolunteer] = useState(null);
  const [assignedDonations, setAssignedDonations] = useState([]);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    availableNearby: 0,
  });

  useEffect(() => {
    const dummyVolunteer = {
      _id: "volunteer123",
      userId:1,
      availability: "full-time",
      vehicleType: "car",
      serviceRadius: 15,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      isVerified: true,
      assignedDonations: ["donation1", "donation2", "donation3"],
      createdAt: "2024-01-15T10:00:00Z",
    };

    const dummyStats = {
      totalAssigned: 8,
      completed: 5,
      pending: 3,
      availableNearby: 12,
    };
    
    const fetchAssignedDonations = async () => {
      const data = await getAssignedDonations();
      setAssignedDonations(data || []);
    };

    const fetchAvailableDonations = async () => {
      const data = await getDonations();
      setAvailableDonations(data || []);
    };

    fetchAssignedDonations();
    fetchAvailableDonations();

    console.log("Assigned Donations:", assignedDonations);
    console.log("Available Donations:", availableDonations);

    setVolunteer(dummyVolunteer);
    setStats(dummyStats);
  }, []);

  if (!user || !volunteer) {
    return <div className="loading">Loading dashboard...</div>;
  }

  console.log("Volunteer Data:", user);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-content to-secondary bg-clip-text text-transparent">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">Volunteer Dashboard</p>
          {!volunteer.isVerified && (
            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-3 inline-block">
              ⚠️ Your account is pending verification. Contact admin to start claiming donations.
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-green-600">{stats.totalAssigned}</div>
            <div className="mt-1 text-sm text-gray-600">Total Donations Handled</div>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-blue-600">{stats.pending}</div>
            <div className="mt-1 text-sm text-gray-600">Pending Pickups</div>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-cyan-600">{stats.completed}</div>
            <div className="mt-1 text-sm text-gray-600">Successfully Completed</div>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-5 text-center shadow-sm">
            <div className="text-4xl font-extrabold text-amber-500">{stats.availableNearby}</div>
            <div className="mt-1 text-sm text-gray-600">Available Nearby</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-content mb-2">👤 My Profile</h3>
            <p className="text-gray-600 mb-4">View and manage your volunteer profile, preferences, and verification status.</p>
            <button
              className="w-full inline-flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground/90 px-4 py-2.5 font-semibold text-sm hover:opacity-90 transition"
              onClick={() => navigate("/volunteer/profile")}
            >
              View Profile
            </button>
          </div>

          {/* Available Donations Card */}
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-content mb-2">🍽️ Available Donations</h3>
            <p className="text-gray-600 mb-4">Browse and claim food donations available in your service area.</p>
            <div className="mb-4 text-sm font-semibold text-green-600">
              {stats.availableNearby} donations available within {volunteer.serviceRadius} km
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
          <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-primary-content mb-2">📋 My Assignments</h3>
            <p className="text-gray-600 mb-4">Manage your claimed donations and update pickup status.</p>
            <div className="mb-4 text-sm">
              <div className="font-semibold text-amber-600">{stats.pending} pending pickups</div>
              <div className="text-green-600">{stats.completed} completed</div>
            </div>
            <button
              className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 text-white px-4 py-2.5 font-semibold text-sm hover:bg-cyan-700 transition"
              onClick={() => navigate("/volunteer/assigned-donations")}
            >
              View Assignments
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-primary-content mb-4">📈 Recent Activity</h3>
          <div className="grid gap-3">
            <div className="rounded-lg bg-gray-50 border-l-4 border-green-500 px-4 py-2 text-sm">
              <strong>Today 10:15 AM:</strong> Successfully picked up donation "Wedding Leftover Food"
            </div>
            <div className="rounded-lg bg-gray-50 border-l-4 border-blue-600 px-4 py-2 text-sm">
              <strong>Today 11:00 AM:</strong> Claimed donation "Restaurant Surplus"
            </div>
            <div className="rounded-lg bg-gray-50 border-l-4 border-amber-500 px-4 py-2 text-sm">
              <strong>Yesterday 9:30 PM:</strong> New donation "Fresh Vegetables" available in your area
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
