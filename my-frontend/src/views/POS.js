import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Button,
  CardTitle,
  CardText,
  Table
} from "reactstrap";
import { FaSearch, FaShoppingCart, FaMinus, FaPlus } from "react-icons/fa";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationAlert from "react-notification-alert";


// Function to fetch product data from the API
const fetchProductData = async () => {
  const response = await fetch('http://localhost:3001/api/products');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}

function POS() {
  const notificationAlert = useRef();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductData();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item._id === product._id);
    const productIndex = products.findIndex(p => p._id === product._id);

    if (existingProductIndex !== -1 && products[productIndex].quantity > 0) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += 1;
      setCart(updatedCart);

      const updatedProducts = [...products];
      updatedProducts[productIndex].quantity -= 1;
      setProducts(updatedProducts);
    } else if (existingProductIndex === -1 && products[productIndex].quantity > 0) {
      setCart([...cart, { ...product, quantity: 1 }]);
      const updatedProducts = [...products];
      updatedProducts[productIndex].quantity -= 1;
      setProducts(updatedProducts);
    }
  };

  const updateQuantity = (productId, amount) => {
    const cartIndex = cart.findIndex(item => item._id === productId);
    const productIndex = products.findIndex(item => item._id === productId);

    if (cartIndex === -1 || productIndex === -1) return;

    const newCart = [...cart];
    const newProducts = [...products];

    if (amount === -1 && newCart[cartIndex].quantity === 1) {
      newCart.splice(cartIndex, 1);
    } else {
      newCart[cartIndex].quantity += amount;
    }

    newProducts[productIndex].quantity -= amount;

    setCart(newCart);
    setProducts(newProducts);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotalAmount = () => {
    return cart.reduce((total, item) => total + item.retailPrice * item.quantity, 0);
  };

  const calculateTotalProfit = () => {
    return cart.reduce((profit, item) => {
      const profitPerItem = item.retailPrice - item.price;
      return profit + profitPerItem * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (!userDataJson) {
        throw new Error('User data not found in AsyncStorage');
      }

      const userData = JSON.parse(userDataJson);
      const userId = userData._id;

      const invoiceData = {
        user: userId,
        items: cart,
        totalAmount: calculateTotalAmount(),
        totalProfit: calculateTotalProfit()
      };
      console.log(invoiceData);
      const response = await fetch('http://localhost:3001/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected server response');
      }

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to create invoice: ${responseData.message || 'Unknown error'}`);
      }

      setCart([]);
      notify("Check Out successfully!");
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(`Failed to create invoice. Reason: ${error.message}`);
    }
  };

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

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <NotificationAlert ref={notificationAlert} />
      <Row style={{ height: '100%' }}>
        <Col md="9">
          <div style={{ position: 'relative', marginBottom: '15px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ width: '100%', padding: '10px 40px 10px 15px', borderRadius: '5px', border: '1px solid #ccc', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}
            />
            <FaSearch style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          </div>
          <div style={{ overflowY: 'auto', height: 'calc(100vh - 100px)', padding: '0 15px' }}>
            <Row>
              {filteredProducts.map((product) => (
                <Col md="3" key={product._id} style={{ marginBottom: '15px' }}>
                  <Card style={{ height: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <CardHeader>
                      <CardTitle style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '1rem' }}>
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardBody style={{ textAlign: 'center', flex: '1 1 auto' }}>
                      <img
                        src={product.image ? `${product.image}` : `http://localhost:3001/images/empty.jpg`}
                        alt={product.name}
                        style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', marginBottom: '10px' }}
                      />
                      <CardText>₱{product.retailPrice}</CardText>
                      {product.quantity === 0 ? (
                        <CardText style={{ color: 'red' }}>No Stock</CardText>
                      ) : (
                        <CardText>Stock: {product.quantity}</CardText>
                      )}
                    </CardBody>
                    <CardBody style={{ flex: '0 0 auto', paddingBottom: '10px', paddingTop: '0' }}>
                      <Button
                        color="primary"
                        onClick={() => addToCart(product)}
                        size="sm"
                        style={{ width: '100%', padding: '5px', fontSize: '0.9rem' }}
                        disabled={product.quantity === 0} // Disable button if quantity is 0
                      >
                        <FaShoppingCart style={{ marginRight: '5px' }} /> Add to Cart
                      </Button>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
        <Col md="3">
          <Card style={{ position: 'fixed', width: '22%', height: '100vh', right: '10px', top: 0, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <CardHeader>
              <h4><FaShoppingCart style={{ marginRight: '5px' }} /> Cart</h4>
            </CardHeader>
            <CardBody style={{ overflowY: 'auto', height: 'calc(100% - 100px)' }}>
              <Table>
                <thead>
                  <tr>
                    <th style={{ fontSize: '0.85rem' }}>Product</th>
                    <th style={{ fontSize: '0.85rem' }}>Price</th>
                    <th style={{ fontSize: '0.85rem' }}>Quantity</th>
                    <th style={{ fontSize: '0.85rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>₱{item.retailPrice}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={() => updateQuantity(item._id, -1)}
                          style={{ padding: '3px', fontSize: '0.8rem', marginRight: '5px' }}
                        >
                          <FaMinus />
                        </Button>
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => updateQuantity(item._id, 1)}
                          style={{ padding: '3px', fontSize: '0.8rem' }}
                          disabled={products.find(product => product._id === item._id).quantity === 0}
                        >
                          <FaPlus />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div>Total: ₱{cart.reduce((total, item) => total + item.retailPrice * item.quantity, 0)}</div>
              <Button color="success" onClick={handleCheckout}>Checkout</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default POS;
