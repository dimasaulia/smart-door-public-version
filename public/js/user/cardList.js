const cardContainer = document.querySelector(".card--list-container");
const loadMore = document.querySelector("#load-more");
const search = document.querySelector("#cardname");
const searchBtn = document.querySelector("#search");

const cardListTemplate = ({ card_name, card_number, type, id }) => {
    return `
    <div
        class="card--list-item mt-3 pe-5 d-flex flex-column flex-sm-row align-items-center justify-content-between bg-neutral-7 shadow-c-1 p-3 rounded-13" data-cursor=${id}>
        <div
            class="card-profile d-flex flex-column flex-sm-row justify-content-start align-items-center">
            <div class="card-profile-picture">
                <img src="/image/icon_${type}.svg" alt="">
            </div>

            <div class="ms-4 mt-3 mt-sm-0">
                <h5 class="fw-bold text-blue-4">${
                    card_name || "Kartu anda"
                }</h5>
                <p class="text-blue-3">${card_number}</p>
            </div>
        </div>

        <a href="/room/${card_number}" class="text-blue-3 fw-bold d-flex align-items-center">
            <img src="/image/icon_room.svg" alt="" class="room-icons">
            <p class="ms-2">Room Settings</p>
        </a>
        <a href="/card/${card_number}" class="ms-5 me-5 text-blue-3 fw-bold d-flex align-items-center">
            <img src="/image/icon_log.svg" alt="" class="room-icons">
            <p class="ms-2">Logs</p>
        </a>
    </div>
    `;
};

const loader = (data) => {
    try {
        cardContainer.textContent = "";
        if (data.length > 0) {
            data.forEach((card) => {
                cardContainer.insertAdjacentHTML(
                    "beforeend",
                    cardListTemplate(card)
                );
            });
        } else {
            cardContainer.insertAdjacentHTML(
                "afterbegin",
                "<h2>You dont have any card yet</h2>"
            );
        }
    } catch (error) {
        closeLoader();
        showToast({
            theme: "danger",
            title: "Server error",
            desc: "Gagal memuat data, coba lagi!",
        });
    }
};

const loaderMore = (data) => {
    try {
        if (data.length === 0) {
            throw "card error";
        }
        data.forEach((card) => {
            cardContainer.insertAdjacentHTML(
                "beforeend",
                cardListTemplate(card)
            );
        });
    } catch (error) {
        showAlert({
            theme: "warning",
            title: "Data already load",
            desc: "You have loaded all the data",
        });
    }
};

generalDataLoader({
    url: "/api/v1/card/u/available",
    func: loader,
});

loadMore.addEventListener("click", () => {
    const lastCursor = lastCursorFinder(".card--list-item", "cursor");
    if (!search) {
        generalDataLoader({
            url: `/api/v1/card/u/available/?cursor=${lastCursor}`,
            func: loaderMore,
        });
    }
    if (search) {
        generalDataLoader({
            url: `/api/v1/card/u/available/?cursor=${lastCursor}&search=${search.value}`,
            func: loaderMore,
        });
    }
});

searchBtn.addEventListener("click", () => {
    const searchValue = search.value;
    generalDataLoader({
        url: `/api/v1/card/u/available?search=${searchValue}`,
        func: loader,
    });
});
