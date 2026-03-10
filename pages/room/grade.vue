<template>
	<view class="grade-page">
		<topbar title="考场成绩"></topbar>
		<!-- <view class="solids-bottom padding-xs flex align-center">
			<view class="flex-sub text-left">
				<view class="solid-bottom text-sm padding">
					<text class="text-grey">* 可点击记录进行其他操作</text>
				</view>
			</view>
		</view> -->
		
		<view class="grade-list">
			<view class="grade-card" v-for="(item, index) in list" :key="index" @click="clickGrade(item)">
				<view class="result-item">
					<view class="result-left">
						<view class="result-title">{{ item.paper ? item.paper.title : '-' }}</view>
						<view class="result-time">考试时间：{{item.createtime|format_date}}</view>
					</view>
					<view class="result-right">
						<image class="result-stamp" :src="item.is_pass ? passStamp : failStamp" mode="aspectFit"></image>
						<view class="result-score">{{ item.score }}</view>
					</view>
				</view>
				
			</view>
			
			<!-- 加载状态条 -->
			<view class="cu-load bg-grey" :class="loadFlag" v-show="has_more || loadFlag == 'over'"></view>
		</view>
		
		<tui-loading v-if="showLoading"></tui-loading>
		<tui-no-data imgUrl="/static/img/img_noorder_3x.png" v-if="showNodata">暂无数据</tui-no-data>
		
		<login ref="login" v-on:succ="getList"></login>
		
		<!-- 操作菜单 -->
		<tn-action-sheet
		  v-model="showAction"
		  :tips="tipsAction"
		  :list="listAction"
		  :borderRadius="23"
		  :cancelBtn="true"
		  :maskCloseable="true"
		  @click="clickActionSheetItem"
		  @close="closedActionSheet"
		>
		</tn-action-sheet>
		
		<tabbar></tabbar>
	</view>
</template>

<script>
	import topbar from "@/components/topbar/topbar.vue"
	export default {
		components: {
			topbar
		},
		data() {
			return {
				showLoading: false,
				showNodata: true,
				keyword: '',
				list: [],
				loadFlag: 'loading',
				current_page: 1,
				has_more: false,
				gradeItem: null,
				// sheet action
				showAction: false,
				tipsAction: {
					text: '',
					color: '',
					fontSize: 26,
				},
				listAction: [],
				passStamp: '',
				failStamp: '',
			}
		},
		onLoad(e) {
			// 通过/未通过 章图片
			this.passStamp = '/pages/room/static/images/yitongguo 1.png'
			this.failStamp = '/pages/room/static/images/weitongguo 1.png'
			this.getList()
		},
		async onReachBottom() {
			console.log("onReachBottom")
			if (this.has_more) {
				this.current_page++
				this.getList()
			}
		},
		methods: {
			// 获取记录
			getList() {
				this.loadFlag = 'loading'
				this.has_more = true
				this.http('room_grade/index', {page:this.current_page}, 'post').then(res => {
					console.log('grade res', res)
					if (res.code == 0) {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						return
					} else {
						this.list = this.list.concat(res.data.list.data)
						
						this.current_page = res.data.list.current_page
						this.has_more = res.data.list.has_more
						this.loadFlag = !this.has_more ? 'over' : ''
						this.showNodata = !this.list.length
					}
				})
			},
			// 查看排行榜
			showRank(paper_id, room_id) {
				console.log('paper_id', paper_id)
				this.utils.goto('rank?paper_id=' + paper_id + '&room_id=' + room_id)
			},
			
			// 点击成绩
			clickGrade(item) {
				console.log('grade item', item)
				this.gradeItem = item
				this.tipsAction = { text: item.paper?.title || '', color: '', fontSize: 26 }
				
				let listAction = [
					{text: '查看排行榜'}
				]
				if (item.error_ids) {
					listAction.unshift({text: '查看错题'})
				}
				
				this.listAction = listAction
				this.showAction = true
			},
			
			// 点击菜单选项
			clickActionSheetItem(index) {
				let item = this.listAction[index]
				switch (item.text) {
					case '查看排行榜':
						this.showRank(this.gradeItem.paper_id, this.gradeItem.room_id)
						break
						
					case '查看错题':
						this.utils.goto('/pages/wrong/index?question_ids=' + this.gradeItem.error_ids)
						break
				}
				this.closedActionSheet()
			},
			// 关闭actionSheet
			closedActionSheet() {
			  this.showAction = false
			}
		}
	}
</script>

<style>
	.grade-page {
		/* 为固定 topbar 预留空间，避免内容被遮挡（statusBar + 88rpx ≈ 180rpx） */
		padding-top: 180rpx;
	}

	.grade-list {
		padding-bottom: 20rpx;
	}
	
	.grade-card {
		margin: 20rpx 0;
	}

	.result-item {
		background: #fff;
		border-radius: 16rpx;
		margin: 0 20rpx;
		padding: 10rpx 24rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
	}

	.result-left {
		flex: 1;
		padding-right: 20rpx;
	}

	.result-title {
		font-size: 40rpx;
		font-weight: 600;
		color: #222;
		line-height: 1.4;
	}

	.result-time {
		margin-top: 12rpx;
		font-size: 26rpx;
		color: #5f5f5f;
	}

	.result-right {
		width: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.result-score {
		font-size: 50rpx;
		font-weight: 500;
		color: #F54447;
		line-height: 1;
	}

	.score-unit {
		font-size: 24rpx;
		font-weight: 500;
		margin-left: 6rpx;
		color: #111;
	}

	.result-stamp {
		margin-top: 10rpx;
		width: 130rpx;
		height: 130rpx;
	}

	.result-label {
		margin-top: 6rpx;
		font-size: 24rpx;
		color: #333;
	}
	
	.options {
		margin: 20rpx 0;
		line-height: 50rpx;
	}
	
	/* .grade-content 预留，暂不需要样式 */
</style>
