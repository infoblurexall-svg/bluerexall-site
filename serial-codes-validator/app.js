document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("serialForm");
    const input = document.getElementById("serialInput");
    const resultBox = document.getElementById("result");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const serial = input.value.trim();

        if (!serial) {
            resultBox.innerHTML = "Please enter serial number";
            return;
        }

        resultBox.innerHTML = "Checking...";

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
                resultBox.innerHTML = `
                    <div style="color:red; font-weight:bold;">
                        ✖ Invalid Serial Number
                    </div>
                `;
                return;
            }

            resultBox.innerHTML = `
                <div style="color:lime; font-weight:bold;">
                    ✔ Valid Product
                </div>
                <p>Serial: ${data.serial}</p>
                <p>Batch: ${data.batch}</p>
                <p>Verification Count: ${data.verificationCount}</p>
            `;

        } catch (err) {
            resultBox.innerHTML = "Error connecting to server";
        }
    });

});