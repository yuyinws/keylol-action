## Keylol Action

定时发送[Keylol](https://keylol.com)的热门帖子到指定邮箱中。

### 亮点

- 基于github action，无需自己搭建服务器。
- 可以同时订阅多个板块。

### 效果示例

![Snipaste_2022-02-12_13-05-30](https://s2.loli.net/2022/02/12/suQLYaUDeMXIrEJ.jpg)

> 不同的邮箱提供商对HTML的解析策略不同，推荐使用QQ邮箱来接收邮件以获得好的邮件阅读体验。

### 配置步骤

#### 准备工作

- 1个[github](https://github.com)账号
- 1个可以设置SMTP协议的邮箱（一般主流的邮箱服务都有这个功能）

#### github仓库配置

你可以在任意一个已有的仓库中运行action，也可以直接Fork [keylol-action](https://github.com/yuyinws/keylol-action)这个仓库，此仓库中的`.gitub/workflows/send_mail.yml`已经是一个配置好的action，只需在其中改动即可。

选择好仓库后，在仓库主界面依次点击`Settings->Secrets->Actions`,再点击`New repository secret `新建两个名为`MAIL_USERNAME`和`MAIL_PASSWORD`和`TARGET_MAIL`3个密钥，3个密钥的值依次是需要发送邮件的邮箱的账号和密码以及需要接收邮件的邮箱地址。

> 请注意：选择发送邮件的邮箱必须开启SMTP功能，QQ邮箱的开启方法可以[点击这里查看](https://service.mail.qq.com/cgi-bin/help?subtype=1&no=166&id=28)。其他邮箱请自行查找开启方法。

![image-20220212201452436](https://s2.loli.net/2022/02/12/Y8BRINW1fM26ncP.png)

#### 配置Github Action

一个action yml文件示例：

```yaml
name: keylol action
on:
  schedule:
    - cron: "0 1 * * *"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Keylol Action
        uses: yuyinws/keylol-action@v1.0
        with:
          urls: 
            f335-1
            forum.php?mod=forumdisplay&fid=248&orderby=lastpost&filter=dateline&dateline=604800
            f271-1
          limit: 10

      - name: Send mail
        uses: dawidd6/action-send-mail@v3.6.0
        with:
          # smtp 服务器地址
          server_address: smtp.qq.com
          # smtp 服务器端口
          server_port: 465
          username: ${{secrets.MAIL_USERNAME}}
          password: ${{secrets.MAIL_PASSWORD}}
          subject: Keylol帖子订阅邮件
          html_body: file://context.html
          to: ${{ secrets.TARGET_MAIL }}
          from: yuyinws
          convert_markdown: true
```

它由以下几个部分组成

1. **执行周期**

```yaml
on:
  schedule:
    - cron: "0 1 * * *"
```

其中的`cron`字段就是执行周期，关于crontab的使用方法可以[点击这里查看](https://tools.fun/crontab.html)。

需要注意的是，由于github action的服务器时间是UTC时区，我们是在UTC+8时区，因此在配置执行周期时需要往前推8个小时。

例如：你想在每天早上9点发送邮件提醒，则需要将crontab配置为`"0 1 * * *"`

2. **Keylol action**

```yaml
      - name: Keylol Action
        uses: yuyinws/keylol-action@v1.0
        with:
          urls: 
            f335-1
            forum.php?mod=forumdisplay&fid=248&orderby=lastpost&filter=dateline&dateline=604800
            f271-1
          limit: 10
```

其中的`urls`是你想要订阅的板块链接。

比如：`热点聚焦`这个板块的链接是`https://keylol.com/f161-1`，则将`f161-1`复制到`urls`下方。你还可以先将主题按照你想要的方式进行筛选，再复制链接。

![image-20220212141419832](https://s2.loli.net/2022/02/12/awQeY2J8m9ExONn.png)

其中的`limit`是订阅的帖子数量限制，limit为10代表每次只会发送10条某个板块的帖子到你的邮箱中。

limit为0代表不限制，会发送第一页所有的帖子。

3. **Send mail**

```yaml
      - name: Send mail
        uses: dawidd6/action-send-mail@v3.6.0
        with:
          # smtp 服务器地址
          server_address: smtp.qq.com
          # smtp 服务器端口
          server_port: 465
          username: ${{secrets.MAIL_USERNAME}}
          password: ${{secrets.MAIL_PASSWORD}}
          subject: Keylol帖子订阅邮件
          html_body: file://context.html
          to: ${{ secrets.TARGET_MAIL }}
          from: yuyinws
          convert_markdown: true
```

其中的`server_address`和`server_port`是你配置邮箱的smtp服务器地址和端口。不同的邮箱提供商服务器地址不同，端口一般都是465，比如QQ邮箱是`smtp.qq.com`,新浪邮箱是`smtp.sina.com`。

`username`和`password`已在前面的仓库Secrets中进行过配置，这里不需要改动。

`subject`是邮件的主题，可以进行自定义。

`html_body`请勿改动。

`to`是接收邮件的邮箱地址，可以配置多个邮箱来接收邮件，多个邮箱之间用逗号分隔。
可以明文输入，也可以保存到仓库的secrets中，然后通过`${{ secrets.TARGET_MAIL }}`获取。

`from`是发送邮箱方的昵称。

### 测试

想要测试你的action能否成功发送邮件，你可以暂时将`cron`这个字段设置为`"* * * * *"`，这样子配置大概每10分钟会执行一次action。如果测试action没有问题请及时将cron改回去，不然你的邮箱会一直收到邮件。