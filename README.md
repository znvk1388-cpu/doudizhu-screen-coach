# 斗地主记牌器

Windows 和安卓各自独立运行的斗地主记牌工具。本仓库保存安装包、版本说明与校验值。

## 当前下载

安卓最新版为0.6.15，Windows当前版为0.6.13。安卓新版附件已于2026-11-11上传，远端文件大小与SHA-256均已核对。

| 平台 | 安装包 | 使用方式 |
| --- | --- | --- |
| 安卓 | [完整版APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.15/doudizhu-coach-0.6.15-android-arm64.apk) | 64位ARM安卓8及以上，沿用原签名，可覆盖安装 |
| 安卓可选 | [轻量版APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.15/doudizhu-coach-0.6.15-android-lite-arm64.apk) | 不含听牌模型，保留屏幕识牌、系统播报和手动功能；与完整版互相覆盖 |
| Windows x64 | [免安装ZIP](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.13/doudizhu-coach-0.6.13-windows-x64.zip) | 完整解压后运行 `DouDizhuCoach.exe` |

[安卓0.6.15说明、优化报告与校验文件](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.15) · [安卓0.6.14上一版](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.14) · [Windows0.6.13与旧版附件](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.13)

附件采用英文名称，安装包内容与本地中文文件相同，SHA256SUMS.txt对应当前发布附件名。

## 游戏内操作播报

| 操作 | 结果 |
| --- | --- |
| 点击浮窗播报按钮 | 即时开关声音，识牌继续 |
| 长按浮窗播报按钮 | 切换关键／全部，停止旧播报 |
| 静音中长按 | 只改范围，保持静音 |
| 查看按钮 | 开启时显示关键或全部，关闭时显示关 |

首次浮窗提示一次操作方法。主界面与浮窗共用设置，重开仍记住。浮窗大小和位置沿用原设置。

三项新增联动模拟在旧0.6.14均失败，修复后通过。完整版366项、轻量版373项全量回归通过，包含此前十二项播报时序保护；静态检查没有新增问题。正式APK签名、权限、模型、许可和16KB对齐检查通过。

未连接安卓目标真机。实际长按手感、游戏整局识牌、噪声听牌、播放听感与耗电仍待验收。Windows继续0.6.13，最近一次180项回归为上一轮0.6.14验收，本轮未改其源码或重复打包。

## 播报范围

默认关键范围播已确认的炸弹、王、2、剩一两张、出完和核对提示。全部范围可听每手出牌。关键短句先读完，普通提示只保留最新一条，等待超过三秒丢弃；静音、暂停、换局和冲突清空待播。

Windows按当前玩法区分普通炸弹、王炸、连炸与2v2多张炸弹。主界面可一键静音，也可按Alt+V。

## 分类与备份范围

分类：游戏辅助 / 记牌工具 / Windows / Android / 安装包备份。

本仓库当前公开。保存安装包、使用说明、验收报告和校验值；完整开发源码仍在本机项目中。第三方许可随安装包保留。
