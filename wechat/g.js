var sha1 = require('sha1')
var getRawBody = require('raw-body')
var util = require('../libs/util')
// var Promise = require('bluebird')
// var request = Promise.promisify(require('request'))
var Wechat = require('./wechat')
module.exports = function(opts){
    // var wechat = new Wechat(opts)
    console.log(1)
    return function *(next){
        let that = this
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token,timestamp,nonce].sort().join('')
        var sha = sha1(str)
        console.log('sha',sha)
        console.log('this.method',this.method)
        if(this.method === 'GET'){
            if (sha === signature) {
                this.body = echostr + ''
            }else{
                this.body = 'wrong'
            }
        }
        else if(this.method === 'POST'){
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }
            var data = yield getRawBody(this.req,{
                length:this.length,
                limit:'1mb',
                encoding:this.charset
            })
            var content = yield util.parseXMLAsync(data)
            var message = util.formatMessage(content.xml)
            console.log('message',message)
            if(message.MsgType === 'event'){
                if(message.Event === 'subscribe'){
                    var now = new Date().getTime()
                    that.status = 200
                    that.type = 'application/xml'
                    that.body = `<xml>
                    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                    <CreateTime>${now}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[测试成功]]></Content>
                    </xml>`
                    return
                }
            }
        }
        
    }
}