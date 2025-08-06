import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';
import { CartContext } from '../components/CartContext';
import '../css/Cart.css';
import emailjs from '@emailjs/browser';


const Cart = () => {
    const { increaseQuantity, decreaseQuantity, removeFromCart, updateCartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [showDiscountOverlay, setShowDiscountOverlay] = useState(false);
    const [discountCodes, setDiscountCodes] = useState([]);
    const [enteredDiscountCode, setEnteredDiscountCode] = useState('');
    const [customerNote, setCustomerNote] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [customerEmail, setCustomerEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);


    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setSelectedProducts(storedCart);
        fetchDiscountCodes();
    }, []);

    const generateRandomCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); //Mã 6 chữ số
    };
    
    const sendVerificationCode = () => {
        if (!customerEmail.trim()) {
            alert("Vui lòng nhập email để nhận mã xác minh.");
            return;
        }
    
        const code = generateRandomCode();
        setGeneratedCode(code);
    
        const params = {
            name: customerName || "Khách hàng",
            verificationCode: code,
            email: customerEmail.trim(),
        };
    
        emailjs.send('service_wgo5m5a', 'template_duq3z3e', params, '7oV_vV7xwhrwQvsb9')
            .then((response) => {
                console.log("Verification code sent:", response.status, response.text);
                alert("Mã xác minh đã được gửi đến email của bạn.");
                setIsVerifying(true);
            })
            .catch((error) => {
                console.error("Gửi email thất bại:", error);
                alert("Không thể gửi mã xác minh. Vui lòng thử lại.");
            });
    };

    const fetchDiscountCodes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/v1/discountcode');
            // Chỉ lấy các mã giảm giá có trạng thái "Kích hoạt"
            const activeDiscountCodes = response.data.filter(code => code.status === 'Kích hoạt');
            setDiscountCodes(activeDiscountCodes);
        } catch (error) {
            console.error('Error fetching discount codes:', error);
        }
    };

    const handleRemoveFromCart = (productId) => {
        removeFromCart(productId);
        setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
    };

    const handleIncreaseQuantity = (productId) => {
        increaseQuantity(productId);
        setSelectedProducts(prev => 
            prev.map(item => 
                item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const handleDecreaseQuantity = (productId) => {
        decreaseQuantity(productId);
        setSelectedProducts(prev => 
            prev.map(item => 
                item.productId === productId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
            )
        );
    };

    const totalMoney = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0) - discountAmount;
    };

    const checkStockAvailability = async () => {
        const stockPromises = selectedProducts.map(async (item) => {
            const response = await axios.get(`http://localhost:5000/api/v1/products/${item.productId}`);
            const product = response.data.product;
            return product.Stock >= item.quantity;
        });
        return Promise.all(stockPromises);
    };

    const handlePayment = async (isCashOnDelivery = false) => {
        const storedUser = localStorage.getItem('user');
        let userData = storedUser ? JSON.parse(storedUser) : { _id: 'guest', Name: 'guest', name: customerName, address: customerAddress, phone: customerPhone };
        
        if (!storedUser) {
            const confirmGuestCheckout = window.confirm("BẠN SẼ KHÔNG THỂ HỦY ĐƠN HÀNG KHI CHƯA ĐĂNG NHẬP. Bạn có muốn tiếp tục?");
            if (!confirmGuestCheckout) {
                return;
            }
        }        

        if (!customerName.trim() || !customerAddress.trim() || !customerPhone.trim()) {
            alert("Vui lòng điền đầy đủ thông tin trước khi thanh toán.");
            return;
        }
    
        if (!customerEmail.trim()) {
            alert("Vui lòng nhập email để nhận xác nhận đơn hàng.");
            return;
        }
    
        const isLoggedIn = !!storedUser;

        if (isCashOnDelivery && !isLoggedIn && !isVerifying) {
            sendVerificationCode();
            return;
        }

        if (isCashOnDelivery && !isLoggedIn && verificationCode !== generatedCode) {
            alert("Mã xác minh không đúng. Vui lòng kiểm tra lại.");
            return;
        }

    
        try {
            if (selectedProducts.length === 0) {
                alert("Giỏ hàng của bạn trống.");
                return;
            }
    
            const total = totalMoney(selectedProducts);
            if (total < 5000 || total >= 1000000000) {
                alert("Số tiền giao dịch không hợp lệ.");
                return;
            }
    
            const stockAvailability = await checkStockAvailability();
            if (!stockAvailability.every(isAvailable => isAvailable)) {
                alert("Một số sản phẩm trong giỏ đã hết hàng.");
                return;
            }
    
            const orderData = {
                user: {
                    _id: userData._id,
                    Name: userData.Name,
                    name: customerName,
                    address: customerAddress,
                    phone: customerPhone,
                },
                products: selectedProducts.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    name: item.productName,
                    price: item.price,
                    selectedSize: item.selectedSize,
                    selectedToppings: item.selectedToppings,
                    note: customerNote,
                })),
                totalPrice: total,
                method: isCashOnDelivery ? 'Thanh toán sau khi nhận hàng' : 'Thanh toán qua ngân hàng',
                status: isCashOnDelivery ? 'Chưa được xác nhận' : 'Đang xử lý',
                note: customerNote,
                customerEmail: customerEmail,
            };
    
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            const createOrderResponse = await axios.post('http://localhost:5000/api/v1/orders/', orderData);
            const orderId = createOrderResponse.data.orderId;
    
            if (isCashOnDelivery) {
                setSelectedProducts([]);
                localStorage.removeItem('cart');
                updateCartCount(0);
                sendEmailNotification(orderData);
                alert('Đặt hàng thành công! Hóa đơn đã được gửi qua email.');
                navigate('/orders');
            } else {
                const paymentResponse = await axios.post("http://localhost:5000/api/v1/vnpay/create_payment_url", {
                    amount: total,
                    orderId: orderId,
                    language: "vn",
                });
    
                if (paymentResponse.status === 200 && paymentResponse.data) {
                    localStorage.setItem('lastOrder', JSON.stringify(orderData));
                    alert('Đang chuyển đến trang thanh toán...');
                    window.location.href = paymentResponse.data;
                }
            }
        } catch (error) {
            console.error('Lỗi trong quá trình thanh toán:', error);
            alert(`LỖI: ${error.message}`);
        }
    };
    

    const applyDiscount = () => {
        if (isDiscountApplied) {
            alert("Mã giảm giá đã được áp dụng. Bạn không thể áp dụng mã khác.");
            return;
        }

        const discountCode = discountCodes.find(code => code.codename === enteredDiscountCode);
        if (discountCode) {
            const discount = (totalMoney(selectedProducts) * discountCode.percent) / 100;
            setDiscountAmount(discount);
            setIsDiscountApplied(true);
            alert(`Mã giảm giá ${enteredDiscountCode} đã được áp dụng! Giảm ${discountCode.percent}%`);
        } else {
            alert("Mã giảm giá không hợp lệ.");
            setDiscountAmount(0);
        }
    };

    const discount = () => {
        setShowDiscountOverlay(true);
    };

    const closeOverlay = () => {
        setShowDiscountOverlay(false);
    };

    const sendEmailNotification = (orderData) => {
        if (!customerEmail.trim()) {
            alert("Vui lòng nhập email để nhận hóa đơn.");
            return;
        }
    
        const emailParams = {
            customer_name: orderData.user.name,
            customer_address: orderData.user.address,
            order_details: orderData.products.map(p => `${p.name} (x${p.quantity})`).join(', '),
            total_price: orderData.totalPrice.toLocaleString("vi-VN") + " VNĐ",
            to_email: customerEmail.trim(),  
        };
    
        emailjs.send('service_wgo5m5a', 'template_ky0nso9', emailParams, '7oV_vV7xwhrwQvsb9')
            .then((response) => {
                console.log('Email sent successfully!', response.status, response.text);
            })
            .catch((error) => {
                console.error('Email send failed:', error);
            });
    };
    
    return (
        <div>
            <Header />
            <Menu />
            <div className="cartt">
                <h1 className="giohang">Giỏ hàng</h1>
                {selectedProducts.length === 0 ? (
                    <p className="giohang">Giỏ hàng của bạn trống.</p>
                ) : (
                    <div className="cart-container">
                        <div className="cart-items">
                        {selectedProducts.map(item => (
                            <div key={item.productId} className="cart-item">
                                <img src={`/${item.image}`} alt={item.productName} />
                                <div className="cart-item-details">
                                    <h3>{item.productName}</h3>
                                    <p>Giá: {item.price.toLocaleString("vi-VN")} VNĐ (Kích cỡ: {item.selectedSize})</p>
                                    {item.selectedToppings.length > 0 && (
                                        <p>Topping: {item.selectedToppings.join(", ")}</p>
                                    )}
                                    <div className="quantity-control">
                                        <button className="quantity-button" onClick={() => handleDecreaseQuantity(item.productId)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button className="quantity-button" onClick={() => handleIncreaseQuantity(item.productId)}>+</button>
                                    </div>
                                    <button className="remove-button" onClick={() => handleRemoveFromCart(item.productId)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                        </div>
                        <div className="cart-summary">
                            <h2>Tổng tiền: {totalMoney(selectedProducts).toLocaleString("vi-VN")} VNĐ</h2>
                                <>
                                    <label htmlFor="customerName">Họ và tên:</label>
                                    <input 
                                        id="customerName"
                                        type="text" 
                                        placeholder="Họ tên" 
                                        value={customerName} 
                                        onChange={(e) => setCustomerName(e.target.value)} 
                                    />
                                    <label htmlFor="customerAddress">Địa chỉ:</label>
                                    <input 
                                        id="customerAddress"
                                        type="text" 
                                        placeholder="Địa chỉ" 
                                        value={customerAddress} 
                                        onChange={(e) => setCustomerAddress(e.target.value)} 
                                    />
                                    <label htmlFor="customerPhone">Số điện thoại:</label>
                                    <input 
                                        id="customerPhone"
                                        type="text" 
                                        placeholder="Số điện thoại" 
                                        value={customerPhone} 
                                        onChange={(e) => setCustomerPhone(e.target.value)} 
                                    />
                                    <label htmlFor="customerEmail">Email nhận hóa đơn:</label>
                                    <input 
                                        id="customerEmail"
                                        type="email" 
                                        placeholder="Nhập email của bạn" 
                                        value={customerEmail} 
                                        onChange={(e) => setCustomerEmail(e.target.value)} 
                                    />
                                    <label htmlFor="customerNote">Ghi chú:</label>
                                    <input
                                        id="customerNote"
                                        type="text"
                                        placeholder="Ghi chú"
                                        value={customerNote}
                                        onChange={(e) => setCustomerNote(e.target.value)}
                                    />
                                    <button className="discount-button" onClick={discount}>Mã giảm giá của tôi</button>
                                    {isVerifying && (
                                        <div className="overlay">
                                            <div className="overlay-content">
                                                <h2>Xác minh email</h2>
                                                <label htmlFor="verificationCode">Nhập mã xác minh đã gửi qua email:</label>
                                                <input
                                                    id="verificationCode"
                                                    type="text"
                                                    placeholder="Mã xác minh"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                />
                                                <div className="overlay-buttons">
                                                    <button className="checkout-button" onClick={() => handlePayment(true)}>Xác nhận và Đặt hàng</button>
                                                    <button className="cancel-button" onClick={() => setIsVerifying(false)}>Hủy</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="payment-methods">
                                        <label className="payment-option" onClick={() => setPaymentMethod('bank')}>
                                            <img src="/images/vnpay.png" alt="Thanh toán qua ngân hàng" className={`payment-image ${paymentMethod === 'bank' ? 'selected' : ''}`} />
                                        </label>
                                        <label className="payment-option" onClick={() => setPaymentMethod('cod')}>
                                            <img src="/images/cod.png" alt="Thanh toán khi nhận hàng" className={`payment-image ${paymentMethod === 'cod' ? 'selected' : ''}`} />
                                        </label>
                                    </div>
                                    
                                    <button className="checkout-button" onClick={() => handlePayment(paymentMethod === 'cod')}>Thanh toán</button>
                                </>
                        </div>
                    </div>
                )}
                {showDiscountOverlay && (
                    <div className="overlay">
                        <div className="overlay-content">
                            <h2>Mã Giảm Giá</h2>
                            <input className="discountinput"
                                type="text"
                                placeholder="Nhập mã giảm giá"
                                value={enteredDiscountCode}
                                onChange={(e) => setEnteredDiscountCode(e.target.value)}
                            />
                            <button className="discount-button" onClick={applyDiscount}>Áp dụng</button>
                            {discountCodes.length > 0 ? (
                                <ul>
                                    {discountCodes.map(discountcode => (
                                        <li key={discountcode.codename}>
                                            Mã giảm giá của bạn: <strong>{discountcode.codename}</strong> -- {discountcode.description}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Chưa có mã giảm giá nào được cung cấp.</p>
                            )}
                            <div className="overlay-button">
                                <button onClick={closeOverlay}>Đóng</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;