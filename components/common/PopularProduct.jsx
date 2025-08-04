import { useState, useEffect } from "react";
import Slider from "react-slick";
import Link from "next/link";
import axios from "axios";
import {apiUrl, globalProductImageAddress} from "../../config";

// Helper function to get proper product image URL
const getProductImageUrl = (imageData) => {
  if (!imageData) return "/app/assets/images/200.svg";
  
  // Handle both old base64 and new file-based images
  if (imageData.startsWith('data:')) {
    return imageData; // Base64 image
  } else if (imageData.startsWith('http')) {
    return imageData; // Already a full URL
  } else {
    return `${globalProductImageAddress}${imageData}`; // File-based image
  }
};
import Product from "../shop/Product";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";

const NextArrow = ({ onClick }) => {
	return (
		<div onClick={onClick} className='slick-next slick-arrow' style={{}}>
			<i className='far fa-chevron-right'></i>
		</div>
	);
};

const PrevArrow = ({ onClick }) => {
	return (
		<div onClick={onClick} className='slick-prev slick-arrow' style={{}}>
			<i className='far fa-chevron-left'></i>
		</div>
	);
};

export default function PopularProduct({ categoryId = null }) {
	const settings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1
	};

	const [productList, setProductList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios
			.get(apiUrl + "/web/getall-by-popularity")
			.then((response) => {
				console.log("/web/getall-by-popularity", response)
				if (response.data.appStatus) {
					setProductList(response.data.appData);
				} else {
					setProductList([]);
				}
				setIsLoading(false);
			});
	}, []);

	return (
		<div className='product-slide'>
			<div className='container'>
				<div className='section-title -center' style={{ marginBottom: "1.875em" }}>
					<h2>Popular Product</h2>
				</div>
				<div className='row'>
					<div className='col-12'>
						<div className='product-slider'>
							<div className='product-slide__wrapper'>
								{isLoading ? (
									<div className='text-center'>
										<i className='fa fa-spinner fa-spin me-2'></i>
										Loading Related Products...
									</div>
								) : (
									<Swiper slidesPerView={1} autoplay={true}>
										{productList.map((product, index) => {
											console.log(product, index);
											return (
												<SwiperSlide key={product.id}>
													{product.productimages[0] ? <img src={getProductImageUrl(product.productimages[0]?.image)} alt={product.productimages[0]?.name} width={250} height={250} /> : <img src='/app/assets/images/200.svg' alt='Placeholder' width={250} height={250} />}
												</SwiperSlide>
											)
										}
										)}
									</Swiper>
									// <Slider  {...settings}>
									// 	{productList.map((product) => {
									// 		return <Product key={product.id} product={product} />;
									// 	})}
									// </Slider >
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
