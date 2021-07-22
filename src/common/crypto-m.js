import JSEncrypt from 'jsencrypt'
import CryptoJS from 'crypto-js'

var methods = [
  'md2',
  'md5',
  'sha1',
  'sha224',
  'sha256',
  'sha384',
  'sha512',
  'ripemd160',
]
// 获取公钥和私钥
function getRsaKey() {
  var size =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 512
  var crypt = new JSEncrypt({
    default_key_size: size,
  }).getKey()
  return {
    publicKeyBase64: crypt.getPublicBaseKeyB64(),
    privateKeyBase64: crypt.getPrivateBaseKeyB64(),
    publicKey: crypt.getPublicKey(),
    privateKey: crypt.getPrivateKey(),
  }
}
// 使用公钥加密
function encryptRsa(publicKey, word) {
  var encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(word)
}
// 使用私钥解密
function decryptRsa(privateKey, word) {
  var decrypt = new JSEncrypt()
  decrypt.setPrivateKey(privateKey)
  return decrypt.decrypt(word)
}
// 使用私钥加密
function encryptRsaByPrivateKey(privateKey, word) {
  var decrypt = new JSEncrypt()
  decrypt.setPrivateKey(privateKey)
  return decrypt.encrypt(word)
}
// 使用公钥解密 jsencrypt不支持，此方法
function decryptRsaByPublicKey(publicKey, word) {
  var encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.decrypt(word)
}
// 使用私钥加签
function sign(privateKey, word) {
  var method =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'sha256'

  if (!methods.includes(method)) {
    return new Error('method must be one of '.concat(methods.join(',')))
  }

  var encrypt = new JSEncrypt()
  encrypt.setPrivateKey(privateKey)
  console.log(encrypt)
  return encrypt.sign(word, CryptoJS[method.toUpperCase()], method)
}
// 使用公钥验签
function verify(publicKey, word, signature) {
  var method =
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'sha256'

  if (!methods.includes(method)) {
    return new Error('method must be one of '.concat(methods.join(',')))
  }

  var decrypt = new JSEncrypt()
  decrypt.setPublicKey(publicKey)
  return decrypt.verify(word, signature, CryptoJS[method.toUpperCase()])
}
// 使用aes秘钥加密
function encryptAes(secretKey, word) {
  secretKey = CryptoJS.enc.Utf8.parse(secretKey)
  word = CryptoJS.enc.Utf8.parse(word)
  var encrypted = CryptoJS.AES.encrypt(word, secretKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}
// 使用aes秘钥解密
function decryptAes(secretKey, word) {
  secretKey = CryptoJS.enc.Utf8.parse(secretKey)
  var decrypted = CryptoJS.AES.decrypt(word, secretKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return CryptoJS.enc.Utf8.stringify(decrypted).toString()
}

function masterKey() {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  var masterKey = s.join('')
  return masterKey
}

// ArrayBuffer转为字符串，参数为ArrayBuffer对象
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

// 字符串转为ArrayBuffer对象，参数为字符串
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2) // 每个字符占用2个字节
  var bufView = new Uint16Array(buf)
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}
function concatenate(resultConstructor, ...arrays) {
  let totalLength = 0
  for (let arr of arrays) {
    totalLength += arr.length
  }
  let result = new resultConstructor(totalLength)
  let offset = 0
  for (let arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

function arrayBufferToBase64(buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  var res = window.btoa(binary)
  return res
}

var index = {
  getRsaKey: getRsaKey,
  encryptRsa: encryptRsa,
  decryptRsa: decryptRsa,
  sign: sign,
  verify: verify,
  // decryptRsaByPublicKey,
  encryptRsaByPrivateKey: encryptRsaByPrivateKey,
  encryptAes: encryptAes,
  decryptAes: decryptAes,
  masterKey: masterKey,
  dataURLtoFile: dataURLtoFile,
  arrayBufferToBase64: arrayBufferToBase64,
  concatenate: concatenate,
}

export default index
export {
  decryptAes,
  decryptRsa,
  decryptRsaByPublicKey,
  encryptAes,
  encryptRsa,
  encryptRsaByPrivateKey,
  getRsaKey,
  sign,
  verify,
  masterKey,
  dataURLtoFile,
  arrayBufferToBase64,
  concatenate,
}
