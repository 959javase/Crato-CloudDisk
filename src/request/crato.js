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

// 查询用户服务类型
export const checkServiceStatus = (p) => get('/crato/checkServiceStatus', p)
// 开通服务
export const openCrato = (p) => post('/crato/openCrato', p)
// 创建付款订单
export const createOrder = (p) => get('/crato/createOrder', p)
// 获取微信付款链接
export const getWxPay = (p) => post('/weixinPay/native', p)
// 查询微信支付订单状态
export const queryOrderState = (p) => get('/weixinPay/queryOrderState', p)
// 添加文件
export const addFile = (p) => post('/crato/addFile', p)
// 文件列表
export const listFile = (p) => get('/crato/listFile', p)
// 用户容量延期
export const deferred = (p) => get('/crato/deferred', p)
// 用户容量扩容
export const expand = (p) => get('/crato/expand', p)
