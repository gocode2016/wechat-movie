var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var config = {
	wechat:{
		// 水果摊
		// appID:'wx7539a9456221a597',
		// appSecret:'00a9a6e1653a79d7e39d4099f91bca45',
		// 测试
		appID:'wxa9ae67a590f66619',
		appSecret:'62f0ffcd867a525e4a907ea50ac7cfe2',
		token:'jinjianhua',
		getAccessToken:function(){
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken:function(data){
			data = JSON.stringify(data)
			console.log(5)
			return util.writeFileAsync(wechat_file,data)
		}
	}
}
module.exports = config