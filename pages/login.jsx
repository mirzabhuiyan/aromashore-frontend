import React, { useState, useContext } from "react";
import Link from "next/link";
import Layout from "../layouts/Layout";
import { loginValidate, validateProperty } from "../models/user";
import { login } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppStore } from "../store/AppStore";

function Login() {
	const { setUSER } = useContext(AppStore);
	const [user, setUserForm] = useState({
		username: "",
		password: "",
		rememberMe: false
	});
	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	// 2FA: Uncomment to enable 2-factor authentication
	/*
	const [show2FA, setShow2FA] = useState(false);
	const [twofaCode, setTwofaCode] = useState('');
	const [twofaUsername, setTwofaUsername] = useState('');
	*/

	const handleChange = (e) => {
		var errorsCopy = { ...errors };
		const errorMessage = validateProperty(e.currentTarget);
		if (errorMessage) errorsCopy[e.currentTarget.name] = errorMessage;
		else delete errorsCopy[e.currentTarget.name];
		setErrors(errorsCopy);
		let userCopy = { ...user };
		userCopy[e.currentTarget.name] = e.currentTarget.value;
		setUserForm(userCopy);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const errorsCopy = loginValidate(user);
		setErrors(errorsCopy);
		if (errorsCopy) return;
		try {
			let data = await login(user);
			toast(data.appMessage);
			if (data.appStatus == false) {
				// 2FA: Uncomment to enable 2-factor authentication
				/*
				if (data.twofa) {
					setShow2FA(true);
					setTwofaUsername(user.username);
				}
				*/
				return;
			}
			setUSER(data.appData);
		} catch (error) { }
	};

	// 2FA: Uncomment to enable 2-factor authentication
	/*
	const handle2FASubmit = async () => {
		const res = await login({ username: twofaUsername, code: twofaCode, twofa: true });
		if (res.data.appStatus) {
			setUSER(res.data.appData);
		} else {
			toast(res.data.appMessage);
		}
	};
	*/

	return (
		<>
			<ToastContainer />
			<Layout title='Login'>
				<div className='container'>
					<div className='row'>
						<div className='col-12 col-md-12'>
							<div className='sign-in-section'>
								<div className='sign-up__card'>
									<div className='sign-up__card-body'>
										<div className='mt-2'>
											<p className='login-em'>Login</p>
										</div>
										<form className='mt-4' onSubmit={handleSubmit}>
											<div className='myform-group'>
												<div className='col-12'>
													<input className='form-control myform-control' type='text' name='username' value={user.username} onChange={handleChange} placeholder='Enter Username' />
													{errors && errors.username && <div style={{ color: "red" }}>{errors.username}</div>}
												</div>
											</div>
											<div className='myform-group'>
												<div className='col-12 position-relative'>
													<input className='form-control myform-control' style={{ paddingRight: '35px' }} type={showPassword ? 'text' : 'password'} name='password' value={user.password} onChange={handleChange} placeholder='Enter Password' />
													{showPassword ? <i className="fa fa-eye" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(false)}></i> :
														<i className="fa fa-eye-slash" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(true)}></i>}
													{errors && errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
												</div>
											</div>
											{/* <div className='myform-group myform-check'>
												<div className='col-12'>
													<label className='myform-check-label'>
														<input className='myform-check-input' name='rememberMe' checked={user.registerPolicy} type='checkbox' onChange={handleInputCheck} />
														<span>Remember me</span>
													</label>
												</div>
											</div> */}
											<div className='myform-group mt-4'>
												<div className='col-12'>
													<button type="submit" className='btn my-btn -red'>Login</button>
												</div>
											</div>
											<div className='row mt-4 text-center'>
												<div className='col-12'>
													<Link href='/forgot-password' className="text-primary">
														Forgot your Password?
													</Link>
												</div>
												<div className='col-12 mt-2'>
													<Link href='/signup' className="text-primary">
														Do not Have Account! Create Now.
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

export default Login;

export async function getServerSideProps(context) {
	// console.log("LOGIN -- getServerSideProps", context.req.headers.referer);
	const previousUrl = context.req.headers.referer ? context.req.headers.referer : "/";
	// console.log(previousUrl);
	try {
		const user = context.req.cookies.user ? JSON.parse(context.req.cookies.user) : null;
		if (user) {
			return {
				redirect: {
					destination: "/"
				}
			};
		}
		return {
			props: {
				user: null,
				previousUrl: previousUrl
			}
		};
	} catch (error) {
		return {
			props: {
				user: null,
				previousUrl: previousUrl
			}
		};
	}
}
