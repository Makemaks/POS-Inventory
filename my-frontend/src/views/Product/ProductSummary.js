import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardTitle, Table, Row, Col, FormGroup, Label, Input } from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";

const fetchInvoices = async (startDate, endDate) => {
  try {
    // Construct URL parameters based on whether dates are provided
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get('http://localhost:3001/api/invoices', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];  // Return an empty array to handle errors gracefully
  }
};

const fetchProductDetails = async (productIds) => {
  try {
    const response = await axios.post('http://localhost:3001/api/products/many', { productIds });
    if (response.status !== 200) {
      throw new Error('Failed to fetch product details');
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return [];
  }
};

function ProductSummary() {
  const [productsSummary, setProductsSummary] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    const invoices = await fetchInvoices(startDate, endDate);
    const productQuantities = {};

    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const productId = item.product._id;
        productQuantities[productId] = (productQuantities[productId] || 0) + item.quantity;
      });
    });

    const uniqueProductIds = Object.keys(productQuantities);
    const products = await fetchProductDetails(uniqueProductIds);

    const summary = products.map(product => ({
      ...product,
      totalQuantity: productQuantities[product._id]
    }));

    setProductsSummary(summary);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    filterProducts(e.target.value.toLowerCase(), selectedType);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    filterProducts(searchTerm, e.target.value);
  };

  const filterProducts = (search, type) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(search) &&
      (type === "" || product.type._id === type)
    );
    setFilteredProducts(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const valA = key.split('.').reduce((o, i) => o[i], a);
      const valB = key.split('.').reduce((o, i) => o[i], b);

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredProducts(sortedProducts);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleBack = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(Math.ceil(filteredProducts.length / itemsPerPage));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProducts.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const visiblePageNumbers = pageNumbers.slice(
    Math.max(0, currentPage - 3),
    Math.min(currentPage + 2, pageNumbers.length)
  );

  const renderSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  return (
    <>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Sales List</CardTitle>
              </CardHeader>
              <CardBody>
                <FormGroup row>
                  <Label for="startDate" sm={2}>Start Date</Label>
                  <Col sm={4}>
                    <Input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </Col>
                  <Label for="endDate" sm={2}>End Date</Label>
                  <Col sm={4}>
                    <Input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </Col>
                </FormGroup>
                <Table responsive>
                  <thead className="text-primary">
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ fontWeight: 'bold' }}>Name</th>
                      <th style={{ fontWeight: 'bold' }}>Description</th>
                      <th style={{ fontWeight: 'bold' }}>Total Quantity</th>
                      <th style={{ fontWeight: 'bold' }}>Type</th>
                      <th style={{ fontWeight: 'bold' }}>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsSummary.map((product, index) => (
                      <tr key={index}>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>{product.totalQuantity}</td>
                        <td>{product.type.name}</td>
                        <td>
                          <img
                            src={product.image ? product.image : `http://localhost:3001/images/empty.jpg`}
                            alt={product.name}
                            style={{ width: '50px', height: '50px' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default ProductSummary;
