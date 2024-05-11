import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Nav } from "reactstrap";
import PerfectScrollbar from "perfect-scrollbar";

var ps;

function Sidebar(props) {
  const sidebar = React.useRef();
  const location = useLocation();

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  React.useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      ps = new PerfectScrollbar(sidebar.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
    }
    return function cleanup() {
      if (navigator.platform.indexOf("Win") > -1) {
        ps.destroy();
      }
    };
  });

  return (
    <div
      className="sidebar"
      data-color={props.backgroundColor}
      style={{
        width: '250px', // Adjust the sidebar width as needed
      }}
    >
      <div
        className="logo"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '20%', 
        }}
      >
        <a
          href="http://localhost:3000/"
          className="simple-text logo-normal"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div
            className="logo-img"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/icon.jpg`}
              alt="Your Logo"
              style={{
                width: '100%', // Make the image fill the div's width
                height: '100%', // Keep the height automatic to maintain the aspect ratio
                objectFit: 'contain', // Make sure the image fits within the div
              }}
            />
          </div>
        </a>
      </div>
      <div className="sidebar-wrapper" ref={sidebar}>
        <Nav>
          {props.routes.map((prop, key) => {
            if (prop.redirect || prop.hidden) return null; // Hide routes marked with 'hidden: true'
            return (
              <li
                className={
                  activeRoute(prop.layout + prop.path) +
                  (prop.pro ? " active active-pro" : "")
                }
                key={key}
              >
                <NavLink to={prop.layout + prop.path} className="nav-link">
                  <i className={"now-ui-icons " + prop.icon} />
                  <p>{prop.name}</p>
                </NavLink>
              </li>
            );
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;

