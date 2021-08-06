import Cookies from 'js-cookie'
import config from '@/config'
import { Message } from 'element-ui'
import Crypto from '@/common/crypto-m'
// 全局函数
const globalFunction = {
  /**
   * 格式化文件大小
   * @param {number} size 文件大小
   * @returns {string} 文件大小（带单位）
   */
  calculateFileSize: function(size) {
    const B = 1024
    const KB = Math.pow(1024, 2)
    const MB = Math.pow(1024, 3)
    const GB = Math.pow(1024, 4)
    if (!size) {
      return '_'
    } else if (size < KB) {
      return (size / B).toFixed(0) + 'KB'
    } else if (size < MB) {
      return (size / KB).toFixed(1) + 'MB'
    } else if (size < GB) {
      return (size / MB).toFixed(2) + 'GB'
    } else {
      return (size / GB).toFixed(3) + 'TB'
    }
  },

  /**
   * 保留小数向上取整
   * @param {number} num 原数字
   * @param {number} fix 保留的小数位数
   * @returns {number} 格式化后的数字
   */
  upFixed: function(num, fix) {
    let result = '0'
    if (Number(num) && fix > 0) {
      // 简单的做个判断
      fix = +fix || 2
      num = num + ''
      if (/e/.test(num)) {
        // 如果是包含e字符的数字直接返回
        result = num
      } else if (!/\./.test(num)) {
        // 如果没有小数点
        result = num + `.${Array(fix + 1).join('0')}`
      } else {
        // 如果有小数点
        num = num + `${Array(fix + 1).join('0')}`
        let reg = new RegExp(`-?\\d*\\.\\d{0,${fix}}`)
        let floorStr = reg.exec(num)[0]
        if (+floorStr >= +num) {
          result = floorStr
        } else {
          let floorNumber = +floorStr + +`0.${Array(fix).join('0')}1`
          let point = /\./.test(floorNumber + '') ? '' : '.'
          let floorStr2 = floorNumber + point + `${Array(fix + 1).join('0')}`
          result = reg.exec(floorStr2)[0]
        }
      }
    }
    return result
  },
  /**
   *
   * @param {number} num 原数字
   * @param {number} fix 保留的小数位数
   * @returns {number} 格式化后的数字
   */
  downFixed: function(num, fix) {
    // num为原数字，fix是保留的小数位数
    let result = '0'
    if (Number(num) && fix > 0) {
      // 简单的做个判断
      fix = +fix || 2
      num = num + ''
      if (/e/.test(num)) {
        // 如果是包含e字符的数字直接返回
        result = num
      } else if (!/\./.test(num)) {
        // 如果没有小数点
        result = num + `.${Array(fix + 1).join('0')}`
      } else {
        // 如果有小数点
        num = num + `${Array(fix + 1).join('0')}`
        let reg = new RegExp(`-?\\d*.\\d{0,${fix}}`)
        result = reg.exec(num)[0]
      }
    }
    return result
  },
  /**
   * 
   * @param {Date} startDate 开始日期
   * @param {Date} endDate 被减日期
   * @returns 日期天数
   */
  getNumberOfDays: function(startDate, endDate) {
    //获得天数
    //date1：开始日期，date2结束日期
    var a1 = Date.parse(new Date(startDate))
    var a2 = Date.parse(new Date(endDate))
    var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24)) //核心：时间戳相减，然后除以天数
    return day
  },
  /**
   * 获取图片缩略图路径
   * @param {object} row 文件信息
   * @returns {string} 图片缩略图路径
   */
  getImgMinPath: function(row) {
    let fileUrl = ''
    if (row.fileUrl) {
      if (row.isOSS == 1) {
        // 阿里云OSS对象存储
        fileUrl = `https://${Cookies.get('viewDomain')}${
          row.fileUrl
        }?x-oss-process=image/resize,m_fill,h_150,w_150/rotate,0`
      } else {
        // 本地磁盘存储
        let index = row.fileUrl.lastIndexOf('.')
        fileUrl =
          '/api' +
          row.fileUrl.substr(0, index) +
          '_min' +
          row.fileUrl.substr(index)
      }
    }
    return fileUrl
  },
  /**
   * 获取文件查看路径
   * @param {object} row 文件信息
   * @returns {string} 文件路径
   */
  getViewFilePath: function(row, nkey) {
    return `http://localhost:9099/fetch.html?cid=${row.cid}&filename=${row.fileName}.${row.extendName}&xxkey=${nkey}`
  },
  /**
   * 获取文件下载路径
   * @param {object} row 文件信息
   * @returns {string}  文件下载路径
   */
  getDownloadFilePath: function(row, nkey) {
    return `http://localhost:9099/fetch.html?cid=${row.cid}&filename=${row.fileName}.${row.extendName}&xxkey=${nkey}`
  },
  /**
   * 获取 office 文件在线预览路径
   * @param {object} row
   * @returns {string} office 文件在线预览路径
   */
  getFileOnlineViewPathByOffice: function(row) {
    let fileUrl = ''
    if (row.isOSS == 1) {
      fileUrl = `https://${Cookies.get('viewDomain')}${row.fileUrl}` // 阿里云OSS对象存储
    } else {
      // 本地磁盘存储 - 在本地开发环境中，本地磁盘存储的文件是无法预览的，因为 office 要求文件可以在 Internet 访问
      fileUrl = `${location.protocol}//${location.host}/api${row.fileUrl}`
    }
    return `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`
  },
  /**
   * 设置 Cookies
   * @param {string} name 名称
   * @param {string} value 值
   * @param {object} others 域名、路径、有效期等，封装到对象中
   */
  setCookies: function(name, value, others = null) {
    Cookies.set(name, value, { domain: config.domain, ...others })
  },
  /**
   * 获取 Cookies
   * @param {string} name 名称
   * @param {object} others 域名、路径等，封装到对象中
   * @returns {string} Cookies 值
   */
  getCookies: function(name, others = null) {
    return Cookies.get(name, { domain: config.domain, ...others })
  },
  /**
   * 移除 Cookies
   * @param {string} name 名称
   * @param {object} others 域名、路径等，封装到对象中
   */
  removeCookies: function(name, others = null) {
    Cookies.remove(name, { domain: config.domain, ...others })
  },
  /**
   * 获取分享链接
   * @param {string} shareBatchNum
   * @returns {string} 完整的分享链接
   */
  getShareLink: function(shareBatchNum) {
    return `${location.protocol}//${location.host}/share/${shareBatchNum}`
  },
  /**
   * 复制分享链接
   * @param {string} shareBatchNum
   * @param {string} extractionCode
   */
  copyShareLink: function(shareBatchNum, extractionCode) {
    let input = document.createElement('textarea') // 直接构建textarea以保持换行
    input.value =
      extractionCode === null
        ? `分享链接：${this.getShareLink(
            shareBatchNum
          )}\n复制链接到浏览器中并输入提取码即可查看文件`
        : `分享链接：${this.getShareLink(
            shareBatchNum
          )}\n提取码：${extractionCode}\n复制链接到浏览器中并输入提取码即可查看文件` // 设置内容
    document.body.appendChild(input) // 添加临时实例
    input.select() // 选择实例内容
    document.execCommand('Copy') // 执行复制
    document.body.removeChild(input) // 删除临时实例
    Message.success('复制成功')
  },
}

export default globalFunction
