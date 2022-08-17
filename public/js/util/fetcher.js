async function fetcher(url) {
    startLoader();
    const response = await fetch(url);
    const data = await response.json();
    closeLoader();
    return data;
}

async function generalDataLoader({ url, func, errHandler = false }) {
    const data = await fetcher(`${url}`);
    if (!data.success) {
        if (errHandler) {
            errHandler(data.data.err || data.data.error || data.data.errors);
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
    console.log(lastCursor);
    return lastCursor;
}
