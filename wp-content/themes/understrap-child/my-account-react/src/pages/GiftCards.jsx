import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Separator } from '../components/ui/separator';
import { Search, Loader2, AlertTriangle, Copy, Check, CreditCard, Gift, ShoppingCart } from 'lucide-react';
import { useGiftCards, useGiftCardBalance } from '../hooks/useGiftCards';
import { useNavigate, Link } from 'react-router-dom';

// Helper component to render gift card table
const GiftCardTable = ({ cards, copiedCode, copyToClipboard, formatCurrency, formatDate, getStatusBadge }) => {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id} data-testid={`gift-card-row-${card.id}`}>
              <TableCell>
                <div className="flex items-center gap-2" title={card.type === 'received' ? 'Received' : 'Purchased'}>
                  {card.type === 'received' ? (
                    <Gift className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-amber-600" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{card.code}</span>
                  <button
                    onClick={() => copyToClipboard(card.code)}
                    className="text-stone-400 hover:text-stone-600 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === card.code ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </TableCell>
              <TableCell className="text-sm text-stone-600">{card.recipient}</TableCell>
              <TableCell>{formatCurrency(card.balance)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(card.remaining)}
              </TableCell>
              <TableCell>
                {formatDate(card.expire_date)}
              </TableCell>
              <TableCell>{getStatusBadge(card)}</TableCell>
              <TableCell className="text-right">
                <Link to={`/gift-cards/${card.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    data-testid={`view-gift-card-${card.id}`}
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
  );
};

const GiftCards = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [balanceCheckCode, setBalanceCheckCode] = useState('');

  // Fetch gift cards data
  const { giftCards, loading, error } = useGiftCards();

  // Balance check functionality
  const { balance, loading: balanceLoading, error: balanceError, checkBalance, reset: resetBalance } = useGiftCardBalance();

  // Extract received and purchased from API response
  const receivedCards = giftCards?.received || [];
  const purchasedCards = giftCards?.purchased || [];

  const getStatusBadge = (card) => {
    // Check if redeemed to account
    if (card.is_redeemed_to_account) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100" data-testid={`gift-card-status-in-account`}>
          In Account
        </Badge>
      );
    }

    // Otherwise show the standard status
    const variants = {
      active: { variant: 'default', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100', label: 'Ready to Redeem' },
      used: { variant: 'secondary', className: 'bg-stone-200 text-stone-700 hover:bg-stone-200', label: 'Used' },
      expired: { variant: 'outline', className: 'bg-red-100 text-red-800 hover:bg-red-100', label: 'Expired' },
      inactive: { variant: 'outline', className: 'bg-stone-300 text-stone-700 hover:bg-stone-300', label: 'Inactive' },
    };

    const config = variants[card.status] || { variant: 'outline', className: 'bg-stone-100 text-stone-800 hover:bg-stone-100', label: 'Unknown' };

    return (
      <Badge variant={config.variant} className={config.className} data-testid={`gift-card-status-${card.status}`}>
        {config.label}
      </Badge>
    );
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCheckBalance = async (e) => {
    e.preventDefault();
    if (!balanceCheckCode.trim()) return;

    try {
      await checkBalance(balanceCheckCode.trim());
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleResetBalanceCheck = () => {
    setBalanceCheckCode('');
    resetBalance();
  };

  // Combine and tag cards with type, then filter
  const allCards = useMemo(() => {
    const received = receivedCards.map(card => ({ ...card, type: 'received' }));
    const purchased = purchasedCards.map(card => ({ ...card, type: 'purchased' }));
    return [...received, ...purchased];
  }, [receivedCards, purchasedCards]);

  // Filter and search logic for all cards
  const filteredCards = useMemo(() => {
    let filtered = allCards;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card =>
        card.code.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.create_date);
      const dateB = new Date(b.create_date);
      return dateB - dateA;
    });

    return filtered;
  }, [allCards, statusFilter, searchQuery]);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'used', label: 'Used' },
    { value: 'expired', label: 'Expired' },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="gift-cards-loading">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Gift Cards</h1>
          <p className="text-stone-600">Manage your gift cards</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
              <p className="text-stone-600">Loading your gift cards...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6" data-testid="gift-cards-error">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-stone-900">Gift Cards</h1>
          <p className="text-stone-600">Manage your gift cards</p>
        </div>
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="ml-2">
            <div className="text-red-900">
              <p className="font-medium">Failed to load gift cards</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6" data-testid="gift-cards-page">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900">Gift Cards</h1>
        <p className="text-stone-600">Manage your gift cards</p>
      </div>

      {/* Check Gift Card Balance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Check Gift Card Balance
          </CardTitle>
          <CardDescription>
            Enter a gift card code to check its balance and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckBalance} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter gift card code..."
                value={balanceCheckCode}
                onChange={(e) => setBalanceCheckCode(e.target.value)}
                className="flex-1 font-mono"
                disabled={balanceLoading}
                data-testid="balance-check-input"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={balanceLoading || !balanceCheckCode.trim()}
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  data-testid="check-balance-btn"
                >
                  {balanceLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Balance'
                  )}
                </Button>
                {(balance || balanceError) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetBalanceCheck}
                    data-testid="reset-balance-btn"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Balance Result */}
            {balance && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3" data-testid="balance-result">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Gift Card Found</p>
                    <code className="text-lg font-mono font-bold text-emerald-800">{balance.code}</code>
                  </div>
                  {getStatusBadge({ status: balance.is_active ? 'active' : 'inactive', is_redeemed_to_account: false })}
                </div>
                <Separator className="bg-emerald-200" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-emerald-700">Remaining Balance</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(balance.remaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700">Expiry Date</p>
                    <p className="text-lg font-semibold text-emerald-900">
                      {balance.expire_date ? formatDate(balance.expire_date) : 'No expiry'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {balanceError && (
              <Alert className="border-red-500 bg-red-50" data-testid="balance-error">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2">
                  <p className="text-red-900 font-medium">{balanceError}</p>
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* My Gift Cards - Unified Section with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>My Gift Cards</CardTitle>
          <CardDescription>
            Gift cards you've received or purchased
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search by gift card code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-input"
              />
            </div>
          </div>

          <Separator />

          {/* Gift Cards List */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-gift-cards">
              <p className="text-stone-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'No gift cards match your criteria'
                  : 'You don\'t have any gift cards yet'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  className="bg-samsara-gold hover:bg-samsara-gold/90 text-samsara-black"
                  onClick={() => window.location.href = 'https://samsaraexperience.com/product/gift-card/'}
                >
                  Purchase Gift Card
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-emerald-600" />
                  <span>Received</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                  <span>Purchased</span>
                </div>
              </div>
              <GiftCardTable
                cards={filteredCards}
                copiedCode={copiedCode}
                copyToClipboard={copyToClipboard}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusBadge={getStatusBadge}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftCards;
