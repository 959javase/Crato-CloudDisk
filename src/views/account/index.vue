<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch"
      label-width="68px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">创建子账号
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single"
          @click="handleShare">分配容量</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
          @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出
        </el-button>
      </el-col> -->
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>

    <el-table v-loading="loading" ref="table" :data="cruList"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" width="50">
        <template slot-scope="scope">
          {{scope.$index + 1}}
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center" prop="name" />
      <el-table-column label="容量(GB)" align="center" prop="unused" />
      <el-table-column label="手机号" align="center" prop="mobile" />
      <el-table-column label="账号归属" align="center" prop="belong" />
      <el-table-column label="账号类型" align="center" prop="type" />
      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['manager:cru:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['manager:cru:remove']">删除</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 创建子账号对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px"
      v-loading.fullscreen.lock="dialogLoading" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" placeholder="请输入确认密码" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="账号归属" prop="belong">
          <el-input v-model="form.belong" placeholder="请输入账号归属" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 分配容量 -->
    <el-dialog title="分配容量" :visible.sync="shareOpen" width="500px"
      v-loading.fullscreen.lock="dialogLoading" append-to-body :close-on-click-modal="false">
      <el-form ref="shareForm" :model="shareForm" :rules="shareRules" label-width="80px">
        <el-form-item label="主账号" prop="fromName">
          <el-input v-model="shareForm.fromName" disabled />
        </el-form-item>
        <el-form-item label="子账号" prop="toName">
          <el-input v-model="shareForm.toName" disabled />
        </el-form-item>
        <el-form-item label="分配容量(GB)" prop="fileSize">
          <el-input v-model="shareForm.fileSize" placeholder="请输入分配容量" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitShareForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAccountList,
  createSubAccount,
  shareSpace,
} from '@/request/account.js'
import { mapState } from 'vuex'
export default {
  name: 'accountmanager',
  components: {},
  data() {
    return {
      dialogLoading: false,
      // 遮罩层
      loading: true,
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
      // 【请填写功能名称】表格数据
      cruList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 分配容量dialog
      shareOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        username: '',
      },
      // 表单参数
      form: {},
      // 分配容量参数
      shareForm: {},
      // 分配表单校验
      shareRules: {},
      // 表单校验
      rules: {},

      // 登录账号信息
      userInfo: {},
    }
  },
  computed: {
    ...mapState(['user']),
  },
  created() {
    this.userInfo = JSON.parse(this.user.userInfoObj)
    this.form.belong = this.userInfo.name
    // this.queryParams.username = this.userInfo.name
    this.getList()
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      getAccountList({
        ...this.queryParams,
        belong: this.userInfo.belong,
      }).then((response) => {
        this.cruList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    queryList() {
      this.loading = true
      // getAccountList(this.queryParams).then(response => {
      getAccountList({
        ...this.queryParams,
        key_vision: false,
      }).then((response) => {
        this.cruList = response.rows
        // this.total = response.total;
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.shareOpen = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        name: null,
        password: null,
        confirmPassword: null,
        mobile: null,
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      if (selection.length > 0) {
        this.shareForm.fromName = selection[0].belong
        this.shareForm.toName = selection[0].name
        // this.shareForm.fileSize = 0
      }
      if (selection.length > 1) {
        this.$refs.table.clearSelection()
        this.$refs.table.toggleRowSelection(selection.pop())
      }
      this.ids = selection.map((item) => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.form.belong = this.userInfo.name
      this.title = '创建子账号'
    },
    handleShare(row) {
      this.shareOpen = true
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getCru(id).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改子账户信息'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateCru(this.form).then((response) => {
              this.$message.success('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            createSubAccount(this.form).then((response) => {
              this.$message.success('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    // 分配容量提交
    submitShareForm() {
      this.$refs['shareForm'].validate((valid) => {
        if (valid) {
          this.dialogLoading = true
          shareSpace(this.shareForm).then((res) => {
            if (res.code == 0) {
              this.$message.success('分配成功')
              this.dialogLoading = false
              this.shareOpen = false
            }
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm(
        '是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(function () {
          return delCru(ids)
        })
        .then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'manager/cru/export',
        {
          ...this.queryParams,
        },
        `manager_cru.xlsx`
      )
    },
  },
}
</script>
<style>
thead .el-table-column--selection .cell {
  display: none;
}
</style>