import React, { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import axios from "axios";

function Scanner() {
  const [barcode, setBarcode] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    retailPrice: "",
    quantity: "",
    type: "6637bf34c7100e3424ebe764",
    barcode: "",
    image: "",
  });

  const handleUpdate = async (err, result) => {
    if (err) {
      console.error("Scanner Error:", err);
      return;
    }

    if (result && result.text) {
      const scannedBarcode = result.text;
      fetchProductInfo(scannedBarcode);
    }
  };

  const fetchProductInfo = async (barcode) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/products/lookup/${barcode}`
      );

      setBarcode(barcode);
      setProductInfo(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching product info:", error);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    fetchProductInfo(manualBarcode);
    setBarcodeModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (!productInfo) {
        console.error("No product information available to submit");
        return;
      }
  
      // Extracting relevant product info
      const { title, barcode_number, images, description } = productInfo;
  
      // Set the product state with all necessary fields at once
      const updatedProduct = {
        ...product,
        name: title || "",
        barcode: barcode_number || "",
        image: images[0] || "",
        description: description || ""
      };
  
      // Make sure the product contains required information
      if (!updatedProduct.name || !updatedProduct.barcode) {
        console.error("Missing required product information");
        return;
      }
  
      // Post the product information to the backend
      const response = await axios.post(`http://localhost:3001/api/products`, updatedProduct);
  
      // Redirect to the edit product page after successful submission
      if (response.data && response.data._id) {
        window.location.href = `http://localhost:3000/admin/edit-product/${response.data._id}/true/true`;
      } else {
        console.error("Unexpected response data:", response.data);
      }
  
    } catch (error) {
      console.error("Error adding product:", error.message || error);
    }
  };
  

  return (
    <div>
      <PanelHeader size="sm" />
      <div className="content">
        <Row>
          <Col xs={12}>
            <Card>
              <CardHeader>
                <h4 style={{ display: "inline-block" }}>Barcode Scanner</h4>
                <Button
                  color="primary"
                  onClick={() => setBarcodeModalOpen(true)}
                  style={{ float: "right" }}
                >
                  Input Bar Code Number
                </Button>
              </CardHeader>
              <CardBody>
                <div>
                  <BarcodeScannerComponent
                    onUpdate={handleUpdate}
                    width="100%"
                    delay={300} // Adjust scan interval
                    facingMode="environment" // Ensure back camera
                  />
                </div>
                {barcode && (
                  <p>
                    <strong>Scanned Code:</strong> {barcode}
                  </p>
                )}

                {/* Modal to display product information */}
                <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
                  <ModalHeader toggle={() => setModalOpen(false)}>
                    Product Information
                  </ModalHeader>
                  <ModalBody>
                    {productInfo ? (
                      <div>
                        <Row>
                          <Col xs="6">
                            <p>
                              <strong>Name:</strong> {productInfo.title}
                            </p>
                          </Col>
                          <Col xs="6">
                            <p>
                              <strong>Brand:</strong> {productInfo.brand}
                            </p>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs="6">
                            <p>
                              <strong>Category:</strong> {productInfo.category}
                            </p>
                          </Col>
                          <Col xs="6">
                            <p>
                              <strong>Description:</strong>{" "}
                              {productInfo.description}
                            </p>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs="12">
                            <p>
                              <strong>Image:</strong>
                            </p>
                            <img
                              src={productInfo.images[0]}
                              alt="Product Image"
                            />
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <p>No product information available.</p>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={handleSubmit}>
                      Add Product
                    </Button>
                    <Button
                      color="secondary"
                      onClick={() => setModalOpen(false)}
                    >
                      Close
                    </Button>
                  </ModalFooter>
                </Modal>

                {/* Modal for manual barcode input */}
                <Modal isOpen={barcodeModalOpen} toggle={() => setBarcodeModalOpen(false)}>
                  <ModalHeader toggle={() => setBarcodeModalOpen(false)}>
                    Input Bar Code Number
                  </ModalHeader>
                  <ModalBody>
                    <Form onSubmit={handleManualSubmit}>
                      <FormGroup>
                        <Label for="barcodeInput">Bar Code</Label>
                        <Input
                          id="barcodeInput"
                          type="text"
                          value={manualBarcode}
                          onChange={(e) => setManualBarcode(e.target.value)}
                          placeholder="Enter barcode number"
                        />
                      </FormGroup>
                      <Button color="primary" type="submit">
                        Lookup
                      </Button>
                    </Form>
                  </ModalBody>
                </Modal>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Scanner;
