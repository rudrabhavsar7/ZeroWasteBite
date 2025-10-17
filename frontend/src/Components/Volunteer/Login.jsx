import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import { IconMail, IconLock, IconEye, IconEyeOff, IconArrowRight } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import useVolunteerStore from '../../app/volunteerStore';
import toast from 'react-hot-toast';

const VolunteerLogin = () => {
	const navigate = useNavigate();
	const login = useVolunteerStore((s) => s.login);
	const setLoading = useVolunteerStore((s) => s.setLoading);
	const loading = useVolunteerStore((s) => s.loading);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		const prev = document.title;
		document.title = 'Volunteer Login | ZeroWasteBite';
		return () => { document.title = prev; };
	}, []);

	const validate = () => {
		if (!email || !password) {
			setError('Please enter email and password');
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
			const v = await login(email, password);
            console.log("Volunteer logged in:", v);
			if (!v) throw new Error('Login failed');
			toast.success('Volunteer login successful!');
			navigate('/volunteer');
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.message || 'Login failed. Try again.');
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
				className="w-full max-w-md rounded-2xl border border-white/30 shadow-xl bg-white/70 backdrop-blur-sm"
			>
				<div className="p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-primary-content">Volunteer Sign in</h1>
						<p className="text-sm text-gray-600 mt-1">Access your volunteer dashboard</p>
					</div>

					<form onSubmit={onSubmit} className="space-y-5">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-primary-content mb-1">Email</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
									<IconMail size={20} />
								</span>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
									placeholder="you@example.com"
									autoComplete="email"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-primary-content mb-1">Password</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60">
									<IconLock size={20} />
								</span>
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full rounded-lg border border-primary-content/20 focus:border-secondary focus:ring-2 focus:ring-secondary/40 outline-none px-10 py-3 text-primary-content placeholder:text-gray-400"
									placeholder="••••••••"
									autoComplete="current-password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((s) => !s)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-content/60 hover:text-primary-content"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
								</button>
							</div>
						</div>

						{error && (
							<div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
								{error}
							</div>
						)}

						<motion.button
							type="submit"
							whileHover={{ scale: loading ? 1 : 1.02 }}
							whileTap={{ scale: loading ? 1 : 0.98 }}
							disabled={loading}
							className="w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 shadow focus:outline-none focus:ring-4 bg-secondary text-primary-content hover:brightness-95 py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl"
						>
							<span>{loading ? 'Signing in…' : 'Sign In'}</span>
							<IconArrowRight size={18} />
						</motion.button>
					</form>

					<p className="mt-6 text-center text-sm text-gray-600">
						New volunteer?{' '}
						<Link to="/volunteer/register" className="text-secondary hover:text-secondary-dark font-semibold">Create an account</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default VolunteerLogin;
