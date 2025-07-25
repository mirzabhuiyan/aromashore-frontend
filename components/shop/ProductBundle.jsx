import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { apiUrl, globalProductImageAddress } from "../../config";
import axios from "axios";
import { AppStore } from "../../store/AppStore";

export default function ProductBundle({ productId = null, selectedProperty = null }) {

	const { add_TO_CART } = useContext(AppStore);
	const [bundleProductList, setBundleProductList] = useState([]);

	useEffect(() => {
		if (productId != null) {
			axios.get(apiUrl + "/web/getall/bundle/" + Number(productId)).then((response) => {
				console.log(response);
				if (response.data.appStatus) {
					const productBundleDetails = response.data.appData;
					console.log("/web/getall/bundle/", productBundleDetails);
					setBundleProductList(productBundleDetails)
				} else {
					setBundleProductList([]);
				}
			}).catch((error) => {
				console.log(error);
				setBundleProductList([]);
			});
		}
	}, [productId, selectedProperty]);

	let totalBundlePrice = 0;

	const getDiscountedPrice = (discount, price) => {
		// console.log(discount, price);
		let calculatedPrice = Number(price) - (Number(price) * (Number(discount) / 100));
		totalBundlePrice += calculatedPrice;
		return <span className="text-success">${calculatedPrice}</span>;
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
			productimages: [{ image_link: mainProduct.product_image }]
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
				productimages: [{ image_link: bundle.product_image }]
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
						if (productVeriation.variation_id == selectedProperty.id && productVeriation.variation_no == selectedProperty.variation_no) {
							return (
								<div className="card mt-4" key={bpl.id}>
									<div className="card-header pt-3 pb-3">
										<h5 className="mb-0">Frequently Bought Together</h5>
										<p className="mb-0">Buy this bundle and get <b className="text-success">{bpl.discount}% off</b></p>
									</div>
									<div className="card-body pt-3 pb-3" style={{ overflowX: 'auto' }}>
										<div className="d-flex justify-content-start align-items-center gap-2" key={bpl.id}>
											{/* <div className="border border-secondary rounded p-2">
										{productVeriation.product_image ? <><Image src={`${globalProductImageAddress}${productVeriation.product_image}`} width={75} height={75} /><br /></> : ""}
										<p className="mb-1"><b>{productVeriation.product_name}</b></p>
										<p className="mb-0"><b>SKU:</b>&nbsp;{productVeriation.variation_no}</p>
										<p className="mb-0"><b>Size:</b>&nbsp;{productVeriation.size} {productVeriation.size_unit}</p>
										<p className="mb-0"><b>Price:</b>&nbsp;<del className="text-danger">
											${productVeriation.price}</del>&nbsp;{getDiscountedPrice(bpl.discount, productVeriation.price)}
										</p>
									</div> */}
											<i className="fas fa-plus"></i>
											<div className="d-flex flex-grow-1 justify-content-evenly align-items-center gap-2">
												{
													bundleProducts.map(bp =>
														<div key={bp.variation_id} className="border border-secondary rounded p-2 w-100">
															{bp.product_image ? <><img crossOrigin="anonymous" src={`${globalProductImageAddress}${bp.product_image}`} width={75} height={75} /><br /></> : ""}
															<p className="mb-1"><b>{bp.product_name}</b></p>
															<p className="mb-0"><b>SKU:</b>&nbsp;{bp.variation_no}</p>
															<p className="mb-0"><b>Size:</b>&nbsp;{bp.size} {bp.size_unit}</p>
															<p className="mb-0"><b>Price:</b>&nbsp;<del className="text-danger">
																${bp.price}</del>&nbsp;{getDiscountedPrice(bpl.discount, bp.price)}
															</p>
														</div>
													)
												}
											</div>
										</div>
									</div>
									<div className="card-footer pt-3 pb-3 d-flex justify-content-between align-items-center">
										<b>Total Price: ${totalBundlePrice} ({bpl.discount}% off)</b>
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
