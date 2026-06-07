import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WishlistDrawer from './components/WishlistDrawer';
import BottomBar from './components/BottomBar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import WishlistPage from './pages/WishlistPage';
import ScrollToTop from './components/ScrollToTop';
import Snackbar from './components/Snackbar';

function App() {
  return (
    <WishlistProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <WishlistDrawer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
        <Snackbar />
        <Footer />
        <BottomBar />
      </Router>
    </WishlistProvider>
  );
}

export default App;
