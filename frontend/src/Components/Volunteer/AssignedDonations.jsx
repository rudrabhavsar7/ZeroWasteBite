import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useVolunteerStore from "../../app/volunteerStore";
import useUserStore from "../../app/userStore";

const AssignedDonations = () => {
  const navigate = useNavigate();
  const updateDonationStatus = useVolunteerStore((s) => s.updateDonationStatus);
  const getAssignedDonations = useVolunteerStore((s) => s.getAssignedDonations);
  const user = useUserStore((s) => s.user);
  const [assignedDonations, setAssignedDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dummyAssignedDonations = [
      {
        _id: "donation3",
        title: "Packaged Snacks",
        food_type: "packaged",
        storage: "room_temp",
        time_since_prep: 12,
        is_sealed: true,
        environment: "dry",
        location: { coordinates: [77.58, 12.96] },
        expiryPrediction: {
          safeForHours: 48,
          confidence: 0.95,
          riskLevel: "low",
        },
        description: "Unopened packaged snacks from convenience store",
        status: "claimed",
        claimedBy: "vol123",
        createdAt: "2024-01-14T14:00:00Z",
        claimedAt: "2024-01-15T09:00:00Z",
      },
      {
        _id: "donation6",
        title: "Wedding Leftover Food",
        food_type: "cooked_veg",
        storage: "fridge",
        time_since_prep: 6,
        is_sealed: true,
        environment: "dry",
        location: { coordinates: [77.59, 12.97] },
        expiryPrediction: {
          safeForHours: 18,
          confidence: 0.88,
          riskLevel: "low",
        },
        description: "Vegetarian food from wedding ceremony",
        status: "picked",
        claimedBy: "vol123",
        createdAt: "2024-01-14T18:00:00Z",
        claimedAt: "2024-01-15T08:30:00Z",
        pickedAt: "2024-01-15T10:15:00Z",
      },
      {
        _id: "donation7",
        title: "Restaurant Surplus",
        food_type: "cooked_veg",
        storage: "room_temp",
        time_since_prep: 5,
        is_sealed: false,
        environment: "humid",
        location: { coordinates: [77.575, 12.965] },
        expiryPrediction: {
          safeForHours: 8,
          confidence: 0.72,
          riskLevel: "medium",
        },
        description: "Mixed vegetarian dishes from restaurant",
        status: "claimed",
        claimedBy: "vol123",
        createdAt: "2024-01-15T05:00:00Z",
        claimedAt: "2024-01-15T11:00:00Z",
      },
    ];

    setAssignedDonations(dummyAssignedDonations);
  }, []);

  const updateDonation = async (donationId, newStatus) => {
    setLoading(true);
    setError("");
    try {
      console.log("Updating donation status:", donationId, newStatus);
      updateDonationStatus(donationId, newStatus);
      // Update local state
      setAssignedDonations((prev) =>
        prev.map((d) =>
          d._id === donationId
            ? {
                ...d,
                status: newStatus,
                [newStatus + "At"]: new Date().toISOString(),
              }
            : d
        )
      );

      toast.success(`Donation marked as ${newStatus} successfully!`);
    } catch (err) {
      setError("Failed to update donation status: " + err.message);
      toast.error("Failed to update donation status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedDonations = async () => {
    try {
      const donations = await getAssignedDonations(user._id);
      console.log("Fetched Assigned Donations:", donations);
      setAssignedDonations(Array.isArray(donations) ? donations : []);
    } catch (err) {
      setError("Failed to fetch assigned donations: " + err.message);
    }
  };

  useEffect(() => {
    fetchAssignedDonations();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "claimed":
        return "#ffc107";
      case "picked":
        return "#28a745";
      case "expired":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "claimed":
        return "📋";
      case "picked":
        return "✅";
      case "expired":
        return "❌";
      default:
        return "❓";
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "green";
      case "medium":
        return "orange";
      case "high":
        return "red";
      default:
        return "gray";
    }
  };

  const getTimeRemaining = (safeForHours, claimedAt) => {
    if (!claimedAt) return safeForHours;

    const claimedTime = new Date(claimedAt);
    const now = new Date();
    const hoursElapsed = (now - claimedTime) / (1000 * 60 * 60);
    const remaining = Math.max(0, safeForHours - hoursElapsed);

    return Math.round(remaining * 10) / 10; // Round to 1 decimal place
  };

  return (
    <div className="py-10 bg-gradient-to-br from-primary/10 via-white to-secondary/10 min-h-screen mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-content to-secondary bg-clip-text text-transparent">My Assigned Donations</h1>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
              onClick={() => navigate("/volunteer/available-donations")}
            >
              Browse Available
            </button>
            <button
              className="inline-flex items-center rounded-xl bg-gray-700 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 transition"
              onClick={() => navigate("/volunteer/profile")}
            >
              Back to Profile
            </button>
          </div>
        </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-4 text-center">
          <div className="text-2xl font-bold">{assignedDonations.filter((d) => d.status === "claimed").length}</div>
          <div className="text-sm">Pending Pickup</div>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 text-green-700 p-4 text-center">
          <div className="text-2xl font-bold">{assignedDonations.filter((d) => d.status === "picked").length}</div>
          <div className="text-sm">Successfully Picked</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-center">
          <div className="text-2xl font-bold">{assignedDonations.filter((d) => d.status === "expired").length}</div>
          <div className="text-sm">Expired</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 p-4 text-center">
          <div className="text-2xl font-bold">{assignedDonations.length}</div>
          <div className="text-sm">Total Assigned</div>
        </div>
      </div>

      {assignedDonations.length === 0 ? (
        <div className="text-center rounded-2xl bg-gray-50 border border-white/40 p-10">
          <h3 className="text-lg font-semibold text-primary-content">No Assigned Donations</h3>
          <p className="text-gray-600">You don't have any donations assigned to you yet.</p>
          <button
            className="mt-3 inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate("/volunteer/available-donations")}
          >
            Browse Available Donations
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {assignedDonations.map((donation) => {
            const timeRemaining = getTimeRemaining(
              donation.expiryPrediction.safeForHours,
              donation.claimedAt
            );
            const isUrgent = timeRemaining <= 2 && donation.status === "claimed";
            return (
              <div key={donation._id} className={`rounded-2xl border p-5 shadow-sm ${isUrgent ? 'border-red-400 bg-red-50' : 'border-white/40 bg-white/80 backdrop-blur'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-primary-content">{donation.title}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-700">{donation.food_type.replace('_', ' ')}</span>
                      <span className="text-xs" style={{ color: getStatusColor(donation.status) }}>{getStatusIcon(donation.status)} {donation.status.toUpperCase()}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 italic">{donation.description}</p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{new Date(donation.createdAt).toLocaleString()}</div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div><span className="font-medium">Storage:</span> {donation.storage.replace('_', ' ')}</div>
                  <div><span className="font-medium">Sealed:</span> {donation.is_sealed ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Environment:</span> {donation.environment}</div>
                  <div><span className="font-medium">Safe For:</span> {donation.expiryPrediction.safeForHours} hours</div>
                  <div><span className="font-medium">Confidence:</span> {(donation.expiryPrediction.confidence * 100).toFixed(1)}%</div>
                  <div><span className="font-medium">Risk:</span> <span style={{ color: getRiskColor(donation.expiryPrediction.riskLevel) }}>{donation.expiryPrediction.riskLevel.toUpperCase()}</span></div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">Time remaining: {timeRemaining}h</div>
                  {donation.status === 'claimed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateDonation(donation._id, 'picked')}
                        disabled={loading}
                        className="inline-flex items-center rounded-xl bg-green-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-green-700 transition"
                      >
                        {loading ? 'Updating...' : '✅ Mark as Picked'}
                      </button>
                      <button
                        onClick={() => updateDonation(donation._id, 'expired')}
                        disabled={loading}
                        className="inline-flex items-center rounded-xl bg-red-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-red-700 transition"
                      >
                        {loading ? 'Updating...' : '❌ Mark as Expired'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">Location: {donation.location.coordinates.join(', ')}</div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default AssignedDonations;
