<template>
  <view class="levels-page">
    <view class="levels-header">
      <view class="header-left" @click="goBack">
        <image class="back-icon" src="/static/img/left.png" mode="aspectFit"></image>
      </view>
      <view class="header-title">闯关练习</view>
      <view class="header-right"></view>
    </view>

    <!-- 当前进度 -->
    <view class="progress-card">
      <text class="progress-label">当前进度</text>
      <text class="progress-value">第{{ currentLevel }}关</text>
      <text class="progress-star">⭐</text>
    </view>

    <!-- 关卡列表 -->
    <view class="level-list">
      <view 
        class="level-item" 
        v-for="(lev, idx) in levelList" 
        :key="idx"
        :class="{ locked: lev.status === 'locked', done: lev.status === 'done' }"
      >
        <view class="level-num" :class="lev.status">{{ lev.status === 'done' ? '✓' : lev.level }}</view>
        <view class="level-info">
          <text class="level-name">第{{ numberToText(lev.level) }}关</text>
          <text class="level-count">{{ lev.count }}道题目</text>
        </view>
        <view class="level-action">
          <view v-if="lev.status === 'done'" class="badge-done">已完成</view>
          <view v-else-if="lev.status === 'active'" class="btn-go" @click="goChallenge(lev.level)">
            <text class="play-icon">▶</text>
          </view>
          <view v-else class="icon-lock">🔒</view>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading-tip">加载中...</view>
    <view v-else-if="!challenge.id && !papers.length" class="empty-tip">暂无关卡</view>
  </view>
</template>

<script>
const PER_LEVEL = 5;
const STORAGE_KEY = 'challenge_progress_';

export default {
  data() {
    return {
      cateId: 0,
      challengeId: 0,
      challenge: {},
      totalLevels: 0,
      perLevel: PER_LEVEL,
      currentLevel: 1,
      levelList: [],
      papers: [],
      loading: true,
      byCate: false
    };
  },
  onLoad(options) {
    if (options.cate_id) {
      this.cateId = parseInt(options.cate_id);
      this.byCate = true;
      this.loadPapersByCate();
    } else if (options.id) {
      this.challengeId = parseInt(options.id);
      this.loadDetail();
    } else {
      this.loading = false;
    }
  },
  methods: {
    loadPapersByCate() {
      this.loading = true;
      this.http('challenge/practicePapers', { cate_id: this.cateId }, 'get').then(res => {
        this.loading = false;
        if (res.code == 1 && res.data && res.data.length) {
          this.papers = res.data;
          this.challenge = { id: this.cateId, total_levels: this.papers.length };
          this.totalLevels = this.papers.length;
          this.buildLevelListFromPapers();
          const maxDone = this.getMaxDonePaperIndex();
          this.currentLevel = maxDone >= this.totalLevels ? this.totalLevels : maxDone + 1;
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    getMaxDonePaperIndex() {
      for (let i = 0; i < this.papers.length; i++) {
        if (this.getProgress(this.papers[i].id) < 1) return i;
      }
      return this.papers.length;
    },
    loadDetail() {
      this.loading = true;
      this.http('challenge/practiceDetail', {
        id: this.challengeId,
        level: 0,
        per_level: PER_LEVEL
      }, 'get').then(res => {
        this.loading = false;
        if (res.code == 1 && res.data) {
          this.challenge = res.data.challenge || {};
          this.totalLevels = this.challenge.total_levels || 1;
          this.perLevel = this.challenge.per_level || PER_LEVEL;
          const maxDone = this.getProgress(this.challengeId);
          this.currentLevel = maxDone >= this.totalLevels ? this.totalLevels : maxDone + 1;
          this.buildLevelList();
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    getProgress(paperId) {
      try {
        const key = STORAGE_KEY + paperId;
        const raw = uni.getStorageSync(key);
        if (raw) {
          const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
          return (obj && obj.maxLevel) ? parseInt(obj.maxLevel, 10) : 0;
        }
      } catch (e) {}
      return 0;
    },
    setProgress(paperId, level) {
      try {
        const key = STORAGE_KEY + paperId;
        const raw = uni.getStorageSync(key);
        const obj = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
        const max = Math.max((obj && obj.maxLevel) || 0, level);
        uni.setStorageSync(key, JSON.stringify({ maxLevel: max }));
      } catch (e) {}
    },
    buildLevelListFromPapers() {
      const list = [];
      for (let i = 0; i < this.papers.length; i++) {
        const paper = this.papers[i];
        const done = this.getProgress(paper.id) >= 1;
        let status = 'active';
        if (done) status = 'done';
        else if (list.some(l => l.status === 'active')) status = 'locked';
        list.push({
          level: i + 1,
          paperId: paper.id,
          count: paper.quantity || 0,
          name: paper.title || paper.name,
          status
        });
      }
      this.levelList = list;
    },
    buildLevelList() {
      const list = [];
      const maxDone = this.getProgress(this.challengeId);
      for (let i = 1; i <= this.totalLevels; i++) {
        let status = 'active';
        if (i < maxDone + 1) status = 'done';
        else if (i > maxDone + 1) status = 'locked';
        list.push({
          level: i,
          count: this.perLevel,
          status
        });
      }
      this.levelList = list;
    },
    numberToText(n) {
      const map = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
      if (n <= 10) return map[n];
      if (n < 20) return '十' + map[n - 10];
      return String(n);
    },
    goChallenge(levelOrItem) {
      if (this.byCate && this.papers.length) {
        const idx = typeof levelOrItem === 'object' ? levelOrItem.level - 1 : (levelOrItem - 1);
        const paper = this.papers[idx];
        if (!paper) return;
        const cateParam = this.cateId ? `&cate_id=${this.cateId}` : '';
        uni.navigateTo({
          url: `/pages/training/challenge?id=${paper.id}${cateParam}`
        });
      } else {
        uni.navigateTo({
          url: `/pages/training/challenge?id=${this.challengeId}&level=${levelOrItem}&per_level=${this.perLevel}`
        });
      }
    },
    goBack() {
      uni.navigateBack();
    }
  },
  onShow() {
    if (this.byCate && this.papers.length) {
      this.buildLevelListFromPapers();
      this.currentLevel = this.getMaxDonePaperIndex() >= this.totalLevels ? this.totalLevels : this.getMaxDonePaperIndex() + 1;
    } else if (this.challengeId && this.challenge.id) {
      this.buildLevelList();
      const maxDone = this.getProgress(this.challengeId);
      this.currentLevel = maxDone >= this.totalLevels ? this.totalLevels : maxDone + 1;
    }
  }
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.levels-page {
  min-height: 100vh;
  padding: 20rpx 30rpx;
  padding-bottom: 60rpx;
}

.levels-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  .header-left .back-icon {
    width: 40rpx;
    height: 40rpx;
  }
  .header-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
  .header-right {
    width: 60rpx;
  }
}

.progress-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  .progress-label {
    font-size: 28rpx;
    color: #666;
    margin-right: 16rpx;
  }
  .progress-value {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    flex: 1;
  }
  .progress-star {
    font-size: 32rpx;
  }
}

.level-list {
  .level-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    &.locked {
      opacity: 0.7;
      .level-num { background: #ccc; color: #fff; }
      .level-info { color: #999; }
    }
    &.done {
      .level-num { background: #4caf50; color: #fff; }
      .level-info { color: #666; }
    }
    .level-num {
      width: 56rpx;
      height: 56rpx;
      line-height: 56rpx;
      text-align: center;
      border-radius: 50%;
      font-size: 28rpx;
      font-weight: 600;
      margin-right: 24rpx;
      flex-shrink: 0;
      &.active {
        background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
        color: #fff;
      }
      &.done {
        background: #4caf50;
        color: #fff;
      }
    }
    .level-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      .level-name { font-size: 30rpx; color: #333; }
      .level-count { font-size: 24rpx; color: #999; margin-top: 8rpx; }
    }
    .level-action {
      flex-shrink: 0;
      .badge-done {
        font-size: 24rpx;
        color: #4caf50;
        padding: 8rpx 16rpx;
        border: 1rpx solid #4caf50;
        border-radius: 20rpx;
      }
      .btn-go {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        .play-icon { font-size: 28rpx; }
      }
      .icon-lock {
        font-size: 36rpx;
      }
    }
  }
}

.loading-tip, .empty-tip {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
