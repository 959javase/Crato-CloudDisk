<template>
  <div class="service-wrap">
    <div class="service-header">
      <Header />
    </div>
    <div class="service-open">
      <div class="service-open_title">
        您的Crato云盘服务暂未开通，请先开通后使用
      </div>
      <div class="service-open_btn">
        <el-button class="open_btn" type="primary" size="large" @click="openServiceShow= true">
          开通Crato云盘服务
        </el-button>
      </div>
    </div>
    <!-- 服务开通弹出框 -->
    <el-dialog title="开通Crato云盘服务" :visible.sync="openServiceShow" center
      :close-on-click-modal="false" v-loading.fullscreen.lock="dialogLoading">
      <el-form :model="serviceFrom">
        <el-form-item label="服务方式" :label-width="formLabelWidth">
          <el-radio-group v-model="serviceFrom.serviceType">
            <el-radio :label="0">按次付费</el-radio>
            <el-radio :label="1">按存储空间付费</el-radio>
          </el-radio-group>
          <el-tag :style="{marginLeft:'10px'}" type="danger" size="mini">服务方式开通后无法变更</el-tag>
        </el-form-item>
        <template v-if="serviceFrom.serviceType === 1">
          <el-form-item label="存储空间" :label-width="formLabelWidth">
            <el-input v-model="serviceFrom.space" @change="getTotalPay" autocomplete="off"
              :style="{width: '30%'}">
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="服务期限" :label-width="formLabelWidth">
            <el-select v-model="serviceFrom.duration" @change="getTotalPay" placeholder="请选择服务期限">
              <el-option label="3个月" :value="90"></el-option>
              <el-option label="6个月" :value="180"></el-option>
              <el-option label="12个月" :value="365"></el-option>
              <el-option label="36个月" :value="1095"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="预付费合计" :label-width="formLabelWidth">
            <el-input :style="{border:'none',width: '30%'}" disabled v-model="orderInfo.amount"
              autocomplete="off">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <el-descriptions direction="vertical" :column="2" border>
        <template slot="title">
          付费标准
          <el-checkbox v-model="isAgree">已阅读并且同意该付费标准</el-checkbox>
        </template>
        <el-descriptions-item label="按次付费">1G每天只需0.01元</el-descriptions-item>
        <el-descriptions-item label="注意事项">每次上传按照文件大小及存储时长进行收费；不满1G时按照1G收费；合计金额=文件大小*服务期限*0.01元
        </el-descriptions-item>
        <el-descriptions-item label="按存储空间付费">1G每天只需0.005元</el-descriptions-item>
        <el-descriptions-item label="注意事项">按照存储容量和时长预付费使用；最低100G起；预付费合计=存储容量*服务期限*0.005元
        </el-descriptions-item>
        <el-descriptions-item label="服务期限">3个月=90天；6个月=180天；12个月=365天；36个月=1095天
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="openService(serviceFrom.serviceType)">
          {{serviceFrom.serviceType == 0 ? '开 通' : '付费开通'}}</el-button>
      </div>
    </el-dialog>
    <el-dialog title="付款" :visible.sync="dialogPay" width="30%" center :close-on-click-modal="false"
      :show-close="false" :close-on-press-escape="false">
      <div class="qrcode">
        <div class="qrcode_title">容量:{{serviceFrom.space}}G,期限:{{serviceFrom.duration}}天</div>
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
import Header from '@/components/Header.vue'
import {
  openCrato,
  createOrder,
  getWxPay,
  queryOrderState,
} from '@/request/crato.js'
import { mapState } from 'vuex'
import VueQr from 'vue-qr'
import { queryAccount } from '@/request/user.js'

export default {
  name: 'serviceOpen',
  components: {
    Header,
    VueQr,
  },
  data() {
    return {
      // 弹出框是否显示
      openServiceShow: false,
      dialogPay: false,
      formLabelWidth: '120px',
      serviceFrom: {
        // username: ,
        serviceType: 0,
        prepayTotal: 0,
        space: 100,
      },
      isAgree: false,
      loading: false,
      userId: null,
      orderInfo: {
        amount: 0,
      },
      payUrl: '',
      dialogLoading: false,
      getOrderStateTimer: '',
    }
  },
  mounted() {},
  created() {
    this.serviceFrom.name = JSON.parse(this.user.userInfoObj).name
    this.userId = JSON.parse(this.user.userInfoObj).userId
    this.$store.dispatch('getUserInfo', this.userId)
  },
  computed: {
    ...mapState(['user']),
    // getPrepayTotal: function () {
    //   return (this.serviceFrom.space * this.serviceFrom.duration * 5) / 1000
    // },
  },
  watch: {
    // getPrepayTotal: {
    //   handler: function () {
    //     this.serviceFrom.prepayTotal =
    //       (this.serviceFrom.space * this.serviceFrom.duration * 5) / 1000
    //     return (this.serviceFrom.space * this.serviceFrom.duration * 5) / 1000
    //   },
    // },
  },

  methods: {
    // 生成二维码时
    test(dataUrl, id) {
      // console.log(dataUrl, id)
    },
    // 获取订单状态
    getOrderState() {
      queryOrderState({
        orderNo: this.orderInfo.orderNo,
      }).then((res) => {
        console.log(res)
        if (res.code == '200' && res.message == '1') {
          this.$message.success('支付成功，正在开通服务')
          clearTimeout(this.getOrderStateTimer)
          this.dialogPay = false
          this.openServiceShow = false
          this.dialogLoading = true
          this.openCrato()
        } else {
          clearTimeout(this.getOrderStateTimer)
          this.getOrderStateTimer = setInterval(() => {
            this.getOrderState()
          }, 1000)
        }
      })
    },
    // 手动获取订单状态
    getOrderSateActive() {
      this.dialogLoading = true
      queryOrderState({
        orderNo: this.orderInfo.orderNo,
      }).then((res) => {
        if (res.code == '200' && res.message == '1') {
          this.openServiceShow = false
          this.openCrato()
          this.$message.success('支付成功，正在开通服务')
        } else {
          this.dialogLoading = false
          this.$message.error('查询订单支付失败，请确认是否付款')
        }
      })
    },
    // 获取总价
    getTotalPay() {
      if (this.serviceFrom.space && this.serviceFrom.duration) {
        this.dialogLoading = true
        createOrder({
          username: this.serviceFrom.name,
          fileSize: this.serviceFrom.space,
          days: this.serviceFrom.duration,
          userType: this.serviceFrom.serviceType,
        }).then((res) => {
          this.orderInfo = res.data
          this.dialogLoading = false
        })
      }
    },
    // 开通服务
    openService(type) {
      if (this.isAgree) {
        this.dialogLoading = true
        if (type == 0) {
          this.openCrato()
        } else {
          if (this.serviceFrom.space < 100) {
            this.$message.error('最低100G容量起购')
            this.dialogLoading = false
            return
          }
          getWxPay({
            orderNo: this.orderInfo.orderNo,
            amount: this.orderInfo.amount,
            origin: 'crato',
            description: this.orderInfo.orderDesc,
            user: this.serviceFrom.name,
          }).then((res) => {
            this.dialogLoading = false
            this.payUrl = res.message
            this.dialogPay = true
            this.getOrderStateTimer = setInterval(() => {
              this.getOrderState()
            }, 1000)
          })
        }
      } else {
        this.$message({
          message: '请阅读付费标准后同意后确认开通',
          type: 'warning',
        })
      }
    },
    // 付款成功或无需付款开通服务
    openCrato() {
      openCrato(this.serviceFrom)
        .then((res) => {
          this.dialogLoading = false
          this.openServiceShow = false
          this.updateUserInfo(this.userId)
        })
        .catch((err) => {
          this.dialogLoading = false
          this.$message.eror('开通失败')
        })
    },
    // 更新用户数据
    updateUserInfo(userid) {
      queryAccount({ userId: userid })
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
              title: '服务开通成功',
              message: '服务开通成功',
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
              title: '服务开通成功',
              message: '服务开通成功',
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
    },
  },
}
</script>

<style lang="stylus">
.service-wrap
  height: 100vh
  .service-open
    height: calc(100vh - 69px)
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    .service-open_title
      font-size: 40px
      font-weight: bold
    .service-open_btn
      margin-top: 40px
      .open_btn
        // width: 100px
        height: 50px
.qrcode
  text-align: center
  .qrcode_title
    font-size: 20px
    font-weight: bold
</style>