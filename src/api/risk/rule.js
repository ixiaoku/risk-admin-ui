import request from '@/utils/request'

// 查询规则列表
export function listRule(data) {
    return request({
        url: '/rule/list',
        method: 'post',
        data: data
    })
}

// 查询规则详情
export function getRule(id) {
    return request({
        url: '/rule/detail',
        method: 'get',
        params: {id}
    })
}

// 新增规则
export function addRule(data) {
    return request({
        url: '/rule/insert',
        method: 'post',
        data: data
    })
}

// 修改规则
export function updateRule(data) {
    return request({
        url: '/rule/update',
        method: 'post',
        data: data
    })
}

// 删除规则
export function delRule(id) {
    return request({
        url: '/rule/delete',
        method: 'post',
        params: {id}
    })
}

// 获取动态字典（事件、指标、处置方式）
export function getDictOptions(data) {
    return request({
        url: '/dict/options/db',
        method: 'get',
        params: data
    })
}