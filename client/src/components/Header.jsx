import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import SearchInput from "./SearchInput";
import { useNavigate } from "react-router-dom";
import "../css/Header.css";
import Chatbox from './Chatbox';

const Header = () => {
  const { cartCount } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSearch = (searchTerm) => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
      navigate(`/search?query=${encodeURIComponent(trimmedSearchTerm)}`);
    } else {
      alert("Vui lòng nhập từ khóa tìm kiếm!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleUserNameClick = () => {
    if (user) {
      navigate("/orders");
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <nav>
        <div className="header-content">
          <div className="header-logo">
            <a href="/" aria-label="Trang chủ">
              <img src="/images/hh1.jpg" alt="Logo" loading="lazy" />
            </a>
          </div>
          <div className="search-container">
            <SearchInput onSearch={handleSearch} />
          </div>
          <div className="header-right">
            <div className="header-cart">
            {!user && (
                <div className="header-lookup">
                  <a href="/orders" className="lookup-link">
                    <div className="lookup-icon-container">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/5008/5008371.png"
                        alt="Lookup"
                        className="lookup-icon"
                      />
                      <span className="lookup-text">Tra cứu đơn</span>
                    </div>
                  </a>
                </div>
              )}
              <a href="/cart" className="cart-link">
                  <div className="cart-icon-container">
                      <img
                          src="https://img.icons8.com/?size=100&id=ii6Lr4KivOiE&format=png&color=1A1A1A"
                          alt="Cart"
                          className="cart-icon"
                      />
                      {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                  </div>
                  <span className="cart-text">Giỏ hàng</span>
              </a>
            </div>
            <div className="header-user">
              {user ? (
                <>
                  <span className="user-name">Xin chào&nbsp;{user.Name}!</span>
                  <button className="menu-button" onClick={toggleMenu}>
                    &#9776;
                  </button>
                  {menuOpen && (
                    <div className="dropdown">
                      <ul>
                        <li onClick={handleUserNameClick}>Lịch sử mua hàng</li>
                        <li onClick={handleLogout}>Đăng xuất</li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <a href="/login" className="login-link">
                  <img
                    className="login-icon"
                    src="https://img.icons8.com/?size=100&id=85147&format=png&color=1A1A1A"
                    alt="Login"
                  />
                  <span className="login-text">Đăng nhập</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      {user && <Chatbox currentUser={user} />}
    </header>
  );
};

export default Header;