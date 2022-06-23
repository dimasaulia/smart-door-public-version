const splideContainer = document.querySelector(".splide__list");

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
// get Data
fetch("/api/v1/card/list")
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
            splideContainer.insertAdjacentHTML(
                "beforeend",
                splideContainerTemplate(slideItems)
            );
            slideItems = ""; //clear container
        }
    });
