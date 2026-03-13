<template>
	<view class="room-page">
		<!-- 自定义顶部导航栏 -->
		<topbar title="考试" />

		<!-- 顶部自定义导航 -->
		<!-- <tn-nav-bar fixed :bottomShadow="false" backTitle=" ">
			<view class="">
				<text class="tn-text-lg">考场列表</text>
				<text class="tn-text-xl tn-padding-left-sm tn-icon-group-circle"></text>
			</view>
		</tn-nav-bar> -->
		
		<HMfilterDropdown :filterData="filterData" :defaultSelected="filterDropdownValue" @confirm="confirmCate">
		</HMfilterDropdown>

		<view class="paper-contains">
			<!-- 考场列表 -->
			<view class="paper-card" v-for="(item, index) in list" :key="index">
				<tui-card
					:title="{text: item.name, size: 35, color: '#000'}"
					:tag="{text: item.cates ? item.cates.name : '-', size: 24}"
					:status="getRoomStatus(item)"
					class="article-shadow"
					@click="handleRoomClick(item)"
				>
					<template v-slot:body>
						<view class="tui-default">
							<view class="">
								{{item.contents}}
							</view>
						</view>
					</template>
					<template v-slot:footer>

						<view class="tui-default">
							<view class="">
								考试时间：{{item.start_time|format_date}} - {{item.end_time|format_date}}
							</view>

							<text>报名方式：</text>
							<text class="cu-tag" :class="[getSignupModeClass(item)]">{{item.signup_mode_text}}</text>

							<view class="cu-capsule round m-l-30" v-if="item.is_makeup">
								<view class='cu-tag bg-blue '>
									可补考
								</view>
								<view class="cu-tag line-blue">
									{{item.makeup_count}}次
								</view>
							</view>
							<!-- <text class="cu-tag m-l-30" :class="[getMakeupModeClass(item)]">{{item.makeup_mode_text}}</text> -->
						</view>
					</template>
				</tui-card>
			</view>

			<!-- 加载状态条 -->
			<view class="cu-load" :class="loadFlag" v-show="!has_more"></view>
		</view>
		
		<view class="tn-tabbar-height"></view>

		<tabbar></tabbar>

		<!-- 签名弹窗（半屏） -->
		<tn-popup
			v-model="showSignModal"
			mode="bottom"
			length="auto"
			:popup="false"
			:borderRadius="24"
			:maskCloseable="true"
			@close="closeSignModal"
		>
			<view class="sign-sheet">
				<view class="sign-sheet-header">
					<view class="sign-sheet-title">请签本人姓名</view>
					<view class="sign-sheet-close" @click="closeSignModal">×</view>
				</view>
				<view class="sign-board">
					<signature-pad
						ref="sigPad"
						canvasId="sigPadCanvas"
						@change="signHasData = $event"
					></signature-pad>
				</view>
				<view class="sign-actions">
					<view class="sign-clear" @click="clearSign">
						<image class="sign-clear-icon" src="/static/img/eraser-fill 1.png" mode="aspectFit"></image>
					</view>
					<view class="sign-full" @click="openFullscreenSign">横屏签名</view>
				</view>
				<view class="sign-next" @click="confirmSignAndNext">下一步</view>
			</view>
		</tn-popup>

		<!-- 全屏签名层（可旋转手机横屏使用） -->
		<view class="sign-fullscreen" v-if="showSignFullscreen">
			<view class="sign-fullscreen-close" @click="closeFullscreenSign">×</view>
			<view class="sign-fullscreen-body">
				<view class="sign-fullscreen-title">
					<text
						v-for="(ch, idx) in '请签本人姓名'.split('').reverse()"
						:key="'t' + idx"
						class="vchar"
					>{{ ch }}</text>
				</view>
				<view class="sign-fullscreen-board">
					<cover-view class="sign-fullscreen-eraser" @click.stop="$refs.sigFull && $refs.sigFull.clear()">
						<cover-image class="sign-fullscreen-eraser-img" src="/static/img/eraser-fill 1.png"></cover-image>
					</cover-view>
					<signature-pad ref="sigFull" canvasId="sigFullCanvas"></signature-pad>
				</view>
				<view class="sign-fullscreen-next" @click="confirmFullscreenSign">
					<text
						v-for="(ch, idx) in '下一步'.split('').reverse()"
						:key="'n' + idx"
						class="vchar vchar-white"
					>{{ ch }}</text>
				</view>
			</view>
		</view>
		<!-- <scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
			<view class="cu-item" :class="index==tabCur?'text-green cur':''" v-for="(item,index) in 10" :key="index" @tap="tabSelect" :data-id="index">
				Tab{{index}}
			</view>
		</scroll-view> -->
	</view>
</template>

<script>
	import HMfilterDropdown from '@/components/HM-filterDropdown/HM-filterDropdown.vue';
	import Topbar from "@/components/topbar/topbar.vue";
	import SignaturePad from "@/components/signature-pad/signature-pad.vue";
	import TnPopup from "@/tuniao-ui/components/tn-popup/tn-popup.vue";

	export default {
		components: {
			'HMfilterDropdown': HMfilterDropdown,
			Topbar,
			SignaturePad,
			TnPopup,
		},
		data() {
			return {
				// scrollLeft: 0,
				// tabCur: 0,
				filterData: [],
				filterDropdownValue: '',
				cate_id: null,
				sort: null,
				list: [],
				has_more: false,
				current_page: 1,
				loadFlag: 'loading',
				subjectId: 0,
				// signature
				showSignModal: false,
				showSignFullscreen: false,
				signHasData: false,
				signImage: '',
				pendingRoomItem: null,
			}
		},
		onLoad(e) {
			this.subjectId = this.utils.getSubjectId()
			this.getCate()
			this.getRoom()
		},
		async onReachBottom() {
			console.log("onReachBottom")
			if (this.has_more) {
				this.current_page++
				this.getRoom()
			}
		},
		computed: {
			// 报名方式样式
			getSignupModeClass(item) {
				return function(item) {
					switch (item.signup_mode) {
						case 'NORMAL':
							return 'bg-green'
						case 'PASSWORD':
							return 'bg-bule'
						case 'AUDIT':
							return 'bg-purple'
					}
				}
			},
			// 补考方式样式
			getMakeupModeClass(item) {
				return function(item) {
					if (item.is_makeup) {
						return 'bg-green'
					}
					
					return 'bg-bule'
				}
			},
		},
		methods: {
			// 获取分类
			getCate() {
				this.http('cate/filter', {
					kind: 'ROOM',
					subject_id: this.subjectId,
				}).then(res => {
					this.filterData = res.data
				})
			},

			// 获取考场
			getRoom() {
				this.loadFlag = 'loading'
				
				let params = {
					page: this.current_page
				}
				
				if (this.subjectId) {
					params['subject_id'] = this.subjectId
				}
				if (this.cate_id) {
					params['cate_id'] = this.cate_id
				}
				if (this.sort) {
					params['sort'] = this.sort
				}
				
				this.http('room/index', params).then(res => {
					if (res && res.data) {
						this.list = this.list.concat(res.data.list.data)
						console.log('list', this.list)
						this.has_more = res.data.list.has_more
						this.current_page = res.data.list.current_page
						this.loadFlag = 'over'
					}
				})
			},

			// 选择分类
			confirmCate(event) {
				console.log('confirm cate', event)
				let cate_id = 0
				for (let i = 0; i < event.value[0].length; i++) {
					cate_id = event.value[0].pop()
					if (cate_id) {
						break
					}
				}
				
				if (!cate_id && event.value[0][0]) {
					cate_id = event.value[0][0]
				}
				
				let sort = ''
				if (event?.value[1]) {
					sort = event?.value[1][0]
				}

				if (cate_id != this.cate_id || sort != this.sort) {
					this.cate_id = cate_id
					this.sort = sort
					
					this.list = []
					this.getRoom()
				}
			},

			// 计算考场状态
			getRoomStatus(item) {
				if (!item || !item.start_time || !item.end_time) {
					return { text: '', type: '' }
				}
				const now = Date.now() / 1000
				if (now < item.start_time) {
					return { text: '未开始', type: 'not-started' }
				}
				if (now >= item.start_time && now <= item.end_time) {
					return { text: '进行中', type: 'processing' }
				}
				return { text: '已结束', type: 'finished' }
			},

			// 点击考场卡片：只有进行中的才允许进入详情
			handleRoomClick(item) {
				const status = this.getRoomStatus(item)
				if (!status || status.type !== 'processing') {
					uni.showToast({
						title: '当前考试不可参加',
						icon: 'none'
					})
					return
				}
				// 进入考试前先签名
				this.pendingRoomItem = item
				this.showSignModal = true
			},

			closeSignModal() {
				this.showSignModal = false
			},
			openFullscreenSign() {
				// 打开全屏前先关闭半屏弹窗，避免遮挡
				this.showSignModal = false
				this.showSignFullscreen = true
				this.$nextTick(() => {
					this.$refs.sigFull && this.$refs.sigFull.clear()
				})
			},
			closeFullscreenSign() {
				this.showSignFullscreen = false
			},
			clearSign() {
				this.$refs.sigPad && this.$refs.sigPad.clear()
				this.signImage = ''
			},
			async confirmSignAndNext() {
				try {
					const tempPath = await (this.$refs.sigPad && this.$refs.sigPad.exportImage())
					this.signImage = tempPath
					this.showSignModal = false
					if (this.pendingRoomItem && this.pendingRoomItem.id) {
						// TODO: 这里可以把 signImage 上传/提交给后端
						this.utils.goto('/pages/room/detail?id=' + this.pendingRoomItem.id)
					}
				} catch (e) {
					uni.showToast({
						title: '请先签名',
						icon: 'none'
					})
				}
			},
			async confirmFullscreenSign() {
				try {
					const tempPath = await (this.$refs.sigFull && this.$refs.sigFull.exportImage())
					this.signImage = tempPath
					this.closeFullscreenSign()
					// 同步到半屏签名板显示
					this.$refs.sigPad && this.$refs.sigPad.clear()
					this.signHasData = true
				} catch (e) {
					uni.showToast({
						title: '请先签名',
						icon: 'none'
					})
				}
			},


			// tabSelect(e) {
			// 	this.tabCur = e.currentTarget.dataset.id;
			// 	this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
			// }
		}
	}
</script>

<style>
	page {
		background-color: #ededed;
	}

	.room-page {
		min-height: 100vh;
		background-color: #ededed;
		padding-top: calc(130rpx + var(--status-bar-height));
		box-sizing: border-box;
	}

	/* HMfilterDropdown 组件本身是 fixed，需要下移到自定义 topbar 下方 */
	.room-page .HMfilterDropdown {
		top: calc(130rpx + var(--status-bar-height)) !important;
	}
	
	.paper-contains {
		/* 给 fixed 的筛选条留出空间 */
		margin-top: 50px;
	}

	.paper-card {
		margin: 30rpx 0;
	}

	.tui-title {
		width: 100%;
		padding: 70rpx 30rpx 30rpx 30rpx;
		box-sizing: border-box;
		font-size: 30rpx;
		line-height: 30rpx;
		color: #666;
	}

	.tui-default {
		padding: 20rpx 30rpx;
	}

	.tui-article {
		position: relative;
	}

	.tui-article-img {
		width: 100%;
		height: 300rpx;
		display: block;
	}

	.tui-article-title {
		position: absolute;
		left: 0;
		bottom: 0;
		color: #fff;
		font-size: 32rpx;
		font-weight: 500;
		box-sizing: border-box;
		padding: 20rpx 30rpx;
		background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.6));
	}

	.tui-cell-title {
		font-size: 32rpx;
		font-weight: 500;
		padding: 0 10rpx;
		word-break: break-all;
		word-wrap: break-word;
	}

	.tui-cell-img {
		height: 160rpx;
		width: 160rpx;
	}

	.tui-flex {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.tui-mr {
		margin-right: 20rpx;
	}


	.tui-flex-pic {
		display: flex;
		display: -webkit-flex;
		justify-content: space-between;
		flex-direction: row;
		flex-wrap: wrap;
		box-sizing: border-box;
		background: #fff;
		padding: 0 120rpx;
	}

	.tui-flex-pic image {
		width: 32%;
		margin-bottom: 2%;
	}

	.tui-content {
		padding: 0rpx 30rpx 20rpx 120rpx;
		box-sizing: border-box;
		font-size: 34rpx;
		font-weight: 400;
		color: #333;
	}

	.tui-color-gray {
		color: #ccc;
	}

	.tui-pleft {
		padding-left: 120rpx;
	}
	
	.article-shadow {
		border-radius: 15rpx;
		box-shadow: 0rpx 0rpx 50rpx 0rpx rgba(0, 0, 0, 0.07);
	}
	
	/* 底部安全边距 start*/
	.tn-tabbar-height {
		min-height: 60rpx;
		height: calc(40rpx + env(safe-area-inset-bottom) / 2);
		height: calc(40rpx + constant(safe-area-inset-bottom));
	}

	/* 签名弹窗 */
	.sign-sheet {
		background: #fff;
		padding: 18rpx 24rpx 28rpx;
	}

	.sign-sheet-header {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		padding: 12rpx 0 18rpx;
	}

	.sign-sheet-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #222;
	}

	.sign-sheet-close {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 60rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		font-size: 40rpx;
		color: #999;
	}

	.sign-board {
		height: 360rpx;
		border: 2rpx dashed #e6e6e6;
		border-radius: 12rpx;
		overflow: hidden;
		background: #fff;
	}

	.sign-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 4rpx 22rpx;
		color: #666;
		font-size: 26rpx;
	}

	.sign-clear,
	.sign-full {
		padding: 10rpx 14rpx;
	}

	.sign-clear-icon {
		width: 34rpx;
		height: 34rpx;
		display: block;
	}

	.sign-next {
		height: 92rpx;
		border-radius: 46rpx;
		background: #4d7cff;
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 全屏签名层 */
	.sign-fullscreen {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		background: #fff;
	}

	.sign-fullscreen-close {
		position: absolute;
		left: 10rpx;
		top: calc(10rpx + var(--status-bar-height));
		width: 64rpx;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		font-size: 44rpx;
		color: #999;
		z-index: 2;
	}

	.sign-fullscreen-body {
		padding-top: calc(20rpx + var(--status-bar-height));
		height: 100vh;
		display: flex;
		align-items: stretch;
	}

	.sign-fullscreen-title {
		width: 72rpx;
		margin: 24rpx 0 24rpx 24rpx;
		color: #333;
		font-size: 28rpx;
		font-weight: 600;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		letter-spacing: 6rpx;
	}

	.sign-fullscreen-board {
		flex: 1;
		margin: 24rpx;
		border: 2rpx dashed #e6e6e6;
		border-radius: 12rpx;
		overflow: hidden;
		position: relative;
	}

	.sign-fullscreen-next {
		width: 92rpx;
		margin: 24rpx 24rpx 24rpx 0;
		background: #4d7cff;
		color: #fff;
		border-radius: 46rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		letter-spacing: 6rpx;
	}

	.vchar {
		display: block;
		transform: rotate(-90deg);
		transform-origin: center;
		line-height: 1.1;
		margin: 6rpx 0;
		color: #333;
	}

	.vchar-white {
		color: #fff;
	}

	.sign-fullscreen-eraser {
		position: absolute;
		right: 16rpx;
		top: 16rpx;
		width: 56rpx;
		height: 56rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
	}

	.sign-fullscreen-eraser-img {
		width: 34rpx;
		height: 34rpx;
		display: block;
	}
</style>
