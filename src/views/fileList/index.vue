<template>
  <div class="file-container">
    <div class="file-header">
      <el-upload class="upload-file" ref="upload" action="https://api-hk.decoo.io/pinning/pinFile"
        :headers="headers" :data="datas" :before-upload="beforeUpload"
        :on-success="fileUploadSuccess" :on-change="fileAdded" :auto-upload="false">
        <el-button slot="trigger" type="primary">文件上传</el-button>
        <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
      </el-upload>
      <!-- <el-button type="primary" size="default" @click="floderUpload">文件夹上传</el-button> -->
    </div>
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch"
      label-width="68px">
      <el-form-item label="文件名" prop="title">
        <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable size="small" />
      </el-form-item>
      <el-form-item label="归属账号" prop="title">
        <el-input v-model="queryParams.name" placeholder="请输入归属账号" clearable size="small" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="fileList" height="685">
      <el-table-column label="序号" align="center" width="50">
        <template slot-scope="scope">
          {{scope.$index + 1}}
        </template>
      </el-table-column>
      <el-table-column label="文件名" align="center" prop="fileName" />
      <el-table-column label="大小" align="center" prop="fileSize" />
      <el-table-column label="CID" align="center" prop="cid" />
      <el-table-column label="归属账号" align="center" prop="name" />
      <el-table-column label="成本" align="center" prop="cost" />
      <el-table-column label="创建日期" align="center" prop="dateTime" />
      <el-table-column label="到期日期" align="center" prop="expiredTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"
        fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-download"
            @click="handleUpload(scope.row)">下载
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-money" @click="handleRenew(scope.row)">续费
          </el-button>
          <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">
            删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="fileList.length>0" :total="fileList.length"
      :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" background />

    <el-dialog :title="userServiceType == 0 ? '按次收费上传文件' : '上传文件'" :visible.sync="openUploadShow"
      center :close-on-click-modal="false">
      <el-form>
        <!-- 按次付费上传文件 -->
        <template v-if="userServiceType == 0">
          <el-form-item label="当前文件大小" :label-width="formLabelWidth">
            <el-input v-model="fileSize" autocomplete="off" :style="{width: '30%'}" disabled>
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="存储期限" :label-width="formLabelWidth">
            <el-select v-model="storageDays" @change="storageDaysChange" placeholder="请选择服务期限">
              <el-option label="3个月" :value="90"></el-option>
              <el-option label="6个月" :value="180"></el-option>
              <el-option label="12个月" :value="365"></el-option>
              <el-option label="36个月" :value="1095"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="费用合计" :label-width="formLabelWidth">
            <el-input :style="{border:'none',width: '30%'}" disabled v-model="cost"
              autocomplete="off">
              <template slot="append">元</template>
            </el-input>
          </el-form-item>

        </template>
      </el-form>
      <!-- 按存储容量上传文件 -->
      <el-form>
        <template v-if="userServiceType == 1">
          <el-form-item label="剩余容量大小" :label-width="formLabelWidth">
            <el-input v-model="surplusStroage" autocomplete="off" :style="{width: '40%'}" disabled>
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="当前文件大小" :label-width="formLabelWidth">
            <el-input v-model="fileSize" autocomplete="off" :style="{width: '40%'}" disabled>
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div v-if="userServiceType == 0" slot="footer" class="dialog-footer">
        <el-button type="primary" @click="fileUpload">付费上传</el-button>
      </div>
      <div v-if="userServiceType == 1" slot="footer" class="dialog-footer">
        <el-button type="primary" @click="fileUpload">上传文件</el-button>
      </div>
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
import { addFile, listFile } from '@/request/crato.js'

export default {
  name: 'Article',
  data() {
    return {
      formLabelWidth: '120px',
      openUploadShow: false,
      // 遮罩层
      loading: false,
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
    }
  },
  computed: {
    ...mapState(['user']),
    // 用户剩余容量
    surplusStroage: function () {
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
      // console.log(Date.parse(new Date(this.userInfo.expiredTime)))
      // this.storageDays =
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
        this.fileList = res.data
        this.loading = false
      })
    },
    getDecooToken() {
      axios({
        method: 'GET',
        url: 'https://api.decoo.io/oauth/accessToken',
      })
        .then((res) => {
          const { data } = res
          // this.decooToken = data.data
          this.headers.useraccesstoken = data.Data
        })
        .catch((err) => {
          console.log(err)
        })
    },
    fileAdded(file) {
      // 只让在文件选择完成后触发
      if (file.status !== 'ready') return
      // 计算文件大小单位是G，最小为1
      const GB = Math.pow(1024, 3)
      // 小于1MB的文件按照0.001GB
      const MB = Math.pow(1024, 2)
      if (file.size > MB) {
        this.fileSize = globalFunction.downFixed(file.size / GB, 3)
      } else {
        this.fileSize = 0.001
      }
      // 按次上传：计算金额
      if (this.userServiceType == 0) {
        if (this.fileSize < 1) {
          this.cost = 1 * 0.01 * this.storageDays
        } else {
          this.cost = this.fileSize * 0.01 * this.storageDays
        }
      }
      this.openUploadShow = true
      console.log(file)
    },
    fileUpload() {
      this.$refs.upload.submit()
    },
    floderUpload() {
      console.log('文件夹上传')
    },
    handleUpload(e) {
      let url = `https://ipfs-hk.decoo.io/ipfs/${e.cid}?filename=${e.fileName}`
      // this.downloadSrc = url
      // this.$nextTick(() => {
      //   this.downloadFrame = this.$refs.downloadDia.contentWindow
      // })
      // window.location.href = url
      // // 创建a标签
      // const link = document.createElement('a')
      // // download属性
      // link.setAttribute('download', e.fileName)
      // // href链接
      // link.setAttribute('href', url)
      // // 自执行点击事件
      // link.click()
      // document.body.removeChild(link)

      window.open(url)
    },
    handleRenew() {
      console.log('续费这个文件')
    },
    handleDelete() {
      console.log('删除这个文件')
    },
    // 上传文件前：需要获取文件cid、secret
    // TODOS: 需要在这里算钱
    async beforeUpload(file) {
      // 获取文件cid
      const cid = await getFileCid(file)
      this.datas.cid = cid
      // 获取secret
      this.datas.secret = crypto
        .privateEncrypt(RSAkey, Buffer.from(cid))
        .toString('base64')
      this.datas.decooOptions = {
        name: file.name,
      }
      await this.getDecooToken()
      return new Promise((resolve, reject) => {
        this.$confirm('确认将此文件上传?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        })
          .then(() => {
            this.$message({
              type: 'success',
              message: '付款成功!',
            })
            return resolve(true)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消上传',
            })
            return reject(false)
          })
      })
    },
    getFileUpload() {},
    // 文件上传中

    // 文件上传完成
    fileUploadSuccess(res, file) {
      if (file.status == 'success') {
        this.openUploadShow = false
        this.$message({
          type: 'success',
          message: '文件上传成功!',
        })
        let fileSize = 0
        // 计算文件大小单位是G，最小为1
        const GB = Math.pow(1024, 3)
        // 如果是按存储容量文件大小按照实际
        if (this.userServiceType == 1) {
          fileSize = globalFunction.upFixed(res.PinSize / GB, 3)
        } else if (this.userServiceType == 0) {
          // 按次上传不满1G 按照1G收费
          if (res.PinSize > GB) {
            fileSize = globalFunction.upFixed(res.PinSize / GB, 3)
          } else {
            fileSize = 1
          }
        }
        addFile({
          // 账号名称 name
          name: this.userInfo.name,
          // fileName
          fileName: file.name,
          // cid
          cid: this.datas.cid,
          // fileSize
          fileSize: fileSize,
          storageDays: this.storageDays,
          cost: this.cost,
        }).then((res) => {
          console.log('完成')
        })
      }
    },
    // 计算按次收费总金额
    storageDaysChange() {
      if (this.fileSize < 1) {
        this.cost = 1 * 0.05 * this.storageDays
      } else {
        this.cost = this.fileSize * 0.05 * this.storageDays
      }
      console.log(this.cost)
    },
  },
}
</script>
<style lang="stylus" scoped>
.file-container
  height: calc(100vh - 109px)
  .file-header
    margin-bottom: 20px
</style>