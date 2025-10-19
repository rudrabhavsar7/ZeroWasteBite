import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useVolunteerStore from "../../app/volunteerStore";
import useUserStore from "../../app/userStore";

const VolunteerProfile = () => {
  const navigate = useNavigate();
  const volunteer = useVolunteerStore((state) => state.volunteer);
  const user = useUserStore((state) => state.user);
  const [error] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let alive = true;
    async function resolveCity() {
      try {
        const coords = volunteer?.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return;
        const [lon, lat] = coords; // GeoJSON: [lon, lat]
        const cacheKey = `geo_city_${lat}_${lon}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          if (alive) setCity(cached);
          return;
        }
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
        const resp = await fetch(url, { headers: { Accept: "application/json" } });
        if (!resp.ok) return;
        const data = await resp.json();
        const addr = data?.address || {};
        const name = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state || "Unknown";
        localStorage.setItem(cacheKey, name);
        if (alive) setCity(name);
      } catch {
        // ignore network errors; keep default
      }
    }
    resolveCity();
    return () => { alive = false; };
  }, [volunteer]);

  if (!volunteer || !user) {
    return <div className="error">Failed to load volunteer profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-content to-secondary bg-clip-text text-transparent">Volunteer Profile</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
        )}

        {/* Profile Information Section */}
        <div className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-6">
          <h2 className="text-xl font-semibold text-primary-content mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
            <div><span className="font-medium">Name:</span> {user.name}</div>
            <div><span className="font-medium">Email:</span> {user.email}</div>
            <div><span className="font-medium">Phone:</span> {user.phone}</div>
            <div><span className="font-medium">Role:</span> {user.role}</div>
            <div><span className="font-medium">User Type:</span> {user.userType}</div>
          </div>
        </div>

        {/* Volunteer Specific Information */}
        <div className="mt-6 rounded-2xl border border-white/40 bg-white/80 backdrop-blur p-6">
          <h2 className="text-xl font-semibold text-primary-content mb-4">Volunteer Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
            <div>
              <span className="font-medium">Availability:</span>
              <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                volunteer.availability === 'full-time' ? 'bg-green-600' : 'bg-cyan-600'
              }`}>
                {volunteer.availability}
              </span>
            </div>
            <div><span className="font-medium">Vehicle Type:</span> <span className="ml-1 capitalize">{volunteer.vehicleType}</span></div>
            <div><span className="font-medium">Service Radius:</span> {volunteer.serviceRadius} km</div>
            <div><span className="font-medium">Location:</span> {city || 'Resolving…'}</div>
            <div>
              <span className="font-medium">Verification Status:</span>
              <span className={`ml-2 font-bold ${volunteer.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                {volunteer.isVerified ? '✓ Verified' : '❌ Not Verified'}
              </span>
            </div>
            <div><span className="font-medium">Member Since:</span> {new Date(volunteer.createdAt).toLocaleDateString()}</div>
            <div><span className="font-medium">Total Assigned Donations:</span> {volunteer.assignedDonations?.length || 0}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
            onClick={() => navigate("/volunteer/available-donations")}
          >
            View Available Donations
          </button>
          <button
            className="inline-flex items-center rounded-xl bg-green-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-green-700 transition"
            onClick={() => navigate("/volunteer/assigned-donations")}
          >
            View My Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
