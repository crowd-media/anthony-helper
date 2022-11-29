class Auth {
	constructor() {
		document.querySelector("body").style.display = "none";
		const auth = localStorage.getItem("auth");
		this.validateAuth(auth);
	}

	validateAuth(auth) {
		// check if token is valid
		const token_data = JSON.parse(window.atob(auth.split(".")[1]))
		const exp = token_data.exp * 1000;
		const nowDate = new Date()
		const now = nowDate.getTime()
		if (now > exp) {
			localStorage.setItem("auth", null)
			window.location.assign("./index.html")
		} else {
			document.querySelector("body").style.display = "block";
		}
	}

	logOut() {
		localStorage.removeItem("auth");
		window.location.replace("/");
	}
}
