import React from "react";
import { Link } from "react-router-dom";
import Home from "../pages/Home/Home";
//import Header from "./Header/Header";

const Layout = ({ children }) => {

  return (
    <>
     
      <main>{children}</main>
      <Home />
    </>
  );
};

export default Layout;