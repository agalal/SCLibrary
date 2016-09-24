var sheet = (function() {
  // creates a custom stylesheet
	// Create the <style> tag
	var style = document.createElement("style");

	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);

  // helper to get a rule by name
  function getCSSRule(ruleName) {
     ruleName=ruleName.toLowerCase();
       var ii=0;
       var cssRule=false;
       var styleSheet = style.sheet;
       do {
          if (styleSheet.cssRules) {
             cssRule = styleSheet.cssRules[ii];
          } else {
             cssRule = styleSheet.rules[ii];
          }
          if (cssRule)  {
             if (cssRule.selectorText.toLowerCase()==ruleName) {
                   return cssRule;
             }
          }
          ii++;
       } while (cssRule);
     return false;
    }

  // function to add/insert rule with browser judo
  var addCSSRule = function (selector, rules, index) {
  	if("insertRule" in style.sheet) {
  		style.sheet.insertRule(selector + "{" + rules + "}", index);
  	}
  	else if("addRule" in style.sheet) {
  		style.sheet.addRule(selector, rules, index);
  	}
  };

  var changeCSSRule = function (selector, rules, index) {
    var toChange = getCSSRule(selector);
    // split rules css into array by delimiter
    rules = rules.split(';');
    console.log('changing rules: ' + rules);
    rules.forEach(function (item, index) {
      var ruleSplit = item.split(':');
      // rule name, remove spaces, assuming no : inside rule
			var ruleText = ruleSplit[(ruleSplit.length - 1)];
      var ruleName = ruleSplit.splice(0, ruleSplit.length-1).join();
			console.log('name: ' + ruleName);
			console.log('text: ' + ruleText);
      // change the rule in the stylesheet
      toChange.style[ruleName] = ruleText;
    });
  };

	return {
    sheet: style.sheet,
    addRule: addCSSRule,
    changeRule: changeCSSRule
  };
})();
