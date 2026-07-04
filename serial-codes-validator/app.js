document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("serialForm");
    const input = document.getElementById("serialInput");
    const resultBox = document.getElementById("result");
    const button = form.querySelector("button");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const serial = input.value.trim().toUpperCase();

        if (!serial) {

            showMessage("Please enter a serial number.", "warning");

            return;

        }

        button.disabled = true;
        button.innerText = "Checking...";

        resultBox.innerHTML = `
            <div class="result-card checking">
                <div class="spinner"></div>
                <h3>Checking Serial Number...</h3>
                <p>Please wait.</p>
            </div>
        `;

        try {

            const res = await fetch("/api/verify", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    serial
                })

            });

            const data = await res.json();

            if (!data.success) {

                resultBox.innerHTML = `
                    <div class="result-card invalid">

                        <div class="icon">✖</div>

                        <h2>Invalid Serial Number</h2>

                        <p>
                            The serial number you entered was not found in our database.
                        </p>

                        <small>
                            Please check the serial number and try again.
                        </small>

                    </div>
                `;

            } else {

                resultBox.innerHTML = `
                    <div class="result-card valid">

                        <div class="icon">✔</div>

                        <h2>Authentic Product</h2>

                        <p><strong>Serial Number</strong></p>

                        <p>${data.serial}</p>

                        <p><strong>Batch</strong></p>

                        <p>${data.batch}</p>

                    </div>
                `;

            }

        }

        catch (err) {

            resultBox.innerHTML = `
                <div class="result-card invalid">

                    <div class="icon">⚠</div>

                    <h2>Connection Error</h2>

                    <p>

                        Unable to connect to the verification server.

                    </p>

                </div>
            `;

        }

        button.disabled = false;
        button.innerText = "Verify";

    });

    function showMessage(text) {

        resultBox.innerHTML = `
            <div class="result-card warning">
                ${text}
            </div>
        `;

    }

});