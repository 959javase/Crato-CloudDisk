import globalFunction from '@/utils/globalFunction.js'
import { queryAccount, login, loginOut } from '@/request/user.js' //引入axios封装
import store from '@/store'

export default {
  state: {
    isLogin: sessionStorage.getItem('isLogin') || false, //  用户登录状态
    token: globalFunction.getCookies('token') || '', // 用户token
    userInfoObj: sessionStorage.getItem('userInfoObj') || '', // 用户信息
    // mk: '', //  用户信息
  },
  mutations: {
    /**
     * 保存登录状态
     * @param {object} state Vuex 的 state 对象
     * @param {boolean} data 登录状态
     */
    changeIsLogin(state, data) {
      sessionStorage.setItem('isLogin', data)
      state.isLogin = data
    },
    /**
     * 保存用户信息
     * @param {object} state Vuex 的 state 对象
     * @param {boolean} data 用户信息
     */
    changeUserInfoObj(state, data) {
      if (data !== {} && data !== '') {
        sessionStorage.setItem('userInfoObj', JSON.stringify(data))
        state.userInfoObj = JSON.stringify(data)
      } else {
        state.userInfoObj = {}
      }
      // state.userInfoObj = Object.assign({}, state.userInfoObj, data)
    },
    // saveMasterKey(state, data) {
    //   state.mk = data
    // },
  },
  actions: {
    // 账号密码登录
    Login({ commit }, userInfo) {
      commit('changeIsLogin', true)
      // store.dispatch('getUserInfo', userInfo.userId)
    },
    // 退出登录
    loginOut({ commit }, context) {
      // let name = JSON.parse(store.state.user.userInfoObj)
      // return loginOut({ username: name.name }).then(
      //   (res) => {
      //     console.log(res)
      //   }
      // )
      commit('changeIsLogin', false)
      sessionStorage.removeItem('isLogin')
      sessionStorage.removeItem('userInfoObj')
      globalFunction.removeCookies('token')
    },
    getUserInfo({ commit }, userId) {
      return queryAccount({
        userId,
      }).then((res) => {
        let { data } = res
        let { bizCrato } = data
        let userInfo = {}
        if (bizCrato) {
          userInfo = {
            name: data.name,
            mobile: data.mobile,
            userId: data.id,
            type: data.type,
            balance: data.balance,
            belong: data.belong,
            fixedSpace: bizCrato.fixedSpace,
            used: bizCrato.used,
            product: bizCrato.product,
            serviceType: bizCrato.serviceType,
            expiredTime: bizCrato.expiredTime,
          }
        } else {
          userInfo = {
            name: data.name,
            mobile: data.mobile,
            userId: data.id,
            type: data.type,
            balance: data.balance,
            belong: data.belong,
          }
        }
        commit('changeUserInfoObj', userInfo)
      })
    },
    // getUserInfo(context) {
    //   return checkUserLoginInfo().then((res) => {
    //     if (res.success) {
    //       // 存储文件预览域名
    //       globalFunction.setCookies('viewDomain', res.data.viewDomain)
    //       // 改变登录状态
    //       context.commit('changeIsLogin', res.success)
    //       // 保存用户信息
    //       context.commit('changeUserInfoObj', res.data)
    //     } else {
    //       context.commit('changeIsLogin', res.success)
    //     }
    //   })
    // },
  },
}
