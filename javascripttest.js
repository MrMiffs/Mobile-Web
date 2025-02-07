console.log("JS file load success")

document.querySelector("#name").addEventListener("focus", console.log)

document.querySelector("#first").addEventListener("click", () => alert("Popup alert"))
document.querySelector("#first h1").addEventListener("click", (ev) => {
    ev.stopPropagation()
})

const nameInput = document.querySelector("#name")
const numberInput = document.querySelector("#number")

nameInput.addEventListener (
  "keyup", (ev) => {
      numberInput.vallue = ev.target.value.length
      document.body.append(nameInput)
      nameInput.remove()
  }
)

