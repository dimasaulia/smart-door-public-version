async function fetcher(url) {
    startLoader();
    const response = await fetch(url);
    const data = await response.json();
    closeLoader();
    return data;
}

async function setter({
    url,
    body = null,
    successMsg = "Success execute task",
    successBody = successMsg,
    failedMsg = "Something Wrong",
    failedBody = "we are sorry can't execute your task",
}) {
    startLoader();
    let response;
    if (body) {
        response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    if (!body) {
        response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });
    }
    closeLoader();

    const data = await response.json();

    if (!data.success) {
        showToast({
            theme: "danger",
            title: failedMsg,
            desc:
                data.data.err ||
                data.data.error ||
                data.data.errors ||
                failedBody,
        });
        return { success: false, data: data.data };
    }

    if (data.success) {
        showToast({
            theme: "success",
            title: successMsg,
            desc: successBody,
        });
        return { success: true, data: data.data };
    }
}

async function generalDataLoader({ url, func, errHandler = false }) {
    const data = await fetcher(`${url}`);
    if (!data.success) {
        if (errHandler) {
            errHandler(data.data.err || data.data.error || data.data.errors);
        }
        if (!errHandler) {
            showToast({
                theme: "danger",
                title: "Something wrong",
                desc: data.data.err || data.data.error || data.data.errors,
            });
        }
    }

    if (data.success) {
        func(data.data);
    }
}

function lastCursorFinder(containerClass, attrName) {
    const container = document.querySelectorAll(containerClass);
    const lastCursor = container[container.length - 1].getAttribute(
        `data-${attrName}`
    );
    return lastCursor;
}
