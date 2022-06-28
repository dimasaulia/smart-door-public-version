const submit = document.querySelector("#submit");
const form = document.querySelector("form");
submit.addEventListener("click", async (e) => {
    e.preventDefault();
    document.querySelector("#username--error").textContent = "";
    document.querySelector("#email--error").textContent = "";
    document.querySelector("#password--error").textContent = "";
    const username = form.username.value;
    const password = form.password.value;
    const email = form.email.value;

    await fetch("/api/v1/user/register", {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
        }),
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            if (!data.success) throw data;
            setToast({
                status: "success",
                title: "Berhasil Mendaftar",
                msg: "Berhasil mendaftarkan dan mengauntentikasi user",
            });
            return (window.location = "/dashboard/");
        })
        .catch((err) => {
            if (err.data.errors.meta) {
                const alreadyRegister = err.data.errors.meta.target;
                console.log(alreadyRegister);
                alreadyRegister.forEach((e) => {
                    document.querySelector(`#${e}--error`).textContent =
                        "Email already register";
                });
            }
            if (err.data.errors.type)
                document.querySelector(
                    `#${err.data.errors.type}--error`
                ).textContent = err.data.errors.msg;

            const formChecker = err.data.errors;
            if (formChecker && !formChecker.meta) {
                formChecker.forEach((data) => {
                    document.querySelector(
                        `#${data.param}--error`
                    ).textContent = data.msg;
                });
            }
        });
});
