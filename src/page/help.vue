<template>
    <div class="help">
        <mu-breadcrumbs>
            <mu-breadcrumbs-item to="/">首页</mu-breadcrumbs-item>
            <mu-breadcrumbs-item disabled>帮助</mu-breadcrumbs-item>
        </mu-breadcrumbs>
        <mu-container class="is-stripe">
            <mu-row>
                <mu-col span="12">
                    <h1>星云导航使用教程</h1>
                    <h2>1.安装星云钱包</h2>
                    <p>本站基于星云链实现，想要所有的功能则需安装星云钱包Chrome扩展插件，下载及安装教程：<a rel="nofollow" target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">https://github.com/ChengOrangeJu/WebExtensionWallet</a></p>
                    <h2>2.提交站点</h2>
                    <p>完成了星云钱包的安装，就可以提交站点了。</p>
                    <p>1).点击侧边栏菜单的“提交站点”按钮</p>
                    <p>2).填写站点详细内容</p>
                    <p>3).点击提交后唤起星云钱包，发起交易，等交易成功后，待管理员审核通过后，即可查看刚刚提交的站点了。</p>
                    <p>如有疑问，请于管理员联系 291558181@qq.com</p>
                </mu-col>
            </mu-row>
        </mu-container>
        <card-sidebar></card-sidebar>
        <card-footer></card-footer>
    </div>
</template>

<script>
    import CardSidebar from "../components/sidebar.vue";
    import CardFooter from "../components/footer.vue";
    export default {
        data() {
            return {};
        },
        components: {
            CardSidebar,
            CardFooter
        },
        mounted() {
            this.bus.$emit("showProgress", false);
        }
    };
</script>

<style>
    h1 {
        text-align: center;
        margin-top: 0;
    }
    
    h2 {
        font-size: 18px;
    }
    
    .el-card {
        margin-bottom: 20px;
    }
    
    .el-menu--horizontal>.el-menu-item a {
        text-decoration: none;
    }
</style>
