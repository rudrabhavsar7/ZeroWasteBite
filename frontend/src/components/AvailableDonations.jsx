import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Add CSS animation for urgent donations
const urgentPulseStyle = `
  @keyframes pulse {
    0% { box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3); }
    50% { box-shadow: 0 6px 20px rgba(220, 53, 69, 0.6); }
    100% { box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3); }
  }
`;

const AvailableDonations = () => {
  const navigate = useNavigate();

  // Inject the CSS animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = urgentPulseStyle;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [volunteer, setVolunteer] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Dummy volunteer data for verification
    const dummyVolunteer = {
      _id: "volunteer123",
      userId: "vol123",
      availability: "full-time",
      vehicleType: "car",
      serviceRadius: 15,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      isVerified: true,
      assignedDonations: ["donation1", "donation2"],
    };

    const dummyAvailableDonations = [
      {
        _id: "donation1",
        title: "Fresh Vegetables",
        food_type: "raw",
        storage: "fridge",
        time_since_prep: 2,
        is_sealed: true,
        environment: "dry",
        location: { coordinates: [77.6026, 12.9698] },
        expiryPrediction: {
          safeForHours: 24,
          confidence: 0.85,
          riskLevel: "low",
        },
        description: "Fresh vegetables from restaurant surplus",
        status: "available",
        createdAt: "2024-01-15T08:00:00Z",
      },
      {
        _id: "donation2",
        title: "Cooked Rice and Curry",
        food_type: "cooked_veg",
        storage: "room_temp",
        time_since_prep: 4,
        is_sealed: false,
        environment: "humid",
        location: { coordinates: [77.5876, 12.9716] },
        expiryPrediction: {
          safeForHours: 6,
          confidence: 0.75,
          riskLevel: "medium",
        },
        description: "Leftover food from event",
        status: "available",
        createdAt: "2024-01-15T06:00:00Z",
      },
      {
        _id: "donation4",
        title: "Bread and Pastries",
        food_type: "packaged",
        storage: "room_temp",
        time_since_prep: 8,
        is_sealed: true,
        environment: "dry",
        location: { coordinates: [77.5946, 12.98] },
        expiryPrediction: {
          safeForHours: 12,
          confidence: 0.9,
          riskLevel: "low",
        },
        description: "Unsold bakery items",
        status: "available",
        createdAt: "2024-01-15T04:00:00Z",
      },
      {
        _id: "donation5",
        title: "Chicken Curry - Urgent",
        food_type: "non_veg",
        storage: "room_temp",
        time_since_prep: 6,
        is_sealed: false,
        environment: "humid",
        location: { coordinates: [77.58, 12.95] },
        expiryPrediction: {
          safeForHours: 2,
          confidence: 0.95,
          riskLevel: "high",
        },
        description: "Non-veg food that needs immediate pickup",
        status: "available",
        createdAt: "2024-01-15T02:00:00Z",
      },
      {
        _id: "donation6",
        title: "Seafood Platter - EXTREMELY URGENT",
        food_type: "non_veg",
        storage: "room_temp",
        time_since_prep: 8,
        is_sealed: false,
        environment: "humid",
        location: { coordinates: [77.5946, 12.9716] },
        expiryPrediction: {
          safeForHours: 1,
          confidence: 0.98,
          riskLevel: "high",
        },
        description:
          "Seafood that will expire in 1 hour - IMMEDIATE PICKUP REQUIRED",
        status: "available",
        createdAt: "2024-01-15T01:00:00Z",
      },
      {
        _id: "donation7",
        title: "Dairy Products",
        food_type: "packaged",
        storage: "fridge",
        time_since_prep: 1,
        is_sealed: true,
        environment: "dry",
        location: { coordinates: [77.5946, 12.98] },
        expiryPrediction: {
          safeForHours: 36,
          confidence: 0.92,
          riskLevel: "low",
        },
        description: "Fresh dairy products",
        status: "available",
        createdAt: "2024-01-15T09:00:00Z",
      },
    ];

    setVolunteer(dummyVolunteer);
    setAvailableDonations(dummyAvailableDonations);
  }, []);

  const claimDonation = async (donationId) => {
    setLoading(true);
    setError("");
    try {
      // Simulate API call to claim donation
      console.log("Claiming donation:", donationId);

      // Remove claimed donation from available list
      setAvailableDonations((prev) => prev.filter((d) => d._id !== donationId));

      // Show success message
      alert("Donation claimed successfully!");
    } catch (err) {
      setError("Failed to claim donation: " + err.message);
    } finally {
      setLoading(false);
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

  const getTimeUrgency = (safeForHours) => {
    if (safeForHours <= 2)
      return { color: "red", text: "🚨 URGENT", priority: 1 };
    if (safeForHours <= 6)
      return { color: "orange", text: "⚠️ Soon", priority: 2 };
    return { color: "green", text: "✓ Stable", priority: 3 };
  };

  // Sort donations by urgency (most urgent first)
  const sortedDonations = [...availableDonations].sort((a, b) => {
    const urgencyA = getTimeUrgency(a.expiryPrediction.safeForHours);
    const urgencyB = getTimeUrgency(b.expiryPrediction.safeForHours);

    // First sort by urgency priority (1 = most urgent)
    if (urgencyA.priority !== urgencyB.priority) {
      return urgencyA.priority - urgencyB.priority;
    }

    // If same urgency, sort by safe hours (least hours first)
    return a.expiryPrediction.safeForHours - b.expiryPrediction.safeForHours;
  });

  return (
    <div
      className="available-donations"
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
        <h1>Available Donations in Your Area</h1>
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

      {/* Urgent Donations Alert */}
      {sortedDonations.some(
        (d) => getTimeUrgency(d.expiryPrediction.safeForHours).priority === 1
      ) && (
        <div
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "bold",
            animation: "pulse 2s infinite",
          }}
        >
          🚨 URGENT:{" "}
          {
            sortedDonations.filter(
              (d) =>
                getTimeUrgency(d.expiryPrediction.safeForHours).priority === 1
            ).length
          }{" "}
          donation(s) need immediate pickup (expires in ≤2 hours)!
        </div>
      )}

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

      {!volunteer?.isVerified && (
        <div
          style={{
            color: "orange",
            marginBottom: "15px",
            padding: "15px",
            backgroundColor: "#fff3cd",
            borderRadius: "4px",
            border: "1px solid #ffeaa7",
          }}
        >
          <strong>⚠️ Verification Required:</strong> You need to be verified to
          claim donations. Please contact the administrator.
        </div>
      )}

      {/* Service Area Info */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#e8f4f8",
          borderRadius: "6px",
          border: "1px solid #bee5eb",
        }}
      >
        <h3>Your Service Area</h3>
        <p>
          <strong>Service Radius:</strong> {volunteer?.serviceRadius} km
        </p>
        <p>
          <strong>Your Location:</strong>{" "}
          {volunteer?.location?.coordinates?.join(", ")}
        </p>
        <p>
          <strong>Vehicle:</strong> {volunteer?.vehicleType}
        </p>
      </div>

      {availableDonations.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3>No Donations Available</h3>
          <p>
            There are currently no donations available in your service area.
          </p>
          <p>
            Please check back later or increase your service radius in your
            profile settings.
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "15px" }}>
            <h3>
              Found {availableDonations.length} donations within{" "}
              {volunteer?.serviceRadius} km
            </h3>
            <p style={{ color: "#6c757d", fontSize: "14px", marginTop: "5px" }}>
              🚨 Urgent donations are shown first
            </p>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            {sortedDonations.map((donation) => {
              const urgency = getTimeUrgency(
                donation.expiryPrediction.safeForHours
              );
              return (
                <div
                  key={donation._id}
                  style={{
                    padding: "20px",
                    border:
                      urgency.priority === 1
                        ? `3px solid #dc3545`
                        : `2px solid ${getRiskColor(
                            donation.expiryPrediction.riskLevel
                          )}`,
                    borderRadius: "8px",
                    backgroundColor:
                      urgency.priority === 1
                        ? "#ffebee"
                        : donation.expiryPrediction.riskLevel === "high"
                        ? "#fff5f5"
                        : "#f9f9f9",
                    position: "relative",
                    boxShadow:
                      urgency.priority === 1
                        ? "0 4px 15px rgba(220, 53, 69, 0.3)"
                        : "none",
                    animation:
                      urgency.priority === 1 ? "pulse 2s infinite" : "none",
                  }}
                >
                  {/* Urgency Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      padding: "5px 10px",
                      backgroundColor: urgency.color,
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {urgency.text}
                  </div>

                  <h3 style={{ marginTop: "0", marginBottom: "15px" }}>
                    {donation.title}
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
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

                  {/* ML Predictions */}
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
                      🤖 AI Food Safety Analysis
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <strong>Safe For:</strong>
                        <span
                          style={{
                            color: urgency.color,
                            marginLeft: "5px",
                            fontWeight: "bold",
                          }}
                        >
                          {donation.expiryPrediction.safeForHours} hours
                        </span>
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

                  <div style={{ marginBottom: "15px" }}>
                    <strong>Description:</strong>
                    <p style={{ margin: "5px 0", fontStyle: "italic" }}>
                      {donation.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => claimDonation(donation._id)}
                      disabled={loading || !volunteer?.isVerified}
                      style={{
                        padding: "12px 24px",
                        backgroundColor: volunteer?.isVerified
                          ? urgency.priority === 1
                            ? "#b71c1c"
                            : donation.expiryPrediction.riskLevel === "high"
                            ? "#dc3545"
                            : "#007bff"
                          : "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: volunteer?.isVerified
                          ? "pointer"
                          : "not-allowed",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      {loading
                        ? "Claiming..."
                        : urgency.priority === 1
                        ? "🚨 CLAIM IMMEDIATELY"
                        : donation.expiryPrediction.riskLevel === "high"
                        ? "🚨 CLAIM URGENT"
                        : "Claim Donation"}
                    </button>

                    <div style={{ fontSize: "12px", color: "#6c757d" }}>
                      Distance: ~{Math.round(Math.random() * 10 + 1)} km
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AvailableDonations;
