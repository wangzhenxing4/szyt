<template>
  <view class="container">
    <!-- 头部区域 -->
    <view class="detail-header">
      <text class="type-tag">{{ noticeTypeText(noticeDetail.noticeType) }}</text>
      <view class="detail-title">{{ noticeDetail.noticeTitle }}</view>
      <view class="detail-meta">
        <text class="meta-item">
          <text class="meta-icon">🕒</text> 更新: {{ formatTime(noticeDetail.updateTime) || formatTime(noticeDetail.createTime)}}
        </text>
        <text class="meta-item">
          <text class="meta-icon">👤</text> 发布: {{ noticeDetail.updateBy || noticeDetail.createBy }}
        </text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="detail-content">
      <!-- 视频区域 -->
      <view v-if="videoUrl" class="video-container">
        <video 
          :src="videoUrl" 
          controls 
          autoplay="false" 
          show-fullscreen-btn="true"
          show-center-play-btn="true"
          enable-progress-gesture="true"
          class="custom-video"
        ></video>
      </view>
      
      <!-- 富文本内容 -->
      <rich-text :nodes="processedContent" class="rich-text-content"></rich-text>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-animation"></view>
      <text class="loading-text">内容加载中...</text>
    </view>
  </view>
</template>

<script>
import { getNotice } from '@/api/system/notice';

export default {
  data() {
    return {
      noticeDetail: {},
      loading: true,
      processedContent: '',
      videoUrl: ''
    }
  },
  onLoad(options) {
    this.noticeId = options.id;
    this.fetchNoticeDetail();
  },
  methods: {
    async fetchNoticeDetail() {
      try {
        this.loading = true;
        const res = await getNotice(this.noticeId);
        if (res.code === 200) {
          this.noticeDetail = res.data;
          // 处理富文本内容和视频
          this.processContent(res.data.noticeContent);
        }
      } catch (error) {
        console.error('获取详情失败', error);
        uni.showToast({ 
          title: '获取详情失败',
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 处理内容 - 提取视频并处理富文本
    processContent(content) {
      // 提取视频URL
      const videoRegex = /<iframe[^>]*src="([^"]*\.mp4)"[^>]*>/i;
      const match = content.match(videoRegex);
      
      if (match && match[1]) {
        this.videoUrl = match[1];
        // 从内容中移除iframe
        content = content.replace(videoRegex, '');
      }
      
      // 处理富文本内容
      this.processedContent = this.processRichText(content);
    },
    
    // 处理富文本内容
    processRichText(content) {
      // 1. 添加图片样式处理
      content = content.replace(/<img/gi, '<img class="rich-image"');
      
      // 2. 添加段落样式
      content = content.replace(/<p([^>]*)>/gi, '<p class="rich-paragraph" $1>');
      
      // 3. 添加对齐样式转换
      content = content.replace(/class="ql-align-center"/gi, 'style="text-align: center;"');
      content = content.replace(/class="ql-align-right"/gi, 'style="text-align: right;"');
      content = content.replace(/class="ql-align-justify"/gi, 'style="text-align: justify;"');
      
      // 4. 添加响应式处理
      content = content.replace(/style="([^"]*)width:\s*(\d+)px([^"]*)"/gi, function(match, p1, p2, p3) {
        return `style="${p1}max-width:100%;width:100%;height:auto;${p3}"`;
      });
      
      return content;
    },
    
    formatTime(time) {
      if (!time) return '';
      return time.split(' ')[0];
    },
    
    noticeTypeText(type) {
      return type === '1' ? '要闻' : '公告';
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #f7f9fc;
  padding: 30rpx;
  min-height: 100vh;
}

/* 头部样式 */
.detail-header {
  padding: 30rpx;
  margin-bottom: 30rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
  border-left: 8rpx solid #1a73e8;
}

.type-tag {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: #1a73e8;
  color: white;
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 30rpx;
}

.detail-title {
  font-size: 42rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  line-height: 1.4;
  color: #333;
  padding-right: 80rpx;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.meta-item {
  font-size: 28rpx;
  color: #666;
  display: flex;
  align-items: center;
}

.meta-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

/* 内容区域 */
.detail-content {
  background-color: white;
  padding: 40rpx 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.05);
}

/* 视频容器 */
.video-container {
  margin-bottom: 40rpx;
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  height: 0;
  overflow: hidden;
}

.custom-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
  background-color: #000;
}

/* 自定义富文本样式 */
.rich-text-content {
  overflow: hidden;
}

.rich-text-content ::v-deep .rich-image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 40rpx auto;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.rich-text-content ::v-deep .rich-paragraph {
  font-size: 32rpx;
  line-height: 1.8;
  margin-bottom: 30rpx;
  color: #444;
  text-align: justify;
  text-indent: 2em;
}

.rich-text-content ::v-deep p:last-child {
  margin-bottom: 0;
}

/* 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-animation {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #f0f0f0;
  border-top: 6rpx solid #1a73e8;
  border-radius: 50%;
  animation: rotate 1.2s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes rotate {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 32rpx;
  color: #666;
}
</style>