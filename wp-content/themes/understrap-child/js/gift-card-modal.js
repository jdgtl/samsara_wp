/**
 * Gift Card Balance Checker Modal
 * JavaScript for modal functionality
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        const $modal = $('#gift-card-modal');
        const $overlay = $('.gc-modal-overlay');
        const $closeBtn = $('.gc-modal-close');
        const $form = $('#gc-modal-form');
        const $input = $('#gc-code-input');
        const $submitBtn = $('#gc-submit-btn');
        const $results = $('#gc-results');
        const $success = $('#gc-success');
        const $error = $('#gc-error');

        // Auto-open modal if on specific URLs
        const currentPath = window.location.pathname.toLowerCase();
        const autoOpenPaths = ['/gift-card', '/gift-card/', '/check-gift-card', '/check-gift-card/'];

        if (autoOpenPaths.includes(currentPath) || window.location.hash === '#gift-card-balance') {
            // Small delay to ensure page is fully loaded
            setTimeout(function() {
                openModal();
            }, 300);
        }

        // Open modal when clicking trigger links
        $(document).on('click', '.gift-card-checker-trigger, a[href="#check-gift-card"], a[href="#gift-card-balance"], a[href="/gift-card"], a[href="/gift-card/"]', function(e) {
            e.preventDefault();
            openModal();
        });

        // Close modal handlers
        $closeBtn.on('click', closeModal);
        $overlay.on('click', closeModal);

        // Close on ESC key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $modal.is(':visible')) {
                closeModal();
            }
        });

        // Form submission
        $form.on('submit', function(e) {
            e.preventDefault();
            checkBalance();
        });

        // Reset buttons
        $('#gc-reset-btn, #gc-reset-btn-error').on('click', function() {
            resetForm();
        });

        // Open modal function
        function openModal() {
            $modal.fadeIn(200);
            $('body').css('overflow', 'hidden');
            $input.focus();

            // Reset form when opening
            resetForm();
        }

        // Close modal function
        function closeModal() {
            $modal.fadeOut(200);
            $('body').css('overflow', '');
            resetForm();
        }

        // Check balance function
        function checkBalance() {
            const code = $input.val().trim();

            if (!code) {
                return;
            }

            // Show loading state
            $submitBtn.prop('disabled', true);
            $submitBtn.find('.gc-btn-text').hide();
            $submitBtn.find('.gc-btn-loading').show();

            // Hide previous results
            $results.hide();
            $success.hide();
            $error.hide();

            // Make API request
            $.ajax({
                url: giftCardModalSettings.apiUrl + encodeURIComponent(code),
                method: 'GET',
                headers: {
                    'X-WP-Nonce': giftCardModalSettings.nonce
                },
                success: function(response) {
                    displaySuccess(response);
                },
                error: function(xhr) {
                    let errorMessage = 'Gift card not found. Please check the code and try again.';

                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    } else if (xhr.status === 404) {
                        errorMessage = 'Gift card not found. Please verify the code is correct.';
                    } else if (xhr.status === 500) {
                        errorMessage = 'Server error. Please try again later.';
                    }

                    displayError(errorMessage);
                },
                complete: function() {
                    // Reset button state
                    $submitBtn.prop('disabled', false);
                    $submitBtn.find('.gc-btn-text').show();
                    $submitBtn.find('.gc-btn-loading').hide();
                }
            });
        }

        // Display success result
        function displaySuccess(data) {
            // Set code
            $('#gc-result-code').text(data.code);

            // Set balance
            const balance = parseFloat(data.remaining);
            $('#gc-balance').text(formatCurrency(balance));

            // Set expiry
            const expiry = data.expire_date ? formatDate(data.expire_date) : 'No expiry';
            $('#gc-expiry').text(expiry);

            // Set status badge
            const isActive = data.is_active;
            const $status = $('#gc-status');

            if (isActive && balance > 0) {
                $status.text('Active')
                    .removeClass('gc-status-inactive gc-status-used')
                    .addClass('gc-status-active');
            } else if (!isActive) {
                $status.text('Inactive')
                    .removeClass('gc-status-active gc-status-used')
                    .addClass('gc-status-inactive');
            } else if (balance <= 0) {
                $status.text('Used')
                    .removeClass('gc-status-active gc-status-inactive')
                    .addClass('gc-status-used');
            }

            // Show success
            $success.show();
            $results.slideDown(300);
        }

        // Display error result
        function displayError(message) {
            $('#gc-error-message').text(message);
            $error.show();
            $results.slideDown(300);
        }

        // Reset form
        function resetForm() {
            $input.val('');
            $results.hide();
            $success.hide();
            $error.hide();
            $submitBtn.prop('disabled', false);
            $submitBtn.find('.gc-btn-text').show();
            $submitBtn.find('.gc-btn-loading').hide();
        }

        // Helper: Format currency
        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        }

        // Helper: Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        }
    });

})(jQuery);
