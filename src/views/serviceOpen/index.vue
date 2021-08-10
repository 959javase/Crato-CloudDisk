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
      :close-on-click-modal="false">
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
            <el-input :style="{border:'none',width: '30%'}"
              v-loading.fullscreen.lock="dialogLoading" disabled v-model="orderInfo.amount"
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
    <el-dialog title="付款" :visible.sync="dialogPay" width="30%" center
      :close-on-click-modal="false">
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
        <el-button type="primary" @click="dialogPay = false">已付款</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import { openCrato, createOrder, getWxPay } from '@/request/crato.js'
import { mapState } from 'vuex'
import VueQr from 'vue-qr'

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
      },
      isAgree: false,
      loading: false,
      userId: null,
      orderInfo: {
        amount: 0,
      },
      payUrl: '',
      dialogLoading: false,
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
    test(dataUrl, id) {
      console.log(dataUrl, id)
    },
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
    openService(type) {
      if (this.isAgree) {
        this.loading = true
        console.log(type)
        this.dialogLoading = true
        if (type == 0) {
          console.log('无需付费开通')
        } else {
          console.log('需要付费开通')
          getWxPay({
            orderNo: this.orderInfo.orderNo,
            amount: this.orderInfo.amount,
            origin: 'crato',
            description: this.orderInfo.orderDesc,
            user: this.serviceFrom.name,
          }).then((res) => {
            console.log(res.message)
            this.dialogLoading = false
            this.payUrl = res.message
            this.dialogPay = true
          })
        }
        // openCrato(this.serviceFrom)
        //   .then((res) => {
        //     this.$store.dispatch('getUserInfo', this.userId)
        //     this.loading = false
        //   })
        //   .catch((err) => {
        //     this.loading = false
        //   })
      } else {
        this.$message({
          message: '请阅读付费标准后同意后确认开通',
          type: 'warning',
        })
      }
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