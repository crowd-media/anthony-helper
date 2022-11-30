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

// Adds a result row
function addResults({ result, pads, alpha_pattern }) {
    console.log("got response");
    const resultsElement = document.getElementById("results-table")
    const row = document.createElement("tr")

    let child
    child = document.createElement("td")
    child.innerHTML = result
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
    const sr_model = sr_enabled ? "sr_01" : ""

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
                        console.log({ data })
                        addResults({ result: data.result, pads, alpha_pattern })
                    })
                    .catch(err => { addError("Synthesis failed, check the console"), console.error(err) })
            } else {
                addError("Video does not exist")
            }
        }
        )
        .catch(err => addError("Video does not exist"))

}
