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
import Dashboard from "views/Dashboard.js";
import Notifications from "views/Notifications.js";
import Icons from "views/Icons.js";
import Typography from "views/Typography.js";
import TableList from "views/Product/TableList.js";
import Maps from "views/Maps.js";
import Upgrade from "views/Upgrade.js";
import UserPage from "views/UserPage.js";
import EditProduct from "views/Product/EditProduct.js";
import AddProduct from "views/Product/AddProduct.js";
import Scanner from "views/Scanner.js";
import POS from "views/POS.js";
import ProductSummary from "views/Product/ProductSummary.js";

var dashRoutes = [
  {
    path: "/dashboard/:id?",
    name: "Dashboard",
    icon: "business_chart-bar-32",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/pos", 
    name: "POS",
    icon: "shopping_cart-simple", 
    component: <POS />, 
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "location_map-big",
    component: <Maps />,
    layout: "/admin",
  },
  {
    path: "/product-tables",
    name: "Product List",
    icon: "files_paper",
    component: <TableList />,
    layout: "/admin",
  },
  {
    path: "/product-history",
    name: "Sales List",
    icon: "shopping_basket",
    component: <ProductSummary />,
    layout: "/admin",
  },
  {
    path: "/edit-product/:id/:add?/:scan?",
    name: "Edit Product",
    icon: "users_single-02",
    component: <EditProduct />,
    layout: "/admin",
    hidden: true,
  },  
  {
    path: "/add-product/",
    name: "Add Product",
    icon: "users_single-02",
    component: <AddProduct />, 
    layout: "/admin",
    hidden: true,
  },  
  {
    path: "/scanner",
    name: "Scanner",
    icon: "media-1_camera-compact",
    component: <Scanner />, 
    layout: "/admin",
    hidden: true,
  },  
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "design_image",
  //   component: <Icons />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/notifications",
  //   name: "Notifications",
  //   icon: "ui-1_bell-53",
  //   component: <Notifications />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/typography",
  //   name: "Typography",
  //   icon: "design-2_ruler-pencil",
  //   component: <Typography />,
  //   layout: "/admin",
  // },
];
export default dashRoutes;
