import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
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
import { useParams } from "react-router-dom";
import axios from "axios";

function EditProduct() {
  const notificationAlert = useRef();
  const { id, add, scan } = useParams();
  const [product, setProduct] = useState({ name: "", image: "", barcode: "", type: "" });
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const notify = (message) => {
    const options = {
      place: "tr",
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: "success",
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 5,
    };
    notificationAlert.current.notificationAlert(options);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/products/${id}`);
        const productData = response.data;
        setProduct({
          ...productData,
          type: productData.type ? productData.type._id : "",
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/product-types");
        setProductTypes(response.data);
      } catch (error) {
        console.error("Error fetching product types:", error);
      }
    };
    fetchProductTypes();
  }, []);

  useEffect(() => {
    if (!loading && add === "true") {
      notify("Product added successfully!");
    }
  }, [loading, add]);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.put(`http://localhost:3001/api/products/${id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const newImagePath = response.data.image;
        setProduct({ ...product, image: newImagePath });

        notify("Product Image Updated!");
      } catch (error) {
        notify("Error updating product image.");
        console.error("Error updating product image:", error);
      }
    }
  };

  const handleTypeChange = (event) => {
    setProduct({ ...product, type: event.target.value });
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/products/${id}`, product);
      notify("Product Updated!");
      if(scan){
        setTimeout(() => {
          window.location.href = `${window.location.origin}/admin/product-tables`;
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating product:", error);
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
        <Row className="equal-height-row" style={{ alignItems: "stretch" }}>
          <Col md="8" style={{ display: "flex", flexDirection: "column" }}>
            <Card className="h-100" style={{ flex: "1 0 auto" }}>
              <CardHeader>
                <h5 className="title">Edit Product</h5>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Name</label>
                        <Input
                          defaultValue={product.name}
                          placeholder="Name"
                          type="text"
                          onChange={(e) =>
                            setProduct({ ...product, name: e.target.value })
                          }
                          disabled={scan === "true"} // Set disabled attribute based on scan value
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <label>Description</label>
                        <Input
                          defaultValue={product.description}
                          placeholder="Description"
                          type="text"
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              description: e.target.value,
                            })
                          }
                          disabled={scan === "true"}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Price</label>
                        <Input
                          defaultValue={product.price}
                          placeholder="Price"
                          type="number"
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              price: parseFloat(e.target.value),
                            })
                          }
                          required={scan === "true"}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <label>Retail Price</label>
                        <Input
                          defaultValue={product.retailPrice}
                          placeholder="Retail Price"
                          type="number"
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              retailPrice: parseFloat(e.target.value),
                            })
                          }
                          required={scan === "true"}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <label>Quantity</label>
                        <Input
                          defaultValue={product.quantity}
                          placeholder="Quantity"
                          type="number"
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              quantity: parseInt(e.target.value),
                            })
                          }
                          required={scan === "true"}
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
                          onChange={handleTypeChange}
                          required={scan === "true"}
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
                          disabled={scan === "true"}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-center">
                    <Button
                      color="primary"
                      type="submit"
                      style={{ backgroundColor: "#87CEEB", borderColor: "#87CEEB" }}
                    >
                      Submit Edit
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col md="4" style={{ display: "flex", flexDirection: "column" }}>
            <Card className="card-user h-100" style={{ flex: "1 0 auto" }}>
              <CardBody>
                <FormGroup>
                  <h5 className="title">Product Image</h5>
                  <div className="mb-2">
                    <img
                      src={product.image ? product.image : "http://localhost:3001/images/empty.jpg"}
                      alt={product.name}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    accept=".jpg,.jpeg,.png"
                  />
                  <div className="d-flex justify-content-center mt-2">
                    <Button
                      color="primary"
                      onClick={() => document.querySelector('input[type="file"]').click()}
                      style={{ backgroundColor: "#87CEEB", borderColor: "#87CEEB" }}
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

export default EditProduct;
