import React, { useEffect, useState, useContext } from "react";
import Layout from "../../layouts/Layout";
import {apiUrl} from "../../config";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Product from "../../components/shop/Product";
import TablePagination from '@mui/material/TablePagination';

function Pagination({ recordCount = 0, recordPerPage = 10, setPageNo = () => { }, setPageSize = () => { } }) {
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
		/>
	);
}

export default function Index() {
	const [isGridView, setIsGridView] = useState(true);
	const router = useRouter();
	const query = router.query;
	const [allProductList, setAllProductList] = useState([]);
	const [productList, setProductList] = useState([]);
	const [productBrandList, setProductBrandList] = useState([]);
	const [selectedBrandIdList, setSelectedBrandIdList] = useState([]);
	const [categoryList, setCategoryList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	const [totalCount, setTotalCount] = useState(0);
	const [pageNo, setPageNo] = useState(0);
	const [pageSize, setPageSize] = useState(10);

	const [showBrandFilter, setShowBrandFilter] = useState(false);
	const [showCategoryFilter, setShowCategoryFilter] = useState(false);

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
				pageSize: pageSize,
				pageNo: pageNo
			})
			.then((response) => {
				// console.log(response);
				if (response.data.appStatus) {
					setAllProductList(response.data.appData.rows);
					const allProducts = response.data.appData.rows;
					if (query.category && query.category !== "" && query.category !== "all") {
						const localProductList = allProducts.filter((pl) => pl.productcategory.id === Number(query.category));
						setProductList(localProductList);
					} else {
						setProductList(response.data.appData.rows);
						setTotalCount(response.data.appData.count);
					}
					setIsLoading(false);
				}
			});
	}, [query.category, pageNo, pageSize]);

	const handleCategorySelect = (categoryId) => {
		setIsLoading(true);
		let href = "/shop?category=" + categoryId;
		router.push(href);

		if (categoryId === "all") {
			if (selectedBrandIdList.length > 0) {
				let tempLocalProductList = [];
				selectedBrandIdList.map((brandId) => {
					const localProduct = allProductList.filter((pl) => pl.productbrand.id === brandId);
					tempLocalProductList.push(...localProduct);
				});
				setProductList([...tempLocalProductList]);
				setIsLoading(false);
			} else {
				const localProductList = [...allProductList];
				setProductList(localProductList);
				setIsLoading(false);
			}
		} else {
			const localProductList = allProductList.filter((pl) => pl.productcategory.id === categoryId);
			if (selectedBrandIdList.length > 0) {
				let tempLocalProductList = [];
				selectedBrandIdList.map((brandId) => {
					const localProduct = localProductList.filter((pl) => pl.productbrand.id === brandId);
					tempLocalProductList.push(...localProduct);
				});
				setProductList([...tempLocalProductList]);
				setIsLoading(false);
			} else {
				setProductList(localProductList);
				setIsLoading(false);
			}
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
		setIsLoading(true);
		setSelectedBrandIdList(selectedBrandIds);

		if (query.category && query.category !== "" && query.category !== "all") {
			const localProducts = allProductList.filter((pl) => pl.productcategory.id === Number(query.category));
			if (selectedBrandIds.length > 0) {
				let localProductList = [];
				selectedBrandIds.map((brandId) => {
					const localProduct = localProducts.filter((pl) => pl.productbrand.id === brandId);
					localProductList.push(...localProduct);
				});
				setProductList([...localProductList]);
				setIsLoading(false);
			} else {
				const localProductList = [...localProducts];
				setProductList(localProductList);
				setIsLoading(false);
			}
		} else {
			if (selectedBrandIds.length > 0) {
				let localProductList = [];
				selectedBrandIds.map((brandId) => {
					const localProduct = allProductList.filter((pl) => pl.productbrand.id === brandId);
					localProductList.push(...localProduct);
				});
				setProductList([...localProductList]);
				setIsLoading(false);
			} else {
				const localProductList = [...allProductList];
				setProductList(localProductList);
				setIsLoading(false);
			}
		}
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
		
		// Clear category filter by redirecting to shop without category
		router.push("/shop");
		
		// Reset to show all products
		setProductList(allProductList);
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
								<div className='shop-sidebar'>
									<div className='shop-sidebar__content'>
										<div className='shop-sidebar__section -categories'>
											<div className='section-title -style1 -medium' style={{ marginBottom: "1.875em" }}>
												<h2 className='sidebar-categories'>
													Categories
												</h2>
												<i className="fas fa-filter fa-lg mobile-filter" onClick={() => setShowCategoryFilter(ov => !ov)}></i>
											</div>
											<div className="mobile-filter">
												{showCategoryFilter ?
													<ul>
														<li onClick={() => handleCategorySelect("all")} style={{ cursor: 'pointer' }}>All</li>
														{categoryList.map((category) =>
															<li key={category.id} onClick={() => handleCategorySelect(category.id)} style={{ cursor: 'pointer' }}>
																{category.category_name}
															</li>
														)}
													</ul> : <></>
												}
											</div>
											<div className="desktop-filter">
												<ul>
													<li onClick={() => handleCategorySelect("all")} style={{ cursor: 'pointer' }}>All</li>
													{categoryList.map((category) =>
														<li key={category.id} onClick={() => handleCategorySelect(category.id)} style={{ cursor: 'pointer' }}>
															{category.category_name}
														</li>
													)}
												</ul>
											</div>
										</div>
										<div className='shop-sidebar__section -refine'>
											<div className='section-title -style1 -medium' style={{ marginBottom: "1.875em" }}>
												<h2 className='sidebar-refine-search'>
													Inspired By
												</h2>
												<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
													<i className="fas fa-filter fa-lg mobile-filter" onClick={() => setShowBrandFilter(ov => !ov)}></i>
													{(selectedBrandIdList.length > 0 || (query.category && query.category !== "" && query.category !== "all")) && (
														<button 
															onClick={clearAllFilters}
															style={{
																background: 'none',
																border: 'none',
																color: '#dc3545',
																fontSize: '14px',
																fontWeight: '500',
																cursor: 'pointer',
																padding: '4px 8px',
																borderRadius: '4px',
																textDecoration: 'underline'
															}}
															title="Clear all filters"
														>
															Clear
														</button>
													)}
												</div>
											</div>
											<div className="mobile-filter">
												{showBrandFilter ?
													<div className='shop-sidebar__section__item'>
														<ul>
															{productBrandList?.map((brand, i) =>
																<li key={i}>
																	<label htmlFor={"brand_id_" + brand.id}>
																		<input
																			type='checkbox'
																			checked={brand.isChecked}
																			name='brand_name'
																			id={"brand_id_" + brand.id}
																			onChange={(e) => {
																				handleBandSelect(e.target.checked, brand);
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
													<ul>
														{productBrandList?.map((brand, i) =>
															<li key={i}>
																<label htmlFor={"brand_id_" + brand.id}>
																	<input
																		type='checkbox'
																		checked={brand.isChecked}
																		name='brand_name'
																		id={"brand_id_" + brand.id}
																		onChange={(e) => {
																			handleBandSelect(e.target.checked, brand);
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
														productList.length > 0 &&
														productList.map((product, i) => <Product key={i} product={product} viewType={isGridView} shopPage={true} />)
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
