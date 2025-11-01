import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetail from "./pages/SubscriptionDetail";
import GiftCards from "./pages/GiftCards";
import GiftCardDetail from "./pages/GiftCardDetail";
import Payments from "./pages/Payments";
import AccountDetails from "./pages/AccountDetails";
import { Toaster } from "./components/ui/sonner";
import { AvatarProvider } from "./contexts/AvatarContext";

function App() {
  return (
    <div className="App">
      <AvatarProvider>
        <Router basename="/account">
          <Routes>
            {/* Account routes with layout */}
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="subscriptions/:subId" element={<SubscriptionDetail />} />
              <Route path="gift-cards" element={<GiftCards />} />
              <Route path="gift-cards/:cardId" element={<GiftCardDetail />} />
              <Route path="payments" element={<Payments />} />
              <Route path="details" element={<AccountDetails />} />
            </Route>
          </Routes>
        </Router>
      </AvatarProvider>
      <Toaster />
    </div>
  );
}

export default App;
