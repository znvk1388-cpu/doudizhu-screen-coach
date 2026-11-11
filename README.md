# 斗地主记牌器

Windows 和安卓各自独立运行的斗地主记牌工具。本仓库保存安装包、版本说明与校验值。

## 当前下载

安卓最新版为 0.6.14，Windows 当前版为 0.6.13。安卓新版附件已于 2026-11-11 上传，远端文件大小与 SHA-256 均已核对。

| 平台 | 安装包 | 使用方式 |
| --- | --- | --- |
| 安卓 | [完整版 APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.14/doudizhu-coach-0.6.14-android-arm64.apk) | 64位 ARM 安卓8及以上，沿用原签名，可覆盖安装 |
| 安卓可选 | [轻量版 APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.14/doudizhu-coach-0.6.14-android-lite-arm64.apk) | 不含听牌模型，保留屏幕识牌、系统播报和手动功能；与完整版互相覆盖 |
| Windows x64 | [免安装 ZIP](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.13/doudizhu-coach-0.6.13-windows-x64.zip) | 完整解压后运行 `DouDizhuCoach.exe` |

[安卓0.6.14说明、模拟报告与校验文件](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.14) · [Windows0.6.13与旧版附件](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.13)

附件采用英文名称，安装包内容与本地中文文件相同，SHA256SUMS.txt 对应当前发布附件名。

## 本轮模拟与修正

先用可控播放时序模拟0.6.13：四项中三项实际失败，定位到切换范围未停掉旧声音、普通提示截断关键提醒两类问题。

安卓0.6.14已修正：

- 切换“关键／全部”立即停止旧声音，保留记牌进度和去重序号。
- 关键短句先读完，普通提示只保留最新一条，等待超过三秒丢弃。
- 静音、暂停、换局、冲突和关闭清空待播；迟到回调不能恢复旧声音。

扩展后的十二项时序模拟在两变体均通过；完整版363项、轻量版370项回归通过。Windows本轮180项回归通过，继续使用0.6.13。安卓目标真机未连接，实际游戏识牌、噪声听牌、播放听感和耗电仍待验收。

## 语音播报

安卓主界面默认“范围：关键”，优先听已确认的炸弹、王、2、剩一两张、出完和核对提示。想听每手出牌可选“全部”。主界面和悬浮窗可一键静音。

Windows 按当前玩法区分普通炸弹、王炸、连炸与2v2多张炸弹。主界面可一键静音，也可按 Alt+V。

## 分类与备份范围

分类：游戏辅助 / 记牌工具 / Windows / Android / 安装包备份。

本仓库当前公开。保存安装包、使用说明、模拟报告和校验值；完整开发源码仍在本机项目中。第三方许可随安装包保留。
