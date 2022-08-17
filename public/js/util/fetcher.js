async function fetcher(url) {
    startLoader();
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    closeLoader();
    return data;
}

async function generalDataLoader({ url, func }) {
    const data = await fetcher(`${url}`);
    func(data.data);
}

function lastCursorFinder(containerClass, attrName) {
    const container = document.querySelectorAll(containerClass);
    const lastCursor = container[container.length - 1].getAttribute(
        `data-${attrName}`
    );
    return lastCursor;
}
