import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { IconUser, IconMail, IconLock, IconArrowRight, IconChecks } from '@tabler/icons-react';
import useVolunteerStore from '../../app/volunteerStore';
import toast from 'react-hot-toast';

const VolunteerRegister = () => {
	const navigate = useNavigate();
	const loading = useVolunteerStore((s) => s.loading);
	const setLoading = useVolunteerStore((s) => s.setLoading);
	const register = useVolunteerStore((s) => s.register);

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [availability, setAvailability] = useState('part-time');
	const [vehicleType, setVehicleType] = useState('bike');
	const [serviceRadius, setServiceRadius] = useState(10);
		const [coords, setCoords] = useState({ lat: '', lon: '' });
		const [address, setAddress] = useState('');
		const [geoLoading, setGeoLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const prev = document.title;
		document.title = 'Volunteer Register | ZeroWasteBite';
		return () => { document.title = prev; };
	}, []);

		// Reverse geocode using OpenStreetMap Nominatim
		const reverseGeocode = async (lat, lon) => {
			const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=14&addressdetails=1`;
			const resp = await fetch(url, { headers: { Accept: 'application/json' } });
			if (!resp.ok) throw new Error('Reverse geocode failed');
			const data = await resp.json();
            console.log("Reverse geocode data:", data);
			const a = data.address || {};
			const parts = [a.road, a.suburb || a.neighbourhood, a.city || a.town || a.village].filter(Boolean).slice(0, 3);
			const concise = parts.join(', ');
			return concise || data.display_name || 'Unknown location';
		};

		const getLocation = () => {
			if (!navigator.geolocation) {
				toast.error('Geolocation not supported');
				return;
			}
			setGeoLoading(true);
			navigator.geolocation.getCurrentPosition(
				async (pos) => {
					const lat = pos.coords.latitude;
					const lon = pos.coords.longitude;
					setCoords({ lat: lat.toString(), lon: lon.toString() });
					try {
						const name = await reverseGeocode(lat, lon);
						setAddress(name);
					} catch (e) {
						console.error(e);
						setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
					} finally {
						setGeoLoading(false);
					}
				},
				(err) => {
					console.error(err);
					toast.error('Unable to get your location');
					setGeoLoading(false);
				}
			);
		};

	const validate = () => {
		if (!name || !email || !phone || !password || !confirm) {
			setError('Please fill all required fields');
			return false;
		}
		if (password !== confirm) {
			setError('Passwords do not match');
			return false;
		}
		const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		if (!emailOk) {
			setError('Enter a valid email address');
			return false;
		}
		setError('');
		return true;
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;
		setLoading(true);
		try {
			const coordinates = [coords.lon ? parseFloat(coords.lon) : 0, coords.lat ? parseFloat(coords.lat) : 0];
			await register({ name, email, phone, password, coordinates, availability, vehicleType, serviceRadius: Number(serviceRadius) });
			toast.success('Volunteer account created!');
			navigate('/volunteer');
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.message || 'Registration failed. Try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 pt-28 pb-10 flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 20, filter: 'blur(6px)', scale: 0.98 }}
				animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
				className="w-full max-w-3xl rounded-2xl border border-white/30 shadow-xl bg-white/70 backdrop-blur-sm"
			>
				<div className="p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-primary-content">Create your <span className="text-secondary font-semibold">Volunteer</span> account</h1>
						<p className="text-sm text-gray-600 mt-1">Join as a volunteer and help deliver meals.</p>
					</div>

					<form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="md:col-span-1">
							<label htmlFor="name" className="block text-sm font-medium text-primary-content mb-1">Full name</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60"><IconUser size={20} /></span>
								<input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400" placeholder="Your Name" />
							</div>
						</div>

						<div className="md:col-span-1">
							<label htmlFor="email" className="block text-sm font-medium text-primary-content mb-1">Email</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60"><IconMail size={20} /></span>
								<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400" placeholder="you@example.com" />
							</div>
						</div>

						<div className="md:col-span-1">
							<label htmlFor="phone" className="block text-sm font-medium text-primary-content mb-1">Phone number</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60"><IconUser size={20} /></span>
								<input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400" placeholder="1234567890" />
							</div>
						</div>

						<div className="md:col-span-1">
							<label htmlFor="password" className="block text-sm font-medium text-primary-content mb-1">Password</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60"><IconLock size={20} /></span>
								<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400" placeholder="••••••••" />
							</div>
						</div>

						<div className="md:col-span-1">
							<label htmlFor="confirm" className="block text-sm font-medium text-primary-content mb-1">Confirm Password</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60"><IconLock size={20} /></span>
								<input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400" placeholder="••••••••" />
							</div>
						</div>

						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-primary-content mb-1">Availability</label>
							<select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-4 py-3 text-primary-content">
								<option value="part-time">Part-time</option>
								<option value="full-time">Full-time</option>
							</select>
						</div>

						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-primary-content mb-1">Vehicle Type</label>
							<select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-4 py-3 text-primary-content">
								<option value="bike">Bike</option>
								<option value="car">Car</option>
								<option value="van">Van</option>
							</select>
						</div>

						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-primary-content mb-1">Service Radius (km)</label>
							<input type="number" min="1" value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)} className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-4 py-3 text-primary-content" />
						</div>

									<div className="md:col-span-1">
							<label className="block text-sm font-medium text-primary-content mb-1">Location</label>
							<div className="flex gap-2">
											<button type="button" onClick={getLocation} disabled={geoLoading} className="inline-flex items-center rounded-lg bg-secondary text-primary-content px-4 py-2 font-semibold hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed">
												{geoLoading ? 'Detecting…' : 'Use my GPS'}
											</button>
											<input type="text" readOnly value={address || (coords.lat && coords.lon ? `${coords.lat}, ${coords.lon}` : '')} className="flex-1 rounded-lg border border-primary-content/20 px-3 py-2 text-sm text-primary-content placeholder:text-gray-400" placeholder="Your location will appear here" />
							</div>
							<p className="text-xs text-gray-500 mt-1">We’ll store approximate coordinates to help match nearby donations.</p>
						</div>

						{error && (
							<div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
						)}

						<div className="md:col-span-2 flex items-center justify-between mt-2">
							<motion.button type="submit" whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-secondary text-primary-content font-semibold px-6 py-3 shadow hover:shadow-md transition-shadow disabled:opacity-60 disabled:cursor-not-allowed">
								<span>{loading ? 'Creating Account…' : 'Create Account'}</span>
								<IconArrowRight size={18} />
							</motion.button>
							<div className="flex items-center gap-2 text-sm text-primary-content/70">
								<IconChecks size={18} className="text-secondary" />
								<span>Fast signup. No spam.</span>
							</div>
						</div>
					</form>

					<p className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link to="/volunteer/login" className="text-secondary hover:text-secondary-dark font-semibold">Sign in</Link></p>
				</div>
			</motion.div>
		</div>
	);
};

export default VolunteerRegister;
