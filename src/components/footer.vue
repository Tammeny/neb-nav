<template>
    <div class="footer">
        <p>基于星云链实现，所有提交的内容都储存在区块链上，
            <router-link to="/help">使用教程</router-link>
        </p>
        <p>本网站只是提供交流平台，对信息是否准确不下结论，如有疑问请与管理员联系 291558181@qq.com</p>
    </div>
</template>

<script>
    export default {
        name: "card-footer"
    };
</script>

<style>
    .footer {
        font-size: 12px;
        color: rgb(177, 175, 175);
        text-align: center;
        padding: 8px 8px 0;
    }
    .footer p{
        margin: 0
    }
</style>
