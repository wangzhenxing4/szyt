<template>
	<view class="work-container">
		<!-- 轮播图 -->
		<view class="swiper-container">
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="2500" :duration="800" circular>
				<swiper-item v-for="(item, index) in bannerData" :key="index">
					<image :src="item.image" mode="aspectFill" class="slide-image"></image>
				</swiper-item>
			</swiper>
		</view>

		<view>
			<button v-if="shouldShowHealthButton" @click="openExternalLink">健康打卡</button>
			
			<button @click="openxgxtLink">学工系统</button>
		</view>


		<!-- 模块展示区域 -->
		<view v-if="hasPermissions">
			<view v-for="(module, moduleIndex) in modules" :key="moduleIndex" class="module-container">
				<uni-section :title="module.title" type="line"></uni-section>
				<view class="grid-body">
					<uni-grid :column="4" :showBorder="false" @change="changeGrid">
						<uni-grid-item v-for="(item, itemIndex) in module.children" :key="itemIndex">
							<view class="grid-item-box" @click="handleItemClick(item)">
								<uni-icons :type="item.icon" size="30"></uni-icons>
								<text class="text">{{ item.title }}</text>
							</view>
						</uni-grid-item>
					</uni-grid>
				</view>
			</view>
		</view> <!-- 无权限提示 -->
		<view v-else class="no-permissions-container">
			<view class="no-permissions-icon">
				<uni-icons type="warn-filled" size="80" color="#999"></uni-icons>
			</view>
			<view class="no-permissions-text">此账号没有任何权限操作任何功能</view>
			<button class="refresh-button" @click="fetchRouters">
				<uni-icons type="refresh" size="18"></uni-icons>
				<text>刷新权限</text>
			</button>
		</view>
	</view>
</template>

<script>
  import {
    getRouters
  } from '@/api/menu' // 引入路由接口
  import config from '@/config' // 引入配置文件
  // 导入工具模块（保留原注释）
  import { checkRefererEnvironment, openHealthCheck, openXgxtSystem } from '@/utils/app'; // 应用工具函数

  export default {
    data() {
      return {
        shouldShowHealthButton: true, // 微信小程序判断
        current: 0,
        swiperDotIndex: 0,
        // 轮播图数据 - 保留原有注释和数据结构
        bannerData: [
          // {
          //   image: config.imageBaseUrl + '1.jpg'
          // },
          {
            image: config.imageBaseUrl + '2.jpg'
          },
          // {
          //   image: config.imageBaseUrl + '3.jpg'
          // },
          // {
          //   image: config.imageBaseUrl + '4.jpg'
          // },
          {
            image: config.imageBaseUrl + '5.jpg'
          },
          {
            image: config.imageBaseUrl + '6.jpg'
          },
          // {
          //   image: config.imageBaseUrl + '7.jpg'
          // },
          // {
          //   image: config.imageBaseUrl + '8.jpg'
          // },
          {
            image: config.imageBaseUrl + '9.jpg'
          }
        ],
        // 系统模块数据 - 修改为存储所有模块
        modules: []
      }
    },
    computed: {
      // 计算是否有任何权限
      hasPermissions() {
        // 检查所有模块是否有子项
        return this.modules.some(module => module.children && module.children.length > 0)
      }
    },
    onLoad() {
      this.fetchRouters()
      this.checkRefererEnvironment(); // 微信小程序判断
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
        学工系统
        直接跳转到SchoolWebsite.vue页面，传递URL参数
        */
        openXgxtSystem(uni.navigateTo, config.XGXT);
      },
      
      // 微信小程序检测Referer环境（调用工具模块，保留原注释）
      checkRefererEnvironment() {
        /* 微信小程序判断 */
        return checkRefererEnvironment();
      },

      // 点击轮播图项 - 保留原有注释
      clickBannerItem(item) {
        console.info(item)
      },

      // 轮播图切换 - 保留原有注释
      changeSwiper(e) {
        this.current = e.detail.current
      },

      // 宫格切换提示 - 保留原有注释
      changeGrid(e) {
        this.$modal.showToast('模块建设中~')
      },

      // 导航到用户管理 - 保留原有注释
      navigateToUserManagement() {
        uni.navigateTo({
          url: '/pages/work/UserManagement/UserManagement'
        });
      },

      // 导航到角色管理 - 保留原有注释
      navigateToRoleManagement() {
        uni.navigateTo({
          url: '/pages/work/RoleManagement/RoleManagement'
        });
      },

      // 获取路由数据
      async fetchRouters() {
        try {
          const res = await getRouters()
          if (res.code === 200) {
            this.processRouters(res.data)
          }
        } catch (error) {
          console.error('获取路由数据失败', error)
        }
      },

      // 处理路由数据 - 处理所有模块
      processRouters(routers) {
        // 提取所有可见模块
        this.modules = routers
          .filter(router => !router.hidden && router.alwaysShow)
          .map(router => {
            return {
              title: router.meta.title,
              name: router.name,
              children: router.children
                .filter(item => !item.hidden)
                .map(item => {
                  return {
                    title: item.meta.title,
                    path: item.path,
                    name: item.name,
                    icon: this.getIconType(item.name) // 使用图标映射
                  }
                })
            }
          })
      },

      // 获取图标类型 - 保持与原有硬编码版本一致并扩展
      getIconType(name) {
        // 这里建立接口返回的name与uni-icons的映射关系
        // 完全按照原有硬编码的图标配置并添加新图标
        const iconMap = {
          // 系统管理模块图标
          'User': 'person-filled',
          'Role': 'staff-filled',
          'Menu': 'color',
          'Dept': 'settings-filled',
          'Post': 'heart-filled',
          'Dict': 'bars',
          'Config': 'gear-filled',
          'Notice': 'chat-filled',
          'Log': 'wallet-filled', // 日志管理父级图标
          'Operlog': 'form', // 操作日志图标
          'Logininfor': 'logininfor', // 登录日志图标

          // 系统监控模块图标
          'Online': 'online', // 在线用户图标
          'Job': 'job', // 定时任务图标
          'Druid': 'druid', // 数据监控图标
          'Server': 'server', // 服务监控图标
          'Cache': 'redis', // 缓存监控图标
          'CacheList': 'redis-list', // 缓存列表图标

          // 系统工具模块图标
          'Build': 'build', // 表单构建图标
          'Gen': 'code', // 代码生成图标
          'Swagger': 'swagger' // 系统接口图标
        }
        return iconMap[name] || 'circle' // 默认图标
      },

      // 处理宫格项点击 - 保持原有导航逻辑并支持新模块
      handleItemClick(item) {
        // 保留原有特殊处理
        if (item.path === 'user') {
          this.navigateToUserManagement()
        } else if (item.path === 'role') {
          this.navigateToRoleManagement()
        } else {
          // 通用导航逻辑 - 首字母大写处理路径
          const firstLetter = item.path.charAt(0).toUpperCase()
          const pagePath = firstLetter + item.path.slice(1)
          uni.navigateTo({
            url: `/pages/work/${pagePath}/${pagePath}`
          })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
	/* #ifndef APP-NVUE */
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}

	view {
		font-size: 14px;
		line-height: inherit;
	}

	/* #endif */

	.text {
		text-align: center;
		font-size: 26rpx;
		margin-top: 10rpx;
	}

	.grid-item-box {
		flex: 1;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.uni-margin-wrap {
		width: 690rpx;
		width: 100%;
		;
	}

	/* 轮播图容器 */
	.swiper-container {
		position: relative;
		width: 100%;
		padding-top: 50%;
		/* 2:1的高宽比 */
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		margin-bottom: 20rpx;
	}

	/* 轮播图本身 */
	.swiper {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* 轮播图中图片 */
	.slide-image {
		width: 100%;
		height: 100%;
	}

	.swiper-item {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: #fff;
		height: 300rpx;
		line-height: 300rpx;
	}

	@media screen and (min-width: 500px) {
		.uni-swiper-dot-box {
			width: 400px;
			/* #ifndef APP-NVUE */
			margin: 0 auto;
			/* #endif */
			margin-top: 8px;
		}

		.image {
			width: 100%;
		}
	}

	/* 模块容器样式 */
	.module-container {
		padding: 0 20rpx 30rpx;
	}

	/* 无权限提示样式 */
	.no-permissions-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 300rpx;
		padding: 20rpx;
		text-align: center;
	}

	.no-permissions-icon {
		margin-bottom: 20rpx;
	}

	.no-permissions-text {
		font-size: 32rpx;
		color: #999;
		margin-bottom: 30rpx;
	}

	.refresh-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 30rpx;
		border-radius: 40rpx;
		background-color: #f5f5f5;
		color: #666;
		font-size: 28rpx;
	}

	.refresh-button uni-icons {
		margin-right: 10rpx;
	}
</style>