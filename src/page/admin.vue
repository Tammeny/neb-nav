<template>
    <div class="admin">
        <card-header></card-header>
        <mu-container fluid class="container is-stripe">
            <mu-row gutter>
                <mu-col sm="6" md="6" lg="6" xl="3" v-for="(item, index) in typeList" :key="index">
                    <mu-card>
                        <mu-card-title :title="item.name"></mu-card-title>
                        <mu-card-actions>
                            <mu-button flat>域名数: {{item.cardCount}}</mu-button>
                            <mu-button class="edit-type" icon color="primary" @click="editType(item)">
                                <mu-icon value="edit"></mu-icon>
                            </mu-button>
                        </mu-card-actions>
                    </mu-card>
                </mu-col>
            </mu-row>
            <mu-dialog title="编辑行业" width="600" max-width="80%" :esc-press-close="false" :overlay-close="false" :open.sync="openAlert">
                <mu-text-field full-width label="行业名称" v-model="form.name"></mu-text-field>
                <mu-text-field full-width label="行业别名" v-model="form.cname"></mu-text-field>
                <mu-button slot="actions" flat @click="closeAlertDialog">取消</mu-button>
                <mu-button slot="actions" color="primary" @click="addType(form)">确定</mu-button>
            </mu-dialog>
        </mu-container>
        <card-dialog></card-dialog>
        <card-footer></card-footer>
    </div>
</template>

<script>
    import CardHeader from "../components/header.vue";
    import CardFooter from "../components/footer.vue";
    import CardDialog from "../components/dialog.vue";
    export default {
        data() {
            return {
                openAlert: false,
                typeList: [],
                form: {
                    name: ""
                }
            };
        },
        components: {
            CardHeader,
            CardFooter,
            CardDialog
        },
        created: function() {
            var _this = this;
            this.bus.$on('typeList', function(typeList) {
                _this.typeList = typeList;
                _this.bus.$emit("showProgress", false);
            });
            this.bus.$on('openTypeDialog', function(bool) {
                _this.openAlert = bool;
            });
        },
        methods: {
            closeAlertDialog() {
                this.openAlert = false;
            },
            //编辑行业
            editType: function(type){
                this.form = type;
                //标出是更新操作
                this.form.update = true;
                this.bus.$emit('openTypeDialog', true);
            },
            //添加行业
            addType: function(form) {
                var _this = this;
                var data = [{
                    name: form.name,
                    cname: form.cname,
                    update: form.update
                }];
                console.info("准备要提交的数据是:", data);
                var serialNumber = nebPay.call(
                    config.contractAddress,
                    0,
                    "addType",
                    JSON.stringify(data), {
                        callback: config.payApi,
                        listener: function(value) {
                            console.info("正在获取", value);
                            if (!value.txhash) {
                                _this.bus.$emit('openSnackbar', {
                                    color: 'warning',
                                    message: '已取消发布！',
                                    open: true,
                                    timeout: 3000,
                                    position: 'top-end'
                                });
                                return;
                            }
                            _this.bus.$emit('openSnackbar', {
                                color: 'success',
                                message: '已提交，正在获取结果...',
                                open: true,
                                timeout: 60000,
                                position: 'top-end'
                            });
                            _this.bus.$emit('openTypeDialog', false);
                            _this.checkTransaction(value.txhash);
                        }
                    }
                );
            },
            //查询交易状态
            checkTransaction: function(hash) {
                var _this = this;
                var timer = setInterval(function() {
                    nebApi
                        .getTransactionReceipt({
                            hash: hash
                        })
                        .then(function(res) {
                            var result = res;
                            console.info(result);
                            if (result.status === 1) {
                                _this.bus.$emit('openSnackbar', {
                                    color: 'success',
                                    message: '发布成功',
                                    open: true,
                                    timeout: 60000,
                                    position: 'top-end'
                                });
                                clearInterval(timer);
                                location.reload();
                            }else if (result.status === 0){
                                clearInterval(timer);
                                _this.bus.$emit('openSnackbar', {
                                    color: 'error',
                                    message: result.execute_result,
                                    open: true,
                                    timeout: 60000,
                                    position: 'top-end'
                                });
                            }
                        });
                }, 6000);
            }
        }
    };
</script>

<style>
    body,.admin{
        min-height: 100vh;
    }
    .admin{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .container {
        flex-grow: 1;
    }
    .progress{
        position: absolute;
        top: 0;
    }
    .mu-card-text {
        padding-top: 0;
    }
    
    .mu-card-title {
        font-size: 18px;
    }
    
    .container>.row>.col{
        padding-top: 8px;
    }
    .admin .edit-type{
        position: absolute;
        right: 0;
        bottom: 2px;
    }
</style>
