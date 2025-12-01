/**
 * Order Form Component (order-form)
 * Komponen untuk form input Delivery Order baru
 * 
 * Features:
 * - Auto-generate DO number
 * - Package selection with details
 * - Form validation
 * - Recent orders display
 */

Vue.component('order-form', {
    template: '#tpl-order-form',

    data() {
        return {
            // Data lists
            paketList: [],
            pengirimanList: [],
            stokList: [],
            trackingList: [],

            // Form data
            formData: {
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.getTodayDate()
            },

            // Validation errors
            errors: {},

            // Recent orders in this session
            recentOrders: [],

            // UI state
            showSuccessModal: false,
            lastSavedDO: ''
        };
    },

    computed: {
        /**
         * Computed: Generate DO number automatically
         */
        generatedDONumber() {
            const year = new Date().getFullYear();
            const prefix = `DO${year}-`;
            
            let maxNum = 0;
            
            // Check existing tracking list
            this.trackingList.forEach(track => {
                if (track.noDO && track.noDO.startsWith(prefix)) {
                    const numStr = track.noDO.replace(prefix, '');
                    const num = parseInt(numStr, 10);
                    if (num > maxNum) {
                        maxNum = num;
                    }
                }
            });

            // Also check recent orders
            this.recentOrders.forEach(order => {
                if (order.noDO && order.noDO.startsWith(prefix)) {
                    const numStr = order.noDO.replace(prefix, '');
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
         * Computed: Selected package details
         */
        selectedPackage() {
            if (!this.formData.paket) return null;
            return this.paketList.find(p => p.kode === this.formData.paket);
        },

        /**
         * Computed: Total price from selected package
         */
        totalPrice() {
            return this.selectedPackage ? this.selectedPackage.harga : 0;
        },

        /**
         * Computed: Form validation status
         */
        isFormValid() {
            return this.formData.nim &&
                   this.formData.nama &&
                   this.formData.ekspedisi &&
                   this.formData.paket &&
                   this.formData.tanggalKirim;
        }
    },

    // Watchers
    watch: {
        /**
         * Watcher 1: Monitor paket selection
         */
        'formData.paket'(newVal) {
            if (newVal) {
                console.log('Package selected:', newVal);
            }
        },

        /**
         * Watcher 2: Monitor form changes for auto-validation
         */
        formData: {
            handler() {
                // Clear errors when user types
                this.errors = {};
            },
            deep: true
        }
    },

    methods: {
        /**
         * Get today's date in YYYY-MM-DD format
         */
        getTodayDate() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        /**
         * Format price to Rupiah
         */
        formatRupiah(price) {
            return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
        },

        /**
         * Format date for display (Indonesian format)
         */
        formatDateDisplay(dateStr) {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            
            const d = new Date(dateStr);
            const day = d.getDate();
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            
            return `${day} ${month} ${year}`;
        },

        /**
         * Get stock title by code
         */
        getStockTitle(kode) {
            const item = this.stokList.find(s => s.kode === kode);
            return item ? item.judul : kode;
        },

        /**
         * Get ekspedisi name
         */
        getEkspedisiName(kode) {
            const eks = this.pengirimanList.find(p => p.kode === kode);
            return eks ? `JNE ${eks.nama}` : kode;
        },

        /**
         * Validate form
         */
        validateForm() {
            this.errors = {};

            if (!this.formData.nim || this.formData.nim.trim() === '') {
                this.errors.nim = 'NIM wajib diisi';
            } else if (!/^\d+$/.test(this.formData.nim)) {
                this.errors.nim = 'NIM harus berupa angka';
            }

            if (!this.formData.nama || this.formData.nama.trim() === '') {
                this.errors.nama = 'Nama wajib diisi';
            } else if (this.formData.nama.length < 3) {
                this.errors.nama = 'Nama minimal 3 karakter';
            }

            if (!this.formData.ekspedisi) {
                this.errors.ekspedisi = 'Ekspedisi wajib dipilih';
            }

            if (!this.formData.paket) {
                this.errors.paket = 'Paket wajib dipilih';
            }

            if (!this.formData.tanggalKirim) {
                this.errors.tanggalKirim = 'Tanggal kirim wajib diisi';
            }

            return Object.keys(this.errors).length === 0;
        },

        /**
         * Submit order
         */
        submitOrder() {
            if (!this.validateForm()) {
                return;
            }

            // Create new order object
            const newOrder = {
                noDO: this.generatedDONumber,
                nim: this.formData.nim.trim(),
                nama: this.formData.nama.trim(),
                status: 'Pending',
                ekspedisi: this.formData.ekspedisi,
                tanggalKirim: this.formData.tanggalKirim,
                paket: this.formData.paket,
                total: this.totalPrice,
                perjalanan: [
                    {
                        waktu: this.getCurrentDateTime(),
                        keterangan: 'Order dibuat - Menunggu proses pengiriman'
                    }
                ]
            };

            // Add to tracking list
            this.trackingList.push(newOrder);

            // Add to recent orders
            this.recentOrders.unshift(newOrder);

            // Show success
            this.lastSavedDO = newOrder.noDO;
            this.showSuccessModal = true;

            // Reset form
            this.resetForm();

            // Emit event for parent
            this.$emit('order-added', newOrder);
        },

        /**
         * Get current datetime string
         */
        getCurrentDateTime() {
            const now = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        },

        /**
         * Reset form to initial state
         */
        resetForm() {
            this.formData = {
                nim: '',
                nama: '',
                ekspedisi: '',
                paket: '',
                tanggalKirim: this.getTodayDate()
            };
            this.errors = {};
        },

        /**
         * Load data from API
         */
        async loadData() {
            try {
                const data = await ApiService.fetchAllData();
                this.paketList = data.paket || [];
                this.pengirimanList = data.pengirimanList || [];
                this.stokList = data.stok || [];
                this.trackingList = data.tracking || [];
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
    },

    mounted() {
        this.loadData();
    }
});
