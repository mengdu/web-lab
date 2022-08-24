const CACHE_NAME = 'my-cache-v1'
self.addEventListener('install', event => {
    // 调试时跳过等待过程
    self.skipWaiting()
    console.log('install')
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll([
                    // 枚举需要缓存的文件，不同域名的也行（要支持跨域）
                ]);
            })
    );
})

//sw激活阶段,说明上一sw已失效
self.addEventListener('activate', function(event) {
    console.log('activate')

    // // 清除一些旧的缓存
    // event.waitUntil(
    //     caches.keys().then(function(keyList) {
    //     return Promise.all(keyList.map(function(key) {
    //         return caches.delete(key);
    //     }));
    //     })
    // );
})

self.addEventListener('fetch', (event) => {
    console.log('fetch', event.request)
    // network first
    event.respondWith(fetch(event.request).then(res => {
        const cresult = res.clone()
        caches.open(CACHE_NAME).then(cache => {
            return cache.put(event.request, cresult)
        }).catch(err => {
            console.error('缓存失败:', err)
        })
        return res
    }).catch(err => {
        console.log("请求失败了", err)
        return caches.match(event.request).then(result => {
            console.log(`${event.request.url} 缓存结果`, result)
            if (result) return result
            throw err
        })
    }))

    // // cache first
    // event.respondWith(caches.match(event.request).then(result => {
    //     console.log(`${event.request.url} 缓存结果`, result)
    //     if (result) return result
    //     return fetch(event.request).then(res => {
    //         return caches.open(CACHE_NAME).then(cache => {
    //             return cache.put(event.request, res.clone()).then(() => res)
    //         })
    //     })
    // }))
})
