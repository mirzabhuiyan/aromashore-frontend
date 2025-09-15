import React from "react";
import Layout from "../layouts/Layout";
import { buildTimeApiCall, fallbackContent } from "../utils/buildTimeApi";
import parse from "html-react-parser";
import Link from "next/link";

function AboutUs({ appData }) {
	const descriptionHtml = appData && typeof appData.description === 'string' ? appData.description : null;
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
						<div className='col-12'>{descriptionHtml ? parse(descriptionHtml) : "Content loading..."}</div>
					</div>
				</div>
			</>
		</Layout>
	);
}

export async function getStaticProps() {
	return await buildTimeApiCall(
		"/public/get/about",
		fallbackContent.about,
		5000
	);
}

export default AboutUs;
