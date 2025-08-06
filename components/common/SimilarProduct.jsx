import { useState, useEffect } from "react";
import SlickSlider from "react-slick";
import Link from "next/link";
import axios from "axios";
import {apiUrl} from "../../config";
import Product from "../shop/Product";

const NextArrow = ({ onClick }) => {
	return (
		<div className="arrow-wrapper" style={{
			position: 'absolute',
			right: '-60px',
			top: '50%',
			transform: 'translateY(-50%)',
			zIndex: 10
		}}>
			<div className="styled-wrapper">
				<button className="button" onClick={onClick}>
					<div className="button-box">
						<svg className="button-elem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						<svg className="button-elem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</div>
				</button>
			</div>
			<style jsx>{`
				.styled-wrapper .button {
					display: block;
					position: relative;
					width: 76px;
					height: 76px;
					margin: 0;
					overflow: hidden;
					outline: none;
					background-color: transparent;
					cursor: pointer;
					border: 0;
				}

				.styled-wrapper .button:before {
					content: "";
					position: absolute;
					border-radius: 50%;
					inset: 7px;
					border: 3px solid black;
					transition:
						opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
						transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
				}

				.styled-wrapper .button:after {
					content: "";
					position: absolute;
					border-radius: 50%;
					inset: 7px;
					border: 4px solid #599a53;
					transform: scale(1.3);
					transition:
						opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
						transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
					opacity: 0;
				}

				.styled-wrapper .button:hover:before,
				.styled-wrapper .button:focus:before {
					opacity: 0;
					transform: scale(0.7);
					transition:
						opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
						transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
				}

				.styled-wrapper .button:hover:after,
				.styled-wrapper .button:focus:after {
					opacity: 1;
					transform: scale(1);
					transition:
						opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
						transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
				}

				.styled-wrapper .button-box {
					display: flex;
					position: absolute;
					top: 0;
					left: -69px;
					width: 100%;
					height: 100%;
				}

				.styled-wrapper .button-elem {
					display: block;
					width: 30px;
					height: 30px;
					margin: 24px 18px 0 22px;
					transform: rotate(360deg);
					fill: black;
					color: black;
					flex-shrink: 0;
				}

				.styled-wrapper .button:hover .button-box,
				.styled-wrapper .button:focus .button-box {
					transition: 0.4s;
					transform: translateX(69px);
				}
			`}</style>
		</div>
	);
};

const PrevArrow = ({ onClick }) => {
	return (
		<div className="arrow-wrapper" style={{
			position: 'absolute',
			left: '-50px',
			top: '50%',
			transform: 'translateY(-50%)',
			zIndex: 10
		}}>
			<div className="styled-wrapper">
				<button className="button" onClick={onClick}>
					<div className="button-box">
						<svg className="button-elem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						<svg className="button-elem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</div>
				</button>
			</div>
			<style jsx>{`
				.styled-wrapper .button {
					display: block;
					position: relative;
					width: 76px;
					height: 76px;
					margin: 0;
					overflow: hidden;
					outline: none;
					background-color: transparent;
					cursor: pointer;
					border: 0;
				}

				.styled-wrapper .button:before {
					content: "";
					position: absolute;
					border-radius: 50%;
					inset: 7px;
					border: 3px solid black;
					transition:
						opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
						transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
				}

				.styled-wrapper .button:after {
					content: "";
					position: absolute;
					border-radius: 50%;
					inset: 7px;
					border: 4px solid #599a53;
					transform: scale(1.3);
					transition:
						opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
						transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
					opacity: 0;
				}

				.styled-wrapper .button:hover:before,
				.styled-wrapper .button:focus:before {
					opacity: 0;
					transform: scale(0.7);
					transition:
						opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
						transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
				}

				.styled-wrapper .button:hover:after,
				.styled-wrapper .button:focus:after {
					opacity: 1;
					transform: scale(1);
					transition:
						opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
						transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
				}

				.styled-wrapper .button-box {
					display: flex;
					position: absolute;
					top: 0;
					left: 0;
				}

				.styled-wrapper .button-elem {
					display: block;
					width: 30px;
					height: 30px;
					margin: 24px 18px 0 22px;
					transform: rotate(360deg);
					fill: black;
					color: black;
				}

				.styled-wrapper .button:hover .button-box,
				.styled-wrapper .button:focus .button-box {
					transition: 0.4s;
					transform: translateX(-69px);
				}
			`}</style>
		</div>
	);
};

export default function SimilarProduct({ brandId = null, currentProductId = null }) {
	const settings = {
		dots: false,
		infinite: true,
		speed: 500,
		slidesToShow: 4,
		slidesToScroll: 1,
		autoplay: true,
		autoplaySpeed: 3000,
		nextArrow: <NextArrow />,
		prevArrow: <PrevArrow />,
		responsive: [
			{
				breakpoint: 1200,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 768,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
				}
			}
		]
	};

	const [productList, setProductList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		console.log('=== SimilarProduct Debug ===');
		console.log('brandId:', brandId);
		console.log('currentProductId:', currentProductId);
		console.log('brandId type:', typeof brandId);
		
		if (!brandId) {
			console.log('SimilarProduct: No brandId provided, skipping API call');
			setIsLoading(false);
			return;
		}
		
		// Build API URL with query parameters
		let apiUrlWithParams = apiUrl + "/web/getall-by-brand/" + brandId;
		if (currentProductId) {
			apiUrlWithParams += "?excludeProductId=" + currentProductId;
		}
		
		console.log('API URL:', apiUrlWithParams);
		
		axios
			.get(apiUrlWithParams)
			.then((response) => {
				console.log('=== SimilarProduct API Response ===');
				console.log('Response status:', response.status);
				console.log('Response data:', response.data);
				console.log('appStatus:', response.data.appStatus);
				console.log('appMessage:', response.data.appMessage);
				console.log('appData length:', response.data.appData ? response.data.appData.length : 'undefined');
				
				if (response.data.appStatus) {
					console.log('SimilarProduct: Found', response.data.appData.length, 'products');
					if (response.data.appData.length > 0) {
						console.log('First product:', response.data.appData[0]);
						console.log('All products:', response.data.appData);
					}
					setProductList(response.data.appData);
				} else {
					console.log('SimilarProduct: No products found -', response.data.appMessage);
					setProductList([]);
				}
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('=== SimilarProduct API Error ===');
				console.error('Error:', error);
				console.error('Error response:', error.response);
				setProductList([]);
				setIsLoading(false);
			});
	}, [brandId, currentProductId]);

	return (
		<div className='product-slide'>
			<style jsx>{`
				/* Simple, working styles */
				.arrow-wrapper {
					position: absolute;
					z-index: 10;
				}
			`}</style>
			<div className='container'>
				<div className='section-title -center' style={{ marginBottom: "1.875em" }}>
					<h2>You may also like</h2>
				</div>
				<div className='row'>
					<div className='col-12'>
						<div className='product-slider'>
							<div className='product-slide__wrapper' style={{ position: 'relative' }}>
								{!brandId ? (
									<div className='text-center'>
										<p>No brand information available for similar products.</p>
									</div>
								) : isLoading ? (
									<div className='text-center'>
										<i className='fa fa-spinner fa-spin me-2'></i>
										Loading Related Products...
									</div>
								) : productList.length > 0 ? (
									<SlickSlider {...settings}>
										{productList.map((product) => {
											return <Product key={product.id} product={product} />;
										})}
									</SlickSlider>
								) : (
									<div className='text-center'>
										<p>No similar products found for this brand.</p>
										<small className='text-muted'>Brand ID: {brandId}</small>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
