export default function Payments() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-stone-900">Payment Methods</h1>
      <p className="text-stone-600">Manage your saved payment methods and billing information</p>
      <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
        <p className="text-stone-500">Payment methods will be loaded from WooCommerce API</p>
      </div>
    </div>
  );
}
