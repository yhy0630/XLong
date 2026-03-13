<template>
  <view class="privacy-page">
    <topbar title="隐私协议"></topbar>

    <scroll-view class="content" scroll-y>
      <view class="title">用户隐私协议</view>
      <view class="text">
        2022年6月28日 第十中国条 互联网信息服务提供者应当履行互联网用户账号信息管理主体责任，配备与服务规模相适应的专业人员和技术能力，建立健全并严格落实真实身份信息认证、账号信息核验、信息内…
      </view>
    </scroll-view>
  </view>
</template>

<script>
import topbar from "@/components/topbar/topbar.vue";

export default {
  name: "UserPrivacy",
  components: { topbar },
};
</script>

<style lang="scss" scoped>
.privacy-page {
  min-height: 100vh;
  background: #fff;
}

.content {
  /* 为固定 topbar 预留空间 */
  padding-top: 180rpx;
  box-sizing: border-box;
  height: 100vh;
  padding-left: 28rpx;
  padding-right: 28rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-top: 24rpx;
  margin-bottom: 20rpx;
}

.text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>

