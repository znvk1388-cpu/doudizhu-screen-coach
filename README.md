# 斗地主记牌器

Windows和安卓各自独立运行的斗地主记牌工具。本仓库保存安装包、使用说明、验收报告与校验值。

## 当前下载

安卓最新版0.6.17，Windows当前版0.6.13。安卓附件已于2026-11-13上传，5个附件的远端大小与SHA-256均已核对。

| 平台 | 安装包 | 使用方式 |
| --- | --- | --- |
| 安卓 | [完整版APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.17/doudizhu-coach-0.6.17-android-arm64.apk) | 64位ARM安卓8及以上，原签名覆盖安装 |
| 安卓可选 | [轻量版APK](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.17/doudizhu-coach-0.6.17-android-lite-arm64.apk) | 无听牌模型，保留屏幕识牌、系统播报和手动功能；两版相互覆盖 |
| Windows x64 | [免安装ZIP](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.13/doudizhu-coach-0.6.13-windows-x64.zip) | 完整解压后运行 `DouDizhuCoach.exe` |

[0.6.17全部附件、说明与校验](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.17) · [0.6.16上一版](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/tag/v0.6.16)

在线阅读版：[下载页](https://znvk1388-cpu.github.io/doudizhu-screen-coach/) · [隐私政策](https://znvk1388-cpu.github.io/doudizhu-screen-coach/privacy.html)

## 校验下载

下载后可核对 SHA-256。下载页提供 [完整校验工具 ZIP](https://znvk1388-cpu.github.io/doudizhu-screen-coach/downloads/apk-check-tools.zip)，解压后把 APK 拖到 verify-apk.bat：默认与 releases.json 自动比对，未知文件显示未核验。文件哈希比对与完整 APK 签名验证分别报告；显式要求证书而缺少官方 apksigner 时不会按通过处理。详见 [tools/README.md](tools/README.md)。

| 文件 | 体积（字节） | SHA-256 |
| --- | --- | --- |
| 轻量版<br>`doudizhu-coach-0.6.17-android-lite-arm64.apk` | 14,586,588 | `b795c42e645d088506cf0a1149b41532c690cbf7fddce5526dc6e3ca9d5d0516` |
| 完整版<br>`doudizhu-coach-0.6.17-android-arm64.apk` | 79,010,755 | `22734ecbd9bd819b4a9ecf9baafa555b1de6c390f10457f79c864b5aa9478d0b` |

**关于签名**：当前两个 APK 的证书显示 CN=Android Debug，属于调试签名。证书名称本身不能证明特定私钥公开，本仓库未确认该具体私钥的公开来源。先核对文件 SHA-256；需要签名有效性检查时使用 Android 官方 apksigner。正式签名迁移方案尚未发布；当前同签名覆盖安装无需卸载。换手机先导出模板，在新设备导入并试识别后，再决定是否处理旧应用数据。模板不含牌局和声纹。

## 0.6.17 平板适配与验收

小米平板7与澎湃OS3使用同一原签名安卓包。按当前窗口自动双栏/单栏、校准栏自适应、触摸中断不误改区域，并补平板设置说明。完整版406项、轻量版413项回归通过，静态检查较0.6.16少1项提示、无新增，签名/权限/模型/许可/16KB检查通过。

未连接目标平板：HyperOS3权限、实际整局识别、后台与耗电仍待实机验收；不宣称所有游戏已适配。请按实际共享画面重新校准，勿直接套用手机16:9区域。见[本轮验收报告](https://github.com/znvk1388-cpu/doudizhu-screen-coach/releases/download/v0.6.17/release-report-zh.md)。

## 2026-11-12 网站修复

- [区域标注器](https://znvk1388-cpu.github.io/doudizhu-screen-coach/layout-marker.html) 采用安卓 0.6.16 的 format/version/layout 协议，按座位标注，支持三人经典、连炸和两种 2v2 模板；导入仍须试识别。
- 修改设置后导出最新内容；重画和清空可撤销；手机可点两个角或输入坐标。
- 修正校验工具、隐私说明和迁移步骤，补 Windows 下载入口。本次不替换安装包。
- 声纹逐人删除、自动清理、独立同意页和诊断预览尚未实装，不能把网页说明更新当作客户端已有功能。


## 区域模板备份与导入

入口：主界面 → 更多识牌设置 → 备份／导入区域模板。

1. 选择一个模板，点“导出所选模板”，在系统文件选择器保存文件，便于备份或发送给朋友。
2. 点“从文件导入”，核对名称、玩法、宽高比和区域数量，填写新名称后另存。
3. 新模板标为待核对，保持当前活动牌桌和牌局，同名不覆盖。使用时回主界面切换区域并重新校准；2v2先手按新局确认。

文件仅包含区域与玩法，不含截图、录音、声纹或牌局记录。本轮模板文件用于安卓客户端复用，无新增存储权限。建议开局前操作；不同手机、皮肤和游戏版本仍需重新核对。

## 0.6.16 对标与验收

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

## 2026-11-13 手机标注细节

支持单区域清除与撤销；玩法选择前置，控件点击高度至少44px；坐标错误就近提示，复制中修改模板、多指与旋转屏幕均有状态保护。图片类型信息缺失时可按常见图片扩展名尝试读取，失败保留原图。客户端安装包版本保持不变。

网站源码变更后，先运行 `node --test` 和 `python -m unittest discover -s tests -p test_web_assets.py`，发布前运行 `python tools/stamp-web-assets.py`，按脚本内容更新引用版本，避免新版页面混用旧缓存。校验工具ZIP维护另见 `tools/build-download.py`。