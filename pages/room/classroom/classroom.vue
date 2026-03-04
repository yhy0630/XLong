<template>
  <view class="classroom-page">
    <!-- 顶部背景图 -->
    <image
      class="page-top-bg"
      src="/static/images/banner3.png"
      mode="aspectFill"
    ></image>

    <!-- 页面内容 -->
    <view class="page-content">
      <!-- 顶部标题栏，与资讯列表页保持一致样式 -->
      <view class="search-box">
        <view class="search-header">
          <image
            class="back-icon"
            src="/static/member/back.png"
            mode="widthFix"
            @click="goBack"
          ></image>
          <text class="search-title">培训课堂</text>
        </view>
      </view>

      <!-- 顶部学时信息卡片 -->
      <view class="hours-card">
        <view class="hours-top">
          <view class="hours-top-left">
            <view class="hours-title-row">
              <text class="hours-label">本月学时目标：</text>
              <view class="hours-value-row">
                <text class="hours-value">{{ monthTargetHours }}</text>
                <text class="hours-unit">分钟</text>
              </view>
            </view>
          </view>
        </view>

        <view class="hours-bottom">
          <view class="hours-item">
            <view class="hours-item-left">
              <image
                class="hours-item-icon"
                src="/static/img/B-shijian 1.png"
                mode="widthFix"
              ></image>
            </view>
            <view class="hours-item-right">
              <text class="hours-item-label">今日学时</text>
              <text class="hours-item-value">{{ todayHours }}分钟</text>
            </view>
          </view>

          <view class="hours-item">
            <view class="hours-item-left">
              <image
                class="hours-item-icon"
                src="/static/img/biaozhunicon- 1.png"
                mode="widthFix"
              ></image>
            </view>
            <view class="hours-item-right">
              <text class="hours-item-label">本月累计时长</text>
              <text class="hours-item-value">{{ monthTotalHours }}分钟</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 分类 Tabs -->
      <view class="tabs-wrapper">
        <view
          v-for="item in tabList"
          :key="item.value"
          class="tab-item"
          :class="{ active: currentTab === item.value }"
          @click="switchTab(item.value)"
        >
          {{ item.label }}
        </view>
      </view>

      <!-- 视频列表 -->
      <view class="video-list">
        <view
          v-for="video in videoList"
          :key="video.id"
          class="video-card"
          @click="goVideoDetail(video)"
        >
          <view class="video-cover-wrapper">
            <image
              class="video-cover"
              :src="video.cover"
              mode="aspectFill"
            ></image>
            <view class="video-play-icon">▶</view>
            <view class="video-duration">{{ video.duration }}</view>
          </view>
          <view class="video-info">
            <view class="video-title">
              {{ video.title }}
            </view>
            <view class="video-meta" @click.stop>
              <text class="video-teacher">讲师：{{ video.teacher }}</text>
              <view
                class="like-wrapper"
                @click="toggleLike(video)"
              >
                <image
                  class="like-icon"
                  :src="video.liked ? '/static/img/hand2.png' : '/static/img/hand.png'"
                  mode="widthFix"
                ></image>
                <text class="like-count">{{ video.likeCount }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="tn-tabbar-height"></view>
      <tabbar :theme="tabbarStyle"></tabbar>
    </view>
  </view>
</template>

<script>
export default {
  name: "Classroom",
  data() {
    return {
      tabbarStyle: "simple",
      // 顶部学时信息（暂时写死，后续可改为接口返回）
      monthTargetHours: 80,
      todayHours: 10,
      monthTotalHours: 10,
      // tabs 配置（写死，后续可与后端约定 value）
      tabList: [
        { label: "业务实操", value: "business" },
        { label: "安全警示", value: "safety" },
        { label: "案例分析", value: "case" },
      ],
      currentTab: "business",
      // 视频列表模板数据（后续改为接口返回）
      videoList: [
        {
          id: 1,
          cover: "/static/img/train-banner1.png",
          title: "机车标准化作业流程演示",
          teacher: "王工",
          duration: "15:20",
          likeCount: 234,
          liked: false,
        },
        {
          id: 2,
          cover: "/static/img/train-banner2.png",
          title: "机车标准化作业流程演示（二）",
          teacher: "王工",
          duration: "15:20",
          likeCount: 234,
          liked: false,
        },
      ],
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
      });
    },
    // 切换 tab
    switchTab(value) {
      if (this.currentTab === value) return;
      this.currentTab = value;
      // 这里后续可以根据 currentTab 调用接口获取不同列表
      // 目前先复用同一份假数据
    },
    // 跳转视频详情（后续你提供实际路由）
    goVideoDetail(video) {
      // 占位：后续根据实际详情页路径修改
      // uni.navigateTo({ url: `/pages/training/detail?id=${video.id}` });
      console.log("go video detail", video.id);
    },
    // 点赞（本地状态切换）
    toggleLike(video) {
      video.liked = !video.liked;
      if (video.liked) {
        video.likeCount += 1;
      } else if (video.likeCount > 0) {
        video.likeCount -= 1;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f2f3f5;
}

.classroom-page {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f2f3f5;
  position: relative;
}

/* 顶部背景图层，与资讯列表页保持一致 */
.page-top-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 320rpx;
  z-index: 0;
  pointer-events: none;
}

/* 内容层：确保在背景图之上 */
.page-content {
  position: relative;
  z-index: 1;
  padding-top: 80rpx;
}

/* 搜索框容器（这里只用于放置标题栏，样式与资讯列表页一致） */
.search-box {
  padding: 20rpx 30rpx 10rpx;
  background: transparent;
}

/* 顶部标题栏样式，与资讯列表页一致 */
.search-header {
  display: flex;
  align-items: center;
  padding-bottom: 10rpx;
  position: relative;
  justify-content: center;
}

.back-icon {
  width: 18rpx;
  height: 24rpx;
  position: absolute;
  left: 0;
}

.search-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}

/* 顶部学时卡片 */
.hours-card {
  margin: 20rpx;
  padding: 24rpx 24rpx 16rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
}

.hours-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  border-bottom: 1rpx solid #EEE;
  padding-bottom: 15rpx;
}

.hours-top-left {
  display: flex;
  flex-direction: column;
}

.hours-label {
  font-size: 27rpx;
  color: #232323;
}

.hours-title-row {
  display: flex;
  align-items: baseline;
}

.hours-value-row {
  display: flex;
  align-items: baseline;
  margin-left: 16rpx;
}

.hours-value {
  font-size: 30rpx;
  font-weight: 550;
  color: #5677fc;
  margin-right: 6rpx;
}

.hours-unit {
  font-size: 30rpx;
  color: #5677fc;
  font-weight: 550;

}

.hours-illustration {
  width: 180rpx;
}

.hours-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.hours-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hours-item + .hours-item {
  margin-left: 20rpx;
}

.hours-item-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 8rpx;
}

.hours-item-label {
  font-size: 30rpx;
  color: #5677fc;
  text-align: center;
  font-weight: 600;
  display: block;
}

.hours-item-value {
  margin-top: 6rpx;
  font-size: 30rpx;
  color: #5677fc;
  text-align: center;
  font-weight: 600;
  display: block;
}

/* tabs */
.tabs-wrapper {
  margin: 10rpx 20rpx 20rpx;
  padding: 0 10rpx;
  display: flex;
  background: #ECECF0;
  border-radius: 60rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #000;
  position: relative;
  border-radius: 60rpx;
}

.tab-item.active {
  font-weight: 500;
  color: #ffffff;
  background-color: #5677fc;
}

/* 视频列表 */
.video-list {
  padding: 20rpx;
}

.video-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 20rpx;
}

.video-cover-wrapper {
  position: relative;
  width: 100%;
  height: 360rpx;
}

.video-cover {
  width: 100%;
  height: 100%;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40rpx;
  padding-left: 6rpx;
}

.video-duration {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  padding: 4rpx 10rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.5);
  font-size: 22rpx;
  color: #fff;
}

.video-info {
  padding: 20rpx 24rpx 18rpx;
}

.video-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.6;
}

.video-meta {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.like-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 6rpx;
}

.like-count {
  font-size: 24rpx;
  color: #999;
}

.tn-tabbar-height {
  min-height: 20rpx;
  height: calc(40rpx + env(safe-area-inset-bottom) / 2);
}
</style>


