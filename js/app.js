/**
 * Main Application - Vue Root Instance
 * Universitas Terbuka - Sistem Pemesanan Bahan Ajar
 * 
 * Tugas 3 - Vue.js Implementation
 */

// Initialize Vue application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    
    // Create Vue root instance
    new Vue({
        el: '#app',

        data: {
            // Current active tab
            activeTab: 'stok',

            // App info
            appTitle: 'Sistem Pemesanan Bahan Ajar',
            appSubtitle: 'Universitas Terbuka',

            // Navigation tabs
            tabs: [
                { id: 'stok', label: 'Stok Bahan Ajar', icon: '📚' },
                { id: 'tracking', label: 'Tracking DO', icon: '🔍' },
                { id: 'order', label: 'Input DO Baru', icon: '📝' }
            ],

            // Shared data that can be accessed by child components
            sharedData: {
                lastUpdate: new Date().toLocaleString('id-ID')
            }
        },

        computed: {
            /**
             * Computed: Current year for footer
             */
            currentYear() {
                return new Date().getFullYear();
            },

            /**
             * Computed: Active tab info
             */
            activeTabInfo() {
                return this.tabs.find(tab => tab.id === this.activeTab);
            }
        },

        watch: {
            /**
             * Watch: Monitor tab changes
             * Could be used for analytics or logging
             */
            activeTab(newTab, oldTab) {
                console.log(`Tab changed: ${oldTab} -> ${newTab}`);
                // Update last activity time
                this.sharedData.lastUpdate = new Date().toLocaleString('id-ID');
            }
        },

        methods: {
            /**
             * Change active tab
             * @param {string} tabId - Tab identifier
             */
            changeTab(tabId) {
                this.activeTab = tabId;
            },

            /**
             * Check if tab is active
             * @param {string} tabId - Tab identifier
             * @returns {boolean} Is active
             */
            isActiveTab(tabId) {
                return this.activeTab === tabId;
            },

            /**
             * Handle new order added from order-form component
             * @param {Object} order - New order data
             */
            handleOrderAdded(order) {
                console.log('New order added:', order);
                // Could trigger notification or update other components
            }
        },

        mounted() {
            console.log('🎓 Universitas Terbuka - Sistem Bahan Ajar');
            console.log('📚 Vue.js Application Initialized');
            console.log('-----------------------------------');
        }
    });
});
