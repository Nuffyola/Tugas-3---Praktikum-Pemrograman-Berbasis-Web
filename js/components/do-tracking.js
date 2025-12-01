/**
 * DO Tracking Component (do-tracking)
 * Komponen untuk halaman Tracking Delivery Order
 * 
 * Features:
 * - Search by DO number or NIM
 * - Display tracking details with timeline
 * - Add progress to tracking
 * - Keyboard shortcuts (Enter to search, Esc to reset)
 */

Vue.component('do-tracking', {
    template: '#tpl-do-tracking',

    data() {
        return {
            // Data
            trackingList: [],
            paketList: [],
            pengirimanList: [],
            stokList: [],

            // Search
            searchQuery: '',
            searchActive: false,

            // Progress inputs for each DO
            progressInputs: {}
        };
    },

    computed: {
        /**
         * Computed: Daftar tracking yang ditampilkan
         * Filtered berdasarkan search query
         */
        displayedTrackingList() {
            if (!this.searchActive || !this.searchQuery) {
                return this.trackingList;
            }

            const query = this.searchQuery.toLowerCase().trim();
            return this.trackingList.filter(track => {
                return track.noDO.toLowerCase().includes(query) ||
                       track.nim.toLowerCase().includes(query);
            });
        }
    },

    // Watchers
    watch: {
        /**
         * Watcher 1: Monitor searchQuery changes
         * Reset searchActive when query is cleared
         */
        searchQuery(newVal) {
            if (!newVal) {
                this.searchActive = false;
            }
        },

        /**
         * Watcher 2: Monitor tracking list for changes
         */
        trackingList: {
            handler(newVal) {
                console.log('Tracking list updated:', newVal.length, 'items');
            },
            deep: true
        }
    },

    methods: {
        /**
         * Format harga ke Rupiah
         */
        formatRupiah(price) {
            return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
        },

        /**
         * Format tanggal ke format Indonesia
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
         * Get nama ekspedisi dari kode
         */
        getEkspedisiName(kode) {
            const ekspedisi = this.pengirimanList.find(p => p.kode === kode);
            return ekspedisi ? `JNE ${ekspedisi.nama}` : kode;
        },

        /**
         * Get package details by code
         */
        getPackageDetails(paketKode) {
            return this.paketList.find(p => p.kode === paketKode);
        },

        /**
         * Get stock title by code
         */
        getStockTitle(kode) {
            const item = this.stokList.find(s => s.kode === kode);
            return item ? item.judul : kode;
        },

        /**
         * Get status CSS class
         */
        getStatusClass(status) {
            switch (status.toLowerCase()) {
                case 'terkirim':
                    return 'status-safe';
                case 'dalam perjalanan':
                    return 'status-warning';
                case 'pending':
                    return 'status-danger';
                default:
                    return 'status-info';
            }
        },

        /**
         * Perform search
         */
        performSearch() {
            if (this.searchQuery.trim()) {
                this.searchActive = true;
            }
        },

        /**
         * Reset search
         */
        resetSearch() {
            this.searchQuery = '';
            this.searchActive = false;
        },

        /**
         * Add progress to tracking
         */
        addProgress(track) {
            const keterangan = this.progressInputs[track.noDO];
            
            if (!keterangan || !keterangan.trim()) {
                alert('Silakan masukkan keterangan progress');
                return;
            }

            // Get current time
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            const waktu = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

            // Add to perjalanan array
            track.perjalanan.push({
                waktu: waktu,
                keterangan: keterangan.trim()
            });

            // Clear input
            this.$set(this.progressInputs, track.noDO, '');
        },

        /**
         * Load data from API service
         */
        async loadData() {
            try {
                const data = await ApiService.fetchAllData();
                this.trackingList = data.tracking || [];
                this.paketList = data.paket || [];
                this.pengirimanList = data.pengirimanList || [];
                this.stokList = data.stok || [];

                // Initialize progress inputs
                this.trackingList.forEach(track => {
                    this.$set(this.progressInputs, track.noDO, '');
                });
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
    },

    mounted() {
        this.loadData();
    }
});
