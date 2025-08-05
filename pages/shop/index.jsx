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

	const [totalCount, setTotalCount] = useState(0);
	const [pageNo, setPageNo] = useState(0);
	const [pageSize, setPageSize] = useState(24);

	const [showBrandFilter, setShowBrandFilter] = useState(false);
	const [showCategoryFilter, setShowCategoryFilter] = useState(false);
	const [perfumeNotes, setPerfumeNotes] = useState("");
	const [season, setSeason] = useState("");

	useEffect(() => {
		axios.get(apiUrl + "/web/getall/brand").then((response) => {
			// console.log(response);
			if (response.data.appStatus) {
				const brandList = response.data.appData;
				brandList.map((brand) => {
					brand.isChecked = false;
				});
				setProductBrandList(brandList);
			}
		});

		axios.get(apiUrl + "/web/getall/category").then((response) => {
			// console.log(response);
			if (response.data.appStatus) {
				setCategoryList(response.data.appData);
			}
		});
	}, []);

	useEffect(() => {
		axios
			.post(apiUrl + "/web/getall/product", {
				pageSize: 1000, // Get all products for client-side filtering
				pageNo: 0
			})
			.then((response) => {
				// console.log(response);
				if (response.data.appStatus) {
					setAllProductList(response.data.appData.rows);
					setIsLoading(false);
				}
			});
	}, []);

	// Handle filtering and pagination
	useEffect(() => {
		let filtered = [...allProductList];

		// Apply category filter
		if (query.category && query.category !== "" && query.category !== "all") {
			filtered = filtered.filter((pl) => pl.productcategory.id === Number(query.category));
		}

		// Apply brand filter
		if (selectedBrandIdList.length > 0) {
			filtered = filtered.filter((pl) => selectedBrandIdList.includes(pl.productbrand.id));
		}

		// Apply perfume notes filter
		if (perfumeNotes.trim() !== "") {
			filtered = filtered.filter((pl) => 
				pl.perfume_notes && 
				pl.perfume_notes.toLowerCase().includes(perfumeNotes.toLowerCase())
			);
		}

		// Apply season filter
		if (season.trim() !== "") {
			filtered = filtered.filter((pl) => 
				pl.season && 
				pl.season.toLowerCase().includes(season.toLowerCase())
			);
		}

		setFilteredProductList(filtered);
		setTotalCount(filtered.length);

		// Apply pagination
		const startIndex = pageNo * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedProducts = filtered.slice(startIndex, endIndex);
		setDisplayedProductList(paginatedProducts);
	}, [allProductList, query.category, selectedBrandIdList, perfumeNotes, season, pageNo, pageSize]);

	const handleCategorySelect = (categoryId) => {
		setIsLoading(true);
		setPageNo(0); // Reset to first page when category changes
		
		if (categoryId === "all") {
			router.push("/shop");
		} else {
			let href = "/shop?category=" + categoryId;
			router.push(href);
		}
		
		setIsLoading(false);
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
		
		// Clear category filter by redirecting to shop without category
		router.push("/shop");
		
		// Reset pagination
		setPageNo(0);
		setIsLoading(false);
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
									background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
									borderRadius: '16px',
									boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
									border: '1px solid rgba(255, 255, 255, 0.2)',
									backdropFilter: 'blur(10px)',
									padding: '28px',
									marginBottom: '24px',
									minWidth: '280px'
								}}>
									<div className='shop-sidebar__content'>
										<div className='shop-sidebar__section -categories' style={{
											marginBottom: '32px',
											padding: '20px',
											background: 'rgba(255, 255, 255, 0.7)',
											borderRadius: '12px',
											border: '1px solid rgba(255, 255, 255, 0.3)',
											boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
										}}>
											<div className='section-title -style1 -medium' style={{ 
												marginBottom: "1.5em",
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
												borderBottom: '2px solid #e9ecef',
												paddingBottom: '12px'
											}}>
												<h2 className='sidebar-categories' style={{
													fontSize: '18px',
													fontWeight: '600',
													color: '#2c3e50',
													margin: 0,
													display: 'flex',
													alignItems: 'center',
													gap: '8px'
												}}>
													<i className="fas fa-tags" style={{ color: '#6c757d' }}></i>
													Categories
												</h2>
												<i className="fas fa-filter fa-lg mobile-filter" 
													onClick={() => setShowCategoryFilter(ov => !ov)}
													style={{
														color: '#6c757d',
														cursor: 'pointer',
														padding: '8px',
														borderRadius: '6px',
														transition: 'all 0.3s ease',
														background: 'rgba(108, 117, 125, 0.1)'
													}}
													onMouseEnter={(e) => {
														e.target.style.background = 'rgba(108, 117, 125, 0.2)';
														e.target.style.transform = 'scale(1.1)';
													}}
													onMouseLeave={(e) => {
														e.target.style.background = 'rgba(108, 117, 125, 0.1)';
														e.target.style.transform = 'scale(1)';
													}}
												></i>
											</div>
											<div className="mobile-filter">
												{showCategoryFilter ?
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
													</ul> : <></>
												}
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
										<div className='shop-sidebar__section -refine' style={{
											marginBottom: '32px',
											padding: '20px',
											background: 'rgba(255, 255, 255, 0.7)',
											borderRadius: '12px',
											border: '1px solid rgba(255, 255, 255, 0.3)',
											boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
										}}>
											<div className='section-title -style1 -medium' style={{ 
												marginBottom: "1.5em",
												borderBottom: '2px solid #e9ecef',
												paddingBottom: '12px'
											}}>
												<div style={{ 
													display: 'flex', 
													justifyContent: 'space-between', 
													alignItems: 'center',
													marginBottom: '12px'
												}}>
													<h2 className='sidebar-refine-search' style={{
														fontSize: '18px',
														fontWeight: '600',
														color: '#2c3e50',
														margin: 0,
														display: 'flex',
														alignItems: 'center',
														gap: '8px'
													}}>
														<i className="fas fa-star" style={{ color: '#6c757d' }}></i>
														Inspired By
													</h2>
													<div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
														<i className="fas fa-filter fa-lg mobile-filter" 
															onClick={() => setShowBrandFilter(ov => !ov)}
															style={{
																color: '#6c757d',
																cursor: 'pointer',
																padding: '8px',
																borderRadius: '6px',
																transition: 'all 0.3s ease',
																background: 'rgba(108, 117, 125, 0.1)'
															}}
															onMouseEnter={(e) => {
																e.target.style.background = 'rgba(108, 117, 125, 0.2)';
																e.target.style.transform = 'scale(1.1)';
															}}
															onMouseLeave={(e) => {
																e.target.style.background = 'rgba(108, 117, 125, 0.1)';
																e.target.style.transform = 'scale(1)';
															}}
														></i>
													</div>
												</div>
											</div>
											<div className="mobile-filter">
												{showBrandFilter ?
													<div className='shop-sidebar__section__item'>
														<ul style={{ margin: 0, padding: 0 }}>
															{productBrandList?.map((brand, i) =>
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
													</div> : <></>
												}
											</div>
											<div className="desktop-filter">
												<div className='shop-sidebar__section__item'>
													<ul style={{ margin: 0, padding: 0 }}>
														{productBrandList?.map((brand, i) =>
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
												</div>
											</div>
										</div>
										
										{/* Perfume Notes Search */}
										<div className='shop-sidebar__section -search' style={{
											marginBottom: '32px',
											padding: '20px',
											background: 'rgba(255, 255, 255, 0.7)',
											borderRadius: '12px',
											border: '1px solid rgba(255, 255, 255, 0.3)',
											boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
										}}>
											<div className='section-title -style1 -medium' style={{ 
												marginBottom: "1.5em",
												borderBottom: '2px solid #e9ecef',
												paddingBottom: '12px'
											}}>
												<h2 className='sidebar-search' style={{
													fontSize: '18px',
													fontWeight: '600',
													color: '#2c3e50',
													margin: 0,
													display: 'flex',
													alignItems: 'center',
													gap: '8px'
												}}>
													<i className="fas fa-spray-can" style={{ color: '#6c757d' }}></i>
													Perfume Notes
												</h2>
											</div>
											<div className='shop-sidebar__section__item'>
												<input
													type='text'
													placeholder='Search by perfume notes...'
													value={perfumeNotes}
													onChange={(e) => {
														setPerfumeNotes(e.target.value);
														setPageNo(0); // Reset to first page when search changes
													}}
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid rgba(255, 255, 255, 0.5)',
														borderRadius: '10px',
														fontSize: '14px',
														background: 'rgba(255, 255, 255, 0.8)',
														transition: 'all 0.3s ease',
														boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
													}}
													onFocus={(e) => {
														e.target.style.borderColor = '#007bff';
														e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
													}}
													onBlur={(e) => {
														e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
														e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
													}}
												/>
											</div>
										</div>

										{/* Season Search */}
										<div className='shop-sidebar__section -search' style={{
											marginBottom: '32px',
											padding: '20px',
											background: 'rgba(255, 255, 255, 0.7)',
											borderRadius: '12px',
											border: '1px solid rgba(255, 255, 255, 0.3)',
											boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
										}}>
											<div className='section-title -style1 -medium' style={{ 
												marginBottom: "1.5em",
												borderBottom: '2px solid #e9ecef',
												paddingBottom: '12px'
											}}>
												<h2 className='sidebar-search' style={{
													fontSize: '18px',
													fontWeight: '600',
													color: '#2c3e50',
													margin: 0,
													display: 'flex',
													alignItems: 'center',
													gap: '8px'
												}}>
													<i className="fas fa-sun" style={{ color: '#6c757d' }}></i>
													Season
												</h2>
											</div>
											<div className='shop-sidebar__section__item'>
												<input
													type='text'
													placeholder='Search by season...'
													value={season}
													onChange={(e) => {
														setSeason(e.target.value);
														setPageNo(0); // Reset to first page when search changes
													}}
													style={{
														width: '100%',
														padding: '12px 16px',
														border: '2px solid rgba(255, 255, 255, 0.5)',
														borderRadius: '10px',
														fontSize: '14px',
														background: 'rgba(255, 255, 255, 0.8)',
														transition: 'all 0.3s ease',
														boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
													}}
													onFocus={(e) => {
														e.target.style.borderColor = '#007bff';
														e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
													}}
													onBlur={(e) => {
														e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
														e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
													}}
												/>
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
									) : (
										<div className='shop-products '>
											<div className='shop-products__gird'>
												<div className='row'>
													{
														displayedProductList.length > 0 &&
														displayedProductList.map((product, i) => <Product key={i} product={product} viewType={isGridView} shopPage={true} />)
													}
												</div>
												<div className='row'>
													<div className="col-12">
														<Pagination recordCount={totalCount} recordPerPage={pageSize} setPageNo={(n) => setPageNo(n)} setPageSize={(n) => setPageSize(n)} />
													</div>
												</div>
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
