class Login {
	constructor(form, fields) {
		this.form = form;
		this.fields = fields;
		this.validateonSubmit();
	}

	validateonSubmit() {
		let self = this;

		this.form.addEventListener("submit", (e) => {
			e.preventDefault();


			const data = new FormData()
			const username = document.getElementById("username")
			const password = document.getElementById("password")
			data.append("username", username.value);
			data.append("password", password.value);

			console.log(this.form);
			console.log(this.form);
			fetch("https://talk.crowdmedia.com/token", { method: "POST", body: data })
				.then(
					res => res.json()
				).then(
					jsonRes => {
						localStorage.setItem("auth", jsonRes.access_token);
						this.form.submit()
					})
				.catch(err => console.log(err))

		});
	}


	setStatus(field, message, status) {
		const errorMessage = field.parentElement.querySelector(".error-message");

		if (status == "success") {
			if (errorMessage) {
				errorMessage.innerText = "";
			}
			field.classList.remove("input-error");
		}

		if (status == "error") {
			errorMessage.innerText = message;
			field.classList.add("input-error");
		}
	}
}

const form = document.querySelector(".loginForm");
if (form) {
	const fields = ["username", "password"];
	const validator = new Login(form, fields);
}
