// 主程序
require('../lib/json2');
require('../lib/md5');
require('../lib/url');
require('../lib/ua-parser');

setTimeout(function(){
    "use strict";

    // 访问日志提交地址
    var LogSubmitUrl = '//:tongji.domain.com/access/'

    // 热力图信息提交地址
    var HotmapSubmitUrl = '//:tongji.domain.com/hotmap/'

    // 用户标识变量名
    var SessionID = 'hd_uid'

    // 被统计网站的站点ID
    var SiteId = getSiteId()

    /*
    var SearchEngines = {
        'baidu': ['www.baidu.com', 'zhidao.baidu.com', 'image.baidu.com', 'v.baidu.com'],
        'google': ['www.google.com', 'www.google.com.hk'],
        'yahoo': ['www.yahoo.com'],
        'bing': ['www.bing.com', 'cn.bing.com'],
        'sogou': ['www.sogou.com'],
        '360': ['www.so.com'],
        'sm': ['sm.cn']
    }
    */
    var SearchEngines = {
        'www.baidu.com': 'baidu',
        'zhidao.baidu.com': 'baidu',
        'image.baidu.com': 'baidu',
        'v.baidu.com': 'baidu',

        'www.google.com': 'google',
        'www.google.com.hk': 'google',

        'www.yahoo.com': 'yahoo',

        'www.bing.com': 'bing',
        'cn.bing.com': 'bing',

        'www.sogou.com': 'sogou',

        'www.so.com': '360',

        'sm.cn': 'sm'
    }
/*
 os  : 操作系统
 osv : 操作系统版本
 bs  : 浏览器
 bsv : 浏览器版本
 ie  : IE6/7/8等
 swh : 分辨率
 ce  : 是否开启cookie，1是 0否
 lg  : 语言
 ft  : 第一次访问时间，单位秒
 rt  : 当次访问时间，单位秒
 j   : 是否支持java
 tit : 网页标题
 ref : Referer
 c   : 颜色
 cp  : 点击统计， [{x: 0, y: 1, u:'url'}]
 cn  : 日志提交次数
 srt : 来源类型(direct:直接访问  搜索引擎域名:搜索引擎  other:外部链接)
 kw  : 搜索关键词
*/

function init() {
    var now = Math.round(new Date / 1000) // 当前时间，单位 秒
    var data
    if (/(MSIE [678])/i.test(navigator.userAgent)) {
        data = {
            os: 'Windows'
            , osv: '6.0'
            , bs: 'IE'
            , bsv: '6.0'
            , swh: screen.width + "," + screen.height
            , ce: cookie.enabled() ? 1 : 0
            , lg: navigator.language
            , ft: now
            , rt: now
            , j: navigator.javaEnabled()
            , tit: document.title
            , ref: document.referrer
            , url: location.href
            , wsc: window.screen.colorDepth || 0
            , cn: 0
            , srt: getSearchEngineType()
            , kw: ''
        }
    } else {
        var parser = new window.UAParser()
        var ua = parser.getResult()
        log(ua)
        data = {
            os: ua.os.name
            , osv: ua.os.version
            , bs: ua.browser.name
            , bsv: ua.browser.version
            , swh: screen.width + "," + screen.height
            , ce: cookie.enabled() ? 1 : 0
            , lg: navigator.language
            , ft: now
            , rt: now
            , j: navigator.javaEnabled()
            , tit: document.title
            , ref: document.referrer
            , url: location.href
            , wsc: window.screen.colorDepth || 0
            , dvm: ua.device.model
            , dvt: ua.device.type
            , dvv: ua.device.vendor
            , egn: ua.engine.name
            , egv: ua.engine.version
            , cn: 0
            , srt: getSearchEngineType()
            , kw: ''
        } 
    }

    if (/(MSIE 6)/i.test(navigator.userAgent)) {
        data.bsv = '6.0'
        data.ie = 'IE6'
    } else if (/(MSIE 7)/i.test(navigator.userAgent)) {
        data.bsv = '7.0'
        data.ie = 'IE7'
    } else if (/(MSIE 8)/i.test(navigator.userAgent)) {
        data.bsv = '8.0'
        data.ie = 'IE8'
    }

    // 用户访问网站网络性能监控
    data.perf = getPerformanceTiming()

    // 首次访问时间
    var __ft ='__ft_'+ SiteId

    // 当次会话开始时间
    var __rt ='__rt_'+ SiteId

    // 数据提交次数，也就是当次回话第几次提交数据
    var __cn ='__cn_'+ SiteId

    var ft = cookie.get(__ft, '')
    var rt = cookie.get(__rt, '')
    var postcount = cookie.get(__cn, 0) || 0
    postcount = parseInt(postcount, 10)
    postcount += 1

    if (ft) {
        data.ft = ft
    } else {
        data.ft = now
        cookie.set(__ft, now, {path:'/', expires: 86400000})
    }

    if (rt) {
        data.rt = rt
    } else {
        data.rt = now
        cookie.set(__rt, now, {path:'/', expires: 86400})
    }

    cookie.set(__cn, postcount, {path:'/', expires: 86400000})

    data.cn = postcount

    submitlog(data)
}

// 需要延迟执行，否则会有些方法等被报未定义错误
setTimeout(function(){init()}, 0)

// 下面是一些工具方法 utils cookie 网络性能监控方法等 等

// 获取站点ID
function getSiteId() {
    var siteId = ''
    var scripts = document.getElementsByTagName("script")
    var el, url, re = /^http:\/\/([\w\.]+?)\/flux\.js\?(\w{1,50})$/i
    
    for (var i = scripts.length-1; i >= 0; i--) {
        el = scripts[i]
        url = el? el.src : ''
        
        if (url) {
            var matchs = url.match(re)
            //console.log(matchs)
            if (matchs) {
                siteId = matchs[2]
            }
        }
    }

    return siteId
}


// 汇报普通数据
// data 字符串,需要“&”开头，如 &a=1&b=2
// GET传参最大长度参考
//   https://github.com/zhongxia245/blog/issues/35  
//   https://www.cnblogs.com/henryhappier/archive/2010/10/09/1846554.html
var submitlog = function(data, cb) {
    var img = new Image
    
    img.onload = img.onerror = img.onabort = function() {
        img.onload = img.onerror = img.onabort = null
        img = null
        
        cb && (typeof cb === 'function') && cb(url)
    }

    log(data)
    var uid = cookie.get(SessionID, '')
    var _data = encodeURIComponent(JSON.stringify(data))
    var code = md5(LogSubmitUrl + SiteId + uid + _data)
    
    var url = LogSubmitUrl + '?s='+ SiteId+'&u='+ uid + '&c='+code + '&d='+ _data

    log(url)
    img.src = url
}

// 打印日志
function log(data) {
    if (/(\bdebug\b|^file:)/i.test(location.href) && console) {
        console.log(data)
    }
}

// 获取搜索引擎类型
// 来源类型(direct:直接访问  搜索引擎域名:搜索引擎  other:外部链接)
// 依赖 https://github.com/websanova/js-url 库提供的 url方法
function getSearchEngineType() {
    var ref = document.referrer

    if (ref) {
        var hostname = url('hostname', ref)
        log(hostname)
        return SearchEngines[hostname]? [SearchEngines[hostname], hostname] : 'other'
    } else {
        // 直接访问
        return 'direct'
    }
}

function loadScript(url, cb) {
    var el = document.createElement("script")
    el.charset = "utf-8"
    
    cb && (typeof cb === 'function') && (el.readyState ? el.onreadystatechange = function() {
        if ("loaded" === el.readyState || "complete" === el.readyState) el.onreadystatechange = s,
        cb()
    }: el.onload = function() {
        cb()
    })
    
    el.src = url
    
    var fsel = document.getElementsByTagName("script")[0]
    fsel.parentNode.insertBefore(el, fsel)
}


// 汇报热力图等数据
// data 字符串,需要“&”开头，如 &a=1&b=2
var heatmaplog = function(data, cb) {
    var img = new Image
    
    img.onload = img.onerror = img.onabort = function() {
        img.onload = img.onerror = img.onabort = null
        img = null
        
        cb && (typeof cb === 'function') && cb(url)
    }
    
    img.src = HotmapSubmitUrl + '?site='+ SiteId + '&click=1&data='+ encodeURIComponent(JSON.stringify(data))
}


var utils = {

    // Is the given value an array? Use ES5 Array.isArray if it's available.
    isArray: Array.isArray || function (value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    },

    // Is the given value a plain object / an object whose constructor is `Object`?
    isPlainObject: function (value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    },

    // Convert an array-like object to an array – for example `arguments`.
    toArray: function (value) {
        return Array.prototype.slice.call(value);
    },

    // Get the keys of an object. Use ES5 Object.keys if it's available.
    getKeys: Object.keys || function (obj) {
        var keys = [],
             key = '';
        for (key in obj) {
            if (obj.hasOwnProperty(key)) keys.push(key);
        }
        return keys;
    },

    // Unlike JavaScript's built-in escape functions, this method
    // only escapes characters that are not allowed in cookies.
    encode: function (value) {
        return String(value).replace(/[,;"\\=\s%]/g, function (character) {
            return encodeURIComponent(character);
        });
    },

    decode: function (value) {
        return decodeURIComponent(value);
    },

    // Return fallback if the value is not defined, otherwise return value.
    retrieve: function (value, fallback) {
        return value == null ? fallback : value;
    }

};


function cookie() {
    return cookie.get.apply(cookie, arguments)
};

cookie.enabled = function () {
    if (navigator.cookieEnabled) return true;

    var ret = cookie.set('_', '_').get('_') === '_';
    cookie.remove('_');
    return ret;
};

cookie.set = function(key, value, options) {
    var d;
    options.expires && (d = new Date, d.setTime(d.getTime() + options.expires));
    document.cookie = utils.encode(key) + "=" + utils.encode(value) + (options.domain ? "; domain=" + options.domain: "") + (options.path ? "; path=" + options.path: "") + (d ? "; expires=" + d.toGMTString() : "") + (options.secure ? "; secure": "")
};

cookie.get = function(a, d) {
    return (a = RegExp("(^| )" + a + "=([^;]*)(;|$)").exec(document.cookie)) ? a[2] : (d || '')
};

// 性能分析方法
function getPerformanceTiming() {
    var performance = window.performance;
 
    if (!performance) {
        // 当前浏览器不支持
        // console.log('你的浏览器不支持 performance 接口');
        return;
    }
 
    var t = performance.timing;
    var times = {};
 
    //【重要】页面加载完成的时间
    //【原因】这几乎代表了用户等待页面可用的时间
    times.load = t.loadEventEnd - t.navigationStart;
 
    //【重要】解析 DOM 树结构的时间
    //【原因】反省下你的 DOM 树嵌套是不是太多了！
    times.dr = t.domComplete - t.responseEnd;
 
    //【重要】重定向的时间
    //【原因】拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
    times.rr = t.redirectEnd - t.redirectStart;
 
    //【重要】DNS 查询时间
    //【原因】DNS 预加载做了么？页面内是不是使用了太多不同的域名导致域名查询的时间太长？
    // 可使用 HTML5 Prefetch 预查询 DNS ，见：[HTML5 prefetch](http://segmentfault.com/a/1190000000633364)            
    times.dns = t.domainLookupEnd - t.domainLookupStart;
 
    //【重要】读取页面第一个字节的时间
    //【原因】这可以理解为用户拿到你的资源占用的时间，加异地机房了么，加CDN 处理了么？加带宽了么？加 CPU 运算速度了么？
    // TTFB 即 Time To First Byte 的意思
    // 维基百科：https://en.wikipedia.org/wiki/Time_To_First_Byte
    times.ttfb = t.responseStart - t.navigationStart;
 
    //【重要】内容加载完成的时间
    //【原因】页面内容经过 gzip 压缩了么，静态资源 css/js 等压缩了么？
    times.req = t.responseEnd - t.requestStart;
 
    //【重要】执行 onload 回调函数的时间
    //【原因】是否太多不必要的操作都放到 onload 回调函数里执行了，考虑过延迟加载、按需加载的策略么？
    times.le = t.loadEventEnd - t.loadEventStart;
 
    // DNS 缓存时间
    //times.appcache = t.domainLookupStart - t.fetchStart;
 
    // 卸载页面的时间
    //times.unloadEvent = t.unloadEventEnd - t.unloadEventStart;
 
    // TCP 建立连接完成握手的时间
    times.ct = t.connectEnd - t.connectStart;
 
    return times;
}

}, 0);