startLoader();
const form = document.querySelector("form");
const cardNumber = document.querySelector(".card-id").getAttribute("data-card");
const cardType = document.querySelector("#card-type");
const cardIcon = document.querySelector(".card-icon");
const cardLogs = document.querySelector(".log-container");
const formCardName = form.cardName;
const days = (date) => {
    return new Intl.DateTimeFormat("id", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(date));
};

const times = (date) => {
    return new Intl.DateTimeFormat("id", {
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(date));
};

const logsTemplate = ({ createdAt, name, card_name, number }) => {
    return `
    <div class="log-info row p-2">
        <div class="col-3">
            <p class="fw-bold text-neutral-2">${number}</p>
        </div>
        <div class="col-3">
            <p class="fw-bold text-neutral-2">${name}</p>
        </div>
        <div class="col-3">
            <p class="fw-bold text-neutral-2">${days(createdAt)}</p>
        </div>
        <div class="col-3">
            <p class="fw-bold text-neutral-2">${times(createdAt)} WIB</p>
        </div>
    </div>
    `;
};

// Basic Info
fetch(`/api/v1/u/card/${cardNumber}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((data) => {
        const { card_number, card_name, type } = data.data.info;
        form.cardNumber.value = card_number;
        form.cardName.value = card_name;
        for (let index = 0; index < cardType.length; index++) {
            if (cardType.options[index].value === type) {
                cardType.options.selectedIndex = index;
            }
        }
        cardIcon.setAttribute("src", `/image/icon_${type}.svg`);
        closeLoader();
    })
    .catch((err) => {
        closeLoader();
        showToast({
            theme: "danger",
            title: "Server error",
            desc: "Gagal memuat data, coba lagi!",
        });
    });

// fetch logs
fetch(`/api/v1/u/card/logs/${cardNumber}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((data) => {
        let number = data.data.length;
        data.data.forEach((log) => {
            const {
                createdAt,
                room: { name },
                Card: { card_name },
            } = log;
            cardLogs.insertAdjacentHTML(
                "afterbegin",
                logsTemplate({ createdAt, name, card_name, number })
            );
            number--;
        });
    })
    .catch((err) => {
        showToast({
            theme: "danger",
            title: "Internal error",
            desc: "Gagal memuat logs",
        });
    });

// change name
formCardName.addEventListener("focusout", () => {
    console.log(formCardName.value);
});
