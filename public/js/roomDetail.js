startLoader();
const roomIdContainer = document.querySelector(".room-id");
const ruid = roomIdContainer.getAttribute("data-ruid");
const roomNameContainer = document.querySelector("#room-name");
const ruidContainer = document.querySelector("#ruid");
const itemContainer = document.querySelector(".item-container");
const accessContainer = document.querySelector(".activity-access");
const days = (date) => {
    return new Intl.DateTimeFormat("id", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
};
const accaptableUserTemplate = ({
    card_number,
    user: { username },
    createdAt,
}) => {
    return `
    <div
        class="d-flex mt-2 flex-column flex-sm-row justify-content-between p-2 bg-neutral-7 rounded-5">
        <p href="" class="text-neutral-1">${card_number}@${username}</p>
        <a href="" class="text-neutral-2">Memilik akses sejak    ${days(
            createdAt
        )}
        </a>
    </div>
    `;
};

const requestUserTemplate = ({
    card: {
        card_number,
        user: { username },
    },
}) => {
    return `
    <div class="col-12 mt-3">
                    <div
                        class="d-flex flex-column flex-sm-row justify-content-between p-2 bg-neutral-7 rounded-5">
                        <a href="" class="text-neutral-2">${card_number}@${username}</a>
                        <a href="" class="text-neutral-1 fw-bold">Give Access</a>
                    </div>
                </div>
    `;
};
// Basic Info
fetch(`/api/v1/room/detail/${ruid}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((data) => {
        roomIdContainer.textContent = `${data.name.toUpperCase()} Detail`;
        roomNameContainer.textContent = data.name.toUpperCase();
        ruidContainer.textContent = data.ruid;
        closeLoader();
    })
    .catch(async (err) => {
        closeLoader();
        const errors = await err;
        showToast({
            theme: "danger",
            title: errors.message,
            desc: "Gagal memuat info ruangan, coba lagi",
        });
    });

// accaptable User
fetch(`/api/v1/room/accaptableUser/${ruid}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((data) => {
        const cards = data.data[0].card;
        cards.forEach((card) => {
            itemContainer.insertAdjacentHTML(
                "afterbegin",
                accaptableUserTemplate(card)
            );
        });
        closeLoader();
    })
    .catch(async (err) => {
        closeLoader();
        const errors = await err;
        console.log(errors);
        showToast({
            theme: "danger",
            title: errors.message,
            desc: "Gagal memuat info ruangan, coba lagi",
        });
    });

// request user
fetch(`/api/v1/room/requestUser/${ruid}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((requestUser) => {
        requestUser.data.forEach((card) => {
            console.log(card);
            accessContainer.insertAdjacentHTML(
                "afterbegin",
                requestUserTemplate(card)
            );
        });
        closeLoader();
    })
    .catch(async (err) => {
        closeLoader();
        const errors = await err;
        console.log(errors);
        showToast({
            theme: "danger",
            title: errors.message,
            desc: "Gagal memuat info user, coba lagi",
        });
    });
