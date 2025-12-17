/**
 * HTTP 请求工具模块
 *
 * 基于 Axios 封装的 HTTP 请求工具
 * 包含请求/响应拦截器、错误处理和统一的请求方法
 */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

// ============ 类型定义 ============

/**
 * API 响应数据接口
 *
 * 标准的后端响应格式
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message: string
}

// ============ Axios 实例配置 ============

/**
 * 创建 Axios 实例
 *
 * 配置了基础 URL、超时时间和默认请求头
 */
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// ============ 请求拦截器 ============

/**
 * 请求拦截器
 *
 * 在请求发送前添加认证信息等
 */
service.interceptors.request.use(
  (config) => {
    // 添加 token 等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// ============ 响应拦截器 ============

/**
 * 响应拦截器
 *
 * 统一处理响应数据和错误
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data

    // 根据实际业务调整状态码判断
    if (res.code !== 200 && res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 返回原始响应，后续请求封装会取 response.data
    return response
  },
  (error: AxiosError) => {
    console.error('响应错误：', error)

    let message = '网络请求失败'
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误，未找到该资源'
          break
        case 500:
          message = '服务器错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `连接错误${error.response.status}`
      }
    } else if (error.message.includes('timeout')) {
      message = '请求超时，请稍后重试'
    } else if (error.message.includes('Network Error')) {
      message = '网络连接错误'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// ============ 请求方法封装 ============

/**
 * 请求方法封装对象
 *
 * 提供 GET、POST、PUT、DELETE 等常用 HTTP 方法
 * 自动提取响应数据，支持泛型类型推断
 */
export const request = {
  /**
   * GET 请求
   *
   * @param url - 请求 URL
   * @param params - URL 参数
   * @param config - Axios 配置
   * @returns Promise<T> - 响应数据
   */
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, { params, ...config }).then((r: AxiosResponse) => r.data)
  },

  /**
   * POST 请求
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - Axios 配置
   * @returns Promise<T> - 响应数据
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config).then((r: AxiosResponse) => r.data)
  },

  /**
   * PUT 请求
   *
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - Axios 配置
   * @returns Promise<T> - 响应数据
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config).then((r: AxiosResponse) => r.data)
  },

  /**
   * DELETE 请求
   *
   * @param url - 请求 URL
   * @param params - URL 参数
   * @param config - Axios 配置
   * @returns Promise<T> - 响应数据
   */
  delete<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, { params, ...config }).then((r: AxiosResponse) => r.data)
  }
}

/** 导出 Axios 实例 */
export default service
