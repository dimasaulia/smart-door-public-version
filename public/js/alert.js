const notifyContainer = document.querySelector("body");
let closeAlert;
const alertTemplate = (icon, title, desc, color) => {
    return `
        <div class="alert--icon ${color}2 p-4 ro rounded-13">
            <img src="${icon}" alt="">
        </div>
        <h3 class="fw-bold mt-4">${title}</h3>
        <p class="mt-2">${desc}</p>
        <p class="mt-5 mb-4 shadow-c-1 fw-bolder text-neutral-7 btn ${color}1 py-2 px-4 rounded-13 close-alert">Done</p>
    `;
};

const showAlert = ({ theme, title, desc }) => {
    // showNotify();

    const icons = {
        success: "/image/icon_success.svg",
        warning: "/image/icon_warning.svg",
        danger: "/image/icon_error.svg",
    };

    const colors = {
        success: "bg-success-",
        warning: "bg-warning-",
        danger: "bg-danger-",
    };

    const div = document.createElement("div");
    div.classList.add(
        "alert",
        "shadow-c-1",
        "d-flex",
        "flex-column",
        "align-items-center",
        "bg-neutral-7",
        "p-3",
        "rounded-13"
    );
    div.insertAdjacentHTML(
        "afterbegin",
        alertTemplate(icons[theme], title, desc, colors[theme])
    );
    notifyContainer.appendChild(div);
    const activateAlert = () => {
        div.classList.add("active");
    };

    const deActivateAlert = () => {
        div.classList.remove("active");
    };

    setTimeout(() => {
        activateAlert();
        closeAlert = document.querySelectorAll(".close-alert");
        closeAlert.forEach((item) => {
            console.log(item.parentElement);
            item.addEventListener("click", (e) => {
                e.preventDefault();
                item.parentElement.classList.remove("active");
            });
        });
    }, 500);
};

// showAlert({
//     theme: "success",
//     title: "successfully pair user",
//     desc: "User and card successfuly paired",
// });

// showAlert({
//     theme: "danger",
//     title: "successfully pair user",
//     desc: "User and card successfuly paired",
// });
