# Pot-App 文字识别插件模板仓库 (以 [OCR Space](https://ocr.space/) 为例)

### 此仓库为模板仓库，编写插件时可以直接由此仓库创建插件仓库

## 插件编写指南

### 1. 插件仓库创建

- 以此仓库为模板创建一个新的仓库
- 仓库名为 `pot-app-recognize-plugin-<插件名>`，例如 `pot-app-recognize-plugin-ocrspace`

### 2. 插件信息配置

编辑 `info.json` 文件，修改以下字段：

- `id`：插件唯一 id，必须以`[plugin]`开头，例如 `[plugin].com.pot-app.ocrspace`
- `display`: 插件显示名称，例如 `OCR Space`
- `homepage`: 插件主页，填写你的仓库地址即可，例如 `https://github.com/pot-app/pot-app-recognize-plugin-template`
- `icon`: 插件图标，填写当前目录下的图标名称，例如 `icon.png`
- `needs`: 插件依赖，一个数组，每个依赖为一个对象，包含以下字段：
  - `key`: 依赖 key，对应该项依赖在配置文件中的名称，例如 `apikey`
  - `display`: 依赖显示名称，对应用户显示的名称，例如 `API Key`
  - `type`: 组件类型 `input` | `select`
  - `options`: 选项列表(仅 select 组件需要)，例如 `{"engine_a":"Engina A","engine_b":"Engina B"}`
- `language`: 插件支持的语言映射，将 pot 的语言代码和插件发送请求时的语言代码一一对应

### 3. 插件编写/编译

编辑 `main.js` 实现 `recognize` 函数

#### Input parameters

```javascript
// config: config map
// detect: detected source language
// setResult: function to set result text
// utils: some tools
//     http: tauri http module
//     readBinaryFile: function
//     readTextFile: function
//     Database: tauri Database class
//     CryptoJS: CryptoJS module
//     cacheDir: cache dir path
//     pluginDir: current plugin dir 
//     osType: "Windows_NT" | "Darwin" | "Linux"
async function recognize(base64, lang, options) {
  const { config, utils } = options;
  const { http, readBinaryFile, readTextFile, Database, CryptoJS, run, cacheDir, pluginDir, osType } = utils;
  const { fetch, Body } = http;
}
```

#### Return value

```javascript
return "result";
```

### 4. 打包 pot 插件

1. 将`main.js`文件和`info.json`以及图标文件压缩为 zip 文件。

2. 将文件重命名为`<插件id>.potext`，例如`plugin.com.pot-app.ocrspace.potext`,即可得到 pot 需要的插件。

```bash
zip plugin.com.pot-app.paddle-vl.zip main.js info.json icon.png
mv plugin.com.pot-app.paddle-vl.zip plugin.com.pot-app.paddle-vl.potext
```

### 5. 启动本地服务

https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL.html#41-docker-compose

启动paddle ocr 服务, 去A6000服务器上运行.
[PaddleOCR-VL Usage Guide](https://docs.vllm.ai/projects/recipes/en/latest/PaddlePaddle/PaddleOCR-VL.html)

```zsh
cd ~/vllm
source .venv/bin/activate
vllm serve PaddlePaddle/PaddleOCR-VL \
    --trust-remote-code \
    --max-num-batched-tokens 16384 \
    --no-enable-prefix-caching \
    --mm-processor-cache-gb 0 \
    --port 8001 # 默认8000
```

In Pot-App, edit the plugin configuration so service_url is just the base host (for example
`http://100.107.165.124:8001`); do not include `/layout-parsing`.