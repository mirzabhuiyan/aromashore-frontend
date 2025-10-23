import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import {apiUrl} from "../../config";
import Image from "next/image";

export default function Slider() {
	const [banners, setBanner] = useState([]); //state.banners;
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios.get(apiUrl + "/public/get/banner").then((response) => {
			console.log(response);
			if (response.data.appStatus) {
				setBanner(response.data.appData);
				setIsLoading(false);
			}
		});
	}, []);

	return (
		<>
			{isLoading ? (
				<div className='col-12 text-center'>
					<i className='fa fa-spinner fa-spin me-2'></i>Loading Banner...
				</div>
			) : (
				<div className='slider -style-1 slider-arrow-middle'>
					<div className='slider__carousel'>
						<Swiper slidesPerView={1}>
							{banners &&
								banners.map((banner, index) => {
									return (
										<SwiperSlide key={index}>
											<div className='slider__carousel__item slider-1' key={index}>
												<div className='container'>
													<div className='slider-background'>
														<img className='slider-background' src={banner.image} alt={banner.title} layout='fill' />
													</div>
													<div className='slider-content'>
														<h5 style={{ color: "#202020", marginBottom: 0 }} className='slider-content__subtitle'>
															{banner.sub_title}
														</h5>
														<h2 style={{ color: "#8abc41", marginBottom: 0 }} className='slider-content__title'>
															{banner.title}
														</h2>
														{/* <div>
                          <a className="btn -red" href="#">
                            Appointment
                          </a>
                        </div> */}
													</div>
												</div>
											</div>
										</SwiperSlide>
									);
								})}
						</Swiper>
					</div>
				</div>
			)}
		</>
	);
}
