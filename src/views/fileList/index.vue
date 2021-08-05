<template>
  <div class="file-container">
    <div class="file-header">
      <el-upload class="upload-file" ref="upload" action="https://api-hk.decoo.io/pinning/pinFile"
        :headers="headers" :before-upload="beforeUpload">
        <el-button slot="trigger" type="primary">文件上传</el-button>
        <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
      </el-upload>
      <!-- <el-button type="primary" size="default" @click="fileUpload">文件上传</el-button>
      <el-button type="primary" size="default" @click="floderUpload">文件夹上传</el-button> -->
    </div>
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch"
      label-width="68px">
      <el-form-item label="文件名" prop="title">
        <el-input v-model="queryParams.fileName" placeholder="请输入文件名" clearable size="small" />
      </el-form-item>
      <el-form-item label="归属账号" prop="title">
        <el-input v-model="queryParams.belong" placeholder="请输入归属账号" clearable size="small" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini">搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="fileList">
      <el-table-column label="序号" align="center" width="50">
        <template slot-scope="scope">
          {{scope.$index + 1}}
        </template>
      </el-table-column>
      <el-table-column label="文件名" align="center" prop="fileName" />
      <el-table-column label="大小" align="center" prop="fileSize" />
      <el-table-column label="归属账号" align="center" prop="belong" />
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
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">
            删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" /> -->

  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Article',
  data() {
    return {
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
      fileList: [
        {
          fileName: '测试文件',
          fileSize: '10G',
          belong: '17862807932',
          cost: '20',
          dateTime: '2021-08-05',
          expiredTime: '2022-08-05',
        },
      ],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: null,
        fileName: null,
        belong: null,
        expiredTime: null,
      },
      // 表单参数
      form: {},
      headers: {},
      // 表单校验
      rules: {},
      // 用户类型 0 按次付费；1 按存储容量付费
      userServiceType: null,
      userInfo: {},
    }
  },
  computed: {
    ...mapState(['user']),
  },
  created() {
    this.headers.UserAccessToken = this.user.token
    this.userInfo = JSON.parse(this.user.userInfoObj)
    this.userServiceType = this.userInfo.serviceType
    console.log(this.userInfo)
  },
  methods: {
    fileUpload() {
      console.log('文件上传')
    },
    floderUpload() {
      console.log('文件夹上传')
    },
    handleUpload() {
      console.log('下载这个文件')
    },
    handleRenew() {
      console.log('续费这个文件')
    },
    handleDelete() {
      console.log('删除这个文件')
    },
    // 上传文件
    submitUpload() {
      this.$confirm('确认将此文件上传?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      })
        .then(() => {
          this.$refs.upload.submit()
          this.$message({
            type: 'success',
            message: '上传成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消上传',
          })
          return false
        })
    },
    async beforeUpload(file) {
      console.log(file)
      console.log('上传文件之前')
      return new Promise((resolve, reject) => {
        this.$confirm('确认将此文件上传?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        })
          .then(() => {
            this.$message({
              type: 'success',
              message: '上传成功!',
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
  },
}
</script>
<style lang="stylus" scoped>
.file-container
  height: calc(100vh - 109px)
  .file-header
    margin-bottom: 20px
</style>