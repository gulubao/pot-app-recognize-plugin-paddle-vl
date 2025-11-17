async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch } = utils;
    const rawServiceUrl = typeof config.service_url === "string" ? config.service_url.trim() : "";

    if (rawServiceUrl.length === 0) {
        throw "service_url not configured";
    }

    const normalized = rawServiceUrl.endsWith("/") ? rawServiceUrl.slice(0, -1) : rawServiceUrl;
    const normalizedLower = normalized.toLowerCase();
    const targetIsResponses = normalizedLower.endsWith("/responses");
    const targetIsChat = normalizedLower.endsWith("/chat/completions");

    let requestUrl;
    if (targetIsResponses || targetIsChat) {
        requestUrl = normalized;
    } else if (normalizedLower.endsWith("/v1")) {
        requestUrl = `${normalized}/chat/completions`;
    } else {
        requestUrl = `${normalized}/v1/chat/completions`;
    }

    const modelName = typeof config.model_name === "string" ? config.model_name.trim() : "";

    if (modelName.length === 0) {
        throw "model_name not configured";
    }

    const apiKey = typeof config.api_key === "string" ? config.api_key.trim() : "";

    const dataUrl = base64.startsWith("data:image/") ? base64 : `data:image/png;base64,${base64}`;
    const userInstruction = `Extract every readable character from this image. Preserve natural reading order, keep math and tables using Markdown, and reply only with text. Use language code ${lang || "auto"}.`;
    const systemContent = [
        {
            type: "text",
            text: "You are PaddleOCR-VL. Return the complete OCR transcription without commentary."
        }
    ];
    const userContent = [
        {
            type: "image_url",
            image_url: {
                url: dataUrl
            }
        },
        {
            type: "text",
            text: userInstruction
        }
    ];

    const payload = targetIsResponses
        ? {
            model: modelName,
            temperature: 0,
            max_output_tokens: 2048,
            input: [
                {
                    role: "system",
                    content: systemContent
                },
                {
                    role: "user",
                    content: userContent
                }
            ]
        }
        : {
            model: modelName,
            temperature: 0,
            max_tokens: 2048,
            messages: [
                {
                    role: "system",
                    content: systemContent
                },
                {
                    role: "user",
                    content: userContent
                }
            ]
        };

    const headers = {
        "content-type": "application/json"
    };

    if (apiKey.length > 0) {
        headers.authorization = `Bearer ${apiKey}`;
    }

    const res = await tauriFetch(requestUrl, {
        method: "POST",
        header: headers,
        body: {
            type: "Json",
            payload
        }
    });

    if (!res.ok) {
        throw JSON.stringify(res);
    }

    const collect = (parts) => {
        if (!Array.isArray(parts)) {
            return "";
        }
        return parts
            .map((part) => {
                if (typeof part?.text === "string") {
                    return part.text.trim();
                }
                if (typeof part?.data === "string") {
                    return part.data.trim();
                }
                return null;
            })
            .filter(Boolean)
            .join("\n\n");
    };

    const { data } = res;

    if (targetIsResponses) {
        const output = Array.isArray(data?.output) ? data.output : [];
        const text = output
            .map((item) => collect(item?.content))
            .filter((segment) => segment.length > 0)
            .join("\n\n");

        if (text.length === 0) {
            throw JSON.stringify(data);
        }

        return text;
    }

    const choices = Array.isArray(data?.choices) ? data.choices : [];

    if (choices.length === 0) {
        throw JSON.stringify(data);
    }

    const message = choices[0]?.message;
    let content = "";

    if (typeof message?.content === "string") {
        content = message.content.trim();
    } else {
        content = collect(message?.content);
    }

    if (content.length === 0) {
        throw JSON.stringify(data);
    }

    return content;
}
