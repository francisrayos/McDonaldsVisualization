var nextQuestion;
var finalResults;
var showResults;
var stateObesity;
var resetSimulation;

const requestData = async () => {

    // Import Data
    let bmiIndex = await d3.json("datasets/bmi-index.json");
    let menu = await d3.json("datasets/menu.json");
    let nutritionData = await d3.json("datasets/nutrition-data.json");
    let obesitybyState = await d3.json("datasets/obesity-by-state.json");
    let questions = await d3.json("datasets/questions.json");

    // WORK ON QUIZ

    let stateNutrition = nutritionData.filter(element => element.YearStart == 2016 && element.ClassID == "OWS" && (element.QuestionID == "Q037" || element.QuestionID == "Q036") && (element.Gender == "Male" || element.Gender == "Female") && (element.LocationAbbr != "US" && element.LocationAbbr != "PR" && element.LocationAbbr != "VI" && element.LocationAbbr != "GU"));

    // Mainly used for figuring out unique values for BMI/state
    let uniqueHeight = [...new Set(bmiIndex.map(bmiIndex => bmiIndex.Height))];
    let uniqueWeight = [...new Set(bmiIndex.map(bmiIndex => bmiIndex.Weight))];
    let uniqueState = [...new Set(stateNutrition.map(stateNutrition => stateNutrition.LocationDesc))]

    // Creates Empty Array for Inputs
    var submission = [];

    // Iterates Through Survey & Saves Inputs
    nextQuestion = function(number) {
        var container = d3.select("#survey");
        var question = questions[number];
        var choices = question["choices"];
    
        container.html("");
        container.append("div").attr("id", "question").html(question["question"]);

        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];
    
            var label = container.append("label").attr("class", "option").append("span").html(choice);
            var input = label.append("input").attr("type", "radio").attr("name", question["question"]).attr("value", choice);

            input.on("click", function(d, i) {
                if (number < questions.length - 1) {
                    submission.push(this.value);
                    nextQuestion(number+1);
                }
                else {
                    finalResults();
                    stateObesity();
                    personalBMI();
                    d3.selectAll(".main-menu").attr("visibility", "visible");
                    svgMain.attr("visibility", "visible");
                    d3.select("#survey").html("<div class=\"results\">" +
                    "<h2>Great! Now pick out items for your McDonald's meal!</h2>" + 
                    "<h2><i>You have selected <span id=\"num\">0</span> calories.</i><h2>" +
                    "<p id=\"final\"><i>Done ordering? Learn more about what your meal says about your health " +
                    "<a href=\"#\" onclick=\"showResults(); return false;\">here</a>.</i></p>" +
                    "</div>");
                }
            })
        };
        console.log(submission); // Allows User to See His/Her Choices
    }

    resetSimulation = function(){ 
        // Bring Survey Back
        document.getElementById("survey").scrollIntoView({ behavior: 'smooth' });

        // Reset Values
        submission = [];
        totalCal = 0;
        totalFat = 0;
        totalSugars = 0;
        totalProtein = 0;
        totalCarbs= 0;
        totalCholesterol = 0;
        nextQuestion(0);

        // Refill Circles with Logos
        d3.selectAll("#section-1").attr("fill", "url(#logo)");
        d3.selectAll("#section-2").attr("fill", "url(#logo)");
        d3.selectAll("#section-3").attr("fill", "url(#logo)");
        d3.selectAll("#section-4").attr("fill", "url(#logo)");
        d3.selectAll("#section-5").attr("fill", "url(#logo)");
        d3.selectAll("#section-6").attr("fill", "url(#logo)");
        d3.selectAll("#section-7").attr("fill", "url(#logo)");
        d3.selectAll("#section-8").attr("fill", "url(#logo)");
        d3.selectAll("#section-9").attr("fill", "url(#logo)");
        d3.selectAll("#section-10").attr("fill", "url(#logo)");

        // Remove Previous Results
        d3.select("#final-nutrition").remove();
        d3.select("#final-BMI").remove();
        d3.select("#final-state").remove();
        d3.select("#conclusion").remove();
    }

    stateObesity = function () {
        // 
        var state = submission[1];
        for (var i = 0; i <= obesitybyState.length-1; i++) {
            if (obesitybyState[i].NAME == submission[1]) {
                var rate = Math.round(obesitybyState[i].Obesity);
            }
        }
        document.getElementById("rate").innerHTML = rate;
        document.getElementById("curr-state").innerHTML = state;

        // Attaches Number of Obese Images Based on People/100
        var start = document.getElementById("final-state");
        for (var i = 0; i < rate; i++) {
            var new_obese = document.createElement("img");
            new_obese.src = "../design/obese.png";
            new_obese.style.width = "40px";
            new_obese.style.height = "40px";
            new_obese.style.marginTop = "10px";
            new_obese.style.marginBottom = "10px";
            start.appendChild(new_obese);
        }
    }

    personalBMI = function () {
        var gender = submission[0];
        var state = submission[1];
        var height = submission[2];
        var weight = submission[3];
        var bmi = (weight / height / height) * 10000; // Calculates BMI - Known Formula

        // Attaches Respective Weight Image
        if (bmi < 18.5) { 
            status = "underweight";
            document.getElementById("img").src = "../design/skinny.png";
        };
        if (bmi >= 18.5 && bmi <= 24.9) { 
            status = "normal weight"; 
            document.getElementById("img").src = "../design/normal-weight.png";
        };
        if (bmi >= 25 && bmi <= 29.9) { 
            status = "overweight"; 
            document.getElementById("img").src = "../design/overweight.png";
        };
        if (bmi >= 30) { 
            status = "obese"; 
            document.getElementById("img").src = "../design/obese.png";
        };

        // Attaches Percent Labels
        for (i = 0; i <= stateNutrition.length-1; i++) {
            if (stateNutrition[i].LocationDesc == state && stateNutrition[i].Gender == gender && stateNutrition[i].QuestionID == "Q037") {
                var over_percent = stateNutrition[i].Data_Value;
                var over = stateNutrition[i].Question;
            }
            if (stateNutrition[i].LocationDesc == state && stateNutrition[i].Gender == gender && stateNutrition[i].QuestionID == "Q036") {
                var obese_percent = stateNutrition[i].Data_Value;
                var obese = stateNutrition[i].Question;
            }
        }

        // Updates BMI Numbers & State Obesity Numbers
        document.getElementById("state").innerHTML = state;
        document.getElementById("status").innerHTML = status;
        document.getElementById("gender").innerHTML = gender;
        document.getElementById("over").innerHTML = over;
        document.getElementById("obese").innerHTML = obese;
        document.getElementById("over-percent").innerHTML = over_percent;
        document.getElementById("obese-percent").innerHTML = obese_percent;

        // Included in final-state div but requires BMI information
        if (status == "obese") {
            var state_compare = "You are currently one of those people.";
        } else {
            var state_compare = "Luckily for you, you aren't one of those people."
        }
        document.getElementById("included").innerHTML = state_compare;

        if (status == "obese") {
            var result = "What You Should Take Away: I'm hope you're McLovin' your life because it won't last long if you keep eating like this."
        }
        if (status == "overweight") {
            var result = "What You Should Take Away: Have you felt your pants getting tighter lately? It might be best for you to choose some healthier alternatives."
        }
        if (status == "normal weight") {
            var result = "What You Should Take Away: Good News! You can afford to have that extra side of fries next time. Looks like someone's been working out."
        }
        if (status == "underweight") {
            var result = "What You Should Take Away: If you're feeling hungry, McDonald's has got you covered. For you, the more the merrier!"
        }
        document.getElementById("finale").innerHTML = result;
    }

    // Attaches the Divs Used In Final Visualization
    finalResults = function () {
        var container = d3.select("body")
        container.html();
        container.append("div")
            .attr("id", "final-nutrition")
            .style("visibility", "hidden")
            .html("Some More Nutritional <br>Facts About Your Meal:" +
            "<br><br><p id=\"more\">Total Fat - <span id=\"fat\">0</span> g" +
            "<br><br>Sugars - <span id=\"sugar\">0</span> g" +
            "<br><br>Protein - <span id=\"protein\">0</span> g" +
            "<br><br>Carbohydrates - <span id=\"carbs\">0</span> g" +
            "<br><br>Cholesterol - <span id=\"cholesterol\">0</span> mg</p>");

        container.append("div")
            .attr("id", "final-BMI")
            .style("visibility", "hidden")
            .html("Based on your BMI index, you are currently <span id=\"status\">0</span>." +
            "<br><br><img id=\"img\" src=\"#\">" +
            "<br><br>Among the <span id=\"gender\"></span> population in <span id=\"state\"></span> there are <br>" +
            "<br><span id=\"over-percent\"></span><br><span id=\"over\"></span> <br>&" +
            "<br><span id=\"obese-percent\"></span><br><span id=\"obese\"></span>");

        container.append("div")
            .attr("id", "final-state")
            .style("visibility", "hidden")
            .html("<span id=\"rate\"></span> out of 100 people are obese in <span id=\"curr-state\"></span>." +
            "<br><br><span id=\"included\"></span><br><br>");
        
        container.append("div")
            .attr("id", "conclusion")
            .style("visibility", "hidden")
            .html("<i><span id=\"finale\"></span><i><br>" +
            "<a href=\"#\" onclick=\"resetSimulation(); return false;\">Start Over?</a>");
    }

    // Toggles Visibility to Show Final Results
    showResults = function() {
        var container = d3.select("#survey");
        container.html("");
        d3.select("#final-nutrition").style("visibility", "visible");
        d3.select("#final-BMI").style("visibility", "visible");
        d3.select("#final-state").style("visibility", "visible");
        d3.select("#conclusion").style("visibility", "visible");

        document.getElementById("final-BMI").scrollIntoView({ behavior: 'smooth' });

        // Hide Menus
        d3.selectAll(".main-menu").attr("visibility", "hidden");
        svgMain.attr("visibility", "hidden");
        svgBreakfast.style("visibility", "hidden");
        svgBeef.style("visibility", "hidden");
        svgChicken.style("visibility", "hidden");
        svgSalads.style("visibility", "hidden");
        svgSnacks.style("visibility", "hidden");
        svgDessert.style("visibility", "hidden");
        svgBeverage.style("visibility", "hidden");
        svgCoffee.style("visibility", "hidden");
        svgSmoothie.style("visibility", "hidden");
    }

    // Setting Plot Dimensions
    let svgMain = d3.select("#menu");
    let svgBreakfast = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 900)
        .style("background-color", "darkred")

    let svgBeef = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 350)
        .style("background-color", "darkred")

    let svgChicken = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 600)
        .style("background-color", "darkred")

    let svgSalads = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 200)
        .style("background-color", "darkred")

    let svgSnacks = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 350)
        .style("background-color", "darkred")

    let svgDessert = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 250)
        .style("background-color", "darkred")

    let svgBeverage = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 600)
        .style("background-color", "darkred")

    let svgCoffee = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 1600)
        .style("background-color", "darkred")

    let svgSmoothie = d3.select("#container").append("svg")
        .attr("width", 1200).attr("height", 650)
        .style("background-color", "darkred")

    // Might Delete These
    let width = svgMain.attr("width");
    let height = svgMain.attr("height");

    let paddingLeft = 100;
    let paddingRight = 100;
    let paddingTop = 100;
    let paddingBottom = 100;

    let plotWidth = width - paddingLeft - paddingRight;
    let plotHeight = height - paddingTop - paddingBottom;

    // Create food categories
    let breakfastItems = menu.filter(element => element.Category == "Breakfast");
    let uniqueBreakfast = [...new Set(breakfastItems.map(breakfastItems => breakfastItems.Item))];

    let beefporkItems = menu.filter(element => element.Category == "Beef & Pork");
    let uniqueBeef = [...new Set(beefporkItems.map(beefporkItems => beefporkItems.Item))];

    let chickenfishItems = menu.filter(element => element.Category == "Chicken & Fish");
    let uniqueChicken = [...new Set(chickenfishItems.map(chickenfishItems => chickenfishItems.Item))];

    let saladItems = menu.filter(element => element.Category == "Salads");
    let uniqueSalad = [...new Set(saladItems.map(saladItems => saladItems.Item))];

    let snackItems = menu.filter(element => element.Category == "Snacks & Sides");
    let uniqueSnack = [...new Set(snackItems.map(snackItems => snackItems.Item))];

    let dessertItems = menu.filter(element => element.Category == "Desserts");
    let uniqueDessert = [...new Set(dessertItems.map(dessertItems => dessertItems.Item))];
    
    let beverageItems = menu.filter(element => element.Category == "Beverages");
    let uniqueBeverage = [...new Set(beverageItems.map(beverageItems => beverageItems.Item))];

    let coffeeteaItems = menu.filter(element => element.Category == "Coffee & Tea");
    let uniqueCoffee = [...new Set(coffeeteaItems.map(coffeeteaItems => coffeeteaItems.Item))];

    let smoothieItems = menu.filter(element => element.Category == "Smoothies & Shakes");
    let uniqueSmoothie = [...new Set(smoothieItems.map(smoothieItems => smoothieItems.Item))];

    // Main Menu
    let categories = [...new Set(menu.map(menu => menu.Category))];

    categories.forEach(function(d) {

        let new_category = svgMain.selectAll("circle").data(categories);

        // Data Join: Circles
        new_category.enter()
            .append("circle")
            .attr("r", 100)
            .attr("class", "main-menu")
            .attr("id", "main-menu")
            .attr("visibility", "hidden")
            .style("stroke", "gold")
            .style("stroke-width", 2)
            .attr("transform", "translate(" + 300 + "," + paddingTop + ")")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("cy", function(d, i)  {
                if (d == "Breakfast" || d == "Beef & Pork" || d == "Chicken & Fish") { return 25; }
                else if (d == "Salads" || d == "Snacks & Sides" || d == "Desserts"){ return 300; }
                else { return 575; }
            })
            .attr("fill", function (d) {
                if (d == "Breakfast") { return "url(#breakfast)"; } 
                else if (d == "Beef & Pork") { return "url(#beef)"; } 
                else if (d == "Chicken & Fish") { return "url(#chicken)"; } 
                else if (d == "Salads") { return "url(#salads)"; } 
                else if (d == "Snacks & Sides") { return "url(#snacks)"; } 
                else if (d == "Desserts") { return "url(#desserts)"; } 
                else if (d == "Beverages") { return "url(#beverages)"; } 
                else if (d == "Coffee & Tea") { return "url(#coffee)"; } 
                else { return "url(#smoothies)"; }
            })
            .on("mouseover", function(d){ 
                d3.select(this).transition().duration(400).attr("r", 120);
                if (d == "Breakfast") { d3.selectAll(".breakfast").transition().duration(400).attr("x", 40).attr("y", 40); }
                else if (d == "Beef & Pork") { d3.selectAll(".beef").transition().duration(400).attr("x", 40).attr("y", 40); }
                else if (d == "Chicken & Fish") { d3.selectAll(".chicken").transition().duration(400) .attr("x", 40) .attr("y", 40); }
                else if (d == "Salads") { d3.selectAll(".salads").transition().duration(400).attr("x", 40).attr("y", 40); }
                else if (d == "Snacks & Sides") { d3.selectAll(".snacks").transition().duration(400).attr("x", 40).attr("y", 40); }
                else if (d == "Desserts") { d3.selectAll(".desserts").transition().duration(400).attr("x", 40).attr("y", 40); }
                else if (d == "Beverages") { d3.selectAll(".beverages").transition().duration(400).attr("x", 40).attr("y", 40); }
                else if (d == "Coffee & Tea") { d3.selectAll(".coffee").transition().duration(400).attr("x", 40).attr("y", 40);}
                else if (d == "Smoothies & Shakes") { d3.selectAll(".smoothies").transition().duration(400).attr("x", 40).attr("y", 40); }
            })
            .on("mouseout", function(d){ 
                d3.select(this).transition().duration(400).attr("r", 100);
                if (d == "Breakfast") { d3.selectAll(".breakfast").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Beef & Pork") { d3.selectAll(".beef").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Chicken & Fish") { d3.selectAll(".chicken").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Salads") { d3.selectAll(".salads").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Snacks & Sides") { d3.selectAll(".snacks").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Desserts") { d3.selectAll(".desserts").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Beverages") { d3.selectAll(".beverages").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Coffee & Tea") { d3.selectAll(".coffee").transition().duration(400).attr("x", 20).attr("y", 20); }
                else if (d == "Smoothies & Shakes") { d3.selectAll(".smoothies").transition().duration(400).attr("x", 20).attr("y", 20); }
            })
            .on("click", function() {
                // d3.selectAll(".main-menu").attr("visibility", "hidden");
                if (d3.select(this).attr("cx") == 0 && d3.select(this).attr("cy") == 25) {
                    document.getElementById("section-1").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".breakfast-menu").attr("visibility", "visible");
                    d3.selectAll(".breakfast-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 300 && d3.select(this).attr("cy") == 25) {
                    document.getElementById("section-2").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".beef-menu").attr("visibility", "visible");
                    d3.selectAll(".beef-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 600 && d3.select(this).attr("cy") == 25) {
                    document.getElementById("section-3").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".chicken-menu").attr("visibility", "visible");
                    d3.selectAll(".chicken-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 0 && d3.select(this).attr("cy") == 300) {
                    document.getElementById("section-4").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".salad-menu").attr("visibility", "visible");
                    d3.selectAll(".salad-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 300 && d3.select(this).attr("cy") == 300) {
                    document.getElementById("section-5").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".snacks-menu").attr("visibility", "visible");
                    d3.selectAll(".snacks-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 600 && d3.select(this).attr("cy") == 300) {
                    document.getElementById("section-6").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".dessert-menu").attr("visibility", "visible");
                    d3.selectAll(".dessert-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 0 && d3.select(this).attr("cy") == 575) {
                    document.getElementById("section-7").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".beverage-menu").attr("visibility", "visible");
                    d3.selectAll(".beverage-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 300 && d3.select(this).attr("cy") == 575) {
                    document.getElementById("section-8").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".coffee-menu").attr("visibility", "visible");
                    d3.selectAll(".coffee-back-button").attr("visibility", "visible");
                }
                else if (d3.select(this).attr("cx") == 600 && d3.select(this).attr("cy") == 575) {
                    document.getElementById("section-9").scrollIntoView({ behavior: 'smooth' });
                    d3.selectAll(".smoothie-menu").attr("visibility", "visible");
                    d3.selectAll(".smoothie-back-button").attr("visibility", "visible");
                }
            });

        // Data Join: Text
        new_category.enter()
            .append("text")
            .attr("class", "main-menu")
            .text(function(d) { return d; })
            .attr("transform", "translate(" + 300 + "," + paddingTop + ")")
            .attr("text-anchor", "middle")
            .style("text-transform", "uppercase")
            .attr("font-size", "18px")
            .attr("font-weight", 700)
            .attr("visibility", "hidden")
            .attr("fill", "gold")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i)  {
                if (d == "Breakfast" || d == "Beef & Pork" || d == "Chicken & Fish") { return 175; }
                else if (d == "Salads" || d == "Snacks & Sides" || d == "Desserts"){ return 450; }
                else { return 725; }
            })
        });

    // Update Nutrition Statements
    let totalCal = 0;
    function updateStatement (menu_item) {

        for (i = 0; i <= menu.length-1; i++) {
            if (menu[i].Item == menu_item) {
                totalCal += menu[i].Calories;
            }
        }
        document.getElementById("num").innerHTML = totalCal;
    }

    let totalFat = 0;
    function updateFat (menu_item) {

        for (i = 0; i <= menu.length-1; i++) {
            if (menu[i].Item == menu_item) {
                totalFat += menu[i]["Total Fat"];
            }
        }
        document.getElementById("fat").innerHTML = totalFat;
    }

    let totalSugars = 0;
    function updateSugar (menu_item) {

        for (i = 0; i <= menu.length-1; i++) {
            if (menu[i].Item == menu_item) {
                totalSugars += menu[i].Sugars;
            }
        }
        document.getElementById("sugar").innerHTML = totalSugars;
    }

    let totalProtein = 0;
    function updateProtein (menu_item) {

        for (i = 0; i <= menu.length-1; i++) {
            if (menu[i].Item == menu_item) {
                totalProtein += menu[i].Protein;
            }
        }
        document.getElementById("protein").innerHTML = totalProtein;
    }

    let totalCarbs = 0;
    function updateCarbs (menu_item) {

        for (i = 0; i <= menu.length-1; i++) {
            if (menu[i].Item == menu_item) {
                totalCarbs += menu[i].Carbohydrates;
            }
        }
        document.getElementById("carbs").innerHTML = totalCarbs;
    }

    let totalCholesterol = 0;
    function updateCholesterol (menu_item) {

        for (i = 0; i <= menu.length-1; i++) {
            if (menu[i].Item == menu_item) {
                totalCholesterol += menu[i].Cholesterol;
            }
        }
        document.getElementById("cholesterol").innerHTML = totalCholesterol;
    }

    // Breakfast Menu

    // Create Breakfast Back Buttion
    svgBreakfast.append("svg:image")
	    .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "breakfast-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".breakfast-menu").attr("visibility", "hidden");
            d3.selectAll(".breakfast-back-button").attr("visibility", "hidden");
        });

    svgBreakfast.append("text")
        .text("Back to Top")
        .attr("class", "breakfast-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueBreakfast.forEach(function (d) {

        let new_breakfast = svgBreakfast.selectAll("circle").data(uniqueBreakfast);

        // Date Join: Circles
        new_breakfast.enter().append("circle")
            .attr("r", 20)
            .attr("class", "breakfast-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-1")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else if (i >= 6 && i <= 8){ return 170; }
                else if (i >= 9 && i <= 11){ return 230; }
                else if (i >= 12 && i <= 14){ return 290; }
                else if (i >= 15 && i <= 17){ return 350; }
                else if (i >= 18 && i <= 20){ return 410; }
                else if (i >= 21 && i <= 23){ return 470; }
                else if (i >= 24 && i <= 26){ return 530; }
                else if (i >= 27 && i <= 29){ return 590; }
                else if (i >= 30 && i <= 32){ return 650; }
                else if (i >= 33 && i <= 35){ return 710; }
                else if (i >= 36 && i <= 38){ return 770; }
                else { return 830; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        new_breakfast.enter().append("text")
            .attr("class", "breakfast-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else if (i >= 6 && i <= 8){ return 205; }
                else if (i >= 9 && i <= 11){ return 265; }
                else if (i >= 12 && i <= 14){ return 325; }
                else if (i >= 15 && i <= 17){ return 385; }
                else if (i >= 18 && i <= 20){ return 445; }
                else if (i >= 21 && i <= 23){ return 505; }
                else if (i >= 24 && i <= 26){ return 565; }
                else if (i >= 27 && i <= 29){ return 625; }
                else if (i >= 30 && i <= 32){ return 685; }
                else if (i >= 33 && i <= 35){ return 745; }
                else if (i >= 36 && i <= 38){ return 805; }
                else { return 865; }
            });
    });

    // Beef & Pork Menu

    // Create Beef Back Button
    svgBeef.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "beef-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".beef-menu").attr("visibility", "hidden");
            d3.selectAll(".beef-back-button").attr("visibility", "hidden");
        })

    svgBeef.append("text")
        .text("Back to Top")
        .attr("class", "beef-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueBeef.forEach(function (d) {

        let new_beef = svgBeef.selectAll("circle");

        // Data Join: Circles
        new_beef.data(uniqueBeef).enter()
            .append("circle")
            .attr("r", 20)
            .attr("class", "beef-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-2")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else if (i >= 6 && i <= 8){ return 170; }
                else if (i >= 9 && i <= 11){ return 230; }
                else { return 290; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_beef.data(uniqueBeef).enter()
            .append("text")
            .attr("class", "beef-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else if (i >= 6 && i <= 8){ return 205; }
                else if (i >= 9 && i <= 11){ return 265; }
                else { return 325; }
            });
    });

    // Chicken & Fish Menu

    // Creates Chicken Back Button
    svgChicken.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "chicken-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".chicken-menu").attr("visibility", "hidden");
            d3.selectAll(".chicken-back-button").attr("visibility", "hidden");
        });

    svgChicken.append("text")
        .text("Back to Top")
        .attr("class", "chicken-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueChicken.forEach(function (d) {
        let new_chicken = svgChicken.selectAll("circle");

        // Data Join: Circles
        new_chicken.data(uniqueChicken).enter()
            .append("circle")
            .attr("r", 20)
            .attr("class", "chicken-menu")
            .attr("visibility", "hidden")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-3")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i)  {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else if (i >= 6 && i <= 8){ return 170; }
                else if (i >= 9 && i <= 11){ return 230; }
                else if (i >= 12 && i <= 14){ return 290; }
                else if (i >= 15 && i <= 17){ return 350; }
                else if (i >= 18 && i <= 20){ return 410; }
                else if (i >= 21 && i <= 23){ return 470; }
                else { return 530; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_chicken.data(uniqueChicken).enter()
            .append("text")
            .attr("class", "chicken-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i)  {
                //console.log(i)
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else if (i >= 6 && i <= 8){ return 205; }
                else if (i >= 9 && i <= 11){ return 265; }
                else if (i >= 12 && i <= 14){ return 325; }
                else if (i >= 15 && i <= 17){ return 385; }
                else if (i >= 18 && i <= 20){ return 445; }
                else if (i >= 21 && i <= 23){ return 505; }
                else { return 565; }
            });
    });

    // Salad Menu

    // Creates Salad Back Button
    svgSalads.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "salad-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".salad-menu").attr("visibility", "hidden");
            d3.selectAll(".salad-back-button").attr("visibility", "hidden");
        });

    svgSalads.append("text")
        .text("Back to Top")
        .attr("class", "salad-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueSalad.forEach(function (d) {

        let new_salad = svgSalads.selectAll("circle").data(uniqueSalad);

        // Data Join: Circles
        new_salad.enter().append("circle")
            .attr("r", 20)
            .attr("class", "salad-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-4")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else { return 110; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_salad.enter().append("text")
            .attr("class", "salad-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else { return 145; }
            });
    });

    // Snacks & Sides Menu
    
    // Creates Snack Back Button
    svgSnacks.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "snacks-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".snacks-menu").attr("visibility", "hidden");
            d3.selectAll(".snacks-back-button").attr("visibility", "hidden");
        });

    svgSnacks.append("text")
        .text("Back to Top")
        .attr("class", "snacks-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueSnack.forEach(function (d) {

        let new_snack = svgSnacks.selectAll("circle").data(uniqueSnack);

        // Data Join: Circles
        new_snack.enter().append("circle")
            .attr("r", 20)
            .attr("class", "snacks-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-5")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else if (i >= 6 && i <= 8){ return 170; }
                else if (i >= 9 && i <= 11){ return 230; }
                else { return 290; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_snack.enter().append("text")
            .attr("class", "snacks-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else if (i >= 6 && i <= 8){ return 205; }
                else if (i >= 9 && i <= 11){ return 265; }
                else { return 325; }
            });
    });

    // Dessert Menu

    // Creates Dessert Back Button
    svgDessert.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "dessert-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".dessert-menu").attr("visibility", "hidden");
            d3.selectAll(".dessert-back-button").attr("visibility", "hidden");
        });

    svgDessert.append("text")
        .text("Back to Top")
        .attr("class", "dessert-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueDessert.forEach(function (d) {

        let new_dessert = svgDessert.selectAll("circle").data(uniqueDessert);

        // Data Join: Circles
        new_dessert.enter().append("circle")
            .attr("r", 20)
            .attr("class", "dessert-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-6")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else { return 170; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_dessert.enter().append("text")
            .attr("class", "dessert-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else { return 205; }
            });
    });

    // Beverage Menu

    // Creates Beverage Back Button
    svgBeverage.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "beverage-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".beverage-menu").attr("visibility", "hidden");
            d3.selectAll(".beverage-back-button").attr("visibility", "hidden");
        });

    svgBeverage.append("text")
        .text("Back to Top")
        .attr("class", "beverage-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueBeverage.forEach(function (d) {

        let new_beverage = svgBeverage.selectAll("circle").data(uniqueBeverage);

        // Data Join: Circles
        new_beverage.enter().append("circle")
            .attr("r", 20)
            .attr("class", "beverage-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-7")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else if (i >= 6 && i <= 8){ return 170; }
                else if (i >= 9 && i <= 11){ return 230; }
                else if (i >= 12 && i <= 14){ return 290; }
                else if (i >= 15 && i <= 17){ return 350; }
                else if (i >= 18 && i <= 20){ return 410; }
                else if (i >= 21 && i <= 23){ return 470; }
                else { return 530; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_beverage.enter().append("text")
            .attr("class", "beverage-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else if (i >= 6 && i <= 8){ return 205; }
                else if (i >= 9 && i <= 11){ return 265; }
                else if (i >= 12 && i <= 14){ return 325; }
                else if (i >= 15 && i <= 17){ return 385; }
                else if (i >= 18 && i <= 20){ return 445; }
                else if (i >= 21 && i <= 23){ return 505; }
                else { return 565; }
            });
    });

    // Coffee & Tea Menu

    // Creates Coffee Back Button
    svgCoffee.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "coffee-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".coffee-menu").attr("visibility", "hidden");
            d3.selectAll(".coffee-back-button").attr("visibility", "hidden");
        });

    svgCoffee.append("text")
        .text("Back to Top")
        .attr("class", "coffee-back-button")
        .attr("x", 7)
        .attr("y", 80)
        .attr("font-size", "12px")
        .attr("fill", "gold")
        .attr("visibility", "hidden");

    uniqueCoffee.forEach(function (d) {

        let new_coffee = svgCoffee.selectAll("circle").data(uniqueCoffee);

        // Data Join: Circles
        new_coffee.enter().append("circle")
            .attr("r", 20)
            .attr("class", "coffee-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(150,0)")
            .attr("cx", function(d, i){ return (300 * (i % 4));})
            .attr("id", "section-8")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 3) { return 50; }
                else if (i >= 4 && i <= 7){ return 110; }
                else if (i >= 8 && i <= 11){ return 170; }
                else if (i >= 12 && i <= 15){ return 230; }
                else if (i >= 16 && i <= 19){ return 290; }
                else if (i >= 20 && i <= 23){ return 350; }
                else if (i >= 24 && i <= 27){ return 410; }
                else if (i >= 28 && i <= 31){ return 470; }
                else if (i >= 32 && i <= 35){ return 530; }
                else if (i >= 26 && i <= 39){ return 590; }
                else if (i >= 40 && i <= 43){ return 650; }
                else if (i >= 44 && i <= 47){ return 710; }
                else if (i >= 48 && i <= 51){ return 770; }
                else if (i >= 52 && i <= 55){ return 830; }
                else if (i >= 56 && i <= 59){ return 890; }
                else if (i >= 60 && i <= 63){ return 950; }
                else if (i >= 64 && i <= 67){ return 1010; }
                else if (i >= 68 && i <= 71){ return 1070; }
                else if (i >= 72 && i <= 75){ return 1130; }
                else if (i >= 76 && i <= 79){ return 1190; }
                else if (i >= 80 && i <= 83){ return 1250; }
                else if (i >= 84 && i <= 87){ return 1310; }
                else if (i >= 88 && i <= 91){ return 1370; }
                else if (i >= 92 && i <= 95){ return 1430; }
                else { return 1490; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_coffee.enter().append("text")
            .attr("class", "coffee-menu")
            .text(function(d) { return d; })
            .attr("font-size", "9px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(150,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 4));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 3) { return 85; }
                else if (i >= 4 && i <= 7){ return 145; }
                else if (i >= 8 && i <= 11){ return 205; }
                else if (i >= 12 && i <= 15){ return 265; }
                else if (i >= 16 && i <= 19){ return 325; }
                else if (i >= 20 && i <= 23){ return 385; }
                else if (i >= 24 && i <= 27){ return 445; }
                else if (i >= 28 && i <= 31){ return 505; }
                else if (i >= 32 && i <= 35){ return 565; }
                else if (i >= 26 && i <= 39){ return 625; }
                else if (i >= 40 && i <= 43){ return 685; }
                else if (i >= 44 && i <= 47){ return 745; }
                else if (i >= 48 && i <= 51){ return 805; }
                else if (i >= 52 && i <= 55){ return 865; }
                else if (i >= 56 && i <= 59){ return 925; }
                else if (i >= 60 && i <= 63){ return 985; }
                else if (i >= 64 && i <= 67){ return 1045; }
                else if (i >= 68 && i <= 71){ return 1105; }
                else if (i >= 72 && i <= 75){ return 1165; }
                else if (i >= 76 && i <= 79){ return 1225; }
                else if (i >= 80 && i <= 83){ return 1285; }
                else if (i >= 84 && i <= 87){ return 1345; }
                else if (i >= 88 && i <= 91){ return 1405; }
                else if (i >= 92 && i <= 95){ return 1465; }
                else { return 1525; }
            })
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });
    });

    // Smoothies & Shakes Menu

    // Creates Smoothie Back Button
    svgSmoothie.append("svg:image")
        .attr("xlink:href", "../design/back-to-top.png")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", 40)
        .attr("height", 40)
        .attr("class", "smoothie-back-button")
        .attr("visibility", "hidden")
        .on("click", function () {
            document.getElementById("container").scrollIntoView({ behavior: 'smooth' });
            d3.selectAll(".main-menu").attr("visibility", "visible");
            d3.selectAll(".smoothie-menu").attr("visibility", "hidden");
            d3.selectAll(".smoothie-back-button").attr("visibility", "hidden");
        });

    svgSmoothie.append("text")
        .text("Back to Top")
        .attr("class", "smoothie-back-button")
        .attr("x", 70)
        .attr("y", 45)
        .attr("fill", "gold")
        .attr("visibility", "hidden");    

    uniqueSmoothie.forEach(function (d) {

        let new_smoothie = svgSmoothie.selectAll("circle").data(uniqueSmoothie);

        // Data Join: Circles
        new_smoothie.enter().append("circle")
            .attr("r", 20)
            .attr("class", "smoothie-menu")
            .style("stroke", "gold")
            .style("stroke-width", 1)
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("cx", function(d, i){ return (300 * (i % 3));})
            .attr("id", "section-9")
            .attr("fill", "url(#logo)")
            .attr("cy", function(d, i) {
                if (i >= 0 && i <= 2) { return 50; }
                else if (i >= 3 && i <= 5){ return 110; }
                else if (i >= 6 && i <= 8){ return 170; }
                else if (i >= 9 && i <= 11){ return 230; }
                else if (i >= 12 && i <= 14){ return 290; }
                else if (i >= 15 && i <= 17){ return 350; }
                else if (i >= 18 && i <= 20){ return 410; }
                else if (i >= 21 && i <= 23){ return 470; }
                else if (i >= 24 && i <= 26){ return 530; }
                else { return 590; }
            })
            .on("mouseover", function(d) { d3.select(this).style("stroke-width", 4); })
            .on("mouseout", function(d) { d3.select(this).style("stroke-width", 1);})
            .on("click", function(d) {
                d3.select(this).attr("fill", "url(#check)")
                updateStatement(d)
                updateFat(d)
                updateSugar(d)
                updateProtein(d)
                updateCarbs(d)
                updateCholesterol(d)
            });

        // Data Join: Text
        new_smoothie.enter().append("text")
            .attr("class", "smoothie-menu")
            .text(function(d) { return d; })
            .attr("font-size", "10px")
            .style("text-transform", "uppercase")
            .attr("fill", "white")
            .attr("visibility", "hidden")
            .attr("transform", "translate(300,0)")
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){ return (300 * (i % 3));})
            .attr("y", function(d, i) {
                if (i >= 0 && i <= 2) { return 85; }
                else if (i >= 3 && i <= 5){ return 145; }
                else if (i >= 6 && i <= 8){ return 205; }
                else if (i >= 9 && i <= 11){ return 265; }
                else if (i >= 12 && i <= 14){ return 325; }
                else if (i >= 15 && i <= 17){ return 385; }
                else if (i >= 18 && i <= 20){ return 445; }
                else if (i >= 21 && i <= 23){ return 505; }
                else if (i >= 24 && i <= 26){ return 565; }
                else { return 625; }
            });
    });

}
requestData();

