startLoader();
const cardNumberContainer = document.querySelector(".card-number");
const cardNumber = cardNumberContainer.getAttribute("data-id");
const cardIcon = document.querySelector(".card-icon");
const roomContainer = document.querySelector(".request-room");
const accessableRoomContainer = document.querySelector(
    ".accessable-table-container"
);
const loadMoreRoomList = document.querySelector("#load-more");
const loadMoreAccessableRoom = document.querySelector(
    "#load-more-accessable-room"
);
// const roomRequestTemplate = ({ room: { ruid, name, id }, no, cardNumber }) => {
//     return `
//     <div class="room-item col-12" data-room-cursor=${id}>
//         <div class="row">
//             <div class="col-3">
//                 <p class="text-start">${no}</p>
//             </div>
//             <div class="col-3">
//                 <p class="text-start">${ruid}</p>
//             </div>
//             <div class="col-3">
//                 <p class="text-start">${name}</p>
//             </div>
//             <div class="col-3">
//                 <a href="/api/v1/room/u/request?ruid=${ruid}&cardNumber=${cardNumber}" class="text-start request">Request access</a>
//             </div>
//         </div>
//     </div>
//     `;
// };

const roomRequestTemplate = ({ room: { ruid, name, id }, no, cardNumber }) => {
    return `
    <div class="table-row d-flex align-items-center py-1 py-md-2 justify-content-between px-3 hardware--list-item" id="room-${id}" data-id="${id}" data-url="/api/v1/room/u/request?ruid=${ruid}&cardNumber=${cardNumber}">
        <span class="table-data align-middle text-center text-neutral-2">${no}</span>
        <p class="table-data text-center text-neutral-2" data-id="${ruid}">
            ${ruid}</p>
        <p class="table-data text-center text-neutral-2">
            ${name}</p>
        <span
            class="table-data text-center align-bottom text-blue-4 fw-bold pointer bg-blue-2 py-1 rounded-13 choose" onclick="requestRoom('${id}')">
            Request
        </span>
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

const requestRoom = async (id) => {
    const url = document.querySelector(`#room-${id}`).getAttribute("data-url");
    const resp = await setter({
        url,
    });
};

// INFO: Room List
const firstRoomListLoader = (data) => {
    data.forEach((room) => {
        let no = document.querySelectorAll(".hardware--list-item");
        roomContainer.insertAdjacentHTML(
            "beforeend",
            roomRequestTemplate({ room, no: no.length + 1, cardNumber })
        );
    });
};

generalDataLoader({
    url: `/api/v1/room/u/list`,
    func: firstRoomListLoader,
});

loadMoreRoomList.addEventListener("click", () => {
    const cursor = lastCursorFinder(".hardware--list-item", "id");
    generalDataLoader({
        url: `/api/v1/room/u/list?cursor=${cursor}`,
        func: firstRoomListLoader,
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
