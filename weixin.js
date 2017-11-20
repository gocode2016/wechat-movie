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
            this.content = '你订阅了。\n哈哈'
            console.log('subscribe')
        }
        else if(message.Event == 'unsubscribe'){
            console.log('无情取关')
            this.body = ''
        }
        else if(message.Event == 'LOCATION'){
            this.body = `您上报的位置是：${message.Latitude}/${message.Longitude}-${message.Precision}`
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
            reply = '天下第二吃豆腐'
        }
        console.log('reply',reply)
        this.body = reply
    }
    yield next
}