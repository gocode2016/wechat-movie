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
        console.log(2)
        console.log('this.query',this.query)
        console.log('opts',opts)
        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token,timestamp,nonce].sort().join('')
        var sha = sha1(str)
        console.log(sha)
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
            console.log('getRawBody',data.toString())
            var content = yield util.parseXMLAsync
            var message = util.formatMessage(content)
            console.log('message',message)
        }
        
    }
}