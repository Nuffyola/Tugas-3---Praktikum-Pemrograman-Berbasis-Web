/**
 * API Service - Handle data access from JSON
 * Universitas Terbuka - Sistem Bahan Ajar
 */

const ApiService = {
    dataUrl: './data/dataBahanAjar.json',
    cachedData: null,

    /**
     * Fetch all data from JSON file
     * @returns {Promise<Object>} All data from JSON
     */
    async fetchAllData() {
        if (this.cachedData) {
            return this.cachedData;
        }

        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.cachedData = await response.json();
            return this.cachedData;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    },

    /**
     * Get UPBJJ list
     * @returns {Promise<Array>} List of UPBJJ regions
     */
    async getUpbjjList() {
        const data = await this.fetchAllData();
        return data.upbjjList || [];
    },

    /**
     * Get Kategori list
     * @returns {Promise<Array>} List of categories
     */
    async getKategoriList() {
        const data = await this.fetchAllData();
        return data.kategoriList || [];
    },

    /**
     * Get Pengiriman list
     * @returns {Promise<Array>} List of shipping options
     */
    async getPengirimanList() {
        const data = await this.fetchAllData();
        return data.pengirimanList || [];
    },

    /**
     * Get Paket list
     * @returns {Promise<Array>} List of packages
     */
    async getPaketList() {
        const data = await this.fetchAllData();
        return data.paket || [];
    },

    /**
     * Get Stock data
     * @returns {Promise<Array>} Stock list
     */
    async getStokList() {
        const data = await this.fetchAllData();
        return data.stok || [];
    },

    /**
     * Get Tracking data
     * @returns {Promise<Array>} Tracking list
     */
    async getTrackingList() {
        const data = await this.fetchAllData();
        return data.tracking || [];
    },

    /**
     * Format price to Rupiah
     * @param {number} price - Price value
     * @returns {string} Formatted price with Rp prefix
     */
    formatRupiah(price) {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
    },

    /**
     * Format quantity with unit
     * @param {number} qty - Quantity value
     * @returns {string} Formatted quantity with 'buah' unit
     */
    formatQty(qty) {
        return qty + ' buah';
    },

    /**
     * Format date to Indonesian format
     * @param {Date|string} date - Date object or string
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        const d = new Date(date);
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        
        return `${day} ${month} ${year}`;
    },

    /**
     * Format datetime
     * @param {Date} date - Date object
     * @returns {string} Formatted datetime string
     */
    formatDateTime(date) {
        const d = new Date(date);
        const pad = (n) => n.toString().padStart(2, '0');
        
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },

    /**
     * Generate new DO number
     * @param {Array} existingDOs - Existing DO numbers
     * @returns {string} New DO number
     */
    generateDONumber(existingDOs) {
        const year = new Date().getFullYear();
        const prefix = `DO${year}-`;
        
        let maxNum = 0;
        existingDOs.forEach(doItem => {
            if (doItem.noDO && doItem.noDO.startsWith(prefix)) {
                const numStr = doItem.noDO.replace(prefix, '');
                const num = parseInt(numStr, 10);
                if (num > maxNum) {
                    maxNum = num;
                }
            }
        });
        
        const newNum = (maxNum + 1).toString().padStart(4, '0');
        return prefix + newNum;
    },

    /**
     * Get stock status
     * @param {number} qty - Current quantity
     * @param {number} safety - Safety stock level
     * @returns {Object} Status object with type and label
     */
    getStockStatus(qty, safety) {
        if (qty === 0) {
            return { type: 'empty', label: 'Kosong', class: 'status-danger' };
        } else if (qty < safety) {
            return { type: 'low', label: 'Menipis', class: 'status-warning' };
        } else {
            return { type: 'safe', label: 'Aman', class: 'status-safe' };
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
