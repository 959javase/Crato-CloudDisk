<template>
  <div class="side-menu-wrapper">
    <!-- collapse 属性：控制菜单收缩展开 -->
    <el-menu class="side-menu" :default-active="activeIndex" :router="true" :collapse="isCollapse"
      text-color="#000">
      <el-menu-item index="diskUsage" :route="{ name: 'diskUsage' }">
        <!-- <i class="el-icon-picture"></i> -->
        <span slot="title">大盘分析</span>
      </el-menu-item>
      <el-menu-item index="fileList" :route="{ name: 'fileList'}">
        <!-- <i class="el-icon-picture"></i> -->
        <span slot="title">文件列表</span>
      </el-menu-item>
      <el-menu-item v-if="this.userInfo.type == 'admin'" index="account" :route="{ name: 'account' }">
        <!-- <i class="el-icon-picture"></i> -->
        <span slot="title">账户管理</span>
      </el-menu-item>
      <!-- <i class="el-icon-picture"></i> -->
      <!-- <el-menu-item index="cost" :route="{ name: 'cost' }">
       
        <span slot="title">费用管理</span>
      </el-menu-item> -->
      <!-- <el-menu-item index="0" :route="{ name: 'File', query: { fileType: 0, filePath: '/' } }"> -->
      <!-- 图标均来自 Element UI 官方图标库 https://element.eleme.cn/#/zh-CN/component/icon -->
      <!-- <i class="el-icon-menu"></i>
        <span slot="title">全部</span>
      </el-menu-item>
      <el-menu-item index="1" :route="{ name: 'File', query: { fileType: 1 } }">
        <i class="el-icon-picture"></i>
        <span slot="title">图片</span>
      </el-menu-item>
      <el-menu-item index="2" :route="{ name: 'File', query: { fileType: 2 } }">
        <i class="el-icon-document"></i>
        <span slot="title">文档</span>
      </el-menu-item>
      <el-menu-item index="3" :route="{ name: 'File', query: { fileType: 3 } }">
        <i class="el-icon-video-camera-solid"></i>
        <span slot="title">视频</span>
      </el-menu-item>
      <el-menu-item index="4" :route="{ name: 'File', query: { fileType: 4 } }">
        <i class="el-icon-headset"></i>
        <span slot="title">音乐</span>
      </el-menu-item>
      <el-menu-item index="5" :route="{ name: 'File', query: { fileType: 5 } }">
        <i class="el-icon-takeaway-box"></i>
        <span slot="title">其他</span>
      </el-menu-item>
      <el-menu-item index="6" :route="{ name: 'File', query: { fileType: 6 } }">
        <i class="el-icon-box"></i>
        <span slot="title">回收站</span>
      </el-menu-item> -->
    </el-menu>
    <!-- 存储信息显示 -->
    <!-- <div class="storage-wrapper" :class="{ fold: isCollapse }">
      <el-progress :percentage="storagePercentage" :color="storageColor" :show-text="false"
        :type="isCollapse ? 'circle' : 'line'" :width="32" :stroke-width="isCollapse ? 4 : 6"
        stroke-linecap="square"></el-progress>
      <div class="text" v-show="!isCollapse">
        <span>存储</span>
        <span>{{ storageValue | storageTrans }} / {{ storageMaxValue | storageTrans(true) }}</span>
      </div>
      <div class="text" v-show="isCollapse">
        <span>{{ storageValue | storageTrans }}</span>
      </div>
    </div> -->
    <!-- 展开 & 收缩分类栏 -->
    <!-- <el-tooltip  :content="isCollapse ? '展开' : '收起'" placement="right">
      <div class="aside-title" @click="isCollapse ? (isCollapse = false) : (isCollapse = true)">
        <div class="top"></div>
        <i class="icon el-icon-d-arrow-right" v-if="isCollapse" title="展开" size="50"></i>
        <i class="icon el-icon-d-arrow-left" v-else title="收起" size="50"></i>
        <div class="bottom"></div>
      </div>
    </el-tooltip> -->
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'SideMenu',
  data() {
    return {
      isCollapse: false, //  控制菜单收缩展开
      storageMaxValue: Math.pow(1024, 3) * 10, //  最大存储容量，1GB
      //  自定义进度条颜色，不同占比，进度条颜色不同
      storageColor: [
        { color: '#67C23A', percentage: 50 },
        { color: '#E6A23C', percentage: 80 },
        { color: '#F56C6C', percentage: 100 },
      ],
    }
  },
  computed: {
    // 当前激活菜单的 index
    activeIndex() {
      // return String(this.$route.query.fileType) //  获取当前路由参数中包含的文件类型
      return String(this.$route.name)
    },
    ...mapState(['user']),
    ...mapGetters(['isLogin']),
    // 存储容量
    // storageValue() {
    //   //getstorage
    //   // console.log(this.$store.state.sideMenu.storageValue);
    //   return this.$store.state.sideMenu.storageValue
    // },
    // maxStorageValue() {
    //   return this.$store.state.sideMenu.maxStorage
    // },
    // 存储百分比
    // storagePercentage() {
    //   return (this.storageValue / this.maxStorageValue) * 100
    // },
  },
  watch: {
    // 监听收缩状态变化，存储在sessionStorage中，保证页面刷新时仍然保存设置的状态
    isCollapse(newValue) {
      this.setCookies('isCollapse', newValue)
    },
  },
  created() {
    this.isCollapse = this.getCookies('isCollapse') === 'true' //  读取保存的状态
    if (!this.isLogin) return
    this.userInfo = JSON.parse(this.user.userInfoObj)
    this.userInfo.expiredTime = this.userInfo.expiredTime.slice(0, 10)
    // 更新用户数据
    this.$store.dispatch('getUserInfo', this.userInfo.userId)
    console.log(this.userInfo)
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
@import '~@/assets/styles/mixins.styl'
.side-menu-wrapper
  // border: 1px red solid
  display: flex
  flex-direction: column
  overflow: hidden
  // position: relative
  height: calc(100vh - 77px)
  width: 200px
  // padding-right: 11px
  margin-top: 15px
  // margin-left: 30px
  .side-menu
    // border: 1px green solid
    // 高度设置为屏幕高度减去顶部导航栏的高度
    // height: calc(100vh - 137px)
    height: 100%
    width: 100%
    overflow: auto
    // 调整滚动条样式
    setScrollbar(6px, #909399, #EBEEF5)
  // 对展开状态下的菜单设置宽度
  // .side-menu:not(.el-menu--collapse)
  // width: 200px
  // 存储空间展示区
  .storage-wrapper
    border: 1px yellow solid
    // position: absolute
    // bottom: 0
    // left: 0
    box-sizing: border-box
    // width: calc(100% - 12px)
    width: 100%
    height: 66px
    padding: 16px
    z-index: 2
    .text
      margin-top: 8px
      display: flex
      justify-content: space-between
      align-items: center
      font-size: 14px
  .storage-wrapper.fold
    padding: 0
    >>> .el-progress--circle
      margin: 0 auto
      width: 32px
      display: block
    .text
      font-size: 12px
      justify-content: center
  // 折叠图标调整样式
  .aside-title
    position: absolute
    top: calc(50% - 50px)
    right: 0
    z-index: 3
    color: $BorderLight
    width: 12px
    height: 100px
    line-height: 100px
    cursor: pointer
    // transition left 0.5s
    // -webkit-transition left 0.5s
    &:hover
      opacity: 0.7
    .icon
      font-size: 12px
    .top
      position: absolute
      top: calc(50% - 50px)
      right: 0px
      width: 0
      height: 0
      border-bottom: 12px solid transparent
      border-right: 12px solid #fff
    .bottom
      position: absolute
      top: calc(50% + 38px)
      right: 0px
      width: 0
      height: 0
      border-top: 12px solid transparent
      border-right: 12px solid #fff
</style>
