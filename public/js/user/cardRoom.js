startLoader();
const cardNumberContainer = document.querySelector(".card-number");
const cardNumber = cardNumberContainer.getAttribute("data-id");
const cardIcon = document.querySelector(".card-icon");
const roomContainer = document.querySelector(".request-room");
const accessableRoomContainer = document.querySelector(
    ".accessable-table-container"
);
const loadMoreRoomList = document.querySelector("#load-more-room-list");
const loadMoreAccessableRoom = document.querySelector(
    "#load-more-accessable-room"
);
const roomRequestTemplate = ({ room: { ruid, name, id }, no, cardNumber }) => {
    return `
    <div class="room-item col-12" data-room-cursor=${id}>
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

const accesableRoomTemplate = ({ ruid, name, id }) => {
    return `
    <div class="row bg-neutral-7 p-2 rounded-10 mt-2 accessables-room" data-accessable-room=${id}>
        <div class="col-6">
            <p class="text-center text-neutral-2">${ruid}</p>
        </div>
        <div class="col-6">
            <p class="text-center text-neutral-2">${name}</p>
        </div>
    </div>
    `;
};

const basicInfoLoader = (data) => {
    cardNumberContainer.textContent = data.info.card_name + " Accessable Room";
    cardIcon.setAttribute("src", `/image/icon_${data.info.type}.svg`);
};

// INFO: Basic Room info
const basicInfoErrHandler = (err) => {
    showToast({
        theme: "danger",
        title: err,
        desc: "Failed to load card image",
    });
};

generalDataLoader({
    url: `/api/v1/card/u/${cardNumber}`,
    func: basicInfoLoader,
    errHandler: basicInfoErrHandler,
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

// INFO: Room List
const roomListLoader = (data) => {
    let no = data.length;
    data.reverse().forEach((room) => {
        roomContainer.insertAdjacentHTML(
            "afterbegin",
            roomRequestTemplate({ room, no, cardNumber })
        );
        no--;
    });
    requestRoom();
};

const roomListLoaderMore = (data) => {
    let no = document.querySelectorAll(".room-item").length + 1;
    if (data.length === 0) {
        showAlert({
            theme: "warning",
            title: "Data already load",
            desc: "You have loaded all the data",
        });
    }

    data.forEach((room) => {
        roomContainer.insertAdjacentHTML(
            "beforeend",
            roomRequestTemplate({ room, no, cardNumber })
        );
        no++;
    });
    requestRoom();
};

const roomListErrHandler = (err) => {
    showToast({
        theme: "danger",
        title: err,
        desc: "Failed to load room list",
    });
};

generalDataLoader({
    url: `/api/v1/room/u/list`,
    func: roomListLoader,
    errHandler: roomListErrHandler,
});

loadMoreRoomList.addEventListener("click", () => {
    const cursor = lastCursorFinder(".room-item", "room-cursor");
    generalDataLoader({
        url: `/api/v1/room/u/list?cursor=${cursor}`,
        func: roomListLoaderMore,
        errHandler: roomListErrHandler,
    });
});

// INFO: Accessable Room
const accessableRoomLoader = (data) => {
    data.forEach((room) => {
        accessableRoomContainer.insertAdjacentHTML(
            "beforeend",
            accesableRoomTemplate(room)
        );
    });
};

const accessableRoomErrHandler = (err) => {
    showToast({
        theme: "danger",
        title: err,
        desc: "Failed to load accessable room list",
    });
};

generalDataLoader({
    url: `/api/v1/room/u/accesable/${cardNumber}`,
    func: accessableRoomLoader,
    errHandler: accessableRoomErrHandler,
});

loadMoreAccessableRoom.addEventListener("click", () => {
    const cursor = lastCursorFinder(".accessables-room", "accessable-room");
    generalDataLoader({
        url: `/api/v1/room/u/accesable/${cardNumber}?cursor=${cursor}`,
        func: accessableRoomLoader,
        errHandler: accessableRoomErrHandler,
    });
});
