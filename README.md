# Pot-App with paddle ocr vl

### 1. Package Pot Plugin

1. Compress the `main.js` file, `info.json`, and icon file into a zip file.

2. Rename the file to `<plugin_id>.potext`, for example `plugin.com.pot-app.ocrspace.potext`, to get the plugin required by pot.

```bash
zip plugin.com.pot-app.paddle-vl.zip main.js info.json icon.png
mv plugin.com.pot-app.paddle-vl.zip plugin.com.pot-app.paddle-vl.potext
```

### 2. Start vLLM Service

https://www.paddleocr.ai/latest/version3.x/pipeline_usage/PaddleOCR-VL.html#41-docker-compose

Start Paddle OCR service.
[PaddleOCR-VL Usage Guide](https://docs.vllm.ai/projects/recipes/en/latest/PaddlePaddle/PaddleOCR-VL.html)

```bash
# Deploy vLLM service on the server.
cd ~ 
mkdir vllm
uv venv
source .venv/bin/activate
# Until v0.11.1 release, you need to install vLLM from nightly build
uv pip install -U vllm --pre --extra-index-url https://wheels.vllm.ai/nightly --extra-index-url https://download.pytorch.org/whl/cu129 --index-strategy unsafe-best-match
```

```zsh
# Start vLLM service on the server.
cd ~/vllm
source .venv/bin/activate
vllm serve PaddlePaddle/PaddleOCR-VL \
    --trust-remote-code \
    --max-num-batched-tokens 16384 \
    --no-enable-prefix-caching \
    --mm-processor-cache-gb 0 \
    --port 8001 # default 8000
```

In Pot-App, edit the plugin configuration so service_url is just the base host (for example
`http://100.107.165.124:8001`); do not include `v1` or `chat/completions`.