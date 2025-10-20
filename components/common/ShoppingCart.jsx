import React, { useContext } from "react";
import Link from "next/link";
// import { AppContext } from "../store/Store";
import { AppStore } from "../../store/AppStore";
import { calculateCart } from "../../services/utilityService";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import Image from "next/image";
import { getProductImageUrl } from '../../config';
import { formatPriceWithSpaces } from '../../utils/priceFormatter';

const ShoppingCart = ({ isCartOpen }) => {
	const { cart, delete_ITEM_FROM_CART } = useContext(AppStore);
	console.log('ShoppingCart --------->', cart)
	const router = useRouter();
	const drawerStyle = () => {
		if (isCartOpen) {
			return {
				right: "0px"
			};
		}
	};
	let { totalAmount } = calculateCart(cart);
	return (
		<div
			style={{
				display: "block",
				right: "-450px",
				...drawerStyle()
			}}
			className='drawer drawer-right slide'
			id='cart-drawer'
			tabIndex='-1'
			role='dialog'
			aria-labelledby='drawer-demo-title'
			aria-hidden='true'>
			<div className='drawer-content drawer-content-scrollable' role='document'>
				<div className='drawer-body'>
					<div className='cart-sidebar'>
						<div className='cart-items__wrapper'>
							<h2>Shopping Cart</h2>
							<div>
								{cart.length > 0 ? (
									cart.map((product, i) => (
										<div key={i} className='cus_cart-item'>
											<div className='cus_cart-item__image'>
												{product?.product_image? <img src={getProductImageUrl(product.product_image)} alt={product.product_name} height={75} width={75} /> : <img src='/app/assets/images/200.svg' alt='Placeholder' height={75} width={75} />}
											</div>
											<div className='cus_cart-item__info'>
												<div key={i}>
													<ul>
														<li>
															Name&nbsp;
															<p>{product.product_name}</p>
														</li>
														<li>
															Size&nbsp;
															<p>
																{product.size}&nbsp;{product.size_unit}
															</p>
														</li>
														<li>
															Qty.&nbsp;
															<p>{product.quantity}</p>
														</li>
														<li>
															Price&nbsp;
															<p>{product.price}</p>
														</li>
														{/* <li>
															<a
																onClick={(e) => {
																	delete_ITEM_FROM_CART({
																		product
																	});
																	e.preventDefault();
																}}
																className='cart-item__remove'
																href='#'>
																<i className='far fa-times-circle'></i>
															</a>
														</li> */}
													</ul>
												</div>
											</div>
										</div>
									))
								) : (
									<>Nothing on Cart!</>
								)}
							</div>

							<div className='cart-items__total'>
								<div className='cart-items__total__price'>
									<h5>Total</h5>
									<span>{formatPriceWithSpaces(totalAmount)}</span>
								</div>
								{cart.length > 0 ?
									<div className='cart-items__total__buttons'>
										<Link href='/cart'>
											<button className='btn btn-dark'>View Cart</button>
										</Link>
										<button
											onClick={() => {
												if (Cookies.get("login")) {
													router.push("/checkout");
												} else if (!Cookies.get("login")) {
													console.log("Login ", Cookies.get("login"));
													router.push("/login");
												}
											}}
											className='btn -red'>
											Checkout
										</button>
									</div> : <></>
								}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ShoppingCart;
