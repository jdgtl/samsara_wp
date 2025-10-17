import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  ExternalLink, 
  Pause, 
  Play, 
  XCircle, 
  AlertTriangle,
  Filter
} from 'lucide-react';
import { 
  userData, 
  primarySubscription, 
  memberships, 
  getExpiringPaymentMethods,
  getDaysUntilExpiration 
} from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  const [membershipFilter, setMembershipFilter] = useState('all');
  
  const expiringCards = getExpiringPaymentMethods();

  // Calculate countdown for next payment
  useEffect(() => {
    const calculateCountdown = () => {
      if (!primarySubscription.nextPaymentDate) return;
      
      const now = new Date();
      const nextPayment = new Date(primarySubscription.nextPaymentDate);
      const diff = nextPayment - now;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      setCountdown({ days, hours });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      trial: 'secondary',
      paused: 'outline',
      canceled: 'destructive',
      inactive: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'default'} data-testid={`status-badge-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleManageSubscription = () => {
    navigate(`/subscriptions/${primarySubscription.id}`);
  };

  const handlePauseResume = () => {
    alert('Pause/Resume functionality would be implemented here');
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      alert('Cancellation would be processed here');
    }
  };

  const handleOpenBasecamp = () => {
    window.open('https://basecamp.samsara.com', '_blank');
  };

  const filteredMemberships = memberships.filter(m => 
    membershipFilter === 'all' ? true : m.status === membershipFilter
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="dashboard-page">
      {/* Welcome Header */}
      <div className="space-y-2" data-testid="welcome-section">
        <h1 className="text-3xl font-bold text-stone-900">
          Welcome back, {userData.firstName}
        </h1>
        <p className="text-stone-600">
          Here's how you're doing with Samsara.
        </p>
      </div>

      {/* Expiring Payment Methods Alert */}
      {expiringCards.length > 0 && (
        <Alert className="border-amber-500 bg-amber-50" data-testid="expiring-card-alert">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="ml-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-amber-900">Payment method expiring soon:</span>
                {expiringCards.map(card => {
                  const daysLeft = getDaysUntilExpiration(card.expMonth, card.expYear);
                  return (
                    <span key={card.id} className="ml-2 text-amber-800">
                      {card.brand} •••• {card.last4} expires in {daysLeft} days
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-amber-600 text-amber-900 hover:bg-amber-100"
                  data-testid="update-card-btn"
                >
                  Update Card
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-amber-900 hover:bg-amber-100"
                  data-testid="dismiss-alert-btn"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Primary Subscription Card */}
      <Card className="border-2 border-emerald-200" data-testid="primary-subscription-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-stone-900">
                {primarySubscription.planName}
              </CardTitle>
              <CardDescription className="mt-1">
                Your primary membership
              </CardDescription>
            </div>
            {getStatusBadge(primarySubscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-stone-600">Next billing date</p>
              <p className="text-lg font-semibold text-stone-900" data-testid="next-billing-date">
                {new Date(primarySubscription.nextPaymentDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-emerald-700 font-medium" data-testid="countdown">
                in {countdown.days} days, {countdown.hours} hours
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-stone-600">Amount</p>
              <p className="text-lg font-semibold text-stone-900" data-testid="subscription-amount">
                ${primarySubscription.nextPaymentAmount.toFixed(2)} / {primarySubscription.billingInterval}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              onClick={handleManageSubscription}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="manage-subscription-btn"
            >
              Manage
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePauseResume}
              data-testid="pause-resume-btn"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              data-testid="cancel-subscription-btn"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Hub / Basecamp CTA */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300" data-testid="basecamp-cta-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900">
                Open Training Hub (Basecamp)
              </h3>
              <p className="text-stone-700">
                Access your content in Basecamp. Your dedicated training platform awaits.
              </p>
            </div>
            <Button 
              size="lg"
              onClick={handleOpenBasecamp}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              data-testid="open-basecamp-btn"
            >
              Open Basecamp
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Memberships */}
      <Card data-testid="memberships-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-stone-900">Additional Memberships</CardTitle>
              <CardDescription>Legacy training programs and courses</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={membershipFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setMembershipFilter('all')}
                data-testid="filter-all"
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={membershipFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setMembershipFilter('active')}
                data-testid="filter-active"
              >
                Active
              </Button>
              <Button 
                size="sm" 
                variant={membershipFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => setMembershipFilter('inactive')}
                data-testid="filter-inactive"
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMemberships.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-memberships">
              <p className="text-stone-600 mb-4">No additional memberships</p>
              <Button variant="outline" data-testid="browse-plans-btn">
                Browse our training plans
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.map((membership) => (
                  <TableRow key={membership.id} data-testid={`membership-row-${membership.id}`}>
                    <TableCell className="font-medium">{membership.name}</TableCell>
                    <TableCell>{getStatusBadge(membership.status)}</TableCell>
                    <TableCell>
                      {new Date(membership.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {membership.expiresAt 
                        ? new Date(membership.expiresAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        data-testid={`view-membership-${membership.id}`}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;