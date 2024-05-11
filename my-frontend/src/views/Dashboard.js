/*!

=========================================================
* Now UI Dashboard React - v1.5.2
=========================================================

* Product Page: https://www.creative-tim.com/product/now-ui-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/now-ui-dashboard-react/blob/main/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useState, useEffect, useRef } from "react";

// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Table,
  Button,
  Label,
  FormGroup,
  Input,
  UncontrolledTooltip,
} from "reactstrap";

// core components
import PanelHeader from "components/PanelHeader/PanelHeader.js";

import {
  dashboardPanelChart,
  dashboardShippedProductsChart,
  dashboardAllProductsChart,
  dashboard24HoursPerformanceChart,
} from "variables/charts.js";

import { useParams } from "react-router-dom";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const hexToRGB = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const chartColor = "#18ce0f";


function Dashboard() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [dashboardPanelChartData, setDashboardPanelChartData] = useState([]);
  const [dashboard24HoursInvoiceChart, setDashboard24HoursInvoiceChart] = useState([]);
  const [productsSummary, setProductsSummary] = useState([]);


  useEffect(() => {
    const fetchMonthlyProfitData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/invoices/monthly-profit");
        if (!response.ok) {
          throw new Error('Failed to fetch invoice data');
        }
        const data = await response.json();
        const invoicesData = new Array(12).fill(0);
        data.forEach(item => {
          invoicesData[item._id.month - 1] = item.totalProfit;
        });
        setDashboardPanelChartData(invoicesData);
        console.error('setDashboardPanelChartData:', invoicesData);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        setDashboardPanelChartData(new Array(12).fill(0));
      }
    };

    const fetchHourlyInvoiceData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/invoices/hourly-invoice");
        if (!response.ok) {
          throw new Error('Failed to fetch invoice data');
        }
        const data = await response.json();

        // Group data into the specified time intervals
        const invoicesData = new Array(4).fill(0); // Array for the four time intervals
        data.forEach(hourData => {
          const hour = hourData._id; // Assuming the hour is returned as _id
          if (hour >= 6 && hour < 12) {
            // Morning: 6AM to 11:59AM
            invoicesData[0] += hourData.count;
          } else if (hour >= 12 && hour < 18) {
            // Afternoon: 12PM to 5:59PM
            invoicesData[1] += hourData.count;
          } else if (hour >= 18 && hour < 22) {
            // Evening: 6PM to 9:59PM
            invoicesData[2] += hourData.count;
          } else {
            // Night: 10PM to 5:59AM
            invoicesData[3] += hourData.count;
          }
        });

        setDashboard24HoursInvoiceChart(invoicesData);
        console.log('setDashboard24HoursInvoiceChart:', invoicesData);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        setDashboard24HoursInvoiceChart(new Array(4).fill(0));
      }
    };


    // Fetch data immediately when the component mounts
    fetchMonthlyProfitData();

    // Fetch data immediately when the component mounts
    fetchHourlyInvoiceData();
  }, []); // 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if ID is not null
        if (id) {
          const response = await fetch(`http://localhost:3001/api/users/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();

          // Save user data to AsyncStorage
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          console.log('User data saved to AsyncStorage:', userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const invoices = await fetchInvoices();
    const productQuantities = {};

    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const productId = item.product._id;
        productQuantities[productId] = (productQuantities[productId] || 0) + item.quantity;
      });
    });

    const uniqueProductIds = Object.keys(productQuantities);
    const products = await fetchProductDetails(uniqueProductIds);

    const sortedProducts = products.map(product => ({
      ...product,
      totalQuantity: productQuantities[product._id]
    })).sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 8);  // Sort and pick top 8

    setProductsSummary(sortedProducts);
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/invoices');
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }
  };

  const fetchProductDetails = async (productIds) => {
    try {
      const response = await axios.post('http://localhost:3001/api/products/many', { productIds });
      return response.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return [];
    }
  };

  const mostSalesProduct = {
    data: (canvas) => {
      var ctx = canvas.getContext("2d");
      var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
      gradientStroke.addColorStop(0, "#18ce0f");
      gradientStroke.addColorStop(1, chartColor);
      var gradientFill = ctx.createLinearGradient(0, 170, 0, 50);
      gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
      gradientFill.addColorStop(1, hexToRGB("#18ce0f", 0.4));

      return {
        labels: productsSummary.map(product => product.name),
        datasets: [
          {
            label: "Total Quantity Sold",
            borderColor: gradientStroke,
            pointBorderColor: "#FFF",
            pointBackgroundColor: chartColor,
            pointBorderWidth: 2,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 1,
            pointRadius: 4,
            fill: true,
            backgroundColor: gradientFill,
            borderWidth: 2,
            tension: 0.4,
            data: productsSummary.map(product => product.totalQuantity),
          },
        ],
      };
    },
    options: dashboardAllProductsChart.options,
  };


  return (
    <>
      <PanelHeader
        size="lg"
        title="Monthly Profit"
        content={
          <Line
            data={{
              labels: [
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
              ],
              datasets: [
                {
                  label: "Profit",
                  borderColor: "#FFFFFF",
                  pointBorderColor: "#FFFFFF",
                  pointBackgroundColor: "#2c2c2c",
                  pointHoverBackgroundColor: "#2c2c2c",
                  pointHoverBorderColor: "#FFFFFF",
                  pointBorderWidth: 1,
                  pointHoverRadius: 7,
                  pointHoverBorderWidth: 2,
                  pointRadius: 5,
                  fill: true,
                  borderWidth: 2,
                  tension: 0.4,
                  data: dashboardPanelChartData,
                },
              ],
            }}
            options={{
              ...dashboardPanelChart.options,
            }}
            />            
        }
      />
      <div className="content" style={{ paddingTop: '50px' }}>
        <Row>
          <Col xs={12} md={6}>
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Sales</h5>
                <CardTitle tag="h4">Most Sales Product</CardTitle>
                <UncontrolledDropdown>
                  {/* <DropdownToggle
                    className="btn-round btn-outline-default btn-icon"
                    color="default"
                  >
                    <i className="now-ui-icons loader_gear" />
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem>Action</DropdownItem>
                    <DropdownItem>Another Action</DropdownItem>
                    <DropdownItem>Something else here</DropdownItem>
                    <DropdownItem className="text-danger">
                      Remove data
                    </DropdownItem>
                  </DropdownMenu> */}
                </UncontrolledDropdown>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={mostSalesProduct.data}
                    options={dashboardAllProductsChart.options}
                  />
                </div>
              </CardBody>
              <CardFooter>
                <div className="stats">
                  <i className="now-ui-icons arrows-1_refresh-69" /> Just
                  Updated
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Checkout Statistics</h5>
                <CardTitle tag="h4">24 Hours Performance</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Bar
                    data={(canvas) => { // Set data as a function that takes canvas as an argument
                      var ctx = canvas.getContext("2d");
                      var gradientFill = ctx.createLinearGradient(0, 170, 0, 50);
                      gradientFill.addColorStop(0, "rgba(128, 182, 244, 0)");
                      gradientFill.addColorStop(1, hexToRGB("#2CA8FF", 0.6));
                      return {
                        labels: [
                          "Morning (6AM to 11:59AM)",
                          "Afternoon (12PM to 5:59PM)",
                          "Evening (6PM to 9:59PM)",
                          "Night (10PM to 5:59AM)"
                        ],
                        datasets: [
                          {
                            label: "Invoice Checkout",
                            backgroundColor: gradientFill,
                            borderColor: "#2CA8FF",
                            pointBorderColor: "#FFF",
                            pointBackgroundColor: "#2CA8FF",
                            pointBorderWidth: 2,
                            pointHoverRadius: 4,
                            pointHoverBorderWidth: 1,
                            pointRadius: 4,
                            fill: true,
                            borderWidth: 1,
                            data: dashboard24HoursInvoiceChart, // Add more data points for 24 hours
                          },
                        ],
                      };
                    }}
                    options={dashboard24HoursPerformanceChart.options}
                  />
                </div>
              </CardBody>
              <CardFooter>
                <div className="stats">
                  <i className="now-ui-icons arrows-1_refresh-69" /> Just
                  Updated
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row>
          {/* <Col xs={12} md={6}>
            <Card className="card-tasks">
              <CardHeader>
                <h5 className="card-category">Backend Development</h5>
                <CardTitle tag="h4">Tasks</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="table-full-width table-responsive">
                  <Table>
                    <tbody>
                      <tr>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input defaultChecked type="checkbox" />
                              <span className="form-check-sign" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td className="text-left">
                          Sign contract for "What are conference organizers
                          afraid of?"
                        </td>
                        <td className="td-actions text-right">
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="info"
                            id="tooltip731609871"
                            type="button"
                          >
                            <i className="now-ui-icons ui-2_settings-90" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip731609871"
                          >
                            Edit Task
                          </UncontrolledTooltip>
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="danger"
                            id="tooltip923217206"
                            type="button"
                          >
                            <i className="now-ui-icons ui-1_simple-remove" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip923217206"
                          >
                            Remove
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input type="checkbox" />
                              <span className="form-check-sign" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td className="text-left">
                          Lines From Great Russian Literature? Or E-mails From
                          My Boss?
                        </td>
                        <td className="td-actions text-right">
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="info"
                            id="tooltip907509347"
                            type="button"
                          >
                            <i className="now-ui-icons ui-2_settings-90" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip907509347"
                          >
                            Edit Task
                          </UncontrolledTooltip>
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="danger"
                            id="tooltip496353037"
                            type="button"
                          >
                            <i className="now-ui-icons ui-1_simple-remove" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip496353037"
                          >
                            Remove
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FormGroup check>
                            <Label check>
                              <Input defaultChecked type="checkbox" />
                              <span className="form-check-sign" />
                            </Label>
                          </FormGroup>
                        </td>
                        <td className="text-left">
                          Flooded: One year later, assessing what was lost and
                          what was found when a ravaging rain swept through
                          metro Detroit
                        </td>
                        <td className="td-actions text-right">
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="info"
                            id="tooltip326247652"
                            type="button"
                          >
                            <i className="now-ui-icons ui-2_settings-90" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip326247652"
                          >
                            Edit Task
                          </UncontrolledTooltip>
                          <Button
                            className="btn-round btn-icon btn-icon-mini btn-neutral"
                            color="danger"
                            id="tooltip389516969"
                            type="button"
                          >
                            <i className="now-ui-icons ui-1_simple-remove" />
                          </Button>
                          <UncontrolledTooltip
                            delay={0}
                            target="tooltip389516969"
                          >
                            Remove
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </CardBody>
              <CardFooter>
                <hr />
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin" /> Updated 3
                  minutes ago
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <CardHeader>
                <h5 className="card-category">All Persons List</h5>
                <CardTitle tag="h4">Employees Stats</CardTitle>
              </CardHeader>
              <CardBody>
                <Table responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Name</th>
                      <th>Country</th>
                      <th>City</th>
                      <th className="text-right">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Dakota Rice</td>
                      <td>Niger</td>
                      <td>Oud-Turnhout</td>
                      <td className="text-right">$36,738</td>
                    </tr>
                    <tr>
                      <td>Minerva Hooper</td>
                      <td>Curaçao</td>
                      <td>Sinaai-Waas</td>
                      <td className="text-right">$23,789</td>
                    </tr>
                    <tr>
                      <td>Sage Rodriguez</td>
                      <td>Netherlands</td>
                      <td>Baileux</td>
                      <td className="text-right">$56,142</td>
                    </tr>
                    <tr>
                      <td>Doris Greene</td>
                      <td>Malawi</td>
                      <td>Feldkirchen in Kärnten</td>
                      <td className="text-right">$63,542</td>
                    </tr>
                    <tr>
                      <td>Mason Porter</td>
                      <td>Chile</td>
                      <td>Gloucester</td>
                      <td className="text-right">$78,615</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col> */}
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
