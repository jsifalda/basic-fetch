import join from 'juriquery'
import isPlainObject from 'is-plain-object'
import json from 'safe-json'

export default ({ headers, url, query, data, method, ...rest }) => {
  const isPlain = isPlainObject(data)
  return new Promise(async (resolve, reject) => {
    const response = await fetch(query ? join(url, isPlainObject(query) ? query : {}) : url, {
      ...rest,
      method: (method || '').toUpperCase(),
      ...(data ? { body: isPlain ? JSON.stringify(data) : data } : {}),
      headers: {
        ...(!data || (data && isPlain)
          ? { 'Cache-control': 'no-cache', Pragma: 'no-cache', Expires: 0 }
          : {}),
        Accept: 'application/json, text/plain, */*',
        ...(data && isPlain ? { 'Content-Type': 'application/json' } : {}),
        ...(headers || {})
      }
    })

    try {
      if (response.ok) {
        const text = await response.text()
        resolve(json().parse(text))
      } else {
        const text = await response.text()

        // eslint-disable-next-line
        reject({
          response: {
            status: response.status,
            statusText: response.statusText,
            data: json().parse(text)
          }
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}
