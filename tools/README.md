# 校验下载的安装包

这里的脚本不需要安装 Android SDK、不需要管理员权限，用来回答一个问题：**我下到的这个 APK，是不是作者发布的那个文件。**

## 为什么需要自己校验

v0.6.16 的两个 APK 使用 Android **调试证书**（`CN=Android Debug`）签名。调试证书的私钥是公开的，任何人都能生成一个同包名、同指纹的"升级包"。因此：

- **签名指纹相同**只能说明"两个包用了同一张调试证书"，**不能证明**作者身份；
- 真正能证明"没被换过"的，是**文件 SHA-256 与官方公布值一致**。

正式签名版本发布后，本文档会更新为"证书指纹比对"为主。

## 已发布版本

| 文件 | 体积（字节） | SHA-256 |
|---|---|---|
| `doudizhu-coach-0.6.16-android-lite-arm64.apk` | 14,583,904 | `d7ee3352cc54b553922f7ae083474dada7c6541f30c17c5d6acf36ca94f18e98` |
| `doudizhu-coach-0.6.16-android-arm64.apk` | 79,006,455 | `31997a634097efbe7fd2d4d545e2ebc9c7edabd4066e5b8047459700666cd724` |

签名证书 SHA-256（两版相同）：`3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC`

## 用法

### Windows：双击 / 拖拽

把 APK 文件拖到 `verify-apk.bat` 上，或在命令行：

```bat
verify-apk.bat "D:\Downloads\doudizhu-coach-0.6.16-android-lite-arm64.apk"
```

带期望值可自动判定（不符则退出码 1）：

```bat
powershell -NoProfile -ExecutionPolicy Bypass -File verify-apk.ps1 ^
  -Path "D:\Downloads\doudizhu-coach-0.6.16-android-lite-arm64.apk" ^
  -ExpectedSha256 d7ee3352cc54b553922f7ae083474dada7c6541f30c17c5d6acf36ca94f18e98 ^
  -TrustedCertSha256 3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC
```

输出示例：

```
File : D:\Downloads\doudizhu-coach-0.6.16-android-lite-arm64.apk
Size : 14,583,904 bytes

SHA-256 (file) : D7EE3352CC54B553922F7AE083474DADA7C6541F30C17C5D6ACF36CA94F18E98
[ OK ] SHA-256 matches the published value.
Cert SHA-256   : 3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC
[ OK ] Certificate matches a trusted fingerprint.

[WARN] This is the well-known Android debug certificate (CN=Android Debug).
```

### Linux / macOS / Git Bash

```bash
sha256sum doudizhu-coach-0.6.16-android-lite-arm64.apk
# macOS: shasum -a 256 <file>
```

### 有 Android SDK 的话

```bash
apksigner verify --print-certs --verbose doudizhu-coach-0.6.16-android-lite-arm64.apk
```

## 退出码

| 码 | 含义 | 该怎么办 |
|---|---|---|
| 0 | 校验通过 | 可以安装 |
| 1 | 哈希或证书不匹配、文件损坏 | **不要安装**，重新下载；仍不符请提 issue |
| 2 | 参数缺失（没给文件路径） | 按提示拖文件或补参数 |

## 脚本做了什么

1. 读取整个文件算 SHA-256，与 `-ExpectedSha256` 比对；
2. 定位 ZIP 末尾的 EOCD → 找到中央目录 → 往前读 **APK Signing Block**（`APK Sig Block 42`）；
3. 遍历 ID-Value 对，取 v3（`0xf05368c0`）或 v2（`0x7109871a`）签名块，解析出第一个签名者证书的 DER，算 SHA-256；
4. 若该指纹等于 Android 调试证书的公开指纹，打印告警。

不依赖 `apksigner`、不依赖 Java，这也是脚本能在没装 SDK 的机器上直接跑的原因。

## 已知限制

- 只**解析**证书，不做完整签名验证（不校验签名本身是否有效、是否覆盖全部条目）。判断"文件有没有被换"用 SHA-256 更直接可靠。
- 不支持只做了 v1（JAR）签名的 APK，遇到会打印 `[WARN] No APK Signing Block found` 并跳过证书比对。
- Windows PowerShell 5.1 已测试；PowerShell 7 未测。
