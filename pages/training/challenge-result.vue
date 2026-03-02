<template>
  <view class="result-page">
    <view class="result-content">
      <view class="result-icon">✓</view>
      <view class="result-title">闯关完成</view>
      <view class="result-score">得分：{{ score }}分</view>
      <view class="result-info">
        <text>正确：{{ correctCount }}/{{ totalCount }}</text>
      </view>
      <view class="result-actions">
        <button class="action-btn" @click="goBack">返回列表</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      score: 0,
      correctCount: 0,
      totalCount: 0
    };
  },
  onLoad(options) {
    if (options.score) {
      this.score = parseFloat(options.score);
    }
    if (options.correct) {
      this.correctCount = parseInt(options.correct);
    }
    if (options.total) {
      this.totalCount = parseInt(options.total);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 2
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.result-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.result-content {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  width: 100%;
  
  .result-icon {
    width: 120rpx;
    height: 120rpx;
    line-height: 120rpx;
    background-color: #4caf50;
    color: #fff;
    border-radius: 50%;
    font-size: 80rpx;
    margin: 0 auto 30rpx;
  }
  
  .result-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 30rpx;
  }
  
  .result-score {
    font-size: 48rpx;
    font-weight: 600;
    color: #5677fc;
    margin-bottom: 20rpx;
  }
  
  .result-info {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 60rpx;
  }
  
  .action-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
  }
}
</style>

