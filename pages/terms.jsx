import React from "react";
import Layout from "../layouts/Layout";
import { buildTimeApiCall, fallbackContent } from "../utils/buildTimeApi";
import parse from "html-react-parser";
import Link from "next/link";

function TermsCondition({ appData }) {
	const descriptionHtml = appData && typeof appData.description === 'string' ? appData.description : null;
	return (
		<Layout title='Terms & Condition'>
			<>
				<div className='breadcrumb'>
					<div className='container mt-2'>
						<ul className='p-0 mb-2'>
							<li>
								<Link href='/'>Home</Link>
							</li>
							<li className='active'>Terms & Condition</li>
						</ul>
					</div>
				</div>
				<div className='container mb-5'>
					<div className="row">
						<div className="col-12">
							<h2>Terms & Condition</h2>
							<hr />
						</div>
					</div>
					<div className='row'>
						<div className='col-12'>{descriptionHtml ? parse(descriptionHtml) : "Terms and conditions content loading..."}</div>
					</div>
				</div>
			</>
		</Layout>
	);
}

export async function getStaticProps() {
	return await buildTimeApiCall(
		"/public/get/terms-condition",
		fallbackContent.terms,
		5000
	);
}

export default TermsCondition;
