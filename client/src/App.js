// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Home from './components/Home';
import Login from './components/Login';
import Cart from './components/Cart';
import Register from './components/Register';
import AdminCategory from './components/AdminCategory';
import AdminProductList from './components/AdminProductList';
import SearchResults from './components/SearchResults';
import AdminHome from './components/AdminHome';
import AdminLogin from './components/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentSuccess from './components/PaymentSuccess';
import OrderHistory from './components/OrderHistory';
import AdminOrderHistory from './components/AdminOrderHistory';
import AdminCustomerList from './components/AdminCustomerList';
import CaPheProductList from './components/CaPheProductList';
import TratraicayProductList from './components/TratraicayProductList';
import TrasuaProductList from './components/TrasuaProductList';
import TraxanhProductList from './components/TraxanhProductList';
import BanhProductList from './components/BanhProductList';
import RateOrder from './components/RateOrder';
import AdminSales from './components/AdminSales';
import AdminChat from './components/AdminChat';
import AdminDiscountList from './components/AdminDiscountList';
import AdminSalesProducts from './components/AdminSalesProducts';
import AdminPayment from './components/AdminPayment';
import AdminFeedbackList from './components/AdminFeedbackList';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/register" element={<Register />} />
                <Route path="/productlist" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/caphe" element={<CaPheProductList />}/>
                <Route path="/tratraicay"  element={<TratraicayProductList />}/>
                <Route path="/traxanh"  element={<TraxanhProductList />}/>
                <Route path="/trasua"  element={<TrasuaProductList />}/>
                <Route path="/banh"  element={<BanhProductList/>}/>
                <Route path="/search" element={<SearchResults />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/rate-order/:orderId/:productId" element={<RateOrder />} />
                

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute><AdminHome/></ProtectedRoute>} />
                <Route path="/admin/admincategory" element={<ProtectedRoute><AdminCategory /></ProtectedRoute>}/>
                <Route path="/admin/adminproductlist" element={<ProtectedRoute><AdminProductList /></ProtectedRoute>}/>
                <Route path="/admin/adminorderhistory" element={<ProtectedRoute><AdminOrderHistory /></ProtectedRoute>}/>
                <Route path="/admin/admincustomerlist" element={<ProtectedRoute><AdminCustomerList /></ProtectedRoute>}/>
                <Route path="/admin/adminSales" element={<ProtectedRoute><AdminSales/></ProtectedRoute>}/>
                <Route path="/admin/adminSalesProducts" element={<ProtectedRoute><AdminSalesProducts/></ProtectedRoute>}/>
                <Route path="/admin/adminPayment" element={<ProtectedRoute><AdminPayment/></ProtectedRoute>}/>
                <Route path="/admin/chat" element={<ProtectedRoute><AdminChat /></ProtectedRoute>} />
                <Route path="/admin/admindiscount" element={<ProtectedRoute><AdminDiscountList/></ProtectedRoute>} />
                <Route path="/admin/feedback" element={<ProtectedRoute><AdminFeedbackList /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
};

export default App;
