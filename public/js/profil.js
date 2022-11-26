const uploadBtnTrigger = document.querySelector(".form-upload-trigger");
const uploadForm = document.querySelector("#profil-picture");
const saveBtn = document.querySelector("#save-profil");
const verifyBtn = document.querySelector("#verify");
const passwordBtn = document.querySelector("#save-password");
const form = document.querySelector("#profile-form");
const usernameContainer = document.querySelector("#user-container");
uploadBtnTrigger.addEventListener("click", (e) => {
    uploadForm.click();
});

uploadForm.addEventListener("change", (e) => {
    const fileSize = uploadForm.files[0].size / 1024 / 1024; // in MiB
    if (fileSize > 2) {
        alert("File size exceeds 2 MiB");
    } else {
    }
});

saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const resp = await setter({
        url: "/api/v1/user/profile/update",
        body: {
            email: form.email.value,
            full_name: form.full_name.value,
            username: form.username.value,
        },
        failedBody: "Sorry we couldn't update your profile",
        successBody: "Successfully update your profile",
    });

    if (resp.success) {
        usernameContainer.textContent = resp.data.username;
    }
});

passwordBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const resp = await setter({
        url: "/api/v1/user/update/",
        body: {
            oldPassword: document.querySelector("#oldPassword").value,
            newPassword: document.querySelector("#newPassord").value,
        },
        failedBody: "Sorry cant update your password",
    });
});

try {
    verifyBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await setter({
            url: "/api/v1/user/email-send-verification",
            successMsg: "Success send verification",
            successBody: "Check your email to get verification link",
        });
    });
} catch (error) {}
