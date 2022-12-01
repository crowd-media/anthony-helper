const request_type = "synthesize_t2l"
const tts_provider = "apiaudio"
const tts_voice = "sara"

let errorTimeout;
// Shows an error message for 4s
function addError(error_msg) {
    console.log("got error");
    const errorElement = document.getElementById("error-container")
    errorElement.innerHTML = error_msg
    errorElement.classList.add("error-display")

    if (errorTimeout) {
        clearTimeout(errorTimeout)
    }

    errorTimeout = setTimeout(() => {
        errorElement.classList.remove("error-display")
        errorElement.innerHTML = ""
    }, 4000)
}

function checkLocalStorage() {
    const videoList = JSON.parse(localStorage.getItem("videos")) || []
    console.log(videoList);
    videoList.forEach((video) => {
        addResults(video)
    });
}

function clearLocalStorage() {
    localStorage.setItem("videos", "[]")
}

function addToLocalStorage(video) {
    const videoList = JSON.parse(localStorage.getItem("videos")) || []
    console.log(videoList);
    videoList.push(video)
    localStorage.setItem("videos", JSON.stringify(videoList))
}

function showVideo(src) {
    const videoElement = document.getElementById("video-element")
    videoElement.src = src
    videoElement.currentTime = 0
    videoElement.paused = false
}

// Adds a result row
function addResults(video) {
    const { result, face, pads, alpha_pattern } = video
    const resultsElement = document.getElementById("results-table")
    const row = document.createElement("tr")

    row.addEventListener("click", () => showVideo(result))

    let child
    child = document.createElement("td")
    child.innerHTML = face
    row.appendChild(child)

    child = document.createElement("td")
    child.innerHTML = pads
    row.appendChild(child)

    child = document.createElement("td")
    child.innerHTML = alpha_pattern
    row.appendChild(child)

    resultsElement.appendChild(row)
}

function handleClick() {
    const text = document.getElementById("text").value
    const org_id = document.getElementById("org_id").value
    const head_id = document.getElementById("head_id").value
    const video_id = document.getElementById("video_id").value
    const pads_raw = document.getElementById("pads").value
    const alpha_pattern_raw = document.getElementById("alpha_pattern").value
    const sr_enabled = document.getElementById("sr_enabled").checked
    const synth_model = sr_enabled ? "sd_nogan" : "sd_gan"
    const sr_model = sr_enabled ? "sr_01" : null

    const alpha_pattern = alpha_pattern_raw.split(",").map(Number)
    const pads = pads_raw.split(",").map(Number)
    const face = [org_id, head_id, video_id]

    if (pads.length !== 4) {
        addError("Malformatted pads")
        return
    }

    if (alpha_pattern.length !== 4) {
        addError("Malformatted alpha_pattern")
        return
    }

    const body = {
        request_type,
        face,
        synth_model,
        sr_model,
        alpha_pattern,
        alpha_pattern,
        pads, text,
        tts_provider,
        tts_voice,

    }

    const headers = {
        Authorization: `Bearer ${localStorage.getItem("auth")}`,
        Accept: 'application/json',
        //"Content-Type": "application/json"
    }

    console.log(JSON.stringify(body));
    fetch(`https://talk.crowdmedia.com/api/v1/crud/videos/${org_id}/${head_id}/${video_id}`, { headers })
        .then(data => data.json())
        .then((data) => {
            if (!data.detail) {
                fetch("https://talk.crowdmedia.com/api/v1/test_synthesize_t2l", {
                    method: "POST",
                    body: JSON.stringify({ body }),
                    headers:
                    {
                        Authorization: `Bearer ${localStorage.getItem("auth")}`,
                        Accept: 'application/json', "Content-Type": "application/json"
                    }
                })
                    .then(res => res.json())
                    .then(data => {
                        const video = { result: data.result, face, pads, alpha_pattern }
                        addResults(video)
                        addToLocalStorage(video)
                    })
                    .catch(err => { addError("Synthesis failed, check the console"), console.error(err) })
            } else {
                addError("Video does not exist")
            }
        }
        )
        .catch(err => addError("Video does not exist"))

}

checkLocalStorage()