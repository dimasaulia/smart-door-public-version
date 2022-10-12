const form = document.querySelector("form");
const cardId = document.querySelector("#card-id");
const btn = document.querySelector("#pairButton");
const pairButtonn = document.querySelector("#pairButton");

$("#username").autocomplete({
    source: "/api/v1/user/search",
});

btn.addEventListener("click", async (e) => {
    startLoader();
    e.preventDefault();
    const username = form.username.value;
    const cardValue = cardId.getAttribute("data-card");
    try {
        const res = await fetch("/api/v1/user/pair", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                cardNumber: cardValue,
            }),
        })
            .then((res) => {
                if (!res.ok) throw res.json();
                return res.json();
            })
            .then(() => {
                closeLoader();
                setToast({
                    status: "success",
                    title: "Berhasil Pairing",
                    msg: "Berhasil menautkan user dan kartu",
                });
                window.location = "/dashboard/card/list";
            });
    } catch (error) {
        closeLoader();
        const err = await error;
        showToast({
            theme: "danger",
            title: "Gagal pairing",
            desc: err.message || "Gagal menautkan user dan card",
        });
    }
});
