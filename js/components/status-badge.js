/**
 * Status Badge Component
 * Komponen untuk menampilkan status stok dengan tooltip
 * 
 * Props:
 * - qty: Jumlah stok saat ini
 * - safety: Jumlah safety stock
 * - tooltip: Catatan HTML yang ditampilkan di tooltip
 */

Vue.component('status-badge', {
    template: '#tpl-status-badge',
    
    props: {
        qty: {
            type: Number,
            required: true
        },
        safety: {
            type: Number,
            required: true
        },
        tooltip: {
            type: String,
            default: ''
        }
    },

    computed: {
        /**
         * Menentukan class CSS berdasarkan status stok
         * @returns {string} CSS class name
         */
        statusClass() {
            if (this.qty === 0) {
                return 'status-danger';
            } else if (this.qty < this.safety) {
                return 'status-warning';
            } else {
                return 'status-safe';
            }
        },

        /**
         * Menentukan label status
         * @returns {string} Status label
         */
        statusLabel() {
            if (this.qty === 0) {
                return 'Kosong';
            } else if (this.qty < this.safety) {
                return 'Menipis';
            } else {
                return 'Aman';
            }
        },

        /**
         * Menentukan icon status
         * @returns {string} Status icon (emoji/symbol)
         */
        statusIcon() {
            if (this.qty === 0) {
                return '❌';
            } else if (this.qty < this.safety) {
                return '⚠️';
            } else {
                return '✅';
            }
        }
    }
});
