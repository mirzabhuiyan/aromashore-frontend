import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../layouts/Layout";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Link from "next/link";
// import { LOAD_TO_CART, INCREMENT_TO_CART_ITEM, DECREMENT_TO_CART_ITEM, DELETE_ITEM_FROM_CART } from "../store/Store";
import { AppStore } from "../store/AppStore";
import { calculateCart } from "../services/utilityService";
import Cookies from "js-cookie";
import Image from "next/image";
import { globalProductImageAddress } from '../config';

// Helper function to get proper product image URL
const getProductImageUrl = (imageData) => {
  if (!imageData) return "/app/assets/images/200.svg";
  
  // Handle both old base64 and new file-based images
  if (imageData.startsWith('data:')) {
    return imageData; // Base64 image
  } else if (imageData.startsWith('http')) {
    return imageData; // Already a full URL
  } else {
    return imageData; // Already processed by _app.js
  }
};

function Cart() {
	const router = useRouter();
	const { cart, increment_TO_CART_ITEM, decrement_TO_CART_ITEM, delete_ITEM_FROM_CART, clearCart } = useContext(AppStore);
	console.log(cart)
	let { totalAmount } = calculateCart(cart);
	const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showClearAllModal, setShowClearAllModal] = useState(false);

	const deleteFromCart = () => {
		delete_ITEM_FROM_CART({ product: selectedProductToDelete });
		setShowDeleteModal(false);
	}

	return (
		<Layout title='Cart'>
			<div className='breadcrumb'>
				<div className='container mt-2'>
					<ul className='p-0 mb-2'>
						<li>
							<Link href='/'>Home</Link>
						</li>
						<li>
							<Link href='/shop'>Shop</Link>
						</li>
						<li className='active'>Cart</li>
					</ul>
				</div>
			</div>
			<div className='shop'>
				<div className='container'>
					<div className='row'>
						<div className={cart.length > 0 ? "col-12 col-md-9" : "col-12 col-md-12"}>
							<div className='card card-body shadow cart__table'>
								<table className='table table-sm mb-0'>
									<thead>
										<tr>
											<th className='text-center' width={100}>
												Image
											</th>
											<th width={300}>Product Name</th>
											<th className='text-center'>Size</th>
											<th width={100} className='text-center'>
												Unit Price
											</th>
											<th className='text-center'>Quantity</th>
											<th className='text-center'>Total</th>
											<th className='text-center' width={30}></th>
										</tr>
									</thead>
									{cart.length > 0 ? (
										cart.map((product, i) => (
											<tbody key={i}>
												<tr>
													<td className='text-center'>
														{product.product_image != '' ? <img crossOrigin="anonymous" src={getProductImageUrl(product.product_image)} alt={product.product_name} height={75} width={75} /> : <img src='/app/assets/images/200.svg' alt='Placeholder' height={75} width={75} />}
													</td>
													<td>
														<div className='p-2'>
															<Link style={{ textWrap: "wrap" }} href={"/products/" + product.product_id}>
																{product.product_name}
															</Link>
														</div>
													</td>
													{/* </tr> */}
													{/* {product.map((unit, i) => ( */}
													{/* <tr> */}
													<td className='text-center'>
														{product.size} {product.size_unit}
													</td>
													<td className='text-center'>$&nbsp;{product.price}</td>
													<td className='text-center'>
														<div className='quantity-controlle1'>
															{product.bundle_id == null ?
																<div
																	style={{
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "center",
																		marginBottom: "5px"
																	}}>
																	<div
																		onClick={() => {
																			if (product.quantity > 1) {
																				decrement_TO_CART_ITEM({ product });
																			}
																		}}
																		className='btn btn-sm btn-outline-secondary rounded'>
																		<i className='fas fa-minus'></i>
																	</div>
																	<div className='quantity-controller__number'>{product.quantity}</div>
																	<div
																		onClick={() => {
																			increment_TO_CART_ITEM({ product });
																		}}
																		className='btn btn-sm btn-outline-secondary rounded'>
																		<i className='fas fa-plus'></i>
																	</div>
																</div> : <div
																	style={{
																		display: "flex",
																		alignItems: "center",
																		justifyContent: "center",
																		marginBottom: "5px"
																	}}>
																	<div className='quantity-controller__number'>{product.quantity}</div>
																</div>
															}
														</div>
													</td>
													<td className='text-center'>$&nbsp;{product.price * product.quantity}</td>
													<td className='text-center' style={{ marginBottom: "5px" }}>
														<button
															className='btn btn-sm btn-outline-danger rounded-circle'
															onClick={() => {
																setSelectedProductToDelete(product);
																setShowDeleteModal(true);
															}}>
															<i className='fas fa-times'></i>
														</button>
													</td>
												</tr>
												{/* ))} */}
											</tbody>
										))
									) : (
										<tbody>
											<tr>
												<td colSpan={7} className='text-center p-3'>
													<span className='text-warning'>Noting Added Yet!</span>
												</td>
											</tr>
										</tbody>
									)}
								</table>
							</div>
							<div className='card card-body mt-3'>
								<table className='mb-0'>
									<tbody>
										<tr>
											<td>
												<Link href='/shop'>
													<button className='btn btn-light'>
														<i className='fas fa-long-arrow-left me-2'></i>
														Continue Shopping
													</button>
												</Link>
											</td>
											{cart.length > 0 ?
												<td className='text-end'>
													<button
														type="button"
														onClick={() => {
															setShowClearAllModal(true);
														}}
														className='btn btn-light'>
														{totalAmount !== 0 ? (
															<>
																<i className='fas fa-trash me-2'></i>Clear Shopping Cart
															</>
														) : (
															<></>
														)}
													</button>
												</td> : <></>
											}
										</tr>
									</tbody>
								</table>
							</div>
						</div>
						{cart.length > 0 ? (
							<div className='col-12 col-md-3'>
								<div className='card card-body shadow'>
									<table className='table'>
										<tbody>
											<tr>
												<th className='pb-4'>Grand Total</th>
												<th className='text-end pb-4'>$&nbsp;{totalAmount}</th>
											</tr>
											<tr>
												<td colSpan={2} className='text-end'>
													<button
														onClick={() => {
															if (Cookies.get("login")) {
																router.push("/checkout");
															} else if (!Cookies.get("login")) {
																console.log("Login ", Cookies.get("login"));
																router.push("/login");
															}
														}}
														className='btn btn-success rounded-0'>
														Proceed to checkout
														<i className='fas fa-arrow-right ms-2'></i>
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						) : (
							<></>
						)}
					</div>
				</div>
			</div>
			{/* <RelatedProduct /> */}
			{/* <InstagramSlider /> */}

			<Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h4 className="alert alert-danger text-center">Are you Sure?</h4>
				</Modal.Body>
				<Modal.Footer>
					<button type='button' className='btn btn-danger btn-sm' onClick={() => setShowDeleteModal(false)}>
						<i className='bi bi-x-circle me-2'></i>Close
					</button>
					<button type='button' className='btn btn-success btn-sm' onClick={deleteFromCart}>
						<i className='bi bi-save me-2'></i>Confirm
					</button>
				</Modal.Footer>
			</Modal>

			<Modal show={showClearAllModal} onHide={() => setShowClearAllModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmation</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h4 className="alert alert-danger text-center">Are you Sure,<br />you want to remove all cart items?</h4>
				</Modal.Body>
				<Modal.Footer>
					<button type='button' className='btn btn-danger btn-sm' onClick={() => setShowClearAllModal(false)}>
						<i className='bi bi-x-circle me-2'></i>Close
					</button>
					<button type='button' className='btn btn-success btn-sm' onClick={() => { clearCart(); setShowClearAllModal(false) }}>
						<i className='bi bi-save me-2'></i>Confirm
					</button>
				</Modal.Footer>
			</Modal>

			{/* toast.error('Please fill-up all the fields accordingly', {
				position: "top-right",
				autoClose: 5000
			}); */}

		</Layout>
	);
}
export default Cart;
