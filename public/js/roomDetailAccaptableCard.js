const userBtn = document.querySelector("#user-btn");

const deleteAccessHandler = (cardNumber) => {
    showAlertConfirm({
        theme: "warning",
        title: "Sure for delete?",
        desc: `Are you sure for removing user access`,
        link: "#",
        btn: "Delete",
        exec: async () => {
            const resp = await setter({
                url: "/api/v1/room/unpair",
                body: {
                    ruid,
                    cardNumber,
                },
            });
            if (resp.success) {
                document.querySelector(`#card-id-${cardNumber}`).remove();
            }
        },
    });
};

const accaptableUserTemplate = ({ card_name, user, id, card_number }) => {
    return `
    <div
        class="accaptable-user d-flex mt-2 flex-column flex-sm-row justify-content-between align-items-md-center p-2 bg-neutral-7 rounded-5" id="card-id-${card_number}" data-user-uuid=${id}>
        <p href="" class="text-neutral-1">${card_name}@${
        user?.username || "Not have user"
    }</p>
        <p class="text-neutral-2 bg-warning-2 p-1 rounded-10 pointer" onclick=deleteAccessHandler('${card_number}')>Hapus akses</p>
    </div>
    `;
};

const accaptableUserLoader = (data) => {
    data.forEach((card) => {
        itemContainer.insertAdjacentHTML(
            "beforeend",
            accaptableUserTemplate(card)
        );
    });
};

generalDataLoader({
    url: `/api/v1/room/accaptable-user/${ruid}`,
    func: accaptableUserLoader,
});

userBtn.addEventListener("click", () => {
    itemContainer.textContent = "";
    generalDataLoader({
        url: `/api/v1/room/accaptable-user/${ruid}`,
        func: accaptableUserLoader,
    });
    mode = "USER";
    logsBtn.classList.remove("active");
    userBtn.classList.add("active");
});

showMoreBtn.addEventListener("click", (e) => {
    if (mode === "USER") {
        const cursor = lastCursorFinder(".accaptable-user", "user-uuid");
        generalDataLoader({
            url: `/api/v1/room/accaptable-user/${ruid}?cursor=${cursor}`,
            func: accaptableUserLoader,
        });
    }
    e.preventDefault();
});
