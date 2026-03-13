<template>
  <view class="score-stat-page">
    <topbar title="积分统计"></topbar>

    <view class="page-body">
      <!-- 顶部总积分 -->
      <view class="header">
        <view class="header-title">我的总积分</view>
        <view class="header-row">
          <view class="total-score">{{ totalScore }}</view>
          <view class="year-picker" @click="showYearPicker = true">
            <text>{{ selectedYear }}年</text>
            <text class="year-arrow">▼</text>
          </view>
        </view>
      </view>

      <!-- 月度列表 -->
      <view class="card">
        <view class="table-header">
          <text class="th-left">月度</text>
          <text class="th-right">积分</text>
        </view>
        <view
          class="table-row"
          v-for="m in monthRows"
          :key="m.month"
          @click="goMonthDetail(m.month)"
        >
          <text class="td-left">{{ m.month }}月</text>
          <text class="td-right">{{ m.score }}</text>
        </view>
      </view>
    </view>

    <!-- 年份选择 -->
    <tn-picker
      v-model="showYearPicker"
      mode="selector"
      :range="yearOptions"
      range-key="label"
      @confirm="onYearConfirm"
    ></tn-picker>
  </view>
</template>

<script>
import topbar from "@/components/topbar/topbar.vue";
import userApi from "@/common/api/user.js";
import scoreApi from "@/common/api/score.js";

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

export default {
  name: "ScoreStat",
  components: { topbar },
  data() {
    const now = new Date();
    const year = now.getFullYear();
    return {
      showYearPicker: false,
      selectedYear: year,
      yearOptions: [],
      totalScore: 0,
      // 只缓存当前年份的流水，做月度汇总
      scoreLogs: [],
    };
  },
  computed: {
    monthRows() {
      const map = new Map();
      for (let i = 1; i <= 12; i++) map.set(i, 0);

      for (const item of this.scoreLogs) {
        const dateText = item?.createtime_text || "";
        // 兼容 YYYY-MM-DD / YYYY-MM-DD HH:mm:ss
        const m = dateText.match(/^(\d{4})-(\d{2})-/);
        if (!m) continue;
        const y = parseInt(m[1], 10);
        const month = parseInt(m[2], 10);
        if (y !== this.selectedYear) continue;
        const val = Number(item?.score || 0);
        map.set(month, (map.get(month) || 0) + val);
      }

      return Array.from(map.entries()).map(([month, score]) => ({
        month,
        score,
      }));
    },
  },
  onLoad() {
    this.initYearOptions();
    this.loadTotalScore();
    this.loadScoreLogsByYear(this.selectedYear);
  },
  methods: {
    initYearOptions() {
      const now = new Date().getFullYear();
      const start = now - 5;
      this.yearOptions = [];
      for (let y = now; y >= start; y--) {
        this.yearOptions.push({ label: `${y}年`, value: y });
      }
    },
    onYearConfirm(e) {
      const idx = e?.index ?? e?.value ?? 0;
      const picked = this.yearOptions[idx];
      if (!picked) return;
      this.selectedYear = picked.value;
      this.loadScoreLogsByYear(this.selectedYear);
    },
    loadTotalScore() {
      userApi.getUserInfo(this).then((res) => {
        if (res && res.data && res.data.info) {
          this.totalScore = res.data.info.score || 0;
          uni.setStorageSync("user", res.data);
        }
      });
    },
    async loadScoreLogsByYear(year) {
      this.scoreLogs = [];
      // 拉取若干页流水用于汇总（最多 10 页，避免请求过多）
      let page = 1;
      for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        const res = await scoreApi.getUserScoreLog(this, { page });
        const list = res?.data?.list;
        const data = list?.data || [];
        this.scoreLogs = this.scoreLogs.concat(data);
        const current = list?.current_page || page;
        const last = list?.last_page || current;
        if (current >= last) break;
        page = current + 1;
      }

      // 兜底：如果流水里没有 createtime_text，但有 createtime（秒），生成文本
      this.scoreLogs = (this.scoreLogs || []).map((it) => {
        if (it?.createtime_text || !it?.createtime) return it;
        const d = new Date(it.createtime * 1000);
        const text = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
          d.getDate()
        )}`;
        return { ...it, createtime_text: text };
      });

      // 触发 computed 刷新即可
    },
    goMonthDetail(month) {
      uni.navigateTo({
        url: `/pages/score/score-stat-detail?year=${this.selectedYear}&month=${month}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.score-stat-page {
  min-height: 100vh;
  background: #f5f6fa;
}

.page-body {
  padding-top: 175rpx;
}

.header {
  padding: 26rpx 28rpx 32rpx;
  background: linear-gradient(90deg, #44A5FF 0%, #5976FF 100%);
  color: #fff;
}

.header-title {
  font-size: 26rpx;
  opacity: 0.95;
  text-align: center;
  margin-top: 6rpx;
}

.header-row {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.total-score {
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
}

.year-picker {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 10rpx 16rpx;
  border-radius: 12rpx;
  background: #ffffff;
  color: #333333;
  font-size: 26rpx;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
}

.year-arrow {
  font-size: 22rpx;
  opacity: 0.9;
  color: #333333;
}

.card {
  margin: 20rpx 24rpx 0;
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
}

.table-header {
  height: 72rpx;
  background: #f2f2f2;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #666;
  font-size: 26rpx;
}

.table-row {
  padding: 0 22rpx;
  height: 82rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 28rpx;
  color: #333;
}

.table-row:last-child {
  border-bottom: none;
}

.td-right {
  color: #2f61ff;
}
</style>

