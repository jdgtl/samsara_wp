export default function Orders() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
      <p className="text-stone-600">View and manage your order history</p>
      <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
        <p className="text-stone-500">Orders will be loaded from WooCommerce API</p>
      </div>
    </div>
  );
}
