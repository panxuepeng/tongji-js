## 流量统计系统-客户端信息采集程序

在客户端采集并分析一些信息，如：
+ 基于 UserAgent 分析浏览器品牌、版本号、操作系统(windows Mac iOS Android等)、PC或移动端、移动设备品牌等信息
+ 基于 document.referrer 的来源分析，来源网址，如果是来自搜索引擎，还可以分析搜索关键词等信息
+ 基于 localStorage 或 cookie 记录用户信息，区分新老用户，及用户的停留时间等信息


### 客户端JS提交的数据


    sid : 用户标识（需通过一定规则区分登录用户和匿名用户）
    os  : 操作系统
    osv : 操作系统版本
    bs  : 浏览器
    bsv : 浏览器版本
    ie  : IE6/7/8
    swh : 分辨率
    ce  : 是否开启cookie，1是 0否
    lg  : 语言
    ft  : 第一次访问时间，单位秒
    rt  : 当次访问时间，单位秒
    j   : 是否支持java
    tit : 网页标题，注意长度限制
    ref : Referer，注意长度限制
    wsc : 颜色
    cp  : 点击统计， [{x: 0, y: 1, u:'url'}]
    cn  : 日志提交次数
    srt : 来源类型(direct:直接访问  搜索引擎域名:搜索引擎  other:外部链接)
    kw  : 搜索关键词
    egn: 浏览器引擎
    egv: 浏览器引擎版本
    vendor: 设备厂商
    model: 设备型号
    type : 设备类型（移动 PC 平板等）



### Nginx 日志文件

1. 日志文件分小时记录。

2. 加载客户端信息采集程序的Nginx日志和汇报数据的请求的Nginx日志需要分文件记录，以便更有效的获取相关日志信息。

3. 日志格式：

    log_format  access  '[$http_x_forwarded_for] [$remote_addr] [$time_local] [$request] '
                    '[$status] [$body_bytes_sent] [$http_referer] [$http_user_agent] '
                    '[$upstream_addr] [$upstream_response_time] [$request_time]';


4. 日志示例：

    [111.206.221.78] [192.168.10.100] [13/Nov/2018:00:00:02 +0800] [GET /log?site=57fc5b1de6563e05ea50c4a1&code=D9729FEB74992CC3482B350163A1A010&data=%7B%22mi%22%3A1%2C%22os%22%3A%22iOS%22%2C%22osv%22%3A%229.1.0%22%2C%22bs%22%3A%22Safari%22%2C%22bsv%22%3A%229.0.0%22%2C%22sc%22%3A%22375%2C667%22%2C%22ce%22%3A1%2C%22lg%22%3A%22zh%22%2C%22ps%22%3A%5B%5D%2C%22ft%22%3A1542038402%2C%22rt%22%3A1542038402%2C%22j%22%3Afalse%2C%22ti%22%3A%22hello_%E6%89%8B%E6%9C%BA%E4%BA%92%E5%8A%A8%E7%99%BE%E7%A7%91%22%2C%22ref%22%3A%22%22%2C%22url%22%3A%22http%3A%2F%2Fwww.domain.com%2Farticle%2F%25E7%25BA%25A6%25E4%25BC%259A%25E6%2583%2585%25E4%25BA%25BA%22%2C%22c%22%3A24%2C%22cn%22%3A1%7D HTTP/1.1] [200] [202] [http://www.domain.com/article/hello] [Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1] [127.0.0.1:8090] [0.022] [0.036]


### UserAgent 信息提取
需要客观分析从 UserAgent 当中提取信息的两中方式的差异。
1. 在客户端分析的优缺点；
2. 在服务端分析的优缺点；