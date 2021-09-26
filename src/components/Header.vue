<template>
  <div class="header-wrapper">
    <img class="logo" :src="logoUrl" @click="$router.push({ path: '/' })" />
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" router>
      <!-- <div class="el-menu-item exit" @click="exitButton()" v-show="isLogin">    退出</div> -->
      <div class="el-menu-item username" v-show="isLogin" @click="drawer = !drawer">
        <i class="el-icon-s-fold" style="font-wight:400"></i>
      </div>
      <div class="el-menu-item username" v-show="isLogin" @click="drawer = !drawer">
        <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          size="small"></el-avatar> <span style="color:black;font-weight:400">{{ userInfo.name }}
        </span>
        <!-- <i class="el-icon-s-opportunity" style="font-wight:400"></i> -->
      </div>
      <el-menu-item class="login" index="Login" :route="{ name: 'Login' }" v-show="!isLogin">登陆
      </el-menu-item>
      <!-- 生产环境 -->
      <!-- <el-menu-item class="register" v-if="isProductEnv" v-show="!isLogin">
        <a href="https://www.crato.io/register" target="_blank">注册</a>
      </el-menu-item> -->
      <!-- 开发环境 -->
      <el-menu-item class="register" v-show="!isLogin" index="Register"
        :route="{ name: 'Register' }">注册</el-menu-item>
    </el-menu>
    <el-drawer title="用户信息" :visible.sync="drawer" :direction="direction" :modal="false"
      :destroy-on-close="true" :wrapperClosable="true" show-close size=260>
      <div class="drawer-wrap">
        <div class="drawer-wrap_header">
          <div class="avatar_wrap">
            <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              size="large"></el-avatar>
            <div class="name" style="">{{userInfo.name}}</div>
          </div>
          <div class="btn_wrap">
            <el-button type="primary" size="mini" @click="expand(1)">扩容</el-button>
            <el-button type="primary" size="mini" @click="expand(2)">延期</el-button>
          </div>

        </div>
        <div class=" drawer-wrap_content">
          <el-descriptions :column="1">
            <!-- <el-descriptions-item label="用户名">{{userInfo.name}}</el-descriptions-item> -->
            <el-descriptions-item label="手机号">{{userInfo.mobile}}</el-descriptions-item>
            <el-descriptions-item label="账户余额">{{userInfo.balance}}元</el-descriptions-item>
            <el-descriptions-item v-if="userInfo.serviceType" label="账号类型">
              {{userInfo.serviceType == 0 ? '按次付费' : '存储容量预付费'}}
            </el-descriptions-item>
            <el-descriptions-item v-else label="账号类型">未开通服务
            </el-descriptions-item>
            <el-descriptions-item v-if="userInfo.serviceType == 1" label="服务到期日期">
              {{userInfo.expiredTime}}
            </el-descriptions-item>
            <el-descriptions-item v-if="userInfo.serviceType == 1" label="已用/总容量">
              {{userInfo.used}}/{{userInfo.fixedSpace}}G
            </el-descriptions-item>
          </el-descriptions>
          <el-progress v-if="userInfo.serviceType == 1" :percentage="storagePercentage"
            :color="customColors"></el-progress>
        </div>
        <div class="drawer-wrap_about">
          <el-collapse v-model="activeName" accordion>
            <el-collapse-item title="功能" name="1">
              <div>安全存储</div>
              <div>防盗链</div>
              <div>防篡改</div>
            </el-collapse-item>
            <el-collapse-item title="服务" name="2">
              <div>API接入</div>
            </el-collapse-item>
            <el-collapse-item title="关于公司" name="3">
              <!-- <div>NashCloud致力于区块链分布式存储技术研发的科技公司，以区块链技术为核心，为客户提供一站式分布式存储解决方案。</div> -->
              <div>NashCloud纳什信息科技致力于分布式存储生态建设，产品主要应用于分布式存储的一站式解决方案、赋能区块链技术生态，并努力建立更好的商业模式。</div>
            </el-collapse-item>
            <!-- <el-collapse-item title="反馈" name="4">
              <div>
                <el-input type="textarea" placeholder="请输入建议或反馈" v-model="textarea" maxlength="30"
                  show-word-limit>
                </el-input>
                <el-button type="text">提交</el-button>
              </div>
            </el-collapse-item> -->
          </el-collapse>
        </div>
        <div class="drawer-wrap_footer">
          <el-button type="primary" size="default" @click="loginOut">退出登录</el-button>
        </div>
      </div>
    </el-drawer>
    <!-- 扩容&&延期 -->
    <el-dialog :title="expandFrom.expandType === 1 ?'扩充Crato云盘存储容量':'延长Crato云盘存储期限'"
      :visible.sync="expandShow" width="40%" center :close-on-click-modal="false"
      v-loading.fullscreen.lock="dialogLoading">
      <!-- 扩容表单 -->
      <el-form v-if="expandFrom.expandType === 1" ref="expandFrom" :model="expandFrom"
        :rules="expandRules">
        <template>
          <el-form-item label="当前容量" :label-width="formLabelWidth">
            <el-input v-model="userInfo.fixedSpace" disabled autocomplete="off"
              :style="{width: '50%'}">
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="当前到期时间" :label-width="formLabelWidth">
            <el-input v-model="userInfo.expiredTime" disabled autocomplete="off"
              :style="{width: '50%'}">
            </el-input>
          </el-form-item>
          <el-form-item label="扩充容量" prop="space" :label-width="formLabelWidth" required>
            <el-input v-model="expandFrom.space" @change="getTotalPay" autocomplete="off"
              :style="{width: '50%'}">
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="费用合计" :label-width="formLabelWidth">
            <el-input :style="{border:'none',width: '50%'}" disabled v-model="orderInfo.amount"
              autocomplete="off">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <!-- 延期表单 -->
      <el-form v-if="expandFrom.expandType === 2" ref="deferredFrom" :model="expandFrom"
        :rules="deferredRules">
        <template>
          <el-form-item label="当前容量" :label-width="formLabelWidth">
            <el-input v-model="userInfo.fixedSpace" disabled autocomplete="off"
              :style="{width: '50%'}">
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="当前到期时间" :label-width="formLabelWidth">
            <el-input v-model="userInfo.expiredTime" disabled autocomplete="off"
              :style="{width: '50%'}">
            </el-input>
          </el-form-item>
          <el-form-item label="延长期限" prop="duration" :label-width="formLabelWidth" required>
            <el-select v-model="expandFrom.duration" @change="getTotalPay" placeholder="请选择延长服务期限">
              <el-option label="3个月" :value="90"></el-option>
              <el-option label="6个月" :value="180"></el-option>
              <el-option label="12个月" :value="365"></el-option>
              <el-option label="36个月" :value="1095"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="费用合计" :label-width="formLabelWidth">
            <el-input :style="{border:'none',width: '50%'}" disabled v-model="orderInfo.amount"
              autocomplete="off">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary"
          @click="expandFrom.expandType === 1?payConfirm('expandFrom'):payConfirm('deferredFrom')">
          {{expandFrom.expandType === 1 ? '付费扩容':'付费延期'}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="expandFrom.expandType === 1 ? '付费扩容':'付费延期'" :visible.sync="dialogPay"
      width="30%" center :close-on-click-modal="false" :show-close="false"
      :close-on-press-escape="false">
      <div class="qrcode">
        <div class="qrcode_title"></div>
        <div class="qrcode_img">
          <vue-qr :text="payUrl" :logoScale="0.3" :whiteMargin="true" :callback="test" qid="testid">
          </vue-qr>
        </div>
        <div class="qrcode_tip">请使用微信扫码付款</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogPay = false">再想想</el-button>
        <el-button type="primary" @click="getOrderSateActive">已付款</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  openCrato,
  createOrder,
  getWxPay,
  queryOrderState,
} from '@/request/crato.js'
import VueQr from 'vue-qr'
import { deferred, expand } from '@/request/crato.js'
export default {
  name: 'Header',
  components: {
    VueQr,
  },
  data() {
    return {
      logoUrl: require('@/assets/images/common/logo_header.png'),
      formLabelWidth: '150px',
      textarea: '',
      currentDate: new Date(),
      drawer: false,
      direction: 'rtl',
      customColor: '#409eff',
      percentage: 0,
      customColors: [
        { color: '#67C23A', percentage: 40 },
        { color: '#E6A23C', percentage: 80 },
        { color: '#F56C6C', percentage: 100 },
      ],
      activeName: '1',
      maxStorage: 0,
      userInfo: {},
      expandShow: false,
      dialogPay: false,
      payUrl: '',
      orderInfo: {},
      getOrderStateTimer: '',
      dialogLoading: false,
      expandDays: '',
      expandFrom: {
        expandType: 1, // 1 扩容 ；2 延期
        space: 0,
      },
      // 扩容表单验证
      expandRules: {
        space: [
          { required: true, message: '请输入扩充容量', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value < 100) {
                callback(new Error('最低扩充容量为100GB'))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
      // 延期表单验证
      deferredRules: {
        duration: [
          { required: true, message: '请选择延长期限', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    if (!this.isLogin) return
    // this.$store.dispatch('getUserInfo',)
    // TODO 需要在每个页面对用户 余额 和容量信息更新 需要发送请求，修改getUserInfo
    this.userInfo = JSON.parse(this.user.userInfoObj)
    this.userInfo.expiredTime = this.userInfo.expiredTime.slice(0, 10)
    // 更新用户数据
    this.$store.dispatch('getUserInfo', this.userInfo.userId)
    console.log(this.userInfo)
  },
  computed: {
    ...mapGetters(['isLogin']),
    ...mapState(['user']),
    // 当前激活菜单的 index
    activeIndex() {
      return this.$route.name || 'Home' //  获取当前路由名称
    },
    isProductEnv() {
      return (
        process.env.NODE_ENV !== 'development' &&
        location.origin === 'https://crato.io'
      )
    },
    // 存储容量
    storageValue() {
      //getstorage
      // console.log(this.$store.state.sideMenu.storageValue);
      return this.$store.state.sideMenu.storageValue
    },
    maxStorageValue() {
      return this.$store.state.sideMenu.maxStorage
    },
    // 存储百分比
    storagePercentage() {
      return Number(
        ((this.userInfo.used / this.userInfo.fixedSpace) * 100)
          .toString()
          .split('.')[0]
      )
    },
  },
  methods: {
    /**
     * 退出登录
     * @description 清除 cookie 存放的 token 和 viewDomain 并跳转到登录页面
     */
    loginOut() {
      this.$message.success('退出成功！')
      this.drawer = false
      // this.$store.dispatch('getUserInfo').then(() => {
      //   this.removeCookies('viewDomain')
      //   this.removeCookies('token')
      //   this.$router.push({ path: '/login' })
      // })
      this.$store.dispatch('loginOut').then(() => {
        this.$router.push({ path: '/login' })
      })
    },
    // handleOpen(key, keyPath) {
    //   console.log(key, keyPath)
    // },
    // handleClose(key, keyPath) {
    //   console.log(key, keyPath)
    // },
    // 获取总价
    getTotalPay() {
      this.dialogLoading = true
      if (this.expandFrom.expandType == 1) {
        // 扩容 到期时间不变
        // 计算距离到期日期的剩余天数
        let today = this.parseTime(new Date(), '{y}-{m}-{d}')
        this.expandDays = this.getDaysBetween(today, this.userInfo.expiredTime)
        createOrder({
          username: this.userInfo.name,
          fileSize: this.expandFrom.space,
          days: this.expandDays,
          userType: this.userInfo.serviceType,
        }).then((res) => {
          this.orderInfo = res.data
          this.dialogLoading = false
        })
      } else {
        // 延期 存储容量不变
        createOrder({
          username: this.userInfo.name,
          fileSize: this.userInfo.fixedSpace,
          days: this.expandFrom.duration,
          userType: this.userInfo.serviceType,
        }).then((res) => {
          this.orderInfo = res.data
          this.dialogLoading = false
        })
      }
    },
    /**
     * 扩容&&延期
     * @param type 1 扩容；2 延期
     */
    expand(type) {
      this.expandFrom.expandType = type
      this.expandShow = true
    },
    // 付费扩容&&延期
    payConfirm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.dialogLoading = true
          getWxPay({
            orderNo: this.orderInfo.orderNo,
            amount: this.orderInfo.amount,
            origin: 'crato',
            description: this.orderInfo.orderDesc,
            user: this.userInfo.name,
          })
            .then((res) => {
              this.dialogLoading = false
              this.payUrl = res.message
              this.dialogPay = true
              // 轮询查询订单状态
              this.getOrderStateTimer = setTimeout(() => {
                this.getOrderState()
              }, 1000)
            })
            .catch((err) => {
              this.dialogLoading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 生成二维码时
    test(dataUrl, id) {
      // console.log(dataUrl, id)
    },
    // 获取订单状态
    getOrderState() {
      queryOrderState({
        orderNo: this.orderInfo.orderNo,
      })
        .then((res) => {
          if (res.code == '200' && res.message == '1') {
            this.$message.success('支付成功')
            clearTimeout(this.getOrderStateTimer)
            this.dialogPay = false
            this.expandShow = false
            this.dialogLoading = true
            if (this.expandFrom.expandType == 1) {
              // 扩容
              this.handleExpand()
            } else {
              // 延期
              this.handleDeferred()
            }
          } else {
            clearTimeout(this.getOrderStateTimer)
            this.getOrderStateTimer = setTimeout(() => {
              this.getOrderState()
            }, 1000)
          }
        })
        .catch((err) => {
          clearTimeout(this.getOrderStateTimer)
        })
    },
    // 手动获取订单状态
    getOrderSateActive() {
      this.dialogLoading = true
      queryOrderState({
        orderNo: this.orderInfo.orderNo,
      }).then((res) => {
        if (res.code == '200' && res.message == '1') {
          this.expandShow = false
          this.$message.success('支付成功')
        } else {
          this.dialogLoading = false
          this.$message.error('查询订单支付失败，请确认是否付款')
        }
      })
    },
    handleExpand() {
      expand({
        name: this.userInfo.name,
        fileSize: this.expandFrom.space,
      })
        .then((res) => {
          this.dialogLoading = false
          if (res.code == 0) {
            this.$message.success('扩容成功')
          }
          // 更新用户数据
          this.$store.dispatch('getUserInfo', this.userInfo.userId)
        })
        .catch((err) => {
          this.$message.error(err.message)
          this.dialogLoading = false
        })
    },
    handleDeferred() {
      deferred({
        name: this.userInfo.name,
        days: this.expandFrom.duration,
      })
        .then((res) => {
          this.dialogLoading = false
          if (res.code == 0) {
            this.$message.success('延期成功')
          }
          // 更新用户数据
          this.$store.dispatch('getUserInfo', this.userInfo.userId)
        })
        .catch((err) => {
          this.dialogLoading = false
          this.$message.error(err.message)
        })
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
// 侧边抽屉Drawer样式
.drawer-wrap
  width: 260px
  padding: 20px
  padding-top: 0
  .drawer-wrap_header
    display: flex
    flex-direction: column
    .avatar_wrap
      display: flex
      align-items: center
    .btn_wrap
      margin-top: 10px
      display: flex
  .drawer-wrap_content
    margin-top: 20px
  .drawer-wrap_about
    margin-top: 30px
  .drawer-wrap_footer
    margin-top: 30px
.header-wrapper
  width: 100%
  box-shadow: $tabBoxShadow
  display: flex
  .logo
    margin: 0 24px
    display: inline-block
    height: 70px
    cursor: pointer
  >>> .el-menu--horizontal
    .el-menu-item:not(.is-disabled):hover
      // border-bottom-color: $Primary !important;
      // background: $tabBackColor;
  .el-menu-demo
    flex: 1
    .headerLogo
      color: $Primary
      font-size: 60px
      opacity: 1
      cursor: default
      a
        display: block
    .login, .register, .username, .exit
      float: right
.top-menu-scroll
  height: calc(100% - 30px)
.jspContainer
  position: relative
  min-height: 100%
  min-width: 100%
  overflow: hidden
.jspPane
  position: absolute
  min-width: 100%
  max-width: 100%
.top-menu-content
  padding: 0px 0px 28px
.top-menu-logged
  margin-bottom: -6px
  font-family: LatoWeb, Arial
  padding: 12px 26px 0px
  .plan
    font-size: 14px
    line-height: 18px
    color: rgb(0, 0, 0)
    padding: 25px 0px 3px
  .avatar-block
    float: left
    padding-right: 11px
    position: relative
    cursor: pointer
    margin: 0px 0px 0px -3px
  .user-info
    float: left
    cursor: pointer
    max-width: 160px
    white-space: nowrap
    .name
      font-size: 16px
      line-height: 18px
      color: rgb(55, 55, 55)
      font-family: LatoWebBold, Arial
      padding: 1px 0px 0px
      text-overflow: ellipsis
      overflow: hidden
    .email
      font-size: 14px
      line-height: 16px
      color: rgb(102, 102, 102)
.clear
  clear: both
  margin: 0px
  padding: 0px
  display: block
.qrcode
  text-align: center
  .qrcode_title
    font-size: 20px
    font-weight: bold
</style>
