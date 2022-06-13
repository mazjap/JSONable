console.log("Hi World!", browser);

let toggle = document.getElementById("enabled-toggle");
let title = document.getElementById("enabled-label");

toggle.addEventListener("click", toggleEnabled);
toggleEnabled();

function toggleEnabled() {
    const isChecked = toggle.checked;
    
    title.innerHTML = (
        "JSONable " + (
            isChecked
                ? "Enabled"
                : "Disabled"
        )
    )
}
