# 斗地主记牌器

Windows 和安卓各自独立运行的斗地主记牌工具。本仓库保存安装包、版本说明与校验值。

## 下载 0.6.11

两个安装包已于2026-11-09上传，GitHub返回的文件大小与SHA-256均与本地原件一致。

| 平台 | 安装包 | 使用方式 |
| --- | --- | --- |
| 安卓 | [完整版 APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.11/doudizhu-coach-0.6.11-android-arm64.apk) | 发送到64位ARM安卓手机安装，沿用原签名，可覆盖安装 |
| Windows x64 | [免安装 ZIP](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.11/doudizhu-coach-0.6.11-windows-x64.zip) | 完整解压后运行 `DouDizhuCoach.exe` |

[全部附件、中文使用说明和校验文件](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.11) · [保留的0.6.10旧版](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.10)

附件采用英文名称，安装包内容与本地中文文件相同，`SHA256SUMS.txt`对应当前附件名。

## 本版修正与验证

- Windows修正参考图中“连炸普通场”标题漏匹配，保留已选同组比点规则及不同牌池的排除条件。
- 安卓修正运行中改变系统字号时横条格宽未同步，保留当前牌局与已保存的位置。
- Windows170项、安卓完整版344项及轻量版351项回归通过；正式包签名、权限、模型、许可与启动检查通过。未新增冷门玩法或权限。

保留上版双端横条记牌、15档余牌与已核实三张底牌。安卓尚未目标真机验收，字号变化通过Robolectric配置回归验证；单癞子仍需手动核对，游戏或皮肤需要对应校准。

## 分类与备份范围

分类：游戏辅助 / 记牌工具 / Windows / Android / 安装包备份。

本仓库当前公开。本次备份两个安装包、使用说明和校验值；完整开发源码仍在本机项目中。第三方许可随安装包保留。
