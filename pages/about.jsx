import React from "react";
import Layout from "../layouts/Layout";
import axios from "axios";
import {apiUrl} from "../config";
import parse from "html-react-parser";
import Link from "next/link";

function AboutUs({ appData }) {
	return (
		<Layout title='About Page'>
			<>
				<div className='breadcrumb'>
					<div className='container mt-2'>
						<ul className='p-0 mb-2'>
							<li>
								<Link href='/'>Home</Link>
							</li>
							<li className='active'>About Us</li>
						</ul>
					</div>
				</div>
				<div className='container mb-5'>
					<div className="row">
						<div className="col-12">
							<h2>About Us</h2>
							<hr />
						</div>
					</div>
					<div className='row'>
						<div className='col-12'>{appData != null ? parse(appData.description) : "Content loading..."}</div>
					</div>
				</div>
			</>
		</Layout>
	);
}

export async function getStaticProps() {
	// During build time, don't make API calls if backend is not available
	if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL?.includes('localhost')) {
		// For production builds, return static content or fetch from a reliable source
		return {
			props: {
				appData: {
					description: "<p>Welcome to Aromashore - your premier destination for luxury fragrances and aromatherapy products.</p>"
				}
			},
			revalidate: 3600 // Revalidate every hour
		};
	}

	// For development or when backend is available
	try {
		const { data } = await axios.get(apiUrl + "/public/get/about", {
			timeout: 5000 // 5 second timeout
		});
		return {
			props: {
				appData: data.appData
			},
			revalidate: 3600 // Revalidate every hour
		};
	} catch (error) {
		console.warn('Failed to fetch about content during build:', error.message);
		return {
			props: {
				appData: {
					description: "<p>Welcome to Aromashore - your premier destination for luxury fragrances and aromatherapy products.</p>"
				}
			},
			revalidate: 60 // Revalidate every minute on error
		};
	}
}

export default AboutUs;
