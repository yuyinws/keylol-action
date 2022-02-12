const core = require('@actions/core')
const axios = require('axios')
const { writeFile } = require('fs/promises')
const cheerio = require('cheerio')
const { minify } = require('html-minifier')

const DOMAIN = 'https://keylol.com/'
const main = async () => {
  try {
    const URLS = core.getInput('urls', { required: false })
    let limit = core.getInput('limit', { required: false })
    limit = parseInt(limit)
    console.log(limit)
    // const URLS =
    //   'forum.php?mod=guide&view=index forum.php?mod=forumdisplay&fid=161&filter=typeid&typeid=459 f271-1'
    const urlArray = URLS.split(' ')
    let context = ''
    for (const url of urlArray) {
      const response = await axios({
        method: 'get',
        timeout: 5000,
        url: DOMAIN + url,
      })
      const $ = cheerio.load(response.data)
      let topic = ''
      // 板块名称
      if (url.indexOf('mod=guide') > -1) {
        topic = $('.bm_h h1').text()
      } else {
        topic = $('.subforum_left_title_left_down').children().text()
      }
      const topicHtml = `<h3 style="color:#67bbea">${topic}</h3>`
      let table = `<tr style="text-align:left;color:gray">
          <th>帖子主题 | 查看数 | 回复数</th>
        </tr>`
      $('.bm_c')
        .eq(1)
        .each((i, el) => {
          let index = 1
          $(el)
            .find('table tbody')
            .each((j, ele) => {
              // 过滤置顶帖子
              if ($(ele).attr('id').indexOf('normalthread') > -1) {
                if ( limit > 0 && index > limit) {
                  return false
                }
                // 帖子名称
                const tName = $(ele).find('th a').text()
                // 帖子查看数
                const tView = $(ele).find('.num em').text()
                // 帖子链接
                const tLink = $(ele).find('.num a').attr('href')
                // 帖子回复数
                const tPost = $(ele).find('.num a').text()

                const tHTML = `<tr style="margin-top:10px">
                    <td style="width:1000px;position: relative">
                      <a style="text-decoration: none;color:#57bbea" href="${DOMAIN}${tLink}">
                      ${tName}
                      <span style="color:gray;position:absolute;right:50px"> ${tPost} </span>
                      <span style="color:gray;position:absolute;right:0"> ${tView} </span>
                      </a>
                    </td>
                  </tr>`
                table = table + tHTML
                index++
              } else {
                return
              }
            })
          const completedTable = `${topicHtml}<table style="border-spacing:10px;border:1px solid #67bbea">${table}</table>`
          context = context + completedTable
        })
    }
    const original = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="padding:20px;background:#f7f7f7">
        ${context}
      </body>
      </html>
    `
    const minified = minify(original, {
      collapseWhitespace: true,
    })
    // await writeFile('./MJ_HTML.html', MJ_HTML)
    await writeFile('./context.html', minified, 'utf-8')
  } catch (error) {
    console.log(error)
    throw error
  }
}

main()
