import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import '../css/ProductDetail.css';
import Header from '../components/Header';
import Menu from '../components/Menu';
import { CartContext } from '../components/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [ratings, setRatings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [currentImage, setCurrentImage] = useState('');
    const { addToCart } = useContext(CartContext);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedToppings, setSelectedToppings] = useState([]);

    const [selectedSize, setSelectedSize] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);

    const restrictedType = "6726495cd0296c8ef92ad07c";
    const restrictedBrand = "banh";
    const isRestricted = product && (product.Type === restrictedType || product.Brand === restrictedBrand);

    // Bảng giá size
    const sizePrices = {
        S: 0,
        M: 10000,
        L: 16000,
    };

    const toppings = [
        { name: "Kem phô mai macchiato", price: 10000 },
        { name: "Foam phô mai", price: 10000 },
        { name: "Thạch sương sáo", price: 10000 },
        { name: "Thạch kim quất", price: 10000 },
        { name: "Trân châu trắng", price: 10000 },
        { name: "Đào miếng", price: 10000 },
        { name: "Thạch cà phê", price: 10000 },
        { name: "Trái vải", price: 10000 }
    ];

    const handleToppingChange = (topping) => {
        setSelectedToppings(prev => {
            const newToppings = prev.includes(topping) 
                ? prev.filter(item => item !== topping) 
                : [...prev, topping];
    
            // Tính giá tổng sau khi thay đổi topping
            const toppingsPrice = newToppings.reduce((total, toppingName) => {
                const toppingObj = toppings.find(t => t.name === toppingName);
                return total + (toppingObj ? toppingObj.price : 0);
            }, 0);
    
            setTotalPrice(parseInt(product.Price) + sizePrices[selectedSize] + toppingsPrice);  // Cập nhật giá tổng
            return newToppings;
        });
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/products/${id}`);
                setProduct(res.data.product);
                setRelatedProducts(res.data.relatedProducts);
                setCurrentImage(res.data.product.Img || res.data.product.Images[0]);
                setLoading(false);
                setTotalPrice(parseInt(res.data.product.Price)); //tạo giá tổng

                 // nếu type là bánh thì auto size s
                 if (res.data.product.Type === restrictedType || res.data.product.Brand === restrictedBrand) {
                    setSelectedSize('S');
                    setSelectedToppings([]);
                }
            } catch (err) {
                console.error("Lỗi lấy chi tiết sản phẩm:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        const fetchRatings = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/v1/ratings/product-ratings/${id}`);
                setRatings(res.data.ratings);
            } catch (err) {
                console.error("Lỗi lấy đánh giá:", err);
                setError("Không thể lấy đánh giá sản phẩm. Vui lòng thử lại sau.");
            }
        };

        fetchProduct();
        fetchRatings();
    }, [id]);

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        const toppingsPrice = selectedToppings.reduce((total, toppingName) => {
            const toppingObj = toppings.find(t => t.name === toppingName);
            return total + (toppingObj ? toppingObj.price : 0);
        }, 0);
        setTotalPrice(parseInt(product.Price) + sizePrices[size] + toppingsPrice); // Cập nhật giá tổng
    };

    const handleAddToCart = () => {
        const requiresSizeSelection = !(product.Type === "6726495cd0296c8ef92ad07c" || product.Brand === "banh");
        
        if (requiresSizeSelection && !selectedSize) {
            alert("Vui lòng chọn kích cỡ trước khi thêm vào giỏ hàng!");
            return;
        }

        setIsAdding(true);

        const imageElement = document.querySelector('.main-image');
        const cartElement = document.querySelector('.header-cart img');

        const clone = imageElement.cloneNode();
        clone.classList.add('image-clone');
        document.body.appendChild(clone);
        
        const rect = cartElement.getBoundingClientRect();
        const startRect = imageElement.getBoundingClientRect();
        const deltaX = rect.x - startRect.x + (rect.width / 2) - (startRect.width / 2);
        const deltaY = rect.y - startRect.y + (rect.height / 2) - (startRect.height / 2);

        clone.style.position = 'absolute';
        clone.style.left = `${startRect.left}px`;
        clone.style.top = `${startRect.top}px`;
        clone.style.width = `${startRect.width}px`;

        clone.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-in-out',
            fill: 'forwards'
        });

        clone.addEventListener('animationend', () => {
            clone.remove();
        });

        addToCart(product, quantity, selectedSize, selectedToppings); 
        setIsAdding(false);
    };

    const handleImageChange = (img) => {
        setCurrentImage(img);
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " đ";
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="product-detail-container">
            <Header />
            <Menu />
            <div className="product-detail">
                <div className="product-info">
                    <div className="image-container">
                        <img src={`${process.env.PUBLIC_URL}/${currentImage}`} alt={product.Name} className={`main-image ${isAdding ? 'adding' : ''}`} />
                        <div className="thumbnail-container">
                            {product.Images && product.Images.map((img, index) => (
                                <img
                                    key={index}
                                    src={`${process.env.PUBLIC_URL}/${img}`}
                                    alt={`Thumbnail ${index}`}
                                    className={`thumbnail ${currentImage === img ? 'active' : ''}`}
                                    onClick={() => handleImageChange(img)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="details-container">
                        <h1 className="product-title">{product.Name}</h1>
                        <p className="product-description">{product.Description}</p>
                        <div className="product-info-row">
                            <div className="price-stock-container">
                                <p className="product-price">Giá: {formatPrice(totalPrice)}</p>
                                <p className="product-stock">{product.Stock > 0 ? '' : 'Hết món'}</p>
                                <div className="size-selection">
                                {!isRestricted && (
                                    <>
                                <h3>Chọn kích cỡ:</h3>
                                        {Object.keys(sizePrices).map(size => (
                                            <label key={size}>
                                                <input
                                                    type="radio"
                                                    value={size}
                                                    checked={selectedSize === size}
                                                    onChange={() => handleSizeChange(size)}
                                                />
                                                {size}
                                            </label>
                                        ))}
                                    </>
                                )}
                            </div>
                            <div className="quantity-control">
                                <button className="quantity-button" onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}>-</button>
                                <span className="quantity">{quantity}</span>
                                <button className="quantity-button" onClick={() => setQuantity(prev => Math.min(prev + 1, product.Stock))}>+</button>
                            </div>
                            <button 
                                className="add-to-cart-button" 
                                onClick={handleAddToCart}
                                disabled={product.Stock === 0}
                            >
                                <img src="https://img.icons8.com/?size=100&id=sVsUxXNGiYgf&format=png&color=1A1A1A" alt="add-to-cart" />
                            </button>
                            </div>
                            <div className="topping-selection">
                                {!isRestricted && (
                                    <>
                                    <h3>Chọn Topping:</h3>
                                    {toppings.map(topping => (
                                        <label key={topping.name}>
                                            <input 
                                                type="checkbox"
                                                checked={selectedToppings.includes(topping.name)}
                                                onChange={() => handleToppingChange(topping.name)}
                                            />
                                            {topping.name} (+{formatPrice(topping.price)})
                                        </label>
                                    ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ratings-section">
                    <h3>Đánh giá sản phẩm</h3>
                    {ratings.length > 0 ? (
                        <ul className="ratings-list">
                            {ratings.map((rating, index) => (
                                <li className="rating-item" key={index}>
                                    <div className="rating-content">
                                        <p className="rating-user">
                                            {rating.userId ? rating.userId.Name : 'Người dùng không xác định'}
                                        </p>
                                        <div className="rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < rating.rating ? 'filled' : ''}>★</span>
                                            ))}
                                        </div>                                    
                                        <p className="rating-date">
                                            {new Date(rating.createdAt).toLocaleString()}
                                        </p>
                                        <p className="rating-comment">{rating.comment}</p>  
                                        {rating.adminReply && (
                                        <div className="admin-reply">
                                            <strong>Phản hồi từ admin:</strong>
                                            <p>{rating.adminReply}</p>
                                        </div>
                                    )}                                      
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Chưa có đánh giá cho sản phẩm này.</p>
                    )}
                </div>

                <h2 className="related-products-title">Sản phẩm liên quan</h2>
                <div className="related-products">
                    <ul>
                        {relatedProducts.length > 0 ? (
                            relatedProducts.map(relatedProduct => (
                                <li className="pl-product-list-item" key={relatedProduct._id}>
                                    <Link to={`/products/${relatedProduct._id}`} style={{ textDecoration: 'none' }}>
                                        <img 
                                            src={`${process.env.PUBLIC_URL}/${relatedProduct.Img}`} 
                                            alt={relatedProduct.Name} 
                                        />
                                        <h3 className="product-name">{relatedProduct.Name}</h3>
                                    </Link>
                                    <div className="pl-priceandbutton">
                                        <div className="priceproduct">{formatPrice(relatedProduct.Price)}</div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="no-related-products">Không có sản phẩm liên quan.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;