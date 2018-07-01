<template>
    <mu-dialog scrollable ref="dialog" title="发布站点（提交后，请耐心等待管理员审核。）" width="600" max-width="80%" :esc-press-close="false" :overlay-close="false" :open.sync="openAlert">
        <mu-text-field label="站点名：" v-model="form.name"></mu-text-field>
        <mu-text-field label="手机：" v-model="form.phone"></mu-text-field>
        <mu-text-field label="邮箱：" v-model="form.email"></mu-text-field>
         <mu-text-field label="图标链接：" v-model="form.icon"></mu-text-field>
        <div class="select-control-group">
            域名：
            <mu-flex>
                <mu-radio v-model="form.subDomain" :value="false" label="用自己的域名"></mu-radio>
                <mu-radio v-model="form.subDomain" :value="true" label="使用nas.link二级域名"></mu-radio>
            </mu-flex>
            <mu-flex>
                <mu-text-field label="" v-model="form.domain"></mu-text-field><span v-show="form.subDomain">.nas.link</span>
            </mu-flex>
            <mu-flex>
                <mu-text-field label="服务器IP" v-model="form.ip" v-show="form.subDomain"></mu-text-field>
            </mu-flex>
        </div>
    
        <mu-select label="分类：" v-model="form.type">
            <mu-option v-for="(item,index) in typeList" :key="index" :label="item.name" :value="item.cname"></mu-option>
        </mu-select>
        <mu-text-field label="介绍：" v-model="form.introduce" placeholder="请认真填写DAPP介绍" multi-line :rows="3" :rows-max="6" full-width></mu-text-field>
        <mu-button slot="actions" flat @click="closeAlertDialog">取消</mu-button>
        <mu-button slot="actions" color="primary" @click="addCard(form)">提交</mu-button>
    </mu-dialog>
</template>

<script>
    export default {
        name: "card-dialog",
        data() {
            return {
                form: {
                    subDomain: true
                },
                typeList: [],
                openAlert: false
            }
        },
        created() {
            this.fetchAllType();
        },
        watch: {
            typeList: function(val) {
                this.bus.$emit("typeList", val);
            }
        },
        mounted() {
            var _this = this;
            _this.bus.$on('openAlertDialog', function(bool) {
                _this.openAlert = bool;
            });
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
                var domain = form.subDomain ? form.domain+".nas.link":form.domain;
                if(domain.indexOf("http") === -1){
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
                            _this.bus.$emit('openAlertDialog', false);
                            _this.checkTransaction(value.txhash);
                        }
                    }
                );
            },
            closeAlertDialog() {
                this.openAlert = false;
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
    }
</script>