import React, { useState } from "react";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [userType, setUserType] = useState("individual");

  const userTypeOptions = [
    "individual",
    "restaurant",
    "grocery_store",
    "caterer",
    "other",
  ];

  const handleLocationChange = (field, value) => {
    setLocation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
      phone,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(location.longitude),
          parseFloat(location.latitude),
        ],
      },
      userType,
    };

    console.log("User data:", userData);
    // Add your API call here
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <div className="location-inputs">
            <input
              type="number"
              step="any"
              value={location.latitude}
              onChange={(e) => handleLocationChange("latitude", e.target.value)}
              placeholder="Latitude"
              required
            />
            <input
              type="number"
              step="any"
              value={location.longitude}
              onChange={(e) =>
                handleLocationChange("longitude", e.target.value)
              }
              placeholder="Longitude"
              required
            />
            <button type="button" onClick={getCurrentLocation}>
              Get Current Location
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="userType">User Type:</label>
          <select
            id="userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            {userTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
