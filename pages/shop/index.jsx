import React, { useEffect, useState, useContext } from "react";
import Layout from "../../layouts/Layout";
import {apiUrl} from "../../config";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Product from "../../components/shop/Product";
import TablePagination from '@mui/material/TablePagination';

function Pagination({ recordCount = 0, recordPerPage = 24, setPageNo = () => { }, setPageSize = () => { } }) {
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(recordPerPage);

	const handleChangePage = (
		event,
		newPage
	) => {
		setPage(newPage);
		setPageNo(newPage);
	};

	const handleChangeRowsPerPage = (
		event
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
		setPageNo(0);
		setPageSize(event.target.value);
	};

	return (
		<TablePagination
			component="div"
			count={recordCount}
			page={page}
			onPageChange={handleChangePage}
			rowsPerPage={rowsPerPage}
			onRowsPerPageChange={handleChangeRowsPerPage}
			rowsPerPageOptions={[10, 24, 50, 100]}
			labelRowsPerPage="Item per Page:"
		/>
	);
}

export default function Index() {
	const [isGridView, setIsGridView] = useState(true);
	const router = useRouter();
	const query = router.query;
	const [allProductList, setAllProductList] = useState([]);
	const [filteredProductList, setFilteredProductList] = useState([]);
	const [displayedProductList, setDisplayedProductList] = useState([]);
	const [productBrandList, setProductBrandList] = useState([]);
	const [selectedBrandIdList, setSelectedBrandIdList] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [apiError, setApiError] = useState(false);

	const [totalCount, setTotalCount] = useState(0);
	const [pageNo, setPageNo] = useState(0);
	const [pageSize, setPageSize] = useState(24);

	const [showBrandFilter, setShowBrandFilter] = useState(false);
	const [showCategoryFilter, setShowCategoryFilter] = useState(false);
	const [perfumeNotes, setPerfumeNotes] = useState("");
	const [season, setSeason] = useState("");

	const [brandSearchQuery, setBrandSearchQuery] = useState("");
	const [brandVisibleCount, setBrandVisibleCount] = useState(5);
	const [showPerfumeNotes, setShowPerfumeNotes] = useState(false);
	const [showSeason, setShowSeason] = useState(false);

	const isBrandSearching = brandSearchQuery.trim() !== "";
	const filteredBrands = productBrandList.filter((b) =>
		b?.name?.toLowerCase().includes(brandSearchQuery.toLowerCase())
	);
	const brandsToDisplay = isBrandSearching
		? filteredBrands
		: filteredBrands.slice(0, brandVisibleCount);

	useEffect(() => {
		// Only make API calls in browser environment, not during build
		if (typeof window === "undefined") return;
		axios.get(apiUrl + "/web/getall/brand", {
			timeout: 10000, // 10 second timeout
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
			.then((response) => {
				// console.log(response);
				if (response.data.appStatus) {
					const brandList = response.data.appData;
					brandList.map((brand) => {
						brand.isChecked = false;
					});
					setProductBrandList(brandList);
				} else {
					console.error("Brand API Error:", response.data.message || "Unknown error");
					setProductBrandList([]);
				}
			})
				.catch((error) => {
					console.error("Brand Network Error:", error);
					// Retry once after a short delay
					setTimeout(() => {
						axios.get(apiUrl + "/web/getall/brand", {
							timeout: 10000,
							headers: {
								'Content-Type': 'application/json',
								'Accept': 'application/json'
							}
						})
						.then((response) => {
							if (response.data.appStatus) {
								const brandList = response.data.appData;
								brandList.map((brand) => {
									brand.isChecked = false;
								});
								setProductBrandList(brandList);
							}
						})
						.catch((retryError) => {
							console.error("Brand retry failed:", retryError);
							setProductBrandList([]);
						});
					}, 1000);
				});

		axios.get(apiUrl + "/web/getall/category", {
			timeout: 10000, // 10 second timeout
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		})
			.then((response) => {
				// console.log(response);
				if (response.data.appStatus) {
					setCategoryList(response.data.appData);
				} else {
					console.error("Category API Error:", response.data.message || "Unknown error");
					setCategoryList([]);
				}
			})
			.catch((error) => {
				console.error("Category Network Error:", error);
				// Retry once after a short delay
				setTimeout(() => {
					axios.get(apiUrl + "/web/getall/category", {
						timeout: 10000,
						headers: {
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						}
					})
					.then((response) => {
						if (response.data.appStatus) {
							setCategoryList(response.data.appData);
						}
					})
					.catch((retryError) => {
						console.error("Category retry failed:", retryError);
						setCategoryList([]);
					});
				}, 1000);
			});
	}, []);

	useEffect(() => {
		// Only make API calls in browser environment, not during build
		if (typeof window === "undefined") return;
		
		// Prevent multiple simultaneous requests
		if (isLoading) return;
		
		// Add a small delay to ensure component is fully mounted
		const timer = setTimeout(() => {
			// Handle category=all by redirecting to clean URL
			if (query.category === "all") {
				router.replace("/shop");
				return;
			}
			
			// Build filter parameters
			const filterParams = {
				pageSize: 1000, // Get all products for client-side filtering
				pageNo: 0
			};

			// Add category filter
			if (query.category && query.category !== "" && query.category !== "all") {
				filterParams.categoryId = query.category;
			}

			// Add brand filter
			if (selectedBrandIdList.length > 0) {
				filterParams.brandIds = selectedBrandIdList;
			}

			// Add perfume notes filter
			if (perfumeNotes.trim() !== "") {
				filterParams.perfumeNotes = perfumeNotes;
			}

			// Add season filter
			if (season.trim() !== "") {
				filterParams.season = season;
			}

			console.log("Making API call with params:", filterParams);
			console.log("API URL:", apiUrl + "/web/getall/product");

			// Mobile-specific configuration
			const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			
			axios
				.post(apiUrl + "/web/getall/product", filterParams, {
					timeout: isMobile ? 20000 : 15000, // Longer timeout for mobile
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'
					}
				})
				.then((response) => {
					console.log("API Response:", response);
					if (response.data.appStatus) {
						const products = response.data.appData.rows;
						setAllProductList(products);
						setIsLoading(false);
						setApiError(false);
						
						// Cache the data for offline use
						try {
							localStorage.setItem('cachedProducts', JSON.stringify(products));
							console.log("Products cached successfully");
						} catch (e) {
							console.error("Failed to cache products:", e);
						}
					} else {
						console.error("API Error:", response.data.message || "Unknown error");
						setAllProductList([]);
						setIsLoading(false);
						setApiError(true);
					}
				})
				.catch((error) => {
					console.error("Network Error:", error);
					
					// Retry once after a short delay
					setTimeout(() => {
						console.log("Retrying product API call...");
						axios
							.post(apiUrl + "/web/getall/product", filterParams, {
								timeout: isMobile ? 20000 : 15000,
								headers: {
									'Content-Type': 'application/json',
									'Accept': 'application/json'
								}
							})
							.then((response) => {
								console.log("Retry API Response:", response);
								if (response.data.appStatus) {
									const products = response.data.appData.rows;
									setAllProductList(products);
									setIsLoading(false);
									setApiError(false);
									
									// Cache the data for offline use
									try {
										localStorage.setItem('cachedProducts', JSON.stringify(products));
										console.log("Products cached successfully");
									} catch (e) {
										console.error("Failed to cache products:", e);
									}
								} else {
									console.error("Retry API Error:", response.data.message || "Unknown error");
									handleApiFailure();
								}
							})
							.catch((retryError) => {
								console.error("Retry failed:", retryError);
								handleApiFailure();
							});
					}, 2000);
					
					function handleApiFailure() {
						// Try to load cached data as fallback
						const cachedData = localStorage.getItem('cachedProducts');
						if (cachedData) {
							try {
								const parsedData = JSON.parse(cachedData);
								setAllProductList(parsedData);
								setIsLoading(false);
								console.log("Loaded cached products as fallback");
								return;
							} catch (e) {
								console.error("Failed to parse cached data:", e);
							}
						}
						
						setAllProductList([]);
						setIsLoading(false);
						setApiError(true);
						
						// Show user-friendly error message
						if (error.code === 'ECONNABORTED') {
							alert("Request timed out. Please check your internet connection and try again.");
						} else if (error.code === 'ERR_NETWORK') {
							alert("Network error. Please check your internet connection and try again.");
						} else {
							alert("Unable to load products. Please check your internet connection and try again.");
						}
					}
				});
		}, 100); // 100ms delay

		return () => clearTimeout(timer);
	}, [query.category, selectedBrandIdList, perfumeNotes, season]);

	// Handle pagination only (filtering is now done on backend)
	useEffect(() => {
		// Only make API calls in browser environment, not during build
		if (typeof window === "undefined") return;
		// Apply pagination to the filtered results from backend
		const startIndex = pageNo * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedProducts = allProductList.slice(startIndex, endIndex);
		setDisplayedProductList(paginatedProducts);
		setTotalCount(allProductList.length);
	}, [allProductList, pageNo, pageSize]);

	const handleCategorySelect = (categoryId) => {
		setIsLoading(true);
		setPageNo(0); // Reset to first page when category changes
		
		try {
			if (categoryId === "all") {
				router.push("/shop");
			} else {
				let href = "/shop?category=" + categoryId;
				router.push(href);
			}
		} catch (error) {
			console.error("Navigation Error:", error);
			setIsLoading(false);
		}
	};

	const handleBandSelect = (event, brand) => {
		// console.log(event, brand);
		const locbrandsMap = productBrandList.map((item) => {
			if (item.id == brand.id) {
				return {
					...item,
					isChecked: !item.isChecked
				};
			}
			return item;
		});
		setProductBrandList(locbrandsMap);
		const selectedBrandIds = [];
		locbrandsMap.map((brand) => {
			if (brand.isChecked === true) {
				selectedBrandIds.push(brand.id);
			}
		});
		setSelectedBrandIdList(selectedBrandIds);
		setPageNo(0); // Reset to first page when brand filter changes
	};

	const clearAllFilters = () => {
		setIsLoading(true);
		setApiError(false);
		// Clear brand filters
		const clearedBrandList = productBrandList.map((brand) => ({
			...brand,
			isChecked: false
		}));
		setProductBrandList(clearedBrandList);
		setSelectedBrandIdList([]);
		
		// Clear search fields
		setPerfumeNotes("");
		setSeason("");
		setBrandSearchQuery("");
		setBrandVisibleCount(5);
		
		// Clear category filter by redirecting to shop without category
		router.push("/shop");
		
		// Reset pagination
		setPageNo(0);
		setIsLoading(false);
	};

	const retryApiCall = () => {
		setApiError(false);
		setIsLoading(true);
		// Trigger a re-render by updating a state
		setPageNo(prev => prev);
	};

	return (
		<Layout title='Shop Page'>
			<div id='content'>
				<div className='breadcrumb'>
					<div className='container mt-2'>
						<ul className='p-0 mb-2'>
							<li>
								<Link href='/'>Home</Link>
							</li>
							<li className='active'>Shop</li>
						</ul>
					</div>
				</div>
				<div className='shop'>
					<div className='container'>
						<div className='row'>
							<div className='col-12 col-md-4 col-lg-3'>
								<div className='shop-sidebar' style={{
									background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
									borderRadius: '16px',
									boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
									border: '1px solid rgba(0, 0, 0, 0.1)',
									padding: '28px',
									marginBottom: '24px',
									minWidth: '280px'
								}}>
									<div className='shop-sidebar__content'>
										<div className="row g-3">
											<div className="col-6 col-lg-12">
												<div className='shop-sidebar__section -categories' style={{
													marginBottom: '32px',
													padding: '20px',
													background: 'rgba(255, 255, 255, 0.9)',
													borderRadius: '12px',
													border: '1px solid rgba(0, 0, 0, 0.1)',
													boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
												}}>
													<div className='section-title -style1 -medium' style={{ 
														marginBottom: "1.5em",
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center',
														borderBottom: '2px solid #8abc41',
														paddingBottom: '12px',
														flexWrap: 'wrap',
														gap: '8px'
													}}>
														<h2 className='sidebar-categories' style={{
															fontSize: '18px',
															fontWeight: '600',
															color: '#1a1a1a',
															margin: 0,
															display: 'flex',
															alignItems: 'center',
															gap: '8px',
															flex: '1',
															minWidth: '0',
															textAlign: 'left',
															justifyContent: 'flex-start'
														}}>
															<i className="fas fa-tags" style={{ color: '#8abc41', flexShrink: 0 }}></i>
															<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Categories</span>
														</h2>
														<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
															{(selectedBrandIdList.length > 0 || (query.category && query.category !== "" && query.category !== "all") || perfumeNotes.trim() !== "" || season.trim() !== "") && (
																<button 
																	onClick={clearAllFilters}
																	style={{
																		background: 'rgba(108, 117, 125, 0.1)',
																		border: '1px solid rgba(108, 117, 125, 0.2)',
																		color: '#6c757d',
																		cursor: 'pointer',
																		padding: '6px 8px',
																		borderRadius: '6px',
																		transition: 'all 0.3s ease',
																		display: 'flex',
																		alignItems: 'center',
																		justifyContent: 'center',
																		minWidth: '32px',
																		height: '32px'
																	}}
																	onMouseEnter={(e) => {
																		e.target.style.background = 'rgba(108, 117, 125, 0.2)';
																		e.target.style.borderColor = 'rgba(108, 117, 125, 0.4)';
																		e.target.style.transform = 'scale(1.05)';
																	}}
																	onMouseLeave={(e) => {
																		e.target.style.background = 'rgba(108, 117, 125, 0.1)';
																		e.target.style.borderColor = 'rgba(108, 117, 125, 0.2)';
																		e.target.style.transform = 'scale(1)';
																	}}
																	title="Clear all filters"
																>
																	<i className="fas fa-eraser" style={{ fontSize: '14px' }}></i>
																</button>
															)}
															<button 
																className="btn btn-sm btn-light d-lg-none"
																onClick={() => setShowCategoryFilter(ov => !ov)}
																style={{
																	display: 'flex', alignItems: 'center', justifyContent: 'center',
																	padding: '6px 8px', borderRadius: '6px'
																}}
																title={showCategoryFilter ? 'Collapse' : 'Expand'}
															>
																<i className={showCategoryFilter ? "fas fa-chevron-up" : "fas fa-chevron-down"} style={{ color: '#6c757d' }}></i>
															</button>
														</div>
													</div>
													<div className="mobile-filter">
														{showCategoryFilter ? (
															<div className='shop-sidebar__section__item'>
																<label style={{ 
																	display: 'block', 
																	fontSize: '14px', 
																	fontWeight: '500', 
																	color: '#495057', 
																	marginBottom: '12px' 
																}}>
																	Select Category
																</label>
																<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
																<li onClick={() => handleCategorySelect("all")} style={{ 
																	cursor: 'pointer',
																	padding: '10px 12px',
																	marginBottom: '6px',
																	borderRadius: '8px',
																	background: 'rgba(255, 255, 255, 0.5)',
																	border: '1px solid rgba(255, 255, 255, 0.3)',
																	transition: 'all 0.3s ease',
																	fontWeight: '500',
																	color: '#495057'
																}}
																onMouseEnter={(e) => {
																	e.target.style.background = 'rgba(255, 255, 255, 0.8)';
																	e.target.style.transform = 'translateX(4px)';
																	e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
																}}
																onMouseLeave={(e) => {
																	e.target.style.background = 'rgba(255, 255, 255, 0.5)';
																	e.target.style.transform = 'translateX(0)';
																	e.target.style.boxShadow = 'none';
																}}
																>All</li>
																{categoryList.map((category) =>
																	<li key={category.id} onClick={() => handleCategorySelect(category.id)} style={{ 
																		cursor: 'pointer',
																		padding: '10px 12px',
																		marginBottom: '6px',
																		borderRadius: '8px',
																		background: 'rgba(255, 255, 255, 0.5)',
																		border: '1px solid rgba(255, 255, 255, 0.3)',
																		transition: 'all 0.3s ease',
																		fontWeight: '500',
																		color: '#495057'
																	}}
																	onMouseEnter={(e) => {
																		e.target.style.background = 'rgba(255, 255, 255, 0.8)';
																		e.target.style.transform = 'translateX(4px)';
																		e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
																	}}
																	onMouseLeave={(e) => {
																		e.target.style.background = 'rgba(255, 255, 255, 0.5)';
																		e.target.style.transform = 'translateX(0)';
																		e.target.style.boxShadow = 'none';
																	}}
																	>
																		{category.category_name}
																	</li>
																)}
																</ul>
															</div>
														) : null}
													</div>
													<div className="desktop-filter">
														<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
															<li onClick={() => handleCategorySelect("all")} style={{ 
																cursor: 'pointer',
																padding: '10px 12px',
																marginBottom: '6px',
																borderRadius: '8px',
																background: 'rgba(255, 255, 255, 0.5)',
																border: '1px solid rgba(255, 255, 255, 0.3)',
																transition: 'all 0.3s ease',
																fontWeight: '500',
																color: '#495057'
															}}
															onMouseEnter={(e) => {
																e.target.style.background = 'rgba(255, 255, 255, 0.8)';
																e.target.style.transform = 'translateX(4px)';
																e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
															}}
															onMouseLeave={(e) => {
																e.target.style.background = 'rgba(255, 255, 255, 0.5)';
																e.target.style.transform = 'translateX(0)';
																e.target.style.boxShadow = 'none';
															}}
															>All</li>
															{categoryList.map((category) =>
																<li key={category.id} onClick={() => handleCategorySelect(category.id)} style={{ 
																	cursor: 'pointer',
																	padding: '10px 12px',
																	marginBottom: '6px',
																	borderRadius: '8px',
																	background: 'rgba(255, 255, 255, 0.5)',
																	border: '1px solid rgba(255, 255, 255, 0.3)',
																	transition: 'all 0.3s ease',
																	fontWeight: '500',
																	color: '#495057'
																}}
																onMouseEnter={(e) => {
																	e.target.style.background = 'rgba(255, 255, 255, 0.8)';
																	e.target.style.transform = 'translateX(4px)';
																	e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
																}}
																onMouseLeave={(e) => {
																	e.target.style.background = 'rgba(255, 255, 255, 0.5)';
																	e.target.style.transform = 'translateX(0)';
																	e.target.style.boxShadow = 'none';
																}}
																>
																	{category.category_name}
																</li>
															)}
														</ul>
													</div>
												</div>
											</div>
											<div className="col-6 col-lg-12">
												<div className='shop-sidebar__section -refine' style={{
													marginBottom: '32px',
													padding: '20px',
													background: 'rgba(255, 255, 255, 0.9)',
													borderRadius: '12px',
													border: '1px solid rgba(0, 0, 0, 0.1)',
													boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
												}}>
													<div className='section-title -style1 -medium' style={{ 
														marginBottom: "1.5em",
														display: 'flex',
														justifyContent: 'space-between',
														alignItems: 'center',
														borderBottom: '2px solid #8abc41',
														paddingBottom: '12px',
														flexWrap: 'wrap',
														gap: '8px'
													}}>
														<h2 className='sidebar-refine-search' style={{
															fontSize: '18px',
															fontWeight: '600',
															color: '#1a1a1a',
															margin: 0,
															display: 'flex',
															alignItems: 'center',
															gap: '8px',
															flex: '1',
															minWidth: '0',
															textAlign: 'left',
															justifyContent: 'flex-start'
														}}>
															<i className="fas fa-star" style={{ color: '#8abc41', flexShrink: 0 }}></i>
															<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Inspired By</span>
														</h2>
														<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
															{selectedBrandIdList.length > 0 && (
																<span className="badge bg-primary d-inline-flex align-items-center justify-content-center" style={{ minWidth: 24 }}>{selectedBrandIdList.length}</span>
															)}
															<button 
																className="btn btn-sm btn-light d-lg-none"
																onClick={() => setShowBrandFilter(ov => !ov)}
																style={{
																	display: 'flex', alignItems: 'center', justifyContent: 'center',
																	padding: '6px 8px', borderRadius: '6px'
																}}
																title={showBrandFilter ? 'Collapse' : 'Expand'}
															>
																<i className={showBrandFilter ? "fas fa-chevron-up" : "fas fa-chevron-down"} style={{ color: '#6c757d' }}></i>
															</button>
														</div>
													</div>
													<div className="mobile-filter">
														{showBrandFilter ? (
															<div className='shop-sidebar__section__item'>
																<div style={{ marginBottom: '16px' }}>
																	<label style={{ 
																		display: 'block', 
																		fontSize: '14px', 
																		fontWeight: '500', 
																		color: '#495057', 
																		marginBottom: '8px' 
																	}}>
																		Search Brands
																	</label>
																	<input
																		type='text'
																		placeholder='Type to search brands...'
																		value={brandSearchQuery}
																		onChange={(e) => setBrandSearchQuery(e.target.value)}
																		style={{
																			width: '100%',
																			padding: '12px 16px',
																			border: '2px solid #e9ecef',
																			borderRadius: '10px',
																			fontSize: '14px',
																			background: '#ffffff',
																			color: '#495057',
																			transition: 'all 0.3s ease',
																			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
																		}}
																		onFocus={(e) => {
																			e.target.style.borderColor = '#007bff';
																			e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
																		}}
																		onBlur={(e) => {
																			e.target.style.borderColor = '#e9ecef';
																			e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
																		}}
																	/>
																</div>
																<ul style={{ margin: 0, padding: 0 }}>
																	{brandsToDisplay?.map((brand, i) =>
																		<li key={i} style={{ 
																			marginBottom: '8px', 
																			listStyle: 'none',
																			padding: '8px 12px',
																			borderRadius: '8px',
																			background: 'rgba(255, 255, 255, 0.5)',
																			border: '1px solid rgba(255, 255, 255, 0.3)',
																			transition: 'all 0.3s ease'
																		}}
																		onMouseEnter={(e) => {
																			e.target.style.background = 'rgba(255, 255, 255, 0.8)';
																			e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
																		}}
																		onMouseLeave={(e) => {
																			e.target.style.background = 'rgba(255, 255, 255, 0.5)';
																			e.target.style.boxShadow = 'none';
																		}}
																		>
																			<label htmlFor={"brand_id_" + brand.id} style={{ 
																				display: 'flex', 
																				alignItems: 'center', 
																				gap: '12px', 
																				cursor: 'pointer',
																				fontWeight: '500',
																				color: '#495057'
																			}}>
																				<input
																					type='checkbox'
																					checked={brand.isChecked}
																					name='brand_name'
																					id={"brand_id_" + brand.id}
																					onChange={(e) => {
																						handleBandSelect(e.target.checked, brand);
																					}}
																					style={{
																						width: '18px',
																						height: '18px',
																						accentColor: '#007bff',
																						cursor: 'pointer'
																					}}
																				/>
																				{brand.name}
																			</label>
																		</li>
																	)}
																</ul>
																{!isBrandSearching && filteredBrands.length > brandVisibleCount && (
																	<button
																		onClick={() => setBrandVisibleCount((c) => c + 10)}
																		style={{
																			marginTop: '8px',
																			background: 'transparent',
																			border: 'none',
																			color: '#007bff',
																			cursor: 'pointer',
																			padding: 0
																		}}
																	>
																		Show more
																	</button>
																)}
																{!isBrandSearching && brandVisibleCount > 5 && (
																	<button
																		onClick={() => setBrandVisibleCount(5)}
																		style={{
																			marginLeft: '12px',
																			marginTop: '8px',
																			background: 'transparent',
																			border: 'none',
																			color: '#007bff',
																			cursor: 'pointer',
																			padding: 0
																		}}
																	>
																		Show less
																	</button>
																)}
															</div>
														) : null}
													</div>
													<div className="desktop-filter">
														<div className='shop-sidebar__section__item'>
															<div style={{ marginBottom: '12px' }}>
																<input
																	type='text'
																	placeholder='Search brands...'
																	value={brandSearchQuery}
																	onChange={(e) => setBrandSearchQuery(e.target.value)}
																	style={{
																		width: '100%',
																		padding: '10px 14px',
																		border: '2px solid #e9ecef',
																		borderRadius: '10px',
																		fontSize: '14px',
																		background: '#ffffff',
																		color: '#333333',
																		transition: 'all 0.3s ease',
																		boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
																	}}
																	onFocus={(e) => {
																		e.target.style.borderColor = '#007bff';
																		e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
																	}}
																	onBlur={(e) => {
																		e.target.style.borderColor = '#e9ecef';
																		e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
																	}}
																/>
															</div>
															<ul style={{ margin: 0, padding: 0 }}>
																{brandsToDisplay?.map((brand, i) =>
																	<li key={i} style={{ 
																		marginBottom: '8px', 
																		listStyle: 'none',
																		padding: '8px 12px',
																		borderRadius: '8px',
																		background: 'rgba(255, 255, 255, 0.5)',
																		border: '1px solid rgba(255, 255, 255, 0.3)',
																		transition: 'all 0.3s ease'
																	}}
																	onMouseEnter={(e) => {
																		e.target.style.background = 'rgba(255, 255, 255, 0.8)';
																		e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
																	}}
																	onMouseLeave={(e) => {
																		e.target.style.background = 'rgba(255, 255, 255, 0.5)';
																		e.target.style.boxShadow = 'none';
																	}}
																	>
																		<label htmlFor={"brand_id_" + brand.id} style={{ 
																			display: 'flex', 
																			alignItems: 'center', 
																			gap: '12px', 
																			cursor: 'pointer',
																			fontWeight: '500',
																			color: '#495057'
																		}}>
																			<input
																				type='checkbox'
																				checked={brand.isChecked}
																				name='brand_name'
																				id={"brand_id_" + brand.id}
																				onChange={(e) => {
																					handleBandSelect(e.target.checked, brand);
																				}}
																				style={{
																					width: '18px',
																					height: '18px',
																					accentColor: '#007bff',
																					cursor: 'pointer'
																				}}
																			/>
																			{brand.name}
																		</label>
																	</li>
																	)}
															</ul>
															{!isBrandSearching && filteredBrands.length > brandVisibleCount && (
																<button
																	onClick={() => setBrandVisibleCount((c) => c + 10)}
																	style={{
																		marginTop: '8px',
																		background: 'transparent',
																		border: 'none',
																		color: '#007bff',
																		cursor: 'pointer',
																		padding: 0
																	}}
																>
																	Show more
																</button>
															)}
															{!isBrandSearching && brandVisibleCount > 5 && (
																<button
																	onClick={() => setBrandVisibleCount(5)}
																	style={{
																		marginLeft: '12px',
																		marginTop: '8px',
																		background: 'transparent',
																		border: 'none',
																		color: '#007bff',
																		cursor: 'pointer',
																		padding: 0
																	}}
																>
																	Show less
																</button>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>

										<div className="row g-3">
											<div className="col-6 col-lg-12">
												{/* Perfume Notes Search */}
												<div className='shop-sidebar__section -search' style={{
													marginBottom: '32px',
													padding: '20px',
													background: 'rgba(255, 255, 255, 0.9)',
													borderRadius: '12px',
													border: '1px solid rgba(0, 0, 0, 0.1)',
													boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
												}}>
													<div className='section-title -style1 -medium' style={{ 
														marginBottom: "1.5em",
														borderBottom: '2px solid #8abc41',
														paddingBottom: '12px',
														display: 'flex', 
														justifyContent: 'space-between', 
														alignItems: 'center',
														flexWrap: 'wrap',
														gap: '8px'
													}}>
														<h2 className='sidebar-search' style={{
															fontSize: '18px',
															fontWeight: '600',
															color: '#1a1a1a',
															margin: 0,
															display: 'flex',
															alignItems: 'center',
															gap: '8px',
															flex: '1',
															minWidth: '0',
															textAlign: 'left',
															justifyContent: 'flex-start'
														}}>
															<i className="fas fa-spray-can" style={{ color: '#8abc41', flexShrink: 0 }}></i>
															<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Perfume Notes</span>
														</h2>
														<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
															{(selectedBrandIdList.length > 0 || (query.category && query.category !== "" && query.category !== "all") || perfumeNotes.trim() !== "" || season.trim() !== "") && (
																<button 
																	onClick={clearAllFilters}
																	style={{
																		background: 'rgba(108, 117, 125, 0.1)',
																		border: '1px solid rgba(108, 117, 125, 0.2)',
																		color: '#6c757d',
																		cursor: 'pointer',
																		padding: '6px 8px',
																		borderRadius: '6px',
																		transition: 'all 0.3s ease',
																		display: 'flex',
																		alignItems: 'center',
																		justifyContent: 'center',
																		minWidth: '32px',
																		height: '32px'
																	}}
																	onMouseEnter={(e) => {
																		e.target.style.background = 'rgba(108, 117, 125, 0.2)';
																		e.target.style.borderColor = 'rgba(108, 117, 125, 0.4)';
																		e.target.style.transform = 'scale(1.05)';
																	}}
																	onMouseLeave={(e) => {
																		e.target.style.background = 'rgba(108, 117, 125, 0.1)';
																		e.target.style.borderColor = 'rgba(108, 117, 125, 0.2)';
																		e.target.style.transform = 'scale(1)';
																	}}
																	title="Clear all filters"
																>
																	<i className="fas fa-eraser" style={{ fontSize: '14px' }}></i>
																</button>
															)}
															<button 
																className="btn btn-sm btn-light d-lg-none"
																onClick={() => setShowPerfumeNotes(ov => !ov)}
																style={{ 
																	display: 'flex', 
																	alignItems: 'center', 
																	justifyContent: 'center', 
																	padding: '6px 8px', 
																	borderRadius: '6px',
																	flexShrink: 0
																}}
																title={showPerfumeNotes ? 'Collapse' : 'Expand'}
															>
																<i className={showPerfumeNotes ? "fas fa-chevron-up" : "fas fa-chevron-down"} style={{ color: '#6c757d' }}></i>
															</button>
														</div>
													</div>
													{/* Mobile collapsible */}
													<div className='d-lg-none'>
														{showPerfumeNotes && (
															<div className='mobile-filter'>
																<div className='shop-sidebar__section__item'>
																	<label style={{ 
																		display: 'block', 
																		fontSize: '14px', 
																		fontWeight: '500', 
																		color: '#495057', 
																		marginBottom: '8px' 
																	}}>
																		Search Perfume Notes
																	</label>
																	<input
																		type='text'
																		placeholder='Type perfume notes to search...'
																		value={perfumeNotes}
																		onChange={(e) => {
																			setPerfumeNotes(e.target.value);
																			setPageNo(0);
																		}}
																		style={{
																			width: '100%',
																			padding: '12px 16px',
																			border: '2px solid #e9ecef',
																			borderRadius: '10px',
																			fontSize: '14px',
																			background: '#ffffff',
																			color: '#495057',
																			transition: 'all 0.3s ease',
																			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
																		}}
																		onFocus={(e) => {
																			e.target.style.borderColor = '#007bff';
																			e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
																		}}
																		onBlur={(e) => {
																			e.target.style.borderColor = '#e9ecef';
																			e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
																		}}
																	/>
																</div>
															</div>
														)}
													</div>
													{/* Desktop always visible */}
													<div className='d-none d-lg-block'>
														<div className='shop-sidebar__section__item'>
															<input
																type='text'
																placeholder='Search by perfume notes...'
																value={perfumeNotes}
																onChange={(e) => {
																	setPerfumeNotes(e.target.value);
																	setPageNo(0);
																}}
																style={{
																	width: '100%',
																	padding: '12px 16px',
																	border: '2px solid #e9ecef',
																	borderRadius: '10px',
																	fontSize: '14px',
																	background: '#ffffff',
																	color: '#333333',
																	transition: 'all 0.3s ease',
																	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
																}}
																onFocus={(e) => {
																	e.target.style.borderColor = '#007bff';
																	e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
																}}
																onBlur={(e) => {
																	e.target.style.borderColor = '#e9ecef';
																	e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
																}}
															/>
														</div>
													</div>
												</div>
											</div>
											<div className="col-6 col-lg-12">
												{/* Season Search */}
												<div className='shop-sidebar__section -search' style={{
													marginBottom: '32px',
													padding: '20px',
													background: 'rgba(255, 255, 255, 0.9)',
													borderRadius: '12px',
													border: '1px solid rgba(0, 0, 0, 0.1)',
													boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
												}}>
													<div className='section-title -style1 -medium' style={{ 
														marginBottom: "1.5em",
														borderBottom: '2px solid #8abc41',
														paddingBottom: '12px',
														display: 'flex', 
														justifyContent: 'space-between', 
														alignItems: 'center',
														flexWrap: 'wrap',
														gap: '8px'
													}}>
														<h2 className='sidebar-search' style={{
															fontSize: '18px',
															fontWeight: '600',
															color: '#1a1a1a',
															margin: 0,
															display: 'flex',
															alignItems: 'center',
															gap: '8px',
															flex: '1',
															minWidth: '0',
															textAlign: 'left',
															justifyContent: 'flex-start'
														}}>
															<i className="fas fa-sun" style={{ color: '#8abc41', flexShrink: 0 }}></i>
															<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Season</span>
														</h2>
														<div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
															{(selectedBrandIdList.length > 0 || (query.category && query.category !== "" && query.category !== "all") || perfumeNotes.trim() !== "" || season.trim() !== "") && (
																<button 
																	onClick={clearAllFilters}
																	style={{
																		background: 'rgba(108, 117, 125, 0.1)',
																		border: '1px solid rgba(108, 117, 125, 0.2)',
																		color: '#6c757d',
																		cursor: 'pointer',
																		padding: '6px 8px',
																		borderRadius: '6px',
																		transition: 'all 0.3s ease',
																		display: 'flex',
																		alignItems: 'center',
																		justifyContent: 'center',
																		minWidth: '32px',
																		height: '32px'
																	}}
																	onMouseEnter={(e) => {
																		e.target.style.background = 'rgba(108, 117, 125, 0.2)';
																		e.target.style.borderColor = 'rgba(108, 117, 125, 0.4)';
																		e.target.style.transform = 'scale(1.05)';
																	}}
																	onMouseLeave={(e) => {
																		e.target.style.background = 'rgba(108, 117, 125, 0.1)';
																		e.target.style.borderColor = 'rgba(108, 117, 125, 0.2)';
																		e.target.style.transform = 'scale(1)';
																	}}
																	title="Clear all filters"
																>
																	<i className="fas fa-eraser" style={{ fontSize: '14px' }}></i>
																</button>
															)}
															<button 
																className="btn btn-sm btn-light d-lg-none"
																onClick={() => setShowSeason(ov => !ov)}
																style={{ 
																	display: 'flex', 
																	alignItems: 'center', 
																	justifyContent: 'center', 
																	padding: '6px 8px', 
																	borderRadius: '6px',
																	flexShrink: 0
																}}
																title={showSeason ? 'Collapse' : 'Expand'}
															>
																<i className={showSeason ? "fas fa-chevron-up" : "fas fa-chevron-down"} style={{ color: '#6c757d' }}></i>
															</button>
														</div>
													</div>
													{/* Mobile collapsible */}
													<div className='d-lg-none'>
														{showSeason && (
															<div className='mobile-filter'>
																<div className='shop-sidebar__section__item'>
																	<label style={{ 
																		display: 'block', 
																		fontSize: '14px', 
																		fontWeight: '500', 
																		color: '#495057', 
																		marginBottom: '8px' 
																	}}>
																		Search by Season
																	</label>
																	<input
																		type='text'
																		placeholder='Type season to search...'
																		value={season}
																		onChange={(e) => {
																			setSeason(e.target.value);
																			setPageNo(0);
																		}}
																		style={{
																			width: '100%',
																			padding: '12px 16px',
																			border: '2px solid #e9ecef',
																			borderRadius: '10px',
																			fontSize: '14px',
																			background: '#ffffff',
																			color: '#495057',
																			transition: 'all 0.3s ease',
																			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
																		}}
																		onFocus={(e) => {
																			e.target.style.borderColor = '#007bff';
																			e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
																		}}
																		onBlur={(e) => {
																			e.target.style.borderColor = '#e9ecef';
																			e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
																		}}
																	/>
																</div>
															</div>
														)}
													</div>
													{/* Desktop always visible */}
													<div className='d-none d-lg-block'>
														<div className='shop-sidebar__section__item'>
															<input
																type='text'
																placeholder='Search by season...'
																value={season}
																onChange={(e) => {
																	setSeason(e.target.value);
																	setPageNo(0);
																}}
																style={{
																	width: '100%',
																	padding: '12px 16px',
																	border: '2px solid #e9ecef',
																	borderRadius: '10px',
																	fontSize: '14px',
																	background: '#ffffff',
																	color: '#333333',
																	transition: 'all 0.3s ease',
																	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
																}}
																onFocus={(e) => {
																	e.target.style.borderColor = '#007bff';
																	e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
																}}
																onBlur={(e) => {
																	e.target.style.borderColor = '#e9ecef';
																	e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
																}}
															/>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className='col-12 col-md-8 col-lg-9'>
								<div className='shop-header'>
									<div className='shop-header__view'>
										<div className='shop-header__view__icon'>
											<a
												onClick={() => {
													setIsGridView(true);
												}}
												className={isGridView ? "text-success" : "text-secondary"}>
												<i className='fas fa-th'></i>
											</a>
											<a
												onClick={() => {
													setIsGridView(false);
												}}
												className={!isGridView ? "text-success" : "text-secondary"}>
												<i className='fas fa-bars'></i>
											</a>
										</div>
									</div>
								</div>
								<>
									{isLoading ? (
										<div className='col-12 text-center'>
											<i className='fa fa-spinner fa-spin me-2'></i>Loading Products...
										</div>
									) : apiError ? (
										<div className='col-12 text-center'>
											<div className='alert alert-warning' style={{ margin: '20px 0' }}>
												<h5><i className='fas fa-exclamation-triangle me-2'></i>Connection Error</h5>
												<p>Unable to load products. Please check your internet connection.</p>
												<button 
													className='btn btn-primary' 
													onClick={retryApiCall}
													style={{ marginTop: '10px' }}
												>
													<i className='fas fa-redo me-2'></i>Retry
												</button>
											</div>
										</div>
									) : (
										<div className='shop-products '>
											<div className='shop-products__gird'>
												<div className='row'>
													{
														displayedProductList.length > 0 ? (
															displayedProductList.map((product, i) => <Product key={i} product={product} viewType={isGridView} shopPage={true} />)
														) : (
															<div className='col-12 text-center'>
																<div className='alert alert-info' style={{ margin: '20px 0' }}>
																	<h5><i className='fas fa-info-circle me-2'></i>No Products Found</h5>
																	<p>No products match your current filters.</p>
																	<button 
																		className='btn btn-outline-primary' 
																		onClick={clearAllFilters}
																		style={{ marginTop: '10px' }}
																	>
																		<i className='fas fa-eraser me-2'></i>Clear Filters
																	</button>
																</div>
															</div>
														)
													}
												</div>
												{displayedProductList.length > 0 && (
													<div className='row'>
														<div className="col-12">
															<Pagination recordCount={totalCount} recordPerPage={pageSize} setPageNo={(n) => setPageNo(n)} setPageSize={(n) => setPageSize(n)} />
														</div>
													</div>
												)}
											</div>
										</div>
									)}
								</>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
