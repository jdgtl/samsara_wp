import { useParams } from 'react-router-dom';

export default function SubscriptionDetail() {
  const { subId } = useParams();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-stone-900">Subscription #{subId}</h1>
      <div className="bg-white p-12 rounded-xl border border-stone-200 text-center">
        <p className="text-stone-500">Subscription details will be loaded from WooCommerce API</p>
      </div>
    </div>
  );
}
