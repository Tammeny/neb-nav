<template>
    <mu-snackbar position="top-end" :color="snackbar.color" :open="snackbar.open">
        <mu-icon left :value="icon"></mu-icon>
        {{snackbar.message}}
        <mu-button flat slot="action" color="#fff" @click="snackbar.open = false">关闭</mu-button>
    </mu-snackbar>
</template>

<script>
    export default {
        data() {
            return {
                snackbar: {}
            }
        },
        computed: {
            icon() {
                return {
                    success: 'check_circle',
                    info: 'info',
                    warning: 'priority_high',
                    error: 'warning'
                }[this.snackbar.color]
            }
        },
        mounted: function() {
            var _this = this;
            this.bus.$on('openSnackbar', function(config) {
                _this.snackbar = config;
            })
        },
    }
</script>