import React, { useState } from "react";

const User = () => {
  const [foodTitle, setFoodTitle] = useState("");
  const [activeTab, setActiveTab] = useState("donate");
  const [foodType, setFoodType] = useState("");
  const [storage, setStorage] = useState("");
  const [timeSincePrep, setTimeSincePrep] = useState("");
  const [isSealed, setIsSealed] = useState("");
  const [environment, setEnvironment] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [description, setDescription] = useState("");
  // Removed unused userLocation state

  // Mock food donation history data

  const [donationHistory] = useState([
    {
      title: "Paneer Sabji",
      description: "Delicious paneer curry with vegetables",
      food_type: "cooked_veg",
      status: "available",
    },
    {
      title: "Mixed Vegetable Curry",
      description: "Fresh mixed vegetables cooked with spices",
      food_type: "cooked_veg",
      status: "picked",
    },
    {
      title: "Fresh Fruits",
      description: "Assorted seasonal fruits",
      food_type: "raw",
      status: "claimed",
    },
    {
      title: "Packaged Snacks",
      description: "Various packaged snacks and biscuits",
      food_type: "packaged",
      status: "available",
    },
    {
      title: "Chicken Curry",
      description: "Spicy chicken curry with rice",
      food_type: "non_veg",
      status: "expired",
    },
  ]);

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

  const handleFoodDonation = (e) => {
    e.preventDefault();
    if (
      !foodTitle ||
      !foodType ||
      !storage ||
      !timeSincePrep ||
      isSealed === "" ||
      !environment ||
      !coordinates.lat ||
      !coordinates.lng
    ) {
      alert("Please fill in all required fields for your food donation.");
      return;
    }

    // Here you would typically send the data to your backend
    const donationData = {
      title: foodTitle,
      food_type: foodType,
      storage: storage,
      time_since_prep: parseInt(timeSincePrep),
      is_sealed: isSealed,
      environment: environment,
      location: {
        type: "Point",
        coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
      },
      description: description,
    };

    console.log("Donation Data:", donationData);

    // Reset form
    setFoodTitle("");
    setFoodType("");
    setStorage("");
    setTimeSincePrep("");
    setIsSealed("");
    setEnvironment("");
    setCoordinates({ lat: "", lng: "" });
    setDescription("");

    alert("Food donation submitted successfully!");
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
          alert(
            "Unable to get your location. Please enter coordinates manually."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Donate Food & Make a Difference
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab("donate")}
                className={`py-6 px-4 font-semibold text-sm transition-all duration-300 ${
                  activeTab === "donate"
                    ? "text-green-600 border-b-2 border-green-500"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
                }`}
              >
                Donate Food
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-6 px-4 font-semibold text-sm transition-all duration-300 ${
                  activeTab === "history"
                    ? "text-green-600 border-b-2 border-green-500"
                    : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
                }`}
              >
                Donation History
              </button>
            </nav>
          </div>

          {/* Food Donation Tab */}
          {activeTab === "donate" && (
            <div className="p-8">
              <form onSubmit={handleFoodDonation} className="space-y-8">
                {/* Food Title */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Food Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Paneer Sabji, Mixed Vegetable Curry"
                    value={foodTitle}
                    onChange={(e) => setFoodTitle(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-lg"
                    required
                  />
                </div>

                {/* Food Type Selection */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    What type of food are you donating? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {foodTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setFoodType(type.id)}
                        className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                          foodType === type.id
                            ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg scale-105"
                            : "border-gray-200 hover:border-green-300 bg-white"
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

                {/* Storage Type */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Storage Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setStorage("fridge")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        storage === "fridge"
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-green-300 bg-white"
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
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        storage === "room_temp"
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-green-300 bg-white"
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

                {/* Time Since Preparation */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Time Since Preparation (Hours) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2 (hours ago)"
                    value={timeSincePrep}
                    onChange={(e) => setTimeSincePrep(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-lg"
                    min="0"
                    max="48"
                    required
                  />
                </div>

                {/* Is Sealed */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Is Food Sealed? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setIsSealed(true)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSealed === true
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-green-300 bg-white"
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
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSealed === false
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-green-300 bg-white"
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

                {/* Environment */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Environment Condition *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setEnvironment("dry")}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        environment === "dry"
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-green-300 bg-white"
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
                      className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        environment === "humid"
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-green-300 bg-white"
                      }`}
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-gray-900 mb-1">Humid</h3>
                        <p className="text-sm text-gray-600">
                          High humidity environment
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Location Coordinates */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Location Coordinates *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude (e.g., 40.7128)"
                      value={coordinates.lat}
                      onChange={(e) =>
                        setCoordinates({ ...coordinates, lat: e.target.value })
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-lg"
                      required
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude (e.g., -74.0060)"
                      value={coordinates.lng}
                      onChange={(e) =>
                        setCoordinates({ ...coordinates, lng: e.target.value })
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-lg"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full md:w-auto bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                  >
                    📍 Get My Current Location
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your exact coordinates or use the button to get
                    current location
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Food Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your food donation (e.g., vegetable curry with rice, fresh apples and oranges...)"
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-lg resize-none"
                  />
                </div>

                {/* Donation Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 px-8 rounded-xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Donate Food
                </button>
              </form>
            </div>
          )}
          {/* History Tab */}
          {activeTab === "history" && (
            <div className="p-8">
              {/* Donation History List */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Recent Food Donations
                </h3>
                {donationHistory.map((donation, index) => (
                  <div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm border-2 border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <h4 className="text-xl font-bold text-gray-900">
                            {donation.title}
                          </h4>
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              donation.status === "picked"
                                ? "bg-green-100 text-green-800 border-2 border-green-200"
                                : donation.status === "claimed"
                                ? "bg-blue-100 text-blue-800 border-2 border-blue-200"
                                : donation.status === "available"
                                ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                                : "bg-red-100 text-red-800 border-2 border-red-200"
                            }`}
                          >
                            {donation.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                          Food Type:{" "}
                          {donation.food_type.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{donation.description}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
