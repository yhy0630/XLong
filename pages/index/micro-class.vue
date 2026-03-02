<template>
  <view class="micro-class-page">
    <!-- 顶部学习统计卡片 -->
    <view class="header-wrapper">
      <view class="header-bg"></view>
      <view class="header-card">
        <view class="header-title-row">
          <view class="header-title-left">
            <text class="header-title">微课堂</text>
            <text class="header-subtitle">本月已完成学习时长</text>
          </view>
          <view class="header-title-right">
            <image
              class="header-icon"
              src="/static/img/课堂.png"
              mode="aspectFit"
            ></image>
          </view>
        </view>
        <view class="header-stat-row">
          <view class="stat-item">
            <text class="stat-label">本月学习</text>
            <text class="stat-value">{{ monthStudyHours }}分</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">累计学习</text>
            <text class="stat-value">{{ totalStudyHours }}分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类 Tab（来自后台的新闻分类） -->
    <view class="tabs-wrapper">
      <scroll-view scroll-x class="tabs-scroll" :scroll-with-animation="true">
        <view
          class="tab-item"
          :class="{ active: currentCateId === 0 }"
          @click="switchCate(0)"
        >
          全部
        </view>
        <view
          class="tab-item"
          v-for="cate in cateList"
          :key="cate.id"
          :class="{ active: currentCateId === cate.id }"
          @click="switchCate(cate.id)"
        >
          {{ cate.name }}
        </view>
      </scroll-view>
    </view>

    <!-- 内容列表 -->
    <view v-if="list.length > 0" class="list-wrapper">
      <view
        v-for="(item, index) in list"
        :key="index"
        class="micro-item"
        @click="goDetail(item)"
      >
        <!-- 视频样式 -->
        <view v-if="item.style === 'VIDEO'" class="micro-item-video">
          <view class="cover-wrapper">
            <image
              class="cover-image"
              :src="fullCover(item)"
              mode="aspectFill"
            ></image>
            <view class="play-badge">
              <text class="play-icon">▶</text>
            </view>
            <view class="duration-badge" v-if="item.duration">
              <text class="duration-text">{{ item.duration }}</text>
            </view>
          </view>
          <view class="info-wrapper">
            <view class="title">{{ item.name }}</view>
            <view class="sub-title" v-if="renderSubTitle(item)">
              {{ renderSubTitle(item) }}
            </view>
            <view class="bottom-row">
              <view class="left-meta">
                <text class="meta-text">
                  {{ formatDate(item.createtime) }}
                </text>
              </view>
              <view class="right-stats">
                <view class="stat">
                  <image
                    class="stat-icon"
                    src="/static/img/hand.png"
                    mode="aspectFit"
                  ></image>
                  <text class="stat-text">{{ item.like_count || 0 }}</text>
                </view>
                <view class="stat">
                  <image
                    class="stat-icon"
                    src="/static/img/message.png"
                    mode="aspectFit"
                  ></image>
                  <text class="stat-text">{{ item.comment_count || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 图文样式 -->
        <view v-else class="micro-item-image-text">
          <view class="info-wrapper">
            <view class="title">
              {{ item.name }}
            </view>
            <view class="sub-title" v-if="renderSubTitle(item)">
              {{ renderSubTitle(item) }}
            </view>
            <view class="bottom-row">
              <view class="left-meta">
                <text class="meta-text">
                  {{ formatDate(item.createtime) }}
                </text>
              </view>
              <view class="right-stats">
                <view class="stat">
                  <image
                    class="stat-icon"
                    src="/static/img/hand.png"
                    mode="aspectFit"
                  ></image>
                  <text class="stat-text">{{ item.like_count || 0 }}</text>
                </view>
                <view class="stat">
                  <image
                    class="stat-icon"
                    src="/static/img/message.png"
                    mode="aspectFit"
                  ></image>
                  <text class="stat-text">{{ item.comment_count || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="cover-wrapper" v-if="item.cover_image">
            <image
              class="cover-image"
              :src="fullCover(item)"
              mode="aspectFill"
            ></image>
          </view>
        </view>
      </view>

      <view class="load-more" v-if="hasMore">
        <tn-load-more status="loading"></tn-load-more>
      </view>
      <view class="load-more" v-else>
        <tn-load-more status="nomore" dot></tn-load-more>
      </view>
    </view>

    <view v-else class="empty-wrapper">
      <tui-no-data imgUrl="/static/img/img_noorder_3x.png">暂无数据</tui-no-data>
    </view>
  </view>
</template>

<script>
import newsApi from "@/common/api/news.js";

export default {
  name: "MicroClass",
  data() {
    return {
      cateList: [],
      currentCateId: 0,
      list: [],
      currentPage: 1,
      hasMore: false,
      monthStudyHours: "0.00",
      totalStudyHours: "0.00",
    };
  },
  onLoad() {
    this.getCates();
    this.getList();
    this.loadWatchSummary();
  },
  onReachBottom() {
    if (this.hasMore) {
      this.currentPage++;
      this.getList();
    }
  },
  methods: {
    // 获取分类
    getCates() {
      // 直接使用 NEWS 频道（与 news-list.vue 保持一致）
      newsApi.getNewsCates(this).then((res) => {
        if (res && res.data && res.data.list) {
          const list = res.data.list || [];
          // 后端返回的是树形结构，list 中的每个元素都是一级分类
          // 提取 id 和 name，确保数据结构正确
          this.cateList = list.map((item) => {
            if (typeof item === 'object' && item !== null) {
              return {
                id: item.id || item.cate_id || 0,
                name: item.name || item.cate_name || '',
              };
            }
            return null;
          }).filter(item => item && item.id && item.name); // 过滤掉无效数据
        } else {
          this.cateList = [];
        }
      }).catch((err) => {
        console.error("获取分类失败:", err);
        this.cateList = [];
      });
    },
    // 切换分类
    switchCate(cateId) {
      if (this.currentCateId === cateId) return;
      this.currentCateId = cateId;
      this.currentPage = 1;
      this.list = [];
      this.getList();
    },
    // 获取列表
    getList() {
      const params = {
        page: this.currentPage,
      };
      if (this.currentCateId > 0) {
        params.cate_id = this.currentCateId;
      }
      // 不传 channel 参数，使用默认值 NEWS（与 news-list.vue 保持一致）

      newsApi.getNewsList(this, params).then((res) => {
        if (res && res.data && res.data.list) {
          const pageList = res.data.list.data || [];
          this.list = this.currentPage === 1 ? pageList : this.list.concat(pageList);
          this.hasMore = res.data.list.has_more;
          this.currentPage = res.data.list.current_page;
        }
      });
    },
    // 加载当前用户在微课堂下的观看时间汇总
    loadWatchSummary() {
      if (!uni.getStorageSync("token")) {
        this.monthStudyHours = "0.00";
        this.totalStudyHours = "0.00";
        return;
      }
      // 不传 channel 参数，使用默认值 NEWS
      newsApi
        .getWatchSummary(this)
        .then((res) => {
          if (res && res.data) {
            const monthSeconds = res.data.month_seconds || 0;
            const totalSeconds = res.data.total_seconds || 0;
            // 展示为分钟：秒 -> 分钟，保留两位小数
            this.monthStudyHours = (monthSeconds / 60).toFixed(2);
            this.totalStudyHours = (totalSeconds / 60).toFixed(2);
          }
        })
        .catch(() => {});
    },
    // 拼接封面图片（兼容相对路径）
    fullCover(item) {
      if (!item.cover_image) return "";
      if (item.cover_image.indexOf("http") === 0) return item.cover_image;
      return (this.imgUrl || "") + item.cover_image;
    },
    // 渲染二级标题：前缀和内容都由后台控制，可选字段
    renderSubTitle(item) {
      // 支持多种字段：subtitle / sub_title / teacher 等
      const label =
        item.subtitle_label ||
        item.sub_title_label ||
        item.teacher_label ||
        "讲师";
      const main =
        item.subtitle_value ||
        item.sub_title_value ||
        item.teacher ||
        "";
      const extra = item.subtitle_extra || item.sub_title_extra || "";

      if (!main && !extra) return "";
      if (extra) {
        return `${label}：${main}；${extra}`;
      }
      return `${label}：${main}`;
    },
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp * 1000);
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, "0");
      const d = date.getDate().toString().padStart(2, "0");
      return `${y}-${m}-${d}`;
    },
    // 跳转详情
    goDetail(item) {
      if (!item.id) return;
      this.utils.goto("/pages/index/news-detail?id=" + item.id);
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f6fa;
}

.micro-class-page {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.header-wrapper {
  position: relative;
  padding: 20rpx 24rpx 10rpx;

  .header-bg {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 260rpx;
    background: linear-gradient(135deg, #5c8dff, #7ac9ff);
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
    z-index: 0;
  }

  .header-card {
    position: relative;
    z-index: 1;
    margin-top: 40rpx;
    padding: 32rpx 28rpx 24rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    box-shadow: 0 14rpx 40rpx rgba(40, 80, 180, 0.25);

    .header-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title-left {
        .header-title {
          font-size: 34rpx;
          font-weight: 600;
          color: #1f2443;
        }

        .header-subtitle {
          margin-top: 6rpx;
          font-size: 24rpx;
          color: #8d95b2;
        }
      }

      .header-title-right {
        .header-icon {
          width: 120rpx;
          height: 120rpx;
        }
      }
    }

    .header-stat-row {
      margin-top: 28rpx;
      display: flex;
      justify-content: space-between;

      .stat-item {
        flex: 1;

        &:first-child {
          margin-right: 36rpx;
        }

        .stat-label {
          font-size: 24rpx;
          color: #8d95b2;
        }

        .stat-value {
          margin-top: 8rpx;
          font-size: 32rpx;
          font-weight: 600;
          color: #2754ff;
        }
      }
    }
  }
}

.tabs-wrapper {
  margin-top: 16rpx;
  padding: 0 24rpx;

  .tabs-scroll {
    white-space: nowrap;
  }

  .tab-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12rpx 28rpx;
    margin-right: 20rpx;
    border-radius: 999rpx;
    font-size: 26rpx;
    color: #4f5a7f;
    background-color: #edf0ff;

    &.active {
      background: linear-gradient(135deg, #5c8dff, #7ac9ff);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 10rpx 24rpx rgba(71, 113, 255, 0.45);
    }
  }
}

.list-wrapper {
  padding: 20rpx 24rpx 40rpx;
}

.micro-item {
  margin-bottom: 24rpx;
  padding: 20rpx 20rpx 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 10rpx 40rpx rgba(39, 60, 120, 0.08);
}

.micro-item-video {
  display: flex;
  flex-direction: column;
}

.micro-item-image-text {
  display: flex;
  flex-direction: row;
}

.cover-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 18rpx;

  .cover-image {
    width: 100%;
    height: 320rpx;
  }

  .play-badge {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90rpx;
    height: 90rpx;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;

    .play-icon {
      color: #ffffff;
      font-size: 42rpx;
      margin-left: 6rpx;
    }
  }

  .duration-badge {
    position: absolute;
    right: 14rpx;
    bottom: 12rpx;
    padding: 4rpx 10rpx;
    border-radius: 20rpx;
    background: rgba(0, 0, 0, 0.55);

    .duration-text {
      font-size: 22rpx;
      color: #ffffff;
    }
  }
}

.micro-item-image-text {
  .info-wrapper {
    flex: 1;
    padding-right: 16rpx;
  }

  .cover-wrapper {
    width: 260rpx;

    .cover-image {
      width: 260rpx;
      height: 180rpx;
    }
  }
}

.info-wrapper {
  margin-top: 18rpx;

  .title {
    font-size: 30rpx;
    color: #171b33;
    font-weight: 600;
    line-height: 1.4;
  }

  .sub-title {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #8c93b0;
  }

  .bottom-row {
    margin-top: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-meta {
      .meta-text {
        font-size: 22rpx;
        color: #a2a7c0;
      }
    }

    .right-stats {
      display: flex;
      align-items: center;

      .stat {
        display: flex;
        align-items: center;
        margin-left: 24rpx;

        .stat-icon {
          width: 30rpx;
          height: 30rpx;
          margin-right: 6rpx;
        }

        .stat-text {
          font-size: 24rpx;
          color: #a2a7c0;
        }
      }
    }
  }
}

.load-more {
  margin-top: 10rpx;
}

.empty-wrapper {
  margin-top: 160rpx;
}
</style>


