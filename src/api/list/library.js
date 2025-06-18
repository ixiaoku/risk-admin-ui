import request from '@/utils/request'

// 查询名单库列表
export function listListLibrary(data) {
  return request({
    url: '/list/library/list',
    method: 'post',
    data: data
  })
}

// 查询名单库详情
export function detail(id) {
  return request({
    url:  '/list/library/detail/',
    method: 'get',
    params: { id }
  })
}

// 新增名单库
export function addListLibrary(data) {
  return request({
    url: '/list/library/insert',
    method: 'post',
    data: data
  })
}

// 修改名单库
export function updateListLibrary(data) {
  return request({
    url: '/list/library/update',
    method: 'post',
    data: data
  })
}

// 删除名单库
export function delListLibrary(id) {
  return request({
    url: '/list/library/delete' + id,
    method: 'post'
  })
}
