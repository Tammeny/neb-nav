import Vue from "vue/dist/vue.js";
import VueRouter from "vue-router";
import MuseUI from "muse-ui";
import "muse-ui/dist/muse-ui.css";
import theme from "muse-ui/lib/theme";

theme.add(
    "tiffany",
    {
        primary: "#81d8d0",
        secondary: "#ff4081",
        success: "#4caf50",
        warning: "#ffeb3b"
    },
    "light"
);
theme.use("tiffany");

Vue.use(MuseUI);

import CardSnackbar from "./components/snackbar.vue";
import Home from "./page/home.vue";
import My from "./page/my.vue";
import Help from "./page/help.vue";
import Admin from "./page/admin.vue";

Vue.use(VueRouter);

const routes = [
    { path: "/", component: Home, name: "home", meta: { name: "首页" } },
    { path: "/my/", component: My, name: "my", meta: { name: "我的名片" } },
    { path: "/help", component: Help, name: "help", meta: { name: "帮助" } },
    { path: "/admin", component: Admin, name: "admin", meta: { name: "管理" } }
];

const router = new VueRouter({
    routes
});

let bus = new Vue();
Vue.prototype.bus = bus;

var cls, app, nebState;
var main = {
    router,
    data(){
        return {
            address:{},
            nebState: {}
        }
    },
    components: {
        CardSnackbar
    }
}
nebApi.getNebState().then(function (state) {
    cls = Vue.extend(main);
    app = new cls();
    config.nebState = state;

    getWallectInfo();
    app.$mount('#app');
}).catch(function(err){
    alert("星云主网发生错误：" + err+". 请刷新重试");
});

function getWallectInfo() {
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data && e.data.data.account) {
            config.address = e.data.data.account;
            if(config.address === config.admin){
                config.isAdmin = true;
            }
        }
    });

    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
}