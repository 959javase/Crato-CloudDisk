<template>
  <div class="operation-menu-wrapper" :class="'file-type-' + fileType" >


     <el-button-group class="operate-group" v-show="!selectionFile.length">  
     <el-button  type="warning" round size="medium  "  @click="handleUploadFileBtnClick(true,false)">普通上传<i class="el-icon-upload el-icon--right"></i></el-button>
       <el-button type="warning" round size="medium  "  @click="handleUploadFileBtnClick(true,true)">加密上传<i class="el-icon-upload el-icon--right"></i></el-button>
       <el-button  round size="medium  " @click="dialogAddFolder.visible = true">新建文件夹<i class="el-icon-circle-plus el-icon--right"></i></el-button>
     </el-button-group>

    <el-button-group class="operate-group" v-show="selectionFile.length">   
 
      <el-button
        size="medium"
        :disabled="!selectionFile.length"
        icon="el-icon-delete"
        @click="handleBatchDeleteBtnClick()">删除</el-button>
     

      <el-button
        size="medium"
        :disabled="!selectionFile.length"
        icon="el-icon-rank"
        @click="handleBatchMoveBtnClick()"
        v-if="!fileType && fileType !== 6"
        >移动</el-button
      >
      <!-- <el-button
        size="medium"
        :disabled="!selectionFile.length"
        icon="el-icon-download"
        @click="handleBatchDownloadBtnClick()"
        v-if="fileType !== 6"
        >下载</el-button> -->
    </el-button-group>


    <!-- 全局搜素文件 -->
    <el-input
      v-if="fileType === 0"
      class="select-file-input"
      v-model="searchFile.fileName"
      placeholder="search"
      size="medium"
      round
      maxlength="255"
      :clearable="true"
      @change="handleSearchInputChange"
      @clear="$emit('getTableDataByType')"
      @keyup.enter.native="handleSearchInputChange(searchFile.fileName)"
    >
      <i slot="prefix" class="el-input__icon el-icon-search" title="click to search" @click="handleSearchClick"></i>
    </el-input>

    

    <!-- 新建文件夹对话框 -->
    <AddFolderDialog
      :visible.sync="dialogAddFolder.visible"
      :filePath="filePath"
      @confirmDialog="$emit('getTableDataByType')"
    ></AddFolderDialog>

    <!-- 多选文件下载，页面隐藏 -->
    <a
      target="_blank"
      v-for="(item, index) in selectionFile"
      :key="index"
      :href="'api' + item.fileUrl"
      :download="item.fileName + '.' + item.extendName"
      :title="'downloadLink' + index"
      :ref="'downloadLink' + index"
    ></a>
  </div>
</template>

<script>
import { batchDeleteFile, batchDeleteRecoveryFile } from '@/request/file.js'
import AddFolderDialog from '@/components/File/AddFolderDialog.vue'
import SelectColumn from './SelectColumn'

export default {
  name: 'OperationMenu',
  props: {
    // 文件类型
    fileType: {
      required: true,
      type: Number
    },
    // 文件路径
    filePath: {
      required: true,
      type: String
    },
    selectionFile: Array,
    operationFile: Object,
    batchOperate: Boolean
  },
  components: {
    AddFolderDialog,
    SelectColumn
  },
  data() {
    return {
      // 文件搜索数据
      searchFile: {
        fileName: ''
      },
      // 新建文件夹对话框数据
      dialogAddFolder: {
        visible: false
      },
      batchDeleteFileDialog: false,
      fileGroupLable: 0, //  文件展示模式
    }
  },
  computed: {
    //  上传文件组件参数
    uploadFileData: {
      get() {
        let res = {
          filePath: this.filePath,
          isDir: 0
        }
        return res
      },
      set() {
        return {
          filePath: '/',
          isDir: 0
        }
      }
    },
    // 文件查看模式 0 列表模式 1 网格模式 2 时间线模式
    fileModel() {
      return this.$store.getters.fileModel
    },
    // 图标大小
    gridSize: {
      get() {
        return this.$store.getters.gridSize
      },
      set(val) {
        this.$store.commit('changeGridSize', val)
      }
    }
  },
  watch: {
    fileType(newValue, oldValue) {
      if (oldValue === 1 && this.fileModel === 2) {
        this.$store.commit('changeFileModel', 0)
        this.fileGroupLable = 0
      }
    }
  },
  mounted() {
    this.fileGroupLable = this.fileModel
    this.$EventBus.$on('refreshList', () => {
      this.$emit('getTableDataByType')
    })
    this.$EventBus.$on('refreshStorage', () => {
      this.$store.dispatch('showStorage')
    })
  },
  methods: {
    /**
     * 上传文件按钮点击事件
     * @description 通过Bus通信，开启全局上传文件流程
     * @param {boolean} type 上传方式 true 直接上传  false 拖拽上传
     */
    handleUploadFileBtnClick(type ,isEncrypto) {
      this.$EventBus.$emit('openUploader', this.uploadFileData, type ,isEncrypto)
    },

    /**
     * 批量删除按钮点击事件
     * @description 区分 删除到回收站中 | 在回收站中彻底删除，调用相应的删除文件接口
     */
    handleBatchDeleteBtnClick() {
      if (this.fileType === 6) {
        //  回收站里 - 彻底删除
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.confirmBatchDeleteFile(true)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      } else {
        //  非回收站
        this.$confirm('是否确认删除?, 是否继续删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.confirmBatchDeleteFile(false)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      }
    },
    /**
     * 批量删除文件对话框 | 确定按钮点击事件
     * @description 区分 删除到回收站中 | 在回收站中彻底删除，调用相应的删除文件接口
     * @param {boolean} type 文件类型，true 在回收站中彻底删除 false 删除到回收站
     */
    confirmBatchDeleteFile(type) {
      if (type) {
        //  回收站中删除
        batchDeleteRecoveryFile({
          recoveryFileIds: JSON.stringify(this.selectionFile)
        }).then((res) => {
          if (res.success) {
            this.$message({
              message: "删除成功",
              type: 'success'
            })
            this.$emit('getTableDataByType')
            this.$store.dispatch('showStorage')
          } else {
            this.$message.error('失败' + res.message)
          }
        })
      } else {
        //  非回收站删除
        batchDeleteFile({
          files: JSON.stringify(this.selectionFile)
        }).then((res) => {
          if (res.success) {
            this.$message({
              message: "删除成功",
              type: 'success'
            })
            this.$emit('getTableDataByType')
            this.$store.dispatch('showStorage')
          } else {
            this.$message.error('失败' + res.message)
          }
        })
      }
    },
    /**
     * 批量移动按钮点击事件
     */
    handleBatchMoveBtnClick() {
      /**
       * 第一个参数 是否批量移动
       * 第二个参数 打开/关闭移动文件对话框
       */
      this.$emit('setMoveFileDialogData', true, true)
    },
    /**
     * 分享按钮点击事件
     */
    handleBatchShareBtnClick() {
      this.$emit('setShareFileDialogData')
    },
    /**
     * 批量下载按钮点击事件
     */
    handleBatchDownloadBtnClick() {
      for (let i = 0; i < this.selectionFile.length; i++) {
        let name = 'downloadLink' + i
        this.$refs[name][0].click()
      }
    },
    /**
     * 搜索输入框搜索事件
     * @param {string} value 搜索内容
     */
    handleSearchInputChange(value) {
      if (value === '') {
        this.$emit('getTableDataByType')
      } else {
        this.$emit('getSearchFileList', value)
      }
    },
    /**
     * 搜索框图标点击事件
     */
    handleSearchClick() {
      this.$emit('getSearchFileList', this.searchFile.fileName)
    },
    /**
     * 网格模式下，批量操作状态切换
     */
    handleBatchOperationChange() {
      this.$emit('update:batchOperate', !this.batchOperate)
    },
    /**
     * 文件查看模式切换
     * @param {number} label 0 列表 1 网格 2 时间线
     */
    handleFileDisplayModelChange(label) {
      this.$store.commit('changeFileModel', label)
    },
    /**
     * 格式化图标大小显示
     * @param {number} val 改变后的数值
     */
    formatTooltip(val) {
      return `${val}px`
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~@/assets/styles/varibles.styl';

.operation-menu-wrapper.file-type-6 {
  margin: 8px 0;
  justify-content: flex-end;
}
.operation-menu-wrapper {
  padding: 8px 0;
  display: flex;
   float :right;
  justify-content: space-between;
  align-items: center;
  margin-left :20px;
  .operate-group {
    flex: 1;
       float :right;
      margin-right :20px;
    .drop-btn {
      border-radius: 4px 0 0 4px;
      >>> .el-button {       
        border-radius: 4px 0 0 4px;
      }
    }
  }

  .select-file-input {
    margin-right: 8px;
    width: 250px;

    .el-icon-search {
      cursor: pointer;
      font-size: 16px;

      &:hover {
        color: $Primary;
      }
    }
  }

  .batch-opera-btn {
    margin-right: 8px;
  }

  .batch-icon, .setting-icon {
    font-size: 20px;
    cursor: pointer;
    

    &:hover {
      color: $Primary;
    }
  }

  .batch-icon.active {
    color: $Primary;
  }
}

.split-line {
  margin: 8px 0;
}

.change-file-model, .change-grid-size {
  .title {
    margin: 8px 0;
    font-size: 14px;
  }
}
</style>
