<template>
  <view class="score-detail-page">
    <topbar title="积分统计"></topbar>

    <view class="page-body">
      <view class="header">
        <view class="header-title">{{ titleText }}</view>
        <view class="table-header">
          <text class="th-left">月度</text>
          <text class="th-right">积分</text>
        </view>
      </view>

      <view class="card">
        <view class="table-row" v-for="row in rows" :key="row.label">
          <text class="td-left">{{ row.label }}</text>
          <text class="td-right">{{ row.score }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import topbar from "@/components/topbar/topbar.vue";
import scoreApi from "@/common/api/score.js";

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default {
  name: "ScoreStatDetail",
  components: { topbar },
  data() {
    return {
      year: new Date().getFullYear(),
      month: 1,
      logs: [],
    };
  },
  computed: {
    titleText() {
      return `${this.year}年${this.month}月积分详情`;
    },
    rows() {
      // 依据 type_text 聚合，尽量对齐截图（没有数据则显示 0）
      const preset = ["日常考试积分", "闯关积分", "答题积分"];
      const map = new Map();
      preset.forEach((k) => map.set(k, 0));

      for (const it of this.logs) {
        const type = it?.type_text || "其他";
        const val = Number(it?.score || 0);
        map.set(type, (map.get(type) || 0) + val);
      }

      const res = [];
      for (const k of preset) res.push({ label: k, score: map.get(k) || 0 });
      // 额外类型也展示在后面
      for (const [k, v] of map.entries()) {
        if (!preset.includes(k)) res.push({ label: k, score: v });
      }
      return res;
    },
  },
  onLoad(options) {
    this.year = parseInt(options.year, 10) || this.year;
    this.month = parseInt(options.month, 10) || this.month;
    this.loadMonthLogs();
  },
  methods: {
    async loadMonthLogs() {
      this.logs = [];
      let page = 1;
      const ymPrefix = `${this.year}-${pad2(this.month)}-`;

      for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        const res = await scoreApi.getUserScoreLog(this, { page });
        const list = res?.data?.list;
        const data = list?.data || [];

        const normalized = data.map((it) => {
          if (it?.createtime_text || !it?.createtime) return it;
          const d = new Date(it.createtime * 1000);
          const text = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
            d.getDate()
          )}`;
          return { ...it, createtime_text: text };
        });

        // 过滤当前月份
        const filtered = normalized.filter((it) =>
          String(it?.createtime_text || "").startsWith(ymPrefix)
        );
        this.logs = this.logs.concat(filtered);

        const current = list?.current_page || page;
        const last = list?.last_page || current;
        if (current >= last) break;
        page = current + 1;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.score-detail-page {
  min-height: 100vh;
  background: #fFF;
}

.page-body {
  padding-top: 175rpx;
}

.header {
  padding: 26rpx 28rpx 26rpx;
  background: linear-gradient(90deg, #44A5FF 0%, #5976FF 100%);
  color: #fff;
}

.header-title {
  font-size: 30rpx;
  font-weight: 600;
  text-align: center;
}

.card {
  margin: 20rpx 24rpx 0;
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
}

.table-header {
  height: 80rpx;
  background: #FFF;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  font-size: 30rpx;
  margin-top: 55rpx;
  border-radius: 20rpx;
}

.table-row {
  padding: 0 22rpx;
  height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 30rpx;
  color: #333;
}

.table-row:last-child {
  border-bottom: none;
}

.td-right {
  color: #2f61ff;
}
</style>

