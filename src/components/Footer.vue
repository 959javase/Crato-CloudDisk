<template>
  <div class="footer-wrapper">
    <div class="copy-right-wrapper">
      <!-- <img class="logo" :src="logoUrl" :alt="$store.getters.imgAlt + 'footerLogo'" />-->
      <div class="copy-right" style="align-items: center;margin:0 auto" > 
        <span >Crato.io</span>
        <!-- <span class="split">|</span>
        <span
          ><a class="link" style="color: white" href="http://beian.miit.gov.cn/" target="_blank">陕ICP备19020251号</a
          >&nbsp;</span
        >
        <p class="tip-website">
          为获得最佳浏览体验，建议使用IE11、FireFox50.5、Chrome51.0及以上版本的浏览器
        </p> -->
      </div>
    </div>
    <!-- <div class="join-us">
      <div class="desc">如果你也是对技术感兴趣的小伙伴，欢迎加入我们</div>
      <ul class="join-list">
        <li class="join-item" v-for="(item, index) in joinList" :key="index">
          <el-popover placement="top" trigger="hover">
            <img class="img" :src="item.img" :alt="`${$store.getters.imgAlt} ${item.title}`" style="width: 130px" />
            <i slot="reference" :class="`iconfont ${item.logo} ${item.class}`"></i>
          </el-popover>
        </li>
      </ul>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      
      
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl';

.footer-wrapper {

  display: flex;

  .copy-right-wrapper {
    width: 100%;
    color: $BorderLight;
    background: linear-gradient(to right, $Primary, #66b1ff);
    padding: 16px 0 16px 5vw;
    font-size: 14px;
    // color: $BorderLight;
    display: flex;

    align-items: center;

    .logo {
      width: 240px;
      display: block;
    }

    .split {
      margin: 0 8px;
    }

    .link {
      &:hover {
        text-decoration: underline;
      }
    }

    .tip-website {
      padding-top: 8px;
    }
  }

  .join-us {
    background: linear-gradient(to right, $Placeholder, $Info);
    width: 35%;
    padding: 16px 5vw 16px 40px;
    color: #fff;

    .join-list {
      margin-top: 16px;
      display: flex;

      .join-item {
        .iconfont {
          margin-right: 16px;
          font-size: 30px;
          cursor: pointer;
        }}
    }
  }
}
</style>
