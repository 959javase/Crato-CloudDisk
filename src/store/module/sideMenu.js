import { getStorage } from '@/request/file.js'

export default {
  state: {
    storageValue: 0 ,//  文件已占用的存储空间大小
    maxStorage: 0 // 最大
  },
  mutations: {
    /**
     * 保存文件已占用的存储空间大小
     * @param {object} state Vuex 的 state 对象
     * @param {number} data 存储大小
     */
    setStorageValue(state, data ) {
 
      state.storageValue = data.storageSize;
      state.maxStorage = data.maxStorage;
    }
  },
  actions: {
    /**
     * 获取文件已占用的存储空间
     */
    showStorage(context) {
      return getStorage().then(res => {
        if (res.success) {
          context.commit('setStorageValue', res.data)// ? Number(res.data.storageSize) : 0 , Number(res.data.maxStorage))
        } else {
          this.$message.error(res.message)
        }
      });
    }

  }
}
