// 用户信息相关接口
import { get, post } from './http'

/**
 * 以登录接口为例
 * export const login = p => get('/user/login', p);
 *
 * login ---------- 接口名称
 * p -------------- 传参，若需要在url中拼接其他信息，传参可以改为(p, other)
 * get ------------ 接口调用的方法，来自 http.js 中封装好的四个axios方法 get/post/put/axiosDelete
 * '/user/login' -- 接口url，若需要在url中拼接其他信息：
 *                  首先需要在传参处改为(p, other1, other2)
 *                  然后将url改为`/user/${other1}/login/${other2}`
 * p -------------- 传递给 get/post/put/axiosDelete 中的查询参数/请求体
 *
 *
 *
 * 除此之外，POST 请求支持请求体格式为 FormData，那么就需要多传递一个参数，true，如下示例：
 * export const example = p => post('/test/example', p, true);
 */

// 用户登录
export const login = (p) => post('/accounts/signIn', p)
// 手机验证码登录
export const mobileLogin = (p) => post('/accounts/mobileLogin', p)
// 查询用户信息
export const queryAccount = (p) => get('/accounts/queryAccount', p)
// 用户登出
export const loginOut = (p) => get('/accounts/signOut', p)
// 发送验证码
export const sendSms = (p) => get('/accounts/sendSms', p)
// 获取登录状态及用户信息
// export const checkUserLoginInfo = (p) => get('/user/check', p)
// 用户注册
export const register = (p) => post('/accounts/signUp', p)
// 获取加密token
// export const getToken = (p) => post('user/getToken', p, true)
// 校验token
// export const checkToken = (p) => get('user/check', p)
// 校验用户名
export const checkname = (p) => get('/accounts/checkUsername', p)
// 校验手机号
export const checkmobile = (p) => get('/accounts/checkMobile', p)
// 修改密码
export const updatePassword = (p) => get('/accounts/updatePassword', p)
