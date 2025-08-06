import React, { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "../../layouts/Layout";
import { resetPassword } from "../../services/userService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";


function ResetPassword() {
	const router = useRouter();
	const query = router.query;
	const [inputs, setInputs] = useState({
		email: '',
		tokenId: '',
		otp: '',
		password: '',
		confirmPassword: ''
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (query.email && query.tokenId) {
			setInputs(prev => ({
				...prev,
				email: query.email,
				tokenId: query.tokenId
			}));
		}
	}, [query]);

	// Countdown timer for resend OTP
	useEffect(() => {
		let timer;
		if (countdown > 0) {
			timer = setTimeout(() => setCountdown(countdown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [countdown]);

	const handleResendOTP = async () => {
		if (countdown > 0) return;
		
		setResendLoading(true);
		try {
			// You can implement a resend OTP API endpoint here
			// For now, we'll just show a message
			toast.info('Please use the original code sent to your email. If you need a new code, please go back to the forgot password page.');
			setCountdown(60); // 60 seconds cooldown
		} catch (error) {
			toast.error('Failed to resend code');
		} finally {
			setResendLoading(false);
		}
	};

	const handleChange = (e) => {
		var name = e.currentTarget.name;
		var value = e.currentTarget.value;
		
		// For OTP field, only allow numbers
		if (name === 'otp') {
			value = value.replace(/[^0-9]/g, '');
		}
		
		setInputs(values => ({ ...values, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Validation
		if (!inputs.otp || !inputs.password || !inputs.confirmPassword) {
			toast.error('Please fill in all fields');
			return;
		}
		
		// OTP validation
		if (inputs.otp.length !== 6 || !/^\d{6}$/.test(inputs.otp)) {
			toast.error('Please enter a valid 6-digit code');
			return;
		}
		
		if (inputs.password !== inputs.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		
		if (inputs.password.length < 6) {
			toast.error('Password must be at least 6 characters long');
			return;
		}

		setLoading(true);
		try {
			let response = await resetPassword({
				tokenId: inputs.tokenId,
				otp: inputs.otp,
				password: inputs.password
			});
			toast(response.data.appMessage);
			if (response.data.appStatus) {
				router.push('/login');
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<ToastContainer />
			<Layout title='Reset Password'>
				<div className='container'>
					<div className='row'>
						<div className='col-12 col-md-12'>
							<div className='sign-in-section'>
								<div className='sign-up__card'>
									<div className='sign-up__card-body'>
										<div className='mt-2'>
											<p className='login-em'>Reset Password</p>
											<p className="alert alert-info mt-3 mb-2 text-center">
												A 6-digit password reset code has been sent to your email address<br />
												<i><b>&quot;{inputs.email}&quot;</b></i><br />
												Please check your email and enter the code below.
											</p>
										</div>
										<form className='mt-4' onSubmit={handleSubmit}>
											<div className='myform-group'>
												<div className='col-12'>
													<input 
														className='form-control myform-control' 
														type='text' 
														name='otp' 
														value={inputs.otp} 
														onChange={handleChange} 
														placeholder='Enter 6-digit code' 
														maxLength="6"
														pattern="[0-9]{6}"
													/>
												</div>
												<div className='col-12 mt-2 text-center'>
													<button 
														type="button" 
														className='btn btn-link text-primary' 
														onClick={handleResendOTP}
														disabled={countdown > 0 || resendLoading}
													>
														{resendLoading ? 'Sending...' : 
															countdown > 0 ? `Resend in ${countdown}s` : 
															'Resend Code'}
													</button>
												</div>
											</div>
											<div className='myform-group'>
												<div className='col-12 position-relative'>
													<input 
														className='form-control myform-control' 
														style={{ paddingRight: '35px' }} 
														type={showPassword ? 'text' : 'password'} 
														name='password' 
														value={inputs.password} 
														onChange={handleChange} 
														placeholder='Enter New Password' 
													/>
													{showPassword ? 
														<i className="fa fa-eye" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(false)}></i> :
														<i className="fa fa-eye-slash" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(true)}></i>
													}
												</div>
											</div>
											<div className='myform-group'>
												<div className='col-12 position-relative'>
													<input 
														className='form-control myform-control' 
														style={{ paddingRight: '35px' }} 
														type={showConfirmPassword ? 'text' : 'password'} 
														name='confirmPassword' 
														value={inputs.confirmPassword} 
														onChange={handleChange} 
														placeholder='Confirm New Password' 
													/>
													{showConfirmPassword ? 
														<i className="fa fa-eye" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowConfirmPassword(false)}></i> :
														<i className="fa fa-eye-slash" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowConfirmPassword(true)}></i>
													}
												</div>
											</div>
											<div className='myform-group mt-4'>
												<div className='col-12'>
													<button 
														type="submit" 
														className='btn my-btn -red' 
														disabled={loading}
													>
														{loading ? 'Resetting Password...' : 'Reset Password'}
													</button>
												</div>
											</div>
											<div className='row mt-4 text-center'>
												<div className='col-12 mt-2'>
													<Link href='/login' className="text-primary">
														Back to Login
													</Link>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Layout>
		</>
	);
}

export default ResetPassword;
