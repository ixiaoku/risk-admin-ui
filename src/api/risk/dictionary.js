import request from '@/utils/request'

// 获取动态字典（事件、规则、处置方式）
export function getDictOptionsByDb(data) {
    return request({
        url: '/dict/options/db',
        method: 'post',
        data: data
    })
}

// 获取动态字典（事件、规则、处置方式）
export function getDictOptions(data) {
    return request({
        url: '/dict/options',
        method: 'post',
        data: data
    })
}