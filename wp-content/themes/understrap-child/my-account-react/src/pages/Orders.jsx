import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { ArrowUpDown, Search, Loader2, AlertTriangle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useNavigate, Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch live orders data
  const { orders, loading, error } = useOrders();

  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
      processing: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      'on-hold': { variant: 'outline', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      pending: { variant: 'outline', className: 'bg-stone-200 text-stone-700 hover:bg-stone-200' },
      refunded: { variant: 'outline', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
      cancelled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      canceled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      failed: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const config = variants[status] || { variant: 'outline', className: 'bg-stone-100 text-stone-800 hover:bg-stone-100' };

    // Format display name (handle both cancelled and canceled)
    const displayName = status === 'cancelled' ? 'Canceled' :
                       status === 'on-hold' ? 'On Hold' :
                       status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge variant={config.variant} className={config.className} data-testid={`order-status-${status}`}>
        {displayName}
      </Badge>
    );
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    let filtered = orders;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        // Handle both 'canceled' and 'cancelled' spellings
        if (statusFilter === 'cancelled' || statusFilter === 'canceled') {
          return order.status === 'cancelled' || order.status === 'canceled';
        }
        return order.status === statusFilter;
      });
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().toLowerCase().includes(query) ||
        (order.items && order.items.some(item => item.name.toLowerCase().includes(query)))
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [orders, statusFilter, searchQuery, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Canceled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="orders-loading">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-600">View and manage your order history</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading your orders...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="orders-error">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-600">View and manage your order history</p>
        </div>
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="text-red-900">
              <p className="font-medium">Failed to load orders</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="orders-page">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">Orders</h1>
        <p className="text-stone-600">View and manage your order history</p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2" data-testid="status-filters">
              {statusOptions.map(option => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={statusFilter === option.value ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setCurrentPage(1);
                  }}
                  className={statusFilter === option.value ? 'bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black' : ''}
                  data-testid={`filter-${option.value}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Search by order ID or product name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="gap-2"
                data-testid="sort-toggle"
              >
                <ArrowUpDown className="h-4 w-4" />
                Date {sortOrder === 'desc' ? '(Newest)' : '(Oldest)'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {paginatedOrders.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-orders">
              <p className="text-stone-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'No orders found matching your criteria'
                  : "You haven't placed any orders yet."
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
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
              )}
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-emerald-600 hover:underline"
                            data-testid={`order-link-${order.id}`}
                          >
                            #{order.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {new Date(order.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-lg whitespace-nowrap">
                            {order.items.slice(0, 2).map(item => item.name).join(', ')}
                            {order.items.length > 2 && (
                              <span className="text-stone-500"> +{order.items.length - 2} more</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/orders/${order.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              data-testid={`view-order-${order.id}`}
                            >
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4" data-testid="pagination">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;