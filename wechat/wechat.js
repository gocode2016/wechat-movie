var request = require('request')
var util = require('../libs/util')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    accessToken:prefix + 'token?grant_type=client_credential'
}

function Wechat(opts){
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken

    this.getAccessToken()
    .then(function(data){
        console.log(3)
        try{
            data = JSON.parse(data)
        }
        catch(e){
            return that.updateAccessToken()
        }
        if(that.isValidAccessToken(data)){
            console.log(data)
            return Promise.resolve(data)
        }else{
            return that.updateAccessToken()
        }
    })
    .then(function(data){
        console.log(4)
        console.log(data)
        that.access_token = data.access_token
        that.expires_in = data.expires_in

        that.saveAccessToken(data)
    })
}
Wechat.prototype.isValidAccessToken = function(data){
    console.log('isValidAccessToken')
    if(!data || !data.access_token || !data.expires_in){
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if(now<expires_in){
        return true
    }
    else{
        return false
    }
}
Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret

    return new Promise(function(resolve,reject){
        let opts = {url:url,json:true}
        util.request(opts)
        .then(function(data){
            console.log('data',data)
            var now = (new Date().getTime())
            var expires_in = now + (data.expires_in -20)*1000
            data.expires_in = expires_in

            resolve(data)
        })
        .catch((e)=>{
            console.log('updateAccessToken error')
        })
    })
}

module.exports = Wechat