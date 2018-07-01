<template>
    <div class="submit">
        <mu-linear-progress class="progress" size="5" color="secondary" v-if="isLoading"></mu-linear-progress>
        <mu-breadcrumbs>
            <mu-breadcrumbs-item to="/">首页</mu-breadcrumbs-item>
            <mu-breadcrumbs-item disabled>提交站点</mu-breadcrumbs-item>
        </mu-breadcrumbs>
        <mu-container class="is-stripe">
            <mu-row>
                <mu-col span="12">
                    <mu-text-field label="站点名：" v-model="form.name"></mu-text-field>
                    <mu-text-field label="手机：" v-model="form.phone"></mu-text-field>
                    <mu-text-field label="邮箱：" v-model="form.email"></mu-text-field>
                    <mu-text-field label="图标链接：" v-model="form.icon"></mu-text-field>
                    <div class="select-control-group">
                        <mu-flex>
                            <mu-radio v-model="form.subDomain" :value="false" label="用自己的域名"></mu-radio>
                            <mu-radio v-model="form.subDomain" :value="true" label="使用nas.link二级域名"></mu-radio>
                        </mu-flex>
                        <mu-flex>
                            <mu-text-field label="域名：" v-model="form.domain" :suffix="form.subDomain ? '.nas.link':''"></mu-text-field>
                        </mu-flex>
                        <mu-flex>
                            <mu-text-field label="服务器IP：" v-model="form.ip" v-show="form.subDomain"></mu-text-field>
                        </mu-flex>
                    </div>
    
                    <mu-select label="分类：" v-model="form.type">
                        <mu-option v-for="(item,index) in typeList" :key="index" :label="item.name" :value="item.cname"></mu-option>
                    </mu-select>
                    <mu-text-field label="介绍：" v-model="form.introduce" placeholder="DAPP简介，建议输入15个字左右。" multi-line :rows="3" :rows-max="6" full-width></mu-text-field>
                    <mu-button slot="actions" color="primary" :disabled="isSubmit" @click="addCard(form)">提交</mu-button>&nbsp;<small>提交后请耐心等待管理员审核。</small>
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
            return {
                isLoading: true,
                isSubmit: false,
                form: {
                    subDomain: true
                },
                typeList: []
            };
        },
        components: {
            CardSidebar,
            CardFooter
        },
        created() {
            this.fetchAllType();
        },
        methods: {
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
            addCard: function(form) {
                var _this = this;
                var domain = form.subDomain ? form.domain + ".nas.link" : form.domain;
                if (domain.indexOf("http") === -1) {
                    domain = "http://" + domain;
                }
                var data = [{
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    ip: form.ip,
                    domain: domain,
                    icon: form.icon,
                    type: form.type,
                    introduce: form.introduce,
                }];
                console.info("准备要提交的数据是:", data);
                var serialNumber = nebPay.call(
                    config.contractAddress,
                    0,
                    "addCard",
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
                            _this.isSubmit = true;
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
                                _this.$router.push({
                                    path: '/my',
                                    name: 'my'
                                });
                            } else if (result.status === 0) {
                                clearInterval(timer);
                                _this.bus.$emit('openSnackbar', {
                                    color: 'error',
                                    message: result.execute_result,
                                    open: true,
                                    timeout: 60000,
                                    position: 'top-end'
                                });
                                _this.isSubmit = false;
                            }
                        });
                }, 6000);
            }
        }
    };
</script>

<style>
    body,
    .submit {
        min-height: 100vh;
    }
    
    .submit {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .container {
        margin-top: 20px;
        flex-grow: 1;
    }
    
    .select-control-group .mu-radio {
        margin-right: 50px;
    }
</style>
