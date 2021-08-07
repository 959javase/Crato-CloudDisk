<template>
  <div class="header-wrapper">
    <img class="logo" :src="logoUrl" @click="$router.push({ path: '/' })" />
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" router>
      <!-- <div class="el-menu-item exit" @click="exitButton()" v-show="isLogin">    退出</div> -->
      <div class="el-menu-item username" v-show="isLogin" @click="drawer = !drawer">
        <i class="el-icon-s-fold" style="font-wight:400"></i>
      </div>
      <div class="el-menu-item username" v-show="isLogin">
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
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            size="large"></el-avatar>
          <div class="name" style="">{{userInfo.name}}</div>
        </div>
        <div class="drawer-wrap_content">
          <el-descriptions :column="1">
            <!-- <el-descriptions-item label="用户名">{{userInfo.name}}</el-descriptions-item> -->
            <el-descriptions-item label="手机号">{{userInfo.mobile}}</el-descriptions-item>
            <el-descriptions-item label="账户余额">{{userInfo.balance}}元</el-descriptions-item>
            <el-descriptions-item label="账号类型">{{userInfo.serviceType == 0 ? '按次付费' : '存储容量预付费'}}
            </el-descriptions-item>
            <el-descriptions-item v-if="userInfo.serviceType == 1" label="已用/总容量">
              {{userInfo.used}}/{{userInfo.fixedSpace}}G
            </el-descriptions-item>
          </el-descriptions>
          <el-progress :percentage="storagePercentage" :color="customColors"></el-progress>
        </div>
        <div class="drawer-wrap_about">
          <el-collapse v-model="activeName" accordion>
            <el-collapse-item title="功能" name="1">
              <div>安全的加密存储</div>
              <div>防盗链</div>
              <div>防篡改加密合同</div>
            </el-collapse-item>
            <el-collapse-item title="服务" name="2">
              <div>API接入</div>
            </el-collapse-item>
            <el-collapse-item title="关于公司" name="3">
              <div>NashCloud致力于区块链分布式存储技术研发的科技公司，以区块链技术为核心，为客户提供一站式分布式存储解决方案。</div>
            </el-collapse-item>
            <el-collapse-item title="反馈" name="4">
              <div>
                <el-input type="textarea" placeholder="请输入建议或反馈" v-model="textarea" maxlength="30"
                  show-word-limit>
                </el-input>
                <el-button type="text">提交</el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div class="drawer-wrap_footer">
          <el-button type="primary" size="default" @click="loginOut">退出登录</el-button>

        </div>
      </div>
    </el-drawer>

    <!-- <el-drawer title="" :visible.sync="drawer" :direction="direction"  show-close
      size=260>
      <div class="top-menu-scroll jspScrollable"
        style="overflow: hidden; padding: 0px; width: 256px;">
        <div class="jspContainer" style="width: 256px; height: 586px;">
          <div class="jspPane"
            style="padding: 0px; top: 0px; left: 0px; position: absolute; width: 238px;">
            <div class="top-menu-content">
              <div class="top-menu-logged">
                <div class="avatar-block presence away">
                  <div data-color="color13"
                    class="IrnT-C5Fn18 color13 avatar-wrapper small-rounded-avatar">
                    <el-avatar
                      src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                      size="large"></el-avatar>
                  </div>
                </div>
                <div class="user-info">
                  <div class="name" style="">{{userInfo.name}}</div>
                  <div class="email">biulifan@gmail.com</div>
                </div>
                <div class="clear"></div>
                <el-progress :percentage="storagePercentage" :color="customColors"
                  style="margin-top:20px"></el-progress>

                <div style="font-size:12px;margin-bottom:10px ">
                  <span>{{ storageValue | storageTrans }} </span> /
                  <span>{{ maxStorageValue | storageTrans(true) }}</span>
                  <el-button type="text" style="margin-left:20px">更多存储</el-button>
                </div>
                <el-collapse v-model="activeName" accordion>
                  <el-collapse-item title="功能" name="1">
                    <div>安全的加密存储</div>
                    <div>防盗链</div>
                    <div>防篡改加密合同</div>
                  </el-collapse-item>

                  <el-collapse-item title="服务" name="2">
                    <div>API接入</div>
                  </el-collapse-item>

                  <el-collapse-item title="关于公司" name="3">
                    <div>NashCloud致力于区块链分布式存储技术研发的科技公司，以区块链技术为核心，为客户提供一站式分布式存储解决方案。</div>
                  </el-collapse-item>

                  <el-collapse-item title="反馈" name="4">
                    <div>
                      <el-input type="textarea" placeholder="请输入建议或反馈" v-model="textarea"
                        maxlength="30" show-word-limit>
                      </el-input>
                      <el-button type="text">提交</el-button>
                    </div>

                  </el-collapse-item>
                </el-collapse>
                <el-button type="warning" style="margin-top:20px" @click="exitButton()">退出登录
                </el-button>

              </div>
            </div>
          </div>
        </div>
      </div>

    </el-drawer> -->
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'Header',
  data() {
    return {
      logoUrl: require('@/assets/images/common/logo_header.png'),
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
    }
  },
  created() {
    if (!this.isLogin) return
    this.$nextTick(() => {
      this.userInfo = JSON.parse(this.user.userInfoObj)
    })
    // console.log(this.userInfo)
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
      this.$message.success('exit success！')
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
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
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
    align-items: center
    // justify-content: center
    .name
      margin-left: 10px
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
    margin: 14px 24px 0 24px
    display: inline-block
    height: 55px
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
</style>
