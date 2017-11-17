var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')


var config = require('./config')
var weixin = require('./weixin')
var app = new Koa()
app.use(wechat(config.wechat,weixin.reply))

app.listen(2000)
console.log('listening 2000')