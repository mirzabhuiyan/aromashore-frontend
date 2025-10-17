import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { apiUrl, getImageUrl } from "../../config";
import { formatPriceWithCurrency } from '../../utils/priceFormatter';

// Helper function to get proper product image URL
const getProductImageUrl = (imageData) => {
  if (!imageData) return "/app/assets/images/200.svg";
  
  // Handle both old base64 and new file-based images
  if (imageData.startsWith('data:')) {
    return imageData; // Base64 image
  } else if (imageData.startsWith('http')) {
    return imageData; // Already a full URL
  } else {
    // For file-based images, use CDN
    const imageUrl = getImageUrl(imageData, 'products');
    console.log('Bundle Image URL:', imageUrl);
    return imageUrl; // File-based image
  }
};
import axios from "axios";
import { AppStore } from "../../store/AppStore";

export default function ProductBundle({ productId = null, selectedProperty = null }) {

	const { add_TO_CART } = useContext(AppStore);
	const [bundleProductList, setBundleProductList] = useState([]);

	useEffect(() => {
		if (productId != null) {
			axios.get(apiUrl + "/web/getall/bundle/" + Number(productId)).then((response) => {
				console.log('Bundle API Response:', response);
				if (response.data.appStatus) {
					const productBundleDetails = response.data.appData;
					console.log('Bundle Data:', productBundleDetails);
					console.log('Selected Property:', selectedProperty);
					setBundleProductList(productBundleDetails)
				} else {
					setBundleProductList([]);
				}
			}).catch((error) => {
				console.log('Bundle API Error:', error);
				setBundleProductList([]);
			});
		}
	}, [productId, selectedProperty]);

	let totalBundlePrice = 0;

	const getDiscountedPrice = (discount, price) => {
		// console.log(discount, price);
		let calculatedPrice = Number(price) - (Number(price) * (Number(discount) / 100));
		totalBundlePrice += calculatedPrice;
		return <span className="text-success">{formatPriceWithCurrency(calculatedPrice)}</span>;
	}

	const addBundleToCart = (mainProduct, bundleProducts, discount, bundleId) => {
		console.log(mainProduct, bundleProducts, discount, bundleId);

		// let newCart = {
		// 	"variation_id": unit.id,
		// 	"price": unit.sale_price && unit.sale_price > 0 ? unit.sale_price : unit.price,
		// 	"size": unit.size,
		// 	"size_unit": unit.size_unit,
		// 	"quantity": unit.qty,
		// 	"weight": unit.weight,
		// 	"category_id": productDetails.productcategoryId,
		// 	"product_id": productDetails.id,
		// 	"product_no": productDetails.product_no,
		// 	"product_name": productDetails.name,
		// 	"product_image": productDetails.productimages.length > 0 ? productDetails.productimages[0].image_link : ""
		// }

		const mainProductDetails = {
			productcategoryId: mainProduct.category_id,
			id: mainProduct.product_id,
			product_no: mainProduct.product_no,
			name: mainProduct.product_name,
			productimages: [{ image: mainProduct.product_image, name: mainProduct.product_name }]
		}
		const mainProductUnit = {
			id: mainProduct.variation_id,
			sale_price: Number(mainProduct.price) - (Number(mainProduct.price) * (Number(discount) / 100)),
			price: mainProduct.price,
			size: mainProduct.size,
			size_unit: mainProduct.size_unit,
			qty: mainProduct.quantity,
			weight: mainProduct.weight
		}

		const productDetails = [mainProductDetails];
		const unit = [mainProductUnit];

		bundleProducts.forEach(bundle => {
			const bundleProductDetails = {
				productcategoryId: bundle.category_id,
				id: bundle.product_id,
				product_no: bundle.product_no,
				name: bundle.product_name,
				productimages: [{ image: bundle.product_image, name: bundle.product_name }]
			}
			const bundleProductUnit = {
				id: bundle.variation_id,
				sale_price: Number(bundle.price) - (Number(bundle.price) * (Number(discount) / 100)),
				price: bundle.price,
				size: bundle.size,
				size_unit: bundle.size_unit,
				qty: bundle.quantity,
				weight: bundle.weight
			}
			productDetails.push(bundleProductDetails);
			unit.push(bundleProductUnit);
		});
		console.log('SSS',productDetails, unit);
		add_TO_CART({ productDetails, unit, bundleId: bundleId });
	}

	return (
		<>
			{
				bundleProductList.length > 0 ?
					bundleProductList.map(bpl => {
						const productVeriation = JSON.parse(bpl.product_variation);
						const bundleProducts = JSON.parse(bpl.bundle_products);
						
						// Debug logging
						console.log('Bundle matching:', {
							bundleVariationId: productVeriation.variation_id,
							selectedPropertyId: selectedProperty?.id,
							bundleVariationNo: productVeriation.variation_no,
							selectedPropertyVariationNo: selectedProperty?.variation_no,
							productId: productVeriation.product_id,
							selectedProductId: productId
						});
						
						// More flexible matching - check if the bundle belongs to the current product
						// First try exact variation match, then fallback to product match
						const exactMatch = productVeriation.variation_id == selectedProperty?.id && 
										  productVeriation.variation_no == selectedProperty?.variation_no;
						const productMatch = productVeriation.product_id == productId;
						
						if (exactMatch || productMatch) {
							return (
								<div className="card mt-4" key={bpl.id}>
									<div className="card-header pt-3 pb-3">
										<h5 className="mb-0">Frequently Bought Together</h5>
										<p className="mb-0">Buy this bundle and get <b className="text-success">{bpl.discount}% off</b></p>
									</div>
									<div className="card-body pt-3 pb-3" style={{ overflowX: 'auto' }}>
										<div className="d-flex justify-content-start align-items-center gap-2" key={bpl.id}>
											{/* <div className="border border-secondary rounded p-2">
										{productVeriation.product_image ? <><Image src={getProductImageUrl(productVeriation.product_image)} width={75} height={75} /><br /></> : ""}
										<p className="mb-1"><b>{productVeriation.product_name}</b></p>
										<p className="mb-0"><b>SKU:</b>&nbsp;{productVeriation.variation_no}</p>
										<p className="mb-0"><b>Size:</b>&nbsp;{productVeriation.size} {productVeriation.size_unit}</p>
										<p className="mb-0"><b>Price:</b>&nbsp;<del className="text-danger">
											{formatPriceWithCurrency(productVeriation.price)}</del>&nbsp;{getDiscountedPrice(bpl.discount, productVeriation.price)}
										</p>
									</div> */}
											<i className="fas fa-plus"></i>
											<div className="d-flex flex-grow-1 justify-content-evenly align-items-center gap-2">
												{
													bundleProducts.map(bp =>
														<div key={bp.variation_id} className="border border-secondary rounded p-2 w-100">
															{bp.product_image ? (
																<>
																	<img 
																		// crossOrigin="anonymous" 
																		src={getProductImageUrl(bp.product_image)} 
																		width={75} 
																		height={75}
																		onError={(e) => {
																			console.log('Bundle image failed to load:', e.target.src);
																			e.target.src = "/app/assets/images/200.svg";
																		}}
																		alt={bp.product_name || 'Product image'}
																	/>
																	<br />
																</>
															) : (
																<>
																	<img 
																		src="/app/assets/images/200.svg" 
																		width={75} 
																		height={75}
																		alt="No image"
																	/>
																	<br />
																</>
															)}
															<p className="mb-1"><b>{bp.product_name}</b></p>
															<p className="mb-0"><b>SKU:</b>&nbsp;{bp.variation_no}</p>
															<p className="mb-0"><b>Size:</b>&nbsp;{bp.size} {bp.size_unit}</p>
															<p className="mb-0"><b>Price:</b>&nbsp;<del className="text-danger">
																{formatPriceWithCurrency(bp.price)}</del>&nbsp;{getDiscountedPrice(bpl.discount, bp.price)}
															</p>
														</div>
													)
												}
											</div>
										</div>
									</div>
									<div className="card-footer pt-3 pb-3 d-flex justify-content-between align-items-center">
										<b>Total Price: {formatPriceWithCurrency(totalBundlePrice)} ({bpl.discount}% off)</b>
										<button className="btn btn-dark" onClick={() => addBundleToCart(productVeriation, bundleProducts, bpl.discount, bpl.id)}>
											<i className="fa fa-cart-plus me-2"></i>
											Add Bundle To Cart
										</button>
									</div>
								</div>
							)
						}
					})
					: <></>
			}
		</>
	);
}
