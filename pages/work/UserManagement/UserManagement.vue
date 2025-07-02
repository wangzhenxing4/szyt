<template>
	<view class="app-container">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-row">
				<view class="input-container">
					<uni-icons type="search" size="18" color="#999" class="search-icon"></uni-icons>
					<input class="search-input" placeholder="搜索用户名称" v-model="queryParams.userName"
						@confirm="handleQuery" />
				</view>
				<view class="input-container">
					<uni-icons type="phone" size="18" color="#999" class="search-icon"></uni-icons>
					<input class="search-input" placeholder="搜索手机号码" v-model="queryParams.phonenumber"
						@confirm="handleQuery" />
				</view>
			</view>
			<view class="button-row">
				<button class="search-btn" @tap="handleQuery">
					<uni-icons type="search" size="16" color="#fff"></uni-icons> 搜索
				</button>
				<button class="search-btn reset" @tap="resetQuery">
					<uni-icons type="refresh" size="16" color="#fff"></uni-icons> 重置
				</button>
			</view>
		</view>

		<!-- 操作按钮栏 -->
		<!-- 操作按钮栏 - 水平排列 -->
		<view class="action-bar-horizontal">
			<view class="action-btn primary" @tap="handleAdd">
				<uni-icons type="plus" size="20" color="#fff"></uni-icons>
				<view class="action-btn-text">新增</view>
			</view>
			<!--  <view class="action-btn" @tap="handleExport">
	    <view class="action-icon">↓</view>
	    <view class="action-btn-text">导出</view>
	  </view>
	  <view class="action-btn warning" @tap="handleImport">
	    <view class="action-icon">↑</view>
	    <view class="action-btn-text">导入</view>
	  </view> -->
			<view class="action-btn danger" @tap="handleDeleteMultiple">
				<uni-icons type="trash" size="20" color="#fff"></uni-icons>
				<view class="action-btn-text">删除</view>
			</view>
		</view>
		</scroll-view>

		<!-- 用户列表 -->
		<view class="user-list">
			<view v-if="userList.length === 0" class="empty">
				<image src="/static/images/empty.png" class="empty-img" />
				<view class="empty-text">暂无用户数据</view>
				<button class="empty-btn" @tap="handleAdd">添加用户</button>
			</view>

			<block v-else>
				<!-- 状态筛选 -->
				<view class="list-header">
					<view class="list-header">
						<view class="select-all" @tap="toggleSelectAll">
							<uni-icons :type="isAllSelected ? 'checkbox-filled' : 'circle'" size="20"
								:color="isAllSelected ? '#1890ff' : '#999'">
							</uni-icons>
							<text>全选</text>
						</view>

					</view>
					<text>共 {{ total }} 位用户</text>
					<view class="status-filter">
						<text :class="{active: statusIndex === 0}" @tap="changeStatus(0)">全部</text>
						<text :class="{active: statusIndex === 1}" @tap="changeStatus(1)">启用</text>
						<text :class="{active: statusIndex === 2}" @tap="changeStatus(2)">禁用</text>
					</view>
				</view>

				<block v-for="(user, index) in userList" :key="user.userId">

					<view class="user-card" :class="{'card-disabled': user.status === '1'}">



						<view class="user-selector" @tap="selectUser(user.userId)">
							<uni-icons :type="selectedUserIds.includes(user.userId) ? 'checkbox-filled' : 'circle'"
								size="20" :color="selectedUserIds.includes(user.userId) ? '#1890ff' : '#999'">
							</uni-icons>
						</view>

						<view class="card-header">
							<view class="user-avatar">
								<image :src="avatar" class="avatar-img" />
							</view>
							<view class="user-info">
								<view class="user-name">{{ user.nickName || user.userName }}</view>
								<view class="user-id">ID: {{ user.userId }}</view>
							</view>
							<view class="status-badge" :class="user.status === '0' ? 'active' : 'inactive'">
								{{ user.status === '0' ? '启用中' : '已禁用' }}
							</view>
						</view>

						<view class="card-content">
							<view class="info-row">
								<uni-icons type="phone" size="14" color="#666"></uni-icons>
								<text class="info-text">{{ user.phonenumber || '无手机号' }}</text>
							</view>
							<view class="info-row">
								<uni-icons type="staff" size="14" color="#666"></uni-icons>
								<text class="info-text">{{ user.dept ? user.dept.deptName : '无部门' }}</text>
							</view>
							<view class="info-row">
								<uni-icons type="calendar" size="14" color="#666"></uni-icons>
								<text class="info-text">{{ formatDate(user.createTime) }}</text>
							</view>
						</view>

						<view class="card-actions">
							<view class="action-btn" @tap="toggleUserStatus(user, index)">
								<uni-icons :type="user.status === '0' ? 'eye' : 'eye-slash'" size="18"
									:color="user.status === '0' ? '#1890ff' : '#ff4d4f'"></uni-icons>
								<text>{{ user.status === '0' ? '禁用' : '启用' }}</text>
							</view>
							<view class="action-btn" @tap="handleUpdate(user)">
								<uni-icons type="compose" size="18" color="#666"></uni-icons>
								<text>编辑</text>
							</view>
							<view class="action-btn" @tap="resetPassword(user)">
								<uni-icons type="locked" size="18" color="#666"></uni-icons>
								<text>重置密码</text>
							</view>
							<view class="action-btn" @tap="handleMore(user)">
								<uni-icons type="more" size="18" color="#666"></uni-icons>
							</view>
						</view>
					</view>
				</block>
			</block>
		</view>

		<!-- 分页组件 -->
		<view class="pagination-container" v-if="userList.length > 0">
			<uni-pagination class="pagination" :current="queryParams.pageNum" :total="total"
				:pageSize="queryParams.pageSize" @change="handlePageChange" :icon="true" />
		</view>

		<!-- 添加/编辑用户模态框 -->
		<uni-popup ref="popup" type="center" :mask-click="false" class="custom-popup">
			<view class="popup-card">
				<view class="popup-header">
					<text>{{ title }}</text>
					<uni-icons type="closeempty" size="20" color="#999" @tap="cancelPopup"></uni-icons>
				</view>

				<scroll-view scroll-y="true" class="form-container">
					<view class="form-group">
						<text class="form-label">用户名称</text>
						<input class="form-input" v-model="form.userName" placeholder="请输入用户名称"
							:disabled="!!form.userId" />
					</view>
					<view class="form-group">
						<text class="form-label">用户昵称</text>
						<input class="form-input" v-model="form.nickName" placeholder="请输入用户昵称" />
					</view>
					<view v-if="!form.userId" class="form-group">
						<text class="form-label">登录密码</text>
						<input class="form-input" v-model="form.password" placeholder="请输入登录密码" type="password" />
					</view>
					<view class="form-group">
						<text class="form-label">手机号码</text>
						<input class="form-input" v-model="form.phonenumber" placeholder="请输入手机号码" type="number" />
					</view>
					<view class="form-group">
						<text class="form-label">邮箱</text>
						<input class="form-input" v-model="form.email" placeholder="请输入邮箱" type="email" />
					</view>

					<view class="form-group">
						<text class="form-label">所属部门</text>
						<view class="picker-container" @tap="openDeptPicker">
							<text class="picker-text">{{ selectedDeptName || '请选择部门' }}</text>
							<uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
						</view>
					</view>

					<!-- 部门选择器弹窗 -->
					<uni-popup ref="deptPicker" type="bottom" class="dept-picker-popup">
						<view class="picker-content-wrapper">
							<view class="picker-header">
								<text class="picker-title">选择部门</text>
								<text class="picker-confirm" @tap="handleDeptConfirm">确定</text>
							</view>
							<scroll-view scroll-y="true" class="picker-content">
								<view class="dept-tree">
									<block v-for="(item, index) in deptTree" :key="item.id">
										<!-- 一级部门 -->
										<view class="dept-item" :style="{ paddingLeft: '20rpx' }"
											@tap.stop="selectDept(item)">
											<view class="dept-icon-wrapper" @tap.stop="toggleDeptExpand(item)">
												<uni-icons v-if="item.children && item.children.length > 0"
													:type="item.expanded ? 'minus' : 'plus'" size="16"
													color="#666"></uni-icons>
												<uni-icons v-else type="circle" size="16"
													color="transparent"></uni-icons>
											</view>
											<text class="dept-label"
												:class="{ 'dept-selected': item.id === form.deptId }">
												{{ item.label }}
											</text>
										</view>

										<!-- 二级部门 -->
										<view v-if="item.expanded && item.children && item.children.length > 0"
											class="dept-children">
											<view v-for="child in item.children" :key="child.id" class="dept-item child"
												:style="{ paddingLeft: '60rpx' }" @tap.stop="selectDept(child)">
												<view class="dept-icon-wrapper">
													<uni-icons type="circle" size="16" color="transparent"></uni-icons>
												</view>
												<text class="dept-label"
													:class="{ 'dept-selected': child.id === form.deptId }">
													{{ child.label }}
												</text>
											</view>
										</view>
									</block>
								</view>
							</scroll-view>
						</view>
					</uni-popup>


					<view class="form-group">
						<text class="form-label">状态</text>
						<text class="switch-label">{{ form.status === '0' ? '启用' : '禁用' }}</text>
						<switch class="form-switch" :checked="form.status === '0'" @change="onStatusSwitch"
							color="#1890ff" />
					</view>
				</scroll-view>

				<view class="popup-footer">
					<button class="dialog-btn" @tap="cancelPopup">取消</button>
					<button class="dialog-btn primary" @tap="submitForm">确定</button>
				</view>
			</view>
		</uni-popup>

		<!-- 重置密码弹出框 -->
		<uni-popup ref="resetPwdPopup" type="center" :mask-click="false" class="custom-popup">
			<view class="popup-card">
				<view class="popup-header">
					<text>重置密码</text>
					<uni-icons type="closeempty" size="20" color="#999" @tap="cancelResetPwd"></uni-icons>
				</view>

				<view class="form-container">
					<view class="form-group">
						<text class="form-label">新密码</text>
						<input class="form-input" v-model="newPassword" placeholder="请输入新密码" type="password" />
					</view>
					<view class="form-group">
						<text class="form-label">确认密码</text>
						<input class="form-input" v-model="confirmPassword" placeholder="请再次输入密码" type="password" />
					</view>
				</view>

				<view class="popup-footer">
					<button class="dialog-btn" @tap="cancelResetPwd">取消</button>
					<button class="dialog-btn primary" @tap="confirmResetPwd">确定</button>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script>
	import {
		listUser,
		getUser,
		addUser,
		updateUser,
		delUser,
		changeUserStatus,
		updateUserPwd,
		resetUserPwd,
		getAuthRole,
		updateAuthRole,
		deptTreeSelect // 新增部门树接口
	} from '@/api/system/user';

	export default {
		data() {
			return {
				// 新增部门相关数据
				deptTree: [],
				showDeptPicker: false,
				selectedDeptName: '',
				statusOptions: ['全部', '启用', '禁用'],
				statusIndex: 0,
				newPassword: '',
				confirmPassword: '',
				currentResetUser: null, // 当前正在重置密码的用户
				// 查询参数
				queryParams: {
					pageNum: 1,
					pageSize: 10,
					userName: undefined,
					phonenumber: undefined,
					status: undefined,
					deptId: undefined
				},
				// 用户列表数据
				userList: [],
				total: 0,
				// 加载状态
				loading: false,
				// 筛选选项
				statusOptions: ['全部', '启用', '禁用'],
				statusIndex: 0,
				// 表单数据
				form: {
					status: '0'
				},
				title: '添加用户',
				// 选中的用户ID数组
				selectedUserIds: []
			}
		},
		computed: {
			avatar() {
				return this.$store.state.user.avatar
			},
			isAllSelected() {
				return this.selectedUserIds.length === this.userList.length && this.userList.length > 0;
			},
		},
		onLoad() {
			this.getList();
		},
		methods: {
			async loadDeptTree() {
				try {
					const res = await deptTreeSelect();
					if (res.code === 200) {
						// 处理部门数据，添加必要属性
						const processNodes = (nodes, level = 0) => {
							return nodes.map(node => {
								const newNode = {
									...node,
									level,
									expanded: false // 默认不展开
								};
								if (node.children && node.children.length > 0) {
									newNode.children = processNodes(node.children, level + 1);
								}
								return newNode;
							});
						};
						this.deptTree = processNodes(res.data);

						// 默认展开第一级
						if (this.deptTree.length > 0) {
							this.deptTree[0].expanded = true;
						}
					}
				} catch (e) {
					console.error('加载部门树失败', e);
					uni.showToast({
						title: '加载部门失败',
						icon: 'none'
					});
				}
			},

			// 切换部门展开状态
			toggleDeptExpand(item) {
				item.expanded = !item.expanded;
				this.$forceUpdate();
			},

			// 选择部门
			selectDept(item) {
				this.form.deptId = item.id;
				this.selectedDeptName = item.label;
				this.$forceUpdate();
			},

			// 确认部门选择
			handleDeptConfirm() {
				this.$refs.deptPicker.close();
			},

			// 打开部门选择器
			openDeptPicker() {
				this.$refs.deptPicker.open();
				if (this.deptTree.length === 0) {
					this.loadDeptTree();
				}
			},
			toggleSelectAll() {
				if (this.isAllSelected) {
					this.selectedUserIds = [];
				} else {
					this.selectedUserIds = this.userList.map(user => user.userId);
				}
			},
			// 选择用户
			selectUser(userId) {
				const index = this.selectedUserIds.indexOf(userId);
				if (index === -1) {
					this.selectedUserIds.push(userId);
				} else {
					this.selectedUserIds.splice(index, 1);
				}
				// 添加震动反馈
				uni.vibrateShort();
			},
			// 分页变化
			handlePageChange(e) {
				this.queryParams.pageNum = e.current;
				this.getList();
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				});
			},
			handleToInfo() {
				this.$tab.navigateTo('/pages/mine/info/index')
			},
			// 密码验证（公共方法）
			validatePassword(password, confirmPassword = null) {
				// 验证密码强度
				if (!password) {
					uni.showToast({
						title: '密码不能为空',
						icon: 'none'
					});
					return false;
				}

				if (password.length < 6) {
					uni.showToast({
						title: '密码长度至少6位',
						icon: 'none'
					});
					return false;
				}

				// 验证两次密码是否一致（当需要时）
				if (confirmPassword !== null && password !== confirmPassword) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					});
					return false;
				}

				return true;
			},

			// 获取用户列表
			async getList() {
				this.loading = true;
				try {
					const res = await listUser(this.queryParams);
					if (res.code === 200) {
						this.userList = res.rows;
						this.total = res.total;
					} else {
						uni.showToast({
							title: `获取数据失败：${res.msg}`,
							icon: 'none'
						});
					}
				} finally {
					this.loading = false;
				}
			},

			// 搜索按钮
			handleQuery() {
				this.queryParams.pageNum = 1;
				this.getList();
			},

			// 重置按钮
			resetQuery() {
				this.queryParams = {
					pageNum: 1,
					pageSize: 10,
					userName: undefined,
					phonenumber: undefined,
					status: undefined,
					deptId: undefined
				};
				this.statusIndex = 0;
				this.getList();
			},

			// 状态筛选变化
			changeStatus(index) {
				this.statusIndex = index;
				if (index === 0) {
					this.queryParams.status = undefined;
				} else {
					this.queryParams.status = index - 1;
				}
				this.handleQuery();
			},

			// 切换用户状态
			async toggleUserStatus(user, index) {
				const newStatus = user.status === '0' ? '1' : '0';
				uni.showModal({
					title: '提示',
					content: `确定要${newStatus === '0' ? '启用' : '禁用'}该用户吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await changeUserStatus(user.userId, newStatus);
								this.userList[index].status = newStatus;
								uni.showToast({
									title: '状态已更新',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '状态更新失败',
									icon: 'none'
								});
								// 恢复原状态
								this.userList[index].status = user.status;
							}
						}
					}
				});
			},

			// 打开添加用户弹窗
			handleAdd() {
				this.title = '添加用户';
				this.form = {
					status: '0',
					password: '123123',
					deptId: undefined
				};
				this.selectedDeptName = '';
				this.$refs.popup.open();
			},

			// 打开编辑用户弹窗
			async handleUpdate(user) {
				try {
					const res = await getUser(user.userId);
					if (res.code === 200) {
						this.title = '编辑用户';
						this.form = res.data;
						this.selectedDeptName = res.data.dept ? res.data.dept.deptName : ''; // 部门选择 
						this.$refs.popup.open();
					} else {
						uni.showToast({
							title: res.msg || '获取用户信息失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				}
			},

			// 删除单个用户
			async handleDelete(user) {
				uni.showModal({
					title: '提示',
					content: `确定要删除用户"${user.userName}"吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await delUser(user.userId);
								this.userList = this.userList.filter(u => u.userId !== user.userId);
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 删除多个用户
			async handleDeleteMultiple() {
				if (this.selectedUserIds.length === 0) {
					uni.showToast({
						title: '请先选择要删除的用户',
						icon: 'none'
					});
					return;
				}

				uni.showModal({
					title: '提示',
					content: `确定要删除选中的${this.selectedUserIds.length}位用户吗？`,
					success: async (res) => {
						if (res.confirm) {
							try {
								await delUser(this.selectedUserIds.join(','));
								this.getList();
								this.selectedUserIds = [];
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} catch (e) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},

			// 导出按钮操作
			handleExport() {
				uni.showLoading({
					title: '导出中...'
				});
				// 这里应该调用导出API
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '导出成功',
						icon: 'success'
					});
				}, 1500);
			},

			// 导入按钮操作
			handleImport() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						console.log('选择文件成功', res);
						uni.showLoading({
							title: '导入中...'
						});
						// 这里应该调用导入API
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '导入成功',
								icon: 'success'
							});
							this.getList();
						}, 2000);
					}
				});
			},

			// 更多操作
			handleMore(user) {
				uni.showActionSheet({
					itemList: ['重置密码', '查看详情'],
					success: (res) => {
						const actionIndex = res.tapIndex;
						if (actionIndex === 0) {
							this.resetPassword(user);
						} else if (actionIndex === 1) {
							// url: `/pages/system/user/detail?id=${user.userId}`
							// 使用直接调用 showToast 的方式，不使用 navigateTo
							uni.showToast({
								title: '模块建设中~',
								icon: 'none'
							});
						}
					}
				});
			},

			// 重置密码
			resetPassword(user) {
				this.currentResetUser = user;
				this.newPassword = '';
				this.confirmPassword = '';
				this.$refs.resetPwdPopup.open();
			},

			// 确认重置密码
			async confirmResetPwd() {
				// 使用公共密码验证方法
				if (!this.validatePassword(this.newPassword, this.confirmPassword)) return;

				try {
					await resetUserPwd(this.currentResetUser.userId, this.newPassword);
					this.$refs.resetPwdPopup.close();
					this.currentResetUser = null;
					uni.showToast({
						title: '密码重置成功',
						icon: 'success'
					});
				} catch (e) {
					uni.showToast({
						title: '密码重置失败',
						icon: 'none'
					});
				}
			},

			// 取消重置密码
			cancelResetPwd() {
				this.$refs.resetPwdPopup.close();
				this.currentResetUser = null;
			},

			// 状态切换
			onStatusSwitch(e) {
				this.form.status = e.detail.value ? '0' : '1';
			},

			// 提交表单
			async submitForm() {
				// 表单验证
				if (!this.validateForm()) return;

				try {
					let res;
					if (this.form.userId) {
						res = await updateUser(this.form);
					} else {
						res = await addUser(this.form);
					}

					if (res.code === 200) {
						this.$refs.popup.close();
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						this.getList();
					} else {
						uni.showToast({
							title: res.msg || '保存失败',
							icon: 'none'
						});
					}
				} catch (e) {
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					});
					console.error('保存用户失败', e);
				}
			},

			// 表单验证
			validateForm() {
				// 通用验证规则（适用于新增和编辑）
				if (!this.form.userName) {
					uni.showToast({
						title: '用户名不能为空',
						icon: 'none'
					});
					return false;
				}

				if (!this.form.nickName) {
					uni.showToast({
						title: '用户昵称不能为空',
						icon: 'none'
					});
					return false;
				}

				// 新增用户时的密码验证（使用公共方法）
				if (!this.form.userId) {
					if (!this.validatePassword(this.form.password)) {
						return false;
					}
				}

				// 手机号格式验证（可选）
				if (this.form.phonenumber && !/^1[3-9]\d{9}$/.test(this.form.phonenumber)) {
					uni.showToast({
						title: '请输入正确的手机号码',
						icon: 'none'
					});
					return false;
				}

				// 邮箱格式验证（可选）
				if (this.form.email && !/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(this.form.email)) {
					uni.showToast({
						title: '请输入正确的邮箱地址',
						icon: 'none'
					});
					return false;
				}

				return true;
			},

			// 关闭弹窗
			cancelPopup() {
				this.$refs.popup.close();
			},

			// 格式化日期
			formatDate(dateString) {
				if (!dateString) return '';
				const date = new Date(dateString);
				return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			},

			// 选择用户
			selectUser(userId) {
				const index = this.selectedUserIds.indexOf(userId);
				if (index === -1) {
					this.selectedUserIds.push(userId);
				} else {
					this.selectedUserIds.splice(index, 1);
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	/* 引入共享样式 */
	@import "@/static/scss/common.scss";

	/* 部门选择器样式 - 与主样式一致 */
	.dept-picker-popup {
		background-color: rgba(0, 0, 0, 0.5);

		.picker-content-wrapper {
			background-color: #fff;
			border-radius: 24rpx 24rpx 0 0;
			width: 100%;
			max-width: 650rpx;
			/* 与popup-card宽度一致 */
			margin: 0 auto;
			max-height: 70vh;
			box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);

			.picker-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 28rpx 32rpx;
				border-bottom: 1rpx solid $border-color;

				.picker-title {
					font-size: 32rpx;
					font-weight: 500;
					color: $text-color;
				}

				.picker-confirm {
					color: $primary-color;
					font-size: 30rpx;
				}
			}

			.picker-content {
				max-height: calc(70vh - 120rpx);
				padding: 20rpx 0;
			}

			.dept-tree {
				.dept-item {
					display: flex;
					align-items: center;
					padding: 24rpx 32rpx;
					min-height: 88rpx;
					transition: background-color 0.3s;

					&:active {
						background-color: $bg-color;
					}

					&.child {
						background-color: $bg-color;
					}

					.dept-icon-wrapper {
						margin-right: 20rpx;
						display: flex;
						align-items: center;
					}

					.dept-label {
						flex: 1;
						font-size: 30rpx;
						color: $text-color;

						&.dept-selected {
							color: $primary-color;
							font-weight: 500;
						}
					}
				}

				.dept-children {
					background-color: $bg-color;
				}
			}
		}
	}

	/* 部门选择输入框样式 - 与表单输入框一致 */
	.picker-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 24rpx;
		height: 80rpx;
		background: #f5f7fa;
		border-radius: 12rpx;
		border: 1px solid $border-color;
		transition: all 0.3s;

		&:active {
			border-color: $primary-color;
			box-shadow: 0 0 0 2rpx rgba($primary-color, 0.2);
		}

		.picker-text {
			font-size: 28rpx;
			color: $text-color;

			&:empty::after {
				content: '请选择部门';
				color: $text-light;
			}
		}
	}
</style>