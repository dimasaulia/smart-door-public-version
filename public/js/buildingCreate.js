const operatorAddButton = document.getElementById("operatorAddButton");
const roomAddButton = document.getElementById("roomAddButton");
const operatorList = document.getElementById("operatorList");
const roomList = document.getElementById("roomList");
const operatorsCount = document.getElementById("operatorsCount");
const linkedRoomCount = document.getElementById("linkedRoomCount");
const saveButton = document.getElementById("save");
const buildingName = document.getElementById("buildingName");
const operators = new Set();
const roomsId = new Set();

const removeTableItem = (element) => {
    if (element.startsWith("operator")) {
        operators.delete(element.split("$")[1]);
        updateList(operators, "operator");
    }
    if (element.startsWith("room")) {
        roomsId.delete(element.split("$")[1]);
        updateList(roomsId, "room");
    }
};

const tableItemTemplate = (data) => {
    return `
    <div class="table-row d-flex py-2 py-md-2 justify-content-between px-3" id="${data}">
        <p class="table-data text-center text-neutral-2">${
            data.split("$")[1]
        }</p>
        <span class="table-data hover-tool me-1 pointer d-flex justify-content-center" 
            onclick = "removeTableItem('${data}')"
            data-hover="Delete">
            <img src="/image/icon_delete.svg" alt="Delete" class="image">
        </span>
    </div>
    `;
};

const updateList = (datas, type) => {
    if (type === "operator") {
        operatorList.textContent = "";
        datas.forEach((data) => {
            operatorList.insertAdjacentHTML(
                "beforeend",
                tableItemTemplate(`${type}$${data}`)
            );
        });
        operatorsCount.textContent = datas.size;
    }

    if (type === "room") {
        roomList.textContent = "";
        datas.forEach((data) => {
            roomList.insertAdjacentHTML(
                "beforeend",
                tableItemTemplate(`${type}$${data}`)
            );
        });
        linkedRoomCount.textContent = datas.size;
    }
};

$("#operator").autocomplete({
    source: "/api/v1/user/search?role=OPERATOR",
    select: function (event, ui) {
        event.preventDefault();
        document.querySelector("#operator").value = ui.item.label;
        document.querySelector("#operatorId").value = ui.item.value;
    },
});

$("#roomname").autocomplete({
    source: "/api/v1/room/autocomplate",
    select: function (event, ui) {
        event.preventDefault();
        document.querySelector("#roomname").value = ui.item.label;
        document.querySelector("#roomId").value = ui.item.value;
    },
});

operatorAddButton.addEventListener("click", (e) => {
    e.preventDefault();
    operators.add(document.querySelector("#operator").value);
    updateList(operators, "operator");
});

roomAddButton.addEventListener("click", (e) => {
    e.preventDefault();
    roomsId.add(document.querySelector("#roomId").value);
    updateList(roomsId, "room");
});

saveButton.addEventListener("click", async (e) => {
    const resp = await setter({
        url: "/api/v1/building/create/",
        body: {
            name: buildingName.value,
            usernames: [...operators],
            ruids: [...roomsId],
        },
    });
});
