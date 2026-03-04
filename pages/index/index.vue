<template>
  <view class="page-container">
    <!-- 自定义顶部导航栏 -->
    <topbar title="肃分安全培训" :showBack="false" />
    <!-- 骨架屏 -->
    <kz-skeleton
      v-if="showSkeleton"
      :showSkeleton="showSkeleton"
      backgroundColor="#fafafa"
      borderRadius="10rpx"
    ></kz-skeleton>

    <view v-if="!showSkeleton" class="main-content">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input">
          <image class="search-icon" src="/static/img/MagnifyingGlass.png" mode="aspectFit"></image>
          <input 
            type="text" 
            placeholder="搜索关键字" 
            @input="inputSearch"
            @confirm="search()"
            confirm-type="search"
          />
        </view> 
      </view>

      <!-- 轮播图 -->
      <view class="banner-section" v-if="banners.length > 0">
        <swiper 
          class="banner-swiper" 
          indicator-dots 
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
          autoplay 
          circular
          interval="3000"
        >
          <swiper-item v-for="(banner, index) in banners" :key="index" @click="clickBanner(banner)">
            <image class="banner-image" :src="banner.image" mode="aspectFill"></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- 通知公告 -->
      <view class="notice-section" v-if="notices.length > 0">
        <view class="notice-label">
          <image class="notice-bg-img" src="/static/img/tongzhi.png" mode="aspectFit"></image>
          <view class="label-text-wrapper">
            <text class="label-line1">通知</text>
            <text class="label-line2">公告</text>
          </view>
        </view>
        <view class="notice-content">
          <swiper vertical autoplay circular interval="3000" class="notice-swiper">
            <swiper-item
              v-for="(notice, index) in notices"
              :key="index"
              @click="clickNotice(notice.id)"
            >
              <view class="notice-item">
                <text class="notice-prefix">•</text>
                <text class="notice-text">{{ notice.name }}</text>
              </view>
            </swiper-item>
          </swiper>
          <text class="notice-more" @click="goNoticeList()">更多 ❯</text>
        </view>
      </view>

      <!-- 考培栏目 -->
      <view class="training-section">
        <view 
          class="training-item"
          v-for="(item, index) in trainingList"
          :key="index"
          @click="goTrainingPage(item.path)"
        >
          <view class="training-icon-wrapper">
            <image v-if="item.icon" class="training-icon" :src="item.icon" mode="aspectFit"></image>
          </view>
          <text class="training-name">{{ item.name }}</text>
        </view>
      </view>

      <!-- 功能按钮 -->
      <!-- <view class="function-buttons">
        <view 
          class="function-item"
          v-for="(item, index) in functionList"
          :key="index"
          @click="goPage(item.path)"
        >
          <image v-if="item.icon" class="function-icon" :src="item.icon" mode="aspectFit"></image>
          <text class="function-name">{{ item.name }}</text>
        </view>
      </view> -->

      <!-- 标签导航和内容列表容器 -->
      <view class="content-container">
        <!-- 标签导航 -->
        <view class="tab-navigation">
          <view class="tab-list">
          <view 
            class="tab-item"
            :class="{ active: activeTab === index }"
            v-for="(tab, index) in tabs"
            :key="index"
            @click="switchTab(index)"
          >
            <text>{{ tab }}</text>
            <view class="tab-underline" v-if="activeTab === index"></view>
          </view>
          </view>
          <view class="tab-more" @click="goNewsList">更多 ❯</view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 内容列表 -->
        <view class="content-list">
          <!-- 学习动态 -->
          <view 
            class="content-item"
            v-for="(item, index) in displayList"
            :key="index"
            @click="clickContent(item)"
          >
            <view class="item-header">
              <text class="item-title">{{ item.title || item.name }}</text>
              <image 
                v-if="item.cover_image" 
                class="item-image" 
                :src="item.cover_image" 
                mode="aspectFill"
              ></image>
            </view>
            <view class="item-footer">
              <view class="item-stats">
                <view class="stat-item">
                  <image class="stat-icon" src="/static/img/hand.png" mode="aspectFit"></image>
                  <text>{{ item.like_count || 328 }}</text>
                </view>
                <view class="stat-item">
                  <image class="stat-icon" src="/static/img/message.png" mode="aspectFit"></image>
                  <text>{{ item.comment_count || 45 }}</text>
                </view>
                <view class="stat-item">
                  <image class="stat-icon" src="/static/img/eye.png" mode="aspectFit"></image>
                  <text>{{ item.view_count || 1205 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 悬浮组件 -->
    <tui-scroll-top
      :scrollTop="scrollTop"
      :isIndex="false"
      :isHideAd="showAdBtn"
      :isShare="showShareBtn"
      :customShare="false"
      @hideAd="
        () => {
          showAd = !showAd;
        }
      "
      @goNotice="goNoticeList"
    ></tui-scroll-top>

    <!-- 流量主组件 -->
    <!-- #ifdef MP-WEIXIN -->
    <view v-show="showAd">
      <kz-ad
        ref="adIndex"
        kind="BANNER"
        :config="ad"
        field="index_banner"
      ></kz-ad>
      <kz-ad
        ref="adIndex"
        kind="VIDEO"
        :config="ad"
        field="index_video"
      ></kz-ad>
      <kz-ad
        ref="adIndex"
        kind="VIDEO_PATCH"
        :config="ad"
        field="index_video_patch"
      ></kz-ad>
    </view>
    <!-- #endif -->

    <!-- toast提示 -->
    <tui-toast ref="toast"></tui-toast>

    <!-- 登录组件 -->
    <login ref="login"></login>

    <!-- 底部导航栏组件 -->
    <tabbar :theme="tabbarStyle" :tabbar="tabbar"></tabbar>

    <view class="margin-bottom-xl">
      <tn-load-more class="tn-margin-top" status="nomore" dot></tn-load-more>
    </view>
  </view>
</template>

<script>
// import HeadLine from '@/components/headline/headline.vue'
import AddTip from "@/components/struggler-uniapp-add-tip/struggler-uniapp-add-tip.vue";
import Topbar from "@/components/topbar/topbar.vue";
import subjectApi from "@/common/api/subject.js";

var interstitialAd = null;

export default {
  components: {
    // HeadLine,
    AddTip,
    Topbar,
  },
  data() {
    return {
      focusOnTip: "点击「添加小程序」，下次访问更便捷",
      imgUrl: this.imgUrl,
      banners: [],
      slides: [],
      system: null,
      ad: null,
      showAd: true,
      showSkeleton: true,
      headlines: [],
      notices: [],
      scrollTop: 0,
      showAdBtn: false,
      showShareBtn: false,
      hideTop: false,
      pageStyle: "color",
      papers: [],
      rooms: [],
      news: [],
      tabbarStyle: "",
      tabbar: [],
      diyIndexButton: [],
      userInfo: {},
      subjectId: 0,
      subjectName: "请选择科目",
      title: "答题考试系统",
      keyword: "",
      activeTab: 0,
      tabs: ["推荐", "新动态", "微课堂", "学案例", "综合"],
      trainingList: [
        {
          name: "自管人员考培\n(自管 劳务 联运)",
          icon: "/static/img/ziguan.png",
          path: "/pages/training/self-managed",
        },
        {
          name: "承包商人员考培\n(施工单位人员)",
          icon: "/static/img/chengbaoshang.png",
          path: "/pages/training/outsourced",
        },
      ],
      // functionList: [
      //   {
      //     name: "微课堂",
      //     icon: "/static/img/shuo.png",
      //     bgColor: "#FF6B6B",
      //     path: "/pages/index/micro-class",
      //   },
      //   {
      //     name: "新闻动态",
      //     icon: "/static/img/yellow.png",
      //     bgColor: "#9B59B6",
      //     path: "/pages/index/news-list",
      //   },
      //   {
      //     name: "问卷练习",
      //     icon: "/static/img/icon.png",
      //     bgColor: "#3498DB",
      //     path: "/pages/train/index?page=train",
      //   },
      //   {
      //     name: "企业考试",
      //     icon: "/static/img/lu.png",
      //     bgColor: "#9B59B6",
      //     path: "/pages/paper/index",
      //   },
      // ],
    };
  },
  computed: {
    displayList() {
      if (this.activeTab === 0) {
        return [...this.news, ...this.papers, ...this.rooms];
      } else if (this.activeTab === 1) {
        return this.news;
      } else if (this.activeTab === 2) {
        return this.papers;
      } else if (this.activeTab === 3) {
        return this.rooms;
      } else {
        return [...this.news, ...this.papers, ...this.rooms];
      }
    }
  },
  onLoad(e) {
    this.getUserSubject();
    this.getSetting();
    let userInfo = uni.getStorageSync("user");
    this.userInfo = userInfo ? userInfo : {};
    uni.$once("login_success", (data) => {
      let userInfo = uni.getStorageSync("user");
      this.userInfo = userInfo ? userInfo : {};
    });
  },
  onShow() {
    this.getUserSubject();

    // 监听科目选择事件
    uni.$on("event_subject_choose", (e) => {
      console.log("event_subject_choose", e);
      let subject_id = e.subject_id;
      if (subject_id != this.subjectId) {
        this.subjectId = subject_id;
        this.getSetting();
      }
    });
  },
  onPageScroll(e) {
    if (!this.hideTop) {
      this.scrollTop = e.scrollTop;
    }
  },
  methods: {
    clickUserInfo() {
      if (!uni.getStorageSync("token")) {
        this.$refs.login.modal = true;
      }
    },
    getUserSubject() {
      let user_subject = uni.getStorageSync("user_subject");
      if (user_subject && user_subject.subject2 && user_subject.subject2.id) {
        this.subjectId = user_subject.subject2.id;
        this.subjectName = user_subject.subject2.name;
      } else {
        this.subjectId = 0;
        this.subjectName = "请选择科目";
      }
    },

    getSetting() {
      this.http("common/index", { subject_id: this.subjectId }, "get").then(
        (res) => {
          if (!res.code) {
            uni.showToast({
              title: "获取数据失败，请刷新重试",
              icon: "error",
            });
            return;
          }

          // 积分提示
          let point = res.data.point;
          if (point?.get_point) {
            this.$refs.toast.show({
              title: "积分+" + point.get_point,
              content: point.type,
              imgUrl: "/static/toast/info-circle.png",
              icon: true,
              duration: 4000,
            });
          }

          // 公告
          this.notices = res.data.notices;
          // this.headlines = res.data.notice
          // 考卷
          this.papers = res.data.papers;
          // 考场
          this.rooms = res.data.rooms;
          // 学习动态
          this.news = res.data.news;

          // 系统配置数据
          let system = res.data.system;
          if (system) {
            this.system = system;
            uni.setStorageSync("system", system);

            // 轮播图
            if (system.banner) {
              let banners = [];
              for (let bannerImage of system.banner.split(",")) {
                console.log(
                  "bannerImage",
                  bannerImage,
                  bannerImage.indexOf("http")
                );
                if (bannerImage.indexOf("http") < 0) {
                  bannerImage = this.imgUrl + bannerImage;
                }

                banners.push({
                  image: bannerImage,
                });
              }
              this.banners = banners;
              console.log("banners", this.banners);

              // 延迟加载：v-if导致组件未完全渲染
              // setTimeout(() => {
              // 	this.banners = system.banner.split(',')
              // 	console.log('banners', this.banners)
              // }, 200)
            }
          }

          // 轮播图
          this.slides = res.data.slides;
          if (this.slides && this.slides.length > 0) {
            console.log("slides", res.data.slides);
            let slides = [];
            for (let slideImage of res.data.slides) {
              if (slideImage.image.indexOf("http") < 0) {
                slideImage.image = this.imgUrl + slideImage.image;
              }
              slides.push(slideImage);
            }
            this.banners = slides;
          }

          // 页面配置数据
          let page = res.data.page;
          if (page) {
            this.page = page;
            uni.setStorageSync("page", page);

            if (page.index_title) {
              this.title = page.index_title;
            }

            // 页面风格
            this.pageStyle = page.page_index_style
              ? page.page_index_style
              : "color";
            // this.pageStyle = 'color'
            // 底部栏风格
            this.tabbarStyle = page.page_tabbar_style
              ? page.page_tabbar_style
              : "glass";
            // 悬浮按钮
            this.showAdBtn = parseInt(page.page_index_ad_btn) == 1;
            this.showShareBtn = parseInt(page.page_index_share_btn) == 1;
          }

          // #ifdef MP-WEIXIN
          // 流量主数据
          let ad = res.data.ad;
          if (ad) {
            this.ad = ad;
            uni.setStorageSync("ad", ad);

            // 插屏广告
            if (this.ad.index_cp_open == 1) {
              this.adUtils.interstitial.load(this.ad.index_cp);
              this.adUtils.interstitial.show();
            }

            // // 激励广告
            // this.adUtils.rewarded.load('adunit-69d6a49d4c5999c5', () => {
            //       //这里写你的任意奖励事件
            // });
            // this.adUtils.rewarded.show();
          }
          // #endif

          // cdn域名
          if (res.data.cdn_url) {
            uni.setStorageSync("cdn_url", res.data.cdn_url);
          }

          // 自定义tabbar
          if (res.data.tabbar) {
            this.tabbar = res.data.tabbar;
            uni.setStorageSync("tabbar", this.tabbar);
          }

          // 自定义首页
          if (res.data.diy_index_button) {
            this.diyIndexButton = res.data.diy_index_button;
            uni.setStorageSync("diyIndexButton", this.diyIndexButton);
          }

          // 隐藏骨架屏
          this.showSkeleton = false;
          this.$forceUpdate();
        }
      );

      let user_subject = uni.getStorageSync("user_subject");
      if (user_subject && user_subject.subject2 && user_subject.subject2.id) {
        subjectApi
          .getSubjectDetail(this, { subject_id: user_subject.subject2.id })
          .then((res) => {
            console.log("res", res);
            if (res && res.code == 1) {
              let subject = res.data;
              uni.setStorageSync("user_subject", {
                subject1: {
                  id: subject.parent.id,
                  name: subject.parent.name,
                },
                subject2: {
                  id: subject.id,
                  name: subject.name,
                },
              });

              this.subjectName = subject.name;
            } else {
              uni.setStorageSync("user_subject", null);
              this.subjectName = "请选择";
            }
          });
      }
    },

    // 点击悬浮按钮
    clickFabItem(e) {
      console.log("clickFabItem", e);
    },

    // 跳转公告列表
    goNoticeList() {
      this.utils.goto("notice-list");
    },
    // 跳转更多新闻列表
    goNewsList() {
      this.utils.goto("news-list");
    },

    // 点击公告，跳转公告详情
    clickNotice(id) {
      this.utils.goto("notice-detail?id=" + id);
    },

    // 点击科目，跳转科目切换
    clickSubjectChang() {
      this.utils.goto("/pagesSubject/index?type=subject");
    },
    // 搜索输入
    inputSearch(e) {
      this.keyword = e.detail.value;
    },
    // 搜索
    search() {
      if (this.keyword) {
        this.utils.goto("/pages/search/index?keyword=" + this.keyword);
      }
    },
    // 点击轮播图
    clickBanner(banner) {
      if (banner && banner.front_info && banner.front_info.full_url) {
        this.utils.goto(banner.front_info.full_url);
      }
    },
    // 切换标签
    switchTab(index) {
      this.activeTab = index;
    },
    // 跳转页面
    goPage(page) {
      this.utils.goto(page);
    },
    // 跳转考培页面
    goTrainingPage(page) {
      this.utils.goto(page);
    },
    // 点击内容
    clickContent(item) {
      if (item.id) {
        if (item.title) {
          this.utils.goto("/pages/paper/paper?id=" + item.id);
        } else if (item.name) {
          this.utils.goto("/pages/index/news-detail?id=" + item.id);
        }
      }
    },
  },
};
</script>

<style lang="scss">
page {
  background-color: #f7f7f7;
}

.page-container {
  min-height: 100vh;
  background-color: #f7f7f7;
  padding-top: calc(130rpx + var(--status-bar-height));
}

.main-content {
  padding-bottom: 120rpx;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 30rpx;
  background-color: #f7f7f7;
  
  .search-input {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 40rpx;
    padding: 16rpx 30rpx;
    
    .search-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 15rpx;
    }
    
    input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

/* 轮播图 */
.banner-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  
  .banner-swiper {
    width: 100%;
    height: 340rpx;
    border-radius: 16rpx;
    overflow: hidden;
    
    .banner-image {
      width: 100%;
      height: 100%;
    }
  }
}

/* 通知公告 */
.notice-section {
  margin: 20rpx 30rpx;
  background-color: #EBF2FC;
  border-radius: 8rpx;
  padding: 10rpx 24rpx;
  display: flex;
  align-items: center;
  
  .notice-label {
    position: relative;
    margin-right: 20rpx;
    flex-shrink: 0;
    margin-left: -35rpx;
    
    .notice-bg-img {
      width: 100rpx;
      height: 100rpx;
      display: block;
    }
    
    .label-text-wrapper {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      
      .label-line1,
      .label-line2 {
        font-size: 22rpx;
        color: #fff;
        font-weight: bold;
        line-height: 1.3;
      }
    }
  }
  
  .notice-content {
    flex: 1;
    display: flex;
    align-items: center;
    
    .notice-swiper {
      flex: 1;
      height: 50rpx;
      
      .notice-item {
        display: flex;
        align-items: center;
        color: #333;
        font-size: 26rpx;
        
        .notice-prefix {
          margin-right: 10rpx;
          color: #1890ff;
        }
        
        .notice-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    
    .notice-more {
      color: #666;
      font-size: 24rpx;
      margin-left: 20rpx;
      white-space: nowrap;
    }
  }
}

/* 考培栏目 */
.training-section {
  background-color: #fff;
  margin: 20rpx 30rpx;
  padding: 30rpx 20rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-around;
  
  .training-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .training-icon-wrapper {
      width: auto;
      height: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      // margin-bottom: 16rpx;
      
      .training-icon {
        width: 100rpx;
        height: 120rpx;
      }
    }
    
    .training-name {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

/* 功能按钮 */
.function-buttons {
  background-color: #fff;
  margin: 20rpx 30rpx;
  padding: 40rpx 20rpx 20rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-around;
  
  .function-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .function-icon {
      width: 100rpx;
      height: 100rpx;
      margin-bottom: 16rpx;
    }
    
    .function-name {
      font-size: 24rpx;
      color: #333;
    }
  }
}

/* 内容容器 */
.content-container {
  background-color: #fff;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

/* 标签导航 */
.tab-navigation {
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .tab-list {
    display: flex;
  }
  
  .tab-item {
    position: relative;
    padding: 10rpx 20rpx;
    font-size: 28rpx;
    color: #666;
    
    &.active {
      color: #FF4D00;
      font-weight: bold;
      
      .tab-underline {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 6rpx;
        background-color: #FF4D00;
        border-radius: 3rpx;
      }
    }
  }

  .tab-more {
    font-size: 24rpx;
    color: #999;
    flex-shrink: 0;
  }
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 0 30rpx;
}

/* 内容列表 */
.content-list {
  padding: 0 30rpx 20rpx;
  
  .content-item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .item-title {
        flex: 1;
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
        line-height: 1.5;
        margin-right: 20rpx;
      }
      
      .item-image {
        width: 200rpx;
        height: 140rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
      }
    }
    
    .item-footer {
      .item-stats {
        display: flex;
        align-items: center;
        
        .stat-item {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #999;
          margin-right: 40rpx;
          
          .stat-icon {
            width: 28rpx;
            height: 28rpx;
            margin-right: 8rpx;
          }
        }
      }
    }
  }
}
</style>
