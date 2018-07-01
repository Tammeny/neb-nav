<template>
    <div class="help">
        <mu-container class="is-stripe">
            <mu-row>
                <mu-col span="12">
                    <h1>聚名片使用教程</h1>
                    <h2>1.安装星云钱包</h2>
                    <p>本站基于星云链实现，想要所有的功能则需安装星云钱包Chrome扩展插件，下载及安装教程：<a rel="nofollow" target="_blank" href="https://github.com/ChengOrangeJu/WebExtensionWallet">https://github.com/ChengOrangeJu/WebExtensionWallet</a></p>
                    <h2>2.发布名片</h2>
                    <p>完成了星云钱包的安装，就可以发布名片了。</p>
                    <p>1).点右上角的“发布名片”按钮</p>
                    <p>2).在弹窗填写内容</p>
                    <p>3).点击确定后唤起星云钱包，发起交易，等交易成功后即可查看刚刚发布的名片了。</p>
                    <h2>3.修改名片</h2>
                    <p>修改名片与发布名片类似，这里不再赘述。</p>
                    <p>如有疑问，请于管理员联系 tammeny@qq.com</p>
                </mu-col>
            </mu-row>
        </mu-container>
        <card-sidebar></card-sidebar>
        <card-dialog></card-dialog>
        <card-footer></card-footer>
    </div>
</template>

<script>
    import CardSidebar from "../components/sidebar.vue";
    import CardFooter from "../components/footer.vue";
    import CardDialog from "../components/dialog.vue";
    export default {
        data() {
            return {};
        },
        components: {
            CardSidebar,
            CardFooter,
            CardDialog
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
