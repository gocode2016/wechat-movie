var config = require('./config')
var Wechat = require('./wechat/wechat')
var wechatApi = new Wechat(config.wechat)

exports.reply = function *(next){
    var message = this.weixin
    if(message.MsgType === 'event'){
        if(message.Event == 'subscribe'){
            if(message.EventKey){
                console.log('扫二维码进来：'+message.EventKey + ' ' +message.ticket)
            }
            this.body = '你订阅了。\n哈哈'
            console.log('subscribe')
        }
        else if(message.Event == 'unsubscribe'){
            console.log('无情取关')
            this.body = ''
        }
        else if(message.Event == 'LOCATION'){
            this.body = `您上报的位置是：${message.Latitude}/${message.Longitude}-${message.Precision}`
            console.log(`您上报的位置是：${message.Latitude}/${message.Longitude}-${message.Precision}`)
        }
        else if(message.Event == 'CLICK'){
            this.body = `您点击了菜单：${message.EventKey}`
        }
        else if(message.Event == 'SCAN'){
            this.body = `看到你扫了一下：`
        }
        else if(message.Event == 'VIEW'){
            this.body = `您点击了菜单中的链接：${message.EventKey}`
        }
    }else if(message.MsgType == 'text'){
        var content = message.Content
        var reply = `你说的${message.Content}太复杂了`
        if(content == '1'){
            reply = '天下第一吃大米'
        }else if(content == '2'){
            reply = '天下第二吃豆腐'
        }else if(content == '3'){
            reply = '天下第三吃咸蛋'
        }else if(content == '4'){
            reply = [{
                title:'技术改变世界',
                description:'只是描述啊',
                picUrl:'https://processon.io/uphoto/2/750/5993fb1de4b0b7b347df39b7.png',
                url:'https://github.com/'
            },{
                title:'技术改变世界',
                description:'只是描述啊',
                picUrl:'https://processon.io/uphoto/2/750/5993fb1de4b0b7b347df39b7.png',
                url:'https://github.com/'
            }]
            
        }else if(content == '5'){
            var data = yield wechatApi.uploadMaterial('image',__dirname + '/2.png')
            reply = {
                type:'image',
                mediaId:data.media_id
            }
        }else if(content == '6'){
            var data = yield wechatApi.uploadMaterial('video',__dirname + '/6.mp4')
            reply = {
                type:'video',
                title:'我的小鱼',
                description:'可爱的鼠鱼',
                mediaId:data.media_id
            }
        }else if(content == '7'){
            var data = yield wechatApi.uploadMaterial('image',__dirname + '/2.png')
            reply = {
                type:'music',
                title:'回复音乐内容',
                description:'放松一下',
                thumbMediaId:data.media_id,
                musicUrl:'https://i.y.qq.com/v8/playsong.html?songid=105030812&source=yqq#wechat_redirect'
            }
        }else if(content == '8'){
            var data = yield wechatApi.uploadMaterial('image',__dirname + '/2.png',{type:'image'})
            reply = {
                type:'image',
                mediaId:data.media_id
            }
        }else if(content == '9'){
            var data = yield wechatApi.uploadMaterial('video',__dirname + '/6.mp4',{
                type:"video",
                description:'{"title":"real a nice place","introduction":"never think is so easy"}'
            })
            reply = {
                type:'video',
                title:'我的小鱼',
                description:'可爱的鼠鱼',
                mediaId:data.media_id
            }
        }else if(content == '10'){
            var picData = yield wechatApi.uploadMaterial('image',__dirname + '/2.png',{})
            console.log('picData',picData)
            var media = {
                "articles":[{
                    "title":'tututt',
                    "thumb_media_id":picData.media_id,
                    "author":'jinjianhua',
                    "digest":'没有摘要',
                    "show_cover_pic":1,
                    "content":'没有内容',
                    "content_source_url":"https://github.com"
                }]
                
            }
            data = yield wechatApi.uploadMaterial('news',media,{})
            console.log('data1',data)
            data = yield wechatApi.fetchMaterial(data.media_id,'news',{})
            console.log('data2',data)
            var items = data.news_item
            var news = []
            items.forEach(function(item){
                news.push({
                    title:item.title,
                    description:item.digest,
                    picUrl:picData.url,
                    url:item.url
                })
            })
            reply = news
        }else if(content == '11'){
            var counts = yield wechatApi.countMaterial()
            console.log('counts',JSON.stringify(counts) )
            var results = yield [
                wechatApi.batchMaterial({
                    type:'image',
                    offset:0,
                    count:10
                }),
                wechatApi.batchMaterial({
                    type:'video',
                    offset:0,
                    count:10
                }),
                wechatApi.batchMaterial({
                    type:'voice',
                    offset:0,
                    count:10
                }),
                wechatApi.batchMaterial({
                    type:'news',
                    offset:0,
                    count:10
                })
            ]
            console.log('results',JSON.stringify(results))
            reply = '1'
        }else if(content == '13'){
            var user = yield wechatApi.batchFetchUsers(message.FromUserName)
            console.log('user1',user)
            var openIds = [
                {
                    openid:message.FromUserName,
                    lang:'en'
                }
            ]
            var users = yield wechatApi.batchFetchUsers(openIds)
            console.log('users2',users)
            reply = JSON.stringify(users)
        }else if(content == '15'){
            
            var touser = "ox8VuxA7L0-52Z4_n2M5D7liHvx4"
            var mpnews = {
                media_id:"FPml8aist0KED-Mb2ofRKe5JHt0vTZlPbZfYSty0oVc"
            }
            var msgtype = 'mpnews'
            var users = yield wechatApi.massByOpenIds(touser,mpnews,msgtype)
            reply = '群发成功'
        }
        console.log('reply',reply)
        this.body = reply
    }
    yield next
}