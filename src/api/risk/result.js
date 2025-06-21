import request from '@/utils/request'

// 查询风控结果列表
export function listEngineResult(data) {
    return request({
        url: '/engine/result/list',
        method: 'post',
        data: data
    })
}

// 查询看板数据
export function getDashboard(data) {
    return request({
        url: '/engine/result/dashboard',
        method: 'post',
        data: data
    })
}

// 查询快照
export function getSnapshot(data) {
    return request({
        url: '/engine/result/snapshot',
        method: 'post',
        data: data
    })
}

// 复现
export function replayIncident(data) {
    return request({
        url: '/engine/result/replay',
        method: 'post',
        data: data
    })
}

// 获取动态字典（事件、规则、处置方式）
export function getDictOptionsByDb(data) {
    return request({
        url: '/dict/options/db',
        method: 'get',
        params: data
    })
}

// 获取动态字典（事件、规则、处置方式）
export function getDictOptions(data) {
    return request({
        url: '/dict/options',
        method: 'get',
        params: data
    })
}