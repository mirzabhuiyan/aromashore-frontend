import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import axios from "axios";
import {apiUrl, getImageUrl} from "../../config";

// Helper function to get proper product image URL
const getProductImageUrl = (imageData) => {
  if (!imageData) return "/app/assets/images/200.svg";
  
  // Handle both old base64 and new file-based images
  if (imageData.startsWith('data:')) {
    return imageData; // Base64 image
  } else if (imageData.startsWith('http')) {
    return imageData; // Already a full URL
  } else {
    return getImageUrl(imageData, 'products'); // File-based image using CDN
  }
};
import { Card, ListGroup } from "react-bootstrap";
import { AppStore } from "../../store/AppStore";
import { calculateCart } from "../../services/utilityService";
import Product from "../shop/Product";
import Image from "next/image";
import "swiper/css";
import { useRouter } from "next/router";

export default function HeaderNavigation({ openCart }) {
	const { cart, user, logout } = useContext(AppStore);
	// const [showCard, setShowCard] = useState(0);
	const [inputValue, setInputValue] = useState();
	// const { state } = useContext(AppContext);
	const [menuList, setMenuList] = useState([]);
	const [selectedMenu, setSelectedMenu] = useState(null);
	const [selectedMobileMenu, setSelectedMobileMenu] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedCategoryWiseAllProduct, setSelectedCategoryWiseAllProduct] = useState([]);
	const [productList, setProductList] = useState([]);
	const [filteredProductList, setFilteredProductList] = useState([]);
	// let { totalQty } = calculateCart(cart);
	const [gender, setGender] = useState(null);
	let { totalQty } = calculateCart(cart);
	const router = useRouter();

	// useEffect(() => {},[])
	useEffect(() => {
		// console.log('header navigation ------->>', user, cart, openCart);
		axios.get(apiUrl + "/web/get/webmenu").then((response) => {
			// console.log("waiting end", response);
			if (response.data.appStatus) {

				// const bottomMenuList = response.data.appData;
				// let bottomMenuListCopy = bottomMenuList?.map((item) => {
				// 	return {
				// 		...item,
				// 		isActive: false
				// 	};
				// });
				setMenuList(response.data.appData);
			}
		});

		axios.post(apiUrl + "/web/getall/product", {
			pageSize: 10,
			pageNo: 0
		})
			.then((response) => {
				// console.log("HeaderNavigation ---- fetchProducts ------->", response);
				if (response.data.appStatus) {
					setProductList(response.data.appData.rows);
				}
			});
	}, []);

	const handleSelectMenu = (menu) => {
		console.log(menu);
		if (menu !== null) {
			setSelectedMenu(menu);
			handleSelectedMenuAllProduct(menu.productcategories, menu.id);
			handleSelectCategory(null);
		} else {
			setSelectedMenu(null);
			handleSelectedMenuAllProduct(null);
			handleSelectCategory(null);
		}
	};

	const handleSelectMobileMenu = (menu) => {
		console.log(menu);
		if (menu !== null) {
			setSelectedMobileMenu(menu);
		} else {
			setSelectedMobileMenu(null);
		}
	};

	const handleSelectCategory = (category) => {
		console.log(category);
		if (category !== null) {
			setSelectedCategory(category);
		} else {
			setSelectedCategory(null);
		}
	};

	const handleSelectedMenuAllProduct = (allCategoryProduct, categoryId = null) => {
		console.log(allCategoryProduct);
		setSelectedCategory(null);
		const allProductFromSelectedMenu = [];
		if (allCategoryProduct && Array.isArray(allCategoryProduct) && allCategoryProduct.length > 0) {
			allCategoryProduct.map(acp => {
				console.log(acp.products);
				if (acp.products && Array.isArray(acp.products)) {
					allProductFromSelectedMenu.push(...acp.products);
				}
			});
			// De-duplicate and limit to a single row (3 items)
			const uniqueById = [];
			const seen = new Set();
			for (let i = 0; i < allProductFromSelectedMenu.length && uniqueById.length < 3; i++) {
				const p = allProductFromSelectedMenu[i];
				if (!seen.has(p.id)) {
					seen.add(p.id);
					uniqueById.push(p);
				}
			}
			setSelectedCategoryWiseAllProduct(uniqueById);
			return;
		}

		// Fallback: fetch typical products by the menu's own category id
		const targetCategoryId = categoryId || selectedMenu?.id;
		if (!targetCategoryId) {
			setSelectedCategoryWiseAllProduct([]);
			return;
		}

		axios
			.post(apiUrl + "/web/getall/product", {
				pageSize: 3,
				pageNo: 0,
				categoryId: targetCategoryId
			})
			.then((response) => {
				if (response.data.appStatus) {
					setSelectedCategoryWiseAllProduct(response.data.appData.rows || []);
				} else {
					setSelectedCategoryWiseAllProduct([]);
				}
			})
			.catch(() => setSelectedCategoryWiseAllProduct([]));
	};

	const handleInput = (e) => {
		setInputValue(e.target.value);
		const searchString = e.target.value.toLowerCase();
		const loaclProductList = productList;
		// loaclProductList.map(prod => console.log(prod.name.toLowerCase()))
		let filterList = [];
		if (searchString) {
			filterList = loaclProductList.filter((prod) => prod.name.toLowerCase().includes(searchString));
		}
		console.log(filterList);
		setFilteredProductList(filterList);
	};

	const goToSelectedCategory = (categoryId) => {
		console.log(categoryId)
		handleSelectMenu(null);
		let href = "/shop?category=" + categoryId;
		router.push(href);
	}

	return (
		<>
			<nav className='navbar fixed-top navbar-expand-lg navbar-dark bg-dark ps-2 pe-2'>
				<div className='container-fluid'>
					<Link href='/'>
						<span className='navbar-brand me-2'>
							<img className='logo' src='/app/assets/images/logo-white.png' alt='Logo' width={50} height={44} />
						</span>
					</Link>
					<button className='navbar-toggler' type='button' data-bs-toggle='offcanvas' data-bs-target='#offcanvasNavbar' aria-controls='offcanvasNavbar' aria-label='Toggle navigation'>
						<span className='navbar-toggler-icon'></span>
					</button>
					<div className='offcanvas offcanvas-end' tabIndex='-1' id='offcanvasNavbar' aria-labelledby='offcanvasNavbarLabel'>
						<div className='offcanvas-header'>
							<h5 className='offcanvas-title text-light' id='offcanvasNavbarLabel'>
								Aromashore
							</h5>
							<div>
								<button
									className='btn btn-outline-light btn-sm position-relative'
									onClick={(e) => {
										openCart(true);
										e.preventDefault();
									}}>
									<i className='fas fa-shopping-bag'></i>{totalQty > 0 ? <span className='cart__quantity'>{totalQty}</span> : <></>}
								</button>
								{!user && (
									<Link href='/login'>
										<button className={`nav-item ${totalQty > 0 ? "ms-4" : "ms-2"} me-2 btn btn-outline-light btn-sm`}>
											<i className='fas fa-user'></i>
										</button>
									</Link>
								)}
								{user && (
									<>
										<Link href='/user'>
											<button className={`nav-item ${totalQty > 0 ? "ms-4" : "ms-2"} me-2 btn btn-outline-secondary btn-sm`}>
												<i className='fas fa-user'></i>
												<span className='customer-name'>{user.username}</span>
											</button>
										</Link>
										<button
											className='btn btn-danger btn-sm'
											onClick={() => {
												Cookies.remove("login");
												logout();
											}}>
											<i className='fa fa-sign-out'></i>
										</button>
									</>
								)}
							</div>
						</div>
						<div className='offcanvas-body'>
							<ul className='navbar-nav mr-auto desktop-tablet-view'>
								{menuList?.map((menu, i) => {
									if (i <= 4) {
										return (
											<li key={menu.id} className='nav-item' onClick={() => handleSelectMenu(menu)}>
												<a className='nav-link' href='#'>
													{menu.category_name}
													<i className='fas fa-angle-down ms-2'></i>
												</a>
											</li>
										);
									}
								})}
								{menuList.length > 5 ? (
									<div className='dropdown'>
										<li className='nav-item'>
											<a className='nav-link' href='#' data-bs-toggle='dropdown' aria-expanded='false'>
												More<i className='fas fa-angle-down ms-2'></i>
											</a>
											<div className='dropdown-menu'>
												{menuList?.map((menu, i) => {
													if (i > 4) {
														return (
															<a key={menu.id} className='dropdown-item' href='#' onClick={() => handleSelectMenu(menu)}>
																{menu.name}
															</a>
														);
													}
												})}
											</div>
										</li>
									</div>
								) : (
									<></>
								)}
							</ul>
							<ul className='navbar-nav desktop-tablet-view'>
								<li className='nav-item me-lg-2 search-box'>
									<input type='search' id='search' className='form-control form-control-sm' placeholder='Search by Product Name...' onChange={handleInput} onFocus={handleInput} />
								</li>
								<li className='nav-item cart-button'>
									<button
										className='btn btn-outline-light btn-sm position-relative'
										onClick={(e) => {
											openCart(true);
											e.preventDefault();
										}}>
										<i className='fas fa-shopping-bag'></i>{totalQty > 0 ? <span className='cart__quantity'>{totalQty}</span> : <></>}
									</button>
								</li>
								{!user && (
									<li className={`nav-item ${totalQty > 0 ? "ms-lg-4" : "ms-lg-2"} me-2 user-button`}>
										<Link href='/login'>
											<button className='btn btn-outline-light btn-sm'>
												<i className='fas fa-user'></i>
											</button>
										</Link>
									</li>
								)}
								{user && (
									<>
										<li className={`nav-item ${totalQty > 0 ? "ms-lg-4" : "ms-lg-2"} me-2 user-button`}>
											<Link href='/user'>
												<button className='btn btn-outline-secondary btn-sm'>
													<i className='fas fa-user'></i>
													<span className='customer-name'>{user.username}</span>
												</button>
											</Link>
										</li>
										<li className='nav-item me-2 logout-button'>
											<button
												className='btn btn-danger btn-sm'
												onClick={() => {
													Cookies.remove("login");
													logout();
												}}>
												<i className='fa fa-sign-out'></i>
											</button>
										</li>
									</>
								)}
							</ul>
							<ul className='navbar-nav mr-auto mobile-view'>
								<li className='nav-item me-lg-2 search-box'>
									<input type='search' id='search' className='form-control form-control-sm' placeholder='Search by Product Name...' onChange={handleInput} onFocus={handleInput} />
								</li>
								<div className='dropdown'>
									{menuList?.map((menu, i) => (
										<li className='nav-item' key={i}>
											<a className='nav-link' onClick={() => handleSelectMobileMenu(menu)} href='#' data-bs-toggle='dropdown' aria-expanded='false'>
												{menu.category_name || menu.name}
												<i className='fas fa-angle-down ms-2'></i>
											</a>
											<ul className='dropdown-menu ps-3'>
												<li data-bs-dismiss='offcanvas' onClick={() => goToSelectedCategory('all')}>
													All
												</li>
												{selectedMobileMenu ? (
													<li data-bs-dismiss='offcanvas' onClick={() => { handleSelectedMenuAllProduct(selectedMobileMenu.productcategories, selectedMobileMenu.id); }}>
														{selectedMobileMenu?.name || selectedMobileMenu?.category_name}
													</li>
												) : <></>}
												{selectedMobileMenu && selectedMobileMenu.productcategories && Array.isArray(selectedMobileMenu.productcategories) && selectedMobileMenu.productcategories.map(pcat =>
													<li key={pcat.id} data-bs-dismiss='offcanvas' onClick={() => goToSelectedCategory(pcat.id)}>
														{pcat.category_name}
													</li>
												)}
											</ul>
										</li>
									))}
								</div>
								<button type='button' className='mobile-menu-close btn-close' data-bs-dismiss='offcanvas' onClick={() => handleSelectMenu(null)} aria-label='Close'></button>
							</ul>
						</div>
					</div>
				</div>
			</nav>
			{/* 
			<nav className='navbar fixed-top navbar-expand-lg navbar-dark bg-dark ps-2 pe-2'>
				<button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarTogglerAromashore' aria-controls='navbarTogglerAromashore' aria-expanded='false' aria-label='Toggle navigation'>
					<span className='navbar-toggler-icon'></span>
				</button>
				<div className='collapse navbar-collapse' id='navbarTogglerAromashore'>
					<Link href='/'>
						<span className='navbar-brand me-2'>
							<img className='logo' src='/app/assets/images/logo-white.png' alt='Logo' width={50} />
						</span>
					</Link>
				</div>
			</nav> */}

			<div>
				{filteredProductList.length > 0 ? (
					<div className='result-card shadow' onMouseLeave={() => setFilteredProductList([])}>
						{/* <Card.Header>Featured</Card.Header> */}
						<ListGroup variant='flush'>
							{filteredProductList?.map((product, i) => {
								return (
									<div key={i}>
										<Link href={"/products/" + product.id}>
											<ListGroup.Item className='result-item'>
												{product.productimages[0] ? <Image src={getProductImageUrl(product.productimages[0]?.image)} alt={product.productimages[0]?.name} width={30} height={30} /> : <Image src='/app/assets/images/200.svg' alt='Placeholder' width={30} height={30} />}
												&nbsp;&nbsp;
												{/* <b>Brand:&nbsp;</b>
												{product.productbrand.name},&nbsp;
												<b>Name:&nbsp;</b> */}
												{product.name}
											</ListGroup.Item>
											{/* <ListGroup.Item>{product.name}</ListGroup.Item> */}
										</Link>
									</div>
								);
							})}
						</ListGroup>
					</div>
				) : (
					<></>
				)}

				{selectedMenu === null ? (
					<></>
				) : (
					// <div className='dropdown_mega_nav'>
					<div className='dropdown_mega_nav' onMouseLeave={() => handleSelectMenu(null)}>
						<div className='container-fluid'>
							<div className='item_wrapper'>
								<div className='item filter'>
									<h4 className='d-flex justify-content-center align-items-center' onClick={() => handleSelectMenu(null)}>
										{selectedMenu?.name || selectedMenu?.category_name || 'Menu'}
										<i className="mobile-mega-menu-close-button fas fa-times-circle text-danger ms-2"></i>
									</h4>
									<ul>
										<li className='category_name' onClick={() => handleSelectedMenuAllProduct(selectedMenu.productcategories, selectedMenu?.id)}>
											All
										</li>
										<li className='category_name' onClick={() => handleSelectedMenuAllProduct(selectedMenu.productcategories, selectedMenu?.id)}>
											{selectedMenu?.name || selectedMenu?.category_name}
										</li>
										{selectedMenu.productcategories && Array.isArray(selectedMenu.productcategories) && selectedMenu.productcategories.map(pcat =>
											<li key={pcat.id} className='category_name' onClick={() => handleSelectCategory(pcat)}>
												{pcat.category_name}
												{/* <Link href={"/shop?category=" + pcat.id}>{pcat.category_name}</Link> */}
											</li>
										)}
										{/* <li className='category_name' onClick={() => setGender(null)}>
											<Link href={"/shop?category=" + selectedCategory?.id}>All</Link>
										</li>
										<li>
											<a className='category_name' onClick={() => setGender(2)}>
												Men&apos;s Collection
											</a>
										</li>
										<li>
											<a className='category_name' onClick={() => setGender(1)}>
												Women&apos;s Collection
											</a>
										</li> */}
									</ul>
								</div>
								<div className="menu-product-list">
									{selectedCategory && selectedCategory.products ?
										selectedCategory.products && Array.isArray(selectedCategory.products) && selectedCategory.products.map((product, i) => {
											return (
												<div key={i} className='item'>
													<Product product={product} />
												</div>
											);
										}) : selectedCategoryWiseAllProduct && Array.isArray(selectedCategoryWiseAllProduct) && selectedCategoryWiseAllProduct.map((product, i) => {
											return (
												<div key={i} className='item'>
													<Product product={product} />
												</div>
											);
										})
									}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
