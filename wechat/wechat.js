var request = require('request')
var _ = require('lodash')
var util = require('../libs/util')
var fs = require('fs')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    accessToken:prefix + 'token?grant_type=client_credential',
    temporary:{
        upload:prefix + 'media/upload?',
        fetch:prefix + 'media/get?'
    },
    permanent:{
        upload:prefix + 'material/add_material?',
        fetch:prefix + 'material/get_material?',
        uploadNews:prefix + 'material/add_news?',
        uploadNewsPic:prefix + 'media/uploadimg?',
        del:prefix + 'material/del_material?',
        update:prefix + 'material/update_news?',
        count:prefix + 'material/get_materialcount?',
        batch:prefix + 'material/batchget_material?'
    },
    user:{
        remark:prefix + 'user/info/updateremark?',
        fetch:prefix +'user/info?',
        batchFetch:prefix + 'user/info/batchget?'
    },
    mass:{
        byOpenIds:prefix +'message/mass/preview?'
    }
}

function Wechat(opts){
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()

    
}
Wechat.prototype.fetchAccessToken = function(data){
    var that = this
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this)
        }
    }

    that.getAccessToken()
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
        return Promise.resolve(data)
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
Wechat.prototype.uploadMaterial = function(type,material,permanent){
    var that = this
    var form = {}
    var uploadUrl = api.temporary.upload
    if(permanent){
        uploadUrl = api.permanent.upload
        _.extend(form,permanent)
    }
    if(type === 'pic'){
        uploadUrl = api.permanent.uploadNewsPic
    }
    if(type === 'news'){
        uploadUrl = api.permanent.uploadNews
        form = material
    }else{
        form.media = fs.createReadStream(material)
    }
    // var appID = this.appID
    // var appSecret = this.appSecret
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            // + '&access_token=' + data.access_token
            var url = uploadUrl+ '&access_token=' + data.access_token
            if(!permanent){
                url += '&type=' + type
            }else{
                form.access_token = data.access_token
            }
            let opts = {url:url,json:true,method:'POST'}
            if(type === 'news'){
                opts.body = form 
            }else{
                opts.formData = form
            }
            console.log('uploadMaterial opts',opts)
            util.request(opts)
            .then(function(res){
                console.log('uploadMaterial res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('upload material fails')
                }
                
            })
            .catch((e)=>{
                console.log('upload material error',e)
                reject(e)
            })
        })
    })
}
Wechat.prototype.fetchMaterial = function(mediaId,type,permanent){
    var that = this
    var form = {}
    var fetchUrl = api.temporary.fetch
    if(permanent){
        fetchUrl = api.permanent.fetch
    }
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = fetchUrl + '&access_token=' + data.access_token
            if(!permanent && type === 'video'){
                url = url.replace('https://','http://')
            }
            var form = {}
            let opts = {url:url,json:true,method:'POST'}
            if(permanent){
                form.media_id = mediaId
                form.access_token = data.access_token
                opts.body = form
            }else{
                if(type == 'video'){
                    url = url.replace('https://','http://')
                }
                url += '&media_id=' + mediaId
            }

            // let form = {
            //     media_id:mediaId,
            //     access_token:access_token
            // }
            if(type === 'news' || type === 'video'){
                util.request(opts)
                .then(function(res){
                    console.log('fetchMaterial res',res)
                    var _data = res
                    if(_data){
                        resolve(_data)
                    }else{
                        throw new Error('fetchMaterial material fails')
                    }   
                })
                .catch((e)=>{
                    console.log('fetchMaterial material error')
                    reject(e)
                })
            }else{
                resolve(url)
            }
            
            
        })
    })
}
Wechat.prototype.deleteMaterial = function(mediaId){
    var that = this
    var form = {
        media_id:mediaId
    }
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.permanent.del + '&access_token=' + data.access_token + '&media_id=' + mediaId
            let opts = {url:url,json:true,method:'POST',body:form}
            
            util.request(opts)
            .then(function(res){
                console.log('delMaterial res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('del material fails')
                }
                
            })
            .catch((e)=>{
                console.log('del material error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.updateMaterial = function(mediaId,news){
    var that = this
    var form = {
        media_id:mediaId
    }
    _.extend(form,news)
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.permanent.update + '&access_token=' + data.access_token + '&media_id=' + mediaId
            let opts = {url:url,json:true,method:'POST',body:form}
            
            util.request(opts)
            .then(function(res){
                console.log('updateMaterial res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('update material fails')
                }
                
            })
            .catch((e)=>{
                console.log('update material error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.countMaterial = function(){
    var that = this
    
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.permanent.count + '&access_token=' + data.access_token
            let opts = {url:url,json:true,method:'GET'}
            
            util.request(opts)
            .then(function(res){
                console.log('updateMaterial res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('update material fails')
                }
                
            })
            .catch((e)=>{
                console.log('update material error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.batchMaterial = function(options){
    var that = this
    options.type = options.type || 'image'
    options.offset = options.offset || 0
    options.count = options.count || 1
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.permanent.batch + '&access_token=' + data.access_token
            let opts = {url:url,json:true,method:'POST',body:options}
            
            util.request(opts)
            .then(function(res){
                console.log('batchMaterial res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('batch material fails')
                }
                
            })
            .catch((e)=>{
                console.log('batch material error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.remarkUser = function(openId,remark){
    var that = this
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.user.remark + 'access_token=' + data.access_token
            var form = {
                openid:openId,
                remark:remark
            }
            let opts = {url:url,json:true,method:'GET',body:form}
            util.request(opts)
            .then(function(res){
                console.log('user remark res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('user remark fails')
                }   
            })
            .catch((e)=>{
                console.log('user remark  error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.batchFetchUsers = function(openIds){
    var that = this
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url 
            var form 
            let opts = {url:url,json:true,method:'GET'}
            if(_.isArray(openIds)){
                url = api.user.batchFetch + 'access_token=' + data.access_token
                opts.body = {
                    user_list:openIds
                }
                opts.method = 'POST'
                opts.url = url
            }else {
                url = api.user.fetch + 'access_token=' + data.access_token
                + '&openid=' + openIds + '&lang=zh_CN'
                opts.url = url
            }
            console.log(opts)
            util.request(opts)
            .then(function(res){
                console.log('user batchFetchUsers res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('user batch fetch fails')
                }   
            })
            .catch((e)=>{
                console.log('user batch fetch  error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.massByOpenIds = function(openIds,mpnews,msgtype){
    var that = this
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then((data)=>{
            var url = api.mass.byOpenIds + 'access_token=' + data.access_token
            var form = {
                touser:openIds,
                mpnews:mpnews,
                msgtype:msgtype,
                send_ignore_reprint:0
            }
            let opts = {url:url,json:true,method:'POST',body:form}
            console.log('massByOpenIds',opts)
            util.request(opts)
            .then(function(res){
                console.log('massByOpenIds res',res)
                var _data = res
                if(_data){
                    resolve(_data)
                }else{
                    throw new Error('massByOpenIds fails')
                }   
            })
            .catch((e)=>{
                console.log('massByOpenIds  error')
                reject(e)
            })
        })
    })
}
Wechat.prototype.reply = function(){
    var content = this.body
    var message = this.weixin
    // console.log('reply content',content)
    // console.log('reply message',message)
    var xml = util.tpl(content,message)
    console.log('reply xml',xml)
    this.status = 200
    this.type = 'application/xml'
    this.body = xml
}
module.exports = Wechat