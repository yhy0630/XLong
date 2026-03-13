<template>
  <view class="challenge-page">
    <!-- 顶部导航 -->
    <view class="challenge-header">
      <view class="header-left" @click="goBack">
        <image class="back-icon" src="/static/img/left.png" mode="aspectFit"></image>
      </view>
      <view class="header-title">闯关练习</view>
      <view class="header-right"></view>
    </view>

    <!-- 倒计时 -->
    <view class="timer-section">
      <text class="timer-text">{{ formatTimer(remainingTime) }}</text>
    </view>

    <!-- 题目信息 -->
    <view class="question-info">
      <view class="question-type">{{ currentQuestion.kind_text }}</view>
      <view class="question-number">{{ currentIndex + 1 }}/{{ totalQuestions }}</view>
    </view>

    <!-- 题目内容 -->
    <view class="question-content">
      <view class="question-title" v-html="currentQuestion.title"></view>
      
      <!-- 选项 -->
      <view class="options-list" v-if="currentQuestion.kind === 'JUDGE' || currentQuestion.kind === 'SINGLE' || currentQuestion.kind === 'MULTI'">
        <view 
          class="option-item"
          v-for="(option, index) in currentQuestion.options"
          :key="index"
          :class="{ 'selected': isOptionSelected(option.key), 'correct': showAnswer && option.key === currentQuestion.answer }"
          @click="selectOption(option.key)"
        >
          <view class="option-label">{{ option.key }}</view>
          <view class="option-content" v-html="option.value"></view>
          <view class="option-check" v-if="isOptionSelected(option.key)">
            <text class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-item" @click="showQuestionList">
        <text class="bar-icon">☰</text>
        <text class="bar-text">{{ currentIndex + 1 }}/{{ totalQuestions }}</text>
      </view>
      <view class="bar-item" @click="prevQuestion" :class="{ 'disabled': currentIndex === 0 }">
        <text class="bar-icon">‹</text>
        <text class="bar-text">上一题</text>
      </view>
      <view class="bar-item" @click="nextQuestion" :class="{ 'disabled': currentIndex === totalQuestions - 1 }">
        <text class="bar-text">下一题</text>
        <text class="bar-icon">›</text>
      </view>
      <view class="bar-item submit-btn" @click="submitExam">
        <text class="bar-icon">📄</text>
        <text class="bar-text">交卷</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      challengeId: 0,
      cateId: 0,
      level: 0,
      perLevel: 5,
      challengeInfo: {},
      questionList: [],
      currentIndex: 0,
      answers: {},
      remainingTime: 0,
      timer: null,
      showAnswer: false
    };
  },
  computed: {
    currentQuestion() {
      if (this.questionList.length === 0) return {};
      const question = this.questionList[this.currentIndex];
      // 解析选项：接口可能返回对象 {"A":"...","B":"..."} 或已是数组 [{key,value}]，统一为 [{key, value}]
      if (question.options_json) {
        try {
          const parsed = typeof question.options_json === 'string'
            ? JSON.parse(question.options_json)
            : question.options_json;
          if (Array.isArray(parsed)) {
            question.options = parsed;
          } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            question.options = Object.keys(parsed).map(k => ({ key: k, value: parsed[k] }));
          } else {
            question.options = [];
          }
        } catch (e) {
          question.options = [];
        }
      } else {
        question.options = question.options || [];
      }
      return question;
    },
    totalQuestions() {
      return this.questionList.length;
    }
  },
  onLoad(options) {
    if (options.id) {
      this.challengeId = parseInt(options.id);
      this.cateId = parseInt(options.cate_id, 10) || 0;
      this.level = parseInt(options.level, 10) || 0;
      this.perLevel = parseInt(options.per_level, 10) || 5;
      this.loadChallengeData();
    }
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    // 加载闯关数据（支持按关卡拉取题目）
    loadChallengeData() {
      uni.showLoading({ title: '加载中...' });
      const params = { id: this.challengeId };
      if (this.level >= 1) {
        params.level = this.level;
        params.per_level = this.perLevel;
      }
      this.http('challenge/practiceDetail', params, 'get').then(res => {
        uni.hideLoading();
        if (res.code == 1 && res.data) {
          this.challengeInfo = res.data.challenge;
          this.questionList = res.data.questions || [];
          this.remainingTime = this.challengeInfo.time_limit || 3600;
          
          // 初始化答案对象
          this.questionList.forEach(q => {
            this.answers[q.id] = '';
          });
          
          // 开始倒计时
          this.startTimer();
        } else {
          uni.showToast({
            title: res.msg || '加载失败',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      }).catch(() => {
        uni.hideLoading();
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      });
    },
    
    // 开始倒计时
    startTimer() {
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          // 时间到，自动交卷
          clearInterval(this.timer);
          this.submitExam();
        }
      }, 1000);
    },
    
    // 格式化倒计时
    formatTimer(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 选择选项
    selectOption(optionKey) {
      const question = this.currentQuestion;
      if (question.kind === 'MULTI') {
        // 多选题
        const currentAnswer = this.answers[question.id] || '';
        const answers = currentAnswer ? currentAnswer.split(',') : [];
        const index = answers.indexOf(optionKey);
        if (index > -1) {
          answers.splice(index, 1);
        } else {
          answers.push(optionKey);
        }
        this.answers[question.id] = answers.sort().join(',');
      } else {
        // 单选题或判断题
        this.answers[question.id] = optionKey;
      }
      this.$forceUpdate();
    },
    
    // 判断选项是否被选中
    isOptionSelected(optionKey) {
      const question = this.currentQuestion;
      const answer = this.answers[question.id] || '';
      if (question.kind === 'MULTI') {
        return answer.split(',').includes(optionKey);
      } else {
        return answer === optionKey;
      }
    },
    
    // 上一题
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    
    // 下一题
    nextQuestion() {
      if (this.currentIndex < this.totalQuestions - 1) {
        this.currentIndex++;
      }
    },
    
    // 显示题目列表
    showQuestionList() {
      // TODO: 实现题目列表弹窗
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    
    // 交卷
    submitExam() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      
      uni.showModal({
        title: '确认交卷',
        content: '确定要交卷吗？',
        success: (res) => {
          if (res.confirm) {
            this.doSubmit();
          }
        }
      });
    },
    
    // 执行交卷
    doSubmit() {
      uni.showLoading({ title: '提交中...' });
      const payload = {
        challenge_id: this.challengeId,
        answers: this.answers,
        time_used: this.challengeInfo.time_limit - this.remainingTime
      };
      if (this.level >= 1) {
        payload.level = this.level;
        payload.per_level = this.perLevel;
      }
      this.http('challenge/practiceSubmit', payload, 'post').then(res => {
        uni.hideLoading();
        if (res.code == 1) {
          if (this.level >= 1) {
            try {
              const key = 'challenge_progress_' + this.challengeId;
              const raw = uni.getStorageSync(key);
              const obj = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
              const max = Math.max(obj.maxLevel || 0, this.level);
              uni.setStorageSync(key, JSON.stringify({ maxLevel: max }));
            } catch (e) {}
            const backUrl = this.cateId
              ? `/pages/training/challenge-levels?cate_id=${this.cateId}`
              : `/pages/training/challenge-levels?id=${this.challengeId}`;
            uni.redirectTo({ url: backUrl });
          } else if (this.cateId) {
            try {
              uni.setStorageSync('challenge_progress_' + this.challengeId, JSON.stringify({ maxLevel: 1 }));
            } catch (e) {}
            uni.redirectTo({
              url: `/pages/training/challenge-levels?cate_id=${this.cateId}`
            });
          } else {
            uni.redirectTo({
              url: `/pages/training/challenge-result?id=${this.challengeId}&score=${res.data.score || 0}&correct=${res.data.correct_count || 0}&total=${res.data.total_count || 0}`
            });
          }
        } else {
          uni.showToast({
            title: res.msg || '提交失败',
            icon: 'none'
          });
        }
      }).catch(() => {
        uni.hideLoading();
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        });
      });
    },
    
    // 返回
    goBack() {
      uni.showModal({
        title: '提示',
        content: '确定要退出吗？退出后答题进度将丢失',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack();
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f5f5;
}

.challenge-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.challenge-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: linear-gradient(135deg, #5677fc 0%, #4c6ef5 100%);
  color: #fff;
  
  .header-left {
    width: 60rpx;
    
    .back-icon {
      width: 40rpx;
      height: 40rpx;
    }
  }
  
  .header-title {
    font-size: 36rpx;
    font-weight: 600;
  }
  
  .header-right {
    width: 60rpx;
  }
}

.timer-section {
  padding: 20rpx 30rpx;
  background-color: #fff;
  text-align: center;
  
  .timer-text {
    font-size: 48rpx;
    font-weight: 600;
    color: #5677fc;
    font-family: 'Courier New', monospace;
  }
}

.question-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  margin-top: 2rpx;
  
  .question-type {
    padding: 8rpx 20rpx;
    background-color: #5677fc;
    color: #fff;
    border-radius: 8rpx;
    font-size: 24rpx;
  }
  
  .question-number {
    font-size: 28rpx;
    color: #666;
  }
}

.question-content {
  background-color: #fff;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  
  .question-title {
    font-size: 32rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 30rpx;
  }
  
  .options-list {
    .option-item {
      display: flex;
      align-items: flex-start;
      padding: 24rpx;
      margin-bottom: 20rpx;
      background-color: #f8f8f8;
      border-radius: 12rpx;
      border: 2rpx solid transparent;
      position: relative;
      
      &.selected {
        background-color: #e8f4ff;
        border-color: #5677fc;
      }
      
      &.correct {
        background-color: #e8f5e9;
        border-color: #4caf50;
      }
      
      .option-label {
        width: 60rpx;
        height: 60rpx;
        line-height: 60rpx;
        text-align: center;
        background-color: #fff;
        border-radius: 50%;
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-right: 20rpx;
        flex-shrink: 0;
      }
      
      .option-content {
        flex: 1;
        font-size: 30rpx;
        color: #333;
        line-height: 1.6;
      }
      
      .option-check {
        width: 40rpx;
        height: 40rpx;
        line-height: 40rpx;
        text-align: center;
        background-color: #5677fc;
        border-radius: 50%;
        margin-left: 20rpx;
        flex-shrink: 0;
        
        .check-icon {
          color: #fff;
          font-size: 24rpx;
          font-weight: bold;
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  
  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 24rpx;
    color: #666;
    
    &.disabled {
      opacity: 0.5;
    }
    
    .bar-icon {
      font-size: 40rpx;
      margin-bottom: 8rpx;
    }
    
    .bar-text {
      font-size: 24rpx;
    }
    
    &.submit-btn {
      .bar-icon {
        color: #5677fc;
      }
      .bar-text {
        color: #5677fc;
        font-weight: 600;
      }
    }
  }
}
</style>

