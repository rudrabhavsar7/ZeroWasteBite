import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AssignedDonations = () => {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [assignedDonations, setAssignedDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Dummy volunteer data
    const dummyVolunteer = {
      _id: "volunteer123",
      userId: "vol123",
      availability: "full-time",
      vehicleType: "car",
      serviceRadius: 15,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      isVerified: true,
      assignedDonations: ["donation3", "donation6", "donation7"],
    };

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

    setVolunteer(dummyVolunteer);
    setAssignedDonations(dummyAssignedDonations);
  }, []);

  const updateDonationStatus = async (donationId, newStatus) => {
    setLoading(true);
    setError("");
    try {
      // Simulate API call
      console.log("Updating donation status:", donationId, newStatus);

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

      alert(`Donation marked as ${newStatus} successfully!`);
    } catch (err) {
      setError("Failed to update donation status: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div
      className="assigned-donations"
      style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>My Assigned Donations</h1>
        <div>
          <button
            style={{
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              marginRight: "10px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/volunteer/available-donations")}
          >
            Browse Available
          </button>
          <button
            style={{
              padding: "10px 15px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/volunteer/profile")}
          >
            Back to Profile
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#f8d7da",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0", color: "#856404" }}>
            {assignedDonations.filter((d) => d.status === "claimed").length}
          </h3>
          <p style={{ margin: "5px 0 0 0", color: "#856404" }}>
            Pending Pickup
          </p>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#d4edda",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0", color: "#155724" }}>
            {assignedDonations.filter((d) => d.status === "picked").length}
          </h3>
          <p style={{ margin: "5px 0 0 0", color: "#155724" }}>
            Successfully Picked
          </p>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0", color: "#721c24" }}>
            {assignedDonations.filter((d) => d.status === "expired").length}
          </h3>
          <p style={{ margin: "5px 0 0 0", color: "#721c24" }}>Expired</p>
        </div>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#e2e3e5",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0", color: "#383d41" }}>
            {assignedDonations.length}
          </h3>
          <p style={{ margin: "5px 0 0 0", color: "#383d41" }}>
            Total Assigned
          </p>
        </div>
      </div>

      {assignedDonations.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3>No Assigned Donations</h3>
          <p>You don't have any donations assigned to you yet.</p>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "10px",
            }}
            onClick={() => navigate("/volunteer/available-donations")}
          >
            Browse Available Donations
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {assignedDonations.map((donation) => {
            const timeRemaining = getTimeRemaining(
              donation.expiryPrediction.safeForHours,
              donation.claimedAt
            );
            const isUrgent =
              timeRemaining <= 2 && donation.status === "claimed";

            return (
              <div
                key={donation._id}
                style={{
                  padding: "20px",
                  border: `2px solid ${getStatusColor(donation.status)}`,
                  borderRadius: "8px",
                  backgroundColor: isUrgent ? "#fff5f5" : "#f9f9f9",
                  position: "relative",
                }}
              >
                {/* Status Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    padding: "8px 12px",
                    backgroundColor: getStatusColor(donation.status),
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {getStatusIcon(donation.status)}{" "}
                  {donation.status.toUpperCase()}
                </div>

                {/* Urgency Alert */}
                {isUrgent && (
                  <div
                    style={{
                      marginBottom: "15px",
                      padding: "10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    🚨 URGENT: This donation expires in {timeRemaining} hours!
                  </div>
                )}

                <h3 style={{ marginTop: "0", marginBottom: "15px" }}>
                  {donation.title}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <div>
                    <strong>Food Type:</strong>{" "}
                    {donation.food_type.replace("_", " ")}
                  </div>
                  <div>
                    <strong>Storage:</strong>{" "}
                    {donation.storage.replace("_", " ")}
                  </div>
                  <div>
                    <strong>Time Since Prep:</strong> {donation.time_since_prep}{" "}
                    hours ago
                  </div>
                  <div>
                    <strong>Sealed:</strong> {donation.is_sealed ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Environment:</strong> {donation.environment}
                  </div>
                  <div>
                    <strong>Risk Level:</strong>
                    <span
                      style={{
                        color: getRiskColor(
                          donation.expiryPrediction.riskLevel
                        ),
                        marginLeft: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      {donation.expiryPrediction.riskLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Timing Information */}
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: "white",
                    borderRadius: "6px",
                    marginBottom: "15px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <h4 style={{ margin: "0 0 10px 0" }}>
                    ⏰ Timing Information
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <strong>Posted:</strong>{" "}
                      {new Date(donation.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Claimed:</strong>{" "}
                      {new Date(donation.claimedAt).toLocaleString()}
                    </div>
                    {donation.pickedAt && (
                      <div>
                        <strong>Picked:</strong>{" "}
                        {new Date(donation.pickedAt).toLocaleString()}
                      </div>
                    )}
                    <div>
                      <strong>Time Remaining:</strong>
                      <span
                        style={{
                          color:
                            timeRemaining <= 2
                              ? "red"
                              : timeRemaining <= 6
                              ? "orange"
                              : "green",
                          marginLeft: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {timeRemaining} hours
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>Description:</strong>
                  <p style={{ margin: "5px 0", fontStyle: "italic" }}>
                    {donation.description}
                  </p>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  {donation.status === "claimed" && (
                    <>
                      <button
                        onClick={() =>
                          updateDonationStatus(donation._id, "picked")
                        }
                        disabled={loading}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {loading ? "Updating..." : "✅ Mark as Picked"}
                      </button>
                      <button
                        onClick={() =>
                          updateDonationStatus(donation._id, "expired")
                        }
                        disabled={loading}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        {loading ? "Updating..." : "❌ Mark as Expired"}
                      </button>
                    </>
                  )}

                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: "12px",
                      color: "#6c757d",
                    }}
                  >
                    Location: {donation.location.coordinates.join(", ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignedDonations;
