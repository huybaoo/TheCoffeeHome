import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Menu.css';

const Menu = () => {
    return (
        <div className="menu">
            <nav>
                <ul>
                    <li className="textmenu">
                        <Link to="/caphe">Cà phê</Link>
                    </li>
                    <li className="textmenu">
                        <Link to="/tratraicay">Trà trái cây</Link>
                    </li>
                    <li className="textmenu">
                        <Link to="/trasua">Trà sữa</Link>
                    </li>
                    <li className="textmenu">
                        <Link to="/traxanh">Trà xanh</Link>
                    </li>
                    <li className="textmenu">
                        <Link to="/banh">Bánh</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Menu;