import React, { useState, useContext } from "react";
import Link from "next/link";
import Layout from "../layouts/Layout";
import { forgotPassword } from "../services/userService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

function ForgotPassword({ host }) {
	const router = useRouter();
	const [inputs, setInputs] = useState({
		email: '',
		username: ''
	});

	const handleChange = (e) => {
		var name = e.currentTarget.name;
		var value = e.currentTarget.value;
		setInputs(values => ({ ...values, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Validation
		if (!inputs.email || !inputs.username) {
			toast.error('Please fill in all fields');
			return;
		}
		
		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(inputs.email)) {
			toast.error('Please enter a valid email address');
			return;
		}
		
		// Phone number validation (basic)
		if (inputs.username.length < 10) {
			toast.error('Please enter a valid phone number');
			return;
		}
		
		try {
			let response = await forgotPassword(inputs);
			toast(response.data.appMessage);
			if (response.data.appStatus) {
				setInputs({
					email: '',
					username: ''
				});
				// Navigate to reset password page with tokenId
				router.push({
					pathname: `/reset-password/${encodeURIComponent(inputs.email)}`,
					query: { 
						email: inputs.email,
						tokenId: response.data.appData.tokenId 
					},
				});
			}
		} catch (error) {
			toast.error('An error occurred. Please try again.');
		}
	};

	return (
		<>
			<ToastContainer />
			<Layout title='Forgot Password'>
				<div className='container'>
					<div className='row'>
						<div className='col-12 col-md-12'>
							<div className='sign-in-section'>
								<div className='sign-up__card'>
									<div className='sign-up__card-body'>
										<div className='mt-2'>
											<p className='login-em'>Forgot Password</p>
										</div>
										<form className='mt-4' onSubmit={handleSubmit}>
											<div className='myform-group'>
												<div className='col-12'>
													<input className='form-control myform-control' type='text' name='username' value={inputs.username} onChange={handleChange} placeholder='Enter Phone Number' />
												</div>
											</div>
											<div className='myform-group'>
												<div className='col-12'>
													<input className='form-control myform-control' type='email' name='email' value={inputs.email} onChange={handleChange} placeholder='Enter Email' />
												</div>
											</div>
											<div className='myform-group mt-4'>
												<div className='col-12'>
													<button type="submit" className='btn my-btn -red'>Send Request</button>
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

export default ForgotPassword;

export async function getServerSideProps(context) {
	const { req, query, res, asPath, pathname } = context;
	if (req) {
		let host = req.headers.host // will give you localhost:3000
		return {
			props: {
				host: host
			}
		};
	}
}
