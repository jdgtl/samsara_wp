import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Subscriptions from './pages/Subscriptions';
import SubscriptionDetail from './pages/SubscriptionDetail';
import Payments from './pages/Payments';
import AccountDetails from './pages/AccountDetails';

function App() {
  return (
    <Router basename="/account-dashboard">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="subscriptions/:subId" element={<SubscriptionDetail />} />
          <Route path="payments" element={<Payments />} />
          <Route path="details" element={<AccountDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
