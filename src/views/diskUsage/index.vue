<template>
  <div class="wrap">
    <div class="chart-wrap_header">
      <v-chart class="chart" :option="option" />
      <v-chart class="chart" :option="option" />
      <v-chart class="chart" :option="option" />
    </div>
    <div class="chart-wrap_footer">
      <v-chart class="expense" :option="option" />
      <div class="storage-wrap">
        <v-chart class="storage" :option="option2" />
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
      option: {
        title: {
          text: '折线图1',
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
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line',
          },
        ],
      },
      option2: {
        title: {
          text: '某站点用户访问来源',
          subtext: '纯属虚构',
          left: 'center',
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
            name: '访问来源',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: '搜索引擎' },
              { value: 735, name: '直接访问' },
              { value: 580, name: '邮件营销' },
              { value: 484, name: '联盟广告' },
              { value: 300, name: '视频广告' },
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
}
</script>

<style lang="stylus" scoped>
.wrap
  display: flex
  flex-direction: column
  height: valc(100vh - 250px)
  .chart-wrap_header
    display: flex
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
        border: 1px red solid
.chart
  height: 400px
</style>
