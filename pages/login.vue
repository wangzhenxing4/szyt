<template>
  <view class="auth-container">
    <!-- 欢迎页面 -->
    <view v-if="currentPage === 'welcome'" class="welcome-section">
      <view class="brand-section">
        <image class="app-logo" :src="globalConfig.appInfo.logo" mode="aspectFit" />
        <view class="app-name-container">
          <text class="app-name">山职云台</text>
		  <br>
          <text class="app-subtitle">校园生活 · 尽在掌握</text>
        </view>
      </view>
      
      
      <view class="action-section">
        <button class="auth-button primary" @click="setCurrentPage('login')">
          <uni-icons type="person" size="20" color="#fff"></uni-icons>
          <text>登录账号</text>
        </button>
        <button class="auth-button secondary" @click="setCurrentPage('register')">
          <uni-icons type="personadd" size="20" color="#fff"></uni-icons>
          <text>注册账号</text>
        </button>
        <button class="auth-button guest" @click="handleGuestLogin">
          <uni-icons type="eye" size="20" color="#333"></uni-icons>
          <text>访客体验</text>
        </button>
      </view>
      
      <view class="terms-section">
        <text>登录即代表同意</text>
        <text class="link" @click="handleUserAgrement">《用户协议》</text>
        <text>和</text>
        <text class="link" @click="handlePrivacy">《隐私政策》</text>
      </view>
    </view>
    
    <!-- 登录页面 -->
    <view v-else-if="currentPage === 'login'" class="login-section">
      <view class="header">
        <uni-icons 
          class="back-icon" 
          type="arrowleft" 
          size="24" 
          color="#333"
          @click="setCurrentPage('welcome')"
        />
        <text class="title">账号登录</text>
      </view>
      
      <view class="form-container">
        <view class="input-field floating-label">
          <uni-icons class="input-icon" type="person" size="20" color="#999" />
          <input 
            v-model="loginForm.username" 
            class="input" 
            type="text" 
            placeholder=" " 
			:type="showLoginUser" 
            maxlength="30" 
          />
          <label class="floating-label-text">用户名</label>
        </view>
        
        <view class="input-field floating-label">
          <uni-icons class="input-icon" type="locked" size="20" color="#999" />
          <input 
            v-model="loginForm.password" 
            class="input" 
            :type="showLoginPassword ? 'text' : 'password'" 
            placeholder=" " 
            maxlength="20" 
          />
          <label class="floating-label-text">密码</label>
          <uni-icons 
            class="password-toggle" 
            :type="showLoginPassword ? 'eye' : 'eyeclosed'" 
            size="20" 
            color="#999"
            @click="showLoginPassword = !showLoginPassword"
          />
        </view>
        
        <view v-if="captchaEnabled" class="captcha-section">
          <view class="input-field floating-label captcha-input">
            <uni-icons class="input-icon" type="eye" size="20" color="#999" />
            <input 
              v-model="loginForm.code" 
              class="input" 
              type="number" 
              placeholder=" " 
              maxlength="4" 
            />
            <label class="floating-label-text">验证码</label>
          </view>
          <image :src="codeUrl" @click="getCode" class="captcha-img" />
        </view>
        
        <view class="forgot-section">
          <view class="remember-me">
            <!-- <checkbox :checked="rememberMe" @click="rememberMe = !rememberMe" color="#FF6B8B" />
            <text>记住我</text> -->
          </view>
          <text class="forgot-password" @click="handleForgotPassword">忘记密码?</text>
        </view>
        
        <button class="login-button" @click="handleLogin">
          <text>登 录</text>
          
        </button>
        
        <view class="alternative-options">
          <text class="alternative-text">其他登录方式</text>
          <view class="oauth-buttons">
            <button class="oauth-button wechat" @click="handleWechatLogin">
              <uni-icons type="weixin" size="24" color="#fff" />
            </button>
            <button class="oauth-button qq" @click="handleQQLogin">
              <uni-icons type="qq" size="24" color="#fff" />
            </button>
            <button class="oauth-button mobile" @click="handleMobileLogin">
              <uni-icons type="phone" size="24" color="#fff" />
            </button>
          </view>
        </view>
      </view>
      
      <view class="register-link">
        <text>还没有账号?</text>
        <text class="register-text" @click="setCurrentPage('register')">立即注册</text>
      </view>
    </view>
    
    <!-- 注册页面 -->
    <view v-else-if="currentPage === 'register'" class="register-section">
      <view class="header">
        <uni-icons 
          class="back-icon" 
          type="arrowleft" 
          size="24" 
          color="#333"
          @click="setCurrentPage('welcome')"
        />
        <text class="title">注册账号</text>
      </view>
      
      <view class="form-container">
        <view class="input-field floating-label">
          <uni-icons class="input-icon" type="person" size="20" color="#999" />
          <input 
            v-model="registerForm.username" 
            class="input" 
            type="text" 
            placeholder=" " 
            maxlength="30" 
			:type="showLoginUser" 
          />
          <label class="floating-label-text" >设置用户名</label>
        </view>
        
        
        <view class="input-field floating-label">
          <uni-icons class="input-icon" type="locked" size="20" color="#999" />
          <input 
            v-model="registerForm.password" 
            class="input" 
            :type="showRegisterPassword ? 'text' : 'password'" 
            placeholder=" " 
            maxlength="20" 
          />
          <label class="floating-label-text">设置密码</label>
          <uni-icons 
            class="password-toggle" 
            :type="showRegisterPassword ? 'eye' : 'eyeclosed'" 
            size="20" 
            color="#999"
            @click="showRegisterPassword = !showRegisterPassword"
          />
        </view>
        
        <view class="input-field floating-label">
          <uni-icons class="input-icon" type="locked" size="20" color="#999" />
          <input 
            v-model="registerForm.confirmPassword" 
            class="input" 
            :type="showRegisterPassword ? 'text' : 'password'" 
            placeholder=" " 
            maxlength="20" 
          />
          <label class="floating-label-text">确认密码</label>
        </view>
        
        <view class="register-agreement">
          <text>我已阅读并同意</text>
          <text class="link" @click="handleUserAgrement">《用户协议》</text>
          <text>和</text>
          <text class="link" @click="handlePrivacy">《隐私政策》</text>
        </view>
        
        <button class="register-button" @click="handleRegister">
          <text>立即注册</text>
          <uni-icons type="arrowright" size="20" color="#fff"></uni-icons>
        </button>
      </view>
      
      <view class="login-link">
        <text>已有账号?</text>
        <text class="login-text" @click="setCurrentPage('login')">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script>
  import { getCodeImg, register } from '@/api/login'
  
  export default {
    data() {
      return {
        currentPage: 'welcome',
        // 修复问题1：区分登录和注册页面的密码显示状态
        showLoginPassword: false, 
        showLoginUser: false, 
        showRegisterPassword: false,
        rememberMe: false,
        codeUrl: "",
        captchaEnabled: true,
        globalConfig: getApp().globalData.config,
        loginForm: {
          username: "",
          password: "",
          code: "",
          uuid: ""
        },
        registerForm: {
          username: "",
          password: "",
          confirmPassword: ""
        }
      }
    },
    created() {
      this.getCode()
    },
    methods: {
      setCurrentPage(page) {
        this.currentPage = page
      },
      
      handleGuestLogin() {
        this.loginForm.username = "访客"
        this.loginForm.password = "123123"
        this.$modal.loading("登录中，请耐心等待...")
        this.pwdLogin()
      },
      
      // 修复问题3：添加注册表单验证
      handleRegister() {
        const { username, password, confirmPassword } = this.registerForm;
        
        // 非空验证
        if (!username || !password || !confirmPassword) {
          this.$modal.msgError("请填写完整信息");
          return;
        }
        
        // 用户名长度验证
        if (username.length < 2 || username.length > 30) {
          this.$modal.msgError("用户名长度需在2-30位之间");
          return;
        }
        
        // 密码长度验证
        if (password.length < 6 || password.length > 20) {
          this.$modal.msgError("密码长度需在6-20位之间");
          return;
        }
        
        // 密码一致性验证
        if (password !== confirmPassword) {
          this.$modal.msgError("两次输入的密码不一致");
          return;
        }

        
        // 调用注册API
        this.$modal.loading("注册中，请稍后...")
        register(this.registerForm).then(res => {
          this.$modal.closeLoading();
          this.$modal.msgSuccess("注册成功，请登录");
          this.setCurrentPage('login');
          
          // 清空表单
          this.registerForm = {
            username: "",
            password: "",
            confirmPassword: ""
          };
        }).catch(err => {
          this.$modal.closeLoading();
          this.$modal.msgError("注册失败：" + (err.message || "请检查输入信息"));
        });
      },
      
      handleForgotPassword() {
        this.$modal.msg("正在开发中")
      },
      
      handleWechatLogin() {
        this.$modal.msg("微信登录功能")
      },
      
      handleQQLogin() {
        this.$modal.msg("QQ登录功能")
      },
      
      handleMobileLogin() {
        this.$modal.msg("手机快捷登录")
      },
      
      handlePrivacy() {
        let site = this.globalConfig.appInfo.agreements[0]
        this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
      },
      
      handleUserAgrement() {
        let site = this.globalConfig.appInfo.agreements[1]
        this.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
      },
      
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = 'data:image/gif;base64,' + res.img
            this.loginForm.uuid = res.uuid
          }
        })
      },
      
      async handleLogin() {
        if (this.loginForm.username === "") {
          this.$modal.msgError("请输入账号")
        } else if (this.loginForm.password === "") {
          this.$modal.msgError("请输入密码")
        } else if (this.loginForm.code === "" && this.captchaEnabled) {
          this.$modal.msgError("请输入验证码")
        } else {
          this.$modal.loading("登录中，请耐心等待...")
          this.pwdLogin()
        }
      },
      
      async pwdLogin() {
        this.$store.dispatch('Login', this.loginForm).then(() => {
          this.$modal.closeLoading()
          this.loginSuccess()
        }).catch(() => {
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
      },
      
      loginSuccess(result) {
        this.$store.dispatch('GetInfo').then(res => {
          this.$tab.reLaunch('/pages/index')
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  /* 保持原有样式不变 */
  .auth-container {
    height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f0 100%);
    display: flex;
    flex-direction: column;
    padding: 40rpx;
    font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
    
    .welcome-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding-top: 80rpx;
      animation: fadeIn 0.6s ease-out;
      
      .brand-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 60rpx;
        
        .app-logo {
          width: 180rpx;
          height: 180rpx;
          border-radius: 36rpx;
          margin-bottom: 30rpx;
          box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.1);
          background: white;
          padding: 16rpx;
        }
        
        .app-name-container {
          text-align: center;
          
          .app-name {
            font-size: 56rpx;
            font-weight: 800;
            color: #FF6B8B;
            margin-bottom: 12rpx;
            letter-spacing: 2rpx;
            background: linear-gradient(135deg, #FF6B8B 0%, #FF8E53 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .app-subtitle {
            font-size: 32rpx;
            color: #5A6B8C;
            font-weight: 400;
          }
        }
      }
      
      
      .action-section {
        width: 100%;
        
        .auth-button {
          height: 100rpx;
          border-radius: 50rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 34rpx;
          margin-bottom: 30rpx;
          border: none;
          box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
          transition: all 0.3s ease;
          
          uni-icons {
            margin-right: 15rpx;
          }
          
          &.primary {
            background: linear-gradient(135deg, #FF6B8B 0%, #FF8E53 100%);
            color: white;
            
            &:active {
              transform: translateY(4rpx);
              box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
            }
          }
          
          &.secondary {
            background: linear-gradient(135deg, #5E72E4 0%, #825EE4 100%);
            color: white;
            
            &:active {
              transform: translateY(4rpx);
              box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
            }
          }
          
          &.guest {
            background: white;
            color: #5A6B8C;
            border: 1px solid #E0E6ED;
            
            &:active {
              transform: translateY(4rpx);
              box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.08);
            }
          }
        }
      }
      
      .terms-section {
        font-size: 26rpx;
        color: #A0A8B8;
        padding: 30rpx 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        
        .link {
            color: #5E72E4;
            margin: 0 8rpx;
            font-weight: 500;
        }
      }
    }
    
    .login-section, .register-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.5s ease-out;
      
      .header {
        display: flex;
        align-items: center;
        padding: 30rpx 0;
        margin-bottom: 40rpx;
        
        .back-icon {
          padding: 15rpx;
          background: #F0F4F9;
          border-radius: 50%;
          width: 60rpx;
          height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
        }
        
        .title {
          font-size: 44rpx;
          font-weight: 700;
          color: #5A6B8C;
          margin-left: 20rpx;
          letter-spacing: 1rpx;
        }
      }
      
      .form-container {
        background: white;
        border-radius: 32rpx;
        padding: 50rpx 40rpx;
        box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
        
        .input-field {
          margin-bottom: 50rpx;
          position: relative;
          border-bottom: 1px solid #E0E6ED;
          padding-bottom: 20rpx;
          
          .input-icon {
            position: absolute;
            left: 0;
            top: 12rpx;
          }
          
          .input {
            width: 100%;
            font-size: 32rpx;
            height: 70rpx;
            color: #2D3748;
            padding-left: 60rpx;
            padding-top: 20rpx;
            background: transparent;
            border: none;
            outline: none;
            
            &:focus + .floating-label-text,
            &:not(:placeholder-shown) + .floating-label-text {
              transform: translateY(-25px) scale(0.85);
              color: #999;
            }
          }
          
          .password-toggle {
            position: absolute;
            right: 0;
            top: 22rpx;
          }
          
          .floating-label-text {
            position: absolute;
            left: 60rpx;
            top: 28rpx;
            font-size: 32rpx;
            color: #A0A8B8;
            pointer-events: none;
            transition: all 0.3s ease;
          }
        }
        
        .captcha-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 50rpx;
          
          .captcha-input {
            width: 60%;
            border-bottom: none;
            padding-right: 30rpx;
          }
          
          .captcha-img {
            width: 250rpx;
            height: 80rpx;
            border-radius: 16rpx;
            background: #F8FAFC;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
          }
        }
        
        .forgot-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 60rpx;
          
          .remember-me {
            display: flex;
            align-items: center;
            
            text {
              font-size: 28rpx;
              color: #5A6B8C;
              margin-left: 15rpx;
            }
          }
          
          .forgot-password {
            font-size: 28rpx;
            color: #FF6B8B;
            font-weight: 500;
          }
        }
        
        .login-button, .register-button {
          background: linear-gradient(135deg, #FF6B8B 0%, #FF8E53 100%);
          color: white;
          height: 100rpx;
          border-radius: 50rpx;
          font-size: 36rpx;
          font-weight: 600;
          margin: 40rpx 0;
          box-shadow: 0 8rpx 24rpx rgba(255, 107, 139, 0.4);
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          
          uni-icons {
            margin-left: 15rpx;
            transition: transform 0.3s ease;
          }
          
          &:active {
            transform: scale(0.98);
            
            uni-icons {
              transform: translateX(10rpx);
            }
          }
          
          &[disabled] {
            opacity: 0.7;
          }
        }
        
        .alternative-options {
          margin-top: 80rpx;
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .alternative-text {
            font-size: 28rpx;
            color: #A0A8B8;
            position: relative;
            margin-bottom: 40rpx;
            
            &::before, &::after {
              content: '';
              position: absolute;
              top: 50%;
              width: 120rpx;
              height: 1px;
              background: #E0E6ED;
            }
            
            &::before {
              right: 110%;
            }
            
            &::after {
              left: 110%;
            }
          }
          
          .oauth-buttons {
            display: flex;
            justify-content: center;
            width: 100%;
            
            .oauth-button {
              width: 90rpx;
              height: 90rpx;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 30rpx;
              border: none;
              box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
              transition: transform 0.3s ease;
              
              &:active {
                transform: scale(0.9);
              }
              
              &.wechat {
                background: #07c160;
              }
              
              &.qq {
                background: #12B7F5;
              }
              
              &.mobile {
                background: #FF6B8B;
              }
            }
          }
        }
      }
      
      .register-link, .login-link {
        display: flex;
        justify-content: center;
        font-size: 30rpx;
        color: #5A6B8C;
        padding: 40rpx 0;
        
        .register-text, .login-text {
          color: #FF6B8B;
          margin-left: 15rpx;
          font-weight: 600;
        }
      }
    }
    
    .register-section {
      .form-container {
        .register-agreement {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          font-size: 26rpx;
          color: #5A6B8C;
          margin: 40rpx 0;
          
          text {
            margin-right: 8rpx;
          }
          
          .link {
            color: #5E72E4;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(40rpx); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(40rpx); }
    to { opacity: 1; transform: translateX(0); }
  }
</style>