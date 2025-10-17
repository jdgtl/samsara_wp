import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { ArrowUpDown, Search } from 'lucide-react';
import { orders as mockOrders } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const Orders = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status) => {
    const variants = {
      completed: { variant: 'default', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
      processing: { variant: 'secondary', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      refunded: { variant: 'outline', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      canceled: { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };

    const config = variants[status] || variants.completed;
    return (
      <Badge variant={config.variant} className={config.className} data-testid={`order-status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    let filtered = mockOrders;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [statusFilter, searchQuery, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewOrder = (orderId) => {
    navigate(`/account/orders/${orderId}`);
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'canceled', label: 'Canceled' },
  ];

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
                  className={statusFilter === option.value ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
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
              <Button variant="outline" data-testid="shop-offerings-btn">
                Shop offerings
              </Button>
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
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-emerald-600 hover:underline"
                            data-testid={`order-link-${order.id}`}
                          >
                            #{order.id}
                          </button>
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
                          <div className="max-w-xs">
                            {order.items.slice(0, 2).join(', ')}
                            {order.items.length > 2 && (
                              <span className="text-stone-500"> +{order.items.length - 2} more</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewOrder(order.id)}
                            data-testid={`view-order-${order.id}`}
                          >
                            View
                          </Button>
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