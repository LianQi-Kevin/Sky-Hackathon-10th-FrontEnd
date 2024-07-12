import {createRouter, createWebHistory} from 'vue-router'
import routes from "@/router/routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// 为metaData附加type
declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean;
        title?: string;
    }
}

// 根据meta.title修改页面标题
// router.afterEach 全局后置守卫, 导航结束后执行
router.afterEach((to) => {
    // 如果routes的meta中定义了title，则修改页面title
    if (to.meta['title']) {
        document.title = to.meta['title'];
    }
});


export default router
