async function recognize(base64, _lang, options) {
    const { config, utils } = options;
    const { tauriFetch } = utils;
    const { service_url } = config;

    if (!service_url || service_url.length === 0) {
        throw "service_url not found";
    }

    const res = await tauriFetch(service_url, {
        method: "POST",
        header: {
            "content-type": "application/json"
        },
        body: {
            type: "Json",
            payload: {
                image: `data:image/png;base64,${base64}`,
                fileType: 1,
                showFormulaNumber: true,
                visualize: false
            }
        }
    });

    if (res.ok) {
        const { data } = res;
        if (data.markdown) {
            return data.markdown;
        }
        if (data.text) {
            return data.text;
        }
        if (data.result) {
            return typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
        }
        throw JSON.stringify(data);
    }
    throw JSON.stringify(res);
}