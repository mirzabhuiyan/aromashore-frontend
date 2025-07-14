import React, { useState, useEffect, useContext } from "react";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { AppStore } from "../../store/AppStore";
import { TabPanel, useTabs } from "react-headless-tabs";
import CustomerCCProfile from "../../components/userdetails/CustomerCCProfile";
import OrderInfo from "../../components/userdetails/order_info";
import PersonalInfo from "../../components/userdetails/personal_info";
import Layout from "../../layouts/Layout";
import { getprofileByCustomer, updateprofilePicture } from "../../services/webCustomerService";
import { useRouter } from "next/router";

export default function Index() {
	const router = useRouter();
	const { user } = useContext(AppStore);
	const [customerprofile, setCustomerprofile] = useState(null)
	useEffect(() => {
		console.log("user2 --------> ", user);
		if (user) {
			getprofileByCustomer(user).then(profile => {
				console.log("profileData.appData --------> ", profile);
				setCustomerprofile(profile.data.appData);
			}).catch(err => console.log(err))
		} else {
			window.location = "/";
		}
	}, [user])

	const [profileImgUrl, setProfileImgUrl] = useState(
		customerprofile?.customerprofile?.image
			? customerprofile?.customerprofile?.image
			: "/app/assets/images/avatar.jpg"
	);
	console.log('user profile --->>', customerprofile)

	const previewFile = (e) => {
		let file = e.target.files[0];
		const reader = new FileReader();
		if (file) {
			reader.onloadend = (e) => {
				setProfileImgUrl(e.target.result.toString());

				updateprofilePicture({ image: e.target.result }, user)
					.then((res) => {
						// console.log(res);
					})
					.catch((error) => {
						console.log("data", error);
					});
			};
			reader.readAsDataURL(file);
		}
	};
	const uploadHandle = (id) => {
		document.getElementById(id).click();
	};

	const [selectedTab, setSelectedTab] = useTabs(["profile", "cards", "orders"], "profile");
	const TabSelector = ({ isActive, children, onClick }) => {
		return (
			// Button element representing a tab
			<button className={`hover-underline tab-item ${isActive ? "hover-underline active-tab " : "border-transparent text-gray-500 hover:text-gray-600 hover:border-gray-300 focus:text-gray-600 focus:border-gray-300"}`} onClick={onClick}>
				{children}
			</button>
		);
	};

	return (
		<Layout title='Customer Profile'>
			{user ?
				<div id='content'>
					<div className='container-fluid'>
						<div className='row'>
							<div className='col-12'>
								<div className='profile_image_background'>
									<div className='profile_image_box'>
										<img className='img-thumbnail mt-4' src={profileImgUrl} alt='Picture of the author' width={150} height={150} />
										<div
											className='profile_image'
											title='Upload Profile Image'
											onClick={(e) => {
												uploadHandle("profile_image_id");
											}}>
											<FontAwesomeIcon icon={faImage} />
										</div>
										<input
											hidden
											type='file'
											className='form-control'
											id='profile_image_id'
											onChange={(e) => {
												previewFile(e);
											}}
										/>
									</div>
								</div>
							</div>
						</div>
						<nav style={{ backgroundColor: "#f0f0f0", textAlign: 'center' }}>
							<TabSelector isActive={selectedTab === "profile"} onClick={() => setSelectedTab("profile")}>
								Personal Information
							</TabSelector>
							<TabSelector isActive={selectedTab === "cards"} onClick={() => setSelectedTab("cards")}>
								Card Information
							</TabSelector>
							<TabSelector isActive={selectedTab === "orders"} onClick={() => setSelectedTab("orders")}>
								Order Information
							</TabSelector>
						</nav>

						<div className='p-3' style={{ overflowY: 'auto', height: '60vh' }}>
							<TabPanel hidden={selectedTab !== "profile"}>
								{user && customerprofile ? <PersonalInfo user={user} profile={customerprofile} /> : <></>}
							</TabPanel>
							<TabPanel hidden={selectedTab !== "cards"}>
								{/* <CardInfo user={user} profile={customerprofile.customerprofile.cc_profile} /> */}
								{user ? (customerprofile?.customerprofile?.cc_profile ?
									<CustomerCCProfile customerId={user.uid} creditCard={JSON.parse(customerprofile?.customerprofile?.cc_profile)} /> : <CustomerCCProfile customerId={user.uid} creditCard={[]} />) : <></>
								}
							</TabPanel>
							<TabPanel hidden={selectedTab !== "orders"}>
								{user ? <OrderInfo user={user} /> : <></>}
							</TabPanel>
						</div>
					</div>
				</div> : <h1 className="alert alert-danger text-center w-100 p-5">Unauthorized!</h1>
			}
		</Layout>
	);
}

// export async function getServerSideProps(context) {
// 	try {
// 		const user = context.req.cookies.user ? JSON.parse(context.req.cookies.user) : null;
// 		if (!user) {
// 			return {
// 				redirect: {
// 					destination: "/login"
// 				}
// 			};
// 		}
// 	} catch (error) {
// 		return {
// 			redirect: {
// 				destination: "/login"
// 			}
// 		};
// 	}
// }
