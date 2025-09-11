import React from "react";
import Layout from "../layouts/Layout";
import parse from "html-react-parser";
import Link from "next/link";
import { buildTimeApiCall, fallbackContent } from "../utils/buildTimeApi";

function ReturnPolicy({ appData }) {
	return (
		<Layout title='Return Policy'>
			<>
				<div className='breadcrumb'>
					<div className='container mt-2'>
						<ul className='p-0 mb-2'>
							<li>
								<Link href='/'>Home</Link>
							</li>
							<li className='active'>Return Policy</li>
						</ul>
					</div>
				</div>
				<div className='container mb-5'>
					<div className="row">
						<div className="col-12">
							<h2>Return Policy</h2>
							<hr />
						</div>
					</div>
					<div className='row'>
						<div className='col-12'>{appData != null ? parse(appData.description) : "Return policy content loading..."}</div>
					</div>
				</div>
			</>
		</Layout>
	);
}

export async function getStaticProps() {
	return await buildTimeApiCall(
		"/public/get/return-policy",
		fallbackContent.returnPolicy,
		5000 // 5 second timeout
	);
}

export default ReturnPolicy;
