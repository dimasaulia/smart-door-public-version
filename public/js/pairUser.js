const form = document.querySelector("form");
const cardId = document.querySelector("#card-id");
const btn = document.querySelector("#pairButton");
const pairButtonn = document.querySelector("#pairButton");

form.username.addEventListener("keyup", () => {
    console.log(
        form.username.value.length >= 4
            ? form.username.value
            : "Waiting for input"
    );
});

var availableTutorials = [
    "ActionScript",
    "Bootstrap",
    "C",
    "C++",
    "java",
    "Javascript",
    "Kotlin",
    "python",
    "Go",
    "Siwft",
];

$("#username").autocomplete({
    source: "/api/v1/user/search",
});

btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const username = form.username.value;
    const cardValue = cardId.getAttribute("data-card");
    console.log(cardValue);
    try {
        const res = await fetch("/api/v1/user/pair", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: username,
                cardNumber: cardValue,
            }),
        }).then(() => {
            alert("Sukses menambahkan data");
        });
    } catch (error) {
        console.log(error);
    }
});
