startLoader();
const cardNumberContainer = document.querySelector(".card-number");
const cardNumber = cardNumberContainer.getAttribute("data-id");
const cardIcon = document.querySelector(".card-icon");
const roomContainer = document.querySelector(".request-room");
const accessableRoomContainer = document.querySelector(
    ".accessable-table-container"
);
const roomRequestTemplate = ({ room: { ruid, name }, no, cardNumber }) => {
    return `
    <div class="room-item col-12">
        <div class="row">
            <div class="col-3">
                <p class="text-start">${no}</p>
            </div>
            <div class="col-3">
                <p class="text-start">${ruid}</p>
            </div>
            <div class="col-3">
                <p class="text-start">${name}</p>
            </div>
            <div class="col-3">
                <a href="/api/v1/room/u/request?ruid=${ruid}&cardNumber=${cardNumber}" class="text-start request">Request access</a>
            </div>
        </div>
    </div>
    `;
};

const accesableRoomTemplate = ({ ruid, name }) => {
    return `
    <div class="row bg-neutral-7 p-2 rounded-10 mt-2">
        <div class="col-6">
            <p class="text-center text-neutral-2">${ruid}</p>
        </div>
        <div class="col-6">
            <p class="text-center text-neutral-2">${name}</p>
        </div>
    </div>
    `;
};

// Basic Info
fetch(`/api/v1/card/u/${cardNumber}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((data) => {
        cardNumberContainer.textContent =
            data.data.info.card_name + " Accessable Room";
        cardIcon.setAttribute("src", `/image/icon_${data.data.info.type}.svg`);
        closeLoader();
    })
    .catch(async (err) => {
        closeLoader();
        const errors = await err;
        showToast({
            theme: "danger",
            title: errors.message,
            desc: "Gagal memuat info kartu, coba lagi",
        });
    });

const requestRoom = async () => {
    const requestRoom = await document.querySelectorAll(".request");
    requestRoom.forEach((room) => {
        room.addEventListener("click", (e) => {
            e.preventDefault();
            const url = room.getAttribute("href");
            fetch(url, {
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
                    showToast({
                        theme: "success",
                        title: "Successfully request a room",
                        desc: `Permintaan ruangan berhasil dilakukan`,
                    });
                })
                .catch(async (err) => {
                    const errors = await err;
                    showToast({
                        theme: "danger",
                        desc: errors.message,
                        title: "Failed request a room",
                    });
                });
        });
    });
};

// room list
fetch(`/api/v1/room/u/list`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((rooms) => {
        let no = rooms.data.length;
        console.log(rooms.data);
        rooms.data.forEach((room) => {
            roomContainer.insertAdjacentHTML(
                "afterbegin",
                roomRequestTemplate({ room, no, cardNumber })
            );
            no--;
        });
        requestRoom();
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

// accessable room
fetch(`/api/v1/room/u/accesable/${cardNumber}`)
    .then((res) => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then((rooms) => {
        rooms.data.forEach((room) => {
            accessableRoomContainer.insertAdjacentHTML(
                "beforeend",
                accesableRoomTemplate(room)
            );
        });
        closeLoader();
    })
    .catch(async (err) => {
        closeLoader();
        const errors = await err;
        showToast({
            theme: "danger",
            title: errors.message,
            desc: "Gagal memuat accessable room",
        });
    });
