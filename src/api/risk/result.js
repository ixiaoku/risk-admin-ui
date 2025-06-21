import request from '@/utils/request'

// 查询风控结果列表
export function listEngineResult(query) {
    return request({
        url: '/engine/result/list',
        method: 'get',
        params: query
    })
}

// 查询看板数据
export function getDashboard(query) {
    return request({
        url: '/engine/result/dashboard',
        method: 'get',
        params: query
    })
}

// 查询快照
export function getSnapshot(query) {
    return request({
        url: '/engine/result/snapshot',
        method: 'get',
        params: query
    })
}

// 复现
export function replayIncident(query) {
    return request({
        url: '/engine/result/replay',
        method: 'get',
        params: query
    })
}

// 获取动态字典（事件、规则、处置方式）
export function getDictOptions(data) {
    return request({
        url: '/dict/options/db',
        method: 'get',
        params: data
    })
}