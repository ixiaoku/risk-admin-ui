import request from '@/utils/request'

// 查询计数器指标列表
export function listMetric(data) {
    return request({
        url: '/metric/counter/list',
        method: 'post',
        data: data
    })
}

// 查询计数器指标详情
export function getMetric(id) {
    return request({
        url: '/metric/counter/detail',
        method: 'get',
        params: { id }
    })
}

// 新增计数器指标
export function addMetric(data) {
    return request({
        url: '/metric/counter/insert',
        method: 'post',
        data: data
    })
}

// 修改计数器指标
export function updateMetric(data) {
    return request({
        url: '/metric/counter',
        method: 'post',
        data: data
    })
}

// 删除计数器指标
export function delMetric(id) {
    return request({
        url: '/metric/counter/delete',
        method: 'post',
        params: { id }
    })
}

// 获取动态字典（事件、属性指标）
export function getDictOptions(param) {
    return request({
        url: '/dict/options/db',
        method: 'get',
        params: param
    })
}