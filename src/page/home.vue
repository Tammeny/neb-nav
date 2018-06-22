<template>
    <div class="home">
        <card-header></card-header>
        <mu-container class="container is-stripe">
            <mu-row gutter>
                <mu-col span="12" class="types">
                    <mu-button :textColor="ins==-1 ? 'grey50': 'grey900'" :color="ins == -1 ? 'primary': 'grey50'" @click="selectType(null, -1)">不限</mu-button>
                    <mu-button :textColor="index==ins ? 'grey50': 'grey900'" :color="index==ins ? 'primary': 'grey50'" v-for="(item,index) in typeList" :key="index" @click="selectType(item.cname, index)">{{item.name}}</mu-button>
                </mu-col>
            </mu-row>
            <mu-row gutter>
                <mu-col sm="6" md="6" lg="6" xl="3" v-for="(item, index) in cardList" :key="index">
                    <mu-card @click="showDetail(true, item)">
                        <mu-card-title :title="item.name" :sub-title="item.phone"></mu-card-title>
                        <mu-card-text>
                            {{item.introduce}}
                        </mu-card-text>
                    </mu-card>
                </mu-col>
            </mu-row>
        </mu-container>
        <card-dialog></card-dialog>
        <card-detail></card-detail>
        <card-footer></card-footer>
    </div>
</template>

<script>
    import CardHeader from "../components/header.vue";
    import CardFooter from "../components/footer.vue";
    import CardDialog from "../components/dialog.vue";
    import CardDetail from "../components/detail.vue";
    export default {
        data() {
            return {
                cardList: [],
                pagination: {
                    show: false,
                    loading: false,
                    limit: 16,
                    offset: -1,
                    text: "加载更多"
                },
                ins: -1,
                typeList: [],
                isLoading: true
            };
        },
        components: {
            CardHeader,
            CardFooter,
            CardDialog,
            CardDetail
        },
        watch: {
            isLoading: function(val) {
                this.bus.$emit("showProgress", val);
            }
        },
        created: function() {
            var _this = this;
            _this.bus.$on('typeList', function(typeList) {
                _this.typeList = typeList;
            });
            _this.fetAllCard(_this.pagination.limit, _this.pagination.offset);
        },
        methods: {
            //域名详情
            showDetail(open, detail) {
                this.bus.$emit("openDetailDialog", {
                    open: open,
                    detail: detail
                });
            },
            //选择行业
            selectType(type, index) {
                var _this = this;
                _this.ins = index;
                _this.cardList = [];
                _this.fetAllCard(_this.pagination.limit, _this.pagination.offset, type)
            },
            //获取域名列表
            fetAllCard: function(limit, offset, cname) {
                var _this = this;
                _this.isLoading = true;
                nebApi
                    .call({
                        chainID: config.nebState.chain_id,
                        from: config.address || config.contractAddress,
                        to: config.contractAddress,
                        value: 0,
                        // nonce: nonce,
                        gasPrice: 1000000,
                        gasLimit: 2000000,
                        contract: {
                            function: cname ? "getAllCardByType" : "getAllCard",
                            args: JSON.stringify((cname ? [cname, limit, offset] : [limit, offset]))
                        }
                    })
                    .then(function(res) {
                        console.info(res);
                        if (!res) {
                            return;
                        }
                        if (res.result && res.result!=="null") {
                            var result = JSON.parse(res.result);
                            if(offset === _this.pagination.offset){
                                _this.cardList = result.cards;
                            }else{
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
                        }else{
                            _this.bus.$emit('openSnackbar', {
                                color: 'error',
                                message: res.execute_err,
                                open: true,
                                timeout: 3000,
                                position: 'top-end'
                            });
                        }
                        _this.isLoading = false;
                    }).catch(function(err){
                        _this.bus.$emit('openSnackbar', {
                            color: 'error',
                            message: "星云主网发生错误："+err+". 请刷新重试",
                            open: true,
                            timeout: 3000,
                            position: 'top-end'
                        });
                    });
            },
            loadMore: function() {
                var _this = this;
                _this.pagination.loading = true;
                _this.pagination.offset++;
                _this.fetAllCard(
                    _this.pagination.limit,
                    _this.pagination.offset
                );
            }
        }
    };
</script>

<style>
    body,
    .home {
        min-height: 100vh;
    }
    
    .home {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .container {
        margin-top: 20px;
        flex-grow: 1;
    }
    
    .container>.row>.col {
        padding-top: 8px;
    }
    
    .types button {
        margin-right: 10px;
        margin-bottom: 10px;
    }
    
    .progress {
        position: absolute;
        top: 0;
    }
    
    .mu-card-text {
        padding-top: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .mu-card-title {
        font-size: 18px;
    }
    
    .home .mu-card:hover {
        box-shadow: 0 3px 3px -2px rgba(0, 0, 0, .2), 0 3px 4px 0 rgba(0, 0, 0, .14), 0 1px 8px 0 rgba(0, 0, 0, .12);
        cursor: pointer;
    }
</style>
