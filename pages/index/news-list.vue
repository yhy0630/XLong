<template>
  <view class="news-list-page">
    <!-- #ifdef H5 -->
    <tn-nav-bar fixed :bottomShadow="false" backTitle=" ">
      <view class="">
        <text class="tn-text-lg">新闻动态</text>
      </view>
    </tn-nav-bar>
    <!-- #endif -->

    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-input-wrapper">
        <image
          class="search-icon"
          src="/static/img/搜索.png"
          mode="widthFix"
        ></image>
        <input
          class="search-input"
          type="text"
          v-model="keyword"
          placeholder="搜索你感兴趣的资讯"
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 分类Tab -->
    <view class="cate-tabs" v-if="cateList.length > 0">
      <scroll-view scroll-x class="tabs-scroll">
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

    <!-- 列表内容 -->
    <view v-if="list.length > 0" class="news-list">
      <!-- 图文样式 -->
      <view
        v-for="(item, index) in list"
        :key="index"
        class="news-item image-text-item"
        v-if="item.style === 'IMAGE_TEXT' || !item.style"
        @click="goDetail(item.id)"
      >
        <view class="item-content">
          <view class="item-left">
            <!-- 列表展示两行内容，多余部分省略：优先使用 contents，没有则回退 name -->
            <view class="item-title">
              {{ item.contents || item.name }}
            </view>
            <view class="item-stats">
              <text class="stat-item">
                <text class="icon">👍</text>
                {{ item.like_count || 0 }}
              </text>
              <text class="stat-item">
                <text class="icon">💬</text>
                {{ item.comment_count || 0 }}
              </text>
              <text class="stat-item">
                <text class="icon">👁</text>
                {{ item.view_count || 0 }}
              </text>
            </view>
          </view>
          <view class="item-right" v-if="item.cover_image">
            <image 
              :src="item.cover_image" 
              mode="aspectFill"
              class="cover-image"
            ></image>
          </view>
        </view>
      </view>

      <!-- 视频样式 -->
      <view
        v-for="(item, index) in list"
        :key="index"
        class="news-item video-item"
        v-if="item.style === 'VIDEO'"
        @click="goDetail(item.id)"
      >
        <view class="video-cover-wrapper">
          <image 
            :src="item.cover_image || '/static/img/default-video.png'" 
            mode="aspectFill"
            class="video-cover"
          ></image>
          <view class="play-icon">▶</view>
        </view>
        <view class="video-info">
          <!-- 列表展示两行内容，多余部分省略：优先使用 contents，没有则回退 name -->
          <view class="item-title">
            {{ item.contents || item.name }}
          </view>
          <view class="item-stats">
            <text class="stat-item">
              <text class="icon">👍</text>
              {{ item.like_count || 0 }}
            </text>
            <text class="stat-item">
              <text class="icon">💬</text>
              {{ item.comment_count || 0 }}
            </text>
            <text class="stat-item">
              <text class="icon">👁</text>
              {{ item.view_count || 0 }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-box">
      <tui-no-data imgUrl="/static/img/img_noorder_3x.png">暂无数据</tui-no-data>
    </view>

    <view class="tn-tabbar-height"></view>
    <tabbar :theme="tabbarStyle"></tabbar>
  </view>
</template>

<script>
import newsApi from "@/common/api/news.js";

export default {
  name: "NewsList",
  data() {
    return {
      list: [],
      cateList: [],
      currentCateId: 0,
      currentSubCateId: 0,
      hasMore: false,
      currentPage: 1,
      loadFlag: "loading",
      tabbarStyle: "simple",
      keyword: "",
    };
  },
  onLoad(options) {
    if (options.cate_id) {
      this.currentCateId = parseInt(options.cate_id);
    }
    this.getCates();
    this.getData();
  },
  onReachBottom() {
    if (this.hasMore) {
      this.currentPage++;
      this.getData();
    }
  },
  methods: {
    // 获取分类列表
    getCates() {
      newsApi.getNewsCates(this).then((res) => {
        if (res && res.data && res.data.list) {
          this.cateList = res.data.list;
        }
      });
    },
    // 切换分类
    switchCate(cateId) {
      this.currentCateId = cateId;
      this.currentSubCateId = 0;
      this.currentPage = 1;
      this.list = [];
      this.getData();
    },
    // 获取数据
    getData() {
      this.loadFlag = "loading";

      let params = {
        page: this.currentPage,
      };
      if (this.currentCateId > 0) {
        params.cate_id = this.currentCateId;
      }
      if (this.currentSubCateId > 0) {
        params.sub_cate_id = this.currentSubCateId;
      }
      if (this.keyword) {
        params.keyword = this.keyword;
      }

      newsApi.getNewsList(this, params).then((res) => {
        if (res && res.data) {
          this.list = this.list.concat(res.data.list.data || []);
          this.hasMore = res.data.list.has_more;
          this.currentPage = res.data.list.current_page;
          this.loadFlag = "over";
        }
      });
    },
    // 跳转详情
    goDetail(id) {
      this.utils.goto("news-detail?id=" + id);
    },
    // 搜索
    onSearch() {
      this.currentPage = 1;
      this.list = [];
      this.getData();
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background-color: #fff;
}

.news-list-page {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #fff;
}

/* 搜索框 */
.search-box {
  padding: 20rpx 30rpx 10rpx;
  background: linear-gradient(180deg, #4f7efe, #ffffff);
}

.search-input-wrapper {
  border: 0.5px solid #FFFFFF80;
  background: #FFFFFF47;

  border-radius: 30rpx;
  padding: 10rpx 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 16rpx;
}

.search-input {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

/* 分类Tab */
.cate-tabs {
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.tab-item {
  display: inline-block;
  padding: 10rpx 30rpx;
  margin: 0 10rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 30rpx;
  transition: all 0.3s;

  &.active {
    background: #5677fc;
    color: #fff;
  }
}

/* 列表样式 */
.news-list {
  background-color: #fff;
}

.news-item {
  background: #fff;
  border-bottom: 1rpx solid #e5e5e5;
  
  &:last-child {
    border-bottom: none;
  }
}

/* 图文样式 */
.image-text-item {
  .item-content {
    display: flex;
    padding: 30rpx;
  }

  .item-left {
    flex: 1;
    padding-right: 20rpx;
  }

  .item-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
    margin-bottom: 20rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .item-right {
    width: 200rpx;
    height: 150rpx;
    flex-shrink: 0;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    border-radius: 10rpx;
  }
}

/* 视频样式 */
.video-item {
  .video-cover-wrapper {
    position: relative;
    width: 100%;
    height: 400rpx;
  }

  .video-cover {
    width: 100%;
    height: 100%;
  }

  .play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100rpx;
    height: 100rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 40rpx;
    padding-left: 8rpx;
  }

  .video-info {
    padding: 20rpx 30rpx 30rpx;
  }

  .item-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
    margin-bottom: 15rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
}

/* 统计信息 */
.item-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 24rpx;
  color: #999;
}

.stat-item {
  margin-right: 20rpx;
  display: flex;
  align-items: center;

  .icon {
    margin-right: 4rpx;
    font-size: 22rpx;
  }
}

.stat-time {
  margin-left: auto;
  color: #999;
}

.empty-box {
  padding: 100rpx 0;
}

.tn-tabbar-height {
  min-height: 20rpx;
  height: calc(40rpx + env(safe-area-inset-bottom) / 2);
}
</style>
