document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("serialForm");
    const input = document.getElementById("serialInput");
    const resultBox = document.getElementById("result");
    const button = form.querySelector("button");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const serial = input.value.trim().toUpperCase();

        if (!serial) {
            showResult("warning", "Please enter a serial number.");
            return;
        }

        setLoading(true);

        try {

            const res = await fetch("/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ serial })
            });

            const data = await res.json();

            if (!data.success) {

                showResult("invalid", `
                    <div class="icon">✖</div>
                    <h2>Invalid Serial Number</h2>
                    <p>This serial number is not valid.</p>
                `);

            } else {

                showResult("valid", `
                    <div class="icon">✔</div>
                    <h2>Authentic Product</h2>

                    <p><strong>Serial:</strong></p>
                    <p>${data.serial || serial}</p>

                    <p><strong>Batch:</strong></p>
                    <p>${data.batch || "-"}</p>

                    <p><strong>Verification:</strong></p>
                    <p>${data.verificationCount ?? 0}</p>
                `);

            }

        } catch (err) {

            showResult("invalid", `
                <div class="icon">⚠</div>
                <h2>Connection Error</h2>
                <p>Server is not responding.</p>
            `);

        }

        setLoading(false);

    });

    function setLoading(state) {

        button.disabled = state;
        button.innerText = state ? "Checking..." : "Verify";

        if (state) {
            resultBox.innerHTML = `
                <div class="result-card checking">
                    <div class="spinner"></div>
                    <h3>Checking...</h3>
                    <p>Please wait</p>
                </div>
            `;
        }

    }

    function showResult(type, content) {

        resultBox.innerHTML = `
            <div class="result-card ${type}">
                ${content}
            </div>
        `;

    }

});