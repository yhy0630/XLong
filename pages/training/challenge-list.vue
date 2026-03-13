<template>
  <view class="challenge-list-page">
    <!-- #ifdef H5 -->
    <tn-nav-bar fixed :bottomShadow="false" backTitle=" ">
      <view class="">
        <text class="tn-text-lg">闯关练习</text>
      </view>
    </tn-nav-bar>
    <!-- #endif -->

    <!-- 筛选与排序 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showFilterPopup = true">
        <text>筛选分类</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view class="filter-item" @click="showSortPopup = true">
        <text>排序</text>
        <text class="filter-arrow">▼</text>
      </view>
    </view>

    <view class="challenge-list">
      <view 
        class="challenge-item"
        v-for="(item, index) in challengeList"
        :key="item.id"
        @click="goToLevels(item.id)"
      >
        <view class="item-content">
          <view class="item-title">{{ item.cate_name || item.name || item.title }}</view>
          <view class="item-reward">
            <text class="reward-icon">⭐</text>
            <text class="reward-text">通关送积分</text>
          </view>
          <view class="item-time">考试限时{{ formatTime(item.time_limit) }}</view>
        </view>
        <button class="item-btn" @click.stop="goToLevels(item.id)">去闯关</button>
      </view>
      
      <view v-if="!loading && challengeList.length === 0" class="empty-tip">
        <text>暂无闯关练习</text>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <view class="popup-mask" v-if="showFilterPopup" @click="showFilterPopup = false"></view>
    <view class="popup filter-popup" :class="{ show: showFilterPopup }">
      <view class="popup-title">筛选分类</view>
      <view class="popup-option" @click="setFilter(0, 0); showFilterPopup = false">
        <text>全部</text>
      </view>
      <view class="popup-option" v-for="c in cateList" :key="'c'+c.id" @click="setFilter(0, c.id); showFilterPopup = false">
        <text>{{ cateName(c) }}</text>
      </view>
    </view>

    <!-- 排序弹窗 -->
    <view class="popup-mask" v-if="showSortPopup" @click="showSortPopup = false"></view>
    <view class="popup sort-popup" :class="{ show: showSortPopup }">
      <view class="popup-title">排序</view>
      <view class="popup-option" :class="{ active: sortBy === 'id' && sortOrder === 'desc' }" @click="setSort('id', 'desc'); showSortPopup = false">
        <text>默认</text>
      </view>
      <view class="popup-option" :class="{ active: sortBy === 'createtime' && sortOrder === 'desc' }" @click="setSort('createtime', 'desc'); showSortPopup = false">
        <text>最新</text>
      </view>
      <view class="popup-option" :class="{ active: sortBy === 'createtime' && sortOrder === 'asc' }" @click="setSort('createtime', 'asc'); showSortPopup = false">
        <text>最早</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      challengeList: [],
      loading: false,
      showFilterPopup: false,
      showSortPopup: false,
      industryId: 0,
      challengeCateId: 0,
      cateList: [],
      industryList: [],
      sortBy: 'id',
      sortOrder: 'desc'
    };
  },
  onLoad() {
    this.loadFilterCate();
    this.loadChallengeList();
  },
  methods: {
    loadFilterCate() {
      this.http('challenge/filterCate', {}, 'get').then(res => {
        if (res.code == 1 && res.data) {
          this.industryList = res.data.industries || [];
          this.cateList = res.data.cates || [];
        }
      });
    },
    cateName(c) {
      if (!c) return '';
      if (c.level == '2' && c.parent_id) {
        const parent = this.cateList.find(p => p.id == c.parent_id);
        return parent ? parent.name + ' - ' + c.name : c.name;
      }
      return c.name;
    },
    setFilter(industryId, cateId) {
      this.industryId = industryId;
      this.challengeCateId = cateId;
      this.loadChallengeList();
    },
    setSort(sortBy, sortOrder) {
      this.sortBy = sortBy;
      this.sortOrder = sortOrder;
      this.loadChallengeList();
    },
    loadChallengeList() {
      this.loading = true;
      const params = {
        sort: this.sortBy,
        order: this.sortOrder
      };
      if (this.industryId) params.industry_id = this.industryId;
      if (this.challengeCateId) params.challenge_cate_id = this.challengeCateId;
      this.http('challenge/practiceList', params, 'get').then(res => {
        this.loading = false;
        if (res.code == 1 && res.data) {
          this.challengeList = res.data;
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    formatTime(seconds) {
      if (seconds === undefined || seconds === null) return '00:00秒';
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) {
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}秒`;
      }
      return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}秒`;
    },
    goToLevels(id) {
      const cateId = id || this.challengeCateId;
      uni.navigateTo({
        url: `/pages/training/challenge-levels?cate_id=${cateId}`
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

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20rpx 0;
  gap: 40rpx;
  .filter-item {
    font-size: 28rpx;
    color: #666;
    .filter-arrow {
      margin-left: 8rpx;
      font-size: 20rpx;
    }
  }
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

.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
}
.popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  z-index: 101;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  transform: translateY(100%);
  transition: transform 0.2s;
  max-height: 60vh;
  overflow-y: auto;
  &.show {
    transform: translateY(0);
  }
  .popup-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
  }
  .popup-option {
    padding: 24rpx 0;
    font-size: 30rpx;
    color: #333;
    &.active {
      color: #5677fc;
    }
  }
}
</style>
