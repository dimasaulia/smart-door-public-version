const showMoreRequestBtn = document.querySelector("#request-show-more");

const giveUserAccessAction = async (id, href) => {
    const pair = await setter({
        url: href,
        successMsg: "Success give access to user",
    });

    if (pair.success) {
        document.getElementById(`request-template-${id}`).remove();
        itemContainer.insertAdjacentHTML(
            "afterbegin",
            `<div
                class="accaptable-user d-flex mt-2 flex-column flex-sm-row justify-content-between align-items-md-center p-2 bg-neutral-7 rounded-5" id="card-id-${pair.data.card[0].card_number}" data-user-uuid=${pair.data.card[0].user.id}>
                <p class="text-neutral-1">${pair.data.card[0].card_name}@${pair.data.card[0].user.username}</p>
                <p class="text-neutral-2 bg-warning-2 p-1 rounded-10 pointer" onclick=deleteAccessHandler('${pair.data.card[0].card_number}') id="card-id-${pair.data.card[0].card_number}">Hapus akses</p>
            </div>`
        );
    }
};

const requestUserTemplate = ({
    card: { card_number, card_name, user },
    id,
}) => {
    return `
    <div class="col-12 mt-3 request-user" data-request="${id}" id="request-template-${id}">
        <div
            class="d-flex flex-column flex-sm-row justify-content-between p-2 bg-neutral-7 rounded-5">
            <p class="text-neutral-2">${card_name}@${
        user?.username || "Not paired"
    }</p>
            <p class="text-neutral-1 fw-bold request-link" onclick="giveUserAccessAction('${id}','/api/v1/room/pair?ruid=${ruid}&cardNumber=${card_number}&requestId=${id}')">Give Access</p>
        </div>
    </div>
    `;
};

const requestUserLoader = (data) => {
    data.forEach((card) => {
        accessContainer.insertAdjacentHTML(
            "beforeend",
            requestUserTemplate(card)
        );
    });
};

generalDataLoader({
    url: `/api/v1/room/requestUser/${ruid}`,
    func: requestUserLoader,
});

showMoreRequestBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const cursor = lastCursorFinder(".request-user", "request");
    generalDataLoader({
        url: `/api/v1/room/requestUser/${ruid}?cursor=${cursor}`,
        func: requestUserLoader,
    });
});
