# 斗地主记牌器

Windows和安卓各自独立运行的斗地主记牌工具。本仓库保存安装包、使用说明、验收报告与校验值。

## 当前下载

安卓最新版0.6.16，Windows当前版0.6.13。安卓附件已于2026-11-11上传，6个附件的远端大小与SHA-256均已核对。

| 平台 | 安装包 | 使用方式 |
| --- | --- | --- |
| 安卓 | [完整版APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.16/doudizhu-coach-0.6.16-android-arm64.apk) | 64位ARM安卓8及以上，原签名覆盖安装 |
| 安卓可选 | [轻量版APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.16/doudizhu-coach-0.6.16-android-lite-arm64.apk) | 无听牌模型，保留屏幕识牌、系统播报和手动功能；两版相互覆盖 |
| Windows x64 | [免安装ZIP](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.13/doudizhu-coach-0.6.13-windows-x64.zip) | 完整解压后运行 `DouDizhuCoach.exe` |

[0.6.16全部附件、说明与校验](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.16) · [0.6.15上一版](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.15)

## 区域模板备份与导入

入口：主界面 → 更多识牌设置 → 备份／导入区域模板。

1. 选择一个模板，点“导出所选模板”，在系统文件选择器保存文件，便于备份或发送给朋友。
2. 点“从文件导入”，核对名称、玩法、宽高比和区域数量，填写新名称后另存。
3. 新模板标为待核对，保持当前活动牌桌和牌局，同名不覆盖。使用时回主界面切换区域并重新校准；2v2先手按新局确认。

文件仅包含区域与玩法，不含截图、录音、声纹或牌局记录。本轮模板文件用于安卓客户端复用，无新增存储权限。建议开局前操作；不同手机、皮肤和游戏版本仍需重新核对。

## 本轮对标与验收

复核天天、精灵、简单、至尊及Han的一手功能资料，详见[市场对标报告](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.16/market-comparison-zh.md)。Han命名布局是复用参照，跨手机模板文件属于本项目的工程延伸。未安装竞品或进行同机性能排名。

23项模板协议、存储、文档回调与页面重建模拟通过。完整版389项、轻量版396项全量回归通过，静态检查无新增问题。APK签名、权限、模型、许可及16KB对齐检查通过，见[验收报告](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.16/release-report-zh.md)。

未连接安卓目标真机。OEM文件管理器、微信文件实际导入、游戏整局OCR、噪声听牌和耗电仍待验收。浮窗内各家出牌历史为下一候选，尚未实装。

Windows继续0.6.13，最近一次180项全量回归为0.6.14轮次，本轮未改其产品源码或重复打包。

## 播报操作

浮窗按钮点击即时开关声音，长按切换关键／全部，静音中改范围仍保持静音。主界面与浮窗同步并记住设置。关键范围保留已确认的炸弹、王、2、少牌、出完和核对提示。

关键短句先读完，普通提示只保留最新一条、等待超过三秒丢弃。静音、暂停、换局和冲突清空待播。Windows主界面可静音，也可按Alt+V。

## 分类与备份范围

分类：游戏辅助 / 记牌工具 / Windows / Android / 安装包备份。

本仓库当前公开，保存安装包、说明和报告；完整开发源码仍在本机。第三方许可随安装包保留。
