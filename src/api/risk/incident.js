import request from '@/utils/request'

// 查询事件列表
export function listIncident(data) {
    return request({
        url: '/incident/list',
        method: 'post',
        data: data
    })
}

// 查询事件详情
export function getIncident(id) {
    return request({
        url: '/incident/detail',
        method: 'get',
        params: { id: id }
    })
}

// 新增事件
export function addIncident(data) {
    return request({
        url: '/incident/insert',
        method: 'post',
        data: data
    })
}

// 修改事件
export function updateIncident(data) {
    return request({
        url: '/incident',
        method: 'post',
        data: data
    })
}

// 删除事件
export function delIncident(id) {
    return request({
        url: `/incident/${id}`,
        method: 'delete'
    })
}

// 解析请求数据
export function parsePayload(data) {
    return request({
        url: '/incident/parse',
        method: 'post',
        data: data
    })
}