import axios from 'axios'
import globalFunction from '@/utils/globalFunction.js'
import router from '@/router/router'
import { MessageBox, Notification, Message } from 'element-ui'

// 登录提醒
const loginTip = function() {
  MessageBox.alert('登录已失效，请重新登录', '操作提示', {
    confirmButtonText: '确定',
    callback: () => {
       // tokne失效跳转登录页
       window.location.href = '/'
    },
  })
}

// 请求超时时间
axios.defaults.timeout = 10000 * 5

// 请求基础 URL
axios.defaults.baseURL = '/api'

// POST 请求头
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded'

// 请求携带cookie
axios.defaults.withCredentials = true

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    if (
      config.url == 'https://api.decoo.io/oauth/accessToken' ||
      config.url == 'https://api-hk.decoo.io/pinning/pinFile'
    ) {
      let token =
        'Bearer ' +
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJrZXkiOnsiYXBpX2tleSI6IjEwNzJtTVIxYzRpUUZaN1hQdkl6RmI2UTB3UzhXVVRRNDhQbDE2MjgxMzk0NDg1NzEiLCJ1c2VyX2lkIjoxMDcyfX0.Og-40utIPmBjz-qsEJd71KzjJWgTzDHodq8Ee3f5hY4'
      config.headers['Authorization'] = token
      config.headers['Content-Type'] = 'application/json'
      return config
    } else {
      let token = globalFunction.getCookies('token')
      config.headers['Authorization'] = token
      config.headers.lang = 'Chinese'
      return config
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  (res) => {
    if (res.data.code === 0 || res.data.Code === 200 || res.status === 200) {
      // 续签token
      globalFunction.setCookies('token', res.headers.authorization)
      return res
    } else {
      Message({
        message: res.data.description,
        type: 'error',
      })
      return Promise.reject(new Error(res.data.description))
    }
  },

  // (response) => {
  //   if (response.status === 200) {
  //     return Promise.resolve(response)
  //   }
  // },
  // 服务器状态码不是200的情况
  (error) => {
    if (
      error.response.status == 500 &&
      error.response.data.message == 'token无效'
    ) {
      // Message({
      //   message: error.response.statusText,
      //   type: 'error',
      // })
      sessionStorage.removeItem('isLogin')
      sessionStorage.removeItem('userInfoObj')
      globalFunction.removeCookies('token')
      loginTip()
      return Promise.reject(new Error(error.response.statusText))
      // switch (error.response.status) {
      //   case 401:
      //     loginTip()
      //     break
      //   default:
      //     return Promise.reject(error.response)
      // }
    } else {
      Message({
        message: error.response.statusText,
        type: 'error',
      })
      return Promise.reject(new Error(error.response.statusText))
    }
  }
)

/**
 * 封装 get方法 对应 GET 请求
 * @param {string} url 请求url
 * @param {object} params 查询参数
 * @returns {Promise}
 */
export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params: params,
      })
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}
/**
 * 封装 post 方法，对应 POST 请求
 * @param {string} url 请求url
 * @param {object} data 请求体
 * @param {boolean | undefined} info 请求体是否为 FormData 格式
 * @returns {Promise}
 */
export function post(url, data = {}, info) {
  return new Promise((resolve, reject) => {
    let newData = data
    if (info) {
      //  转formData格式
      newData = new FormData()
      for (let i in data) {
        newData.append(i, data[i])
      }
    }
    axios
      .post(url, newData)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}

/**
 * 封装 put 方法，对应 PUT 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @returns {Promise}
 */
export function put(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.put(url, params).then(
      (res) => {
        resolve(res.data)
      },
      (err) => {
        reject(err.data)
      }
    )
  })
}

/**
 * 封装 axiosDelete 方法，对应 DELETE 请求
 * @param {string} url 请求url
 * @param {object} params 请求体
 * @returns {Promise}
 */
export function axiosDelete(url, params = {}) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, params)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        reject(err.data)
      })
  })
}
