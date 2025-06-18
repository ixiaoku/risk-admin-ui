import axios from 'axios';
import {ElMessage} from "element-plus";

// 创建axios实例
const instance = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL || '/api', // 从环境变量读取，默认为 /api
    timeout: 10000, // 请求超时时间（毫秒）
    headers: {
        'Content-Type': 'application/json' // 默认使用JSON格式
    },
    paramsSerializer: params => {
        // 自定义序列化，将数组转为多值参数
        return Object.keys(params)
            .map(key => {
                if (Array.isArray(params[key])) {
                    return params[key].map(val => `${key}=${encodeURIComponent(val)}`).join('&');
                }
                return `${key}=${encodeURIComponent(params[key])}`;
            })
            .join('&');
    }
});

// 请求拦截器（可选，用于添加token等）
instance.interceptors.request.use(
    config => {
        // 可在此添加请求头，如token
        return config;
    },
    error => Promise.reject(error)
);

// 响应拦截器（统一处理响应）
instance.interceptors.response.use(
    response => {
        const res = response.data;
        if (res.code !== 200) {
            ElMessage.error(res.message || '请求失败');
            return Promise.reject(new Error(res.message || '请求失败'));
        }
        return res.data;
    },
    error => {
        // 网络错误 或 服务端返回非 2xx 状态码
        const msg = error.response?.data?.message || error.message || '网络异常';
        ElMessage.error(msg);
        return Promise.reject(error);
    }
);

// 封装GET请求
export function get(url, params = {}) {
    return instance.get(url, { params });
}

// 封装POST请求
export function post(url, data = {}) {
    return instance.post(url, data);
}

export default instance;