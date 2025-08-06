import React from 'react';
import Header from './Header';
import Menu from './Menu';
import Slideshow from './Slideshow';
import '../css/Home.css';
import ProductList from './ProductList';
import TopSellingProducts from './TopSellingProducts';
import Footer from './Footer';
import Chatbox from './Chatbox';

const Home = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("User from localStorage: ", user); 
    return (
        <div>
            <Header />
            <Menu />
            <Slideshow />
            <TopSellingProducts />
            <h1 className="home-h1">SẢN PHẨM</h1>
            <ProductList />
            {user && <Chatbox currentUser={user} />}
            <Footer />
        </div>
    );
};

export default Home;