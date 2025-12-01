/**
 * App Modal Component
 * Komponen modal yang dapat digunakan ulang untuk berbagai keperluan
 * 
 * Props:
 * - show: Boolean untuk menampilkan/menyembunyikan modal
 * - title: Judul modal
 * - confirmText: Teks tombol konfirmasi
 * - showFooter: Menampilkan footer dengan tombol
 * - maxWidth: Lebar maksimum modal
 * - confirmDisabled: Menonaktifkan tombol konfirmasi
 * 
 * Events:
 * - close: Emit saat modal ditutup
 * - confirm: Emit saat tombol konfirmasi diklik
 */

Vue.component('app-modal', {
    template: '#tpl-app-modal',
    
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: 'Modal'
        },
        confirmText: {
            type: String,
            default: 'Simpan'
        },
        showFooter: {
            type: Boolean,
            default: true
        },
        maxWidth: {
            type: String,
            default: '500px'
        },
        confirmDisabled: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        /**
         * Handle penutupan modal
         */
        handleClose() {
            this.$emit('close');
        },

        /**
         * Handle konfirmasi
         */
        handleConfirm() {
            this.$emit('confirm');
        }
    },

    watch: {
        /**
         * Watch perubahan show untuk mengontrol scroll body
         * @param {boolean} newVal - Nilai baru
         */
        show(newVal) {
            if (newVal) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    },

    mounted() {
        // Handle keyboard escape untuk menutup modal
        document.addEventListener('keydown', this.handleKeydown);
    },

    beforeDestroy() {
        document.removeEventListener('keydown', this.handleKeydown);
        document.body.style.overflow = '';
    },

    created() {
        this.handleKeydown = (e) => {
            if (e.key === 'Escape' && this.show) {
                this.handleClose();
            }
        };
    }
});
