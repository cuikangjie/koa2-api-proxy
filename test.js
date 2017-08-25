const Koa = require('koa');
const app = new Koa();
const proxy = require('./index.js')

app.use(proxy('/api', {
    target: 'http://www.baddu.com',
    rewrite: path => {
        return path.replace(/^\/api/, '')
    },
    logs: true
}))


app.on('error', function(err) {
  console.log(err);
});
app.listen(9090, function() {
  console.error('================> ','服务启动成功 127.0.0.1:9090');
  console.log();
})
