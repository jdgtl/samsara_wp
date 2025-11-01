/**
 * Gift Card Balance Checker
 * JavaScript for public-facing gift card balance checker
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        const $form = $('#gift-card-checker-form');
        const $input = $('#gift-card-code');
        const $submitBtn = $('#check-balance-btn');
        const $results = $('#checker-results');
        const $successResult = $('#result-success');
        const $errorResult = $('#result-error');

        // Check balance form submission
        $form.on('submit', function(e) {
            e.preventDefault();

            const code = $input.val().trim();

            if (!code) {
                return;
            }

            // Show loading state
            $submitBtn.prop('disabled', true);
            $submitBtn.find('.button-text').hide();
            $submitBtn.find('.button-loading').show();

            // Hide previous results
            $results.hide();
            $successResult.hide();
            $errorResult.hide();

            // Make API request
            $.ajax({
                url: giftCardCheckerSettings.apiUrl + encodeURIComponent(code),
                method: 'GET',
                headers: {
                    'X-WP-Nonce': giftCardCheckerSettings.nonce
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
                    $submitBtn.find('.button-text').show();
                    $submitBtn.find('.button-loading').hide();
                }
            });
        });

        // Display success result
        function displaySuccess(data) {
            // Set code
            $('#result-code').text(data.code);

            // Set balance
            const balance = parseFloat(data.remaining);
            $('#result-balance').text(formatCurrency(balance));

            // Set expiry
            const expiry = data.expire_date ? formatDate(data.expire_date) : 'No expiry';
            $('#result-expiry').text(expiry);

            // Set status badge
            const isActive = data.is_active;
            const $statusBadge = $('#status-badge');

            if (isActive && balance > 0) {
                $statusBadge.text('Active').removeClass('status-inactive status-expired').addClass('status-active');
            } else if (!isActive) {
                $statusBadge.text('Inactive').removeClass('status-active status-expired').addClass('status-inactive');
            } else if (balance <= 0) {
                $statusBadge.text('Used').removeClass('status-active status-inactive').addClass('status-expired');
            }

            // Show success result
            $successResult.show();
            $results.fadeIn();
        }

        // Display error result
        function displayError(message) {
            $('#error-message').text(message);
            $errorResult.show();
            $results.fadeIn();
        }

        // Reset buttons
        $('#reset-btn, #reset-btn-error').on('click', function() {
            $results.fadeOut(function() {
                $successResult.hide();
                $errorResult.hide();
                $input.val('').focus();
            });
        });

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
