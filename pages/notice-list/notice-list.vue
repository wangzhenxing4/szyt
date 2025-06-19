<template>
  <view class="container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="header-icon">{{ type === '1' ? '📰' : '📢' }}</text>
      <text class="header-title">{{ type === '1' ? '山职要闻' : '学院公告' }}</text>
    
    </view>
    
    <!-- 通知列表 -->
    <view class="content">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-icon">⏳</view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="noticeList.length === 0" class="empty-tip">
        <text class="empty-icon">{{ type === '1' ? '📰' : '📢' }}</text>
        <text>{{ type === '1' ? '暂无山职要闻' : '暂无学院公告' }}</text>
      </view>
      
      <!-- 通知列表 -->
      <view v-else class="notice-container">
        <view 
          v-for="(item, index) in noticeList" 
          :key="index" 
          class="notice-item"
          @click="viewNoticeDetail(item.noticeId)"
        >
          <view class="notice-index">{{ index + 1 }}.</view>
          <view class="notice-content">
            <view class="notice-title">{{ item.noticeTitle }}</view>
            <view class="notice-info">
              <text>更新时间：{{ formatTime(item.updateTime) || formatTime(item.createTime)}}</text>
            </view>
          </view>
        </view>
        
        <!-- 加载更多按钮 -->
        <view v-if="loadStatus === 'more'" class="load-more" @click="loadMoreData">
          <text>加载更多</text>
        </view>
        <view v-else-if="loadStatus === 'loading'" class="load-more loading">
          <text>加载中...</text>
        </view>
        <view v-else-if="loadStatus === 'noMore'" class="load-more no-more">
          <text>没有更多了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { listNotice } from '@/api/system/notice';

export default {
  data() {
    return {
      type: '1', // 默认山职要闻
      noticeList: [],
      loading: true,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      loadStatus: 'more' // more/loading/noMore
    };
  },
  onLoad(options) {
    if (options.type) {
      this.type = options.type;
    }
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.type === '1' ? '山职要闻' : '学院公告'
    });
    this.fetchNoticeData();
  },
  // 启用下拉刷新
  onPullDownRefresh() {
    this.pageNum = 1;
    this.fetchNoticeData(true);
  },
  methods: {
    
	async fetchNoticeData(disableRefresh) {
	  this.loading = this.pageNum === 1;
	  try {
	    const query = {
	      pageNum: this.pageNum,
	      pageSize: this.pageSize,
	      noticeType: this.type
	    };
	    
	    const res = await listNotice(query);
	    if (res.code === 200) {
	      // 关键修改：按 noticeId 降序排序（确保数值类型）
	      const sortedRows = res.rows.sort((a, b) => 
	        parseInt(b.noticeId, 10) - parseInt(a.noticeId, 10)
	      );
	      
	      if (this.pageNum === 1) {
	        this.noticeList = sortedRows;
	      } else {
	        this.noticeList = [...this.noticeList, ...sortedRows];
	      }
	      
	      this.total = res.total;
	      this.loading = false;
	      this.loadStatus = this.pageNum * this.pageSize >= res.total ? 'noMore' : 'more';
	    }
	  } catch (error) {
	    console.error('数据加载失败', error);
	    uni.showToast({ title: '数据加载失败', icon: 'none' });
	    this.loading = false;
	    this.loadStatus = 'more';
	  } finally {
	    if (disableRefresh) uni.stopPullDownRefresh();
	  }
	},
	
    // 加载更多数据
    loadMoreData() {
      if (this.loadStatus !== 'more') return;
      
      this.pageNum++;
      this.loadStatus = 'loading';
      this.fetchNoticeData();
    },
    
    // 格式化时间
    formatTime(time) {
      return time ? time.split(' ')[0] : '';
    },
    
    // 查看通知详情
    viewNoticeDetail(noticeId) {
      uni.navigateTo({
        url: `/pages/mine/notice-detail/notice-detail?id=${noticeId}`
      });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f5f8ff;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 头部样式 */
.header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  color: white;
  font-size: 36rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
  z-index: 10;
}

.header-icon {
  font-size: 44rpx;
  margin-right: 20rpx;
}

.header-title {
  flex: 1;
  font-size: 36rpx;
}


/* 内容区样式 */
.content {
  padding: 30rpx 25rpx;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 32rpx;
  color: #666;
}

/* 空状态样式 */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;
  color: #999;
  font-size: 34rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
  opacity: 0.7;
}

/* 通知列表样式 */
.notice-container {
  border-radius: 16rpx;
  background-color: #fff;
  padding: 10rpx;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05);
}

.notice-item {
  padding: 30rpx 25rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  transition: all 0.3s;
}

.notice-item:active {
  background-color: #f9f9ff;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-index {
  width: 60rpx;
  font-size: 36rpx;
  color: #1a73e8;
  font-weight: bold;
  margin-right: 15rpx;
  margin-top: 8rpx;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 34rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 15rpx;
  font-weight: 500;
  text-align: justify;
}

.notice-info {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}

/* 加载更多按钮 */
.load-more {
  padding: 30rpx;
  text-align: center;
  font-size: 30rpx;
  color: #1a73e8;
  transition: all 0.3s;
  border-top: 1rpx solid #f0f0f0;
}

.load-more:active {
  background-color: #f0f7ff;
}

.loading {
  color: #999;
}

.no-more {
  color: #ccc;
}
</style>