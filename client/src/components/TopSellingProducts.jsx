import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/ProductList.css';

const TopSellingProducts = () => {
    const [topSelling, setTopSelling] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopSellingProducts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/v1/orders/top-selling');
                setTopSelling(res.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchTopSellingProducts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    console.log(topSelling);

    return (
        <div>
            <h1 className="home-h1">SẢN PHẨM BÁN CHẠY</h1>
            <div className="pl-product-list">
                <ul>
                    {topSelling.map(product => (
                        <li key={product.productId} className="pl-product-list-item">
                            <Link to={`/products/${product.productId}`} style={{ textDecoration: 'none' }}>
                                <img src={`${process.env.PUBLIC_URL}/${product.img}`} alt={product.name} />
                                <h4 className="product-name">{product.name}</h4>
                            </Link>
                            <div className="pl-priceandbutton">
                                <div className="priceproduct">{formatPrice(product.price)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    function formatPrice(price) {
        if (price === undefined || price === null) {
            return "N/A"; 
        }
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";
    }
};

export default TopSellingProducts;