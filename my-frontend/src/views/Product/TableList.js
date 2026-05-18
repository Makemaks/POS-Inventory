import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Row,
  Col,
  Button,
  Input,
  FormGroup,
  Label,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";

const fetchProductData = async () => {
  const response = await fetch("http://localhost:3001/api/products");

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return await response.json();
};

const fetchProductTypes = async () => {
  const response = await fetch("http://localhost:3001/api/product-types");

  if (!response.ok) {
    throw new Error("Failed to fetch product types");
  }

  return await response.json();
};

function RegularTables() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductData();
        setProducts(data);
        setFilteredProducts(data);

        const types = await fetchProductTypes();
        setProductTypes(types);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (productId) => {
    window.location.href = `${window.location.origin}/admin/edit-product/${productId}`;
  };

  const handleAddClick = () => {
    window.location.href = `${window.location.origin}/admin/add-product`;
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterProducts(value, selectedType);
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    filterProducts(searchTerm, value);
  };

  const filterProducts = (search, type) => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        type === "" || String(product.type_id) === String(type);

      return matchesSearch && matchesType;
    });

    setCurrentPage(1);
    setFilteredProducts(filtered);
  };

  const getValueByKey = (product, key) => {
    switch (key) {
      case "retail_price":
        return Number(product.retail_price || 0);
      case "price":
        return Number(product.price || 0);
      case "quantity":
        return Number(product.quantity || 0);
      case "type_name":
        return product.type_name || "";
      default:
        return product[key] || "";
    }
  };

  const handleSort = (key) => {
    let direction = "asc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const valA = getValueByKey(a, key);
      const valB = getValueByKey(b, key);

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < pageNumbers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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

    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  return (
    <>
      <PanelHeader size="sm" />

      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle tag="h4" style={{ fontWeight: "bold" }}>
                  Product List
                </CardTitle>

                <Button color="success" onClick={handleAddClick}>
                  Add Product
                </Button>
              </CardHeader>

              <CardBody>
                <Row>
                  <Col md="4">
                    <Label>Search by Name</Label>
                    <Input
                      type="text"
                      placeholder="Search by product name"
                      value={searchTerm}
                      onChange={handleSearch}
                      style={{
                        height: "35px",
                        marginBottom: "10px",
                      }}
                    />
                  </Col>

                  <Col md="4">
                    <FormGroup>
                      <Label for="productType">Filter by Type</Label>
                      <Input
                        type="select"
                        id="productType"
                        value={selectedType}
                        onChange={handleTypeChange}
                        style={{
                          height: "35px",
                          marginBottom: "10px",
                        }}
                      >
                        <option value="">All Types</option>

                        {productTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <Table responsive>
                  <thead className="text-primary" style={{ fontSize: "10px" }}>
                    <tr>
                      <th
                        onClick={() => handleSort("name")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Name {renderSortIcon("name")}
                      </th>

                      <th
                        onClick={() => handleSort("description")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Description {renderSortIcon("description")}
                      </th>

                      <th
                        onClick={() => handleSort("price")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Price {renderSortIcon("price")}
                      </th>

                      <th
                        onClick={() => handleSort("retail_price")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Retail Price {renderSortIcon("retail_price")}
                      </th>

                      <th
                        onClick={() => handleSort("quantity")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Quantity {renderSortIcon("quantity")}
                      </th>

                      <th
                        onClick={() => handleSort("type_name")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Type {renderSortIcon("type_name")}
                      </th>

                      <th
                        onClick={() => handleSort("image")}
                        style={{ fontWeight: "bold", cursor: "pointer" }}
                      >
                        Image {renderSortIcon("image")}
                      </th>

                      <th style={{ fontWeight: "bold" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentItems.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.description}</td>
                        <td>₱{product.price}</td>
                        <td>₱{product.retail_price}</td>
                        <td>{product.quantity}</td>
                        <td>{product.type_name}</td>
                        <td>
                          <img
                            src={
                              product.image
                                ? product.image
                                : "http://localhost:3001/images/empty.jpg"
                            }
                            alt={product.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "contain",
                            }}
                          />
                        </td>
                        <td>
                          <Button
                            color="info"
                            size="sm"
                            onClick={() => handleEditClick(product.id)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="pagination justify-content-center">
                  <Button
                    onClick={handleFirstPage}
                    disabled={currentPage === 1}
                    style={{ fontSize: "16px" }}
                  >
                    &laquo;
                  </Button>

                  <Button
                    onClick={handleBack}
                    disabled={currentPage === 1}
                    style={{ fontSize: "16px" }}
                  >
                    &lsaquo;
                  </Button>

                  {visiblePageNumbers.map((number) => (
                    <Button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      active={number === currentPage}
                      style={{
                        fontSize: "16px",
                        fontWeight: number === currentPage ? "bold" : "normal",
                        backgroundColor:
                          number === currentPage ? "#007bff" : "",
                        borderColor: number === currentPage ? "#007bff" : "",
                        color: number === currentPage ? "white" : "",
                      }}
                    >
                      {number}
                    </Button>
                  ))}

                  <Button
                    onClick={handleNext}
                    disabled={
                      pageNumbers.length === 0 ||
                      currentPage === pageNumbers.length
                    }
                    style={{ fontSize: "16px" }}
                  >
                    &rsaquo;
                  </Button>

                  <Button
                    onClick={handleLastPage}
                    disabled={
                      pageNumbers.length === 0 ||
                      currentPage === pageNumbers.length
                    }
                    style={{ fontSize: "16px" }}
                  >
                    &raquo;
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default RegularTables;