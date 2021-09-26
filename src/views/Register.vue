<template>
  <div class="register-wrapper">
    <div class="login-header">
      <Header />
    </div>
    <div class="form-content" v-loading="loading">
      <div class="form-wrapper">
        <h1 class="register-title">注册账号</h1>
        <p class="register-system">Crato</p>
        <!-- 注册表单 -->
        <el-form class="register-form" ref="registerForm" :model="registerForm"
          :rules="registerFormRules" label-width="100px" hide-required-asterisk>
          <el-form-item prop="name">
            <el-input prefix-icon="el-icon-user" v-model="registerForm.name" placeholder="用户名"
              @change="checkName" clearable>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="registerForm.password" placeholder="密码"
              show-password clearable></el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input prefix-icon="el-icon-lock" v-model="registerForm.confirmPassword"
              placeholder="确认密码" show-password clearable></el-input>
          </el-form-item>
          <el-form-item prop="mobile">
            <el-input prefix-icon="el-icon-mobile-phone" v-model="registerForm.mobile"
              placeholder="手机号" @change="checkMobile" clearable></el-input>
          </el-form-item>
          <el-form-item prop="" class="phone_code">
            <el-input prefix-icon="el-icon-lock" v-model="registerForm.phonecode" placeholder="验证码"
              maxlength="6" :style="{width: '70%'}" clearable></el-input>
            <GetPhoneCode :mobile="registerForm.mobile" @getCode="getUuid" />
          </el-form-item>
          <el-form-item style="user-select: none">
            <drag-verify ref="dragVerifyRef" text="请按住滑块拖动解锁" successText="验证通过"
              handlerIcon="el-icon-d-arrow-right" successIcon="el-icon-circle-check"
              handlerBg="#F5F7FA" :width="375" :isPassing.sync="isPassing"
              @update:isPassing="updateIsPassing"></drag-verify>
          </el-form-item>
          <el-form-item class="registerButtonWrapper">
            <el-button class="registerButton" type="primary" :disabled="submitDisabled"
              @click="submitForm('registerForm')">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

  </div>
</template>

<script>
import DragVerify from '@/components/common/DragVerify.vue' //  引入滑动解锁组件
import Header from '@/components/Header.vue'
import { register, checkname, checkmobile, checkSms } from '@/request/user.js'
import GetPhoneCode from '@/components/getPhoneCode'

export default {
  name: 'Register',
  components: { DragVerify, Header, GetPhoneCode },
  data() {
    return {
      uuid: '',
      loading: false,
      checkNameTag: false,
      checkMobileTag: false,
      // 注册表单
      registerForm: {
        // mobile: '',
        // name: '',
        // password: '',
        // confirmPassword: '',
      },
      // 注册表单校验规则
      registerFormRules: {
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
        confirmPassword: [
          {
            required: true,
            message: '请再次输入密码',
            trigger: ['change', 'blur'],
          },
          {
            validator: (rules, value, callback) => {
              // return value === this.registerForm.password
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: ['change', 'blur'],
          },
          {
            validator: (rules, value, callback) => {
              // return value === this.registerForm.password
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: ['change', 'blur'],
          },
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: ['change', 'blur'],
          },
          {
            pattern: /^(?:(?:\+|00)86)?1\d{10}$/,
            transform(value) {
              return String(value)
            },
            message: '请输入正确的手机号',
            trigger: ['change', 'blur'],
          },
        ],
      },
      isPassing: false, //  滑动解锁是否验证通过
      submitDisabled: true, //  登录按钮是否禁用
    }
  },
  computed: {
    url() {
      let _url = this.$route.query.Rurl //  获取路由前置守卫中 next 函数的参数，即登录后要去的页面
      return _url ? _url : '/' //  若登录之前有页面，则登录后仍然进入该页面
    },
  },
  watch: {
    //  滑动解锁验证通过时，若重新输入手机号、用户名或密码，滑动解锁恢复原样
    'registerForm.mobile'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
    'registerForm.name'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
    'registerForm.password'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
    'registerForm.confirmPassword'() {
      this.isPassing = false
      this.$refs.dragVerifyRef.reset()
    },
  },
  created() {},
  methods: {
    /**
     * 滑动解锁完成 回调函数
     * @param {boolean} isPassing 解锁是否通过
     */
    updateIsPassing(isPassing) {
      if (isPassing) {
        //  校验手机号
        this.$refs.registerForm.validateField('mobile', (telephoneError) => {
          if (telephoneError) {
            this.submitDisabled = true
          } else {
            this.submitDisabled = false
          }
        })
      } else {
        this.submitDisabled = true
      }
    },
    // 校验用户名是否注册
    checkName() {
      this.checkname = false
      checkname({
        username: this.registerForm.name,
      })
        .then((res) => {
          if (res.data) {
            this.checkNameTag = true
          } else {
            this.$message.error(res.description)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    },
    // 校验手机号是否注册
    checkMobile() {
      this.checkMobileTag = false
      checkmobile({
        mobile: this.registerForm.mobile,
      })
        .then((res) => {
          if (res.data) {
            this.checkMobileTag = true
          } else {
            this.$error(res.description)
          }
        })
        .catch((err) => {})
    },
    /**
     * 注册按钮点击事件 表单验证&用户注册
     * @param {boolean} formName 表单ref值
     */
    submitForm(formName) {
      if (this.checkNameTag && this.checkMobileTag) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.loading = true
            // 表单各项校验通过
            // checkSms({
            //   phone: this.registerForm.mobile,
            //   code: this.registerForm.phonecode,
            //   uuid: this.uuid,
            // }).then((res) => {
            //   if (res.code == 200) {

            //   } else {
            //     this.loading = false
            //     this.$message.error(res.msg)
            //   }
            // })
            register(this.registerForm).then((res) => {
              if (res.code === 0) {
                this.$notify({
                  title: '成功',
                  message: '注册成功！已跳转到登录页面',
                  type: 'success',
                })
                this.$refs[formName].resetFields()
                this.$router.replace({ path: '/login' })
              } else {
                this.submitDisabled = true
                this.isPassing = false
                this.$refs.dragVerifyRef.reset()
                this.$message.error(res.description)
              }
              this.loading = false
            })
          } else {
            this.$message.error('请正确填写用户注册信息！')
            return false
          }
        })
      } else {
        this.$message.error('用户名或手机号已注册')
      }
    },
    getUuid(e) {
      this.registerForm.uuid = e
    },
  },
}
</script>
<style lang="stylus" scoped>
.register-wrapper
  // width: 100%
  height: 100vh
  .login-header
    width: 100%
  .form-content
    display: flex
    align-items: center
    justify-content: center
    height: calc(100vh - 69px)
    .form-wrapper
      width: 375px
      text-align: center
      .register-title
        margin-bottom: 10px
        font-weight: 300
        font-size: 30px
        color: #000
      .register-system
        font-weight: 300
        color: #999
      .register-form
        width: 100%
        margin-top: 20px
        >>> .el-form-item__content
          margin-left: 0 !important
          display: flex
          align-items: center
        &>>> .el-input__inner
          font-size: 16px
        .registerButtonWrapper
          .registerButton
            width: 100%
          &>>> .el-button
            padding: 10px 90px
            font-size: 16px
      .tip
        width: 70%
        margin-left: 86px
</style>
