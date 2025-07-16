import React, { useState, useEffect } from "react";
import Layout from "../layouts/Layout";
import Link from "next/link";
import { validate, validateProperty } from "../models/user";
import { register, validateUsername } from "../services/userService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import {apiUrl} from "../config";
import axios from "axios";
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';

function Signup() {
	const router = useRouter();
	const [user, setUser] = useState({
		customercategoryId: "1",
		firstname: "",
		lastname: "",
		dial_code: "+1",
		contact: "",
		username: "",
		email: "",
		password: "",
		registerPolicyEmail: true,
		registerPolicySMS: true
	});
	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [allCountryList, setAllCountryList] = useState([{ dial_code: '+1', name: 'USA' }, { dial_code: '+880', name: 'BD' }]);
	const [address, setAddress] = useState({
		address_line_one: '',
		address_line_two: '',
		city: '',
		state: '',
		zipcode: '',
		country: ''
	});

	// useEffect(() => {
	// 	axios.get(apiUrl + "/public/country").then(function (response) {
	// 		console.log(response);
	// 		if (response.status === 200 && !response.data["appStatus"]) {
	// 			setAllCountryList([]);
	// 		} else {
	// 			setAllCountryList(response.data["appData"]);
	// 		}
	// 	}).catch(function (error) {
	// 		console.log(error);
	// 	});
	// }, []);

	const handleChange = (e) => {
		var errorsCopy = { ...errors };
		const errorMessage = validateProperty(e.currentTarget);
		if (errorMessage) errorsCopy[e.currentTarget.name] = errorMessage;
		else delete errorsCopy[e.currentTarget.name];
		setErrors(errorsCopy);
		let userCopy = { ...user };
		userCopy[e.currentTarget.name] = e.currentTarget.value;
		setUser(userCopy);
	};

	const handleInputCheck = (e) => {
		let userCopy = { ...user };
		userCopy[e.currentTarget.name] = e.target.checked;
		setUser(userCopy);
	};

	const handleAddressChange = (name, value) => {
		setAddress((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectAddress = async (value) => {
		setAddress((prev) => ({ ...prev, address_line_one: value }));
		try {
			const results = await geocodeByAddress(value);
			if (results && results[0]) {
				const addressComponents = results[0].address_components;
				let city = '', state = '', zipcode = '', country = '';
				addressComponents.forEach(component => {
					if (component.types.includes('locality')) city = component.long_name;
					if (component.types.includes('administrative_area_level_1')) state = component.long_name;
					if (component.types.includes('postal_code')) zipcode = component.long_name;
					if (component.types.includes('country')) country = component.long_name;
				});
				setAddress((prev) => ({ ...prev, city, state, zipcode, country }));
			}
		} catch (e) { }
	};

	const validateUser = async () => {
		if (user.username) {
			try {
				const { data } = await validateUsername(user.username);
				// console.log(data.appMessage);
				const errorsTemp = { ...errors };
				errorsTemp.username = data.appMessage;
				setErrors(errorsTemp);
			} catch (ex) {
				if (ex.response && ex.response.status === 400) {
					// console.log(errorsTemp);
					const errorsTemp = { ...errors };
					errorsTemp.username = ex.response.data;
					setErrors(errorsTemp);
				}
			}
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		const errorsCopy = validate(user);
		setErrors(errorsCopy);
		// console.log(errorsCopy);
		// console.log(user);
		if (errorsCopy) return;
		try {
			const payload = { ...user, ...address };
			const { data } = await register(payload);
			toast(data.appMessage);
			if (data.appStatus) {
				router.push('/');
			}
			// If not successful, stay on the page and show the toast only
		} catch (ex) {
			if (ex.response && ex.response.status === 400) {
				const errorsTemp = { ...errors };
				errorsTemp.email = ex.response.data;
				setErrors(errorsTemp);
			}
		}
	};
	return (
		<>
			<ToastContainer />
			<Layout title='Register'>
				<div className='container'>
					<div className='row'>
						<div className='col-12 col-md-12'>
							<div className='sign-up-section'>
								<div className='sign-up__card'>
									<div className='sign-up__card-body'>
										<div className='mt-2'>
											<p className='login-em'>Create Account</p>
										</div>
										<form className='mt-4' onSubmit={handleSubmit}>
											{/* <div className='row'>
												<div className='col-12'>
													<select name='customercategoryId' className='form-control myform-control mb-2' onChange={handleChange} value={user.customercategoryId}>
														<option value=''>----Sign Up as A---</option>
														{customerTypes.map((item, i) => {
															return (
																<option key={i} value={item.id}>
																	{item.title}
																</option>
															);
														})}
													</select>
													{errors && errors.customercategoryId && <div style={{ color: "red" }}>{errors.customercategoryId}</div>}
												</div>
											</div> */}
											<div className='row'>
												<div className='col-12 col-md-6'>
													<input className='form-control myform-control mb-2' type='text' name='firstname' value={user.firstname} onChange={handleChange} placeholder='First Name' />
													{errors && errors.firstname && <div style={{ color: "red" }}>{errors.firstname}</div>}
												</div>
												<div className='col-12 col-md-6'>
													<input className='form-control myform-control mb-2' type='text' name='lastname' value={user.lastname} onChange={handleChange} placeholder='Last Name' />
													{errors && errors.lastname && <div style={{ color: "red" }}>{errors.lastname}</div>}
												</div>
											</div>
											<div className='row'>
												<div className='col-12 col-md-6'>
													<input className='form-control myform-control mb-2' type='text' name='username' value={user.username} onBlur={validateUser} onChange={handleChange} placeholder='Username' />
													{errors && errors.username && <div style={{ color: "red" }}>{errors.username}</div>}
												</div>
												<div className='col-12 col-md-6'>
													<input className='form-control myform-control mb-2' style={{ paddingRight: '35px' }} type={showPassword ? 'text' : 'password'} name='password' value={user.password} onChange={handleChange} placeholder='Password' />
													{showPassword ? <i className="fa fa-eye" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(false)}></i> :
														<i className="fa fa-eye-slash" style={{ position: 'absolute', top: '11px', right: '24px' }} onClick={() => setShowPassword(true)}></i>}
													{errors && errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
												</div>
											</div>
											<div className='row'>
												<div className='col-12 col-md-6'>
													<input className='form-control myform-control mb-2' type='text' name='email' value={user.email} onChange={handleChange} placeholder='Email' />
													{errors && errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
												</div>
												<div className='col-12 col-md-6'>
													<div className="d-flex justify-content-between">
														<select name="dial_code" id="dial_code" className="form-control myform-control mb-2" value={user.dial_code} onChange={handleChange} style={{ maxWidth: '95px' }}>
															{allCountryList.map(acl => <option key={acl.dial_code} value={acl.dial_code}>{acl.name} ({acl.dial_code})</option>)}
														</select>
														<div>
															<input className='form-control myform-control mb-2' type='text' name='contact' value={user.contact} onChange={handleChange} placeholder='Mobile Number' />
															{errors && errors.contact && <div style={{ color: "red" }}>{errors.contact}</div>}
														</div>
													</div>
												</div>
											</div>
											<div className='row'>
												<div className='col-12 col-md-12'>
													<label>Address Line 1</label>
													<PlacesAutocomplete value={address.address_line_one} onChange={val => handleAddressChange('address_line_one', val)} onSelect={handleSelectAddress}>
														{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
															<div>
																<input {...getInputProps({ placeholder: 'Address Line 1', className: 'form-control myform-control mb-2' })} />
																<div className='autocomplete-dropdown-container'>
																	{loading && <div>Loading...</div>}
																	{suggestions.map(suggestion => {
																		const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
																		return (
																			<div {...getSuggestionItemProps(suggestion, { className })}>
																				<span>{suggestion.description}</span>
																			</div>
																		);
																	})}
																</div>
															</div>
														)}
													</PlacesAutocomplete>
												</div>
												<div className='col-12 col-md-12'>
													<label>Address Line 2</label>
													<input
														className='form-control myform-control mb-2'
														type='text'
														name='address_line_two'
														value={address.address_line_two}
														onChange={e => handleAddressChange('address_line_two', e.target.value)}
														placeholder='Address Line 2'
													/>
												</div>
												<div className='col-12 col-md-6'>
													<label>City</label>
													<input className='form-control myform-control mb-2' type='text' name='city' value={address.city} onChange={e => handleAddressChange('city', e.target.value)} placeholder='City' />
												</div>
												<div className='col-12 col-md-6'>
													<label>State</label>
													<input className='form-control myform-control mb-2' type='text' name='state' value={address.state} onChange={e => handleAddressChange('state', e.target.value)} placeholder='State' />
												</div>
												<div className='col-12 col-md-6'>
													<label>Zip Code</label>
													<input className='form-control myform-control mb-2' type='text' name='zipcode' value={address.zipcode} onChange={e => handleAddressChange('zipcode', e.target.value)} placeholder='Zip Code' />
												</div>
												<div className='col-12 col-md-6'>
													<label>Country</label>
													<input className='form-control myform-control mb-2' type='text' name='country' value={address.country} onChange={e => handleAddressChange('country', e.target.value)} placeholder='Country' />
												</div>
											</div>
											<div className='row myform-check'>
												<div className='col-12'>
													<label className='myform-check-label'>
														<input name='registerPolicyEmail' className='myform-check-input' checked={user.registerPolicyEmail} type='checkbox' onChange={handleInputCheck} />
														<span>Yes! Sign me up to receive email from Aroma Shore with the latest deals, sales &amp; updates.</span>
													</label>
												</div>
												<div className='col-12'>
													<label className='myform-check-label'>
														<input name='registerPolicySMS' className='myform-check-input' checked={user.registerPolicySMS} type='checkbox' onChange={handleInputCheck} />
														<span>Yes! Sign me up to receive SMS messages from Aroma Shore with the latest deals, sales &amp; updates.</span>
													</label>
												</div>
												<div className='col-12'>
													<br />
													<label>
														<p style={{ fontSize: '10px', lineHeight: '12px', color: '#999', margin: 0, fontStyle: 'italic' }}>
															By submitting this form, you agree to receive recurring automated promotional and personalized marketing text messages (e.g. new releases, order updates) from Aromashore at the cell number used when signing up. Consent is not a
															condition of any purchase. Reply HELP for help and STOP to cancel. Message frequency varies. Message &amp; Data Rates may apply.<br />View <a href=''>Terms &amp; Condition</a>
														</p>
													</label>
												</div>
											</div>
											<div className='row mt-4'>
												<div className='col-12'>
													<button className='btn my-btn btn-primary'>Sign Up</button>
												</div>
											</div>
											<div className='row mt-4'>
												<div className='col-12 text-center'>
													<Link href='/login' className="text-primary">
														Already have Account?
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

export default Signup;
// export async function getServerSideProps(context) {
// 	try {
// 		const { data } = await fetchCustomerTypes();
// 		return {
// 			props: {
// 				customerTypes: data.appData
// 			}
// 		};
// 	} catch (error) {
// 		return {
// 			props: {
// 				customerTypes: []
// 			}
// 		};
// 	}
// }
