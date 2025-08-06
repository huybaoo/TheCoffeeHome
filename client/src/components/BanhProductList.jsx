import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../css/ProductList.css';
import Header from './Header';
import Menu from './Menu';

const BanhProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(8);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/products');
                const filteredProducts = res.data.filter(product => 
                    product.Type === "6726496cd0296c8ef92ad07d" || 
                    product.Type === "6726495cd0296c8ef92ad07c"
                );
                setProducts(filteredProducts);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.productId === product._id);
        
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ 
                productId: product._id, 
                productName: product.Name, 
                price: product.Price, 
                image: product.Img,   
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        setNotification(`Thêm 1 ${product.Name} vào giỏ hàng thành công!`);
        
        setTimeout(() => {
            setNotification('');
        }, 3000);
    };


    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <Header />
            <Menu />
            {notification && (
                <div className="pl-notification">{notification}</div>
            )}
            <div className="pl-product-list">
                <ul>
                    {currentProducts.map(product => (
                        <li key={product._id} className="pl-product-list-item">
                            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                                <img src={`${process.env.PUBLIC_URL}/${product.Img}`} alt={product.Name} />
                                <h4 className="product-name">{product.Name}</h4>
                            </Link>
                            <div className="pl-priceandbutton">
                                <div className="priceproduct">{formatPrice(product.Price)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="pl-pagination">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button 
                            key={index + 1} 
                            onClick={() => handlePageChange(index + 1)}
                            className={currentPage === index + 1 ? 'active' : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BanhProductList;