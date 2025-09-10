import React from "react";
import Layout from "../layouts/Layout";
import axios from "axios";
import {apiUrl} from "../config";
import parse from "html-react-parser";
import Link from "next/link";

function PrivacyPolicy({ appData }) {
	return (
		<Layout title='Privacy Policy'>
			<>
				<div className='breadcrumb'>
					<div className='container mt-2'>
						<ul className='p-0 mb-2'>
							<li>
								<Link href='/'>Home</Link>
							</li>
							<li className='active'>Privacy Policy</li>
						</ul>
					</div>
				</div>
				<div className='container mb-5'>
					<div className="row">
						<div className="col-12">
							<h2>Privacy Policy</h2>
							<hr />
						</div>
					</div>
					<div className='row'>
						<div className='col-12'>{appData != null ? parse(appData.description) : "Privacy policy content loading..."}</div>
					</div>
				</div>
			</>
		</Layout>
	);
}

export async function getStaticProps() {
	// During build time, don't make API calls if backend is not available
	if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL?.includes('localhost')) {
		return {
			props: {
				appData: {
					description: "<p>Privacy policy will be loaded from the backend when available.</p>"
				}
			},
			revalidate: 3600
		};
	}

	try {
		const { data } = await axios.get(apiUrl + "/public/get/privecy", {
			timeout: 5000
		});
		return {
			props: {
				appData: data.appData
			},
			revalidate: 3600
		};
	} catch (error) {
		console.warn('Failed to fetch privacy content during build:', error.message);
		return {
			props: {
				appData: {
					description: "<p>Privacy policy will be loaded from the backend when available.</p>"
				}
			},
			revalidate: 60
		};
	}
}

export default PrivacyPolicy;
