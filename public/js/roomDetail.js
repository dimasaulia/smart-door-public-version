startLoader();
const roomIdContainer = document.querySelector(".room-id");
const ruid = roomIdContainer.getAttribute("data-ruid");
const roomNameContainer = document.querySelector("#room-name");
const ruidContainer = document.querySelector("#ruid");
const itemContainer = document.querySelector(".item-container");
const accessContainer = document.querySelector(".activity-access");
const visitorContainer = document.querySelector("#visitor");
const numberOfUserContainer = document.querySelector("#user");
const numberOfRequestUserContainer = document.querySelector("#request-user");
const showMoreBtn = document.querySelector("#logs-show-more");
const logsBtn = document.querySelector("#logs");
const userBtn = document.querySelector("#user");
let mode = "USER"; // antoher value is LOG

const days = (date) => {
    return new Intl.DateTimeFormat("id", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
};
const accaptableUserTemplate = ({
    card_number,
    user: { username },
    createdAt,
    id,
}) => {
    return `
    <div
        class="accaptable-user d-flex mt-2 flex-column flex-sm-row justify-content-between p-2 bg-neutral-7 rounded-5" data-user-uuid=${id}>
        <p href="" class="text-neutral-1">${card_number}@${username}</p>
        <a href="" class="text-neutral-2">Memilik akses sejak    ${days(
            createdAt
        )}
        </a>
    </div>
    `;
};

const roomLogsTemplate = ({
    Card: {
        card_number,
        user: { username },
    },
    id,
    createdAt,
    isSuccess,
}) => {
    return `
    <div
        class="room-log d-flex mt-2 flex-column flex-sm-row justify-content-between p-2 bg-neutral-7 rounded-5" data-room-log=${id}>
        <p href="" class="text-neutral-1">${card_number}@${username}</p>
        <a href="" class="text-neutral-2">${
            isSuccess ? "Berhasil " : "Gagal "
        }Mengakses ruangan pada    ${days(createdAt)}
        </a>
    </div>
    `;
};

const requestUserTemplate = ({
    card: {
        card_number,
        user: { username },
    },
    id,
}) => {
    return `
    <div class="col-12 mt-3">
        <div
            class="d-flex flex-column flex-sm-row justify-content-between p-2 bg-neutral-7 rounded-5">
            <a href="" class="text-neutral-2">${card_number}@${username}</a>
            <a href="/api/v1/room/pair?ruid=${ruid}&cardNumber=${card_number}&requestId=${id}" class="text-neutral-1 fw-bold request-link">Give Access</a>
        </div>
    </div>
    `;
};

// INFO: Basic Room Information Loader
const basicInfoLoader = (data) => {
    roomIdContainer.textContent = `${data.detailRoom.name.toUpperCase()} Detail`;
    roomNameContainer.textContent = data.detailRoom.name.toUpperCase();
    ruidContainer.textContent = data.detailRoom.ruid;
    visitorContainer.textContent = data.numberOfVisitor;
    numberOfUserContainer.textContent = data.accaptableUser;
    numberOfRequestUserContainer.textContent = data.requestUser;
};
generalDataLoader({
    url: `/api/v1/room/detail/${ruid}`,
    func: basicInfoLoader,
});

// INFO: Accaptable User List
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

// INFO: More Data Loader
showMoreBtn.addEventListener("click", (e) => {
    if (mode === "USER") {
        const cursor = lastCursorFinder(".accaptable-user", "user-uuid");
        generalDataLoader({
            url: `/api/v1/room/accaptable-user/${ruid}?cursor=${cursor}`,
            func: accaptableUserLoader,
        });
    }

    if (mode === "LOG") {
        const cursor = lastCursorFinder(".room-log", "room-log");
        generalDataLoader({
            url: `/api/v1/room/logs/${ruid}?cursor=${cursor}`,
            func: logsLoader,
        });
    }
    e.preventDefault();
});

// request user
fetch(`/api/v1/room/requestUser/${ruid}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((requestUser) => {
        requestUser.data.forEach((card) => {
            accessContainer.insertAdjacentHTML(
                "afterbegin",
                requestUserTemplate(card)
            );
        });
        const requestLink = document.querySelectorAll(".request-link");
        requestLink.forEach((link) => {
            const href = link.getAttribute("href");
            link.addEventListener("click", (e) => {
                startLoader();
                e.preventDefault();
                fetch(href, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                    .then((res) => {
                        if (!res.ok) throw res.json();
                        return res.json();
                    })
                    .then((data) => {
                        closeLoader();
                        link.parentElement.parentElement.remove();
                        showToast({
                            theme: "success",
                            title: data.message,
                            desc: "Success give access to card",
                        });
                    })
                    .catch(async (err) => {
                        closeLoader();
                        const errors = await err;
                        showToast({
                            theme: "danger",
                            title: "Failed to pair card",
                            desc: errors.message,
                        });
                    });
            });
        });
        closeLoader();
    })
    .catch(async (err) => {
        closeLoader();
        const errors = await err;
        showToast({
            theme: "danger",
            desc: errors.message,
            title: "Something wrong",
        });
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

const logsLoader = (data) => {
    console.log(data);
    data.forEach((card) => {
        itemContainer.insertAdjacentHTML("beforeend", roomLogsTemplate(card));
    });
};

logsBtn.addEventListener("click", () => {
    itemContainer.textContent = "";
    generalDataLoader({
        url: `/api/v1/room/logs/${ruid}`,
        func: logsLoader,
    });
    mode = "LOG";
    userBtn.classList.remove("active");
    logsBtn.classList.add("active");
});
