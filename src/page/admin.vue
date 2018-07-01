<template>
    <div class="admin">
        <mu-linear-progress class="progress" size="5" color="secondary" v-if="isLoading"></mu-linear-progress>
        <mu-breadcrumbs>
            <mu-breadcrumbs-item to="/">首页</mu-breadcrumbs-item>
            <mu-breadcrumbs-item disabled>管理</mu-breadcrumbs-item>
        </mu-breadcrumbs>
        <mu-container class="is-stripe">
            <h2>分类</h2>
            <mu-row gutter>
                <mu-col sm="6" md="6" lg="6" xl="3">
                    <mu-tooltip content="添加分类" placement="right">
                        <mu-button middle fab color="gray" @click="openAlertDialog">
                            <mu-icon value="playlist_add"></mu-icon>
                        </mu-button>
                    </mu-tooltip>
                </mu-col>
                <mu-col sm="6" md="6" lg="6" xl="3" v-for="(item, index) in typeList" :key="index">
                    <mu-card>
                        <mu-card-title :title="item.name"></mu-card-title>
                        <mu-card-actions>
                            <mu-button flat>站点数: {{item.cardCount}}</mu-button>
                            <mu-tooltip content="编辑分类" placement="top">
                                <mu-button class="edit-type" icon color="primary" @click="editType(item)">
                                    <mu-icon value="edit"></mu-icon>
                                </mu-button>
                            </mu-tooltip>
                        </mu-card-actions>
                    </mu-card>
                </mu-col>
            </mu-row>
            <h2>站点</h2>
            <mu-row gutter>
                <mu-col sm="6" md="6" lg="6" xl="3" v-for="(item, index) in cardList" :key="index">
                    <mu-card>
                        <mu-card-title :title="item.name" :sub-title="item.domain"></mu-card-title>
                        <mu-card-text>
                            {{item.introduce}}
                        </mu-card-text>
                        <mu-tooltip content="查看详情" placement="top">
                            <mu-button class="show-card" icon @click="showDetail(true, item)" color="primary">
                                <mu-icon value="search"></mu-icon>
                            </mu-button>
                        </mu-tooltip>
                        <mu-tooltip :content="item.isReview ? '已审核': '审核'" placement="top">
                            <mu-button class="review-card" icon :disabled="item.isReview" color="primary" @click="reviewCard(item.hash)">
                                <mu-icon value="done"></mu-icon>
                            </mu-button>
                        </mu-tooltip>
                        <mu-tooltip :content="item.isRemove ? '已删除': '删除'" placement="top">
                            <mu-button class="delete-card" icon :disabled="item.isRemove" color="error" @click="removeCard(item.hash)">
                                <mu-icon value="delete"></mu-icon>
                            </mu-button>
                        </mu-tooltip>
                    </mu-card>
                </mu-col>
            </mu-row>
            <mu-dialog :title="`${form.update?'编辑':'添加'}分类`" width="600" max-width="80%" :esc-press-close="false" :overlay-close="false" :open.sync="openAlert">
                <mu-text-field full-width label="分类名称" v-model="form.name"></mu-text-field>
                <mu-text-field full-width label="分类别名" v-model="form.cname"></mu-text-field>
                <mu-button slot="actions" flat @click="closeAlertDialog">取消</mu-button>
                <mu-button slot="actions" color="primary" @click="addType(form)">确定</mu-button>
            </mu-dialog>
        </mu-container>
        <card-sidebar></card-sidebar>
        <card-detail></card-detail>
        <card-footer></card-footer>
    </div>
</template>

<script>
    import CardSidebar from "../components/sidebar.vue";
    import CardDetail from "../components/detail.vue";
    import CardFooter from "../components/footer.vue";
    export default {
        data() {
            return {
                pagination: {
                    show: false,
                    loading: false,
                    limit: 16,
                    offset: -1,
                    text: "加载更多"
                },
                isLoading: true,
                openAlert: false,
                typeList: [],
                cardList: [],
                form: {
                    name: "",
                    update: false
                }
            };
        },
        components: {
            CardSidebar,
            CardDetail,
            CardFooter
        },
        created: function() {
            var _this = this;
            this.fetAllCard(this.pagination.limit, this.pagination.offset);
            this.fetchAllType();
        },
        methods: {
            openAlertDialog() {
                this.openAlert = true;
            },
            closeAlertDialog() {
                this.openAlert = false;
            },
            //获取所有分类
            fetchAllType: function() {
                var _this = this;
                nebApi
                    .call({
                        chainID: config.nebState.chain_id,
                        from: config.contractAddress,
                        to: config.contractAddress,
                        value: 0,
                        // nonce: nonce,
                        gasPrice: 1000000,
                        gasLimit: 2000000,
                        contract: {
                            function: "allType"
                        }
                    })
                    .then(function(res) {
                        console.info(res);
                        if (!res) {
                            return;
                        }
                        if (res.result && res.result !== "null") {
                            var result = JSON.parse(res.result);
                            _this.typeList = result.types;
                        } else {
                            _this.bus.$emit('openSnackbar', {
                                color: 'error',
                                message: res.execute_err,
                                open: true,
                                timeout: 3000,
                                position: 'top-end'
                            });
                        }
                        _this.isLoading = false;
                    }).catch(function(err) {
                        _this.bus.$emit('openSnackbar', {
                            color: 'error',
                            message: "星云主网发生错误：" + err + ". 请刷新重试",
                            open: true,
                            timeout: 3000,
                            position: 'top-end'
                        });
                    });
            },
            //获取域名列表
            fetAllCard: function(limit, offset) {
                var _this = this;
                console.info(limit, offset);
                nebApi.getNebState().then(function(state) {
                    nebApi
                        .call({
                            chainID: config.nebState.chain_id,
                            from: config.address,
                            to: config.contractAddress,
                            value: 0,
                            // nonce: nonce,
                            gasPrice: 1000000,
                            gasLimit: 2000000,
                            contract: {
                                function: "getAllCardByUser",
                                args: JSON.stringify([false, limit, offset])
                            }
                        })
                        .then(function(res) {
                            console.info(res);
                            if (!res) {
                                return;
                            }
                            if (res.result && res.result !== "null") {
                                var result = JSON.parse(res.result);
                                if (offset === _this.pagination.offset) {
                                    _this.cardList = result.cards;
                                } else {
                                    _this.cardList = _this.cardList.concat(
                                        result.cards
                                    );
                                }
    
                                //判断有无下一页
                                if (_this.cardList.length < result.total) {
                                    _this.pagination.show = true;
                                    _this.pagination.loading = false;
                                } else {
                                    _this.pagination.show = false;
                                }
                            } else {
                                _this.bus.$emit('openSnackbar', {
                                    color: 'error',
                                    message: res.execute_err,
                                    open: true,
                                    timeout: 3000,
                                    position: 'top-end'
                                });
                            }
                            _this.isLoading = false;
                        }).catch(function(err) {
                            _this.bus.$emit('openSnackbar', {
                                color: 'error',
                                message: "星云主网发生错误：" + err + ". 请刷新重试",
                                open: true,
                                timeout: 3000,
                                position: 'top-end'
                            });
                        });
                });
            },
            //域名详情
            showDetail(open, detail) {
                this.bus.$emit("openDetailDialog", {
                    open: open,
                    detail: detail
                });
            },
            //加载更多
            loadMore: function() {
                var _this = this;
                _this.pagination.loading = true;
                _this.pagination.offset++;
                _this.fetAllCard(
                    _this.pagination.limit,
                    _this.pagination.offset
                );
            },
            //编辑分类
            editType: function(type) {
                this.form = type;
                //标出是更新操作
                this.form.update = true;
                this.openAlertDialog();
            },
            //添加分类
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
    
            //审核域名
            reviewCard: function(hash) {
                var _this = this;
                var data = [hash];
                console.info("准备要提交的数据是:", data);
                var serialNumber = nebPay.call(
                    config.contractAddress,
                    0,
                    "reviewCard",
                    JSON.stringify(data), {
                        callback: config.payApi,
                        listener: function(value) {
                            console.info("正在获取", value);
                            if (!value.txhash) {
                                _this.bus.$emit('openSnackbar', {
                                    color: 'warning',
                                    message: '已取消审核！',
                                    open: true,
                                    timeout: 3000,
                                    position: 'top-end'
                                });
                                return;
                            }
                            _this.bus.$emit('openSnackbar', {
                                color: 'success',
                                message: '审核请求已发送，正在获取结果...',
                                open: true,
                                timeout: 60000,
                                position: 'top-end'
                            });
                            _this.checkTransaction(value.txhash);
                        }
                    }
                );
            },
            //删除域名
            removeCard: function(hash) {
                var _this = this;
                var data = [hash];
                console.info("准备要提交的数据是:", data);
                var serialNumber = nebPay.call(
                    config.contractAddress,
                    0,
                    "removeCard",
                    JSON.stringify(data), {
                        callback: config.payApi,
                        listener: function(value) {
                            console.info("正在获取", value);
                            if (!value.txhash) {
                                _this.bus.$emit('openSnackbar', {
                                    color: 'warning',
                                    message: '已取消删除！',
                                    open: true,
                                    timeout: 3000,
                                    position: 'top-end'
                                });
                                return;
                            }
                            _this.bus.$emit('openSnackbar', {
                                color: 'success',
                                message: '删除请求已发送，正在获取结果...',
                                open: true,
                                timeout: 60000,
                                position: 'top-end'
                            });
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
                            } else if (result.status === 0) {
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
    body,
    .admin {
        min-height: 100vh;
    }
    
    .admin {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .container {
        flex-grow: 1;
    }
    
    .progress {
        position: absolute;
        top: 0;
    }
    
    .mu-card-text {
        padding-top: 0;
    }
    
    .mu-card-title {
        font-size: 18px;
    }
    
    .container>.row>.col {
        padding-top: 8px;
    }
    
    .admin .edit-type {
        position: absolute;
        right: 0;
        bottom: 2px;
    }
</style>
