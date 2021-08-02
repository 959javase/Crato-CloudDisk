<template>
  <div class="login-wrapper" id="loginBackground">
    <div class="login-header">
      <Header />
    </div>
    <div class="form-content">
      <div class="form-wrapper">
        <h3 class="login-title">账号密码登陆</h3>
        <!-- <h1 class="login-system">Crato</h1> -->
        <!-- 登录表单 -->
        <el-form class="login-form" ref="loginForm" :model="loginForm" :rules="loginFormRules"
          label-width="100px" hide-required-asterisk>
          <el-form-item prop="username">
            <el-input prefix-icon="el-icon-mobile-phone" v-model="loginForm.phoneNumber"
              placeholder="手机号"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="password" placeholder="密码" show-password>
            </el-input>
          </el-form-item>
          <el-form-item>
            <drag-verify ref="dragVerifyRef" text="请按住滑块拖动解锁" successText="验证通过"
              handlerIcon="el-icon-d-arrow-right" successIcon="el-icon-circle-check"
              handlerBg="#F5F7FA" :width="315" :isPassing.sync="isPassing"
              @update:isPassing="updateIsPassing"></drag-verify>
          </el-form-item>
          <el-form-item class="login-btn-form-item">
            <el-button class="login-btn" type="primary" :disabled="loginBtnDisabled"
              @click="submitForm('loginForm')">登陆</el-button>
          </el-form-item>
          <a href="#" @click="codeLogin"><span style="font-size:8pt">验证码登录</span></a>
          <a href="/Register"><span style="font-size:8pt">没有账号？立即注册</span></a>
        </el-form>
      </div>
    </div>

  </div>

</template>

<script>
import DragVerify from '@/components/common/DragVerify.vue' //  引入滑动解锁组件
import Header from '@/components/Header.vue'
import { login, getToken, checkToken } from '@/request/user.js'
import Crypto from '../common/crypto-m'
// 配置
const config = {
  color: '64, 158, 255', // 线条颜色
  pointColor: '64, 158, 255', // 节点颜色
  opacity: 0.5, // 线条透明度
  count: 99, // 线条数量
  zIndex: -1, // 画面层级
}

export default {
  name: 'Login',
  components: { DragVerify, Header },
  data() {
    return {
      // 登录表单数据
      loginForm: {
        phoneNumber: '',
      },
      password: '',
      ttoken: '',
      // 登录表单验证规则
      loginFormRules: {
        phoneNumber: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
        ],
        // password: [
        //   { required: true, message: '请输入密码', trigger: 'blur' },
        //   {
        //     min: 5,
        //     max: 20,
        //     message: '长度在 5 到 20 个字符',
        //     trigger: 'blur'
        //   }
        // ]
      },
      isPassing: false, //  滑动解锁是否验证通过
      loginBtnDisabled: true, //  登录按钮是否禁用
      MasterKey_af: '',
    }
  },
  computed: {
    url() {
      let _url = this.$route.query.Rurl //  获取路由前置守卫中 next 函数的参数，即登录后要去的页面
      return _url
        ? { path: _url }
        : { name: 'File', query: { fileType: 0, filePath: '/' } } //  若登录之前有页面，则登录后仍然进入该页面
    },
  },
  watch: {
    //  滑动解锁验证通过时，若重新输入用户名或密码，滑动解锁恢复原样
    'loginForm.username'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
    'loginForm.password'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
  },
  created() {
    // 用户若已登录，自动跳转到首页
    if (this.$store.getters.isLogin) {
      //let username = this.$store.getters.username
      // this.$message({
      //   message: `${username} 您已登录！已跳转到首页`,
      //   center: true,
      //   type: 'success'
      // })
      this.$router.replace({ name: 'File' })
    }
  },
  methods: {
    /**
     * 点击验证码登录
     */
    codeLogin(){
      console.log('点击了验证码登录');
    },
    /**
     * 滑动解锁完成 回调函数
     * @param {boolean} isPassing 解锁是否通过
     */
    updateIsPassing(isPassing) {
      if (isPassing) {
        this.loginBtnDisabled = false
      } else {
        this.loginBtnDisabled = true
      }
    },
    /**
     * 登录按钮点击事件 表单验证&用户登录
     * @param {boolean} formName 表单ref值
     */
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 表单各项校验通过
          let keykey = this.password
          getToken(this.loginForm).then((res) => {
            if (res.success) {
              while (keykey.length < 16) {
                keykey += '0'
              }
              let MasterKey_af = Crypto.decryptAes(
                keykey,
                res.data.master_key_ba
              )
              if (!MasterKey_af) {
                this.$message.error('密码错误，请重试')
                this.isPassing = false
                this.$refs.dragVerifyRef.reset()
                return
              }
              // console.log('解密出 MasterKey '+ MasterKey_af)
              this.MasterKey_af = MasterKey_af
              //解密出 RSA 私钥
              //  let rsa_private_key = Crypto.decryptAes(MasterKey_af , rsa_private_key_ba)
              let rsa_private_key = Crypto.decryptAes(
                MasterKey_af,
                res.data.rsa_priv_key_ba
              )
              //console.log('解密出 rsa_private_key '+ rsa_private_key)

              //解密出 token
              let token_ba = res.data.token
              let tokens = token_ba.split('==')
              let trust_token = ''
              for (let index = 0; index < tokens.length - 1; index++) {
                let element = tokens[index]
                //console.log(element)
                trust_token += Crypto.decryptRsa(
                  rsa_private_key,
                  element + '=='
                )
              }
              //console.log('解密出token：'+ trust_token)
              this.ttoken = trust_token
              let check = {
                token: trust_token,
              }
              this.setCookies('token', trust_token) //  存储登录状态
              checkToken(check).then((res) => {
                if (res.success && res.data) {
                  this.$refs[formName].resetFields() //  清空表单
                  //this.$store.state.user.mk = this.MasterKey_af
                  localStorage.setItem('mk', this.MasterKey_af)
                  this.$router.replace(this.url) //  跳转到前一个页面或者网盘主页
                }
              })
            } else {
              this.$message.error(res.message)
              this.isPassing = false
              this.$refs.dragVerifyRef.reset()
            }
          })
          // login(this.loginForm, true).then((res) => {
          //   if (res.success) {
          //     this.setCookies('token', res.data.token) //  存储登录状态
          //     this.$refs[formName].resetFields() //  清空表单
          //     this.$router.replace(this.url)  //  跳转到前一个页面或者网盘主页
          //   } else {
          //     this.$message.error('手机号或密码错误！')
          //     this.isPassing = false
          //     this.$refs.dragVerifyRef.reset()
          //   }
          // })
        } else {
          this.$message.error('请完善信息！')
          return false
        }
      })
    },
  },
}
</script>
<style lang="stylus" scoped>
.login-wrapper
  height: 100vh
  .login-header
    width: 100%
  .form-content
    display: flex
    align-items: center
    justify-content: center
    height: calc(100vh - 69px)
    background: url('../assets/images/common/bg1.jpg') no-repeat
    // background: url("https://pan.baidu.com/static/images/16new/bg1.jpg");
    background-size: cover
    .form-wrapper
      width: 375px
      height: 400px
      min-height: 400px
      text-align: center
      border-radius: 3px
      background: white
      -webkit-box-shadow: rgba(0, 0, 0, 0.3) 0 0 50px
      -moz-box-shadow: #000 0 0 50px
      box-shadow: rgba(0, 0, 0, 0.3) 0 0 50px
      .login-title
        margin-top: 30px
        font-weight: 800
        color: #000
      .login-system
        font-weight: 300
        color: #999
      .login-form
        width: 100%
        margin-top: 10px
        padding: 30px
        >>> .el-form-item__content
          margin-left: 0 !important
        &>>> .el-input__inner
          font-size: 16px
        .login-btn-form-item
          .login-btn
            width: 100%
          &>>> .el-button
            padding: 10px 90px
            font-size: 16px
      .tip
        width: 70%
        margin-left: 86px
</style>
