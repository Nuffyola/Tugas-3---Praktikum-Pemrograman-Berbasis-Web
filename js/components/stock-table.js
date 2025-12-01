/**
 * Stock Table Component (ba-stock-table)
 * Komponen untuk halaman Stok Bahan Ajar
 * 
 * Features:
 * - Display stock list with filtering and sorting
 * - Add, Edit, Delete stock items
 * - Status badge with tooltip
 * - Dependent filters (UPBJJ -> Kategori)
 */

Vue.component('ba-stock-table', {
    template: '#tpl-stock-table',

    data() {
        return {
            // Data lists
            stokList: [],
            upbjjList: [],
            kategoriList: [],

            // Filters
            filters: {
                upbjj: '',
                kategori: '',
                showLowStock: false
            },

            // Sorting
            sortBy: '',

            // Modal states
            showAddModal: false,
            showEditModal: false,
            showDeleteModal: false,

            // Form data
            formData: this.getEmptyFormData(),
            formErrors: {},

            // Item to delete
            itemToDelete: null
        };
    },

    computed: {
        /**
         * Computed: Kategori yang tersedia berdasarkan filter UPBJJ
         * Dependent option implementation
         */
        availableKategori() {
            if (!this.filters.upbjj) {
                return this.kategoriList;
            }
            
            // Get unique categories from filtered items
            const kategoris = new Set();
            this.stokList.forEach(item => {
                if (item.upbjj === this.filters.upbjj) {
                    kategoris.add(item.kategori);
                }
            });
            
            return Array.from(kategoris);
        },

        /**
         * Computed: Data yang sudah difilter dan diurutkan
         * Menggunakan computed property agar tidak perlu recompute seluruhnya
         */
        filteredAndSortedData() {
            let result = [...this.stokList];

            // Filter by UPBJJ
            if (this.filters.upbjj) {
                result = result.filter(item => item.upbjj === this.filters.upbjj);
            }

            // Filter by Kategori
            if (this.filters.kategori) {
                result = result.filter(item => item.kategori === this.filters.kategori);
            }

            // Filter by Low/Empty Stock
            if (this.filters.showLowStock) {
                result = result.filter(item => item.qty < item.safety || item.qty === 0);
            }

            // Sorting
            if (this.sortBy) {
                const [field, direction] = this.sortBy.split('-');
                const modifier = direction === 'asc' ? 1 : -1;

                result.sort((a, b) => {
                    if (field === 'judul') {
                        return modifier * a.judul.localeCompare(b.judul);
                    } else {
                        return modifier * (a[field] - b[field]);
                    }
                });
            }

            return result;
        },

        /**
         * Computed: Jumlah stok aman
         */
        safeCount() {
            return this.stokList.filter(item => item.qty >= item.safety).length;
        },

        /**
         * Computed: Jumlah stok menipis
         */
        lowCount() {
            return this.stokList.filter(item => item.qty < item.safety && item.qty > 0).length;
        },

        /**
         * Computed: Jumlah stok kosong
         */
        emptyCount() {
            return this.stokList.filter(item => item.qty === 0).length;
        },

        /**
         * Computed: Total items
         */
        totalItems() {
            return this.stokList.length;
        },

        /**
         * Computed: Validasi form
         */
        isFormValid() {
            return this.formData.kode &&
                   this.formData.judul &&
                   this.formData.kategori &&
                   this.formData.upbjj &&
                   this.formData.lokasiRak &&
                   this.formData.harga >= 0 &&
                   this.formData.qty >= 0 &&
                   this.formData.safety >= 0;
        }
    },

    // Watcher untuk monitoring perubahan data
    watch: {
        /**
         * Watcher 1: Monitor perubahan filter UPBJJ
         * Reset filter kategori jika UPBJJ berubah
         */
        'filters.upbjj'(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.filters.kategori = '';
                console.log('UPBJJ filter changed:', oldVal, '->', newVal);
            }
        },

        /**
         * Watcher 2: Monitor perubahan stok list
         * Untuk log atau trigger aksi lainnya
         */
        stokList: {
            handler(newVal) {
                console.log('Stok list updated. Total items:', newVal.length);
                // Could trigger notification atau save to localStorage
            },
            deep: true
        }
    },

    methods: {
        /**
         * Get empty form data template
         */
        getEmptyFormData() {
            return {
                kode: '',
                judul: '',
                kategori: '',
                upbjj: '',
                lokasiRak: '',
                harga: 0,
                qty: 0,
                safety: 0,
                catatanHTML: ''
            };
        },

        /**
         * Format harga ke Rupiah
         * @param {number} price - Nilai harga
         * @returns {string} Formatted string
         */
        formatRupiah(price) {
            return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
        },

        /**
         * Format jumlah dengan satuan
         * @param {number} qty - Jumlah
         * @returns {string} Formatted string
         */
        formatQty(qty) {
            return qty + ' buah';
        },

        /**
         * Toggle sorting
         * @param {string} field - Field to sort
         */
        toggleSort(field) {
            if (this.sortBy === `${field}-asc`) {
                this.sortBy = `${field}-desc`;
            } else {
                this.sortBy = `${field}-asc`;
            }
        },

        /**
         * Get sort icon
         * @param {string} field - Field name
         * @returns {string} Sort icon
         */
        getSortIcon(field) {
            if (this.sortBy === `${field}-asc`) return '▲';
            if (this.sortBy === `${field}-desc`) return '▼';
            return '⇅';
        },

        /**
         * Reset all filters
         */
        resetFilters() {
            this.filters.upbjj = '';
            this.filters.kategori = '';
            this.filters.showLowStock = false;
            this.sortBy = '';
        },

        /**
         * Validate form data
         * @returns {boolean} Is valid
         */
        validateForm() {
            this.formErrors = {};

            if (!this.formData.kode) {
                this.formErrors.kode = 'Kode wajib diisi';
            } else if (!this.showEditModal) {
                // Check duplicate only when adding new item
                const exists = this.stokList.some(item => item.kode === this.formData.kode);
                if (exists) {
                    this.formErrors.kode = 'Kode sudah ada';
                }
            }

            if (!this.formData.judul) {
                this.formErrors.judul = 'Judul wajib diisi';
            }

            if (!this.formData.kategori) {
                this.formErrors.kategori = 'Kategori wajib dipilih';
            }

            if (!this.formData.upbjj) {
                this.formErrors.upbjj = 'Region wajib dipilih';
            }

            if (!this.formData.lokasiRak) {
                this.formErrors.lokasiRak = 'Lokasi rak wajib diisi';
            }

            if (this.formData.harga < 0) {
                this.formErrors.harga = 'Harga tidak boleh negatif';
            }

            if (this.formData.qty < 0) {
                this.formErrors.qty = 'Stok tidak boleh negatif';
            }

            if (this.formData.safety < 0) {
                this.formErrors.safety = 'Safety stock tidak boleh negatif';
            }

            return Object.keys(this.formErrors).length === 0;
        },

        /**
         * Edit item - open modal with item data
         * @param {Object} item - Item to edit
         */
        editItem(item) {
            this.formData = { ...item };
            this.formErrors = {};
            this.showEditModal = true;
        },

        /**
         * Confirm delete - open confirmation modal
         * @param {Object} item - Item to delete
         */
        confirmDelete(item) {
            this.itemToDelete = item;
            this.showDeleteModal = true;
        },

        /**
         * Delete item from list
         */
        deleteItem() {
            if (this.itemToDelete) {
                const index = this.stokList.findIndex(item => item.kode === this.itemToDelete.kode);
                if (index !== -1) {
                    this.stokList.splice(index, 1);
                }
                this.itemToDelete = null;
                this.showDeleteModal = false;
            }
        },

        /**
         * Save item (add or update)
         */
        saveItem() {
            if (!this.validateForm()) {
                return;
            }

            if (this.showEditModal) {
                // Update existing item
                const index = this.stokList.findIndex(item => item.kode === this.formData.kode);
                if (index !== -1) {
                    this.$set(this.stokList, index, { ...this.formData });
                }
            } else {
                // Add new item
                this.stokList.push({ ...this.formData });
            }

            this.closeFormModal();
        },

        /**
         * Close form modal and reset
         */
        closeFormModal() {
            this.showAddModal = false;
            this.showEditModal = false;
            this.formData = this.getEmptyFormData();
            this.formErrors = {};
        },

        /**
         * Load data from API service
         */
        async loadData() {
            try {
                const data = await ApiService.fetchAllData();
                this.stokList = data.stok || [];
                this.upbjjList = data.upbjjList || [];
                this.kategoriList = data.kategoriList || [];
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
    },

    mounted() {
        this.loadData();

        // Handle Enter key for form submission
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (this.showAddModal || this.showEditModal)) {
                e.preventDefault();
                this.saveItem();
            }
        });
    }
});
