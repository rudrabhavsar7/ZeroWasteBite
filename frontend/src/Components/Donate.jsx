import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import { toast } from "react-hot-toast";
import useUserStore from "../app/userStore";

const Donate = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = "Donate | ZeroWasteBite";
    return () => {
      document.title = prev;
    };
  }, []);

  const donate = useUserStore((state) => state.donate);

  // Stepper state
  const steps = ["Food", "Storage", "Timing", "Location", "Review"];
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [foodTitle, setFoodTitle] = useState("");
  const [foodType, setFoodType] = useState("");
  const [storage, setStorage] = useState("");
  const [timeSincePrep, setTimeSincePrep] = useState("");
  const [isSealed, setIsSealed] = useState("");
  const [environment, setEnvironment] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [address, setAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [description, setDescription] = useState("");
  const [confidencePercent, setConfidencePercent] = useState(100);

  const foodTypes = [
    {
      id: "cooked_veg",
      name: "Cooked Vegetarian",
      description: "Ready-to-eat vegetarian meals, curries, rice dishes",
    },
    {
      id: "non_veg",
      name: "Non-Vegetarian",
      description: "Cooked meat, chicken, fish dishes",
    },
    {
      id: "packaged",
      name: "Packaged Food",
      description: "Sealed items, snacks, canned goods",
    },
    {
      id: "raw",
      name: "Raw Vegetables/Fruits",
      description: "Fresh produce, vegetables, fruits",
    },
  ];

  // Submit
  const handleFoodDonation = () => {
    if (
      !foodTitle ||
      !foodType ||
      !storage ||
      (!timeSincePrep && timeSincePrep !== 0) ||
      isSealed === "" ||
      !environment ||
      !coordinates.lat ||
      !coordinates.lng
    ) {
      toast.error("Please fill in all required fields for your food donation.");
      return;
    }

    const donationData = {
      title: foodTitle,
      food_type: foodType,
      storage: storage,
      time_since_prep: parseInt(timeSincePrep),
      is_sealed: isSealed,
      environment: environment,
      address: address || undefined,
      location: {
        type: "Point",
        coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
      },
      description: description,
      confidence: Number((confidencePercent / 100).toFixed(2)),
    };

    console.log("Donation Data:", donationData);

    donate(donationData);

    // Reset form
    setFoodTitle("");
    setFoodType("");
    setStorage("");
    setTimeSincePrep("");
    setIsSealed("");
    setEnvironment("");
    setCoordinates({ lat: "", lng: "" });
    setAddress("");
    setDescription("");
    setConfidencePercent(0);
    setCurrentStep(0);

    toast.success("Food donation submitted successfully!");
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please enter coordinates manually."
          );
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  // Geocode a typed address into coordinates using OpenStreetMap Nominatim
  const geocodeAddress = async () => {
    if (!address.trim()) {
      toast.error("Please enter an address to locate.");
      return;
    }
    setGeocodeError("");
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address.trim()
      )}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({ lat: String(lat), lng: String(lon) });
      } else {
        setGeocodeError("No results found for that address.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setGeocodeError("Error looking up address. Please try again.");
    } finally {
      setGeocoding(false);
    }
  };

  // Step validations
  const validateStep = (stepIdx) => {
    switch (stepIdx) {
      case 0:
        if (!foodTitle.trim() || !foodType) {
          toast.error("Please enter a food title and choose a food type.");
          return false;
        }
        return true;
      case 1:
        if (!storage || isSealed === "") {
          toast.error(
            "Please select storage type and whether the food is sealed."
          );
          return false;
        }
        return true;
      case 2:
        if (!timeSincePrep && timeSincePrep !== 0) {
          toast.error("Please provide time since preparation.");
          return false;
        }
        if (Number(timeSincePrep) < 0 || Number(timeSincePrep) > 48) {
          toast.error("Time since preparation must be between 0 and 48 hours.");
          return false;
        }
        if (!environment) {
          toast.error("Please select the environment condition.");
          return false;
        }
        return true;
      case 3:
        if (!coordinates.lat || !coordinates.lng) {
          toast.error(
            "Please set a pickup location using the map or your GPS."
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (validateStep(currentStep))
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-sm font-medium mb-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.011a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 3 13.052 3 10.5 3 8.015 4.79 6 7.125 6 8.47 6 9.695 6.615 10.5 7.672 11.305 6.615 12.53 6 13.875 6 16.21 6 18 8.015 18 10.5c0 2.552-1.688 4.86-3.989 6.997a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.011-.007.003-.003.001a.75.75 0 01-.706 0l-.003-.001z" />
            </svg>
            Donate & help reduce waste
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-content mb-3"
          >
            Donate Food
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            className="max-w-2xl mx-auto text-gray-700"
          >
            Share your surplus meals. Tell us what you have and set a pickup
            location so nearby NGOs or volunteers can collect it.
          </motion.p>
        </div>

        {/* Stepper Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 mb-8">
          <div className="p-6 sm:p-8">
            {/* Stepper header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((label, idx) => (
                  <div
                    key={label}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border transition-all ${
                        idx < currentStep
                          ? "bg-secondary text-primary-content border-secondary"
                          : idx === currentStep
                          ? "bg-secondary/20 text-secondary border-secondary/40"
                          : "bg-white text-gray-500 border-primary-content/20"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        idx === currentStep ? "text-secondary" : "text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1 rounded-full bg-primary-content/10">
                <div
                  className="h-1 rounded-full bg-secondary transition-all"
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="space-y-8">
              {currentStep === 0 && (
                <div className="space-y-8">
                  {/* Food Title */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Food Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Paneer Sabji, Mixed Vegetable Curry"
                      value={foodTitle}
                      onChange={(e) => setFoodTitle(e.target.value)}
                      className="w-full px-5 sm:px-6 py-3 sm:py-4 border-2 border-primary-content/20 rounded-xl focus:ring-4 focus:ring-secondary/40 focus:border-secondary transition-all duration-300 text-lg"
                    />
                  </div>
                  {/* Food Type */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-4">
                      What type of food are you donating? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {foodTypes.map((type) => (
                        <div
                          key={type.id}
                          onClick={() => setFoodType(type.id)}
                          className={`cursor-pointer p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow ${
                            foodType === type.id
                              ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                              : "border-primary-content/20 hover:border-secondary bg-white"
                          }`}
                        >
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">
                              {type.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Storage */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Storage Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setStorage("fridge")}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow text-center ${
                          storage === "fridge"
                            ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                            : "border-primary-content/20 hover:border-secondary bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Refrigerated
                          </h3>
                          <p className="text-sm text-gray-600">
                            Stored in fridge/cooler
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStorage("room_temp")}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow text-center ${
                          storage === "room_temp"
                            ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                            : "border-primary-content/20 hover:border-secondary bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Room Temperature
                          </h3>
                          <p className="text-sm text-gray-600">
                            Stored at room temp
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                  {/* Is Sealed */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Is Food Sealed? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setIsSealed(true)}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow text-center ${
                          isSealed === true
                            ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                            : "border-primary-content/20 hover:border-secondary bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Yes, Sealed
                          </h3>
                          <p className="text-sm text-gray-600">
                            In containers/packaging
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSealed(false)}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow text-center ${
                          isSealed === false
                            ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                            : "border-primary-content/20 hover:border-secondary bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">
                            No, Open
                          </h3>
                          <p className="text-sm text-gray-600">
                            Open/exposed food
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Time Since Preparation */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Time Since Preparation (Hours) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 2 (hours ago)"
                      value={timeSincePrep}
                      onChange={(e) => setTimeSincePrep(e.target.value)}
                      className="w-full px-5 sm:px-6 py-3 sm:py-4 border-2 border-primary-content/20 rounded-xl focus:ring-4 focus:ring-secondary/40 focus:border-secondary transition-all duration-300 text-lg"
                      min="0"
                      max="48"
                    />
                  </div>
                  {/* Environment */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Environment Condition *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setEnvironment("dry")}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow text-center ${
                          environment === "dry"
                            ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                            : "border-primary-content/20 hover:border-secondary bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">Dry</h3>
                          <p className="text-sm text-gray-600">
                            Low humidity environment
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnvironment("humid")}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow text-center ${
                          environment === "humid"
                            ? "border-secondary bg-gradient-to-r from-primary/10 to-secondary/10 shadow"
                            : "border-primary-content/20 hover:border-secondary bg-white"
                        }`}
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-gray-900 mb-1">
                            Humid
                          </h3>
                          <p className="text-sm text-gray-600">
                            High humidity environment
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary-content/10 bg-white/60">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-primary-content">
                          Location
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                          Required
                        </span>
                      </div>
                      <div className="flex flex-row gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Search address (add city & state for accuracy)"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-5 sm:px-6 py-3 sm:py-4 border-2 border-primary-content/20 rounded-xl focus:ring-4 focus:ring-secondary/40 focus:border-secondary transition-all duration-300 text-base"
                        />
                        <button
                          type="button"
                          onClick={geocodeAddress}
                          className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 shadow hover:shadow-md focus:outline-none focus:ring-4 bg-secondary text-primary-content hover:brightness-95 p-3"
                          disabled={geocoding}
                          title="Find on Map"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21c.714-1.143 6-7.2 6-11.25A6 6 0 0 0 6 9.75C6 13.8 11.286 19.857 12 21z"
                            />
                            <circle cx="12" cy="9.75" r="2.25" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 shadow hover:shadow-md focus:outline-none focus:ring-4 bg-secondary text-primary-content hover:brightness-95 p-3"
                          title="Use My Location"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5 0a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                            />
                          </svg>
                        </button>
                      </div>
                      {geocodeError && (
                        <p className="text-sm text-red-600 mt-2">
                          {geocodeError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-primary-content/10 bg-white/60">
                    <div className="p-3 border-b border-primary-content/10">
                      <p className="text-sm font-medium text-primary-content">
                        Map preview
                      </p>
                    </div>
                    <MapContainer
                      center={
                        isFinite(parseFloat(coordinates.lat)) &&
                        isFinite(parseFloat(coordinates.lng))
                          ? [
                              parseFloat(coordinates.lat),
                              parseFloat(coordinates.lng),
                            ]
                          : [20.5937, 78.9629]
                      }
                      zoom={
                        isFinite(parseFloat(coordinates.lat)) &&
                        isFinite(parseFloat(coordinates.lng))
                          ? 13
                          : 4
                      }
                      scrollWheelZoom={false}
                      style={{ height: "260px", width: "100%" }}
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {isFinite(parseFloat(coordinates.lat)) &&
                        isFinite(parseFloat(coordinates.lng)) && (
                          <CircleMarker
                            center={[
                              parseFloat(coordinates.lat),
                              parseFloat(coordinates.lng),
                            ]}
                            radius={10}
                            pathOptions={{
                              color: "#fdbc29",
                              fillColor: "#fdbc29",
                              fillOpacity: 0.25,
                            }}
                          />
                        )}
                    </MapContainer>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  {/* Confidence Slider */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Confidence (0-100) *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={confidencePercent}
                        onChange={(e) =>
                          setConfidencePercent(Number(e.target.value))
                        }
                        className="flex-1 accent-secondary cursor-pointer"
                      />
                      <div className="w-24 text-right">
                        <span className="text-sm font-medium text-primary-content">
                          {confidencePercent}%
                        </span>
                        <div className="text-xs text-gray-600">
                          ({(confidencePercent / 100).toFixed(2)})
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      This indicates how certain you are about the food's safety
                      and description.
                    </p>
                  </div>
                  {/* Description */}
                  <div>
                    <label className="block text-lg font-semibold text-primary-content mb-3">
                      Food Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your food donation (e.g., vegetable curry with rice, fresh apples and oranges...)"
                      rows={4}
                      className="w-full px-5 sm:px-6 py-3 sm:py-4 border-2 border-primary-content/20 rounded-xl focus:ring-4 focus:ring-secondary/40 focus:border-secondary transition-all duration-300 text-lg resize-none"
                    />
                  </div>
                  {/* Review */}
                  <div className="rounded-2xl border border-primary-content/10 bg-white/60 p-6">
                    <h3 className="text-lg font-semibold text-primary-content mb-4">
                      Review your details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-primary-content">
                          Title:
                        </span>{" "}
                        <span className="text-gray-700">
                          {foodTitle || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-content">
                          Type:
                        </span>{" "}
                        <span className="text-gray-700">
                          {foodTypes.find((t) => t.id === foodType)?.name ||
                            "-"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-content">
                          Storage:
                        </span>{" "}
                        <span className="text-gray-700">{storage || "-"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-content">
                          Sealed:
                        </span>{" "}
                        <span className="text-gray-700">
                          {isSealed === "" ? "-" : isSealed ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-content">
                          Time since prep (h):
                        </span>{" "}
                        <span className="text-gray-700">
                          {timeSincePrep || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-primary-content">
                          Environment:
                        </span>{" "}
                        <span className="text-gray-700">
                          {environment || "-"}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium text-primary-content">
                          Address:
                        </span>{" "}
                        <span className="text-gray-700">{address || "-"}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium text-primary-content">
                          Coordinates:
                        </span>{" "}
                        <span className="text-gray-700">
                          {coordinates.lat && coordinates.lng
                            ? `${coordinates.lat}, ${coordinates.lng}`
                            : "-"}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="font-medium text-primary-content">
                          Confidence:
                        </span>{" "}
                        <span className="text-gray-700">
                          {confidencePercent}% (
                          {(confidencePercent / 100).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold transition ${
                  currentStep === 0
                    ? "opacity-50 cursor-not-allowed border-primary-content/10 text-gray-400"
                    : "border-secondary text-secondary hover:bg-secondary/10"
                }`}
              >
                Back
              </button>
              {currentStep < steps.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goNext}
                  disabled={geocoding}
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all shadow focus:outline-none focus:ring-4 bg-secondary text-primary-content hover:brightness-95 px-8 py-3"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFoodDonation}
                  disabled={geocoding}
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all shadow focus:outline-none focus:ring-4 bg-secondary text-primary-content hover:brightness-95 px-8 py-3"
                >
                  Submit Donation
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
