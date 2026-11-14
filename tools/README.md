# 校验下载的安卓安装包

下载 [校验工具 ZIP](https://znvk1388-cpu.github.io/doudizhu-screen-coach/downloads/apk-check-tools.zip)，完整解压，三个文件 verify-apk.bat、verify-apk.ps1、releases.json 保持在同一目录。把 APK 拖到 verify-apk.bat 上。

默认不需要 Android SDK 或管理员权限。脚本会计算 SHA-256，并与附带清单中的两个 0.6.17 安装包比对，改过文件名也可以识别。未知文件显示 UNVERIFIED，绝不会按通过处理。

## 两种检查的区别

- FILE_HASH_MATCH：文件字节与清单或你提供的期望哈希一致。**不是独立的签名有效性验证，也不保证应用适合所有设备。**
- APK_SIGNATURE_VERIFIED：额外调用 Android 官方 apksigner 验证了签名；有指定证书时，还会核对全部签名者指纹。
- SIGNATURE_NOT_CHECKED：没有找到 apksigner，只完成文件哈希比对。
- UNVERIFIED：检查未完成，不能当作通过。

清单与工具也应从本仓库取得。哈希一致回答的是“是不是同一个文件”，不单凭网页上的哈希建立作者身份。

## 命令行

~~~bat
verify-apk.bat "D:\Downloads\renamed.apk"
~~~

单独给期望哈希（只进行文件一致性检查）：

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\verify-apk.ps1 -Path "D:\Downloads\app.apk" -ExpectedSha256 b795c42e645d088506cf0a1149b41532c690cbf7fddce5526dc6e3ca9d5d0516
~~~

完整签名检查：安装 Android SDK Build Tools，设置好 Java，并将 apksigner 加到 PATH，或显式指定路径：

~~~powershell
.\verify-apk.ps1 -Path "D:\Downloads\app.apk" -ApkSigner "D:\Android\sdk\build-tools\35.0.0\apksigner.bat" -TrustedCertSha256 3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC
~~~

如 Java 未配置，可加 -JavaHome "D:\Java\jdk-17"。显式要求证书核验却没有 apksigner 时，以退出码 3 结束，不会静默跳过。

[Android 官方 apksigner 文档](https://developer.android.com/tools/apksigner)。

## 已发布文件

| 文件 | SHA-256 |
| --- | --- |
| 轻量版 doudizhu-coach-0.6.17-android-lite-arm64.apk | b795c42e645d088506cf0a1149b41532c690cbf7fddce5526dc6e3ca9d5d0516 |
| 完整版 doudizhu-coach-0.6.17-android-arm64.apk | 22734ecbd9bd819b4a9ecf9baafa555b1de6c390f10457f79c864b5aa9478d0b |

两版证书 SHA-256：3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC。

当前证书显示 CN=Android Debug，属于调试签名。仅凭这个名称不能证明该具体私钥公开；本页不作已泄露断言。正式签名及迁移方案尚未发布，请保留当前数据。

## 退出码

| 码 | 含义 |
| --- | --- |
| 0 | 所要求的检查完成，具体范围看 FILE_HASH_MATCH / APK_SIGNATURE_VERIFIED |
| 1 | 哈希不符、签名无效、证书不符或读取失败 |
| 2 | 参数或清单格式错误 |
| 3 | 未核验：未知文件、清单缺失，或要求的签名检查工具不可用 |

脚本使用 PowerShell/.NET 计算哈希，签名验证交给官方 apksigner，不自行解析或验证 APK 签名块。Windows PowerShell 5.1 与 PowerShell 7 的测试结果见本轮交付记录。
