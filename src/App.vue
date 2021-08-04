<template>
  <div id="app">
    <!-- <el-container>
      <el-header>
        <Header />
      </el-header>
      <el-container>
        <AsideMenu />
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container> -->
    <router-view />
    <!-- <Header v-if="isHeaderShow" id="headWrapper"></Header>
    <router-view class="mainContent"></router-view>
    <Footer v-if="isFooterShow"></Footer>
    <el-backtop class="backtop" target="#app" title="回到顶部"></el-backtop>
    <global-uploader v-if="isFileAboutShow"></global-uploader>
    <img-preview v-if="isFileAboutShow"></img-preview>
    <video-preview v-if="isFileAboutShow"></video-preview> -->
  </div>
</template>

<script>


export default {
  name: 'App',
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
  },
}
</script>
<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl'
</style>
