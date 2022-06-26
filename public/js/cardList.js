const splideContainer = document.querySelector(".splide__list");
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
const loadCard = (container) => {
    startLoader();

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
            <a href="/pair/?cardId=${id}" class="d-flex align-items-center pair--link">Pair to user</a>
        </div>
    `;
    };

    let slideItems = "";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    // get Data
    fetch("/api/v1/card/list", { signal: controller.signal })
        .then((res) => res.json())
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
            new Splide("#slider2").mount();
        })
        .catch((err) => {
            closeLoader();
            alert("gagal memuat data");
            clearTimeout(timer);
            new Splide("#slider1").mount();
            new Splide("#slider2").mount();
        });
};

loadCard(splideContainer);

if (Cookies.get("toast")) {
    setTimeout(() => {
        showToast({
            theme: "success",
            title: "Berhasil pairing",
            desc: "Berhasil menautkan user dan card",
        });
    }, 300);
    Cookies.remove("toast", { path: "/list" });
}
