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

const changeRole = async (id, username, target) => {
    document.querySelectorAll(`.role-${id}`).forEach((role) => {
        role.childNodes[1].classList.remove("bg-blue-1");
        role.childNodes[1].classList.remove("bg-blue-3");
        role.childNodes[1].classList.add("bg-blue-1");
    });

    if (target === "ADMIN") {
        const resp = await setter({
            url: "/api/v1/role/set-user-role",
            body: {
                username,
                rolename: target,
            },
            successMsg: "Success updated role",
            successBody: `Success change ${username} role to ${target}`,
        });
        if (resp.success) {
            document
                .querySelector(`#admin-${id}`)
                .childNodes[1].classList.remove("bg-blue-1");
            document
                .querySelector(`#admin-${id}`)
                .childNodes[1].classList.add("bg-blue-3");
        }
    }

    if (target === "ADMIN TEKNIS") {
        const resp = await setter({
            url: "/api/v1/role/set-user-role",
            body: {
                username,
                rolename: target,
            },
            successMsg: "Success updated role",
            successBody: `Success change ${username} role to ${target}`,
        });

        if (resp.success) {
            document
                .querySelector(`#teknis-${id}`)
                .childNodes[1].classList.remove("bg-blue-1");
            document
                .querySelector(`#teknis-${id}`)
                .childNodes[1].classList.add("bg-blue-3");
        }
    }

    if (target === "OPERATOR") {
        const resp = await setter({
            url: "/api/v1/role/set-user-role",
            body: {
                username,
                rolename: target,
            },
            successMsg: "Success updated role",
            successBody: `Success change ${username} role to ${target}`,
        });

        if (resp.success) {
            document
                .querySelector(`#operator-${id}`)
                .childNodes[1].classList.remove("bg-blue-1");
            document
                .querySelector(`#operator-${id}`)
                .childNodes[1].classList.add("bg-blue-3");
        }
    }

    if (target === "USER") {
        const resp = await setter({
            url: "/api/v1/role/set-user-role",
            body: {
                username,
                rolename: target,
            },
            successMsg: "Success updated role",
            successBody: `Success change ${username} role to ${target}`,
        });

        if (resp.success) {
            document
                .querySelector(`#user-${id}`)
                .childNodes[1].classList.remove("bg-blue-1");
            document
                .querySelector(`#user-${id}`)
                .childNodes[1].classList.add("bg-blue-3");
        }
    }
};

const userListTemplate = ({ username, id, role, profil }) => {
    return `
        <div
            class="mt-4 user--list-item d-flex flex-column flex-sm-row align-items-center justify-content-between bg-neutral-7 shadow-c-1 px-5 py-3 rounded-13" data-uuid=${id} data-username=${username}>
            <div class="user-profile d-flex flex-column flex-sm-row justify-content-start align-items-center">
                <div class="user-profile-picture bg-neutral-4 rounded-circle d-flex justify-content-center align-items-center">
                    <img src="${profil.photo}" alt="User profile">
                </div>

                <div class="ms-4 mt-3 mt-sm-0">
                    <h5 class="fw-bold text-blue-4">${
                        profil?.full_name || username
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

            <div>
                ${
                    role.name === "ADMIN"
                        ? `<p class="d-inline role-${id} hover-tool pointer" id="admin-${id}" data-hover="Super Admin" onclick="changeRole('${id}', '${username}','ADMIN')"> <img class="d-inline bg-blue-3 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_super_admin.svg" alt="Super Admin" > </p>`
                        : `<p class="d-inline role-${id} hover-tool pointer" id="admin-${id}" data-hover="Super Admin" onclick="changeRole('${id}', '${username}','ADMIN')"> <img class="d-inline bg-blue-1 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_super_admin.svg" alt="Super Admin" > </p>`
                }

                ${
                    role.name === "ADMIN TEKNIS"
                        ? `<p class="d-inline role-${id} hover-tool pointer" id="teknis-${id}" data-hover="Admin Teknis" onclick="changeRole('${id}', '${username}','ADMIN TEKNIS')"> <img class="d-inline bg-blue-3 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_admin_teknis.svg" alt="Admin Teknis" > </p>`
                        : `<p class="d-inline role-${id} hover-tool pointer" id="teknis-${id}" data-hover="Admin Teknis" onclick="changeRole('${id}', '${username}','ADMIN TEKNIS')"> <img class="d-inline bg-blue-1 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_admin_teknis.svg" alt="Admin Teknis" > </p>`
                }
                
                ${
                    role.name === "OPERATOR"
                        ? ` <p class="d-inline role-${id} hover-tool pointer" id="operator-${id}" data-hover="Operator" onclick="changeRole('${id}', '${username}','OPERATOR')"> <img class="d-inline bg-blue-3 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_role_operator.svg" alt="Operator" > </p>`
                        : ` <p class="d-inline role-${id} hover-tool pointer" id="operator-${id}" data-hover="Operator" onclick="changeRole('${id}', '${username}','OPERATOR')"> <img class="d-inline bg-blue-1 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_role_operator.svg" alt="Operator" > </p>`
                }

                ${
                    role.name === "USER"
                        ? `<p class="d-inline role-${id} hover-tool pointer" id="user-${id}" data-hover="User" onclick="changeRole('${id}', '${username}','USER')"> <img class="d-inline bg-blue-3 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_role_user.svg" alt="User" > </p>`
                        : `<p class="d-inline role-${id} hover-tool pointer" id="user-${id}" data-hover="User" onclick="changeRole('${id}', '${username}','USER')"> <img class="d-inline bg-blue-1 text-neutral-7 p-1 rounded-13 role-icon" src="/image/icon_role_user.svg" alt="User" > </p>`
                }
                
            </div>
            
        </div>
        `;
};

toggler.addEventListener("click", () => {
    dropDownContent.classList.toggle("active-down");
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

const userListLoader = (data) => {
    data.forEach((user) => {
        userConatiner.insertAdjacentHTML("beforeend", userListTemplate(user));
    });
    deleteHandler();
};

// INFO: First Load User List
generalDataLoader({ url: "/api/v1/user/list", func: userListLoader });

// INFO: First Load Search User List
searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const search = usernameForm.value;
    userConatiner.textContent = "";
    if (roleForm.value.length > 0) {
        generalDataLoader({
            url: `/api/v1/user/list?search=${search}&role=${roleForm.value}`,
            func: userListLoader,
        });
    } else {
        generalDataLoader({
            url: `/api/v1/user/list?search=${search}`,
            func: userListLoader,
        });
    }
});

document.addEventListener("keyup", (e) => {
    const search = usernameForm.value;
    e.preventDefault();
    if (e.key === "Enter" && search.length > 0) {
        e.preventDefault();
        userConatiner.textContent = "";
        generalDataLoader({
            url: `/api/v1/user/list?search=${search}`,
            func: userListLoader,
        });
    }
});

// INFO: Load More User List
showMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const cursor = lastCursorFinder(".user--list-item", "uuid");
    const search = usernameForm.value;
    if (search.length > 0) {
        generalDataLoader({
            url: `/api/v1/user/list/?cursor=${cursor}&search=${search}&role=${roleForm.value}`,
            func: userListLoader,
        });
    }
    if (search.length === 0) {
        generalDataLoader({
            url: `/api/v1/user/list/?cursor=${cursor}&role=${roleForm.value}`,
            func: userListLoader,
        });
    }
});

roleValues.forEach((f) => {
    f.addEventListener("click", () => {
        roleForm.value = f.getAttribute("data-role");
        dropDownContent.classList.toggle("active-down");
    });
});
