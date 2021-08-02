<template>
  <el-container>
    <el-header>
      <Header />
    </el-header>
    <el-container>
      <el-aside>
        <AsideMenu />
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Header from '@/components/Header.vue'
import AsideMenu from '@/views/file/components/AsideMenu/AsideMenu'
export default {
  name: 'App',
  components: {
    Header,
    AsideMenu
  },
  computed: {
    //  头部是否显示
    isHeaderShow() {
      let routerNameList = ['Error_401', 'Error_404', 'Error_500', 'Login']
      return routerNameList.includes(this.$route.name) ? false : true
    },
    //  底部是否显示
    isFooterShow() {
      let routerNameList = [
        'File',
        'Share',
        'MyShare',
        'Error_401',
        'Error_404',
        'Error_500',
      ]
      return routerNameList.includes(this.$route.name) ? false : true
    },
    // 网盘页面文件上传/预览相关组件是否显示
    isFileAboutShow() {
      let routerNameList = ['Login', 'Register']
      return routerNameList.includes(this.$route.name) ? false : true
    },
  },
}
</script>
<style lang="stylus" scoped>
.el-container
  // height: 100vh
  .el-header
    padding: 0
</style>
