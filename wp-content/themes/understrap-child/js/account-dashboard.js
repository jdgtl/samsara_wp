/**
 * Account Dashboard AJAX Functionality
 */
(function($) {
    'use strict';

    var AccountDashboard = {

        init: function() {
            this.bindEvents();
            this.loadInitialContent();
        },

        bindEvents: function() {
            $(document).on('click', '.account-nav-item, .mobile-nav-item', this.handleTabClick);
            $(window).on('popstate', this.handleBrowserHistory);
        },

        handleTabClick: function(e) {
            e.preventDefault();

            var $this = $(this);
            var target = $this.data('target');

            // Don't reload if already active and we're not on a detail page
            var currentPath = window.location.pathname;
            var isDetailPage = currentPath.indexOf('view-order') !== -1;

            if ($this.hasClass('active') && !isDetailPage) {
                return;
            }

            console.log('Tab clicked:', target, 'Current path:', currentPath, 'Is detail page:', isDetailPage);

            AccountDashboard.switchTab($this, target);
        },

        switchTab: function($element, section) {
            // Update active state for both desktop and mobile nav
            $('.account-nav-item, .mobile-nav-item').removeClass('active');
            $('.account-nav-item[data-target="' + section + '"], .mobile-nav-item[data-target="' + section + '"]').addClass('active');

            // Show loading
            this.showLoading();

            // Update URL without page reload
            this.updateURL(section);

            // Load content via AJAX
            this.loadContent(section);
        },

        loadContent: function(section) {
            $.ajax({
                url: accountDashboard.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'account_dashboard_load',
                    section: section,
                    nonce: accountDashboard.nonce
                },
                success: function(response) {
                    if (response.success) {
                        AccountDashboard.displayContent(response.data.content, response.data.section);
                    } else {
                        AccountDashboard.showError('Failed to load content. Please try again.');
                    }
                },
                error: function() {
                    AccountDashboard.showError('Connection error. Please check your internet connection.');
                },
                timeout: 10000
            });
        },

        displayContent: function(content, section) {
            var $contentArea = $('.account-content-section');

            // Fade out current content
            $contentArea.fadeOut(200, function() {
                // Update content
                $contentArea.html(content);

                // Fade in new content
                $contentArea.fadeIn(300);

                // Scroll to content on mobile
                if ($(window).width() <= 768) {
                    $('html, body').animate({
                        scrollTop: $contentArea.offset().top - 100
                    }, 300);
                }

                // Trigger WooCommerce scripts for forms and enhanced functionality
                $(document.body).trigger('init_checkout');
                $(document.body).trigger('wc-enhanced-select-init');
                $(document.body).trigger('wc_fragments_loaded');
                $(document.body).trigger('country_to_state_changed');

                // Reinitialize WooCommerce form handlers
                if (typeof wc_address_i18n_params !== 'undefined') {
                    $('body').trigger('country_to_state_changed');
                }

                // Handle form submissions within AJAX content
                AccountDashboard.bindFormHandlers();

                // Add newsletter preferences header for Mailchimp radio buttons
                AccountDashboard.addNewsletterHeader();

                // Update password change header styling
                AccountDashboard.updatePasswordHeader();

                // Check for and display WooCommerce messages
                AccountDashboard.displayWooCommerceMessages();
            });
        },

        showLoading: function() {
            var $contentArea = $('.account-content-section');
            var loadingHtml = '<div class="account-loading">' +
                                '<div class="loading-spinner"></div>' +
                                '<p>' + accountDashboard.loadingText + '</p>' +
                              '</div>';

            $contentArea.fadeOut(200, function() {
                $contentArea.html(loadingHtml).fadeIn(300);
            });
        },

        showError: function(message) {
            var $contentArea = $('.account-content-section');
            var errorHtml = '<div class="account-error">' +
                              '<div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>' +
                              '<h3>Oops! Something went wrong</h3>' +
                              '<p>' + message + '</p>' +
                              '<button class="btn btn-primary retry-btn">Try Again</button>' +
                            '</div>';

            $contentArea.html(errorHtml);

            // Bind retry button
            $('.retry-btn').on('click', function() {
                var activeSection = $('.account-nav-item.active').data('target');
                AccountDashboard.loadContent(activeSection);
            });
        },

        updateURL: function(section) {
            // Get base My Account URL (remove any existing endpoints)
            var pathParts = window.location.pathname.split('/');
            var baseUrl = '';

            // Find my-account in path and rebuild base URL
            for (var i = 0; i < pathParts.length; i++) {
                baseUrl += pathParts[i] + '/';
                if (pathParts[i] === 'my-account') {
                    break;
                }
            }

            // Map sections to WooCommerce endpoints
            var sectionMapping = {
                'dashboard': '',
                'orders': 'orders/',
                'subscriptions': 'subscriptions/',
                'downloads': 'downloads/',
                'addresses': 'edit-address/',
                'account-details': 'edit-account/'
            };

            var newUrl = baseUrl;
            if (section && section !== 'dashboard' && sectionMapping[section]) {
                newUrl += sectionMapping[section];
            }

            // Push new state to browser history
            history.pushState({ section: section }, '', newUrl);
        },

        handleBrowserHistory: function(e) {
            var state = e.originalEvent.state;
            if (state && state.section) {
                if (state.section === 'view-order' && state.orderId) {
                    // Load specific order details
                    $('.account-nav-item').removeClass('active');
                    $('.account-nav-item[data-target="orders"]').addClass('active');
                    AccountDashboard.loadOrderDetails(state.orderId);
                } else {
                    // Load regular section
                    var $targetTab = $('.account-nav-item[data-target="' + state.section + '"]');
                    if ($targetTab.length) {
                        $('.account-nav-item').removeClass('active');
                        $targetTab.addClass('active');
                        AccountDashboard.loadContent(state.section);
                    }
                }
            } else {
                // Check URL for order details without state
                var currentPath = window.location.pathname;
                var orderMatch = currentPath.match(/\/view-order\/(\d+)/);
                if (orderMatch) {
                    var orderId = orderMatch[1];
                    $('.account-nav-item').removeClass('active');
                    $('.account-nav-item[data-target="orders"]').addClass('active');
                    AccountDashboard.loadOrderDetails(orderId);
                } else {
                    // Back to dashboard
                    $('.account-nav-item').removeClass('active');
                    $('.account-nav-item[data-target="dashboard"]').addClass('active');
                    AccountDashboard.loadContent('dashboard');
                }
            }
        },

        loadInitialContent: function() {
            // Check if we're on an order detail page
            var currentPath = window.location.pathname;
            var orderMatch = currentPath.match(/\/view-order\/(\d+)/);

            if (orderMatch) {
                // Load order details
                var orderId = orderMatch[1];
                $('.account-nav-item, .mobile-nav-item').removeClass('active');
                $('.account-nav-item[data-target="orders"], .mobile-nav-item[data-target="orders"]').addClass('active');
                this.loadOrderDetails(orderId);
            } else {
                // Get initial section from PHP (detects WooCommerce endpoints)
                var section = accountDashboard.initialSection || 'dashboard';

                // Set active tab for both desktop and mobile navigation
                $('.account-nav-item, .mobile-nav-item').removeClass('active');
                $('.account-nav-item[data-target="' + section + '"], .mobile-nav-item[data-target="' + section + '"]').addClass('active');

                // Load content
                this.loadContent(section);
            }
        },

        bindFormHandlers: function() {
            // Handle WooCommerce form submissions within AJAX content
            $('.account-content-section form').off('submit.dashboard').on('submit.dashboard', function(e) {
                var $form = $(this);

                // Let WooCommerce handle its own forms normally
                if ($form.hasClass('woocommerce-form') || $form.hasClass('edit-account') || $form.hasClass('edit-address')) {
                    // Don't prevent default - let WooCommerce handle it
                    return true;
                }
            });

            // Handle order and subscription action links (cancel, etc.)
            $('.account-content-section').off('click.dashboard', '.subscription-cancel-link, [href*="cancel"], .order-action').on('click.dashboard', '.subscription-cancel-link, [href*="cancel"], .order-action', function(e) {
                var $link = $(this);
                var href = $link.attr('href');
                var action = '';

                // Determine the action type
                if (href && href.indexOf('cancel') !== -1) {
                    action = 'cancel';
                } else if ($link.hasClass('order-action')) {
                    action = $link.text().toLowerCase();
                }

                if (href && href.indexOf('#') !== 0) {
                    // Show immediate feedback
                    if (action === 'cancel') {
                        AccountDashboard.showNotification('Processing cancellation...', 'info');
                    }

                    // Let the default action proceed, then check for result
                    setTimeout(function() {
                        // Check if page was redirected or if there are success/error messages
                        var currentUrl = window.location.href;
                        if (currentUrl.indexOf('my-account') !== -1) {
                            // Still on my-account, check for WooCommerce messages
                            var $messages = $('.woocommerce-message, .woocommerce-error');
                            if ($messages.length > 0) {
                                // Messages found - action was processed
                                if ($messages.hasClass('woocommerce-message')) {
                                    AccountDashboard.showNotification('Action completed successfully!', 'success');
                                } else if ($messages.hasClass('woocommerce-error')) {
                                    AccountDashboard.showNotification('Action failed. Please try again.', 'error');
                                }
                            } else if (action === 'cancel') {
                                // No messages but cancel action - assume success
                                AccountDashboard.showNotification('Order cancelled successfully!', 'success');
                            }
                        }
                    }, 1000);

                    return true; // Let default action proceed
                }
            });

            // Handle address edit links
            $('.account-content-section').off('click.dashboard', '.edit-address').on('click.dashboard', '.edit-address', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                var addressType = href.indexOf('billing') !== -1 ? 'billing' : 'shipping';

                // Load the address edit form via AJAX
                AccountDashboard.loadAddressForm(addressType);
            });

            // Handle order detail links (order numbers and action buttons) - using more specific selectors
            $('.account-content-section').off('click.dashboard', '.woocommerce-orders-table a, .woocommerce-table a, a[href*="view-order"]').on('click.dashboard', '.woocommerce-orders-table a, .woocommerce-table a, a[href*="view-order"]', function(e) {
                var href = $(this).attr('href');

                // Only handle order-related links
                if (href && (href.indexOf('view-order') !== -1 || href.indexOf('/orders/') !== -1)) {
                    e.preventDefault();

                    // Extract order ID from the URL
                    var orderMatch = href.match(/view-order\/(\d+)|\/orders\/(\d+)|order[\/=](\d+)/);
                    if (orderMatch) {
                        var orderId = orderMatch[1] || orderMatch[2] || orderMatch[3];
                        console.log('Loading order details for order ID:', orderId);
                        AccountDashboard.loadOrderDetails(orderId);
                    }
                }
            });
        },

        loadAddressForm: function(addressType) {
            this.showLoading();

            $.ajax({
                url: accountDashboard.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'account_dashboard_load',
                    section: 'addresses',
                    address_type: addressType,
                    nonce: accountDashboard.nonce
                },
                success: function(response) {
                    if (response.success) {
                        AccountDashboard.displayContent(response.data.content, 'addresses');
                    } else {
                        AccountDashboard.showError('Failed to load address form. Please try again.');
                    }
                },
                error: function() {
                    AccountDashboard.showError('Connection error. Please check your internet connection.');
                }
            });
        },

        loadOrderDetails: function(orderId) {
            this.showLoading();

            $.ajax({
                url: accountDashboard.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'account_dashboard_load',
                    section: 'view-order',
                    order_id: orderId,
                    nonce: accountDashboard.nonce
                },
                success: function(response) {
                    if (response.success) {
                        AccountDashboard.displayContent(response.data.content, 'view-order');

                        // Update URL to reflect order detail view
                        var pathParts = window.location.pathname.split('/');
                        var baseUrl = '';
                        for (var i = 0; i < pathParts.length; i++) {
                            baseUrl += pathParts[i] + '/';
                            if (pathParts[i] === 'my-account') {
                                break;
                            }
                        }
                        var newUrl = baseUrl + 'view-order/' + orderId + '/';
                        history.pushState({ section: 'view-order', orderId: orderId }, '', newUrl);
                    } else {
                        AccountDashboard.showError('Failed to load order details. Please try again.');
                    }
                },
                error: function() {
                    AccountDashboard.showError('Connection error. Please check your internet connection.');
                }
            });
        },

        addNewsletterHeader: function() {
            // Look for radio buttons (likely from Mailchimp or newsletter plugin)
            var $radioButtons = $('.account-content-section input[type="radio"]');

            if ($radioButtons.length > 0) {
                // Find the first radio button's parent container
                var $firstRadio = $radioButtons.first();
                var $radioContainer = $firstRadio.closest('p, div, fieldset, .form-row, .woocommerce-form-row');

                // If we found a container and it doesn't already have a header
                if ($radioContainer.length > 0 && !$radioContainer.prev('.newsletter-preferences-header').length) {
                    // Insert the header before the radio button container
                    $radioContainer.before('<h3 class="newsletter-preferences-header">Newsletter Preferences</h3>');
                }
            }
        },

        updatePasswordHeader: function() {
            // Look for password change section headers (only h2, h3, legend - NOT individual input labels)
            var $passwordHeaders = $('.account-content-section').find('legend, h2, h3').filter(function() {
                var text = $(this).text().toLowerCase();
                return text.indexOf('password change') !== -1 || text.indexOf('change password') !== -1;
            });

            // Also look for fieldsets that might contain password fields
            var $passwordFieldsets = $('.account-content-section fieldset').filter(function() {
                return $(this).find('input[type="password"]').length > 0;
            });

            $passwordFieldsets.each(function() {
                var $fieldset = $(this);
                var $legend = $fieldset.find('legend').first();

                if ($legend.length > 0 && !$legend.hasClass('updated-header')) {
                    // Only apply to legends that are section headers, not individual field labels
                    var legendText = $legend.text().toLowerCase();
                    if (legendText.indexOf('password change') !== -1 || legendText.indexOf('change password') !== -1) {
                        $legend.addClass('updated-header newsletter-preferences-header');
                    }
                }
            });

            // Update any password-related section headers (not individual field labels)
            $passwordHeaders.each(function() {
                var $header = $(this);
                if (!$header.hasClass('updated-header')) {
                    $header.addClass('updated-header newsletter-preferences-header');
                }
            });
        },

        displayWooCommerceMessages: function() {
            // Look for WooCommerce messages in the loaded content
            var $messages = $('.account-content-section').find('.woocommerce-message, .woocommerce-error, .woocommerce-info');

            if ($messages.length > 0) {
                // Move messages to the top of the content area for better visibility
                var $contentArea = $('.account-content-section');
                $messages.detach().prependTo($contentArea);

                // Auto-hide success messages after 5 seconds
                $messages.filter('.woocommerce-message').delay(5000).fadeOut();

                // Scroll to show the message
                $('html, body').animate({
                    scrollTop: $contentArea.offset().top - 100
                }, 300);
            }
        },

        showNotification: function(message, type) {
            // Create custom notification for immediate feedback
            type = type || 'success'; // success, error, info

            var notificationClass = 'account-notification account-notification-' + type;
            var iconClass = type === 'success' ? 'fas fa-check-circle' : (type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle');

            var $notification = $('<div class="' + notificationClass + '">' +
                '<i class="' + iconClass + '"></i>' +
                '<span>' + message + '</span>' +
                '<button class="notification-close">&times;</button>' +
            '</div>');

            // Remove any existing notifications
            $('.account-notification').remove();

            // Add to top of account content
            $('.account-content-section').prepend($notification);

            // Auto-hide after 5 seconds
            setTimeout(function() {
                $notification.fadeOut(300, function() {
                    $notification.remove();
                });
            }, 5000);

            // Handle close button
            $notification.find('.notification-close').on('click', function() {
                $notification.fadeOut(300, function() {
                    $notification.remove();
                });
            });
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        AccountDashboard.init();
    });

})(jQuery);