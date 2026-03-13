<template>
  <view class="my-eval-page">
    <topbar title="我的考评"></topbar>

    <scroll-view class="content" scroll-y>
      <view
        class="eval-card"
        v-for="item in list"
        :key="item.id"
        @click="openDetail(item)"
      >
        <view class="eval-title tn-text-ellipsis-2">{{ item.title }}</view>
        <view class="eval-time">
          <text class="tn-icon-time-fill time-icon"></text>
          <text class="time-text">{{ item.time }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import topbar from "@/components/topbar/topbar.vue";

export default {
  name: "MyEvaluation",
  components: { topbar },
  data() {
    return {
      list: [
        {
          id: 1,
          title: "沈以瀚同学在2025年12月考试成绩表现优异…",
          time: "2023-05-07 16:25:33",
        },
      ],
    };
  },
  methods: {
    openDetail() {
      // 先按截图做列表页，详情后续你需要再加我再改
    },
  },
};
</script>

<style lang="scss" scoped>
.my-eval-page {
  min-height: 100vh;
  background: #ffffff;
}

.content {
  /* 为固定 topbar 预留空间 */
  padding-top: 180rpx;
  height: 100vh;
  box-sizing: border-box;
  padding-left: 24rpx;
  padding-right: 24rpx;
}

.eval-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 18rpx;
  padding: 22rpx 22rpx 18rpx;
  box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.06);
}

.eval-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.5;
}

.eval-time {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  color: #9aa0a6;
  font-size: 24rpx;
}

.time-icon {
  font-size: 26rpx;
  margin-right: 10rpx;
}
</style>

