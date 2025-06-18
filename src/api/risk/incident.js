import request from '@/utils/request'

// 查询事件列表
export function listIncident(query) {
    return request({
        url: '/system/incident/list',
        method: 'get',
        params: query
    })
}

// 查询事件详情
export function getIncident(id) {
    return request({
        url: `/system/incident/${id}`,
        method: 'get'
    })
}

// 新增事件
export function addIncident(data) {
    return request({
        url: '/system/incident/insert',
        method: 'post',
        data: data
    })
}

// 修改事件
export function updateIncident(data) {
    return request({
        url: '/system/incident',
        method: 'put',
        data: data
    })
}

// 删除事件
export function delIncident(id) {
    return request({
        url: `/system/incident/${id}`,
        method: 'delete'
    })
}

// 解析请求数据
export function parsePayload(data) {
    return request({
        url: '/system/incident/parse',
        method: 'post',
        data: data
    })
}