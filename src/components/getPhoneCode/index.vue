<template>
  <div class="code_wrapper">
    <!-- 获取验证码按钮 -->
    <!-- <span class="get_code" @click="getPhoneCode()" :disabled="BtnSms">{{smsTip}}</span> -->
    <el-button class="loginright_btn" type="primary" size="small" @click="getPhoneCode()"
      :disabled="BtnSms">
      {{smsTip}}
    </el-button>
  </div>

</template>

<script>
import { sendSms } from '@/request/user.js'
export default {
  props: {
    mobile: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      count: 60, //当前倒计时
      BtnSms: false, //控制验证码按钮是否可用
      timer: '', //定时器名称
      smsTip: '获取验证码', //验证码文本
    }
  },
  methods: {
    getPhoneCode() {
      sendSms({
        mobile: this.mobile,
      })
        .then((res) => {
          this.$emit('getCode',res.uuid)
        })
        .catch((err) => {})
      this.BtnSms = true
      this.countDownTimer()
    },
    //获取验证码倒计时
    countDownTimer: function () {
      this.BtnSms = true
      this.smsTip = this.count + '秒后重新获取'
      this.timer = setInterval(() => {
        this.count -= 1
        if (this.count > 0) {
          this.smsTip = this.count + '秒后重新获取'
        } else {
          this.BtnSms = false
          this.smsTip = '获取验证码'
          this.count = 60
          clearInterval(this.timer)
        }
      }, 1000)
    },
  },
}
</script>

<style lang='stylus' scoped>
.loginright_btn
  margin-left: 10px
  width: 98px
  border-radius: 4px
  padding: 9px 0
  line-height: 24px
  font-size: 13px
  color: #fff
  border: 0
  text-align: center
  text-decoration: none
</style>