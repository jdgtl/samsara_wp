import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowUpDown, Loader2, AlertTriangle } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useNavigate, Link } from 'react-router-dom';

const Subscriptions = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch live subscriptions data
  const { subscriptions, loading, error } = useSubscriptions();

  const getStatusBadge = (status) => {
    const variants = {
      active: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
      trial: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      paused: { variant: 'outline', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      canceled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const config = variants[status] || variants.active;
    return (
      <Badge variant={config.variant} className={config.className} data-testid={`subscription-status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter and sort logic
  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];

    let filtered = subscriptions;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply sorting by next payment date
    filtered = [...filtered].sort((a, b) => {
      // Put subscriptions without next payment date at the end
      if (!a.nextPaymentDate) return 1;
      if (!b.nextPaymentDate) return -1;

      const dateA = new Date(a.nextPaymentDate);
      const dateB = new Date(b.nextPaymentDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [subscriptions, statusFilter, sortOrder]);

  const handleViewSubscription = (subId) => {
    navigate(`/subscriptions/${subId}`);
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'trial', label: 'Trial' },
    { value: 'paused', label: 'Paused' },
    { value: 'canceled', label: 'Canceled' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="subscriptions-loading">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Subscriptions</h1>
          <p className="text-stone-600">Manage your recurring memberships and plans</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading your subscriptions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="subscriptions-error">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Subscriptions</h1>
          <p className="text-stone-600">Manage your recurring memberships and plans</p>
        </div>
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="text-red-900">
              <p className="font-medium">Failed to load subscriptions</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="subscriptions-page">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">Subscriptions</h1>
        <p className="text-stone-600">Manage your recurring memberships and plans</p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2" data-testid="status-filters">
              {statusOptions.map(option => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={statusFilter === option.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(option.value)}
                  className={statusFilter === option.value ? 'bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black' : ''}
                  data-testid={`filter-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="gap-2"
                data-testid="sort-toggle"
              >
                <ArrowUpDown className="h-4 w-4" />
                Next Payment {sortOrder === 'asc' ? '(Soonest)' : '(Latest)'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-subscriptions">
              <p className="text-stone-600 mb-4">No active subscriptions.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/athlete-team/'}
                >
                  Join Athlete Team
                </Button>
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/training-basecamp/'}
                >
                  Join Basecamp
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscription ID</TableHead>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} data-testid={`subscription-row-${subscription.id}`}>
                      <TableCell className="font-mono text-sm">{subscription.id}</TableCell>
                      <TableCell className="font-medium">{subscription.planName}</TableCell>
                      <TableCell>
                        {new Date(subscription.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        {subscription.nextPaymentDate 
                          ? new Date(subscription.nextPaymentDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {subscription.nextPaymentAmount 
                          ? `$${subscription.nextPaymentAmount.toFixed(2)}` 
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/subscriptions/${subscription.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            data-testid={`manage-subscription-${subscription.id}`}
                          >
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscriptions;