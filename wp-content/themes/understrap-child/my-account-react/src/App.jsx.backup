import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Subscriptions from "@/pages/Subscriptions";
import SubscriptionDetail from "@/pages/SubscriptionDetail";
import Payments from "@/pages/Payments";
import AccountDetails from "@/pages/AccountDetails";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Redirect root to account dashboard */}
          <Route path="/" element={<Navigate to="/account" replace />} />
          
          {/* Account routes with layout */}
          <Route path="/account" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="subscriptions/:subId" element={<SubscriptionDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="details" element={<AccountDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;