<?php
/**
 * Customize Gift Card Display on Checkout Page
 * Makes gift card line items look beautiful with structured layout
 * Uses JavaScript injection similar to gift subscriptions
 */

add_action('wp_footer', 'samsara_add_gift_card_display_script', 10);

function samsara_add_gift_card_display_script() {
    // Only run on checkout
    if (!is_checkout()) {
        return;
    }

    // Check if WooCommerce Gift Cards is active
    if (!class_exists('WC_GC_Gift_Card_Product')) {
        return;
    }

    // Get cart items and collect gift card data
    $cart = WC()->cart->get_cart();
    $gift_card_data = array();

    foreach ($cart as $cart_item_key => $cart_item) {
        $product = $cart_item['data'];

        // Check if this is a gift card
        if (WC_GC_Gift_Card_Product::is_gift_card($product)) {
            // Debug: log all keys to see what's available
            error_log('Gift Card Cart Item Keys: ' . print_r(array_keys($cart_item), true));

            // Handle both single and multiple recipient modes
            $to = '';
            if (isset($cart_item['wc_gc_giftcard_to'])) {
                $to = $cart_item['wc_gc_giftcard_to'];
            } elseif (isset($cart_item['wc_gc_giftcard_to_multiple'])) {
                // Multiple recipients - it's an array, join them
                $to_multiple = $cart_item['wc_gc_giftcard_to_multiple'];
                if (is_array($to_multiple)) {
                    $to = implode(', ', $to_multiple);
                } else {
                    $to = $to_multiple;
                }
            }

            $gift_card_data[$cart_item_key] = array(
                'to' => $to,
                'from' => isset($cart_item['wc_gc_giftcard_from']) ? $cart_item['wc_gc_giftcard_from'] : '',
                'message' => isset($cart_item['wc_gc_giftcard_message']) ? $cart_item['wc_gc_giftcard_message'] : '',
                'amount' => isset($cart_item['wc_gc_giftcard_amount']) ? wc_price($cart_item['wc_gc_giftcard_amount']) : '',
                'sku' => $product->get_sku(),
            );

            error_log('Gift Card Data Collected: ' . print_r($gift_card_data[$cart_item_key], true));
        }
    }

    // If no gift cards, exit
    if (empty($gift_card_data)) {
        return;
    }

    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        var giftCardData = <?php echo wp_json_encode($gift_card_data); ?>;

        console.log('Samsara Gift Card Display: Initializing', giftCardData);

        // Function to enhance gift card display
        function enhanceGiftCardDisplay() {
            var $tables = $('.woocommerce-checkout-review-order-table, #order_review table');
            console.log('Found tables:', $tables.length);

            $tables.find('tbody tr.cart_item').each(function() {
                var $row = $(this);
                console.log('Processing cart item row');

                // Skip if already enhanced
                if ($row.data('gift-card-enhanced')) {
                    console.log('Already enhanced, skipping');
                    return;
                }

                // Find cart item key - try multiple methods
                var cartItemKey = null;

                // Method 1: Remove button
                var $removeBtn = $row.find('a.remove[data-cart_item_key]');
                if ($removeBtn.length) {
                    cartItemKey = $removeBtn.attr('data-cart_item_key');
                    console.log('Found cart key via remove button:', cartItemKey);
                }

                // Method 2: Quantity input
                if (!cartItemKey) {
                    var $qtyInput = $row.find('input[name*="cart["]');
                    if ($qtyInput.length) {
                        var nameAttr = $qtyInput.attr('name');
                        var match = nameAttr.match(/cart\[([^\]]+)\]/);
                        if (match) {
                            cartItemKey = match[1];
                            console.log('Found cart key via qty input:', cartItemKey);
                        }
                    }
                }

                // Method 3: Check all data attributes and dump row HTML
                if (!cartItemKey) {
                    console.log('Row HTML:', $row.get(0).outerHTML.substring(0, 500));
                    $.each($row.get(0).attributes, function(i, attrib) {
                        console.log('Row attribute:', attrib.name, '=', attrib.value);
                    });
                }

                // Method 4: Just match based on product name containing gift card keywords
                // Since we can't get the cart key, let's just check if this row is a gift card
                if (!cartItemKey && Object.keys(giftCardData).length > 0) {
                    var productText = $row.find('.product-name, td:first').text().toLowerCase();
                    console.log('Product text:', productText);
                    if (productText.indexOf('gift card') !== -1 || productText.indexOf('gift-card') !== -1) {
                        // Use the first (and likely only) gift card in the data
                        cartItemKey = Object.keys(giftCardData)[0];
                        console.log('Matched gift card by product name, using key:', cartItemKey);
                    }
                }

                console.log('Final cart item key:', cartItemKey);
                console.log('Have gift card data for this key?', cartItemKey && giftCardData[cartItemKey] ? 'YES' : 'NO');

                // If this is a gift card, enhance it
                if (cartItemKey && giftCardData[cartItemKey]) {
                    console.log('Samsara Gift Card: Enhancing display for', cartItemKey);

                    var data = giftCardData[cartItemKey];
                    var $productCell = $row.find('.product-name, td:first');

                    // Remove all existing gift card meta text nodes and elements
                    // Find and remove text containing "To:", "From:", "Message:", "× 1", etc.
                    $productCell.contents().filter(function() {
                        if (this.nodeType === 3) { // Text node
                            var text = $(this).text().trim();
                            // Remove text nodes with meta info or just whitespace/nbsp
                            return text.match(/To:|From:|Message:|×\s*\d+/i) || text === '' || text === '\u00A0';
                        }
                        return false;
                    }).remove();

                    // Remove quantity element and any dl, dd, dt elements
                    $productCell.find('.product-quantity, strong.product-quantity, dl, dd, dt').remove();

                    // Build beautiful details HTML
                    var detailsHtml = '<div class="gift-card-checkout-enhanced">';

                    // Add SKU if available
                    if (data.sku) {
                        detailsHtml += '<div class="gift-card-sku">SKU: ' + data.sku + '</div>';
                    }

                    // Add details box
                    detailsHtml += '<div class="gift-card-details">';

                    if (data.to) {
                        detailsHtml += '<div class="gift-card-detail-row">';
                        detailsHtml += '<span class="label">To:</span>';
                        detailsHtml += '<span class="value">' + data.to + '</span>';
                        detailsHtml += '</div>';
                    }

                    if (data.from) {
                        detailsHtml += '<div class="gift-card-detail-row">';
                        detailsHtml += '<span class="label">From:</span>';
                        detailsHtml += '<span class="value">' + data.from + '</span>';
                        detailsHtml += '</div>';
                    }

                    if (data.message) {
                        detailsHtml += '<div class="gift-card-detail-row">';
                        detailsHtml += '<span class="label">Message:</span>';
                        detailsHtml += '<span class="value">' + data.message + '</span>';
                        detailsHtml += '</div>';
                    }

                    if (data.amount) {
                        detailsHtml += '<div class="gift-card-detail-row">';
                        detailsHtml += '<span class="label">Amount:</span>';
                        detailsHtml += '<span class="value">' + data.amount + '</span>';
                        detailsHtml += '</div>';
                    }

                    detailsHtml += '</div></div>'; // Close details and wrapper

                    // Append our beautiful details after the product name/link
                    $productCell.append(detailsHtml);
                    $row.data('gift-card-enhanced', true);
                }
            });
        }

        // Add CSS
        var css = `
            <style>
            /* Make product-name cell flex when it contains a gift card */
            td.product-name:has(.gift-card-checkout-enhanced) {
                display: flex !important;
                flex-direction: column !important;
                gap: 4px;
            }

            /* Move product total to top right */
            tr.cart_item:has(.gift-card-checkout-enhanced) td.product-total {
                vertical-align: top;
                padding-top: 8px;
            }

            .gift-card-checkout-enhanced {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                display: block;
                width: 100%;
            }

            .gift-card-sku {
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
            }

            .gift-card-details {
                background: #f5f5f5;
                padding: 12px;
                border-radius: 6px;
                margin-top: 4px;
            }

            .gift-card-detail-row {
                display: flex;
                padding: 4px 0;
                font-size: 14px;
                line-height: 1.5;
            }

            .gift-card-detail-row .label {
                font-weight: 600;
                color: #666;
                min-width: 80px;
                flex-shrink: 0;
            }

            .gift-card-detail-row .value {
                color: #1a1a1a;
                word-break: break-word;
            }

            /* Make sure product name and image don't interfere */
            .wcf-product-image .wcf-product-name {
                display: block;
                margin-bottom: 8px;
            }

            @media (max-width: 768px) {
                .gift-card-detail-row {
                    flex-direction: column;
                }

                .gift-card-detail-row .label {
                    min-width: auto;
                    margin-bottom: 2px;
                }
            }
            </style>
        `;

        $('head').append(css);

        // Run on page load
        enhanceGiftCardDisplay();

        // Re-run on AJAX updates
        $(document.body).on('updated_checkout', function() {
            console.log('Samsara Gift Card: Checkout updated, re-enhancing');
            enhanceGiftCardDisplay();
        });
    });
    </script>
    <?php
}
