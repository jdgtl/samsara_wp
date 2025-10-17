<?php
/**
 * Samsara Custom Dashboard
 *
 * Custom dashboard focused on membership status and training programs.
 *
 * @package Samsara
 * @version 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Debug: Add a simple indicator that this template is loading
echo '<!-- Custom Dashboard Template Loaded -->' . PHP_EOL;

// Get current user data
$current_user = wp_get_current_user();
$user_id = get_current_user_id();

// Get user registration date
$user_registered = get_userdata( $user_id )->user_registered;
$member_since = date( 'F Y', strtotime( $user_registered ) );

// Get user's active memberships
$active_memberships = array();
$has_basecamp = false;
$has_athlete_team = false;

if ( function_exists( 'wc_memberships_get_user_active_memberships' ) ) {
    $user_memberships = wc_memberships_get_user_active_memberships( $user_id );

    foreach ( $user_memberships as $membership ) {
        $plan = $membership->get_plan();
        $plan_name = strtolower( $plan->get_name() );

        // Check for basecamp or athlete team memberships
        if ( stripos( $plan_name, 'basecamp' ) !== false ) {
            $has_basecamp = true;
            $active_memberships[] = array(
                'name' => $plan->get_name(),
                'type' => 'basecamp',
                'start_date' => $membership->get_start_date(),
                'end_date' => $membership->get_end_date(),
                'status' => $membership->get_status()
            );
        } elseif ( stripos( $plan_name, 'athlete' ) !== false || stripos( $plan_name, 'team' ) !== false ) {
            $has_athlete_team = true;
            $active_memberships[] = array(
                'name' => $plan->get_name(),
                'type' => 'athlete_team',
                'start_date' => $membership->get_start_date(),
                'end_date' => $membership->get_end_date(),
                'status' => $membership->get_status()
            );
        }
    }
}
?>

<div class="samsara-dashboard">
    <!-- Welcome Header -->
    <div class="dashboard-header">
        <div class="welcome-section">
            <h1 class="welcome-title">Welcome back, <?php echo esc_html( $current_user->display_name ); ?>!</h1>
            <p class="member-since">Member since <?php echo esc_html( $member_since ); ?></p>
        </div>
        <div class="logout-section">
            <a href="<?php echo esc_url( wc_logout_url() ); ?>" class="logout-link">
                <i class="fas fa-sign-out-alt"></i> Log out
            </a>
        </div>
    </div>

    <!-- Membership Status Section -->
    <div class="membership-status-section">
        <h2 class="section-title">
            <i class="fas fa-star"></i>
            Your Training Memberships
        </h2>

        <?php if ( ! empty( $active_memberships ) ) : ?>
            <div class="membership-cards">
                <?php foreach ( $active_memberships as $membership ) : ?>
                    <div class="membership-card <?php echo esc_attr( $membership['type'] ); ?>-card">
                        <div class="membership-header">
                            <h3><?php echo esc_html( $membership['name'] ); ?></h3>
                            <span class="membership-status active">Active</span>
                        </div>
                        <div class="membership-details">
                            <p><i class="fas fa-calendar-alt"></i> Started: <?php echo esc_html( date( 'M j, Y', strtotime( $membership['start_date'] ) ) ); ?></p>
                            <?php if ( $membership['end_date'] ) : ?>
                                <p><i class="fas fa-calendar-check"></i> Expires: <?php echo esc_html( date( 'M j, Y', strtotime( $membership['end_date'] ) ) ); ?></p>
                            <?php else : ?>
                                <p><i class="fas fa-infinity"></i> No expiration</p>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else : ?>
            <div class="no-memberships">
                <div class="no-memberships-icon">
                    <i class="fas fa-star-of-life"></i>
                </div>
                <h3>No Active Memberships</h3>
                <p>Start your training journey with one of our membership programs.</p>
            </div>
        <?php endif; ?>
    </div>

    <!-- Basecamp Access Section -->
    <div class="basecamp-section">
        <?php if ( $has_basecamp ) : ?>
            <div class="basecamp-access-card">
                <div class="basecamp-header">
                    <h3><i class="fas fa-video"></i> Basecamp Training Platform</h3>
                    <span class="access-badge">Access Granted</span>
                </div>
                <p>Access your exclusive training videos and content on the Basecamp platform.</p>
                <a href="https://videos.samsaraexperience.com" target="_blank" class="basecamp-btn">
                    <i class="fas fa-external-link-alt"></i>
                    Access Basecamp Training
                </a>
            </div>
        <?php else : ?>
            <div class="basecamp-upgrade-card">
                <div class="upgrade-header">
                    <h3><i class="fas fa-mountain"></i> Unlock Basecamp Training</h3>
                    <span class="upgrade-badge">Available</span>
                </div>
                <p>Get access to exclusive training videos, detailed workout programs, and expert coaching content.</p>
                <a href="https://samsaraexperience.com/training-basecamp/" class="upgrade-btn">
                    <i class="fas fa-arrow-up"></i>
                    Learn About Basecamp
                </a>
            </div>
        <?php endif; ?>
    </div>
</div>

<style>
.samsara-dashboard {
    font-family: "Montserrat", Sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

/* Dashboard Header */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
}

.welcome-title {
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: white;
}

.member-since {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0;
}

.logout-link {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.logout-link:hover {
    color: white;
}

/* Section Titles */
.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.section-title i {
    color: #E2B72D;
    font-size: 1.3rem;
}

/* Membership Status Section */
.membership-status-section {
    margin-bottom: 3rem;
}

.membership-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
}

.membership-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border-left: 4px solid #E2B72D;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.membership-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.basecamp-card {
    border-left-color: #667eea;
}

.athlete_team-card {
    border-left-color: #764ba2;
}

.membership-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.membership-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
}

.membership-status {
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.membership-status.active {
    background: #d4edda;
    color: #155724;
}

.membership-details p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
}

.membership-details i {
    color: #E2B72D;
    margin-right: 0.5rem;
    width: 16px;
}

/* No Memberships State */
.no-memberships {
    text-align: center;
    padding: 3rem 2rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 2px dashed #dee2e6;
}

.no-memberships-icon {
    font-size: 3rem;
    color: #6c757d;
    margin-bottom: 1rem;
}

.no-memberships h3 {
    color: #333;
    margin-bottom: 0.5rem;
}

.no-memberships p {
    color: #666;
    margin: 0;
}

/* Basecamp Section */
.basecamp-section {
    margin-bottom: 3rem;
}

.basecamp-access-card, .basecamp-upgrade-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border: 2px solid;
}

.basecamp-access-card {
    border-color: #28a745;
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
}

.basecamp-upgrade-card {
    border-color: #E2B72D;
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.basecamp-header, .upgrade-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.basecamp-header h3, .upgrade-header h3 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: #333;
}

.access-badge {
    background: #28a745;
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.upgrade-badge {
    background: #E2B72D;
    color: #000;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.basecamp-btn, .upgrade-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #333;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.basecamp-btn:hover {
    background: #E2B72D;
    color: #000;
    transform: translateY(-2px);
    text-decoration: none;
}

.upgrade-btn:hover {
    background: #E2B72D;
    color: #000;
    transform: translateY(-2px);
    text-decoration: none;
}

/* Quick Actions */
.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.quick-action-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.quick-action-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    border-color: #E2B72D;
    text-decoration: none;
    color: #333;
}

.quick-action-card i {
    font-size: 2rem;
    color: #E2B72D;
    margin-bottom: 0.5rem;
}

.quick-action-card span {
    font-weight: 600;
    text-align: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .welcome-title {
        font-size: 1.8rem;
    }

    .membership-cards {
        grid-template-columns: 1fr;
    }

    .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .basecamp-header, .upgrade-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
}
</style>

<?php
/**
 * My Account dashboard.
 *
 * @since 2.6.0
 */
do_action( 'woocommerce_account_dashboard' );

/* Omit closing PHP tag at the end of PHP files to avoid "headers already sent" issues. */
