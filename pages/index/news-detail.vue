<!-- 新闻 详情 -->
<template>
  <view class="container" @tap="handleContainerTap">

    <!-- 自定义顶部导航栏 -->
    <topbar title="动态详情" @back="handleBack" />

    <view>
      <view style="background-color: #FFFFFF;padding: 30rpx 30rpx 30rpx 30rpx;">
        <view class="titleBox text-xl text-black text-bold">{{ newsData.name }}</view>

        <view class="flex justify-between text-df text-gray margin-top-sm margin-bottom-sm">
          <text>{{ newsData.create_time_text }}</text>
          <text v-if="newsData.view_count !== undefined">
            <image class="view-icon" src="/static/img/eye.png" mode="widthFix"></image>
            <text>{{ newsData.view_count }}</text>
          </text>
        </view>

        <!-- 图片显示在时间下面 -->
        <view v-if="newsData.cover_image && newsData.style !== 'VIDEO'" class="cover-image-wrapper">
          <image 
            :src="newsData.cover_image" 
            mode="widthFix"
            class="cover-image-rounded"
            @click="previewImage(0)"
          ></image>
        </view>

        <!-- 视频播放区域 -->
        <view v-if="newsData.style === 'VIDEO' && newsData.video_url" class="video-wrapper margin-top-sm">
          <video 
            :src="newsData.video_url" 
            controls 
            class="video-player"
            :poster="newsData.cover_image"
            :show-center-play-btn="true"
            :enable-play-gesture="true"
            @timeupdate="handleTimeUpdate"
            @ended="handleVideoEnded"
            @pause="handleVideoPaused"
          ></video>
        </view>

        <!-- 中间文章区域 -->
        <view class="contentBox text-lg text-black margin-top-sm margin-tb-lg">
          <view class="margin-top-sm" v-html="newsData.contents"></view>
        </view>
      </view>

      <view class="comment-card">
        <view class="comment-header">
          <text class="comment-title">| 评论 {{ commentTotal }} 条</text>
        </view>

        <view v-if="comments.length > 0">
          <view
            class="comment-item"
            v-for="(item, index) in comments"
            :key="index"
          >
            <image
              class="comment-avatar"
              :src="item.user && item.user.avatar ? item.user.avatar : defaultAvatar"
              mode="aspectFill"
            ></image>
            <view class="comment-body">
              <view class="comment-meta">
                <text class="comment-name">{{ item.user ? item.user.nickname : '匿名用户' }}</text>
                <text class="comment-time">{{ item.createtime_text }}</text>
              </view>
              <view class="comment-content">{{ item.content }}</view>
            </view>
          </view>

          <view class="comment-loadmore" v-if="commentHasMore">
            <tn-button
              size="sm"
              shape="round"
              padding="10rpx 30rpx"
              backgroundColor="#f5f7fb"
              fontColor="#5677fc"
              :loading="commentLoading"
              @click="getComments(true)"
            >加载更多</tn-button>
          </view>
        </view>
        <view v-else class="comment-empty">
          <tui-empty :imgUrl="'/static/img/img_noorder_3x.png'" text="还没有评论"></tui-empty>
        </view>

        <!-- 评论输入框和操作栏 -->
        <view class="comment-action-bar" :class="{ 'expanded': commentInputExpanded }" @tap.stop>
          <!-- 输入框区域 -->
          <view class="comment-input-wrapper" :class="{ 'expanded': commentInputExpanded }" @tap.stop>
            <view 
              class="comment-input-placeholder" 
              v-if="!commentInputExpanded"
              @tap.stop="expandCommentInput"
            >
              <text class="placeholder-text">真实发声,言之有物</text>
            </view>
            <textarea
              v-else
              class="comment-textarea-expanded"
              v-model="commentContent"
              maxlength="200"
              placeholder="真实发声,言之有物"
              :auto-focus="true"
              :disabled="submitting"
              @focus="onCommentFocus"
              @blur="onCommentBlur"
              @tap.stop
            ></textarea>
          </view>
          
          <!-- 右侧操作按钮（未展开时显示） -->
          <view class="action-buttons" v-if="!commentInputExpanded">
            <!-- 点赞按钮 -->
            <view class="action-btn" @click="toggleLike">
              <image
                class="action-icon"
                :class="{ liked: isLiked }"
                src="/static/img/hand2.png"
                mode="widthFix"
              ></image>
              <text class="action-count">{{ newsData.like_count || 0 }}</text>
            </view>
            
            <!-- 评论按钮 -->
            <view class="action-btn" @click="expandCommentInput">
              <image class="action-icon" src="/static/img/message2.png" mode="widthFix"></image>
              <text class="action-count">{{ commentTotal }}</text>
            </view>
          </view>
          
          <!-- 展开时的操作栏 -->
          <view class="expanded-actions" v-if="commentInputExpanded">
            <view class="action-buttons">
              <!-- 点赞按钮 -->
              <view class="action-btn" @click="toggleLike">
                <image
                  class="action-icon"
                  :class="{ liked: isLiked }"
                  src="/static/img/hand2.png"
                  mode="widthFix"
                ></image>
                <text class="action-count">{{ newsData.like_count || 0 }}</text>
              </view>
              
              <!-- 评论按钮 -->
              <view class="action-btn" @click="collapseCommentInput">
                <image class="action-icon" src="/static/img/message2.png" mode="widthFix"></image>
                <text class="action-count">{{ commentTotal }}</text>
              </view>
            </view>
            
            <view class="comment-submit-btn">
              <tn-button
                shape="round"
                backgroundColor="#5677fc"
                padding="10rpx 30rpx"
                :loading="submitting"
                @click="submitComment"
              >
                <text class="tn-color-white">发布</text>
              </tn-button>
            </view>
          </view>
        </view>
      </view>

      <!-- <view class="cu-bar justify-left bg-white margin-top-sm">
        <view class="action border-title">
          <text class="text-lg text-bold text-blue">图片展示</text>
          <text class="bg-gradual-blue" style="width:3rem"></text>
        </view>
      </view> -->
      <!-- <view style="background-color: #FFFFFF;padding: 0rpx 30rpx 30rpx 30rpx;">

        <image @click="previewImage(index)" v-for="(item, index) in newsData.images" :key="index"
          mode="widthFix" :src="item"></image>

        <view class="text-right text-df text-gray margin-top-sm margin-bottom-sm">
          <text class="text-gray cuIcon-attentionfill text-df" style="margin-right: 6rpx;"></text>
          <text class="text-df margin-right-sm" style="margin-top: 2rpx;">{{newsData.seeNum}}</text>
          <text class="text-gray cuIcon-appreciatefill text-df" style="margin-right: 6rpx;"></text>
          <text class="text-df margin-right-sm" style="margin-top: 2rpx;">{{newsData.likesNum}}</text>
          <text class="text-gray cuIcon-share text-df" style="margin-right: 6rpx;"></text>
          <text class="text-df" style="margin-top: 2rpx;">{{newsData.commentNum}}</text>
        </view>
      </view> -->
    </view>

    <login ref="login"></login>
  </view>
</template>

<script>
import newsApi from "@/common/api/news.js"
import login from "@/components/login/login.vue";
import Topbar from "@/components/topbar/topbar.vue";

export default {
  components: { login, Topbar },
  data() {
    return {
      newsData: [],
      requestStatus: false, // 事件防抖
      newsId: 0,
      comments: [],
      commentPage: 1,
      commentHasMore: false,
      commentLoading: false,
      commentContent: "",
      submitting: false,
      defaultAvatar: "/static/user/avatar.png",
      commentTotal: 0,
      commentInputExpanded: false, // 评论输入框是否展开
      isLiked: false, // 是否已点赞
      lastReportTime: 0, // 上次已上报的播放时间（秒）
      watchChannel: "MICRO", // 默认按微课堂统计，可根据需要调整
    }
  },
  onLoad(option) {
    this.newsId = option.id || 0;
    this.getData(this.newsId);
    this.getComments();
    this.lastReportTime = 0;
  },
  onReachBottom() {
    if (this.commentHasMore && !this.commentLoading) {
      this.getComments(true);
    }
  },
  methods: {
    // 获取数据
    getData(id) {
      newsApi.getNewsDetail(this, {id: id}).then(res => {
        if (res && res.data) {
            let data = res.data
            if (data.contents) {
              data.contents = this.utils.formatRichText(data.contents)
            }
            this.newsData = data
            // TODO: 检查用户是否已点赞（需要后端接口支持）
            // 根据内容所属栏目自动设置统计channel（如果后端返回了channel）
            if (data.channel) {
              this.watchChannel = data.channel;
            }
        }
      })
    },
    // 处理视频播放进度，按增量上报观看时长
    handleTimeUpdate(e) {
      if (!this.newsId || !uni.getStorageSync("token")) return;
      const currentTime = e.detail.currentTime || 0;
      // 每至少多看3秒再上报一次，避免频繁请求
      const delta = Math.floor(currentTime - this.lastReportTime);
      if (delta >= 3) {
        this.lastReportTime = currentTime;
        newsApi.reportWatchTime(this, {
          news_id: this.newsId,
          duration_delta: delta,
          channel: this.watchChannel || "MICRO",
        }).catch(() => {});
      }
    },
    // 视频结束时，确保最后一段时间被统计
    handleVideoEnded(e) {
      this.handleTimeUpdate(e);
      this.lastReportTime = 0;
    },
    // 暂停时也补一次上报
    handleVideoPaused(e) {
      this.handleTimeUpdate(e);
    },
    // 展开评论输入框
    expandCommentInput() {
      this.commentInputExpanded = true;
    },
    // 收起评论输入框
    collapseCommentInput() {
      if (!this.commentContent || !this.commentContent.trim()) {
        this.commentInputExpanded = false;
      }
    },
    // 输入框获得焦点
    onCommentFocus() {
      this.commentInputExpanded = true;
    },
    // 输入框失去焦点
    onCommentBlur() {
      // 延迟执行，让点击发布按钮等操作先完成
      setTimeout(() => {
        if (!this.commentContent || !this.commentContent.trim()) {
          this.commentInputExpanded = false;
        }
      }, 300);
    },
    // 点击容器其他地方
    handleContainerTap() {
      // 如果输入框已展开且没有内容，则收起
      if (this.commentInputExpanded && (!this.commentContent || !this.commentContent.trim())) {
        this.commentInputExpanded = false;
        // 收起键盘
        uni.hideKeyboard();
      }
    },
    // 切换点赞
    toggleLike() {
      if (!uni.getStorageSync("token")) {
        uni.showToast({title: "请先登录", icon: "none"});
        return;
      }
      if (this.isLiked) {
        // 取消点赞
        newsApi.unlikeNews(this, {news_id: this.newsId}).then(res => {
          if (res && res.code == 1) {
            this.isLiked = false;
            this.newsData.like_count = Math.max(0, (this.newsData.like_count || 0) - 1);
          }
        });
      } else {
        // 点赞
        newsApi.likeNews(this, {news_id: this.newsId}).then(res => {
          if (res && res.code == 1) {
            this.isLiked = true;
            this.newsData.like_count = (this.newsData.like_count || 0) + 1;
          }
        });
      }
    },
    // 获取评论列表
    getComments(loadMore = false) {
      if (!this.newsId) {
        return;
      }
      if (loadMore) {
        if (!this.commentHasMore) return;
        this.commentPage += 1;
      } else {
        this.commentPage = 1;
      }

      this.commentLoading = true;
      newsApi.getNewsComments(this, {news_id: this.newsId, page: this.commentPage}).then(res => {
        if (res && res.data && res.data.list) {
          const list = res.data.list.data || [];
          this.comments = loadMore ? this.comments.concat(list) : list;
          this.commentTotal = res.data.total || 0;
          this.commentHasMore = res.data.list.has_more;
          this.commentPage = res.data.list.current_page;
        }
      }).finally(() => {
        this.commentLoading = false;
      })
    },
    // 发布评论
    submitComment() {
      if (!this.newsId) {
        return;
      }
      if (!uni.getStorageSync("token")) {
        uni.showToast({title: "请先登录后评论", icon: "none"});
        setTimeout(() => {
          this.utils.goto("/pages/user/login-reg");
        }, 300);
        return;
      }
      if (!this.commentContent || !this.commentContent.trim()) {
        uni.showToast({title: "评论内容不能为空", icon: "none"});
        return;
      }
      if (this.submitting) {
        return;
      }

      this.submitting = true;
      newsApi.addNewsComment(this, {
        news_id: this.newsId,
        content: this.commentContent.trim()
      }).then(res => {
        if (res && res.code == 1) {
          uni.showToast({title: "评论成功", icon: "success"});
          this.commentContent = "";
          this.commentInputExpanded = false;
          this.commentTotal += 1;
          this.newsData.comment_count = (this.newsData.comment_count || 0) + 1;
          this.getComments();
          // 收起键盘
          uni.hideKeyboard();
        }
      }).finally(() => {
        this.submitting = false;
      });
    },
    handleBack() {
      uni.navigateBack({
        delta: 1,
      });
    },
    handleGo() {
      if (this.newsData && this.newsData.front_info) {
        this.utils.goto(this.newsData.front_info.full_url)
      }
    },
    previewImage(index) {
      // 预览功能需要数组格式，具体查看uniapp文档：previewImage
      let seeImgList = [];
      if (this.newsData.images && Array.isArray(this.newsData.images)) {
        seeImgList = this.newsData.images;
      } else if (this.newsData.cover_image) {
        seeImgList = [this.newsData.cover_image];
      }
      if (seeImgList.length > 0) {
      uni.previewImage({
        current: index, //预览图片的下标
        urls: seeImgList //预览图片的地址，必须要数组形式，如果不是数组形式就转换成数组形式就可以
        });
      }
    },

  },
}
</script>

<style lang="scss" scoped>
button::after {
  border: none;
  background: transparent;
}

uni-button {
  background: transparent;
}

.container {
  background-color: #fff;
  width: 750rpx;
  min-height: 100vh;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.solid {
  border-radius: 50rpx;
  text-indent: 12rpx;
}

image {
  width: 750rpx;
}

.bottomBox {
  width: 750rpx;
  position: fixed;
  left: 0;
  bottom: 0rpx;
}

.comment-card {
  margin: 0;
  padding: 30rpx;
  background: #ffffff;
  padding-bottom: 160rpx;
}

.comment-header {
  margin-bottom: 30rpx;
}

.comment-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.comment-form {
  margin-bottom: 24rpx;
}

.comment-textarea {
  width: 100%;
  min-height: 150rpx;
  padding: 16rpx;
  background: #f7f8fa;
  border-radius: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.comment-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
}

.comment-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e5e5e5;
  
  &:last-child {
    border-bottom: none;
  }
}

.comment-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.comment-body {
  flex: 1;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.comment-name {
  font-size: 28rpx;
  color: #1d2541;
  font-weight: 500;
}

.comment-time {
  font-size: 24rpx;
  color: #9b9b9b;
}

.comment-content {
  font-size: 28rpx;
  color: #3a3a3a;
  line-height: 1.6;
}

.comment-empty {
  padding: 20rpx 0;
}

.comment-loadmore {
  padding-top: 12rpx;
  display: flex;
  justify-content: center;
}

.video-wrapper {
  width: 100%;
  margin-bottom: 20rpx;
}

.video-player {
  width: 100%;
  height: 400rpx;
  border-radius: 10rpx;
}

.cover-image-wrapper {
  width: 100%;
  margin: 20rpx 0;
  padding: 0 40rpx;
}

.cover-image-rounded {
  width: 100%;
  display: block;
  border-radius: 16rpx;
  overflow: hidden;
}

.comment-action-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e5e5e5;
  display: flex;
  align-items: center;
  z-index: 100;
  box-sizing: border-box;
  
  &.expanded {
    flex-direction: column;
    align-items: stretch;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    
    .comment-input-wrapper {
      width: 100%;
      margin-right: 0;
      margin-bottom: 16rpx;
    }
  }
}

.expanded-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.comment-input-wrapper {
  flex: 1;
  margin-right: 20rpx;
  position: relative;
  
  &.expanded {
    .comment-textarea-expanded {
      min-height: 120rpx;
      padding: 16rpx;
      background: #f7f8fa;
      border-radius: 16rpx;
      font-size: 28rpx;
      box-sizing: border-box;
      width: 100%;
    }
  }
}

.comment-input-placeholder {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 24rpx;
  background: #f7f8fa;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
}

.placeholder-text {
  font-size: 26rpx;
  color: #999;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60rpx;
}

.action-icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 8rpx;
  transition: all 0.3s;
  
  &.liked {
    filter: brightness(0) saturate(100%) invert(27%) sepia(100%) saturate(5000%) hue-rotate(348deg) brightness(100%) contrast(100%);
    transform: scale(1.08);
  }
}

.action-count {
  font-size: 22rpx;
  color: #666;
  line-height: 1;
}

.view-icon {
  width: 26rpx;
  height: 26rpx;
  margin-right: 8rpx;
  vertical-align: middle;
}
</style>
