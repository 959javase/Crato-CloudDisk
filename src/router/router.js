import Vue from 'vue'
import Router from 'vue-router'

import Layout from '@/layout'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      // name: 'Home',
      // component: () => import(/* webpackChunkName: "home" */ '@/views/Home'),
      // meta: { title: 'Index' }
      name: 'Login',
      component: () =>
        import(/* webpackChunkName: "login" */ '@/views/Login.vue'),
      meta: { title: 'Login' },
    },
    {
      path: '/register',
      name: 'Register',
      component: () =>
        import(/* webpackChunkName: "register" */ '@/views/Register.vue'),
      meta: { title: 'Register' },
    },
    {
      path: '/serviceOpen',
      name: 'serviceOpen',
      component: () =>
        import(/* webpackChunkName: "register" */ '@/views/serviceOpen'),
      meta: { title: 'serviceOpen' },
    },
    // {
    //   path: '/login',
    //   name: 'Login',
    //   component: () =>
    //     import(/* webpackChunkName: "login" */ '@/views/Login.vue'),
    //   meta: { title: 'Login' },
    // },
    {
      path: '/',
      component: Layout,
      meta: {
        requireAuth: true, //  当前路由是否需要登录才可进入
        title: 'Crato',
        content: {
          description: '',
        },
        breadCrumbName: 'Root',
      },
      children: [
        {
          path: '', // 默认子路由
          name: 'diskUsage',
          component: () =>
            import(/* webpackChunkName: "file" */ '@/views/diskUsage'),
        },
        {
          path: '/fileList', // 文件列表
          name: 'fileList',
          component: () =>
            import(/* webpackChunkName: "file" */ '@/views/fileList'),
        },
        {
          path: '/account', // 账户管理
          name: 'account',
          component: () =>
            import(/* webpackChunkName: "file" */ '@/views/account'),
        },
        {
          path: '/cost', // 费用管理
          name: 'cost',
          component: () =>
            import(/* webpackChunkName: "file" */ '@/views/cost'),
        },
      ],
    },

    // {
    //   path: '/file',
    //   name: 'File',
    //   component: () => import(/* webpackChunkName: "file" */ '@/views/file/File.vue'),
    //   meta: {
    //     requireAuth: true, //  当前路由是否需要登录才可进入
    //     title: 'Crato',
    //     content: {
    //       description: '',
    //     },
    //     breadCrumbName: 'Root',
    //   },
    // },
    // {
    //   path: '/share/:shareBatchNum',
    //   name: 'Share',
    //   component: () =>
    //     import(/* webpackChunkName: "share" */ '@/views/Share/index.vue'),
    //   meta: {
    //     title: 'share',
    //     breadCrumbName: '分享share文件',
    //   },
    //   props: true,
    // },
    // {
    //   path: '/myshare',
    //   name: 'MyShare',
    //   component: () =>
    //     import(/* webpackChunkName: "my_share" */ '@/views/MyShare/index.vue'),
    //   meta: {
    //     requireAuth: true,
    //     title: 'MyShare',
    //     breadCrumbName: 'MyShare',
    //   },
    // },
    {
      path: '*',
      name: 'Error_404',
      component: () =>
        import(/* webpackChunkName: "error_404" */ '@/views/ErrorPage/404.vue'),
      meta: { title: '404 ' },
    },
  ],
})

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err)
}
