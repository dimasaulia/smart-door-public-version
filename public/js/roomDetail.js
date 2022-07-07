startLoader();
const roomIdContainer = document.querySelector(".room-id");
const ruid = roomIdContainer.getAttribute("data-ruid");
const roomNameContainer = document.querySelector("#room-name");
const ruidContainer = document.querySelector("#ruid");
const itemContainer = document.querySelector(".item-container");
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
        <p href="" class="text-neutral-1">${username} - ${card_number}</p>
        <a href="" class="text-neutral-2">Memilik akses sejak    ${days(
            createdAt
        )}
        </a>
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
        console.log(cards);
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
