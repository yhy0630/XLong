<template>
  <view class="identity-page">
    <topbar title="身份认证"></topbar>

    <view class="content">
      <view class="section-title">
        <view class="section-bar"></view>
        <text>基本信息</text>
      </view>

      <view class="card">
        <view class="row">
          <view class="label">所属单位<text class="req">*</text></view>
          <view class="value value-text">承包商人员</view>
        </view>

        <view class="row row-link" @click="pickJob">
          <view class="label">岗位<text class="req">*</text></view>
          <view class="right">
            <text class="placeholder">{{ form.job || "请选择" }}</text>
            <text class="arrow tn-icon-right"></text>
          </view>
        </view>

        <view class="row row-link" @click="pickMajor">
          <view class="label">专业<text class="req">*</text></view>
          <view class="right">
            <text class="placeholder">{{ form.major || "请选择" }}</text>
            <text class="arrow tn-icon-right"></text>
          </view>
        </view>

        <view class="row">
          <view class="label">姓名<text class="req">*</text></view>
          <input class="input" v-model="form.name" placeholder="请输入" placeholder-style="color:#B0B0B0" />
        </view>

        <view class="row">
          <view class="label">手机号<text class="req">*</text></view>
          <input class="input" v-model="form.mobile" placeholder="请输入" placeholder-style="color:#B0B0B0" />
        </view>

        <view class="row">
          <view class="label">身份证号<text class="req">*</text></view>
          <input class="input" v-model="form.idCard" placeholder="请输入" placeholder-style="color:#B0B0B0" />
        </view>

        <view class="row">
          <view class="label">签名<text class="req">*</text></view>
          <input class="input" v-model="form.signature" placeholder="请输入" placeholder-style="color:#B0B0B0" />
        </view>

        <view class="row row-link" @click="goFaceVerify">
          <view class="label">人脸信息<text class="req">*</text></view>
          <view class="right">
            <text class="placeholder">{{ form.faceVerified ? "已认证" : "待认证" }}</text>
            <text class="arrow tn-icon-right"></text>
          </view>
        </view>
      </view>

      <view class="btn" @click="submit">完成</view>
    </view>
  </view>
</template>

<script>
import topbar from "@/components/topbar/topbar.vue";

export default {
  name: "IdentityContractor",
  components: { topbar },
  data() {
    return {
      form: {
        job: "",
        major: "",
        name: "",
        mobile: "",
        idCard: "",
        signature: "",
        faceVerified: false,
      },
    };
  },
  methods: {
    pickJob() {},
    pickMajor() {},
    goFaceVerify() {},
    submit() {},
  },
};
</script>

<style lang="scss" scoped>
.identity-page {
  min-height: 100vh;
  background: #f3f3f3;
}

.content {
  padding-top: 180rpx;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 36rpx;
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  color: #2a2a2a;
  font-size: 28rpx;
  font-weight: 600;
  margin: 40rpx 0 40rpx;
}

.section-bar {
  width: 6rpx;
  height: 28rpx;
  background: #2d6cff;
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  padding: 30rpx 22rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.row:last-child {
  border-bottom: none;
}

.label {
  width: 200rpx;
  color: #222;
  font-size: 28rpx;
  font-weight: 600;
}

.req {
  color: #ff3b30;
}

.value {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #222;
}

.value-text {
  color: #222;
}

.input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #222;
}

.row-link .right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.placeholder {
  font-size: 28rpx;
  color: #9c9c9c;
}

.arrow {
  margin-left: 10rpx;
  color: #c8c8c8;
  font-size: 30rpx;
}

.btn {
  margin-top: 44rpx;
  height: 92rpx;
  border-radius: 46rpx;
  background: #5677fC;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

