import { ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const userData = window.samsaraMyAccount?.userData || {};
  const basecampUrl = window.samsaraMyAccount?.basecampUrl;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">
          Welcome back, {userData.firstName}!
        </h1>
        <p className="text-stone-600">Here's how you're doing with Samsara.</p>
      </div>

      {/* Basecamp CTA */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-stone-900">Open Training Hub (Basecamp)</h3>
            <p className="text-stone-700">Access your content in Basecamp.</p>
          </div>
          {basecampUrl && (
            <a
              href={basecampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Open Basecamp
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-600 mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-emerald-600">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-stone-900">--</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-stone-200">
          <p className="text-sm text-stone-600 mb-1">Member Since</p>
          <p className="text-3xl font-bold text-stone-900">
            {new Date(userData.memberSince).getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
