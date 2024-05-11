import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

import Sidebar from "components/Sidebar/Sidebar.js";
import routes from "routes.js";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";

var ps;

function Admin(props) {
  const location = useLocation();
  const [backgroundColor, setBackgroundColor] = useState("grey");
  const [userRole, setUserRole] = useState(null); // State to store user role

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user"); // Fetch user from AsyncStorage
        const user = JSON.parse(userJson);
        if (user && user.role && user.role.name) {
          setUserRole(user.role.name); // Set user role in state
        }
      } catch (error) {
        console.error("Error fetching user from AsyncStorage:", error);
      }
    };

    fetchUser(); // Fetch user when component mounts
  }, []);

  const mainPanel = React.useRef();
  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(mainPanel.current);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
        document.body.classList.toggle("perfect-scrollbar-on");
      }
    };
  });

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
  }, [location]);

  return (
    <div className="wrapper">
      <Sidebar
        {...props}
        routes={routes}
        backgroundColor={backgroundColor}
        userRole={userRole}
      />
      <div className="main-panel" ref={mainPanel}>
        <Routes>
          {routes.map((prop, key) => (
            <Route path={prop.path} element={prop.component} key={key} exact />
          ))}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </div>
      
    </div>
  );
}

export default Admin;
