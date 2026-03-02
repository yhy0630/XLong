<template>
  <view class="challenge-list-page">
    <!-- #ifdef H5 -->
    <tn-nav-bar fixed :bottomShadow="false" backTitle=" ">
      <view class="">
        <text class="tn-text-lg">闯关练习</text>
      </view>
    </tn-nav-bar>
    <!-- #endif -->

    <view class="challenge-list">
      <view 
        class="challenge-item"
        v-for="(item, index) in challengeList"
        :key="index"
        @click="goToChallenge(item.id)"
      >
        <view class="item-content">
          <view class="item-title">{{ item.name }}</view>
          <view class="item-reward">
            <text class="reward-icon">⭐</text>
            <text class="reward-text">通关送积分</text>
          </view>
          <view class="item-time">考试限时: {{ formatTime(item.time_limit) }}</view>
        </view>
        <button class="item-btn" @click.stop="goToChallenge(item.id)">去闯关</button>
      </view>
      
      <view v-if="challengeList.length === 0" class="empty-tip">
        <text>暂无闯关练习</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      challengeList: []
    };
  },
  onLoad() {
    this.loadChallengeList();
  },
  methods: {
    // 加载闯关练习列表
    loadChallengeList() {
      this.http('challenge/practiceList', {}, 'get').then(res => {
        if (res.code == 1 && res.data) {
          this.challengeList = res.data;
        }
      });
    },
    
    // 格式化时间
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}时${minutes.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
      } else {
        return `${minutes.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
      }
    },
    
    // 跳转到闯关答题页
    goToChallenge(id) {
      uni.navigateTo({
        url: `/pages/training/challenge?id=${id}`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.challenge-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx 30rpx;
}

.challenge-list {
  .challenge-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .item-content {
      flex: 1;
      
      .item-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 16rpx;
      }
      
      .item-reward {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        
        .reward-icon {
          font-size: 28rpx;
          margin-right: 8rpx;
        }
        
        .reward-text {
          font-size: 26rpx;
          color: #5677fc;
        }
      }
      
      .item-time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .item-btn {
      width: 140rpx;
      height: 60rpx;
      line-height: 60rpx;
      background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
      color: #fff;
      border-radius: 30rpx;
      font-size: 26rpx;
      border: none;
      margin-left: 20rpx;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
  
  .empty-tip {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
  }
}
</style>

