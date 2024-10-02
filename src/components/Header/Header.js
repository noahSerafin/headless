import React, { useState } from "react";
import "./Header.scss";
import { NavLink } from "react-router-dom";

const Header = ({children, ...props}) => {

	const {page} = props;

	let isHome = false;
	if(page === "Home"){
		isHome = true;
	}
	
	const [showMenu, setShowMenu] = useState(false);
	const handleClick = () => {
		setShowMenu(!showMenu);
	}   
	const burgerClassName = `burger-list${
        showMenu ? "--anim" : ""
    }`

    return(
        <div className="header">Header</div>
    )
}