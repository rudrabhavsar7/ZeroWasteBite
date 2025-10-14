import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Navbar from "./Components/Navbar";
import "@fontsource-variable/montserrat";
import Login from "./Components/Login";
import Register from "./Components/Register";
import { Toaster } from "react-hot-toast";
import Donate from "./Components/Donate";
import DonationHistory from "./Components/DonationHistory";
import VolunteerDashboard from "./Components/Volunteer/VolunteerDashboard";
import VolunteerProfile from "./Components/Volunteer/VolunteerProfile";
import AssignedDonations from "./Components/Volunteer/AssignedDonations";
import AvailableDonations from "./Components/Volunteer/AvailableDonations";

function App() {
  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        {/* User routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/donations" element={<DonationHistory />} />

        {/* Volunteer routes */}
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/volunteer/profile" element={<VolunteerProfile />} />
        <Route path="/volunteer/assigned-donations" element={<AssignedDonations />} />
        <Route path="/volunteer/available-donations" element={<AvailableDonations />} />
      </Routes>
    </>
  );
}

export default App;
