const cardIDContainer = document.querySelector("#card-id");
const cardNameContainer = document.querySelector("#card-name");
const cardPinMatchContainer = document.querySelector("#is-new-pin-match");
const cardNumber = cardIDContainer.getAttribute("data-id");
const cardIcon = document.querySelector(".card-icon");
const form = document.querySelector("form");
const btn = document.querySelector("#save");

// INFO: Basic Info Loader
const basicInfoLoader = (data) => {
    cardNameContainer.value = data.info.card_name;
    cardIcon.setAttribute("src", `/image/icon_${data.info.type}.svg`);
};

const basicInfoErrHandler = (err) => {
    closeLoader();
    cardIDContainer.textContent = "Cant Find Card ID";
    showToast({
        theme: "danger",
        title: "Failed to load data",
        desc: err,
    });
};

generalDataLoader({
    url: `/api/v1/card/u/${cardNumber}`,
    func: basicInfoLoader,
    errHandler: basicInfoErrHandler,
});

form.currentPin.addEventListener("keyup", (e) => {
    const oldPin = form.currentPin.value;
    const newPin = form.newPin.value;
    const confirmNewPin = form.confirmPin.value;

    if (newPin !== confirmNewPin) {
        cardPinMatchContainer.textContent = "New Pin Doesn't Match";
    } else {
        if (newPin.length === 6 && confirmNewPin.length === 6) {
            cardPinMatchContainer.textContent = " ";
            if (oldPin.length === 6) {
                btn.disabled = false;
            } else {
                cardPinMatchContainer.textContent = "Please Fill Current Pin";
                btn.disabled = true;
            }
        }
    }
});

form.confirmPin.addEventListener("keyup", (e) => {
    const oldPin = form.currentPin.value;
    const newPin = form.newPin.value;
    const confirmNewPin = form.confirmPin.value;

    if (newPin !== confirmNewPin) {
        cardPinMatchContainer.textContent = "New Pin Doesn't Match";
        btn.disabled = true;
    } else {
        cardPinMatchContainer.textContent = " ";
        if (oldPin.length === 6) {
            btn.disabled = false;
        } else {
            cardPinMatchContainer.textContent = "Please Fill Current Pin";
            btn.disabled = true;
        }
    }
});

form.newPin.addEventListener("keyup", (e) => {
    const oldPin = form.currentPin.value;
    const newPin = form.newPin.value;
    const confirmNewPin = form.confirmPin.value;

    if (newPin !== confirmNewPin) {
        cardPinMatchContainer.textContent = "New Pin Doesn't Match";
        btn.disabled = true;
    } else {
        cardPinMatchContainer.textContent = " ";
        if (oldPin.length === 6) {
            btn.disabled = false;
        } else {
            cardPinMatchContainer.textContent = "Please Fill Current Pin";
            btn.disabled = true;
        }
    }
});

btn.addEventListener("click", (e) => {
    e.preventDefault();
    const oldPin = form.currentPin.value;
    const newPin = form.newPin.value;
    const confirmNewPin = form.confirmPin.value;
    const changePin = setter({
        url: `/api/v1/card/change-pin/${cardNumber}`,
        body: { oldPin, newPin, confirmNewPin },
        successMsg: "Success Change Pin",
    });
    if (changePin) {
        setTimeout(() => {
            return (window.location = `/card/${cardNumber}`);
        }, 3500);
    }
});
