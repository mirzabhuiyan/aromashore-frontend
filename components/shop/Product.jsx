import { useState, useContext } from "react";
import { AppStore } from "../../store/AppStore";
import Link from "next/link";
// import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Image from "next/image";
import { globalProductImageAddress } from '../../config';

export default function Product({ product, viewType = true, shopPage = false }) {
	// console.log(product)
	// const { add_TO_CART } = useContext(AppStore);
	// const [tabType, setTabType] = useState(1);
	// const [qty, setQty] = useState(1);
	const { id, product_no, name, productcategory, productbrand, productdetail, productreviews, productimages, productproperties } = product;

	let totalReviewers = 0;
	let totalRating = 0;
	productreviews.forEach(function (item) {
		totalReviewers++;
		totalRating = totalRating + item.ratings;
	});
	let avgRating = 0;
	let totalRatingFrac = 0;
	if (totalReviewers) {
		let frac = totalRating % totalReviewers;
		avgRating = (totalRating - frac) / totalReviewers;
		totalRatingFrac = frac / 10;
	}
	let avgRatingRange = Array.from({ length: avgRating }, (_, index) => {
		return index + 1;
	});
	let avgNonRatingRange = Array.from({ length: 5 - avgRating }, (_, index) => {
		return index + 1;
	});

	const productpro = productproperties.length > 0 ? productproperties[0] : [];

	return (
		<>
			{viewType ? (
				<div className={shopPage ? "col-12 col-md-6 col-lg-4 col-xl-3 mb-4" : "p-0"}>
					<Card className='shadow'>
						<Card.Body>
							<div>
								{/* {productproperties.length <= 0 ? (
									<div className='product-type'>
										<h5 className='-new p-2 bg-danger'>No Properties</h5>
									</div>
								) : (
									<></>
								)} */}
								<div className='product-thumb'>
									<Link href={"/products/" + id}>
										<span className='product-thumb__image'>{productimages[0] ? <img crossOrigin="anonymous" src={`${globalProductImageAddress}${productimages[0]?.image_link}`} alt={productimages[0]?.name} width={250} height={250} /> : <img src='/app/assets/images/200.svg' alt='Placeholder' width={250} height={250} />}</span>
									</Link>
									<div className='product-thumb__actions'>
										{/* <div className='product-btn'>
											<a
												onClick={() => {
													add_TO_CART({
														product,
														unit: {
															...productpro,
															qty: qty
														}
													});
												}}
												className='btn -white product__actions__item -round product-atc'
												href='#'>
												<i className='fas fa-shopping-bag'></i>
											</a>
										</div> */}
										<div className='product-btn eye-icon'>
											<Link href={"/products/" + id}>
												<span className='btn -white product__actions__item -round product-qv'>
													<i className='fas fa-eye'></i>
												</span>
											</Link>
										</div>
										<div className='product-btn'>
											<a className='btn -white product__actions__item -round' href='#'>
												<i className='fas fa-heart'></i>
											</a>
										</div>
									</div>
								</div>
								<div className='product-content'>
									<div className='product-content__header'>
										<div className='product-category text-uppercase'>{productcategory.category_name}</div>
										<div className='rate'>
											{avgRatingRange.map((item, i) => {
												return <i key={i} className='fas fa-star text-warning'></i>;
											})}
											{avgNonRatingRange.map((item, i) => {
												return <i key={i} className='far fa-star text-secondary'></i>;
											})}
											{/* <span>({totalReviewers})</span> */}
										</div>
									</div>
									<Link href={"/products/" + id}>
										<span className='product-name'>{name}</span>
									</Link>
								</div>
							</div>
						</Card.Body>
					</Card>
				</div>
			) : (
				<div className='col-12 col-md-6 mb-4'>
					<Card className='shadow'>
						<Card.Body>
							<div className='row'>
								<div className='col-12 col-md-5'>
									<Link href={"/products/" + id}>
										<span className='product-thumb__image'>{productimages.length > 0 ? <img crossOrigin="anonymous" src={`${globalProductImageAddress}${productimages[0]?.image_link}`} alt={productimages[0]?.name} width={250} height={250} /> : <img src='/app/assets/images/200.svg' alt='Placeholder' width={250} height={250} />}</span>
									</Link>
								</div>
								<div className='col-12 col-md-7'>
									<h6 className='mt-3 text-muted text-uppercase'>{productcategory.category_name}</h6>
									<div className='product-content__header'>
										<div className='rate'>
											{avgRatingRange.map((item, i) => {
												return <i key={i} className='fas fa-star'></i>;
											})}
											{avgNonRatingRange.map((item, i) => {
												return <i key={i} className='far fa-star'></i>;
											})}
										</div>
									</div>
									<Link href={"/products/" + id}>
										<span className='product-name'>{name}</span>
									</Link>
									<div>
										{/* <div className='product-btn'>
											<a
												onClick={() => {
													add_TO_CART({
														product,
														unit: {
															...productpro,
															qty: qty
														}
													});
												}}
												className='btn -white product__actions__item -round product-atc'
												href='#'>
												<i className='fas fa-shopping-bag'></i>
											</a>
										</div> */}
										<div className='product-btn eye-icon'>
											<Link href={"/products/" + id}>
												<span className='btn -white product__actions__item -round product-qv'>
													<i className='fas fa-eye'></i>
												</span>
											</Link>
										</div>
										<div className='product-btn'>
											<a className='btn -white product__actions__item -round' href='#'>
												<i className='fas fa-heart'></i>
											</a>
										</div>
									</div>
								</div>
							</div>
						</Card.Body>
					</Card>
				</div>
			)}
		</>
	);
}
