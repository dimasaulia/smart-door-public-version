const dropDownContent = document.querySelector(".form-dropdown");
const toggler = document.querySelector("#show-role");
const roleValues = document.querySelectorAll(".role");
const roleForm = document.querySelector("#userRole");
const usernameForm = document.querySelector("#username");
const userConatiner = document.querySelector(".user--list-container");
const showMoreBtn = document.querySelector("#showMore");
const searchBtn = document.querySelector("#search");
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
                    ? `<div data-role=${role.name} class="pointer">
                            <p class="bg-blue-2 text-neutral-7 py-2 px-4 rounded-13 mb-2" >Set User Role</p>
                        </div>`
                    : `<div data-role=${role.name} class="pointer">
                            <a href="#" class="bg-blue-3 text-neutral-7 py-2 px-4 rounded-13 mb-2" >Set Admin Role</a>
                        </div>`
            }
            
        </div>
        `;
};

toggler.addEventListener("click", () => {
    dropDownContent.classList.toggle("active-down");
});

roleValues.forEach((f) => {
    f.addEventListener("click", () => {
        roleForm.value = f.getAttribute("data-role");
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

const setAdminHandler = () => {
    document.querySelectorAll(".user--list-item").forEach((d) => {
        const updateBtn = d.children[2];
        if (!updateBtn.getAttribute("data-listener")) {
            const uuid = d.getAttribute("data-uuid");
            updateBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                const activeRole = updateBtn.getAttribute("data-role");
                if (activeRole === "USER") {
                    const updatedRole = await setter({
                        url: `/api/v1/user/set-admin/${uuid}`,
                        successMsg: "Succes update role",
                    });
                    if (updatedRole.success) {
                        updateBtn.textContent = "";
                        updateBtn.insertAdjacentHTML(
                            "beforeend",
                            `<p class="bg-blue-2 text-neutral-7 py-2 px-4 rounded-13 mb-2">
                                Set User Role
                                </p>`
                        );
                        updateBtn.setAttribute(
                            "data-role",
                            updatedRole.data.role.name
                        );
                    }
                }

                if (activeRole === "ADMIN") {
                    const updatedRole = await setter({
                        url: `/api/v1/user/set-user/${uuid}`,
                        successMsg: "Succes update role",
                    });
                    if (updatedRole.success) {
                        updateBtn.textContent = "";
                        updateBtn.insertAdjacentHTML(
                            "beforeend",
                            `<a href="#" class="bg-blue-3 text-neutral-7 py-2 px-4 rounded-13 mb-2" >Set Admin Role</a>`
                        );
                        updateBtn.setAttribute(
                            "data-role",
                            updatedRole.data.role.name
                        );
                    }
                }
            });
            updateBtn.setAttribute("data-listener", "true");
        }
    });
};

const userListLoader = (data) => {
    console.log(data);
    data.forEach((user) => {
        userConatiner.insertAdjacentHTML("beforeend", userListTemplate(user));
    });
    deleteHandler();
    setAdminHandler();
};

// INFO: First Load User List
generalDataLoader({ url: "/api/v1/user/list", func: userListLoader });

// INFO: First Load Search User List
searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const search = usernameForm.value;
    userConatiner.textContent = "";
    generalDataLoader({
        url: `/api/v1/user/list?search=${search}`,
        func: userListLoader,
    });
});
// INFO: Load More User List
showMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const cursor = lastCursorFinder(".user--list-item", "uuid");
    const search = usernameForm.value;
    if (search.length > 0) {
        generalDataLoader({
            url: `/api/v1/user/list/?cursor=${cursor}&search=${search}`,
            func: userListLoader,
        });
    }
    if (search.length === 0) {
        generalDataLoader({
            url: `/api/v1/user/list/?cursor=${cursor}`,
            func: userListLoader,
        });
    }
});
