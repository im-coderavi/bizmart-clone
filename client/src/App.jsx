import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PublicLayout from "./components/PublicLayout.jsx";
import { ProtectedRoute, AdminRoute } from "./components/guards.jsx";

import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Membership from "./pages/Membership.jsx";
import Checkout from "./pages/Checkout.jsx";
import Updates from "./pages/Updates.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

import AdminLayout from "./admin/AdminLayout.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminProducts from "./admin/AdminProducts.jsx";
import AdminProductForm from "./admin/AdminProductForm.jsx";
import AdminCategories from "./admin/AdminCategories.jsx";
import AdminPlans from "./admin/AdminPlans.jsx";
import AdminUsers from "./admin/AdminUsers.jsx";
import AdminBlogs from "./admin/AdminBlogs.jsx";
import AdminBlogForm from "./admin/AdminBlogForm.jsx";
import AdminDownloads from "./admin/AdminDownloads.jsx";
import AdminPayments from "./admin/AdminPayments.jsx";
import AdminSettings from "./admin/AdminSettings.jsx";

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/checkout/:slug" element={<Checkout />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="blogs/new" element={<AdminBlogForm />} />
        <Route path="blogs/:id" element={<AdminBlogForm />} />
        <Route path="downloads" element={<AdminDownloads />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
    </>
  );
}
