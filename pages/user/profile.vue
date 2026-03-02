<template>
  <view class="profile-page">
    <!-- #ifdef H5 -->
    <tn-nav-bar fixed :bottomShadow="false" backTitle=" ">
      <view class="">
        <text class="tn-text-lg">我的档案</text>
      </view>
    </tn-nav-bar>
    <!-- #endif -->

    <view class="profile-content">
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">
          <view class="title-bar"></view>
          <text class="title-text">基本信息</text>
        </view>
        
        <view class="form-list">
          <view class="form-item" @click="selectUnit">
            <text class="item-label">所属单位<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.unit ? 'value-text' : 'placeholder-text'">{{ formData.unit || '请选择' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="form-item" @click="selectMajor">
            <text class="item-label">专业<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.major ? 'value-text' : 'placeholder-text'">{{ formData.major || '请选择' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="form-item" @click="inputName">
            <text class="item-label">姓名<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.name ? 'value-text' : 'placeholder-text'">{{ formData.name || '请输入' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="form-item" @click="inputMobile">
            <text class="item-label">手机号<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.mobile ? 'value-text' : 'placeholder-text'">{{ formData.mobile || '请输入' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="form-item" @click="inputIdCard">
            <text class="item-label">身份证号<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.id_card ? 'value-text' : 'placeholder-text'">{{ formData.id_card || '请输入' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="form-item" @click="inputSignature">
            <text class="item-label">签名<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.signature ? 'value-text' : 'placeholder-text'">{{ formData.signature || '请输入' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
          
          <view class="form-item" @click="recordFace">
            <text class="item-label">人脸信息<text class="required">*</text></text>
            <view class="item-value">
              <text :class="formData.face_info ? 'value-text' : 'placeholder-text'">{{ formData.face_info ? '已录入' : '请录入' }}</text>
              <image class="item-arrow" src="/static/img/right.png" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 我的培训 -->
      <view class="section">
        <view class="section-title">
          <view class="title-bar"></view>
          <text class="title-text">我的培训</text>
        </view>
        
        <view class="form-list">
          <view class="form-item display-item">
            <text class="item-label">培训拍照<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">培训时长<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">考试拍照<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">考试成绩<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">得分情况<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">积分情况<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">课件<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
          
          <view class="form-item display-item">
            <text class="item-label">SAP<text class="required">*</text></text>
            <view class="item-value">
              <text class="placeholder-text">展示信息</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button class="submit-btn" @click="submitForm">提交</button>
      </view>
    </view>
  </view>
</template>

<script>
import userApi from "@/common/api/user.js";

export default {
  data() {
    return {
      formData: {
        unit: '',
        major: '',
        name: '',
        mobile: '',
        id_card: '',
        signature: '',
        face_info: '',
        training_type: '' // 自管或委外
      },
      userInfo: null
    };
  },
  onLoad(options) {
    // 获取培训类型（自管或委外）
    if (options.type) {
      // 将页面类型映射为数据库存储的类型
      if (options.type === 'self-managed') {
        this.formData.training_type = 'self-managed';
      } else if (options.type === 'outsourced') {
        this.formData.training_type = 'outsourced';
      } else {
        this.formData.training_type = options.type;
      }
    }
    
    // 获取用户信息
    this.userInfo = uni.getStorageSync('user');
    
    // 加载已有数据
    this.loadProfileData();
  },
  methods: {
    // 加载已有数据
    loadProfileData() {
      userApi.getProfile(this).then(res => {
        if (res.code == 1 && res.data) {
          this.formData = { ...this.formData, ...res.data };
        }
      });
    },
    
    // 选择所属单位
    selectUnit() {
      // TODO: 实现单位选择
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    // 选择专业
    selectMajor() {
      // TODO: 实现专业选择
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    // 输入姓名
    inputName() {
      uni.showModal({
        title: '请输入姓名',
        editable: true,
        placeholderText: '请输入姓名',
        success: (res) => {
          if (res.confirm && res.content) {
            this.formData.name = res.content;
          }
        }
      });
    },
    
    // 输入手机号
    inputMobile() {
      uni.showModal({
        title: '请输入手机号',
        editable: true,
        placeholderText: '请输入手机号',
        success: (res) => {
          if (res.confirm && res.content) {
            this.formData.mobile = res.content;
          }
        }
      });
    },
    
    // 输入身份证号
    inputIdCard() {
      uni.showModal({
        title: '请输入身份证号',
        editable: true,
        placeholderText: '请输入身份证号',
        success: (res) => {
          if (res.confirm && res.content) {
            this.formData.id_card = res.content;
          }
        }
      });
    },
    
    // 输入签名
    inputSignature() {
      uni.showModal({
        title: '请输入签名',
        editable: true,
        placeholderText: '请输入签名',
        success: (res) => {
          if (res.confirm && res.content) {
            this.formData.signature = res.content;
          }
        }
      });
    },
    
    // 录入人脸信息
    recordFace() {
      // TODO: 实现人脸识别
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    // 提交表单
    submitForm() {
      // 验证必填项
      if (!this.formData.unit) {
        uni.showToast({ title: '请选择所属单位', icon: 'none' });
        return;
      }
      if (!this.formData.major) {
        uni.showToast({ title: '请选择专业', icon: 'none' });
        return;
      }
      if (!this.formData.name) {
        uni.showToast({ title: '请输入姓名', icon: 'none' });
        return;
      }
      if (!this.formData.mobile) {
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
      if (!this.formData.id_card) {
        uni.showToast({ title: '请输入身份证号', icon: 'none' });
        return;
      }
      if (!this.formData.signature) {
        uni.showToast({ title: '请输入签名', icon: 'none' });
        return;
      }
      if (!this.formData.face_info) {
        uni.showToast({ title: '请录入人脸信息', icon: 'none' });
        return;
      }
      if (!this.formData.training_type) {
        uni.showToast({ title: '缺少培训类型', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: '提交中...' });
      
      userApi.saveProfile(this, this.formData).then(res => {
        uni.hideLoading();
        if (res.code == 1) {
          uni.showToast({
            title: '提交成功',
            icon: 'success'
          });
          
          // 延迟返回
          setTimeout(() => {
            const type = this.formData.training_type;
            if (type === 'self-managed' || type === '自管人员考培') {
              uni.redirectTo({
                url: '/pages/training/self-managed'
              });
            } else if (type === 'outsourced' || type === '委外人员考培') {
              uni.redirectTo({
                url: '/pages/training/outsourced'
              });
            } else {
              uni.navigateBack();
            }
          }, 1500);
        } else {
          uni.showToast({
            title: res.msg || '提交失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.hideLoading();
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.profile-content {
  padding: 20rpx 30rpx;
}

.section {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  
  .section-title {
    display: flex;
    align-items: center;
    padding: 30rpx 30rpx 20rpx;
    
    .title-bar {
      width: 6rpx;
      height: 32rpx;
      background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
      margin-right: 16rpx;
      border-radius: 3rpx;
    }
    
    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
}

.form-list {
  .form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.display-item {
      opacity: 0.6;
    }
    
    .item-label {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
      
      .required {
        color: #ff4d4f;
        margin-left: 4rpx;
      }
    }
    
    .item-value {
      display: flex;
      align-items: center;
      
      .value-text {
        font-size: 30rpx;
        color: #333;
        margin-right: 16rpx;
      }
      
      .placeholder-text {
        font-size: 30rpx;
        color: #999;
        margin-right: 16rpx;
      }
      
      .item-arrow {
        width: 24rpx;
        height: 24rpx;
        opacity: 0.4;
      }
    }
  }
}

.submit-section {
  padding: 40rpx 0;
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
    border-radius: 44rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style>

