import { useState, useContext } from "react";
import { AppStore } from "../../store/AppStore";
import Link from "next/link";
// import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Image from "next/image";
import { getProductImageUrl } from '../../config';
import { formatPriceWithCurrency } from '../../utils/priceFormatter';

export default function Product({ product, viewType = true, shopPage = false }) {
	const { customerData } = useContext(AppStore);
	const isDistributor = customerData?.customercategory?.title?.toLowerCase() === "distributor";
	// console.log(product)
	// const { add_TO_CART } = useContext(AppStore);
	// const [tabType, setTabType] = useState(1);
	// const [qty, setQty] = useState(1);
	const { id, product_no, name, productcategory, productbrands, productdetail, productreviews, productimages, productproperties } = product;
	
	// Handle both productbrand (singular) and productbrands (plural) for compatibility
	const productbrand = productbrands && Array.isArray(productbrands) && productbrands.length > 0 ? productbrands[0] : productbrands;

	let totalReviewers = 0;
	let totalRating = 0;
	if (productreviews && Array.isArray(productreviews)) {
		productreviews.forEach(function (item) {
			totalReviewers++;
			totalRating = totalRating + item.ratings;
		});
	}
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

	const productpro = productproperties && Array.isArray(productproperties) && productproperties.length > 0 ? productproperties[0] : {};

	// Determine which price to show
	const displayPrice = isDistributor && productpro.dist_price
		? productpro.dist_price
		: productpro.sale_price > 0
			? productpro.sale_price
			: productpro.price;

	return (
		<>
			<style jsx>{`
				/* Mobile responsive fixes for product cards */
				@media (max-width: 576px) {
					.product-content__header {
						margin-bottom: 8px !important;
					}
					
					.product-category {
						font-size: 12px !important;
						margin-bottom: 4px !important;
						line-height: 1.2 !important;
					}
					
					.rate {
						margin-bottom: 8px !important;
					}
					
					.stars {
						font-size: 12px !important;
					}
					
					.product-name {
						font-size: 14px !important;
						line-height: 1.3 !important;
						margin-bottom: 8px !important;
						display: block !important;
						overflow: hidden !important;
						text-overflow: ellipsis !important;
						white-space: nowrap !important;
					}
					
					.product-price {
						font-size: 13px !important;
					}
					
					.product-thumb__image img {
						width: 100% !important;
						height: 200px !important;
						object-fit: cover !important;
					}
					
					.card {
						margin-bottom: 16px !important;
					}
					
					.card-body {
						padding: 12px !important;
					}
				}
				
				@media (max-width: 768px) {
					.product-thumb__image img {
						height: 180px !important;
					}
				}
			`}</style>
			{viewType ? (
				<div className={shopPage ? "col-6 col-md-6 col-lg-4 col-xl-3 mb-4" : "p-0"}>
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
										<span className='product-thumb__image'>
											{productimages && Array.isArray(productimages) && productimages[0] ? (
												<Image 
													className='img-fluid' 
													src={getProductImageUrl(productimages[0]?.image)} 
													alt={productimages[0]?.name || 'Product image'} 
													width={250} 
													height={250}
													onError={(e) => {
														console.log('CDN image failed, trying backend fallback:', e.target.src);
														// Try backend fallback if CDN fails
														if (e.target.src.includes('aroma-shore.nyc3.cdn.digitaloceanspaces.com')) {
															const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://aroma-shore-backend-dirk7.ondigitalocean.app:3303';
															const filename = e.target.src.split('/').pop();
															e.target.src = `${backendUrl}/uploads/products/${filename}`;
														} else {
															e.target.src = '/app/assets/images/200.svg';
														}
													}}
													onLoad={(e) => {
														console.log('Image loaded successfully:', e.target.src);
													}}
													priority={false}
													loading="lazy"
												/>
											) : (
												<Image 
													className='img-fluid' 
													src='/app/assets/images/200.svg' 
													alt='Product placeholder' 
													width={250} 
													height={250}
													priority={false}
													loading="lazy"
												/>
											)}
										</span>
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
										<div className='product-category text-uppercase'>{productcategory && productcategory.category_name ? productcategory.category_name : 'Uncategorized'}</div>
										<div className='rate d-flex align-items-center justify-content-between'>
											<div className='stars d-flex'>
												{avgRatingRange.map((item, i) => {
													return <i key={i} className='fas fa-star text-warning me-1'></i>;
												})}
												{avgNonRatingRange.map((item, i) => {
													return <i key={i} className='far fa-star text-secondary me-1'></i>;
												})}
											</div>
											{/* <span>({totalReviewers})</span> */}
										</div>
									</div>
								</div>
								<Link href={"/products/" + id}>
									<span className='product-name'>{name}</span>
								</Link>
								<div className='product-price mt-2'>
									<b>Price: {formatPriceWithCurrency(displayPrice)}</b>
									{isDistributor && productpro.dist_price && (
										<span className="badge bg-info ms-2">Distributor Price</span>
									)}
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
										<span className='product-thumb__image'>
											{productimages && Array.isArray(productimages) && productimages.length > 0 ? (
												<Image src={getProductImageUrl(productimages[0]?.image)} alt={productimages[0]?.name || 'Product image'} width={250} height={250} />
											) : (
												<Image src='/app/assets/images/200.svg' alt='Placeholder' width={250} height={250} />
											)}
										</span>
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
									<div className='product-price mt-2'>
										<b>Price: {formatPriceWithCurrency(displayPrice)}</b>
										{isDistributor && productpro.dist_price && (
											<span className="badge bg-info ms-2">Distributor Price</span>
										)}
									</div>
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
