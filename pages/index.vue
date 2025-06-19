<template>
	<view class="container">
		<!-- 本地静态图片轮播 -->
		<view class="section">
			<view class="section-title">山西职业技术学院</view>
			<view class="swiper-container">
				<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="2500" :duration="800"
					circular>
					<swiper-item v-for="(item, index) in localImages" :key="index">
						<image :src="item" mode="aspectFill" class="slide-image"></image>
					</swiper-item>
				</swiper>
			</view>
		</view>
		<view>
			<button v-if="shouldShowHealthButton" @click="openExternalLink">健康打卡</button>

			<button @click="openxgxtLink">学工系统</button>
		</view>
		<view class="section">
			<view class="section-title">
				<text class="title-icon">📢</text>
				学院公告
				<text class="more-link" @click="handleMoreClick('2')">更多 ></text>
			</view>
			<view class="notice-container">
				<view v-for="(notice, index) in noticeList" class="notice-item"
					@click="handleNoticeClick(notice.noticeId)">
					<view class="notice-index">{{ index + 1 }}.</view>
					<view class="notice-content">
						<view class="notice-title">{{ notice.noticeTitle }}</view>
						<view class="notice-time">
							更新时间：{{ formatTime(notice.updateTime) || formatTime(notice.createTime)}}</view>
					</view>
				</view>
				<view v-if="noticeList.length === 0" class="empty-tip">
					<text class="empty-icon">😊</text>
					暂无学院公告
				</view>
			</view>
		</view>

		<view class="section">
			<view class="section-title">
				<text class="title-icon">📰</text>
				山职要闻
				<text class="more-link" @click="handleMoreClick('1')">更多 ></text>
			</view>
			<view class="news-container">
				<view v-for="(news, index) in newsList" class="news-item" @click="handleNoticeClick(news.noticeId)">
					<view class="news-index">{{ index + 1 }}.</view>
					<view class="news-content">
						<view class="news-title">{{ news.noticeTitle }}</view>
						<view class="news-time">更新时间：{{ formatTime(news.updateTime) || formatTime(news.createTime) }}
						</view>
					</view>
				</view>
				<view v-if="newsList.length === 0" class="empty-tip">
					<text class="empty-icon">😊</text>
					暂无山职要闻
				</view>
			</view>
		</view>

		<!-- 接口动态数据轮播 -->
		<!-- <view class="section">
      <view class="section-title">动态数据轮播</view>
      <swiper 
        class="swiper" 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="3000" 
        :duration="500"
        circular
      >
        <swiper-item v-for="(item, index) in apiImages" :key="index">
          <image :src="item.imgUrl" mode="aspectFill" class="slide-image"></image>
          <view class="slide-title">{{ item.title }}</view>
        </swiper-item>
      </swiper>
    </view> -->
	</view>
</template>

<script>
  // import { getAPI } from '@/api/home' // 假设的轮播图接口
  import config from '@/config' // 引入配置文件
  import {
    listNotice
  } from '@/api/system/notice'; // 通知公告
  // 导入工具模块（保留原注释）
  import { checkRefererEnvironment, openHealthCheck, openXgxtSystem } from '@/utils/app'; // 应用工具函数

  export default {
    data() {
      return {
        shouldShowHealthButton: true, // 微信小程序判断
        noticeData: [], // 存储原始公告数据
        // 本地静态图片
        localImages: [
          config.imageBaseUrl + '1.jpg',
          // config.imageBaseUrl + '2.jpg',
          config.imageBaseUrl + '3.jpg',
          config.imageBaseUrl + '4.jpg',
          // config.imageBaseUrl + '5.jpg',
          // config.imageBaseUrl + '6.jpg',
          config.imageBaseUrl + '7.jpg',
          config.imageBaseUrl + '8.jpg',
          // config.imageBaseUrl + '9.jpg'    
        ],
        // 接口返回的图片数据
        apiImages: [],
        // 轮播图配置
        swiperConfig: {
          indicatorDots: true, // 显示指示点[1,4](@ref)
          autoplay: true, // 自动播放[1,2](@ref)
          interval: 3000, // 切换间隔3秒[1,4](@ref)
          duration: 500, // 动画时长0.5秒[1,4](@ref)
          circular: true // 循环播放[2,4](@ref)
        }
      }
    },

    computed: {
      // 通知公告（类型2）- 保持计算属性过滤逻辑
      noticeList() {
        return this.noticeData.filter(item => item.noticeType === "2");
      },
      // 山职要闻（类型1）- 保持计算属性过滤逻辑
      newsList() {
        return this.noticeData.filter(item => item.noticeType === "1");
      }
    },

    onLoad() {
      // this.fetchBannerData()
      this.checkRefererEnvironment(); // 微信小程序判断
    },
    mounted() {
      this.fetchNoticeData();
    },

    methods: {
      // 健康打卡（调用工具模块，保留原注释）
      openExternalLink() {
        /*
        健康打卡跳转（核心修改此处）
        判断是否在微信小程序环境
        微信小程序环境下执行原逻辑
        */
        openHealthCheck(uni.navigateTo, config);
      },
      
      // 学工系统（调用工具模块，保留原注释）
      openxgxtLink() {
        /*
        学工系统跳转
        直接跳转到SchoolWebsite.vue页面，传递URL参数
        */
        openXgxtSystem(uni.navigateTo, config.XGXT);
      },
      
      // 微信小程序检测Referer环境（调用工具模块，保留原注释）
      checkRefererEnvironment() {
        /* 微信小程序判断 */
        return checkRefererEnvironment();
      },
      
      async fetchNoticeData() {
        try {
          const query = {
            pageNum: 1,
            pageSize: 10
          };
          const res = await listNotice(query);
          if (res.code === 200) {
            // 核心修改：在数据获取时直接按noticeId降序排序
            const sortedData = res.rows.sort((a, b) =>
              parseInt(b.noticeId, 10) - parseInt(a.noticeId, 10)
            );
            this.noticeData = sortedData;
          }
        } catch (error) {
          console.error('公告加载失败', error);
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          });
        }
      },

      handleNoticeClick(noticeId) {
        uni.navigateTo({
          url: `/pages/mine/notice-detail/notice-detail?id=${noticeId}`
        });
      },
      formatTime(time) {
        if (!time) return '';
        return time.split(' ')[0]; // 只显示日期部分
      },
      handleMoreClick(type) {
        // 跳转到对应类型的更多页面
        uni.navigateTo({
          url: `/pages/notice-list/notice-list?type=${type}`
        });
      }
    }
  }
</script>

<style scoped>
	.container {
		padding: 20rpx;
	}

	.section {
		padding-top: 20rpx;
		margin-bottom: 40rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		padding-left: 20rpx;
		border-left: 6rpx solid #1a73e8;
	}

	.swiper-container {
		position: relative;
		width: 100%;
		padding-top: 50%;
		/* 2:1的高宽比 */
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.swiper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.slide-image {
		width: 100%;
		height: 100%;
	}

	.slide-title {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
		color: white;
		padding: 20rpx;
		font-size: 28rpx;
	}

	.notice-item {
		padding: 20rpx 30rpx;
		border-bottom: 1px solid #f5f5f5;
	}

	.notice-title {
		font-size: 30rpx;
		color: #333;
		margin-bottom: 10rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}

	.empty-tip {
		text-align: center;
		padding: 40rpx;
		color: #999;
	}

	/* 新增样式 */
	.section-title {
		position: relative;
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 30rpx;
		padding-left: 30rpx;
		border-left: 8rpx solid #1a73e8;
		display: flex;
		align-items: center;
	}

	.title-icon {
		margin-right: 15rpx;
		font-size: 40rpx;
	}

	.more-link {
		position: absolute;
		right: 30rpx;
		font-size: 28rpx;
		color: #666;
		font-weight: normal;
	}

	.notice-container,
	.news-container {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 0 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.notice-item,
	.news-item {
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		display: flex;
		align-items: flex-start;
	}

	.notice-item:last-child,
	.news-item:last-child {
		border-bottom: none;
	}

	.notice-index,
	.news-index {
		width: 50rpx;
		font-size: 32rpx;
		color: #1a73e8;
		text-align: center;
	}

	.notice-content,
	.news-content {
		flex: 1;
	}

	.notice-title,
	.news-title {
		font-size: 32rpx;
		color: #333;
		line-height: 1.6;
		text-align: justify;
		margin-bottom: 15rpx;
	}

	.notice-time,
	.news-time {
		font-size: 26rpx;
		color: #999;
		text-align: right;
	}

	.empty-tip {
		text-align: center;
		padding: 60rpx 0;
		color: #999;
		font-size: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.empty-icon {
		font-size: 60rpx;
		margin-bottom: 20rpx;
	}
</style>