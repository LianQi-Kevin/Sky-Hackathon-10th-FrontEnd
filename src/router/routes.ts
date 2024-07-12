import HomeView from "@/views/HomeView.vue";
import type {RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        alias: "/home",
        name: "Home",
        component: HomeView,
        meta: {
            title: "Home"
        }
    },
    {
        path: '/error/:id',
        component: () => import('@/views/notFound.vue'),
        props: true,
        meta: {
            title: 'ERROR',
        }
    },
    {
        // 配置全局匹配，跳转到 404 NOT FOUND
        path: '/:pathMatch(.*)*',
        redirect: '/error/404'
    }
]

export default routes