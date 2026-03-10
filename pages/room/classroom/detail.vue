<template>
  <view class="detail-page">
    <!-- 顶部标题（使用系统导航栏标题“课堂详情”即可） -->

    <view class="detail-content">
      <!-- 标题 -->
      <view class="detail-title">
        {{ videoInfo.title }}
      </view>

      <!-- 时间 & 浏览量 -->
      <view class="detail-meta">
        <text class="meta-text">
          {{ videoInfo.publishDate || '-' }}
        </text>
        <text class="meta-dot">·</text>
        <text class="meta-text">
          {{ (videoInfo.viewCount || 0) + ' 次浏览' }}
        </text>
      </view>

      <!-- 视频区域 -->
      <view class="video-wrapper">
        <video
          class="video-player"
          :src="videoInfo.videoUrl"
          :poster="videoInfo.cover"
          controls
          :show-center-play-btn="true"
        ></video>
        <view class="video-duration-tag" v-if="videoInfo.duration">
          {{ videoInfo.duration }}
        </view>
      </view>

      <!-- 底部点赞/学时信息，可根据需要扩展 -->
      <view class="bottom-bar">
        <view class="like-area">
          <image
            class="like-icon"
            :src="videoInfo.liked ? '/static/img/hand2.png' : '/static/img/hand.png'"
            mode="widthFix"
          ></image>
          <text class="like-count">
            {{ videoInfo.likeCount || 0 }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "ClassroomDetail",
  data() {
    return {
      videoInfo: {
        id: null,
        title: "",
        cover: "",
        duration: "",
        teacher: "",
        likeCount: 0,
        liked: false,
        publishDate: "",
        viewCount: 0,
        videoUrl: "",
      },
    };
  },
  onLoad(options) {
    if (options && options.video) {
      try {
        const parsed = JSON.parse(decodeURIComponent(options.video));
        this.videoInfo = Object.assign({}, this.videoInfo, parsed || {});
      } catch (e) {
        console.error("parse video param error", e);
      }
    }
    // 可以根据需要在这里发请求，按 id 获取最新详情数据
  },
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  box-sizing: border-box;
}

.detail-content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.detail-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222222;
  line-height: 1.6;
}

.detail-meta {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999999;
}

.meta-text {
  font-size: 24rpx;
  color: #999999;
}

.meta-dot {
  margin: 0 12rpx;
  color: #d0d0d0;
}

.video-wrapper {
  margin-top: 20rpx;
  position: relative;
  width: 100%;
  border-radius: 16rpx;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 420rpx;
  background-color: #000000;
}

.video-duration-tag {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.6);
  font-size: 22rpx;
  color: #ffffff;
}

.bottom-bar {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.like-area {
  display: flex;
  align-items: center;
}

.like-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 8rpx;
}

.like-count {
  font-size: 26rpx;
  color: #666666;
}
</style>

