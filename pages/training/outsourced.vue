<template>
  <view class="training-page">
    <!-- #ifdef H5 -->
    <tn-nav-bar fixed :bottomShadow="false" backTitle=" ">
      <view class="">
        <text class="tn-text-lg">委外人员考培</text>
      </view>
    </tn-nav-bar>
    <!-- #endif -->

    <view class="training-list">
      <view 
        class="training-item"
        v-for="(item, index) in trainingList"
        :key="index"
        @click="goToDetail(item.path)"
      >
        <view class="item-left">
          <image v-if="item.icon" class="item-icon" :src="item.icon" mode="aspectFit"></image>
          <text class="item-text">{{ item.name }}</text>
        </view>
        <tui-icon name="arrowright" color="#77797EE" :size="28" unit="px"></tui-icon>
      </view>
    </view>
  </view>
</template>

<script>
import userApi from "@/common/api/user.js";
import tuiIcon from "@/components/tui-icon/tui-icon.vue";

export default {
  components: { tuiIcon },
  data() {
    return {
      trainingList: [
        {
          name: "日常练习",
          icon: "/static/img/execise.png",
          path: "/pages/train/index?page=daily",
        },
        {
          name: "模拟考试",
          icon: "/static/img/execise.png",
          path: "/pages/paper/index?type=mock",
        },
        {
          name: "考试",
          icon: "/static/img/execise.png",
          path: "/pages/paper/index?type=exam",
        },
        {
          name: "学习视频",
          icon: "/static/img/xuexishipin 1.png",
          path: "/pages/index/micro-class",
        },
      ],
    };
  },
  methods: {
    // 检查档案是否已填写
    checkProfile(type) {
      userApi.getProfile(this).then(res => {
        if (res.code == 1 && res.data && res.data.training_type) {
          // 已填写，正常显示列表
        } else {
          // 未填写，跳转到表单页面
          uni.redirectTo({
            url: `/pages/user/profile?type=${type}`
          });
        }
      }).catch(() => {
        // 获取失败，跳转到表单页面
        uni.redirectTo({
          url: `/pages/user/profile?type=${type}`
        });
      });
    },
    goToDetail(path) {
      this.utils.goto(path);
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.training-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 20rpx;
}

.training-list {
  background-color: #fff;
  margin: 0 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  
  .training-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background-color: #f8f8f8;
    }
    
    .item-left {
      display: flex;
      align-items: center;
      flex: 1;
      
      .item-icon {
        width: 52rpx;
        height: 52rpx;
        margin-right: 24rpx;
      }
      
      .item-text {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }
    }
    
    .item-arrow {
      width: 28rpx;
      height: 28rpx;
      opacity: 0.4;
    }
  }
}
</style>

