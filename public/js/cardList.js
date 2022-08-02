const splideContainer = document.querySelectorAll(".splide__list");
const cardMounting = () => {
    document.addEventListener("DOMContentLoaded", function (event) {
        window.addEventListener("load", function () {
            const mount = () => {
                new Splide("#slider1").mount();
                new Splide("#slider2").mount();
            };

            function delay() {
                setTimeout(function () {
                    mount();
                }, 200);
            }

            if (document.readyState == "complete") {
                delay();
            } else {
                document.onreadystatechange = function () {
                    if (document.readyState === "complete") {
                        delay();
                    }
                };
            }
        });
    });
};

const splideContainerTemplate = (content) => {
    return `
    <li class="splide__slide">
        <div class="row main--table rounded-13">
            ${content}
        </div>
    </li>
    `;
};

const slideItemTemplate = (id) => {
    return `
    <div class="col-12 table-item py-2 ps-3 d-flex justify-content-between">
        <p>${id}</p>
        <a href="/dashboard/card/pair/?cardId=${id}" class="d-flex align-items-center pair--link">Pair to user</a>
    </div>
`;
};

const slideItemTemplateRegister = (id) => {
    return `
    <div class="col-12 table-item py-2 ps-3  d-flex justify-content-between">
        <p>${id}</p>
    </div>
`;
};

const loadAvailableCard = (container, url) => {
    startLoader();

    let slideItems = "";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    // get Data
    fetch(url, { signal: controller.signal })
        .then((res) => {
            if (res.ok) return res.json();
            throw "Can't get server response";
        })
        .then((data) => {
            cardId = 0;
            for (let section = 0; section < data.cardSection; section++) {
                for (let card = 0; card < 6; card++) {
                    // Create value of slider container
                    slideItems += slideItemTemplate(
                        data.cardList[cardId].card_number
                    );
                    cardId < data.numberOfCard ? cardId++ : cardId;
                    if (cardId === data.numberOfCard) break;
                }

                // Create slider container
                container.insertAdjacentHTML(
                    "beforeend",
                    splideContainerTemplate(slideItems)
                );
                slideItems = ""; //clear container
            }
            closeLoader();
            clearTimeout(timer);
            new Splide("#slider1").mount();

            const newDataContainer = document.querySelector(
                ".splide__slide.is-active>.row.main--table.rounded-13"
            );
            insertNewCard(newDataContainer);
        })
        .catch((error) => {
            closeLoader();
            clearTimeout(timer);
            showToast({
                theme: "danger",
                title: "Something wrong",
                desc: error,
            });
            new Splide("#slider1").mount();
        });
};

const loadUnavailableCard = (container, url) => {
    let slideItems = "";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    // get Data
    fetch(url, { signal: controller.signal })
        .then((res) => {
            if (res.ok) return res.json();
            throw "Can't get server response";
        })
        .then((data) => {
            cardId = 0;
            for (let section = 0; section < data.cardSection; section++) {
                for (let card = 0; card < 6; card++) {
                    // Create value of slider container
                    slideItems += slideItemTemplateRegister(
                        data.cardList[cardId].card_number
                    );
                    cardId < data.numberOfCard ? cardId++ : cardId;
                    if (cardId === data.numberOfCard) break;
                }

                // Create slider container
                container.insertAdjacentHTML(
                    "beforeend",
                    splideContainerTemplate(slideItems)
                );
                slideItems = ""; //clear container
            }
            closeLoader();
            clearTimeout(timer);
            new Splide("#slider2").mount();
        })
        .catch((error) => {
            closeLoader();
            clearTimeout(timer);
            showToast({
                theme: "danger",
                title: "Something wrong",
                desc: error,
            });
            new Splide("#slider2").mount();
        });
};

loadAvailableCard(splideContainer[0], "/api/v1/card/available");
loadUnavailableCard(splideContainer[1], "/api/v1/card/unavailable");
showFlashToast();

function insertNewCard(container) {
    const socket = io();
    socket.on("newRegisteredCard", (data) => {
        container.insertAdjacentHTML("afterbegin", slideItemTemplate(data));
    });
}
