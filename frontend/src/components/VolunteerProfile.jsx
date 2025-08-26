import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VolunteerProfile = () => {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Dummy data for demonstration - replace with actual API calls
    const dummyUser = {
      _id: "vol123",
      name: "John Doe",
      email: "john.volunteer@example.com",
      phone: "+1234567890",
      role: "volunteer",
      userType: "individual",
      location: { coordinates: [77.5946, 12.9716] },
    };

    const dummyVolunteer = {
      _id: "volunteer123",
      userId: dummyUser._id,
      availability: "full-time",
      vehicleType: "car",
      serviceRadius: 15,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      isVerified: true,
      assignedDonations: ["donation1", "donation2"],
      createdAt: "2024-01-15T10:00:00Z",
    };

    setUser(dummyUser);
    setVolunteer(dummyVolunteer);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading volunteer profile...</div>;
  }

  if (!volunteer || !user) {
    return <div className="error">Failed to load volunteer profile.</div>;
  }

  return (
    <div
      className="volunteer-profile"
      style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
    >
      <h1>Volunteer Profile</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      {/* Profile Information Section */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2>Personal Information</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <strong>Name:</strong> {user.name}
          </div>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>Phone:</strong> {user.phone}
          </div>
          <div>
            <strong>Role:</strong> {user.role}
          </div>
          <div>
            <strong>User Type:</strong> {user.userType}
          </div>
        </div>
      </div>

      {/* Volunteer Specific Information */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f0f8ff",
        }}
      >
        <h2>Volunteer Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <strong>Availability:</strong>
            <span
              style={{
                marginLeft: "5px",
                padding: "2px 8px",
                backgroundColor:
                  volunteer.availability === "full-time"
                    ? "#28a745"
                    : "#17a2b8",
                color: "white",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {volunteer.availability}
            </span>
          </div>
          <div>
            <strong>Vehicle Type:</strong>
            <span style={{ marginLeft: "5px", textTransform: "capitalize" }}>
              {volunteer.vehicleType}
            </span>
          </div>
          <div>
            <strong>Service Radius:</strong> {volunteer.serviceRadius} km
          </div>
          <div>
            <strong>Location:</strong>{" "}
            {volunteer.location?.coordinates?.join(", ")}
          </div>
          <div>
            <strong>Verification Status:</strong>
            <span
              style={{
                color: volunteer.isVerified ? "green" : "red",
                marginLeft: "5px",
                fontWeight: "bold",
              }}
            >
              {volunteer.isVerified ? "✓ Verified" : "❌ Not Verified"}
            </span>
          </div>
          <div>
            <strong>Member Since:</strong>{" "}
            {new Date(volunteer.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Total Assigned Donations:</strong>{" "}
            {volunteer.assignedDonations?.length || 0}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginRight: "10px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/volunteer/available-donations")}
        >
          View Available Donations
        </button>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/volunteer/assigned-donations")}
        >
          View My Assignments
        </button>
      </div>
    </div>
  );
};

export default VolunteerProfile;
