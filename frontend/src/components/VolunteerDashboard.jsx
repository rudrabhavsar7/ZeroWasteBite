import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [volunteer, setVolunteer] = useState(null);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    completed: 0,
    pending: 0,
    availableNearby: 0,
  });

  useEffect(() => {
    // Dummy data for demonstration
    const dummyUser = {
      _id: "vol123",
      name: "John Doe",
      email: "john.volunteer@example.com",
      phone: "+1234567890",
      role: "volunteer",
      userType: "individual",
    };

    const dummyVolunteer = {
      _id: "volunteer123",
      userId: dummyUser._id,
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

    setUser(dummyUser);
    setVolunteer(dummyVolunteer);
    setStats(dummyStats);
  }, []);

  if (!user || !volunteer) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div
      className="volunteer-dashboard"
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
          Welcome, {user.name}!
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "18px" }}>
          Volunteer Dashboard
        </p>
        {!volunteer.isVerified && (
          <div
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderRadius: "6px",
              marginTop: "15px",
              border: "1px solid #ffeaa7",
            }}
          >
            ⚠️ Your account is pending verification. Contact admin to start
            claiming donations.
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
            border: "1px solid #e9ecef",
          }}
        >
          <h2 style={{ margin: "0", color: "#28a745", fontSize: "36px" }}>
            {stats.totalAssigned}
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d" }}>
            Total Donations Handled
          </p>
        </div>

        <div
          style={{
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
            border: "1px solid #e9ecef",
          }}
        >
          <h2 style={{ margin: "0", color: "#007bff", fontSize: "36px" }}>
            {stats.pending}
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d" }}>
            Pending Pickups
          </p>
        </div>

        <div
          style={{
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
            border: "1px solid #e9ecef",
          }}
        >
          <h2 style={{ margin: "0", color: "#17a2b8", fontSize: "36px" }}>
            {stats.completed}
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d" }}>
            Successfully Completed
          </p>
        </div>

        <div
          style={{
            padding: "25px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
            border: "1px solid #e9ecef",
          }}
        >
          <h2 style={{ margin: "0", color: "#ffc107", fontSize: "36px" }}>
            {stats.availableNearby}
          </h2>
          <p style={{ margin: "5px 0 0 0", color: "#6c757d" }}>
            Available Nearby
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
          marginBottom: "40px",
        }}
      >
        {/* Profile Card */}
        <div
          style={{
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              color: "#2c3e50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            👤 My Profile
          </h3>
          <p style={{ color: "#6c757d", marginBottom: "20px" }}>
            View and manage your volunteer profile, preferences, and
            verification status.
          </p>
          <div style={{ marginBottom: "15px", fontSize: "14px" }}>
            <div>
              <strong>Availability:</strong> {volunteer.availability}
            </div>
            <div>
              <strong>Vehicle:</strong> {volunteer.vehicleType}
            </div>
            <div>
              <strong>Service Radius:</strong> {volunteer.serviceRadius} km
            </div>
          </div>
          <button
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            onClick={() => navigate("/volunteer/profile")}
          >
            View Profile
          </button>
        </div>

        {/* Available Donations Card */}
        <div
          style={{
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              color: "#2c3e50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            🍽️ Available Donations
          </h3>
          <p style={{ color: "#6c757d", marginBottom: "20px" }}>
            Browse and claim food donations available in your service area.
          </p>
          <div
            style={{ marginBottom: "15px", fontSize: "14px", color: "#28a745" }}
          >
            <strong>
              {stats.availableNearby} donations available within{" "}
              {volunteer.serviceRadius} km
            </strong>
          </div>
          <button
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: volunteer.isVerified ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: volunteer.isVerified ? "pointer" : "not-allowed",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            onClick={() =>
              volunteer.isVerified && navigate("/volunteer/available-donations")
            }
          >
            {volunteer.isVerified
              ? "Browse Donations"
              : "Verification Required"}
          </button>
        </div>

        {/* Assigned Donations Card */}
        <div
          style={{
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              color: "#2c3e50",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            📋 My Assignments
          </h3>
          <p style={{ color: "#6c757d", marginBottom: "20px" }}>
            Manage your claimed donations and update pickup status.
          </p>
          <div style={{ marginBottom: "15px", fontSize: "14px" }}>
            <div style={{ color: "#ffc107" }}>
              <strong>{stats.pending} pending pickups</strong>
            </div>
            <div style={{ color: "#28a745" }}>{stats.completed} completed</div>
          </div>
          <button
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            onClick={() => navigate("/volunteer/assigned-donations")}
          >
            View Assignments
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        style={{
          padding: "25px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e9ecef",
        }}
      >
        <h3 style={{ color: "#2c3e50", marginBottom: "20px" }}>
          📈 Recent Activity
        </h3>
        <div style={{ display: "grid", gap: "10px" }}>
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              borderLeft: "4px solid #28a745",
            }}
          >
            <strong>Today 10:15 AM:</strong> Successfully picked up donation
            "Wedding Leftover Food"
          </div>
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              borderLeft: "4px solid #007bff",
            }}
          >
            <strong>Today 11:00 AM:</strong> Claimed donation "Restaurant
            Surplus"
          </div>
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              borderLeft: "4px solid #ffc107",
            }}
          >
            <strong>Yesterday 9:30 PM:</strong> New donation "Fresh Vegetables"
            available in your area
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
