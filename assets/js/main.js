var icons = ["htmlicon","cssicon","javascripticon","bootstrap","javaicon","sqlicon",
    "mysqlicon","phpicon","laravelicon","wordpressicon","tailwindicon","linuxicon","csharpicon","sassicon"];
var text = ["HTML","CSS","JavaScript","Bootstrap","Java","SQL","MySQL","PHP","Laravel","Wordpress","Tailwind","Linux","C#","Sass"];
var frontendSkills = ["htmlicon","cssicon","javascripticon","bootstrap","tailwindicon","sassicon"];
var backendSkills = ["javaicon","sqlicon","mysqlicon","phpicon","laravelicon","csharpicon"]

console.log("hello");

let skills = document.getElementById("skills-icons");

let columnIcon = "";

for (let i=0; i<icons.length; i++) {
    columnIcon+=`<div class="col-lg-2 col-md-4 col-sm-6 col-12">
              <img src="assets/icons/${icons[i]}.svg"/>
              <p class="textIcon">${text[i]}</p>
            </div>`;
}
skills.innerHTML = columnIcon;




