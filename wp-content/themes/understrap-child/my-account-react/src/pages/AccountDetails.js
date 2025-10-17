export default function AccountDetails() {
  const userData = window.samsaraMyAccount?.userData || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-stone-900">Account Details</h1>
      <p className="text-stone-600">Manage your personal information and account settings</p>

      <div className="bg-white p-8 rounded-xl border border-stone-200">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Display Name</label>
            <p className="text-stone-900">{userData.displayName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
              <p className="text-stone-900">{userData.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
              <p className="text-stone-900">{userData.lastName}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <p className="text-stone-900">{userData.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
