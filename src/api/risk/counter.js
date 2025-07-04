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
        url: '/metric/counter/update',
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