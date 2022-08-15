const roomConatiner = document.querySelector(".room--list-container");

const del = ({ url, element }) => {
    startLoader();

    fetch(url, {
        method: "DELETE",
    })
        .then((res) => {
            if (!res.ok) throw "Something wrong";
            return res.json();
        })
        .then((data) => {
            closeLoader();
            showToast({
                theme: "success",
                title: "Delete berhasil",
                desc: `Berhasil menghapus ${data.data.name} dari database`,
            });
            element.remove();
        })
        .catch((e) => {
            closeLoader();
            showToast({
                theme: "danger",
                title: "Delete gagal",
                desc: "Gagal mengahpus user",
            });
        });
};

const deleteRoom = ({ url, roomName, element }) => {
    showAlertConfirm({
        theme: "danger",
        title: "Sure for delete?",
        desc: `apakah anda yakin menghaspus ruangan ${roomName}`,
        link: "#",
        btn: "Delete",
        exec: () => del({ url, element }),
    });
};

const roomListTemplate = ({ name, ruid }) => {
    return `
    <div
        class="room--list-item mt-3 d-flex flex-column flex-sm-row align-items-center justify-content-between bg-neutral-7 shadow-c-1 px-5 py-3 rounded-13" data-ruid="${ruid}" data-room-name="${name}">
        <div class="room-profile d-flex flex-column flex-sm-row justify-content-start align-items-center">
            <div class="room-profile-picture">
                <img src="/image/icon_room.svg" alt="">
            </div>

            <div class="ms-sm-4 ms-0 mt-3 mt-sm-0">
                <h5 class="fw-bold text-blue-4">${name}</h5>
                <p class="text-blue-3">${ruid}</p>
            </div>
        </div>

        <div class="d-flex mt-3 mt-sm-0 mb-4 mb-sm-0">
            <a href="">
                <img src="/image/icon_edit.svg" alt="" class="form-icons">
            </a>
            <a href="" class="ms-3">
                <img src="/image/icon_delete.svg" alt="" class="form-icons delete-room">
            </a>
        </div>

        <a href="/dashboard/room/detail/${ruid}" class="bg-blue-3 text-neutral-7 py-2 px-4 rounded-13">Detail</a>

    </div>
        `;
};

startLoader();
fetch("/api/v1/room/list")
    .then((res) => res.json())
    .then((rooms) => {
        rooms.data.forEach((room) => {
            roomConatiner.insertAdjacentHTML(
                "afterbegin",
                roomListTemplate(room)
            );
        });
        closeLoader();

        document.querySelectorAll(".room--list-item").forEach((room) => {
            const ruid = room.getAttribute("data-ruid");
            const name = room.getAttribute("data-room-name");
            const url = `/api/v1/room/delete/${ruid}`;
            const del_btn = room.children[1].children[1];
            del_btn.addEventListener("click", (e) => {
                e.preventDefault();
                deleteRoom({ url, element: room });
            });
        });
    })
    .catch((err) => {
        closeLoader();
        showToast({
            theme: "danger",
            title: "Server error",
            desc: "Gagal memuat data, coba lagi!",
        });
    });
