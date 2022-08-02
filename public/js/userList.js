const dropDownContent = document.querySelector(".form-dropdown");
const toggler = document.querySelector("#show-role");
const values = document.querySelectorAll(".role");
const form = document.querySelector("#userRole");
const usernameForm = document.querySelector("#username");
const userConatiner = document.querySelector(".user--list-container");
const showMoreBtn = document.querySelector("#showMore");
let isSearch = false;

const deleteUser = ({ url, username, element }) => {
    const del = showAlertConfirm({
        theme: "danger",
        title: "Sure for delete?",
        desc: `Apakah anda yakin menghaspus, <b> ${username} </b>?`,
        link: "#",
        btn: "Delete",
        exec: () => deleteAction({ url, element }),
    });
};

const userListTemplate = ({ username, id, role, profil }) => {
    return `
        <div
            class="mt-4 user--list-item d-flex flex-column flex-sm-row align-items-center justify-content-between bg-neutral-7 shadow-c-1 px-5 py-3 rounded-13" data-uuid=${id} data-username=${username}>
            <div class="user-profile d-flex flex-column flex-sm-row justify-content-start align-items-center">
                <div class="user-profile-picture bg-neutral-4 rounded-circle"></div>

                <div class="ms-4 mt-3 mt-sm-0">
                    <h5 class="fw-bold text-blue-4">${
                        profil.full_name || username
                    }</h5>
                    <p class="text-blue-3">${username}</p>
                    <p class="text-blue-3 uuid" data-uuid=${id}>${id}</p>
                </div>
            </div>

            <div class="d-flex my-4 my-sm-0">
                <a href="">
                    <img src="/image/icon_edit.svg" alt="" class="form-icons">
                </a>
                <a href="" class="ms-3">
                    <img src="/image/icon_delete.svg" alt="" class="form-icons">
                </a>
            </div>

            ${
                role.name === "ADMIN"
                    ? `<div>
                            <p class="bg-blue-2 text-neutral-7 py-2 px-4 rounded-13 mb-2">Sudah Admin</p>
                        </div>`
                    : `<div>
                            <a href="#" class="bg-blue-3 text-neutral-7 py-2 px-4 rounded-13 mb-2">Jadika Admin</a>
                        </div>`
            }
            
        </div>
        `;
};

toggler.addEventListener("click", () => {
    dropDownContent.classList.toggle("active-down");
});

values.forEach((f) => {
    f.addEventListener("click", () => {
        form.value = f.getAttribute("data-role");
        dropDownContent.classList.toggle("active-down");
    });
});

const deleteAction = ({ url, element }) => {
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
            console.log(data);
            showToast({
                theme: "success",
                title: "Delete berhasil",
                desc: `Berhasil menghapus ${data.data.username} dari database`,
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

async function fetcher(url) {
    startLoader();
    const response = await fetch(url);
    const data = await response.json();
    closeLoader();
    return data;
}

const deleteHandler = () => {
    // action for delete
    document.querySelectorAll(".user--list-item").forEach((d) => {
        const del_btn = d.children[1].children[1];
        if (!d.getAttribute("data-listener")) {
            del_btn.addEventListener("click", (e) => {
                e.preventDefault();
                const uuid = d.getAttribute("data-uuid");
                const username = d.getAttribute("data-username");
                const url = `/api/v1/user/delete/${uuid}`;

                deleteUser({ url, username, element: d });
            });
            d.setAttribute("data-listener", "true");
        }
    });
};

// LOAD ALL DATA
const loadAll = async () => {
    try {
        const data = await fetcher("/api/v1/user/search/all/?search=");
        data.forEach((user) => {
            userConatiner.insertAdjacentHTML(
                "beforeend",
                userListTemplate(user)
            );
        });
        deleteHandler();
    } catch (error) {
        showToast({
            theme: "danger",
            title: "Server error",
            desc: "Gagal memuat data, coba lagi!",
        });
    }
};

// Search
const search = async () => {
    usernameForm.addEventListener("keyup", async () => {
        userConatiner.innerHTML = "";
        try {
            const data = await fetcher(
                `/api/v1/user/search/all/?search=${usernameForm.value}`
            );
            data.forEach((user) => {
                userConatiner.insertAdjacentHTML(
                    "beforeend",
                    userListTemplate(user)
                );
            });
            deleteHandler();
        } catch (error) {
            showToast({
                theme: "danger",
                title: "Server error",
                desc: "Gagal memuat data, coba lagi!",
            });
        }
    });
};

loadAll();
search();

showMoreBtn.addEventListener("click", async () => {
    const uuid = document.querySelectorAll(".uuid");
    const lastId = uuid[uuid.length - 1].getAttribute("data-uuid");
    const data = await fetcher(
        `/api/v1/user/search/all/showmore?cursor=${lastId}&search=${usernameForm.value}`
    );
    data.forEach((user) => {
        userConatiner.insertAdjacentHTML("beforeend", userListTemplate(user));
    });
    deleteHandler();
});
