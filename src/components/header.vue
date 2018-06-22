<template>
    <div class="header">
        <mu-linear-progress class="progress" size="5" color="secondary" v-if="isLoading"></mu-linear-progress>
        <mu-appbar>
            <mu-menu>
                <router-link to="/">
                    星云域名
                </router-link>
            </mu-menu>
            <mu-menu slot="right">
                <mu-button flat @click="openAlertDialog">
                    <mu-icon left value="send" color="primary"></mu-icon>
                    免费申请</mu-button>
                <mu-button flat @click="openTypeDialog" v-if="$route.name === 'admin'">
                    <mu-icon left value="clear_all"></mu-icon>
                    添加分类</mu-button>
                <mu-button flat to="/my" tag="button" :class="{hover: $route.name === 'my'}">
                    <mu-icon left value="person"></mu-icon>
                    我的域名</mu-button>
                <mu-button v-if="isAdmin" flat to="/admin" tag="button" :class="{hover: $route.name === 'admin'}">
                    <mu-icon left value="settings"></mu-icon>
                    管理</mu-button>
            </mu-menu>
        </mu-appbar>
        <mu-container fluid class="container is-stripe">
            <mu-row>
                <mu-alert color="warning" delete :show.sync="noWallet">
                    安装<a target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">星云钱包</a>使用本站所有功能！
                </mu-alert>
            </mu-row>
        </mu-container>
        <mu-container fluid class="container is-stripe" v-if="$route.name != 'home'">
            <mu-row gutter>
                <mu-col span="12">
                    <mu-breadcrumbs>
                        <mu-breadcrumbs-item to="/">首页</mu-breadcrumbs-item>
                        <mu-breadcrumbs-item disabled :to="$route.path">{{$route.meta.name}}</mu-breadcrumbs-item>
                    </mu-breadcrumbs>
                </mu-col>
            </mu-row>
        </mu-container>
    </div>
</template>

<script>
    export default {
        name: "card-header",
        props: {
            my: Boolean
        },
        data(){
            return{
                isLoading: true,
                noWallet: false,
                isAdmin: false
            }
        },
        mounted(){
            var _this = this;
            setTimeout(function(){
                _this.isAdmin = config.isAdmin;
            }, 500);
            
            _this.bus.$on('showProgress', function(bool){
                _this.isLoading = bool;
            });

            if (typeof webExtensionWallet === "undefined") {
                this.noWallet = true;
            }
        },
        methods: {
            openAlertDialog() {
                this.bus.$emit('openAlertDialog', true);
            },
            openTypeDialog(){
                this.bus.$emit('openTypeDialog', true);
            }
        }
    }
</script>

<style>
    .mu-appbar {
        border-top: 5px solid #81d8d0;
    }
    .header, .header a{
        color: #000;
    }
    .mu-appbar-title small {
        font-size: 12px;
    }
</style>
