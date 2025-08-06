import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/SearchInput.css'; 

const SearchInput = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleChange = async (event) => {
        const value = event.target.value;
        setQuery(value);

        if (value.length > 2) {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/products/search?query=${value}`);
                setSuggestions(res.data);
            } catch (error) {
                console.error('Lỗi khi lấy gợi ý sản phẩm:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSearch(query);
    };

    return (
        <div className="suggestion-container">
            <form onSubmit={handleSubmit} className="headersearch-form">
                <input 
                    type="text" 
                    value={query} 
                    onChange={handleChange} 
                    placeholder="Tìm kiếm sản phẩm..." 
                    className="suggestion-input" 
                />
                <button type="submit" className="suggestion-button">Tìm</button>
            </form>
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map(product => (
                        <li key={product._id} className="suggestion-item">
                            <Link to={`/products/${product._id}`}>
                                <span className="product-name">{product.Name}</span>
                                <img className="product-image" src={`${process.env.PUBLIC_URL}/${product.Img}`} alt={product.Name} />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchInput;