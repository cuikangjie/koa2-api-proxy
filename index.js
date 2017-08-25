const fetch = require('node-fetch')
const qs = require('querystringify');
const parse = require('co-body');

module.exports = function(context, options){

  const {
      logs,
      rewrite,
      target
  } = options

  return async function (ctx,next) {
    if (!ctx.req.url.startsWith(context)) return next()


    let param = null;

    let path = ctx.req.url

    if (typeof rewrite === 'function') {
        path = rewrite(path)
    }

    if(ctx.request.method==='GET'){
      param = ctx.request.query;
    }
    if(ctx.request.method === 'POST'){
      param =await parse(ctx);
    }

    let method = ctx.method || 'GET'
    let url = method === 'GET' && param.data ? (target + path + qs.stringify(param.data, true)) : (target + path)
    let data = method === 'POST' && param.data ? qs.stringify(param.data) : null
    let headers = {}


    await fetch(url, {
        method: method,
        headers: headers,
        redirect: 'follow',
        timeout: 50000,
        compress: true,
        size: data ? Buffer.byteLength(data) : 0,
        body: data ? data : null,
      })
      .then(function (response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text()
        } else {
          ctx.throw(response.status, response.statusText);
        }
      }).then((res) => {
        let data = null
        try {
          data = JSON.parse(res)
        } catch (e) {
          data = res
        } finally {
          ctx.body = data
        }

      }).catch(err => {
        ctx.throw(500, err);
      });

      if (logs) logger(ctx,path)
  }
}

function logger(ctx, path) {
    console.log('%s - %s %s', new Date().toISOString(), ctx.req.method, path)
}
