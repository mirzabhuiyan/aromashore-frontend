import React, { useState, useEffect, useContext, useRef } from "react";
import Layout from "../../layouts/Layout";
import PopularProduct from "../../components/common/PopularProduct";
import SimilarProduct from "../../components/common/SimilarProduct";
import ProductBundle from "../../components/shop/ProductBundle";
import { apiUrl, getImageUrl } from "../../config";
import { AppStore } from "../../store/AppStore";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import Cart from "./Icons";
import parse from "html-react-parser";
import Image from "next/image";
import { useRouter } from "next/router";

function AddToCart({ ...props }) {
	const [status, setStatus] = React.useState("removed");

	useEffect(() => {
		if (status === "adding") {
			const id = setTimeout(() => {
				setStatus("removed");
			}, 2000);

			return () => {
				clearTimeout(id);
			};
		}
	}, [status]);

	function handleClickX() {
		if (status === "removed") {
			setStatus("adding");

		} else if (status === "added") {
			setStatus("removed");
		}
	}

	return (
		<button className={`add-to-cart_ ${status}`} type='button' style={{ border: "1px solid #8abc41" }} aria-live='polite' {...props} onClick={handleClickX}>
			<span className='removed text' aria-hidden={status !== "removed" ? "true" : "false"}>
				{status === "removed" ? "Add to Cart" : "Adding..."}
			</span>
			{status === "adding" && (
				<span aria-hidden='true' className='dotdotdot'>
					<span className='dot one' />
					<span className='dot two' />
					<span className='dot three' />
				</span>
			)}
			<Cart aria-hidden='true' className='cart-icon' />
		</button>
	);
}

function ProductDetail() {
	const { add_TO_CART } = useContext(AppStore);
	const [tabType, setTabType] = useState(1);
	const [isModalOpen, setModalOpen] = useState(false);
	const [qty, setQty] = useState(1);
	const [productpro, setProductpro] = useState(null);
	const ref = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const query = router.query;
	const [productDetails, setProductDetails] = useState(null);
	const [productReturnPolicyDetails, setProductReturnPolicyDetails] = useState(null);

	const [avgRatingRange, setAvgRatingRange] = useState([]);
	const [avgNonRatingRange, setAvgNonRatingRange] = useState([]);
	const [totalReviewers, setTotalReviewers] = useState(0);

	const [selectedRatings, setSelectedRatings] = useState(0);
	const [reviewText, setReviewText] = useState('');


	// let avgRatingRangeArray = [];
	// let avgNonRatingRangeArray = [];

	const ratingsList = [
		{ value: 1, label: 'far fa-star fa-lg text-secondary', hoverLabel: 'fas fa-star fa-lg text-warning' },
		{ value: 2, label: 'far fa-star fa-lg text-secondary', hoverLabel: 'fas fa-star fa-lg text-warning' },
		{ value: 3, label: 'far fa-star fa-lg text-secondary', hoverLabel: 'fas fa-star fa-lg text-warning' },
		{ value: 4, label: 'far fa-star fa-lg text-secondary', hoverLabel: 'fas fa-star fa-lg text-warning' },
		{ value: 5, label: 'far fa-star fa-lg text-secondary', hoverLabel: 'fas fa-star fa-lg text-warning' }
	];

	useEffect(() => {
		axios.get(apiUrl + "/web/get/product/" + Number(query.productid)).then((response) => {
			if (response.data.appStatus) {
				const prodDetails = response.data.appData;
				let totalReviewersNumber = 0;
				let totalRating = 0;
				console.log('prodDetails ------->', prodDetails);
				setProductDetails(prodDetails);
				if (prodDetails.productproperties && prodDetails.productproperties.length > 0) {
					setProductpro(prodDetails.productproperties[0]);
				}

				if (prodDetails.productreviews && prodDetails.productreviews.length > 0) {
					setTotalReviewers(prodDetails.productreviews.length);
					prodDetails.productreviews.forEach(function (item) {
						totalReviewersNumber++;
						totalRating = totalRating + item.ratings;
					});
				}
				console.log('totalReviewersNumber -----', totalReviewersNumber)
				let avgRating = 0;
				let totalRatingFrac = 0;
				if (totalReviewersNumber) {
					let frac = totalRating % totalReviewersNumber;
					avgRating = (totalRating - frac) / totalReviewersNumber;
					totalRatingFrac = frac / 10;
				}
				let avgRatingRangeArray = Array.from({ length: avgRating }, (_, index) => {
					console.log('avgRatingRange -----', index)
					return index + 1;
				});
				let avgNonRatingRangeArray = Array.from({ length: 5 - avgRating }, (_, index) => {
					console.log('avgNonRatingRange -----', index)
					return index + 1;
				});
				setAvgRatingRange(avgRatingRangeArray);
				setAvgNonRatingRange(avgNonRatingRangeArray);
				setIsLoading(false);
			} else {
				setProductDetails(null);
			}
			// setTotalReviewers(totalReviewersNumber);
		});

		axios.get(apiUrl + "/public/get/return-policy").then((response) => {
			console.log(response);
			if (response.data.appStatus) {
				const prodReturnPolicyDetails = response.data.appData;
				console.log(prodReturnPolicyDetails);
				setProductReturnPolicyDetails(prodReturnPolicyDetails)
			} else {
				setProductReturnPolicyDetails(null);
			}
		}).catch((error) => {
			console.log(error);
			setProductReturnPolicyDetails(null);
		});
	}, [query.productid]);

	const getStars = (rating) => {
		switch (rating) {
			case 1:
				return (<>
					<i className='fas fa-star fa-lg text-warning'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
				</>);
			case 2:
				return (<>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
				</>);
			case 3:
				return (<>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
				</>);
			case 4:
				return (<>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='far fa-star text-secondary'></i>
				</>);
			case 5:
				return (<>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
					<i className='fas fa-star text-warning'></i>
				</>);
			default:
				return (<>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
					<i className='far fa-star text-secondary'></i>
				</>);
		}
	}

	const handleChangeProperty = (e) => {
		let findproductpro = productDetails.productproperties.find((item) => item.id == e.target.value);
		console.log('handleChangeProperty ------->', findproductpro)
		setProductpro(findproductpro);
	};

	const handleClick = () => {
		setTabType(3);
		ref.current?.scrollIntoView({ behavior: "smooth" });
	};

	// const addToCartHandler = (obj) => {
	// 	setCartStatus(true);
	// 	const id = setTimeout(() => {
	// 		add_TO_CART(obj);
	// 		setCartStatus(false);
	// 	}, 1000);
	// 	return () => {
	// 		clearTimeout(id);
	// 	};
	// };

	const getSelectedRatings = (ratings) => {
		setSelectedRatings(ratings);
	}

	const submitReview = () => {
		const payload = {
			ratings: selectedRatings,
			review: reviewText
		};
		console.log(payload);
	}

	return (
		<>
			<Layout>
				<div className='breadcrumb'>
					<div className='container mt-2'>
						<ul className='mb-2 p-0'>
							<li>
								<Link href='/'>Home</Link>
							</li>
							<li>
								<Link href='/shop'>Shop</Link>
							</li>
							<li className='active'>Product Detail</li>
						</ul>
					</div>
				</div>
				{isLoading ? (
					<div className='p-5 m-5 text-center'>
						<i className='fa fa-spinner fa-spin fa-lg me-3'></i>Loading Product Details...
					</div>
				) : (
					<>
						<div className='shop'>
							{productDetails === null ? <></> :
								<div className='container mt-5'>
									<div className='row'>
										<div className='col-12 col-md-6'>
											<div className='product-detail__slide-two'>
												<div className='product-detail__slide-two__big'>
													{productDetails.productimages && productDetails.productimages.length > 0 ? (
														<Swiper slidesPerView={1}>
															{productDetails.productimages.map((item, index) => {
																return (
																	<SwiperSlide key={index}>
																		<div key={item.id} className='slider__item'>
																			<img 
																				crossOrigin="anonymous" 
																				src={getImageUrl(item.image)} 
																				alt={item.name} 
																				width={500} 
																				height={500} 
																			/>
																		</div>
																	</SwiperSlide>
																);
															})}
														</Swiper>
													) : (
														<Swiper slidesPerView={1}>
															<SwiperSlide>
																<div className='slider__item'>
																	<img src='/app/assets/images/200.svg' alt='Placeholder' width={500} height={500} />
																</div>
															</SwiperSlide>
														</Swiper>
													)}
												</div>
												<div className='product-detail__slide-two__small'></div>
											</div>
										</div>
										<div className='col-12 col-md-6'>
											<div>
												<div className="d-flex justify-content-between">
													<div>
														<h2>{productDetails.name}</h2>
														<h6 className='text-secondary mb-1'>
															{productDetails.productcategory ? productDetails.productcategory.category_name : "Anonymous"}
														</h6>
														<h6 className='text-secondary mb-2'>SKU: {productpro ? (
															productpro.variation_no ? (
																productpro.variation_no
															) : (
																productDetails.product_no
															)
														) : (
															productDetails.product_no
														)}</h6>
													</div>
													<div className="d-flex flex-column justify-content-start pt-2" style={{ minWidth: 120 }}>
														<div onClick={handleClick}>
															{
																avgRatingRange.map((item, i) => <i key={i} className='fas fa-star fa-lg text-warning'></i>)
															}
															{
																avgNonRatingRange.map((item, i) => <i key={i} className='far fa-star fa-lg text-secondary'></i>)
															}
															{/* <span>&nbsp;({totalReviewers})</span> */}
														</div>
														<div className="text-end mt-3">
															<i className='fab fa-facebook-square fa-2x me-2'></i>
															<i className='fab fa-twitter-square fa-2x'></i>
														</div>
														{/* <p>{totalReviewers} Review</p>
												<button href='#'className='review-btn'>
													Write a Review
												</button> */}
													</div>
												</div>
												<hr />
												<div className='d-flex justify-content-between align-items-center'>
													<span>
														Size
														<select
															name='unit_name'
															onChange={(e) => {
																handleChangeProperty(e);
															}}
															className='product-dropdown'>
															{productDetails.productproperties &&
																productDetails.productproperties.map((item, i) =>
																	<option key={i} value={item.id}>
																		{item.size} {item.size_unit}
																	</option>
																)}
														</select>
													</span>
													<div className='quantity-controller -border -round'>
														<div
															onClick={() => {
																setQty((pre) => {
																	return pre > 1 ? pre - 1 : 1;
																});
															}}
															className='quantity-controller__btn -descrease'>
															<i className='fas fa-minus fa-sm'></i>
														</div>
														<div className='quantity-controller__number'>{qty}</div>
														<div
															onClick={() => {
																setQty((pre) => {
																	return pre + 1;
																});
															}}
															className='quantity-controller__btn -increase'>
															<i className='fas fa-plus fa-sm'></i>
														</div>
													</div>
													<h5>
														$
														{productpro ? (
															productpro.sale_price > 0 ? (
																<>
																	{productpro.sale_price * qty}&nbsp;&nbsp;
																	<del className="text-danger">${productpro.price}</del>
																</>
															) : (
																productpro.price * qty
															)
														) : (
															0
														)}
													</h5>

												</div>
												<hr />
												<div className='product-detail__content'>
													<div className='product-detail__content__footer'>
														<div className='product-detail__controller__box'>
															<a className='wishbtn -round -white' href='#'>
																<i className='fas fa-heart'></i>
															</a>
															<div
																className='cart-main'
																onClick={() =>
																	add_TO_CART({
																		productDetails,
																		unit: {
																			...productpro,
																			qty: qty
																		},
																		bundleId: null
																	})
																}>
																<AddToCart />
															</div>
														</div>
														{productpro ? <ProductBundle productId={Number(query.productid)} selectedProperty={productpro} /> : <></>}
													</div>
												</div>
											</div>
										</div>
									</div>
									<hr />
									<div className="row">
										<div className="col-12 col-sm-12">
											<div className='product-detail__content__tab'>
												<ul className='tab-content__header'>
													<li onClick={() => setTabType(1)} className={tabType == 1 ? 'active tab-switcher' : 'tab-switcher'}>
														Description
													</li>
													<li onClick={() => setTabType(2)} className={tabType == 2 ? 'active tab-switcher' : 'tab-switcher'}>
														Shipping & Returns
													</li>
													<li ref={ref} onClick={() => setTabType(3)} className={tabType == 3 ? 'active tab-switcher' : 'tab-switcher'}>
														Reviews ({totalReviewers})
													</li>
												</ul>
												<div id='allTabsContainer'>
													{tabType == 1 && <div className='tab-content__item -description'>{productDetails.productdetail ? parse(productDetails.productdetail.description) : "--"}</div>}
													{tabType == 2 && (
														<div className='tab-content__item -ship'>
															{productReturnPolicyDetails != null ? <>
																<h3 className="mb-2">{productReturnPolicyDetails.title}</h3>
																<h6 className="mb-4">{productReturnPolicyDetails.sub_title}</h6>
																<p>{parse(productReturnPolicyDetails.description)}</p>
															</> : <></>}
														</div>
													)}
													{tabType == 3 && (
														<div className='tab-content__item -review'>
															<form>
																{/* <h5>Write a review</h5> */}
																<div className='row'>
																	<div className='col-12 text-end'>
																		<button type="button" className='btn -dark' onClick={(e) => { e.preventDefault(); setModalOpen(true) }}>Write a review</button>
																		<Modal show={isModalOpen} onHide={() => setModalOpen(false)}>
																			<Modal.Header closeButton>
																				<Modal.Title>Write a Review</Modal.Title>
																			</Modal.Header>
																			<Modal.Body>
																				<form>
																					<div className='row'>
																						<div className='col-12 col-md-12'>
																							Ratings: ({selectedRatings})
																							<br />
																							{ratingsList.map(rl => <i onMouseEnter={() => getSelectedRatings(rl.value)} key={rl.value} className={rl.value <= selectedRatings ? rl.hoverLabel : rl.label}></i>)}
																						</div>
																						<div className='col-12'>
																							<div className='input-validator'>
																								<textarea className='review-textarea' name='review' placeholder='Enter Review' rows='5' onChange={(e) => setReviewText(e.target.value)}></textarea>
																							</div>
																							<span className='input-error'></span>
																						</div>
																					</div>
																				</form>
																			</Modal.Body>
																			<Modal.Footer>
																				<Button variant='danger' onClick={() => setModalOpen(false)}>
																					Close
																				</Button>
																				<Button variant='secondary' disabled={selectedRatings <= 0 || reviewText == '' || reviewText == null} onClick={submitReview}>
																					Submit
																				</Button>
																			</Modal.Footer>
																		</Modal>
																	</div>
																</div>
															</form>
															<hr />
															{
																productDetails.productreviews.length > 0 ?
																	<>{productDetails.productreviews.map(pReview =>
																		<div key={pReview.id} className="card card-body mb-2">
																			<div className="d-flex justify-content-between">
																				<h6>{pReview.customer.firstname}&nbsp;{pReview.customer.lastname} on <code className="text-secondary"><i>{pReview.createdAt}</i></code></h6>
																				<h6>{getStars(pReview.ratings)}</h6>
																			</div>
																			<p className="mb-0">{pReview.review}</p>
																		</div>
																	)}
																	</> : <>No Review Given!</>
															}
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							}
						</div>
						{
							productDetails.productbrand && productDetails.productbrand.id ? (
								<>
									{console.log('Product brand info:', productDetails.productbrand)}
									<SimilarProduct brandId={productDetails.productbrand.id} currentProductId={productDetails.id} />
								</>
							) : (
								<>
									{console.log('No product brand found:', productDetails.productbrand)}
									<></>
								</>
							)
						}
						<PopularProduct />
					</>
				)}
			</Layout>
		</>
	);
}

export default ProductDetail;

// export async function getServerSideProps(context) {
// 	const { productid } = context.query;
// 	try {
// 		const { data: productDetails } = await axios.get(apiUrl + "/web/get/product/" + productid);
// 		return {
// 			props: {
// 				product: productDetails.appData
// 			}
// 		};
// 	} catch (error) {}
// }
