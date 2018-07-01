<template>
    <mu-dialog fullscreen transition="slide-bottom" :open.sync="openDetailDialog">
        <mu-appbar :title="`${detail.name}的名片`">
            <mu-button slot="left" icon @click="closeAlertDialog">
                <mu-icon value="close"></mu-icon>
            </mu-button>
            <mu-button slot="right" flat @click="closeAlertDialog">
                关闭
            </mu-button>
        </mu-appbar>
        <mu-container class="container is-stripe">
            <mu-text-field label="站点名" disabled :value="detail.name"></mu-text-field>
            <mu-text-field label="域名" disabled :value="detail.domain"></mu-text-field>
            <mu-text-field label="电话" disabled :value="detail.phone"></mu-text-field>
            <mu-text-field label="邮箱" disabled :value="detail.email"></mu-text-field>
            <mu-text-field label="服务器IP" disabled :value="detail.ip"></mu-text-field>
            <mu-text-field label="图标" disabled :value="detail.icon"></mu-text-field>
            <mu-text-field label="已审核" disabled :value="detail.isReview?'是':'否'"></mu-text-field>
            <mu-text-field label="已删除" disabled :value="detail.isRemove?'是':'否'"></mu-text-field>
            <mu-select label="分类" v-model="detail.type" disabled>
                <mu-option v-for="(item,index) in typeList" :key="index" :label="item.name" :value="item.cname"></mu-option>
            </mu-select>
            <mu-text-field label="介绍" disabled :value="detail.introduce" placeholder="可以描述一下主营业务" multi-line :rows="3" :rows-max="6" full-width></mu-text-field>
        </mu-container>
    </mu-dialog>
</template>

<script>
    export default {
        name: "card-detail",
        data() {
            return {
                detail: {},
                openDetailDialog: false,
                typeList: []
            }
        },
        created(){
            var _this = this;
            _this.bus.$on('typeList', function(typeList) {
                _this.typeList = typeList;
            });
        },
        mounted () {
            var _this = this;
            _this.bus.$on('openDetailDialog', function (obj) {
                _this.openDetailDialog = obj.open;
                _this.detail = obj.detail;
            });
        },
        methods: {
            closeAlertDialog() {
                this.openDetailDialog = false;
            }
        }
    }
</script>