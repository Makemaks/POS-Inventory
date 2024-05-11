import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Spinner,
  Label,
} from "reactstrap";
import NotificationAlert from "react-notification-alert";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import axios from "axios";

function AddProduct() {
  const notificationAlert = useRef();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    retailPrice: "",
    quantity: "",
    type: "",
    image: "",
    barcode: "",
  });
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/product-types');
        setProductTypes(response.data);
      } catch (error) {
        console.error('Error fetching product types:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductTypes();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(`http://localhost:3001/api/products/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProduct({ ...product, image: response.data.image });
    }
  };

  const handleTypeChange = (event) => {
    setProduct({ ...product, type: event.target.value });
  };

  const notify = (message) => {
    const options = {
      place: "tr",
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: "danger",
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 5,
    };
    notificationAlert.current.notificationAlert(options);
  };

  const handleImageButtonClick = () => {
    if (!product.name) {
      notify("Add Product First");
      return;
    }
    document.querySelector('input[type="file"]').click();
  };

  const handleScan = () => {
    window.location.href = `http://localhost:3000/admin/scanner`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3001/api/products`, product);
      window.location.href = `http://localhost:3000/admin/edit-product/${response.data._id}/true`;
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  if (loading) {
    return (
      <div className="content d-flex justify-content-center align-items-center">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div>
      <PanelHeader size="sm" />
      <div className="content">
        <NotificationAlert ref={notificationAlert} />
        <Row className="equal-height-row" style={{ alignItems: 'stretch' }}>
          <Col md="8" style={{ display: 'flex', flexDirection: 'column' }}>
            <Card className="h-100" style={{ flex: '1 0 auto' }}>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle tag="h4" style={{ fontWeight: 'bold' }}>Add Product</CardTitle>
                <Button color="success" onClick={handleScan}>Scan Bar Code</Button>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Name</label>
                        <Input
                          value={product.name}
                          placeholder="Name"
                          type="text"
                          required
                          onChange={(e) =>
                            setProduct({ ...product, name: e.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <label>Description</label>
                        <Input
                          value={product.description}
                          placeholder="Description"
                          type="text"
                          required
                          onChange={(e) =>
                            setProduct({ ...product, description: e.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Price</label>
                        <Input
                          value={product.price}
                          placeholder="Price"
                          type="number"
                          required
                          onChange={(e) =>
                            setProduct({ ...product, price: parseFloat(e.target.value) })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <label>Retail Price</label>
                        <Input
                          value={product.retailPrice}
                          placeholder="Retail Price"
                          type="number"
                          required
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              retailPrice: parseFloat(e.target.value),
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Quantity</label>
                        <Input
                          value={product.quantity}
                          placeholder="Quantity"
                          type="number"
                          required
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              quantity: parseInt(e.target.value),
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="productType">Product Type</Label>
                        <Input
                          type="select"
                          id="productType"
                          value={product.type}
                          required
                          onChange={handleTypeChange}
                        >
                          <option value="">Select Type</option>
                          {productTypes.map((type) => (
                            <option key={type._id} value={type._id}>
                              {type.name}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Barcode</label>
                        <Input
                          defaultValue={product.barcode}
                          placeholder="Barcode"
                          type="text"
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              barcode: e.target.value,
                            })
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-center">
                    <Button color="primary" type="submit" style={{ backgroundColor: '#87CEEB', borderColor: '#87CEEB' }}>
                      Add Product
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col md="4" style={{ display: 'flex', flexDirection: 'column' }}>
            <Card className="card-user h-100" style={{ flex: '1 0 auto' }}>
              <CardBody>
                <FormGroup>
                  <h5 className="title">Product Image</h5>
                  <div className="mb-2">
                    <img
                      src={product.image ? `http://localhost:3001/${product.image}` : `http://localhost:3001/images/empty.jpg`}
                      alt="Product Image"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    accept=".jpg,.jpeg,.png"
                    hidden
                  />
                  <div className="d-flex justify-content-center mt-2">
                    <Button
                      color="primary"
                      onClick={handleImageButtonClick}
                      style={{ backgroundColor: '#87CEEB', borderColor: '#87CEEB' }}
                    >
                      Change Image
                    </Button>
                  </div>
                </FormGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AddProduct;
