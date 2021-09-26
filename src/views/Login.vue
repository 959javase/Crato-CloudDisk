<template>
  <div class="login-wrapper" id="loginBackground">
    <div class="login-header">
      <Header />
    </div>
    <div class="form-content" v-loading="loading">
      <div class="form-wrapper">
        <h3 class="login-title">{{isCodeLogin ? '手机验证码登录' : '用户名密码登录'}}</h3>
        <!-- <h1 class="login-system">Crato</h1> -->
        <!-- 账号密码登录表单 -->
        <el-form v-if="!isCodeLogin" class="login-form" ref="loginForm" :model="loginForm"
          :rules="loginFormRules" label-width="100px" hide-required-asterisk>
          <el-form-item prop="name">
            <el-input prefix-icon="el-icon-mobile-phone" v-model="loginForm.name" placeholder="用户名" clearable>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" placeholder="密码"
              show-password clearable>
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
          <a href="#" @click="codeLogin" style="margin-right:30px;font-weight:700"><span
              style="font-size:8pt">{{isCodeLogin ? '用户名密码登录' : '手机验证码登录'}}</span></a>
          <a href="/Register"><span style="font-size:8pt">没有账号？立即注册</span></a>
        </el-form>

        <!-- 手机验证码登录 -->
        <el-form v-else class="login-form" ref="codeLoginForm" :model="codeLoginForm"
          :rules="codeLoginRules" label-width="100px" hide-required-asterisk>
          <el-form-item prop="mobile">
            <el-input prefix-icon="el-icon-mobile-phone" v-model="codeLoginForm.mobile"
              placeholder="手机号" clearable>
            </el-input>
          </el-form-item>
          <!-- <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="codeLoginForm.password" placeholder="验证码"
              show-password>
            </el-input>
          </el-form-item> -->
          <el-form-item prop="phonecode" class="phone_code">
            <el-input prefix-icon="el-icon-lock" v-model="codeLoginForm.phonecode" placeholder="验证码"
              maxlength="6" :style="{width: '70%'}" clearable></el-input>
            <GetPhoneCode :mobile="codeLoginForm.mobile" />
          </el-form-item>
          <el-form-item>
            <drag-verify ref="dragVerifyRef" text="请按住滑块拖动解锁" successText="验证通过"
              handlerIcon="el-icon-d-arrow-right" successIcon="el-icon-circle-check"
              handlerBg="#F5F7FA" :width="315" :isPassing.sync="isPassing"
              @update:isPassing="updateIsPassing"></drag-verify>
          </el-form-item>
          <el-form-item class="login-btn-form-item">
            <el-button class="login-btn" type="primary" :disabled="loginBtnDisabled"
              @click="submitForm('codeLoginForm')">登陆</el-button>
          </el-form-item>
          <a href="#" @click="codeLogin" style="margin-right:30px;font-weight:700"><span
              style="font-size:8pt">{{isCodeLogin ? '用户名密码登录' : '手机验证码登录'}}</span></a>
          <a href="/Register"><span style="font-size:8pt">没有账号？立即注册</span></a>
        </el-form>
      </div>
    </div>

  </div>

</template>

<script>
import DragVerify from '@/components/common/DragVerify.vue' //  引入滑动解锁组件
import Header from '@/components/Header.vue'
import { login, queryAccount, mobileLogin, sendSms } from '@/request/user.js'
import GetPhoneCode from '@/components/getPhoneCode'
import globalFunction from '@/utils/globalFunction.js'
export default {
  name: 'Login',
  components: { DragVerify, Header, GetPhoneCode },
  data() {
    return {
      loading: false,
      isCodeLogin: false,
      // 手机验证码登录
      codeLoginForm: {},
      // 账号密码登录表单数据
      loginForm: {},
      password: '',
      token: '',
      // 登录表单验证规则
      loginFormRules: {
        name: [
          {
            required: true,
            message: '请输入用户名',
            trigger: ['change', 'blur'],
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['change', 'blur'],
          },
          {
            min: 5,
            max: 20,
            message: '长度在 5 到 20 个字符',
            trigger: ['change', 'blur'],
          },
        ],
      },
      codeLoginRules: {
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: ['change', 'blur'],
          },
        ],
        phonecode: [
          {
            required: true,
            message: '请输入验证码',
            trigger: ['change', 'blur'],
          },
        ],
      },
      isPassing: false, //  滑动解锁是否验证通过
      loginBtnDisabled: true, //  登录按钮是否禁用
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
      this.$router.replace({ name: '/' })
    }
  },
  methods: {
    /**
     * 切换登录方式
     */
    codeLogin() {
      this.isCodeLogin = !this.isCodeLogin
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
          this.loading = true
          let loginData = {}
          if (formName == 'codeLoginForm') {
            loginData = this.codeLoginForm
          } else {
            loginData = this.loginForm
          }
          login(loginData)
            .then((res) => {
              if (res.data) {
                globalFunction.setCookies('token', res.data.token)
                // this.$store.state
                // this.$store.dispatch('Login', res.data)
                this.$refs[formName].resetFields()
                queryAccount({ userId: res.data.userId })
                  .then((res) => {
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
                      this.$notify({
                        title: '成功',
                        message: '登陆成功',
                        type: 'success',
                      })
                      this.$store.commit('changeIsLogin', true)
                      this.$store.commit('changeUserInfoObj', userInfo)
                      this.loading = false
                      this.$router.push({ path: '/' })
                    } else {
                      userInfo = {
                        name: data.name,
                        mobile: data.mobile,
                        userId: data.id,
                        type: data.type,
                        balance: data.balance,
                        belong: data.belong,
                      }
                      this.$notify({
                        title: '成功',
                        message: '登陆成功',
                        type: 'success',
                      })
                      // sessionStorage.setItem('isLogin', true)
                      // sessionStorage.setItem('userInfoObj', JSON.stringify(userInfo))
                      this.$store.commit('changeIsLogin', true)
                      this.$store.commit('changeUserInfoObj', userInfo)
                      this.loading = false
                      this.$router.push({ path: '/serviceOpen' })
                    }
                  })
                  .catch((err) => {
                    console.log(err)
                    this.loading = false
                  })
              } else {
                this.$message.error(res.description)
                this.loading = false
              }
            })
            .catch((error) => {
              console.log(error)
              this.loading = false
            })
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
    background: url('../assets/images/common/bg4.jpg') no-repeat
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
          display: flex
          align-items: center
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
