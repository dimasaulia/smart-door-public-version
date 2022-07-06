const cardContainer = document.querySelector(".card--list-container");

const cardListTemplate = ({ card_name, card_number, type }) => {
    return `
    <div
        class="card--list-item mt-3 pe-5 d-flex flex-column flex-sm-row align-items-center justify-content-between bg-neutral-7 shadow-c-1 p-3 rounded-13">
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

        <a href="" class="text-blue-3 fw-bold d-flex align-items-center">
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

startLoader();
fetch("/api/v1/u/card/available")
    .then((res) => {
        if (!res.ok) throw "";
        return res.json();
    })
    .then((payload) => {
        if (payload.data.length > 0) {
            payload.data.forEach((card) => {
                cardContainer.insertAdjacentHTML(
                    "afterbegin",
                    cardListTemplate(card)
                );
            });
        } else {
            cardContainer.insertAdjacentHTML(
                "afterbegin",
                "<h2>You dont have any card yet</h2>"
            );
        }
        closeLoader();
    })
    .catch((e) => {
        closeLoader();
        showToast({
            theme: "danger",
            title: "Server error",
            desc: "Gagal memuat data, coba lagi!",
        });
    });
