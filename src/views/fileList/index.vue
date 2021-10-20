<template>
  <div class="file-container">
    <div class="file-header">
      <el-upload
        class="upload-file"
        ref="upload"
        action="https://api-hk.decoo.io/pinning/pinFile"
        :headers="headers"
        :data="datas"
        :before-upload="beforeUpload"
        :on-success="fileUploadSuccess"
        :on-change="fileAdded"
        :on-error="fileError"
        :auto-upload="false"
        :limit="1"
        :file-list="uploadFileList"
      >
        <el-button slot="trigger" type="primary" icon="el-icon-upload"
          >文件上传</el-button
        >
        <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
      </el-upload>
      <!-- <el-button type="primary" size="default" @click="floderUpload">文件夹上传</el-button> -->
    </div>
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="文件名" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="请输入文件名"
          clearable
          size="small"
        />
      </el-form-item>
      <!-- <el-form-item label="归属账号" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入归属账号" clearable size="small" />
      </el-form-item> -->
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="fileList" height="685">
      <el-table-column label="序号" align="center" width="50">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="文件名"
        align="center"
        prop="fileName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="大小" align="center" prop="fileSize" />
      <el-table-column
        label="CID"
        align="center"
        prop="cid"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="归属账号" align="center" prop="name" />
      <el-table-column label="成本" align="center" prop="cost" />
      <el-table-column label="创建日期" align="center" prop="dateTime" />
      <el-table-column label="到期日期" align="center" prop="expiredTime" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleUpload(scope.row)"
            >下载
          </el-button>
          <!-- <el-button size="mini" type="text" icon="el-icon-money" @click="handleRenew(scope.row)">续费
          </el-button> -->
          <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">
            删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      background
      @pagination="getListFile"
    />
    <!-- 按次收费上传 -->
    <el-dialog
      :title="userServiceType == 0 ? '按次收费上传文件' : '上传文件'"
      :visible.sync="openUploadShow"
      center
      :close-on-click-modal="false"
      :show-close="false"
      v-loading.fullscreen.lock="dialogLoading"
      width="40%"
      min-width="570px"
    >
      <el-form>
        <!-- 按次付费上传文件 -->
        <template v-if="userServiceType == 0">
          <el-form-item label="当前文件大小" :label-width="formLabelWidth">
            <el-input
              v-model="fileSize"
              autocomplete="off"
              :style="{ width: '30%' }"
              disabled
            >
              <template slot="append">G</template>
            </el-input>
            <el-tag :style="{ marginLeft: '10px' }" type="danger" size="mini"
              >上传文件不足10MB按照10MB收费
            </el-tag>
          </el-form-item>
          <el-form-item label="存储期限" :label-width="formLabelWidth">
            <el-select
              v-model="storageDays"
              @change="storageDaysChange"
              placeholder="请选择服务期限"
            >
              <el-option label="3个月" :value="90"></el-option>
              <el-option label="6个月" :value="180"></el-option>
              <el-option label="12个月" :value="365"></el-option>
              <el-option label="36个月" :value="1095"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="费用合计" :label-width="formLabelWidth">
            <el-input
              :style="{ border: 'none', width: '30%' }"
              disabled
              v-model="orderInfo.amount"
              autocomplete="off"
            >
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
          <div class="qrcode">
            <div class="qrcode_img">
              <vue-qr
                :text="payUrl"
                :logoScale="0.3"
                :whiteMargin="true"
                :callback="test"
                qid="testid"
              >
              </vue-qr>
            </div>
            <div class="qrcode_tip">请使用微信扫码付款</div>
          </div>
        </template>
      </el-form>
      <!-- 按存储容量上传文件 -->
      <el-form>
        <template v-if="userServiceType == 1">
          <el-form-item label="剩余容量大小" :label-width="formLabelWidth">
            <el-input
              v-model="surplusStroage"
              autocomplete="off"
              :style="{ width: '40%' }"
              disabled
            >
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="当前文件大小" :label-width="formLabelWidth">
            <el-input
              v-model="fileSize"
              autocomplete="off"
              :style="{ width: '40%' }"
              disabled
            >
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div v-if="userServiceType == 0" slot="footer" class="dialog-footer">
        <el-button @click="fileAbort">取消上传</el-button>
        <el-button type="primary" @click="getOrderSateActive"
          >已付费上传</el-button
        >
      </div>
      <div
        v-if="userServiceType == 1"
        slot="footer"
        class="dialog-footer"
        v-loading.fullscreen.lock="ipfsLoading"
        element-loading-text="IPFS解析文件中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
      >
        <el-button @click="fileAbort">取消上传</el-button>
        <el-button type="primary" @click="fileUpload">上传文件</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog title="付款" :visible.sync="dialogPay" width="30%" center :close-on-click-modal="false"
      :show-close="false" :close-on-press-escape="false">
      <div class="qrcode">
        <div class="qrcode_title">容量:{{fileSize}}G,期限:{{storageDays}}天</div>
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
    </el-dialog> -->
    <el-dialog :visible.sync="processShow" center :close-on-click-modal="false">
      <el-progress
        :text-inside="true"
        :stroke-width="26"
        :percentage="70"
      ></el-progress>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import getFileCid from '@decooio/sdk/src/getFileHash'
import crypto from 'public-encrypt/index'
import { RSAkey } from '@/common/RASkey'
import { Buffer } from 'safe-buffer/index'
import globalFunction from '@/utils/globalFunction.js'
import VueQr from 'vue-qr'
import {
  addFile,
  listFile,
  createOrder,
  getWxPay,
  queryOrderState,
} from '@/request/crato.js'

export default {
  name: 'Article',
  components: {
    VueQr,
  },
  data() {
    return {
      formLabelWidth: '120px',
      openUploadShow: false,
      // 遮罩层
      loading: false,
      ipfsLoading: false,
      ipfsUpLoading: '',
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文章管理表格数据
      fileList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: '',
        fileName: '',
        belong: '',
        expiredTime: '',
      },
      // 文件上传
      headers: {},
      datas: {},
      // 表单校验
      rules: {},
      // 用户类型 0 按次付费；1 按存储容量付费
      userServiceType: null,
      userInfo: {},
      decooToken: '',
      useraccesstoken: '',
      // 按次付费上传文件大小
      oneFileSize: '',
      // 按存储容量上传文件大小
      fileSize: '',
      // 按次付费显示内容
      storageDays: 90,
      // 费用合计
      cost: 0,
      // 用户剩余容量
      // surplusStroage: 0,
      // 下载src
      downloadSrc: '',
      dialogLoading: false,
      // 订单信息
      orderInfo: {},
      // 付款弹窗页面
      dialogPay: false,
      // 付款二维码url
      payUrl: '',
      getOrderStateTimer: '',
      // 支付成功标识
      payTag: false,
      // 上传文件列表
      uploadFileList: [],
      // 上传进度dialog
      processShow: false,
    }
  },
  computed: {
    ...mapState(['user']),
    // 用户剩余容量
    surplusStroage: function() {
      return globalFunction.downFixed(
        this.userInfo.fixedSpace - this.userInfo.used,
        2
      )
    },
  },
  created() {
    this.userInfo = JSON.parse(this.user.userInfoObj)
    this.userServiceType = this.userInfo.serviceType
    this.queryParams.username = this.userInfo.name

    if (this.userServiceType == 1) {
      let nowDate = new Date()
      // TODO: 这个有效期还需要再确认下
      this.storageDays = globalFunction.getNumberOfDays(
        nowDate,
        this.userInfo.expiredTime
      )
    }
    this.getListFile()
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getListFile()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.fileName = ''
      this.queryParams.name = ''
      this.handleQuery()
    },
    getListFile() {
      this.loading = true
      listFile(this.queryParams).then((res) => {
        this.fileList = res.rows
        this.total = res.total
        this.loading = false
      })
    },
    getDecooToken() {
      return axios({
        method: 'GET',
        url: 'https://api.decoo.io/oauth/accessToken',
      })
        .then((res) => {
          const { data } = res
          this.headers.UserAccessToken = data.Data
          console.log('2 useraccesstoken成功')
        })
        .catch((err) => {
          console.log(err)
        })
    },
    async fileAdded(file) {
      // 只让在文件选择完成后触发
      if (file.status !== 'ready') return
      // 计算文件大小单位是G，最小为0.01G
      const GB = Math.pow(1024, 3)
      // 小于10MB的文件按照0.01GB
      const MB = Math.pow(1024, 2)
      if (file.size > 10 * MB) {
        this.fileSize = globalFunction.downFixed(file.size / GB, 3)
      } else {
        this.fileSize = 0.01
      }
      console.log('1文件添加完成，获取token')
      await this.getDecooToken()
      // 按次上传：计算金额
      if (this.userServiceType == 0) {
        console.log('3按次上传，计算金额')
        await this.storageDaysChange()
      }
      this.openUploadShow = true
    },
    fileUpload() {
      this.$refs.upload.submit()
      console.log('5开始上传')
    },
    fileAbort() {
      this.uploadFileList = []
      this.openUploadShow = false
      clearTimeout(this.getOrderStateTimer)
      this.getOrderStateTimer = ''
      this.$message.info('取消上传')
    },
    handleUpload(e) {
      let url = `https://ipfs-hk.decoo.io/ipfs/${e.cid}?filename=${e.fileName}`
      window.open(url)
    },
    handleRenew(e) {
      console.log(e)
      console.log('续费这个文件')
    },
    handleDelete() {
      console.log('删除这个文件')
    },
    // 上传文件前：需要获取文件cid、secret
    async beforeUpload(file) {
      console.log('4上传文件之前')
      // 重置付款成功标识
      this.payTag = false
      // 获取文件cid
      this.ipfsLoading = true
      const cid = await getFileCid(file)
      this.ipfsLoading = false
      // getFileCid(file).then(res => {
      //   console.log(res);
      // }).catch(err => {
      //   console.log(err);
      // })
      this.datas.cid = cid
      // 获取secret
      this.datas.secret = crypto
        .privateEncrypt(RSAkey, Buffer.from(cid))
        .toString('base64')
      this.datas.decooOptions = {
        name: file.name,
      }
      localStorage.setItem('cid', this.datas.cid)

      await addFile({
        // 账号名称 name
        name: this.userInfo.name,
        // fileName
        fileName: file.name,
        // cid
        cid: this.datas.cid,
        // fileSize
        fileSize: this.fileSize,
        storageDays: this.storageDays,
        cost: this.orderInfo.amount,
      }).then((res) => {
        console.log('6将上传订单录入系统成功，下一步上传文件')
        // 如果是按次付费直接上传
        if (this.userServiceType == 0) {
          console.log('7按次付费 直接上传')
          this.ipfsUpLoading = this.$loading({
            lock: true,
            text: '文件上传中',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.8)',
          })
          return true
        } else {
          return new Promise((resolve, reject) => {
            this.$confirm('确认将此文件上传?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info',
            })
              .then(() => {
                this.openUploadShow = false
                this.ipfsUpLoading = this.$loading({
                  lock: true,
                  text: '文件上传中',
                  spinner: 'el-icon-loading',
                  background: 'rgba(0, 0, 0, 0.8)',
                })
                return resolve(true)
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: '已取消上传',
                })
                this.openUploadShow = false
                return reject(false)
              })
          })
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
          this.dialogLoading = false
          this.openServiceShow = false
          this.$message.success('支付成功，正在上传文件')
          this.fileUpload()
        } else {
          this.dialogLoading = false
          this.$message.error('查询订单支付失败，请确认是否付款')
        }
      })
    },
    // 获取订单状态
    getOrderState() {
      queryOrderState({
        orderNo: this.orderInfo.orderNo,
      }).then((res) => {
        if (res.code == '200' && res.message == '1') {
          // if (true) {
          clearTimeout(this.getOrderStateTimer)
          this.getOrderStateTimer = ''
          // this.dialogPay = false
          // this.dialogLoading = true
          // this.getDecooToken()
          console.log('4付款成功')
          this.fileUpload()
        } else {
          clearTimeout(this.getOrderStateTimer)
          this.getOrderStateTimer = ''
          this.getOrderStateTimer = setTimeout(() => {
            this.getOrderState()
          }, 1000)
        }
      })
    },
    // 生成二维码时
    test(dataUrl, id) {
      // console.log(dataUrl, id)
    },
    // 文件上传中

    // 文件上传完成
    fileUploadSuccess(res, file) {
      if (file.status == 'success') {
        this.openUploadShow = false
        this.ipfsUpLoading.close()
        this.$message({
          type: 'success',
          message: '文件上传成功!',
        })
        // TODO:将订单状态修改为已上传完成
        console.log('7文件上传完成，需要修改上传状态为已完成上传')
        this.uploadFileList = []
        localStorage.removeItem('cid')
        this.getListFile()
      }
    },
    // 文件上传出错
    fileError() {
      console.log('上传出错了')
    },
    // 计算按次收费总金额&&获取订单
    storageDaysChange() {
      console.log('应该是4计算金额')
      this.dialogLoading = true
      createOrder({
        username: this.queryParams.username,
        fileSize: this.fileSize,
        days: this.storageDays,
        userType: this.userServiceType,
      }).then((res) => {
        this.orderInfo = res.data
        if (res.data.amount < 0.01) {
          this.orderInfo.amount = 0.01
        } else {
          this.orderInfo.amount = this.orderInfo.amount.toFixed(2)
        }
        getWxPay({
          orderNo: this.orderInfo.orderNo,
          amount: this.orderInfo.amount,
          origin: 'crato',
          description: this.orderInfo.orderDesc,
          user: this.queryParams.username,
        }).then((res) => {
          this.dialogLoading = false
          this.payUrl = res.message
          this.getOrderStateTimer = setTimeout(() => {
            this.getOrderState()
          }, 1000)
        })
      })
    },
  },
}
</script>
<style lang="stylus" scoped>
.file-container
  height: calc(100vh - 109px)
  .file-header
    width: 50%
    margin-bottom: 20px
.qrcode
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  .qrcode_tip
    color: red
</style>
