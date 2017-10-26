var Koa = require('koa') 
var sha1 = require('sha1')

var config = {
	wechat:{
		appID:'wx7539a9456221a597',
		appSecret:'00a9a6e1653a79d7e39d4099f91bca45',
		token:'jinjianhua'
	}
}
var app = new Koa()
app.use(function *(next){
	console.log(this.query)
	var token = config.wechat.token
	var signature = this.query.signature
	var nonce = this.query.nonce
	var timestamp = this.query.timestamp
	var echostr = this.query.echostr
	var str = [token,timestamp,nonce].sort().join('')
	var sha = sha1(str)
	console.log(sha)
	if (sha === signature) {
		this.body = echostr + ''
	}else{
		this.body = 'wrong'
	}
})
app.listen(2000)
console.log('listening 2000')