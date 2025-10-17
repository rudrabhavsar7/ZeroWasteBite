import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useVolunteerStore from "../../app/volunteerStore";

const AvailableDonations = () => {
  const navigate = useNavigate();
  const getDonations = useVolunteerStore((s) => s.getDonations);
  const claimDonation = useVolunteerStore((s) => s.claimDonation);
  const volunteer = useVolunteerStore((s) => s.volunteer);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressMap, setAddressMap] = useState({}); // {_id: address}

  useEffect(() => {

    const fetchDonations = async () => {
      const resp = await getDonations();
      console.log("Fetched donations:", resp);
      resp.filter((d) => d.status === "available");
      setAvailableDonations( resp );
      return resp;
    }

    fetchDonations();
  }, [getDonations]);

  const claimDonationById = async (donationId) => {
    setLoading(true);
    setError("");
    try {
      console.log("Claiming donation:", donationId);
      const resp = await claimDonation(donationId);
      console.log("Claim response:", resp);
      setAvailableDonations((prev) => prev.filter((d) => d._id !== donationId));
      toast.success("Donation claimed successfully!");
    } catch (err) {
      setError("Failed to claim donation: " + err.message);
      toast.error("Failed to claim donation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=14&addressdetails=1`;
    const resp = await fetch(url, {
      headers: {
        // Best effort to be polite; browsers may restrict custom UA headers
        "Accept": "application/json",
      },
    });
    if (!resp.ok) throw new Error(`Reverse geocode failed: ${resp.status}`);
    const data = await resp.json();
    // Prefer a concise address composed from address parts if available
    const a = data.address || {};
    const parts = [a.road, a.neighbourhood || a.suburb, a.city || a.town || a.village]
      .filter(Boolean)
      .slice(0, 3);
    const concise = parts.join(", ");
    return concise || data.display_name || "Unknown location";
  };

  // Fetch missing addresses when donations change (rate-limited)
  useEffect(() => {
    const toFetch = availableDonations.filter(
      (d) => d?.location?.coordinates?.length === 2 && !addressMap[d._id]
    );
    if (toFetch.length === 0) return;
    let cancelled = false;
    const run = async () => {
      for (const d of toFetch) {
        const [lon, lat] = d.location.coordinates; // GeoJSON order [lon, lat]
        try {
          const name = await reverseGeocode(lat, lon);
          if (!cancelled) {
            setAddressMap((prev) => ({ ...prev, [d._id]: name }));
          }
        } catch {
          if (!cancelled) {
            setAddressMap((prev) => ({ ...prev, [d._id]: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
          }
        }
        // Gentle delay to avoid hammering the service
        await new Promise((r) => setTimeout(r, 600));
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [availableDonations, addressMap]);

  // Map risk/urgency to Tailwind classes
  const getRiskBorderClass = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "border-green-300";
      case "medium":
        return "border-orange-300";
      case "high":
        return "border-red-300";
      default:
        return "border-gray-200";
    }
  };

  const getRiskTextClass = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-orange-500";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getUrgencyBgClass = (color) => {
    switch (color) {
      case "red":
        return "bg-red-600";
      case "orange":
        return "bg-orange-500";
      case "green":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  const getUrgencyTextClass = (color) => {
    switch (color) {
      case "red":
        return "text-red-600";
      case "orange":
        return "text-orange-500";
      case "green":
        return "text-green-600";
      default:
        return "text-gray-500";
    }
  };

  // Compute hours remaining based on donation.createdAt and predicted safeForHours
  const getRemainingHours = (donation) => {
    const safeForHours = donation?.expiryPrediction?.safeForHours ?? 0;
    const createdAt = donation?.createdAt ? new Date(donation.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return safeForHours;
    const now = new Date();
    const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
    const remaining = Math.max(0, safeForHours - hoursElapsed);
    // Round to 1 decimal place for stable UI
    return Math.round(remaining * 10) / 10;
  };

  // Urgency based on remaining hours (not total safe hours)
  const getTimeUrgency = (remainingHours) => {
    if (remainingHours <= 0) return { color: "gray", text: "Expired", priority: 4 };
    if (remainingHours <= 2) return { color: "red", text: "🚨 URGENT", priority: 1 };
    if (remainingHours <= 6) return { color: "orange", text: "⚠️ Soon", priority: 2 };
    return { color: "green", text: "✓ Stable", priority: 3 };
  };

  // Sort donations by urgency (most urgent first) using remaining hours
  const sortedDonations = [...availableDonations].sort((a, b) => {
    const remainingA = getRemainingHours(a);
    const remainingB = getRemainingHours(b);
    const urgencyA = getTimeUrgency(remainingA);
    const urgencyB = getTimeUrgency(remainingB);

    // First sort by urgency priority (1 = most urgent; 4 = expired)
    if (urgencyA.priority !== urgencyB.priority) {
      return urgencyA.priority - urgencyB.priority;
    }

    // If same urgency, sort by remaining hours (least remaining first)
    return remainingA - remainingB;
  });

  // Separate into active and expired for dedicated sections
  const activeDonations = sortedDonations.filter((d) => getRemainingHours(d) > 0);
  const expiredDonations = sortedDonations.filter((d) => getRemainingHours(d) <= 0);

  return (
    <div className="py-10 bg-gradient-to-br from-primary/10 via-white to-secondary/10 min-h-screen mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-content to-secondary bg-clip-text text-transparent">Available Donations in Your Area</h1>
          <button
            className="inline-flex items-center rounded-xl bg-gray-700 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 transition"
            onClick={() => navigate("/volunteer/profile")}
          >
            Back to Profile
          </button>
        </div>

      {/* Urgent Donations Alert */}
      {sortedDonations.some(
        (d) => getTimeUrgency(getRemainingHours(d)).priority === 1
      ) && (
        <div className="text-center text-white font-bold text-base rounded-xl bg-red-600 px-4 py-3 mb-5 animate-pulse shadow-lg">
          🚨 URGENT:{" "}
          {
            sortedDonations.filter(
              (d) => getTimeUrgency(getRemainingHours(d)).priority === 1
            ).length
          }{" "}
          donation(s) need immediate pickup (expires in ≤2 hours)!
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
      )}

      {!volunteer?.isVerified && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-3">
          <strong>⚠️ Verification Required:</strong> You need to be verified to claim donations. Please contact the administrator.
        </div>
      )}

      {availableDonations.length === 0 ? (
        <div className="text-center rounded-2xl bg-gray-50 border border-white/40 p-10">
          <h3 className="text-lg font-semibold text-primary-content">No Donations Available</h3>
          <p className="text-gray-600 mt-1">There are currently no donations available in your service area.</p>
          <p className="text-gray-600">Please check back later or increase your service radius in your profile settings.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary-content">Found {availableDonations.length} donations within {volunteer?.serviceRadius} km</h3>
            <p className="text-sm text-gray-600 mt-1">🚨 Urgent donations are shown first</p>
          </div>

          <div className="grid gap-5">
            {activeDonations.map((donation) => {
              const remainingHours = getRemainingHours(donation);
              const urgency = getTimeUrgency(remainingHours);
              return (
                <div
                  key={donation._id}
                  className={`relative rounded-2xl p-5 transition ${
                    urgency.priority === 1
                      ? "border-[3px] border-red-500 bg-red-50 shadow-lg animate-pulse"
                      : donation.expiryPrediction.riskLevel === "high"
                      ? "border-2 border-red-300 bg-red-50"
                      : `border-2 ${getRiskBorderClass(donation.expiryPrediction.riskLevel)} bg-gray-50`
                  }`}
                >
                  {/* Urgency Badge */}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-xs font-bold ${getUrgencyBgClass(urgency.color)}`}>{urgency.text}</div>

                  <h3 className="mt-0 mb-4 text-lg font-semibold text-primary-content">{donation.title}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm text-gray-700">
                    <div>
                      <strong>Food Type:</strong>{" "}
                      {donation.food_type.replace("_", " ")}
                    </div>
                    <div>
                      <strong>Storage:</strong>{" "}
                      {donation.storage.replace("_", " ")}
                    </div>
                    <div>
                      <strong>Time Since Prep:</strong>{" "}
                      {donation.time_since_prep} hours ago
                    </div>
                    <div>
                      <strong>Sealed:</strong>{" "}
                      {donation.is_sealed ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Environment:</strong> {donation.environment}
                    </div>
                    <div>
                      <strong>Risk Level:</strong>
                      <span className={`${getRiskTextClass(donation.expiryPrediction.riskLevel)} ml-1 font-bold`}>
                        {donation.expiryPrediction.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="sm:col-span-2 md:col-span-3">
                      <strong>Location:</strong>
                      <span className="ml-1">
                        {addressMap[donation._id]
                          ? addressMap[donation._id]
                          : donation?.location?.coordinates?.length === 2
                          ? "Resolving address…"
                          : "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* ML Predictions */}
                  <div className="p-4 bg-white rounded-lg mb-4 border border-gray-200">
                    <h4 className="m-0 mb-2 font-semibold">🤖 AI Food Safety Analysis</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm text-gray-700">
                      <div>
                        <strong>Safe For:</strong>
                        <span className={`${getUrgencyTextClass(urgency.color)} ml-1 font-bold`}>
                          {donation.expiryPrediction.safeForHours} hours
                        </span>
                      </div>
                      <div>
                        <strong>Time Remaining:</strong>
                        <span className={`${getUrgencyTextClass(urgency.color)} ml-1 font-bold`}>{remainingHours} hours</span>
                      </div>
                      <div>
                        <strong>Confidence:</strong>{" "}
                        {(donation.expiryPrediction.confidence * 100).toFixed(
                          1
                        )}
                        %
                      </div>
                      <div>
                        <strong>Posted:</strong>{" "}
                        {new Date(donation.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <strong>Description:</strong>
                    <p className="mt-1 italic">{donation.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => claimDonationById(donation._id)}
                      disabled={loading || !volunteer?.isVerified}
                      className={`inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed ${
                        !volunteer?.isVerified
                          ? "bg-gray-500"
                          : urgency.priority === 1
                          ? "bg-red-800 hover:bg-red-900"
                          : donation.expiryPrediction.riskLevel === "high"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {loading
                        ? "Claiming..."
                        : urgency.priority === 1
                        ? "🚨 CLAIM IMMEDIATELY"
                        : donation.expiryPrediction.riskLevel === "high"
                        ? "🚨 CLAIM URGENT"
                        : "Claim Donation"}
                    </button>

                    <div className="text-xs text-gray-500">Distance: ~{Math.round(Math.random() * 10 + 1)} km</div>
                  </div>
                </div>
              );
            })}
          </div>

          {expiredDonations.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Expired Donations</h3>
              <div className="grid gap-5">
                {expiredDonations.map((donation) => {
                  const remainingHours = getRemainingHours(donation);
                  const urgency = getTimeUrgency(remainingHours);
                  return (
                    <div
                      key={donation._id}
                      className={`relative rounded-2xl p-5 transition border-2 border-gray-300 bg-gray-100 text-gray-600`}
                    >
                      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white text-xs font-bold ${getUrgencyBgClass(urgency.color)}`}>{urgency.text}</div>

                      <h3 className="mt-0 mb-4 text-lg font-semibold text-gray-700">{donation.title}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                        <div>
                          <strong>Food Type:</strong> {donation.food_type.replace("_", " ")}
                        </div>
                        <div>
                          <strong>Storage:</strong> {donation.storage.replace("_", " ")}
                        </div>
                        <div>
                          <strong>Time Since Prep:</strong> {donation.time_since_prep} hours ago
                        </div>
                        <div>
                          <strong>Sealed:</strong> {donation.is_sealed ? "Yes" : "No"}
                        </div>
                        <div>
                          <strong>Environment:</strong> {donation.environment}
                        </div>
                        <div>
                          <strong>Risk Level:</strong>
                          <span className={`ml-1 font-bold ${getRiskTextClass(donation.expiryPrediction.riskLevel)}`}>
                            {donation.expiryPrediction.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="sm:col-span-2 md:col-span-3">
                          <strong>Location:</strong>
                          <span className="ml-1">
                            {addressMap[donation._id]
                              ? addressMap[donation._id]
                              : donation?.location?.coordinates?.length === 2
                              ? "Resolving address…"
                              : "Unknown"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-lg mb-4 border border-gray-200">
                        <h4 className="m-0 mb-2 font-semibold text-gray-700">🤖 AI Food Safety Analysis</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <strong>Safe For:</strong>
                            <span className={`ml-1 font-bold ${getUrgencyTextClass(urgency.color)}`}>
                              {donation.expiryPrediction.safeForHours} hours
                            </span>
                          </div>
                          <div>
                            <strong>Time Remaining:</strong>
                            <span className={`ml-1 font-bold ${getUrgencyTextClass(urgency.color)}`}>{remainingHours} hours</span>
                          </div>
                          <div>
                            <strong>Confidence:</strong> {(donation.expiryPrediction.confidence * 100).toFixed(1)}%
                          </div>
                          <div>
                            <strong>Posted:</strong> {new Date(donation.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          disabled
                          className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white bg-gray-500 opacity-60 cursor-not-allowed"
                        >
                          Expired
                        </button>
                        <div className="text-xs text-gray-500">Distance: ~{Math.round(Math.random() * 10 + 1)} km</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default AvailableDonations;
