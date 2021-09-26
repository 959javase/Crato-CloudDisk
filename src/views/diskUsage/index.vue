<template>
  <div class="wrap">
    <!-- <div class="wrap-search">
      <el-select v-model="granularity" placeholder="请选择折线图日期颗粒度" clearable filterable @change="">
        <el-option label="天" value="day">
        </el-option>
      </el-select>
      <el-button type="primary" size="default" @click="refresh">刷新</el-button>
    </div> -->
    <div class="chart-wrap_header">
      <v-chart class="chart" :loading="barloading" :option="upSizeOption" />
      <v-chart class="chart" :loading="barloading" :option="downSizeOption" />
      <v-chart class="chart" :loading="barloading" :option="opsOption" />
    </div>
    <div class="chart-wrap_footer">
      <v-chart class="expense" :option="costOption" />
      <div class="storage-wrap">
        <v-chart class="storage" :option="usedOption" />
      </div>
    </div>

  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getDashboardData } from '@/request/dashboard.js'
import { mapState } from 'vuex'

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])

export default {
  name: 'HelloWorld',
  components: {
    VChart,
  },
  data() {
    return {
      barloading: false,
      granularity: '',
      userInfo: {},
      upSizeOption: {},
      downSizeOption: {},
      opsOption: {},
      costOption: {},
      usedOption: {
        title: {
          text: '存储容量使用情况',
          subtext: '',
          left: 'center',
        },
        grid: {
          left: '4%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            name: '存储容量',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 32, name: '已使用' },
              { value: 100, name: '未使用' },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
    }
  },
  computed: {
    ...mapState(['user']),
  },
  mounted() {
    // 初始化折线图数据
    this.initOptions()
  },
  created() {
    this.userInfo = JSON.parse(this.user.userInfoObj)
  },
  methods: {
    // 初始化折线图数据
    initOptions() {
      if (this.userInfo.serviceType == '1') {
        this.usedOption.series[0].data[0].value = this.userInfo.used
        this.usedOption.series[0].data[1].value =
          this.userInfo.fixedSpace - this.userInfo.used
      } else {
        this.usedOption.series[0].data[0].value = 0
        this.usedOption.series[0].data[1].value = 1
      }
      getDashboardData({
        username: this.userInfo.name,
        granularity: 'day',
      }).then((res) => {
        // console.log(res)
      })
      this.upSizeOption = {
        title: {
          text: '上传文件大小折线图',
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        dataZoom: [
          {
            //Y轴固定,让内容滚动
            type: 'slider',
            show: false,
            xAxisIndex: [0],
            start: 1,
            end: 100, //设置X轴刻度之间的间隔(根据数据量来调整)
            zoomLock: false, //锁定区域禁止缩放(鼠标滚动会缩放,所以禁止)
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 1,
            end: 100,
            zoomLock: false, //锁定区域禁止缩放
          },
        ],
        xAxis: {
          type: 'category',
          data: [
            '2021-08-31',
            '2021-09-01',
            '2021-09-02',
            '2021-09-03',
            '2021-09-04',
            '2021-09-05',
            '2021-09-06',
            '2021-09-07',
            '2021-09-08',
            '2021-09-09',
            '2021-09-10',
            '2021-09-11',
            '2021-09-12',
            '2021-07-13',
          ],
          // axisTick: {
          //   inside: true,
          //   lignWithLabel: true,
          // },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [15, 43, 23, 12, 3, 4, 12, 18, 32, 1, 23, 12, 18, 35],
            type: 'line',
          },
        ],
      }
      this.downSizeOption = {
        title: {
          text: '下载文件大小折线图',
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        dataZoom: [
          {
            //Y轴固定,让内容滚动
            type: 'slider',
            show: false,
            xAxisIndex: [0],
            start: 1,
            end: 100, //设置X轴刻度之间的间隔(根据数据量来调整)
            zoomLock: false, //锁定区域禁止缩放(鼠标滚动会缩放,所以禁止)
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 1,
            end: 100,
            zoomLock: false, //锁定区域禁止缩放
          },
        ],
        xAxis: {
          type: 'category',
          data: [
            '2021-08-31',
            '2021-09-01',
            '2021-09-02',
            '2021-09-03',
            '2021-09-04',
            '2021-09-05',
            '2021-09-06',
            '2021-09-07',
            '2021-09-08',
            '2021-09-09',
            '2021-09-10',
            '2021-09-11',
            '2021-09-12',
            '2021-07-13',
          ],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [10, 12, 12, 21, 23, 24, 12, 17, 19, 13, 21, 42, 17, 15],
            type: 'line',
          },
        ],
      }
      this.opsOption = {
        title: {
          text: '索引请求数折线图',
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        dataZoom: [
          {
            //Y轴固定,让内容滚动
            type: 'slider',
            show: false,
            xAxisIndex: [0],
            start: 1,
            end: 100, //设置X轴刻度之间的间隔(根据数据量来调整)
            zoomLock: false, //锁定区域禁止缩放(鼠标滚动会缩放,所以禁止)
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 1,
            end: 100,
            zoomLock: false, //锁定区域禁止缩放
          },
        ],
        xAxis: {
          type: 'category',
          data: [
            '2021-08-31',
            '2021-09-01',
            '2021-09-02',
            '2021-09-03',
            '2021-09-04',
            '2021-09-05',
            '2021-09-06',
            '2021-09-07',
            '2021-09-08',
            '2021-09-09',
            '2021-09-10',
            '2021-09-11',
            '2021-09-12',
            '2021-07-13',
          ],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [32, 22, 12, 21, 28, 18, 12, 17, 11, 13, 21, 32, 17, 25],

            type: 'line',
          },
        ],
      }
      this.costOption = {
        title: {
          text: '费用消耗折线图',
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [
            '2021-08-31',
            '2021-09-01',
            '2021-09-02',
            '2021-09-03',
            '2021-09-04',
            '2021-09-05',
            '2021-09-06',
            '2021-09-07',
            '2021-09-08',
            '2021-09-09',
            '2021-09-10',
            '2021-09-11',
            '2021-09-12',
            '2021-07-13',
          ],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [1, 1, 0.2, 2, 4, 5, 1, 2, 4, 5, 6, 2, 2, 3],
            type: 'line',
          },
        ],
      }
    },
    refresh() {
      this.barloading = true
      setTimeout(() => {
        this.barloading = false
      }, 1000)
    },
  },
}
</script>

<style lang="stylus" scoped>
.wrap
  display: flex
  flex-direction: column
  height: valc(100vh - 250px)
  .chart-wrap_header
    display: flex
    height: 100%
    .chart
      flex: 1
  .chart-wrap_footer
    display: flex
    .expense
      height: 400px
      flex: 2
    .storage-wrap
      height: 400px
      flex: 1
      // display: flex
      // justify-items: center
      // align-items: center
      .storage
        // border: 1px red solid
.chart
  height: 390px
</style>
