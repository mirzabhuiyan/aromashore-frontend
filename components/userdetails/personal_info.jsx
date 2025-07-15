import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validatePasswordChange } from "../../models/user";
import { changeProfilePassword, updateprofileByCustomer } from "../../services/webCustomerService";
import { getCitiesByStateId, getCountriesList, getStatesByCountryId } from "../../services/publicContentsService";

const groupTypeList = [
	{ value: 1, name: "Group 1" },
	{ value: 2, name: "Group 2" },
	{ value: 3, name: "Group 3" }
];

const raceTypeList = [
	{ value: 1, name: "White" },
	{ value: 2, name: "Black or African American" },
	{ value: 3, name: "American Indian or Alaska Native" },
	{ value: 4, name: "Asian" },
	{ value: 5, name: "Native Hawaiian or Other Pacific Islander" }
];

const carrierTypeList = [
	{ value: 1, name: "UPS" },
	{ value: 2, name: "FedEx" },
	{ value: 3, name: "USPS" }
];

const termsTypeList = [
	{ value: 1, name: "COD Cheque" },
	{ value: 2, name: "COD Cash" },
	{ value: 3, name: "CC Charge" },
	{ value: 4, name: "CC Prepaid" },
	{ value: 5, name: "Pre-Paid" },
	{ value: 6, name: "30 Days Net" },
	{ value: 7, name: "On Receipt" }
];

const serviceTypeList = [
	{ value: 1, name: "Ground" },
	{ value: 2, name: "2nd Day" },
	{ value: 3, name: "3 Day" },
	{ value: 4, name: "5 Day" },
	{ value: 5, name: "7 Day" }
];

const getNameFromListById = (list, id) => {
	let data = {
		name: ""
	};
	data = list.find((al) => al.value === Number(id));
	return data?.name || "";
};

export default function PersonalInfo({ user, profile }) {
	console.log("user --------> ", user);
	console.log("profile --------> ", profile);
	let basicInfo = {
		customer_no: '',
		firstname: '',
		lastname: '',
		company: '',
		contact: '',
		username: '',
		email: '',
		created_by: new Date(),
		customercategoryId: '',
		status: ''
	};
	let profileInfo = {
		race: '1',
		group: '1',
		billing_address: '',
		cc_profile: '',
		service: '1',
		location: '',
		zone: '',
		tax_id: '',
		limit: '',
		carrier: '1',
		subscription: {
			subscriptionEmail: false,
			subscriptionText: false
		},
		order_info_notification: {
			orderInfoNotificationEmail: false,
			orderInfoNotificationText: false
		},
		manager_remarks: "",
		employee_remarks: "",
		terms: "2"
	};
	let customercontact = {
		phone_no: '',
		fax: '',
		address_line_one: '',
		address_line_two: '',

		country: '',
		country_code: "",
		country_name: "",
		state: '',
		state_code: "",
		state_name: "",
		city: '',
		city_name: "",

		zipcode: '',
		shipping_address: ''
	};
	const [profileCountryList, setProfileCountryList] = useState([]);
	const [selectedProfileCountry, setSelectedProfileCountry] = useState({
		value: 0,
		label: ""
	});
	const [profileStateList, setProfileStateList] = useState([]);
	const [selectedProfileState, setSelectedProfileState] = useState({
		value: 0,
		label: ""
	});
	const [profileCityList, setProfileCityList] = useState([]);
	const [selectedProfileCity, setSelectedProfileCity] = useState({
		value: 0,
		label: ""
	});
	const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
	const [showContactInfoModal, setShowContactInfoModal] = useState(false);
	const [bean, setBean] = useState({
		...basicInfo,
		...profileInfo,
		...customercontact
	});

	useEffect(() => {
		getCountriesList()
			.then(function (response) {
				console.log(response);
				if (response.status === 200 && !response.data["appStatus"]) {
					setProfileCountryList([]);
				} else {
					const tempCountryList = response.data["appData"];
					// console.log(tempCountryList);
					const customCountryList = [];
					tempCountryList.map((cl) => {
						const country = { value: cl.id, label: `${cl.name} (${cl.code})` };
						customCountryList.push(country);
						return true;
					});
					setProfileCountryList(customCountryList);
				}
			})
			.catch(function (error) {
				console.log(error);
			});

		handleProfileCountryInputChange({ value: 187, label: "United State of America (US)" });
		renderForm();
	}, []);

	useEffect(() => {
		const personal_data = JSON.stringify(bean);
		Cookies.set("personal-data", personal_data);
		console.log("personal_data --------> ", personal_data);
	}, [bean]);

	const renderForm = () => {
		console.log('renderForm');
		let subscription;
		let order_info_notification = profile?.customerprofile?.order_info_notification;
		if (profile?.customerprofile?.subscription) {
			subscription = JSON.parse(profile?.customerprofile.subscription);
		}
		if (profile?.customerprofile?.order_info_notification) {
			order_info_notification = JSON.parse(profile?.customerprofile?.order_info_notification);
		}

		handleProfileCountryInputChange({ value: Number(profile?.customercontact?.country), label: `${profile?.customercontact?.country_name} (${profile?.customercontact?.country_code})` });
		if (profile?.customercontact?.state) {
			handleProfileStateInputChange({ value: Number(profile?.customercontact?.state), label: `${profile?.customercontact?.state_name} (${profile?.customercontact?.state_code})` });
		}
		if (profile?.customercontact?.city) {
			handleProfileCityInputChange({ value: Number(profile?.customercontact?.city), label: profile?.customercontact?.city_name });
		}

		setBean({
			customer_no: profile?.customer_no,
			firstname: profile?.firstname,
			lastname: profile?.lastname,
			company: profile?.company,
			contact: profile?.contact,
			username: profile?.username,
			email: profile?.email,
			created_by: new Date(),
			customercategoryId: profile?.customercategory?.id,
			status: profile?.status,

			race: profile?.customerprofile?.race,
			group: profile?.customerprofile?.group,
			billing_address: profile?.customerprofile?.billing_address,
			cc_profile: profile?.customerprofile?.cc_profile,
			service: profile?.customerprofile?.service,
			location: profile?.customerprofile?.location,
			zone: profile?.customerprofile?.zone,
			tax_id: profile?.customerprofile?.tax_id,
			limit: profile?.customerprofile?.limit,
			carrier: profile?.customerprofile?.carrier,
			subscription: {
				subscriptionEmail: subscription?.subscriptionEmail,
				subscriptionText: subscription?.subscriptionText
			},
			order_info_notification: {
				orderInfoNotificationEmail: order_info_notification?.orderInfoNotificationEmail,
				orderInfoNotificationText: order_info_notification?.orderInfoNotificationText
			},
			manager_remarks: "",
			employee_remarks: "",
			terms: "2",

			phone_no: profile?.customercontact?.phone_no,
			fax: profile?.customercontact?.fax,
			address_line_one: profile?.customercontact?.address_line_one,
			address_line_two: profile?.customercontact?.address_line_two,

			country: profile?.customercontact?.country,
			country_code: profile?.customercontact?.country_code,
			country_name: profile?.customercontact?.country_name,
			state: profile?.customercontact?.state,
			state_code: profile?.customercontact?.state_code,
			state_name: profile?.customercontact?.state_name,
			city: profile?.customercontact?.city,
			city_name: profile?.customercontact?.city_name,

			zipcode: profile?.customercontact?.zipcode,
			shipping_address: profile?.customercontact?.shipping_address
		});
	}

	const handleChange = (e) => {
		bean[e.target.name] = e.target.value;
		setBean({ ...bean });
	};

	const handleSubscriptionCheckBox = (e) => {
		const beanCopy = { ...bean };
		beanCopy["subscription"][e.target.name] = e.target.checked;
		setBean(beanCopy);
	};

	const orderInfoNotificationCheckBox = (e) => {
		const beanCopy = { ...bean };
		beanCopy["order_info_notification"][e.target.name] = e.target.checked;
		setBean(beanCopy);
	};

	const handleProfileCountryInputChange = (event) => {
		console.log(event)
		const value = event.value;
		const nameNCode = event.label.split("(");
		const label = nameNCode[0];
		const code = nameNCode[1].toString().slice(0, -1);
		if (value) {
			getStatesByCountryId(value)
				.then(function (response) {
					console.log(response);
					if (response.status === 200 && !response.data["appStatus"]) {
						setProfileStateList([]);
					} else {
						const tempStateList = response.data["appData"];
						const customStateList = [];
						tempStateList.map((cl) => {
							const state = { value: cl.id, label: `${cl.name} (${cl.code})` };
							customStateList.push(state);
							return true;
						});
						setProfileStateList(customStateList);
					}
				})
				.catch(function (error) {
					console.log(error);
				});
		} else {
			setProfileStateList([]);
		}
		setBean((values) => ({ ...values, country: value, country_name: label, country_code: code }));
		setBean((values) => ({ ...values, state: "", state_name: "", state_code: "", city: "", city_name: "" }));
		setSelectedProfileCountry({ value: value, label: `${label} (${code})` });
		setSelectedProfileState({ value: 0, label: "" });
		setSelectedProfileCity({ value: 0, label: "" });
	};

	const handleProfileStateInputChange = (event) => {
		const value = event.value;
		const nameNCode = event.label.split("(");
		const label = nameNCode[0];
		const code = nameNCode[1].toString().slice(0, -1);
		if (value) {
			getCitiesByStateId(value)
				.then(function (response) {
					console.log(response);
					if (response.status === 200 && !response.data["appStatus"]) {
						setProfileCityList([]);
					} else {
						const tempCityList = response.data["appData"];
						const customCityList = [];
						tempCityList.map((cl) => {
							const city = { value: cl.id, label: cl.name, tax_rate: cl.tax_rate };
							customCityList.push(city);
							return true;
						});
						setProfileCityList(customCityList);
					}
				})
				.catch(function (error) {
					console.log(error);
				});
		} else {
			setProfileCityList([]);
		}
		setBean((values) => ({ ...values, state: value, state_name: label, state_code: code }));
		setBean((values) => ({ ...values, city: "", city_name: "", tax_rate: 0 }));
		setSelectedProfileState({ value: value, label: `${label} (${code})` });
		setSelectedProfileCity({ value: 0, label: "" });
	};

	const handleProfileCityInputChange = (event) => {
		const value = event.value;
		const label = event.label;
		let selectedCityDetail = { value: 0, label: '', tax_rate: 0 };
		if (profileCityList.length > 0) {
			selectedCityDetail = profileCityList.find((cl) => cl.value === value);
		}
		// console.log(selectedCityDetail);
		setBean((values) => ({ ...values, city: value, city_name: label, tax_rate: selectedCityDetail.tax_rate }));
		setSelectedProfileCity({ value: value, label: label });
	};

	const handlePersonalProfileSubmit = () => {
		console.log(bean);
		try {
			let result = updateprofileByCustomer({
				...bean,
				subscription: JSON.stringify(bean.subscription),
				order_info_notification: JSON.stringify(bean.order_info_notification),
				...user
			});

			result.then((res) => {
				toast(res.data.appMessage);
				if (res.data.appStatus) {
					setShowPersonalInfoModal(false);
					setShowContactInfoModal(false)
				}
			});
		} catch (error) { }
	};

	const [errors, setErrors] = useState({});

	const [changePasswordInformation, setChangePasswordInformation] = useState({
		previousPassword: "",
		newPassword: "",
		repeat_password: "",
		...user
	});

	const handleChangePasswordChange = (e) => {
		bean[e.target.name] = e.target.value;
		setChangePasswordInformation({ ...bean });
	};

	const handleChangePasswordSubmit = async (e) => {
		e.preventDefault();
		const errorsCopy = validatePasswordChange({
			previousPassword: bean.previousPassword,
			newPassword: bean.newPassword,
			repeatPassword: bean.repeat_password,
		});
		setErrors(errorsCopy);
		if (errorsCopy) return;
		try {
			const reqBody = {
				"oldpassword": bean.previousPassword,
				"password": bean.newPassword
			}

			let { data } = await changeProfilePassword(reqBody, user);
			toast(data.appMessage);
		} catch (error) {
			console.log('error:', error)
		}
	};

	return (
		<>
			<ToastContainer />
			<div className='bg-light'>
				{/* Profile Information */}
				<div className='card border-0 bg-transparent'>
					<div className='card-header'>
						<h5 className='mb-0'>Profile Information</h5>
					</div>
					<div className='card-body'>
						{/* parent */}
						<div className='row'>
							{/* child 1 */}
							<div className='col-12 col-md-7'>
								{/* 1.1 - Personal Info */}
								<div className='card'>
									{/* 1.1 - Personal Info Icon */}
									<div className='card-header d-flex align-items-center justify-content-between'>
										Personal Info
										{showPersonalInfoModal ?
											'' : <i
												className='fas fa-edit hand'
												onClick={() => {
													setShowPersonalInfoModal(true);
												}}></i>
										}
									</div>

									{/* 1.1 - Personal Info Table */}
									{showPersonalInfoModal ? <>
										<div className='card-body'>
											<div className="table-responsive">
												<table className='table'>
													<tbody>
														{/* comp name */}
														<tr>
															<th>Company Name</th>
															<td colSpan={3}>
																<input className='form-control' id='company' type='text' name='company' value={bean.company || ""} onChange={handleChange} placeholder='Company ' />
															</td>
														</tr>
														{/* fn + ln */}
														<tr>
															<th>First Name</th>
															<td>
																<input type='text' className='form-control' id='firstname' name='firstname' value={bean.firstname || ""} onChange={handleChange} placeholder='First Name' />
															</td>
															<th>Last Name</th>
															<td>
																<input type='text' className='form-control' id='lastname' name='lastname' value={bean.lastname || ""} onChange={handleChange} placeholder='Last Name ' />
															</td>
														</tr>
														<tr>
															<th>Contact</th>
															<td>
																<input type='text' className='form-control' id='contact' name='contact' value={bean.contact || ""} onChange={handleChange} placeholder='Contact No' />
															</td>
															<th>Phone No</th>
															<td>
																<input type='text' className='form-control' id='phone_no' name='phone_no' value={bean.phone_no || ""} onChange={handleChange} placeholder='Phone No' />
															</td>

														</tr>
														<tr>
															<th>Email</th>
															<td>
																<input type='email' className='form-control' id='email' name='email' value={bean.email || ""} onChange={handleChange} placeholder='Email ID' />
															</td>
															<th>Tax ID</th>
															<td>
																<input type='text' className='form-control' id='tax_id' name='tax_id' value={bean.tax_id || ""} onChange={handleChange} placeholder='Tax Id' />
															</td>
														</tr>
														<tr>
															<th>Subscription</th>
															<td>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' id='subscriptionEmail' name='subscriptionEmail' checked={bean.subscription.subscriptionEmail} onChange={handleSubscriptionCheckBox} />
																	<label className='form-check-label' htmlFor='subscriptionEmail'>
																		Email
																	</label>
																</div>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' id='subscriptionText' name='subscriptionText' checked={bean.subscription.subscriptionText} onChange={handleSubscriptionCheckBox} />
																	<label className='form-check-label' htmlFor='subscriptionText'>
																		Text
																	</label>
																</div>
															</td>
															<th>Notification</th>
															<td>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' id='orderInfoNotificationEmail' name='orderInfoNotificationEmail' checked={bean.order_info_notification.orderInfoNotificationEmail} onChange={orderInfoNotificationCheckBox} />
																	<label className='form-check-label' htmlFor='orderInfoNotificationEmail'>
																		Email
																	</label>
																</div>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' id='orderInfoNotificationText' name='orderInfoNotificationText' checked={bean.order_info_notification.orderInfoNotificationText} onChange={orderInfoNotificationCheckBox} />
																	<label className='form-check-label' htmlFor='orderInfoNotificationText'>
																		Text
																	</label>
																</div>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
										<div className="card-footer text-end">
											<Button
												className="me-2"
												variant='secondary'
												onClick={() => {
													setShowPersonalInfoModal(false);
												}}>
												Close
											</Button>
											<Button
												variant='primary'
												onClick={handlePersonalProfileSubmit}>
												Update
											</Button>
										</div>
									</> :
										<div className='card-body'>
											<div className="table-responsive">
												<table className='table'>
													<tbody>
														<tr>
															<th>Username</th>
															<td colSpan={3}>{bean.username}</td>
														</tr>
														{/* comp name */}
														<tr>
															<th>Company Name</th>
															<td colSpan={3}>{bean.company}</td>
														</tr>
														{/* fn + ln */}
														<tr>
															<th>First Name</th>
															<td>{bean.firstname}</td>
															<th>Last Name</th>
															<td>{bean.lastname}</td>
														</tr>
														<tr>
															<th>Contact</th>
															<td>{bean.contact ? bean.contact.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") : ''}</td>
															<th>Phone No</th>
															<td>{bean.phone_no || ''}</td>

														</tr>
														<tr>
															<th>Email</th>
															<td>{bean.email}</td>
															<th>Tax ID</th>
															<td>{bean.tax_id}</td>
														</tr>
														<tr>
															<th>Subscription</th>
															<td>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' checked={bean.subscription.subscriptionEmail} readOnly />
																	<label className='form-check-label'>Email</label>
																</div>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' checked={bean.subscription.subscriptionText} readOnly />
																	<label className='form-check-label'>Text</label>
																</div>
															</td>
															<th>Notification</th>
															<td>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' checked={bean.order_info_notification.orderInfoNotificationEmail} readOnly />
																	<label className='form-check-label'>Email</label>
																</div>
																<div className='form-check form-check-inline'>
																	<input className='form-check-input' type='checkbox' checked={bean.order_info_notification.orderInfoNotificationText} readOnly />
																	<label className='form-check-label'>Text</label>
																</div>
															</td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									}
								</div>

								{/* 1.2 - Contact Info */}
								<div className='card mt-3'>
									<div className='card-header d-flex align-items-center justify-content-between'>
										Contact Info
										{showContactInfoModal ? '' :
											<i
												className='fas fa-edit hand'
												onClick={() => {
													setShowContactInfoModal(true);
												}}></i>
										}
									</div>
									{showContactInfoModal ? <>
										<div className='card-body'>
											<div className="table-responsive">
												<table className='table'>
													<tbody>
														<tr>
															<th>Address Line One</th>
															<td>
																<textarea className='form-control' id='address_line_one' name='address_line_one' value={bean.address_line_one || ""} onChange={handleChange} rows='4' />
															</td>
															<th>Address LIne Two</th>
															<td>
																<textarea className='form-control' id='address_line_two' name='address_line_two' onChange={handleChange} value={bean.address_line_two || ""} rows='4' />
															</td>
														</tr>
														<tr>
															<th>Country</th>
															<td><Select options={profileCountryList} value={selectedProfileCountry} onChange={(event) => handleProfileCountryInputChange(event)} required /></td>
															<th>State</th>
															<td>
																{profile.country !== "" && profileStateList.length > 0 ? (
																	<Select options={profileStateList} value={selectedProfileState} onChange={(event) => handleProfileStateInputChange(event)} required />
																) : (
																	<input className='form-control' type='text' name='state_name' value={bean.state_name || ""} onChange={handleChange} />
																)}
															</td>
														</tr>
														<tr>
															<th>City</th>
															<td>
																{profile.state !== "" && profileCityList.length > 0 ? (
																	<Select options={profileCityList} value={selectedProfileCity} onChange={(event) => handleProfileCityInputChange(event)} required />
																) : (
																	<input className='form-control' type='text' name='city_name' value={bean.city_name || ""} onChange={handleChange} />
																)}
															</td>
															<th>Zip Code</th>
															<td>
																<input type='text' className='form-control' id='zipcode' name='zipcode' value={bean.zipcode || ""} onChange={handleChange} placeholder='Zip code ' />
															</td>
														</tr>
														{/* <tr>
												<th>Shipping Address</th>
												<td>{bean.shipping_address}</td>
												<th>Billing Address</th>
												<td>{bean.billing_address}</td>
												</tr> */}
													</tbody>
												</table>
											</div>
										</div>
										<div className="card-footer text-end">
											<Button
												className="me-2"
												variant='secondary'
												onClick={() => {
													setShowContactInfoModal(false);
												}}>
												Close
											</Button>
											<Button
												variant='primary'
												onClick={handlePersonalProfileSubmit}>
												Update
											</Button>
										</div>
									</> :
										<div className='card-body'>
											<div className="table-responsive">
												<table className='table'>
													<tbody>
														<tr>
															<th>Address Line One</th>
															<td>{bean.address_line_one}</td>
															<th>Address LIne Two</th>
															<td>{bean.address_line_two}</td>
														</tr>
														<tr>
															<th>City</th>
															<td>{bean.city_name}</td>
															<th>State</th>
															<td>{bean.state_name}</td>
														</tr>
														<tr>
															<th>Country</th>
															<td>{bean.country_name}</td>
															<th>Zip Code</th>
															<td>{bean.zipcode}</td>
														</tr>
														{/* <tr>
												<th>Shipping Address</th>
												<td>{bean.shipping_address}</td>
												<th>Billing Address</th>
												<td>{bean.billing_address}</td>
												</tr> */}
													</tbody>
												</table>
											</div>
										</div>
									}
								</div>
							</div>
							{/* child 2 - Change Password + Other Info */}
							<div className='col-12 col-md-5'>
								{/* Change Password */}
								<div className='card'>
									<div className='card-header'>Change Password</div>
									<div className='card-body'>
										<form onSubmit={handleChangePasswordSubmit}>
											<div className='profile-password-field'>
												<div className='row'>
													<div className='col-12 col-md-12'>
														<div className='mb-3'>
															<label htmlFor='previousPassword' className='form-label fw-bold'>
																Previous Password
															</label>
															<input type='password' className='form-control' id='previousPassword' name='previousPassword' value={changePasswordInformation.previousPassword || ""} onChange={handleChangePasswordChange} placeholder='************' />
														</div>
													</div>
													<div className='col-12 col-md-12'>
														<div className='mb-3'>
															<label htmlFor='newPassword' className='form-label fw-bold'>
																New Password
															</label>
															<input type='password' className='form-control' id='newPassword' name='newPassword' value={changePasswordInformation.newPassword || ""} onChange={handleChangePasswordChange} placeholder=' New Password ' />
															{errors && errors.newPassword && <div style={{ color: "red" }}>{errors.newPassword}</div>}
														</div>
													</div>
													<div className='col-12 col-md-12'>
														<div className='mb-3'>
															<label htmlFor='repeat_password' className='form-label fw-bold'>
																Retype New Password
															</label>
															<input type='password' className='form-control' id='repeat_password' name='repeat_password' value={changePasswordInformation.repeat_password || ""} onChange={handleChangePasswordChange} placeholder='Re Type New Password ' />
															{errors && errors.repeat_password && <div style={{ color: "red" }}>{errors.repeat_password}</div>}
														</div>
													</div>
													<div className='col-12 col-md-12'>
														<button type='submit' className='btn btn-secondary mt-2'>
															Change
														</button>
													</div>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div >
		</>
	);
}
