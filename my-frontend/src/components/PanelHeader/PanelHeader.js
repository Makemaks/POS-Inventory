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
// PanelHeader.js
// PanelHeader.js

import React from "react";

// Define styles object for better organization
const panelHeaderStyles = {
  panelHeader: {
    padding: "10px", // Adjust padding as needed
    backgroundColor: "#333", // Default background color
    color: "#FFFFFF", // Default title color
  },
  title: {
    margin: "0", // Remove default margin
    padding: "0", // Remove default padding
  },
};

function PanelHeader(props) {
  const { title, backgroundColor, className, content, size } = props;

  return (
    <>
      {/* Style component to apply styles */}
      <style>
        {`
          .panel-header {
            padding: ${panelHeaderStyles.panelHeader.padding};
            background-color: ${backgroundColor || panelHeaderStyles.panelHeader.backgroundColor};
            color: ${panelHeaderStyles.panelHeader.color};
            ${className ? className : ""} // Add additional class if provided
          }
          
          .panel-header h3 {
            margin: ${panelHeaderStyles.title.margin};
            padding: ${panelHeaderStyles.title.padding};
          }
        `}
      </style>
      
      {/* Render panel header */}
      <div className={`panel-header${size ? ` panel-header-${size}` : ""}`}>
        <h3>{title}</h3>
        {content}
      </div>
    </>
  );
}

export default PanelHeader;

