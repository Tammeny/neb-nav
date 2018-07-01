<template>
    <div class="sidebar">
        <mu-button color="primary" class="menu" @click="openSidebar">
            <mu-icon value="menu"></mu-icon>
        </mu-button>
        <mu-drawer :open.sync="drawer.open" :docked="drawer.docked">
            <mu-list>
                <br>
                <mu-list-item button to="/">
                    <mu-list-item-action>
                        <mu-avatar>
                            <img src="../assets/nas.link.jpg">
                        </mu-avatar>
                    </mu-list-item-action>
                    <mu-list-item-title>星云导航</mu-list-item-title>
                </mu-list-item><br><br>
                <mu-list-item button to="/submit">
                    <mu-list-item-action>
                        <mu-icon value="send"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>提交站点</mu-list-item-title>
                </mu-list-item>
                <mu-list-item button to="/my">
                    <mu-list-item-action>
                        <mu-icon value="person"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>我的站点</mu-list-item-title>
                </mu-list-item>
                <mu-list-item v-if="isAdmin" button to="/admin">
                    <mu-list-item-action>
                        <mu-icon value="settings"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>管理</mu-list-item-title>
                </mu-list-item>
            </mu-list>
        </mu-drawer>
    </div>
</template>

<script>
    export default {
        name: "card-sidebar",
        props: {
            my: Boolean
        },
        data() {
            return {
                drawer: {
                    docked: false,
                    open: false
                },
                isLoading: true,
                isAdmin: false
            }
        },
        mounted() {
            var _this = this;
            setTimeout(function() {
                _this.isAdmin = config.isAdmin;
            }, 500);
    
            _this.bus.$on('showProgress', function(bool) {
                _this.isLoading = bool;
            });
        },
        methods: {
            openSidebar(){
                this.drawer.open = true;
            }
        }
    }
</script>

<style>
    .sidebar,
    .sidebar a {
        color: #000;
    }
    .sidebar .menu{
        position: fixed;
        left: -1px;
        top: 100px;
        min-width: auto;
    }
    .sidebar .menu .mu-button-wrapper{
        padding: 0 10px;
    }
    .mu-appbar-title small {
        font-size: 12px;
    }
</style>
