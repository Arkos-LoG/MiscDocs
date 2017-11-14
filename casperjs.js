// version IN PROGRESS


var TIME_OUT = 60000,
	x = require('casper').selectXPath;

var actionTypesEnum = {
	waitForSelector: 0,
	wait: 1,
	thenEvaluate: 2,
	waitForText: 3,
	fillPrincipal: 4,
	fillBondDetails: 5,
	fillIndemnitor: 6,
	fillEligibility: 7,
	cppfillPrincipal: 8,
	cppfillBondDetails: 9,
	cppfillIndemnitor: 10,
	cppfillEligibility: 11
}

var platFormEnum = {
	nexus: 0,
	cpp: 1
	//cppEditQuote: 1,
	//cppNewQuote: 2
}

var bondGroupsEnum = {
	Commercial: 0,
	Contract: 1
}

var bondCategorysEnum = {
	CourtAndFiduciary: 0,
	EncroachmentPermit: 1,
	LicenseAndPermit: 2,
	Miscellaneous: 3,
	Official: 4,
	USGovernmentExcise: 5
}

var statesEnum = {  // according to nexus dropdown when bond selected with Jennifer Noble logged in  ( if bond does not get selected correctly then the states are off )
	Alaska: 1,
	Arizona: 2,
	California: 3,
	Florida: 4,
	Hawaii: 5,
	Illinois: 6,
	Maryland: 7,
	Nevada: 8,
	Ohio: 9,
	Oregon: 10,
	Washington: 11
}

// !!! IMPORTANT - following enum needs to match testsEnum in UiTest.exe !!!
var testsEnum = {
	issueCACLB2010: 1,
	issueCADSOB: 2,
	declineCADSOB: 3,
	submitAZCLCBI_ICC: 4,
	approveAZCLCBI_ICC: 5

}

// !!! NOTE !!! README !!! NOTE !!! README !!!
// BEGIN TEST SETUP AND START TEST -> is at the bottom, and it has to be, otherwise casperjs doesn't work the way I'm using it
// 

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN RUN NEXUS TEST IMPLEMENTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


casper.on('run.nexus_test', function (options) {

	var o = {}; // Internal options
	o.loginOn = options.loginOn === false ? options.loginOn : true;

	//var bondTitleSelector = "*[title='" + options.bondTitle + "']";  // NOT BEING USED HERE

	if (o.loginOn) {

		casper.waitForSelector("form#form2 input[name='ctl00$cphMain$txtUserName']",
			function success() {

				this.echo('Starting test for ' + options.testTitle + ' -> ' + options.bondTitle);
				this.echo('Logging into Dev with JENNIFER NOBLE...');
				options.test.assertExists("form#form2 input[name='ctl00$cphMain$txtPassword']");
				this.sendKeys("form#form2 input[name='ctl00$cphMain$txtUserName']", '350877');
				this.sendKeys("form#form2 input[name='ctl00$cphMain$txtPassword']", 'Y54NP93S');
				casper.capture('START.png');

				options.test.assertExists(x('//*[contains(text(), "Welcome")]'));

			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - form#form2 input[name='ctl00$cphMain$txtUserName']");
				//options.test.assertExists("form#form2 input[name='ctl00$cphMain$txtPassword']");
			});

		casper.thenEvaluate(function () {
			console.log(navigator.userAgent.toLowerCase());
		});

		casper.waitForSelector("#cphMain_btnLogin span",
			function success() {
				options.test.assertExists("#cphMain_btnLogin span");
				this.click("#cphMain_btnLogin span");
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - #cphMain_btnLogin span");
				//options.test.assertExists("#cphMain_btnLogin span");
			});


		///////////////////////////////////////////////////////////////////////////////
		// NEXUS ACTIVITY PAGE
		//////////////////////////////////////////////////////////////////////////////


		casper.waitForSelector("input[name='ctl00$QuoteWidget1$txtName']",
			function success() {
				options.test.assertExists("input[name='ctl00$QuoteWidget1$txtName']");

				this.echo('On ' + this.getTitle() + ' page...');

				//var dt = new Date();   //todo+++ put in which test is running bond etc. in the name    
				//this.sendKeys("input[name='ctl00$QuoteWidget1$txtName']", "casper " + dt.toLocaleDateString() + " " + dt.toLocaleTimeString());
				this.sendKeys("input[name='ctl00$QuoteWidget1$txtName']", "cspr " + options.testTitle);
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists("input[name='ctl00$QuoteWidget1$txtName']");
				this.emit('time.out', "waitForSelector - input[name='ctl00$QuoteWidget1$txtName']");
			}, TIME_OUT);


		//casper.waitForSelector(x('//*[@id="webmenu_msa_1"]'),
		//	function success() {
		//		options.test.assertExists(x('//*[@id="webmenu_msa_1"]'));
		//		casper.click(x('//*[@id="webmenu_msa_1"]'));
		//	},
		//	function fail() {
		//		casper.capture('failed.png');
		//		options.test.assertExists(x('//*[@id="webmenu_msa_1"]'));
		//		this.emit('time.out', 'waitForSelector - //*[@id="webmenu_msa_1"]  (select bond product');
		//	}, TIME_OUT);


		casper.waitForSelector("#webmenu_title",
			function success() {
				options.test.assertExists("#webmenu_title");
				casper.click("#webmenu_title");
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists("#webmenu_title");
				this.emit('time.out', 'waitForSelector - #webmenu_title  (select bond product');
		}, TIME_OUT);

		casper.waitForSelector("#webmenu_msa_1",
		function success() {
			options.test.assertExists("#webmenu_msa_1");
			casper.click("#webmenu_msa_1");
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#webmenu_msa_1");
			this.emit('time.out', 'waitForSelector - #webmenu_msa_1  (select bond product');
		}, TIME_OUT);

		casper.wait(3000, function () {
		});

		casper.waitForSelector("#ddlQuickState",
			function success() {
				options.test.assertExists("#ddlQuickState");
				//this.echo('select state ' + options.state);

				var states = Object.getOwnPropertyNames(statesEnum);

				// set state drop down and verify what is selected is what the test was configured for

				var setStateSucceeded = this.evaluate(function (stateNum, states) {
					//console.log("casper " + stateNum);
					document.querySelector('#ddlQuickState').selectedIndex = stateNum;  // the drop down index is not zero based like arrays are, so (stateNum - 1)

					console.log("casper -> " + states[(stateNum - 1)] + " is selected = " + (states[(stateNum - 1)] === $("#ddlQuickState option:selected").text()));

					return (states[(stateNum - 1)] === $("#ddlQuickState option:selected").text());

				}, options.state, states);

				if (!setStateSucceeded) {
					this.emit('test.failure', "FAILED TO SET THE STATE IN NEXUS -> selected does not match test configuration for state -> " + states[(options.state - 1)]);
				}

				//casper.capture('1 afterSelectingState.png');
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists("#ddlQuickState");
				this.emit('time.out', "waitForSelector - #ddlQuickState");
			});


		casper.wait(3000, function () {
		});

		casper.waitForSelector("#btnGetQuote span",
			function success() {
				options.test.assertExists("#btnGetQuote span");
				//casper.capture('2 continueToBondSelectionPage.png');
				this.click("#btnGetQuote span");
				casper.capture('3 after clicking on btnGetQuote.png');
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists("#btnGetQuote span");
				this.emit('time.out', "waitForSelector - #btnGetQuote span");
			});


	}

	////////////////////////////////////////////////////////////////////////////
	//   BOND SELECTION SCREEN
	///////////////////////////////////////////////////////////////////////////

	casper.wait(4000, function () {
		this.echo('wait for BOND SELECTION  PAGE to load.......');
		casper.capture('loadingBondSelectionAfter4seconds.png');

	});

	casper.waitForSelector("#bondCategory",
		function success() {

			this.echo('On BondSelection page...' + this.getTitle());
			this.echo('give time for effective date to load...');

			casper.wait(5000, function () {
				options.test.assertExists("#bondCategory");

				this.evaluate(function (bondCategory) {
					document.querySelector('#bondCategory').selectedIndex = bondCategory;
					return true;
				}, options.bondCategory);

				casper.capture('B4bondSearchBtnClck.png');
				this.click("#BondClassesSearchButton span");
			});
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#bondCategory");
			this.emit('time.out', 'waitForSelector - #bondCategory ');
		}, TIME_OUT);

	casper.thenEvaluate(function () {
		console.log("Global.casper -----> " + Global.casper);
	});

	//casper.waitForText("CACLB2010"
	casper.waitForSelector(x('//*[@productid=' + options.productId + ']'),
		function success() {
			this.echo('found productId ' + options.productId);
			casper.capture('b4bondselectionClck.png');
			options.test.assertExists(x('//*[@productid=' + options.productId + ']'));
			casper.click(x('//*[@productid=' + options.productId + ']'));
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(x('//*[@productid=' + options.productId + ']'));
			this.emit('time.out', 'waitForSelector - //*[@productid=' + options.productId + ']');
		}, TIME_OUT);



	///////////////////////////////////////////////////////////////////////////////////
	//  FILL BOND PAGES / CALL ACTION METHODS
	//////////////////////////////////////////////////////////////////////////////////

	casper.then(function () {

		this.echo(' FILL BOND PAGES .......');

		if (options.actions != null)
			for (var i = 0, l = options.actions.length; i < l; i++) {

				this.echo('options.actions[i].actionType = ' + options.actions[i].actionType);

				switch (options.actions[i].actionType) {

					case actionTypesEnum.fillPrincipal:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.principal', options.actions[i].options, options);
						break;
					case actionTypesEnum.fillBondDetails:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.bondDetails', options.actions[i].options, options);
						break;
					case actionTypesEnum.fillIndemnitor:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.indemnitor', options.actions[i].options, options);
						break;
					case actionTypesEnum.fillEligibility:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.eligibility', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillPrincipal:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppPrincipal', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillBondDetails:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppBondDetails', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillIndemnitor:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppIndemnitor', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillEligibility:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppEligibility', options.actions[i].options, options);
						break;
					default:
				}

			} // END FOR LOOP THROUGH ACTION TYPES

		this.echo(' END FILL BOND PAGES .......');

	});

	//casper.wait(100, function () {
	//	this.echo(' MOVING ON AFTER FILL PAGES.......');
	//});

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END RUN NEXUS TEST IMPLEMENTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN RUN CPP TEST IMPLEMENTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


casper.on('run.cpp_test', function (options) {

	casper.waitForSelector("input[name='txtUsername']",
	function success() {

		//this.echo('Starting test for ' + options.testTitle + ' -> ' + options.bondTitle);
		this.echo('Logging into CPP with inscotest...');

		options.test.assertExists("input[name='txtUsername']");
		this.sendKeys("input[name='txtUsername']", 'inscotest');

		options.test.assertExists("input[name='txtPassword']");
		this.sendKeys("input[name='txtPassword']", "InscoTest5");

		casper.capture('START.png');

		options.test.assertExists(x("//a[normalize-space(text())='Login']"));
		this.click(x("//a[normalize-space(text())='Login']"));

	},
	function fail() {
		casper.capture('failed.png');
		this.emit('time.out', "waitForSelector - " + "input[name='txtUsername']");
		//options.test.assertExists("form#form2 input[name='ctl00$cphMain$txtPassword']");
	}, TIME_OUT);

	casper.wait(2000, function () {
		this.echo('wait for CPP WELCOME PAGE to load.......');
	});

	///////////////////////////////////////////////////////////////////////////////
	// CPP WELCOME PAGE
	//////////////////////////////////////////////////////////////////////////////

	casper.waitForSelector(x("//*[@id='_ctl0_NaviMain1_btnEditQuote']"),
		function success() {
			options.test.assertExists(x("//*[@id='_ctl0_NaviMain1_btnEditQuote']"));
			casper.click(x("//*[@id='_ctl0_NaviMain1_btnEditQuote']"));
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', 'waitForSelector - ' + "//*[@id='_ctl0_NaviMain1_btnEditQuote']");
	}, TIME_OUT);

	//casper.wait(4000, function () {
	//	casper.capture('AFTER_EDIT_CLICK.png');
	//});

	casper.wait(1000, function () {
		this.emit(options.cppScenario, options);
		this.echo('.');
	});

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CPP EDIT QUOTE 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

casper.on('run.cppEditQuote', function (options) {

	casper.wait(1000, function () {
		this.echo('wait for CPP EDIT QUOTE PAGE to load.......');
	});

	casper.waitForSelector("input[name='_ctl0:cphContent:txtSearchString']",
		function success() {
			options.test.assertExists("input[name='_ctl0:cphContent:txtSearchString']");
			this.sendKeys("input[name='_ctl0:cphContent:txtSearchString']", "cspr " + options.cppSearchTitle);
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', 'waitForSelector - ' + "input[name='_ctl0:cphContent:txtSearchString']");
	}, TIME_OUT);

	casper.waitForSelector("#_ctl0_cphContent_btnSearch span",
		function success() {
			options.test.assertExists("#_ctl0_cphContent_btnSearch span");
			this.click("#_ctl0_cphContent_btnSearch span");
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', 'waitForSelector - ' + "#_ctl0_cphContent_btnSearch span");
	}, TIME_OUT);

	casper.wait(3000, function () {
		casper.capture('AFTER_SEARCH_CLICK.png');
	});

	casper.waitForSelector(x('//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[3][text() = "cspr submitAZCLCBI_ICC"]'),
		function success() {
			options.test.assertExists(x('//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[3][text() = "cspr submitAZCLCBI_ICC"]'));
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', 'waitForSelector - ' + '//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[3][text() = "cspr submitAZCLCBI_ICC"]');
	}, TIME_OUT);

	casper.waitForSelector(x('//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[10]/a[text() = "Edit"]'),
		function success() {
			options.test.assertExists(x('//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[10]/a[text() = "Edit"]'));
			this.click(x('//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[10]/a[text() = "Edit"]'));
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', 'waitForSelector - ' + '//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[10]/a[text() = "Edit"]');
	}, TIME_OUT);

	//casper.wait(11000, function () {
	//	casper.capture('AFTER_EDIT_CLICK.png');
	//});


	///////////////////////////////////////////////////////////////////////////////////
	//  FILL BOND PAGES / CALL ACTION METHODS
	//////////////////////////////////////////////////////////////////////////////////

	casper.then(function () {

		this.echo(' FILL BOND PAGES FOR CPP MODE .......');

		if (options.actions != null)
			for (var i = 0, l = options.actions.length; i < l; i++) {

				this.echo('options.actions[i].actionType = ' + options.actions[i].actionType);

				switch (options.actions[i].actionType) {

					case actionTypesEnum.cppfillPrincipal:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppPrincipal', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillBondDetails:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppBondDetails', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillIndemnitor:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppIndemnitor', options.actions[i].options, options);
						break;
					case actionTypesEnum.cppfillEligibility:
						options.actions[i].actionType = -1;// means completed
						this.emit('fill.cppEligibility', options.actions[i].options, options);
						break;
					default:
				}

			} // END FOR LOOP THROUGH ACTION TYPES

		this.echo(' END FILL BOND PAGES .......');

	});


});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN ACTION METHODS / CUSTOM CASPER EVENT HANDLERS  IMPLEMENTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL CPP PRINCIPAL EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////

casper.on('fill.cppPrincipal', function (actionOptions, options) {

	casper.wait(1000, function () {
		this.echo(' FILL THE PRINCIPAL in CPP mode .......');
	});

	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
		function success() {
			options.test.assertExists(bondTitleSelector);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(bondTitleSelector);
			this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
		}, TIME_OUT);

	casper.waitForSelector("#saveContinueBtn span",
		function success() {
			options.test.assertExists("#saveContinueBtn span");
			this.click("#saveContinueBtn span");
			casper.capture('continueToBondDetailPage.png');
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - #saveContinueBtn span");
			//options.test.assertExists("#saveContinueBtn span");
		}, TIME_OUT);

	//casper.wait(11000, function () {
	//	casper.capture('AFTER_PRINC_CLICK.png');
	//});

});

///////////////////////////////////////////////////////////////////////////////
// END FILL CPP PRINCIPAL EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL CPP BOND DETAILS EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////

casper.on('fill.cppBondDetails', function (actionOptions, options) {

	casper.wait(1000, function () {
		this.echo(' FILL BOND DETAILS in CPP mode ....... ');
	});

	var o = {}; // Internal options

	if (actionOptions == null) {
		actionOptions = {};
	}

	// USE DIFFERENT SELECTOR
	o.bondTermSelector = !actionOptions.bondTermSelector ? 'select[name="BondTermPremium"][id^="BondTermPremium"]' : actionOptions.bondTermSelector;

	///////////////////////////////////////////////////

	casper.waitForSelector(o.bondTermSelector,
		function success() {
			options.test.assertExists(o.bondTermSelector);
			this.echo('On Bond Detail page...' + this.getTitle());

			this.echo('give more time for the page to load...');
			casper.capture('BondTermSelection_b4Wait.png');

			this.wait(11000, function () {
				casper.capture('BondTermSelection_afterWaitB4Selection.png');
			});

		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(o.bondTermSelector);
			this.emit('time.out', 'waitForSelector - ' + o.bondTermSelector);
		}, TIME_OUT);

	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
		function success() {
			options.test.assertExists(bondTitleSelector);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(bondTitleSelector);
			this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
		});

	casper.waitForSelector("#saveContinueBtn span",
		function success() {
			options.test.assertExists("#saveContinueBtn span");
			casper.capture('b4_BONDDETAILS_Continue.png');
			this.click("#saveContinueBtn span");
			casper.capture('after_BONDDETAILS_Continue.png');
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - #saveContinueBtn span");
			//options.test.assertExists("#saveContinueBtn span");
		}, TIME_OUT);

	casper.wait(11000, function () {
		casper.capture('AFTER_WAIT_BONDDETAILS_CLICK.png');
	});

});

///////////////////////////////////////////////////////////////////////////////
// END FILL CPP BOND DETAILS EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL CPP INDEMNITORS EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////

casper.on('fill.cppIndemnitor', function (actionOptions, options) {

	casper.wait(1000, function () {
		this.echo(' FILL INDEMNITORS in CPP mode ....... ');
	});

	casper.waitForSelector("input[name='IndemSSN']",
		function success() {
			this.echo('On Indemnitor page...' + this.getTitle());
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemSSN']");
		}, TIME_OUT);

	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
		function success() {
			options.test.assertExists(bondTitleSelector);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(bondTitleSelector);
			this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
		});

	casper.waitForSelector(x('//*[@id="saveContinueBtn"]'),
		function success() {
			options.test.assertExists(x('//*[@id="saveContinueBtn"]'));
			this.click(x('//*[@id="saveContinueBtn"]'));
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - " + '//*[@id="saveContinueBtn"]');
			//options.test.assertExists("#saveContinueBtn span");
		}, TIME_OUT);

	//casper.wait(11000, function () {
	//	casper.capture('AFTER_INDEMNITORS_CLICK.png');
	//});

});

///////////////////////////////////////////////////////////////////////////////
// END FILL CPP INDEMNITORS EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL CPP ELIGIBILITY EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////

casper.on('fill.cppEligibility', function (actionOptions, options) {

	casper.wait(1000, function () {
		this.echo(' FILL ELIGIBILITY in CPP mode ....... ');
	});

	var o = {}; // Internal options

	if (actionOptions == null) {
		actionOptions = {};
	}

	// SELECTOR VALUE OPTIONS
	o.billPreference = !actionOptions.billPreference ? 0 : actionOptions.billPreference;
	o.eligibility = !actionOptions.eligibility ? "approved" : actionOptions.eligibility;  // text found in the 1st pop up ( default is for approved bond )
	o.buttonText = !actionOptions.buttonText ? "Issue" : actionOptions.buttonText; // text on the button to look for
	o.finalText = !actionOptions.finalText ? "issued" : actionOptions.finalText;  // text on the next pop up to look for

	// TURN OFF SELECTORS
	o.billPreferenceOn = actionOptions.billPreferenceOn === false ? actionOptions.billPreferenceOn : true;

	// USE DIFFERENT SELECTOR
	o.billPreferenceSelector = !actionOptions.billPreferenceSelector ? "#billPreference" : actionOptions.billPreferenceSelector;


	if (o.billPreferenceOn)
		casper.waitForSelector(o.billPreferenceSelector,
			function success() {
				this.echo('On Eligibility page...' + this.getTitle());
				casper.capture('eligibilityStart.png');
				options.test.assertExists(o.billPreferenceSelector);
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists(o.billPreferenceSelector);
				this.emit('time.out', 'waitForSelector - ' + o.billPreferenceSelector);
			}, TIME_OUT);

	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
		function success() {
			options.test.assertExists(bondTitleSelector);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(bondTitleSelector);
			this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
		});

	casper.waitForSelector("#checkEligibilityBtn span",
		function success() {
			casper.capture('B4eligibilityClick.png');
			options.test.assertExists("#checkEligibilityBtn span");
			this.click("#checkEligibilityBtn span");
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#checkEligibilityBtn span");
			this.emit('time.out', "waitForSelector - #checkEligibilityBtn span");
		});

	casper.waitForText(o.eligibility,
		function success() {

			options.test.assertTextExists(o.eligibility, 'Found Text -> ' + o.eligibility);
			casper.capture('successAfterEligibilityClick.png');

			casper.waitForSelector("button",
				function success() {
					options.test.assertExists(x('//button[text()="' + o.buttonText + '"]'));  
					this.click(x('//button[text()="' + o.buttonText + '"]'));   
				},
				function fail() {
					casper.capture('failed.png');
					//options.test.assertExists(x('//button[text()="Issue"]'));  
					this.emit('time.out', "waitForSelector - //button[text()='" + o.buttonText + "']");
				});
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertTextExists(o.eligibility);
			this.emit('time.out', 'waitForText - ' + o.eligibility);
		}, TIME_OUT);

	casper.waitForText(o.finalText,   
		function success() {
			options.test.assertTextExists(o.finalText, 'Found ' + o.finalText);  
			this.echo('bond has been ' + o.finalText);  
			casper.capture('finalClick.png');   
			this.click("button");
			casper.capture('AfterfinalClick.png');
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertTextExists('issued');   
			this.emit('time.out', 'waitForText - ' + o.finalText); 
		}, TIME_OUT);

	casper.wait(3000, function () {
		casper.capture('AFTER_FINAL_CLICK.png');
	});


});

///////////////////////////////////////////////////////////////////////////////
// END FILL CPP ELIGIBILITY EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL PRINCIPAL EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////

casper.on('fill.principal', function (actionOptions, options) {

	this.echo(' FILL THE PRINCIPAL .......');

	var o = {}; // Internal options

	if (actionOptions == null) {
		actionOptions = {};
	}

	// todo+++ add more fields to fill here if needed for other tests
	o.address = !actionOptions.address ? '111 cool street' : actionOptions.address;
	o.zip = !actionOptions.zip ? '90210' : actionOptions.zip;
	o.workPhone = !actionOptions.workPhone ? '12345678999' : actionOptions.workPhone;
	o.licenseNumber = !actionOptions.licenseNumber ? '11' : actionOptions.licenseNumber;
	o.businessEntity = !actionOptions.businessEntity ? 1 : actionOptions.businessEntity;
	o.licenseClass = !actionOptions.licenseClass ? '11' : actionOptions.licenseClass;

	// TURN OFF SELECTORS
	o.licenseNumberOn = actionOptions.licenseNumberOn === false ? actionOptions.licenseNumberOn : true;
	o.licenseClassOn = actionOptions.licenseClassOn === false ? actionOptions.licenseClassOn : true;


	casper.thenEvaluate(function (on) {
		console.log("Global.casper -- actionOptions.licenseClassOn ---> " + on);
	}, actionOptions.licenseClassOn);

	casper.thenEvaluate(function (on) {
		console.log("Global.casper -- licenseClassOn ---> " + on);
	}, o.licenseClassOn);

	casper.thenEvaluate(function (on) {
		console.log("Global.casper -- o.licenseNumberOn ---> " + on);
	}, o.licenseNumberOn);

	//casper.exit();
	//------------------------------------------

	casper.wait(1000, function () {
		this.echo('wait for PRINCIPAL PAGE to load.......');
	});

	casper.waitForSelector("input[name='PrincAddress1']",
		function success() {
			this.echo('On Principal page...' + this.getTitle());
			options.test.assertExists("input[name='PrincAddress1']");
			this.sendKeys("input[name='PrincAddress1']", o.address);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("input[name='PrincAddress1']");
			this.emit('time.out', 'waitForSelector - input[name="PrincAddress1"] ');
		}, TIME_OUT);

	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
	function success() {
		options.test.assertExists(bondTitleSelector);
	},
	function fail() {
		casper.capture('failed.png');
		//options.test.assertExists(bondTitleSelector);
		this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
	}, TIME_OUT);

	casper.thenEvaluate(function () {
		console.log("Global.casper -----> " + Global.casper);
	});

	casper.waitForSelector("input[name='PrincZip']",
		function success() {
			this.sendKeys("input[name='PrincZip']", o.zip);
			options.test.assertExists("input[name='PrincZip']");
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("input[name='PrincZip']");
			this.emit('time.out', "waitForSelector - input[name='PrincZip']");
		});

	casper.wait(4000, function () { });

	casper.waitForSelector("input[name='PrincPhoneWork']",
		function success() {
			this.sendKeys("input[name='PrincPhoneWork']", o.workPhone);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("input[name='PrincPhoneWork']");
			this.emit('time.out', "waitForSelector - input[name='PrincPhoneWork']");
		});

	if (!!o.licenseNumberOn)
		casper.waitForSelector("input[name='PrincLicenseNumber']",		
			function success() {
				options.test.assertExists("input[name='PrincLicenseNumber']");
				this.sendKeys("input[name='PrincLicenseNumber']", o.licenseNumber);
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists("input[name='PrincLicenseNumber']");
				this.emit('time.out', "waitForSelector - input[name='PrincLicenseNumber']");
			});

	casper.waitForSelector('select[name="BusinessEntity"][id^="BusinessEntity"]',
		function success() {
			options.test.assertExists('select[name="BusinessEntity"][id^="BusinessEntity"]');
			this.evaluate(function (i) {
				document.querySelector('select[name="BusinessEntity"][id^="BusinessEntity"]').selectedIndex = i;
				return true;
			}, o.businessEntity);
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - select[name='BusinessEntity'][id^='BusinessEntity']");
		});

	casper.thenEvaluate(function (on) {
		console.log("Global.casper -- licenseClassOn ---> " + on);
	}, o.licenseClassOn);

	if (!!o.licenseClassOn) {
		casper.waitForSelector("input[name='LicenseClass']",
			function success() {
				this.sendKeys("input[name='LicenseClass']", o.licenseClass);
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - input[name='LicenseClass']");
				//options.test.assertExists("input[name='LicenseClass']");
			});
	}

	casper.waitForSelector("#saveContinueBtn span",
		function success() {
			casper.capture('continueToBondDetailPage.png');
			options.test.assertExists("#saveContinueBtn span");
			this.click("#saveContinueBtn span");
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - #saveContinueBtn span");
			//options.test.assertExists("#saveContinueBtn span");
		});


	//------------------------------------------
	//casper.exit();

});

///////////////////////////////////////////////////////////////////////////////
// END FILL PRINCIPAL EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL BOND DETAILS EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////

casper.on('fill.bondDetails', function (actionOptions, options) {

	this.echo(' FILL THE BOND DETAILS .......');

	var o = {}; // Internal options

	if (actionOptions == null) {
		actionOptions = {};
	}

	// todo+++ add more fields to fill here if needed for other tests
	o.bondTermPremium = !actionOptions.bondTermPremium ? 1 : actionOptions.bondTermPremium;
	o.attorneyInFact = !actionOptions.attorneyInFact ? 'test' : actionOptions.attorneyInFact;
	o.hasClaimAgainst = !actionOptions.hasClaimAgainst ? false : actionOptions.hasClaimAgainst; // could be yes or no in test config
	o.hasBankruptcy = !actionOptions.hasBankruptcy ? false : actionOptions.hasBankruptcy; // could be yes or no in test config
	o.isDisciplinaryBond = !actionOptions.isDisciplinaryBond ? false : actionOptions.isDisciplinaryBond; // could be yes or no in test config
	o.hasPastDue = !actionOptions.hasPastDue ? false : actionOptions.hasPastDue; // could be yes or no in test config
	o.bontType = !actionOptions.bondType ? 1 : !actionOptions.bondType;
	o.bontAmount = !actionOptions.bondAmount ? 1 : !actionOptions.bondAmount;

	// USE DIFFERENT SELECTOR
	o.bondTermSelector = !actionOptions.bondTermSelector ? 'select[name="BondTermPremium"][id^="BondTermPremium"]' : actionOptions.bondTermSelector;

	// TURN OFF SELECTORS
	o.bondTypeOn = actionOptions.bondTypeOn === false ? actionOptions.bondTypeOn : true;
	o.bondAmountOn = actionOptions.bondAmountOn === false ? actionOptions.bondAmountOn : true;

	//casper.exit();
	//------------------------------------------

	casper.wait(1000, function () {
		this.echo('wait for BOND DETAIL PAGE to load.......');
	});


	casper.waitForSelector(o.bondTermSelector,
		function success() {
			options.test.assertExists(o.bondTermSelector);
			this.echo('On Bond Detail page...' + this.getTitle());
			this.echo('give more time for the page to load...');
			casper.capture('BondTermSelection_b4Wait.png');

			this.wait(11000, function () {
				casper.capture('BondTermSelection_afterWaitB4Selection.png');
			});

		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists(o.bondTermSelector);
			this.emit('time.out', 'waitForSelector - ' + o.bondTermSelector);
		}, TIME_OUT);


	casper.wait(500, function () {
		this.echo('set bondTermPremium...');
		this.evaluate(function (bondTermPremium, selector) {
			document.querySelector(selector).selectedIndex = bondTermPremium;
			return true;
		}, o.bondTermPremium, o.bondTermSelector);

		casper.capture('BondTermSelection_afterSelection.png');;
	});


																							//BondTerm slightly different from BondTermPremium, although not much
																							//casper.waitForSelector( 'select[name="BondTerm"][id^="BondTerm"]',
																							//	function success() {
																							//		options.test.assertExists( 'select[name="BondTerm"][id^="BondTerm"]' );
																							//		this.echo( 'On Bond Detail page...' + this.getTitle() );

																							//		this.evaluate( function ( bondTerm ) {
																							//			document.querySelector( 'select[name="BondTerm"][id^="BondTerm"]' ).selectedIndex = bondTerm;
																							//			return true;
																							//		}, o.bondTerm );
																							//	},
																							//	function fail() {
																							//		//Do nothing here, because it could be here or not.  No errors when there is a variable chance of it existing or not.
																							//		//casper.capture( 'failed.png' );
																							//		//options.test.assertExists( 'select[name="BondTerm"][id^="BondTerm"]' );
																							//		//this.emit( 'time.out', 'waitForSelector - select[name="BondTerm"][id^="BondTerm"]' );
																							//	}, TIME_OUT );


	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
	function success() {
		options.test.assertExists(bondTitleSelector);
	},
	function fail() {
		casper.capture('failed.png');
		//options.test.assertExists(bondTitleSelector);
		this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
	});


	if (!!o.bondTypeOn) {  
		casper.waitForSelector('select[id^="BondType"]',
			function success() {

				options.test.assertExists('select[id^="BondType"]');

				this.evaluate(function (i) {

					document.querySelector('select[id^="BondType"]').selectedIndex = i;
					$('select[id^="BondType"]').trigger('change');
					return true;
				}, o.bontType);

			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - select[id^='BondType']");
			});
	}
	
	casper.wait(2000, function () {
		this.echo('give time between bondType and bondAmount .......');
	});

	if (!!o.bondAmountOn) {
		casper.waitForSelector('select[id^="BondAmount"]',
			function success() {
				options.test.assertExists('select[id^="BondAmount"]');

				this.evaluate(function (i) {
					console.log(" Global.casper -- o.bontAmount ---> " + i);
					document.querySelector('select[id^="BondAmount"]').selectedIndex = i;
					return true;
				}, o.bontAmount);

				casper.capture('AFTER_SET_BOND_AMOUNT.png');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - select[id^='BondAmount']");
			});
	}		


	casper.thenEvaluate(function () {
		console.log(" Global.casper -----> " + Global.casper);
	});


	//casper.waitForSelector("input[name='LicenseClass']",
	//	function success() {
	//		options.test.assertExists("input[name='LicenseClass']");
	//		this.sendKeys("input[name='LicenseClass']", "11");
	//	},
	//	function fail() {
	//		casper.capture('failed.png');
	//		options.test.assertExists("input[name='LicenseClass']");
	//		//casper.capture('failed.png');
	//	});

	casper.waitForSelector("input[name='AttorneyInFact']",
		function success() {
			options.test.assertExists("input[name='AttorneyInFact']");
			this.sendKeys("input[name='AttorneyInFact']", o.attorneyInFact);
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("input[name='AttorneyInFact']");
			this.emit('time.out', "waitForSelector - input[name='AttorneyInFact']");
		});

	if (!!o.hasClaimAgainst) {

		casper.waitForSelector("form input[name='HasClaimAgainst']",
			function success() {
				options.test.assertExists('input[value="' + o.hasClaimAgainst + '"][id^="HasClaimAgainst"]'); //options.test.assertExists('input[value="no"][id^="HasClaimAgainst"]');
				this.click('input[value="' + o.hasClaimAgainst + '"][id^="HasClaimAgainst"]');
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists('input[value="' + o.hasClaimAgainst + '"][id^="HasClaimAgainst"]');
				this.emit('time.out', "waitForSelector - form input[name='HasClaimAgainst']");
			});
	}

	if (!!o.hasBankruptcy) {

		casper.waitForSelector("form input[name='HasBankruptcy']",
			function success() {
				options.test.assertExists('input[value="' + o.hasBankruptcy + '"][id^="HasBankruptcy"]'); //options.test.assertExists('input[value="no"][id^="HasBankruptcy"]');
				this.click('input[value="' + o.hasBankruptcy + '"][id^="HasBankruptcy"]');
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists('input[value="' + o.hasBankruptcy + '"][id^="HasBankruptcy"]');
				this.emit('time.out', "waitForSelector - form input[name='HasBankruptcy']");
			});
	}


	if (!!o.isDisciplinaryBond) {

		casper.waitForSelector("form input[name='IsDisciplinaryBond']",
			function success() {
				options.test.assertExists('input[value="' + o.isDisciplinaryBond + '"][id^="IsDisciplinaryBond"]'); //options.test.assertExists('input[value="no"][id^="IsDisciplinaryBond"]');
				this.click('input[value="' + o.isDisciplinaryBond + '"][id^="IsDisciplinaryBond"]');
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists('input[value="' + o.isDisciplinaryBond + '"][id^="IsDisciplinaryBond"]');
				this.emit('time.out', "waitForSelector - form input[name='IsDisciplinaryBond']");
			});
	}


	if (!!o.hasPastDue) {

		casper.waitForSelector("form input[name='HasPastDue']",
			function success() {
				options.test.assertExists('input[value="' + o.hasPastDue + '"][id^="HasPastDue"]'); //options.test.assertExists('input[value="no"][id^="HasPastDue"]');
				this.click('input[value="' + o.hasPastDue + '"][id^="HasPastDue"]');
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists('input[value="' + o.hasPastDue + '"][id^="HasPastDue"]');
				this.emit('time.out', "waitForSelector - form input[name='HasPastDue']");
			});
	}


	casper.waitForSelector("#saveContinueBtn span",
		function success() {
			casper.capture('ContinueToIndemnitorPage.png');
			options.test.assertExists("#saveContinueBtn span");
			this.click("#saveContinueBtn span");
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#saveContinueBtn span");
			this.emit('time.out', "waitForSelector - #saveContinueBtn span");
		});



});

////////////////////////////////////////////////////////////////////////////////
// END FILL BOND DETAILS EVENT HANDLER
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL INDEMNITOR EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////


casper.on('fill.indemnitor', function (actionOptions, options) {

	this.echo(' FILL INDEMNITOR PAGE .......');

	var o = {}; // Internal options

	if (actionOptions == null) {
		actionOptions = {};
	}

	o.indemSSN = !actionOptions.indemSSN ? "666220966" : actionOptions.indemSSN;
	o.indemnitorType = !actionOptions.indemnitorType ? 2 : actionOptions.indemnitorType;
	o.indemFirstName = !actionOptions.indemFirstName ? "Emily" : actionOptions.indemFirstName;
	o.indemLastName = !actionOptions.indemLastName ? "Brandon" : actionOptions.indemLastName;
	o.indemStreetNumber = !actionOptions.indemStreetNumber ? "11091" : actionOptions.indemStreetNumber;
	o.indemStreetName = !actionOptions.indemStreetName ? "Oil Well" : actionOptions.indemStreetName;
	o.indemStreetType = !actionOptions.indemStreetType ? 154 : actionOptions.indemStreetType;
	o.indemZip = !actionOptions.indemZip ? "70437" : actionOptions.indemZip;

	o.hasClaimAgainst = !actionOptions.hasClaimAgainst ? false : actionOptions.hasClaimAgainst; // could be yes or no in test config
	o.hasBankruptcy = !actionOptions.hasBankruptcy ? false : actionOptions.hasBankruptcy; // could be yes or no in test config
	o.hasBusinessFailure = !actionOptions.hasBusinessFailure ? false : actionOptions.hasBusinessFailure; // could be yes or no in test config
	o.hasAssetsInTrust = !actionOptions.hasAssetsInTrust ? false : actionOptions.hasAssetsInTrust; // could be yes or no in test config

	// TURN OFF SELECTORS
	o.indemnitorQuestionsOn = actionOptions.indemnitorQuestionsOn === false ? actionOptions.indemnitorQuestionsOn : true;

	//------------------------------------------

	casper.wait(1000, function () {
		this.echo('wait for INDEMNITOR PAGE to load.......');
	});

	casper.waitForSelector("input[name='IndemSSN']",
		function success() {
			this.echo('On Indemnitor page...' + this.getTitle());
			options.test.assertExists("input[name='IndemSSN']");
			this.sendKeys("input[name='IndemSSN']", o.indemSSN);
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemSSN']");
		}, TIME_OUT);

	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
	function success() {
		options.test.assertExists(bondTitleSelector);
	},
	function fail() {
		casper.capture('failed.png');
		//options.test.assertExists(bondTitleSelector);
		this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
	});

	casper.thenEvaluate(function () {
		console.log("Global.casper -----> " + Global.casper);
	});

	casper.waitForSelector("#IndemnitorType",
		function success() {

			options.test.assertExists("#IndemnitorType");

			this.evaluate(function (indemnitorType) {
				document.querySelector('#IndemnitorType').selectedIndex = indemnitorType;
				viewModel.indemnitorType(indemnitorType);
				viewModel.indemnitorType.valueHasMutated();

				return true;
			}, o.indemnitorType);

		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#IndemnitorType");
			this.emit('time.out', "waitForSelector - #IndemnitorType");
		});

	//casper.waitForSelector("input[name='IndemPercOwnship']",
	//	 function success() {
	//	 	this.sendKeys("input[name='IndemPercOwnship']", "100");
	//	 },
	//	 function fail() {
	//	 	//options.test.assertExists("input[name='IndemPercOwnship']");
	//	 });

	casper.waitForSelector("input[name='IndemFirstName']",
		function success() {
			options.test.assertExists("input[name='IndemFirstName']");
			this.sendKeys("input[name='IndemFirstName']", o.indemFirstName);
		},
		function fail() {		
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemFirstName']");
		});

	casper.waitForSelector("input[name='IndemLastName']",
		function success() {
			options.test.assertExists("input[name='IndemLastName']");
			this.sendKeys("input[name='IndemLastName']", o.indemLastName);
		},
		function fail() {			
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemLastName']");
		});

	casper.waitForSelector("input[name='IndemStreetNumber']",
		function success() {
			options.test.assertExists("input[name='IndemStreetNumber']");
			this.sendKeys("input[name='IndemStreetNumber']", o.indemStreetNumber);
		},
		function fail() {		
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemStreetNumber']");
		});

	casper.waitForSelector("input[name='IndemStreetName']",
		function success() {
			options.test.assertExists("input[name='IndemStreetName']");
			this.sendKeys("input[name='IndemStreetName']", o.indemStreetName);
		},
		function fail() {
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemStreetName']");
		});

	casper.waitForSelector("#IndemStreetType",
		function success() {
			options.test.assertExists("#IndemStreetType");
			this.evaluate(function (indemStreetType) {
				document.querySelector('#IndemStreetType').selectedIndex = indemStreetType;
				return true;
			}, o.indemStreetType);
		},
		function fail() {
			//options.test.assertExists("#IndemStreetType");
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - #IndemStreetType");
		});

	casper.waitForSelector("input[name='IndemZip']",
		function success() {
			options.test.assertExists("input[name='IndemZip']");
			this.sendKeys("input[name='IndemZip']", o.indemZip);
		},
		function fail() {
			//options.test.assertExists("input[name='IndemZip']");
			casper.capture('failed.png');
			this.emit('time.out', "waitForSelector - input[name='IndemZip']");
		});

	// -- questions --

	if (!!o.indemnitorQuestionsOn)
		casper.waitForSelector("form input[name='HasBankruptcy']",
			function success() {
				options.test.assertExists("form input[name='HasBankruptcy']");
				//this.click("form input[name='HasBankruptcy']");
				this.click('input[value="' + o.hasBankruptcy + '"][id^="HasBankruptcy"]');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - form input[name='HasBankruptcy']");
				options.test.assertExists("form input[name='HasBankruptcy']");
			});

	if (!!o.indemnitorQuestionsOn)
		casper.waitForSelector("form input[name='HasClaimAgainst']",
			function success() {
				options.test.assertExists("form input[name='HasClaimAgainst']");
				//this.click("form input[name='HasClaimAgainst']");
				this.click('input[value="' + o.hasClaimAgainst + '"][id^="HasClaimAgainst"]');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - form input[name='HasClaimAgainst']");
				options.test.assertExists("form input[name='HasClaimAgainst']");
			});

	if (!!o.indemnitorQuestionsOn)
		casper.waitForSelector("form input[name='HasBusinessFailure']",
			function success() {
				options.test.assertExists("form input[name='HasBusinessFailure']");
				//this.click("form input[name='HasBusinessFailure']");
				this.click('input[value="' + o.hasBusinessFailure + '"][id^="HasBusinessFailure"]');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - form input[name='HasBusinessFailure']");
				options.test.assertExists("form input[name='HasBusinessFailure']");
			});

	if (!!o.indemnitorQuestionsOn)
		casper.waitForSelector("form input[name='HasAssetsInTrust']",
			function success() {
				options.test.assertExists("form input[name='HasAssetsInTrust']");
				//this.click("form input[name='HasAssetsInTrust']");
				this.click('input[value="' + o.hasAssetsInTrust + '"][id^="HasAssetsInTrust"]');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - form input[name='HasAssetsInTrust']");
				options.test.assertExists("form input[name='HasAssetsInTrust']");
			});

	// -- end questions --

	casper.wait(4000, function () { });

	casper.waitForSelector("#saveButton .btnProductText",
		 function success() {
		 	options.test.assertExists("#saveButton .btnProductText");
		 	casper.capture('saveIndem.png');
		 	this.click("#saveButton .btnProductText");
		 },
		 function fail() {
		 	casper.capture('failed.png');
		 	//options.test.assertExists("#saveButton .btnProductText");
		 	this.emit('time.out', "waitForSelector - #saveButton .btnProductText");
		 });

	casper.wait(1000, function () {
		this.echo('wait for the Indemnitor to be saved.......');
	});

	casper.waitForSelector(x('//td[@name="nameFirst" and text() = "' + o.indemFirstName + '"]'),
		 function success() {
		 	//casper.capture('saveIndem.png');
		 	options.test.assertExists(x('//td[@name="nameFirst" and text() = "' + o.indemFirstName + '"]'));
		 	this.echo('Indemnitor added successfully...');
		 },
		 function fail() {
		 	casper.capture('failed.png');
		 	//options.test.assertExists(x('//td[@name="nameFirst" and text() = "' + o.indemFirstName + '"]'));
		 	this.emit('time.out', 'waitForSelector(x(//td[@name="nameFirst" and text() = "' + o.indemFirstName + '"]');
		 }, TIME_OUT);

	casper.waitForSelector("#saveContinueBtn span",
		function success() {
			options.test.assertExists("#saveContinueBtn span");
			casper.capture('continueToEligibility.png');
			this.click("#saveContinueBtn span");
			this.echo('------------------- CLICKED CONTINUE TO ELIGIBILITY -------------------------------------------------------');
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#saveContinueBtn span");
			this.emit('time.out', "waitForSelector - #saveContinueBtn span");
		});


});

///////////////////////////////////////////////////////////////////////////////
// END FILL INDEMNITOR EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// BEGIN FILL ELIGIBILITY EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////


casper.on('fill.eligibility', function (actionOptions, options) {

	this.echo(' FILL ELIGIBILITY PAGE .......');

	var o = {}; // Internal options

	if (actionOptions == null) {
		actionOptions = {};
	}

	// SELECTOR VALUE OPTIONS
	o.billPreference = !actionOptions.billPreference ? 0 : actionOptions.billPreference;
	o.eligibility = !actionOptions.eligibility ? "approved" : actionOptions.eligibility;  // text found in the 1st pop up ( default is for approved bond )
	o.buttonText = !actionOptions.buttonText ? "Issue" : actionOptions.buttonText; // text on the button to look for
	o.finalText = !actionOptions.finalText ? "issued" : actionOptions.finalText;  // text on the next pop up to look for

	// TURN OFF SELECTORS
	o.billPreferenceOn = actionOptions.billPreferenceOn === false ? actionOptions.billPreferenceOn : true;
	o.finalTextOn = actionOptions.finalTextOn === false ? actionOptions.finalTextOn : true;
	o.navigateToPageOn = actionOptions.navigateToPageOn === true ? actionOptions.navigateToPageOn : false; // NOTE: default is false

	// USE DIFFERENT SELECTOR
	o.billPreferenceSelector = !actionOptions.billPreferenceSelector ? "#billPreference" : actionOptions.billPreferenceSelector;
	o.navigateToSelector = !actionOptions.navigateToSelector ? "none" : actionOptions.navigateToSelector;

	//------------------------------------------

	// todo+++ always search for pink box

	casper.wait(1000, function () {
		this.echo('wait for Eligibility page to load.......');
	});

	if (o.billPreferenceOn)
		casper.waitForSelector(o.billPreferenceSelector,
			function success() {

				this.echo('On Eligibility page...' + this.getTitle());
				casper.capture('eligibilityStart.png');
				options.test.assertExists(o.billPreferenceSelector);

				this.evaluate(function (billPreference, selector) {
					document.querySelector(selector).selectedIndex = billPreference;
					return true;
				}, o.billPreference, o.billPreferenceSelector);
			},
			function fail() {
				casper.capture('failed.png');
				//options.test.assertExists(o.billPreferenceSelector);
				this.emit('time.out', 'waitForSelector - ' + o.billPreferenceSelector);

			}, TIME_OUT);


																			//casper.waitForSelector('select[name="billPreference"][id^="billPreference"]',
																			//		function success() {
																			//			options.test.assertExists('select[name="billPreference"][id^="billPreference"]');
																			//			this.echo('On Eligibility page...#2' + this.getTitle());

																			//			this.evaluate(function (bondTerm) {
																			//				document.querySelector('select[name="billPreference"][id^="billPreference"]').selectedIndex = billPreference;
																			//				return true;
																			//			}, o.billPreference);
																			//		},
																			//		function fail() {
																			//			//Do nothing here, because it could be here or not.  No errors when there is a variable chance of it existing or not.
																			//			//casper.capture( 'failed.png' );
																			//			//options.test.assertExists( 'select[name="BondTerm"][id^="BondTerm"]' );
																			//			//this.emit( 'time.out', 'waitForSelector - select[name="BondTerm"][id^="BondTerm"]' );
																			//		}, TIME_OUT);


	var bondTitleSelector = "*[title='" + options.bondTitle + "']";

	casper.waitForSelector(bondTitleSelector,
	function success() {
		options.test.assertExists(bondTitleSelector);
	},
	function fail() {
		casper.capture('failed.png');
		//options.test.assertExists(bondTitleSelector);
		this.emit('time.out', 'waitForSelector - ' + bondTitleSelector);
	});

	casper.thenEvaluate(function () {
		console.log("Global.casper -----> " + Global.casper);
	});

	casper.waitForSelector("#checkEligibilityBtn span",
		function success() {
			casper.capture('B4eligibilityClick.png');
			options.test.assertExists("#checkEligibilityBtn span");
			this.click("#checkEligibilityBtn span");
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertExists("#checkEligibilityBtn span");
			this.emit('time.out', "waitForSelector - #checkEligibilityBtn span");
		});

	casper.wait(1000, function () {
		this.echo('wait for determine eligibility to finish.......');
	});

	casper.waitForText(o.eligibility,
		function success() {

			options.test.assertTextExists(o.eligibility, 'Found Text -> ' + o.eligibility);
			casper.capture('successAfterEligibilityClick.png');

			casper.waitForSelector("button",
				function success() {

				casper.capture('FirstEligibilityPopUpButton_B4Click.png');

				options.test.assertExists(x('//button[text()="' + o.buttonText + '"]'));  
				this.click(x('//button[text()="' + o.buttonText + '"]'));

				casper.capture('FirstEligibilityPopUpButton_AfterClick.png');

				},
				function fail() {
					casper.capture('failed.png');
					this.emit('time.out', "waitForSelector - //button[text()='" + o.buttonText + "']");
				});
		},
		function fail() {
			casper.capture('failed.png');
			//options.test.assertTextExists(o.eligibility);
			this.emit('time.out', 'waitForText - ' + o.eligibility);
	}, TIME_OUT);

	if (o.finalTextOn)
		casper.waitForText(o.finalText,  
			function success() {
				options.test.assertTextExists(o.finalText, 'Found ' + o.finalText);  
				this.echo('bond has been ' + o.finalText);  
				casper.capture('finalClick.png');  
				this.click("button");
				casper.capture('AfterfinalClick.png');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', 'waitForText - ' + o.finalText);  
		}, TIME_OUT);

	if (o.navigateToPageOn)
		casper.waitForSelector(x(o.navigateToSelector),
			function success() {
				options.test.assertExists(x(o.navigateToSelector));
				casper.capture('continueToNavigateToSelector.png');
				this.click(x(o.navigateToSelector));
				this.echo('------------------- CLICKED CONTINUE TO ' + o.navigateToSelector + ' -------------------------------------------------------');
			},
			function fail() {
				casper.capture('failed.png');
				this.emit('time.out', "waitForSelector - " + o.navigateToSelector);
		}, TIME_OUT);

	///////////////////////////////////////////////////////////////////////////

	//casper.wait(4000, function () {
	//});

	//casper.then(function () {
	//	this.echo('Test Completed Successfully');
	//	casper.capture('end.png');
	//});

	//casper.then(function () {
	//	this.echo('4');
	//	casper.exit();
	//});


});

///////////////////////////////////////////////////////////////////////////////
// END FILL ELIGIBILITY EVENT HANDLER
//////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END ACTION METHODS / CUSTOM CASPER EVENT HANDLERS  IMPLEMENTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN CASPER EVENTS / HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


casper.on('page.error', function (msg, trace) {
	this.echo('Error: ' + msg, 'ERROR');
	for (var i = 0; i < trace.length; i++) {
		var step = trace[i];
		this.echo('   ' + step.file + ' (line ' + step.line + ')', 'ERROR');
	}
	this.emit('test.failure', " FAIL - page.error (see above) ");
});

casper.on('resource.received', function (resource) {
	var status = resource.status;
	if (status >= 400) {
		casper.log('Resource ' + resource.url + ' failed to load (' + status + ')', 'error');

		this.echo('Resource ' + resource.url + ' failed to load (' + status + ')', 'error');
		//resourceErrors.push({
		//	url: resource.url,
		//	status: resource.status
		//});
	}
});

casper.on('remote.message', function (msg) {

	//this.log(msg);
	//this.echo(msg);

	//if (msg == 'BEGIN LOAD PAGE') {
	//	this.log(msg);
	//	this.echo(msg);

	//	casper.thenEvaluate(function () {
	//		// and then add this to the evaluate to print a value

	//		console.log("########## Global.casper -----> " + Global.casper);
	//		Global.casper = true;
	//		console.log("########## Global.casper -----> " + Global.casper + "++++++++++++++");
	//	});
	//}

	if (msg.indexOf("casper") > -1)
		this.echo(msg);

});


casper.on('time.out', function (msg) {
	casper.capture('timeOut.png');
	// todo+++ send email here
	casper.test.assert(false, "!!! TIMED OUT !!! -> " + msg);
	casper.exit();
});

casper.on('test.failure', function (msg) {
	casper.capture('testFailure.png');
	// todo+++ send email here
	casper.test.assert(false, "!!! TEST FAILURE !!! -> " + msg);
	casper.exit();
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END CASPER EVENTS / HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN TEST SETUP AND START TEST
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

casper.test.begin('test', function (test) {

	var testNum = casper.cli.get('testNum'); // GET TEST NUMBER FROM COMMAND LINE
	var testOptions;
	var platForm;

	if (isNaN(testNum)) {
		casper.emit('test.failure', "TEST CANNOT START: testNum isNaN -> " + testNum);
	}

	// TODO+++ will need to also deal with login's and all that in the tests

	switch (testNum) {

		// #1
		case testsEnum.issueCACLB2010:

			platForm = platFormEnum.nexus;
			testOptions = {

				test: test, // required for casperjs
				startUrl: "http://dev-webnexus.amtrustservices.com/ANANexus_Dev/login.aspx",
				testTitle: "Issue CACLB2010",
				bondTitle: "California Contractors License Bond - $12,500", // has to be exact
				state: statesEnum.California,
				group: bondGroupsEnum.Commercial,
				bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
				productId: "12",
				actions: [
							{
								actionType: actionTypesEnum.fillPrincipal,
								options: { licenseNumber: "444445555", workPhone: "888888888888" } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillBondDetails,
								options: { hasClaimAgainst: "no", hasBankruptcy: "no", isDisciplinaryBond: "no", hasPastDue: "no", bondTypeOn: false, bondAmountOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillIndemnitor, 
								options: { indemnitorQuestionsOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillEligibility, 
								options: { billPreference: 1 }    
							}
						]
			}
			break;

		// #2
		case testsEnum.issueCADSOB:  // #1 ON 2-5-15 SPREAD SHEET FROM JOSH

			platForm = platFormEnum.nexus;
			testOptions = {

				test: test, // required for casperjs
				startUrl: "http://dev-webnexus.amtrustservices.com/ANANexus_Dev/login.aspx",
				testTitle: "Issue CADSOB",
				bondTitle: "California Driving School Owner or All-Terrain Vehicle Bond - $10,000", // has to be exact
				state: statesEnum.California,
				group: bondGroupsEnum.Commercial,
				bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
				productId: "1",
				actions: [
							{
								actionType: actionTypesEnum.fillPrincipal,
								options: { address: "123 Testing Way", zipCode: "90001", workPhone: "1234567890", businessEntity: 1, licenseNumberOn: false, licenseClassOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillBondDetails,
								options: { hasClaimAgainst: "no", hasBankruptcy: "no", bondTermPremium: 1, bondTermSelector: 'select[name="BondTerm"][id^="BondTerm"]', bondTypeOn: false, bondAmountOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillEligibility,  // billPreferenceOn
								options: { billPreferenceSelector: 'select[name="billPreference"][id^="billPreference"]', billPreference: 1 }    
							}
						]
			}

			break;

		// #3   
		case testsEnum.declineCADSOB:  // #2 ON 2-5-15 SPREAD SHEET FROM JOSH

			platForm = platFormEnum.nexus;
			testOptions = {

				//loginOn: false,  // this is for using Keith's IIS for testing forced error conditions
				//startUrl: "http://10.1.31.211",
				test: test, // required for casperjs
				startUrl: "http://dev-webnexus.amtrustservices.com/ANANexus_Dev/login.aspx",
				testTitle: "Decline CADSOB",
				bondTitle: "California Driving School Owner or All-Terrain Vehicle Bond - $10,000", // has to be exact
				state: statesEnum.California,
				group: bondGroupsEnum.Commercial,
				bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
				productId: "1",
				actions: [
							{
								actionType: actionTypesEnum.fillPrincipal,
								options: { address: "123 Testing Way", zipCode: "90001", workPhone: "1234567890", businessEntity: 1, licenseNumberOn: false, licenseClassOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillBondDetails,
								options: { hasClaimAgainst: "yes", hasBankruptcy: "yes", bondTermPremium: 1, bondTermSelector: 'select[name="BondTerm"][id^="BondTerm"]', bondTypeOn: false, bondAmountOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillEligibility,  // billPreferenceOn
								options: { billPreferenceSelector: 'select[name="billPreference"][id^="billPreference"]', billPreference: 1, eligibility: "declined", buttonText: "Ok", finalTextOn: false }
							}
				]
			}

			break;

		// #4  // TODO+++ need to add more steps from latest spread sheet for this test
		case testsEnum.submitAZCLCBI_ICC: // #3 ON 2-5-15 SPREAD SHEET FROM JOSH

			platForm = platFormEnum.nexus;
			testOptions = {

				test: test, // required for casperjs
				startUrl: "http://dev-webnexus.amtrustservices.com/ANANexus_Dev/login.aspx",
				testTitle: "submitAZCLCBI_ICC",
				bondTitle: "Arizona Contractors License Bond - Commercial", // has to be exact
				state: statesEnum.Arizona,
				group: bondGroupsEnum.Commercial,
				bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
				productId: "71",
				actions: [
							{
								actionType: actionTypesEnum.fillPrincipal,
								options: { address: "123 Testing Way", zip: "90001", workPhone: "1234567890", licenseClassOn: false } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillBondDetails,
								options: { bondTermPremium: 1, bondTermSelector: 'select[name="BondTerm"][id^="BondTerm"]', bondTypeOn: true } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.cppfillIndemnitor
							},
							{
								actionType: actionTypesEnum.fillEligibility,
								options: { eligibility: "Enter At Least One Indemnitor", buttonText: "Exit", finalTextOn: false, navigateToPageOn: true, navigateToSelector: '//*[@id="workflowSteps"]/li[3]/a[text() = "Indemnitor"]' } // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillIndemnitor,
								options: { 
											indemSSN: "666181170", 
											indemnitorType: 1, 
											indemFirstName: "Judy", 
											indemLastName: "Wright", 
											indemStreetNumber: "545", 
											indemStreetName: "Berkley", 
											//indemStreetType: ,
											indemZip: "46208",
											hasClaimAgainst: "no",
											hasBankruptcy: "no",
											hasBusinessFailure: "no",
											hasAssetsInTrust: "no",
											indemnitorQuestionsOn: true
								} // leave the rest as the defaults
							},
							{
								actionType: actionTypesEnum.fillEligibility,
								options: { eligibility: "Underwriting", buttonText: "Submit To Underwriting", finalText: "submitted" } // leave the rest as the defaults
							}
						]
			}
			break;

		// #5
		case testsEnum.approveAZCLCBI_ICC: // 2ND PART OF #3 ON 2-5-15 SPREAD SHEET FROM JOSH

			platForm = platFormEnum.cpp;
			testOptions = {
				cppScenario: "run.cppEditQuote",
				test: test, // required for casperjs
				startUrl: "http://devcpp.amtrustgroup.com/DEV/Login.aspx",
				testTitle: "approveAZCLCBI_ICC",
				bondTitle: "Arizona Contractors License Bond - Commercial", // has to be exact
				cppSearchTitle: "submitAZCLCBI_ICC",
				state: statesEnum.Arizona,
				group: bondGroupsEnum.Commercial,
				bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
				productId: "71",
				actions: [
							{	actionType: actionTypesEnum.cppfillPrincipal },
							{
								actionType: actionTypesEnum.cppfillBondDetails, 
								options: { bondTermSelector: 'select[name="BondTerm"][id^="BondTerm"]' } // leave the rest as the defaults
							},
							{	actionType: actionTypesEnum.cppfillIndemnitor },
							{
								actionType: actionTypesEnum.cppfillEligibility,
								options: { eligibility: "Referral", buttonText: "Approve", finalText: "approved" } // leave the rest as the defaults
							}
						]
			}
			break;

		// #6  TODO+++ CHANGE TITLE  - work in progress...
		case testsEnum.approveAZCLCBI_ICC: // #6 ON OLD SPREAD SHEET FROM JOSH

			platForm = platFormEnum.cpp;
			testOptions = {
				cppScenario: "run.cppNewQuote",
				test: test, // required for casperjs
				startUrl: "http://devcpp.amtrustgroup.com/DEV/Login.aspx",
				testTitle: "approveAZCLCBI_ICC",
				bondTitle: "Arizona Contractors License Bond - Commercial", // has to be exact
				cppSearchTitle: "submitAZCLCBI_ICC",
				state: statesEnum.Arizona,
				group: bondGroupsEnum.Commercial,
				bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
				productId: "71",
				actions: [
							{ actionType: actionTypesEnum.cppfillPrincipal },
							{
								actionType: actionTypesEnum.cppfillBondDetails,
								options: { bondTermSelector: 'select[name="BondTerm"][id^="BondTerm"]' } // leave the rest as the defaults
							},
							{ actionType: actionTypesEnum.cppfillIndemnitor },
							{
								actionType: actionTypesEnum.cppfillEligibility,
								options: { eligibility: "Referral", buttonText: "Approve", finalText: "approved" } // leave the rest as the defaults
							}
				]
			}
			break;

		default:
			casper.emit('test.failure', "TEST COULD NOT BE FOUND FOR testNum -> " + testNum);
	}

	casper.start(testOptions.startUrl, function () {

		this.echo(testNum);

	}).viewport(1200, 800);

	switch (platForm) {
		case platFormEnum.nexus:
			casper.emit('run.nexus_test', testOptions);
			break;
		case platFormEnum.cpp:
			casper.emit('run.cpp_test', testOptions);
			break;
		//case platFormEnum.cppEditQuote:
		//	casper.emit('run.cppEditQuote', testOptions);
		//	break;
		//case platFormEnum.cppNewQuote:
		//	casper.emit('run.cppNewQuote', testOptions); // test #6 on old spread sheet
		//	break;
		default:
			casper.emit('test.failure', "NO PLATFORM FOUND FOR -> " + platForm);
	}

	casper.wait(4000, function () {});

	casper.then(function () {
		this.echo('Test Completed Successfully');
		casper.capture('end.png');
	});

	casper.run(function () { test.done(); });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// END TEST SETUP AND START TEST
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEGIN NOTES / DOCUMENTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  HELPFUL LINKS
//  javascript detect webkit http://stackoverflow.com/questions/18625321/detect-webkit-browser-in-javascript
//  
//  ways of selecting:  starts with ->  $("[id^=HasClaimAgainst]")  ends with -> $("[id$=HasClaimAgainst]")   select by value  $('*[value="no"]');  
//                      multiple -> $('*[value="no"][id^=HasClaimAgainst]');   use input[xxx]   ->   $('input[value="no"][id^=HasClaimAgainst]');

//  xpath:   '//button[text()="Issue"]'
//                $x('//tbody/tr[2]/td[3][text() ="cspr submitAZCLCBI_ICC"]')  -> the $x is to test in the console -> to get exact location, do copy xpath, then put the trailing location on the front when doing text()=...
//   even better ->  $x('//*[@id="_ctl0_cphContent_dgSearchResults"]/tbody/tr[2]/td[3][text() = "cspr submitAZCLCBI_ICC"]') 
//                       < this part is the original xpath copied from browser       >< this part is custom for finding the exact text >


// todo+++ testing rules idea 
// answers to bond details questions switch?
// will need to hook into dynamic questions so I know which need to be filled?
// test config for what tests to run?
// pass in all selectors/text from config for each page?


//////////////////////////////////////////////////////////////////////
// the following are action methods/properties for each Action Type
/////////////////////////////////////////////////////////////////////

//  Action Type Options
//
// p ->  property for the ActionType 
// m->   method of the ActionType

// -- Action Type: waitForSelector --
//
//  Options:
//
//  p -> selectorToWaitFor
//	m -> echo
//  m -> assertExists
//  m -> sendKeys
//  m -> capture
//  m -> click
//  m -> evaluate
//  m -> wait
//  m -> fail -> will use standard capture,assertExists, this.emit, and TIME_OUT

// -- Action Type: wait --
//
//  Options:
//
//	m -> echo

// -- Action Type: thenEvaluate --
//
//  Options:
//
//  m -> console.log

// -- Action Type: waitForText  
//
//  Options:
//
//  p -> textToWaitFor
//  m -> echo
//  m -> assertExists
//  m -> assertTextExists
//  m -> sendKeys
//  m -> capture
//  m -> click
//  m -> evaluate
//  m -> wait
//  m -> fail -> will use standard capture,assertExists, assertTextExists, this.emit, and TIME_OUT

// -- Action Type: fillPrincipal --
//
//  leave fields blank to use default value
//
//  Options:
//
//  p -> LicenseNumber 
//  p -> PrincipalName
//  p -> DBA
//  p -> Address
//  p -> Suite
//  p -> ZipCode
//  p -> WorkPhone
//  p -> MobilePhone
//  p -> HomePhone
//  p -> Email
//  p -> FinancialFileNumber
//  p -> LicenseClass
//  p -> BusinessEnity


//////////////////////////////////////////////////////////////////////
// the following are action methods/properties for each Action Type
/////////////////////////////////////////////////////////////////////

//  Action Type Options
//
// p ->  property for the ActionType 
// m->   method of the ActionType

// -- Action Type: waitForSelector --
//
//  Options:
//
//  p -> selectorToWaitFor
//	m -> echo
//  m -> assertExists
//  m -> sendKeys
//  m -> capture
//  m -> click
//  m -> evaluate
//  m -> wait
//  m -> fail -> will use standard capture,assertExists, this.emit, and TIME_OUT

// -- Action Type: wait --
//
//  Options:
//
//	m -> echo

// -- Action Type: thenEvaluate --
//
//  Options:
//
//  m -> console.log

// -- Action Type: waitForText  
//
//  Options:
//
//  p -> textToWaitFor
//  m -> echo
//  m -> assertExists
//  m -> assertTextExists
//  m -> sendKeys
//  m -> capture
//  m -> click
//  m -> evaluate
//  m -> wait
//  m -> fail -> will use standard capture,assertExists, assertTextExists, this.emit, and TIME_OUT

// -- Action Type: fillPrincipal --
//
//  leave fields blank to use default value
//
//  Options:
//
//  p -> licenseNumber 
//  p -> principalName
//  p -> DBA
//  p -> address
//  p -> suite
//  p -> zipCode
//  p -> workPhone
//  p -> mobilePhone
//  p -> homePhone
//  p -> email
//  p -> financialFileNumber
//  p -> licenseClass
//  p -> businessEnity







//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  CODE STORAGE
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//casper.wait(100, function () {

//	this.echo(' TEST #1 .......');

//	var testOptions = {

//		test: test, // required for casperjs
//		testTitle: "Issue CACLB2010",
//		bondTitle: "California Contractors License Bond - $12,500", // has to be exact
//		state: statesEnum.California,
//		group: bondGroupsEnum.Commercial,
//		bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
//		productId: "12",
//		actions: [
//			{
//				actionType: actionTypesEnum.fillPrincipal,
//				options: { licenseNumber: "444445555", workPhone: "888888888888" } // leave the rest as the defaults
//			},
//			{
//				actionType: actionTypesEnum.fillBondDetails,
//				options: { hasClaimAgainst: "no", hasBankruptcy: "no", isDisciplinaryBond: "no", hasPastDue: "no" } // leave the rest as the defaults
//			},
//			{
//				actionType: actionTypesEnum.fillIndemnitor
//			},
//			{
//				actionType: actionTypesEnum.fillEligibility
//			}
//		]
//	}

//	casper.emit('run.test', testOptions);

//});

//casper.wait(100, function () {
//	this.echo(' MOVING ON TO TEST #2 .......');
//});


//casper.wait(100, function () {

//	this.echo(' MOVING ON TO TEST #2 .......');

//	var testOptions2 = {

//		test: test, // required for casperjs
//		testTitle: "Issue CACLB2010",
//		bondTitle: "California Contractors License Bond - $12,500", // has to be exact
//		state: statesEnum.California,
//		group: bondGroupsEnum.Commercial,
//		bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
//		productId: "12",
//		actions: [
//			{
//				actionType: actionTypesEnum.fillPrincipal,
//				options: { licenseNumber: "444445555", workPhone: "888888888888" } // leave the rest as the defaults
//			},
//			{
//				actionType: actionTypesEnum.fillBondDetails,
//				options: { hasClaimAgainst: "no", hasBankruptcy: "no", isDisciplinaryBond: "no", hasPastDue: "no" } // leave the rest as the defaults
//			},
//			{
//				actionType: actionTypesEnum.fillIndemnitor
//			},
//			{
//				actionType: actionTypesEnum.fillEligibility
//			}
//		]
//	}

//	casper.emit('run.test', testOptions2);

//	casper.wait(100, function () {

//		this.echo(' RUN TEST #3 .......');

//		var testOptions3 = {

//			test: test, // required for casperjs
//			testTitle: "Issue CACLB2010",
//			bondTitle: "California Contractors License Bond - $12,500", // has to be exact
//			state: statesEnum.California,
//			group: bondGroupsEnum.Commercial,
//			bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
//			productId: "12",
//			actions: [
//				{
//					actionType: actionTypesEnum.fillPrincipal,
//					options: { licenseNumber: "444445555", workPhone: "888888888888" } // leave the rest as the defaults
//				},
//				{
//					actionType: actionTypesEnum.fillBondDetails,
//					options: { hasClaimAgainst: "no", hasBankruptcy: "no", isDisciplinaryBond: "no", hasPastDue: "no" } // leave the rest as the defaults
//				},
//				{
//					actionType: actionTypesEnum.fillIndemnitor
//				},
//				{
//					actionType: actionTypesEnum.fillEligibility
//				}
//			]
//		}

//		casper.emit('run.test', testOptions3);

//	});

//});




//////////////////////////////////////////////////////////////////////////////////////
//casper.wait(100, function () {
//	this.echo(' AFTER running tests .......');

//	//var testOptions2 = {

//	//	test: test, // required for casperjs
//	//	testTitle: "Issue CACLB2010",
//	//	bondTitle: "California Contractors License Bond - $12,500", // has to be exact
//	//	state: statesEnum.California,
//	//	group: bondGroupsEnum.Commercial,
//	//	bondCategory: 1, // you have to find the specific index for this, it changed on me so I'm not use the enum
//	//	productId: "12",
//	//	actions: [
//	//		{
//	//			actionType: actionTypesEnum.fillPrincipal,
//	//			options: { licenseNumber: "444445555", workPhone: "888888888888" } // leave the rest as the defaults
//	//		},
//	//		{
//	//			actionType: actionTypesEnum.fillBondDetails,
//	//			options: { hasClaimAgainst: "no", hasBankruptcy: "no", isDisciplinaryBond: "no", hasPastDue: "no" } // leave the rest as the defaults
//	//		},
//	//		{
//	//			actionType: actionTypesEnum.fillIndemnitor
//	//		},
//	//		{
//	//			actionType: actionTypesEnum.fillEligibility
//	//		}
//	//	]
//	//}

//	//casper.emit('run.test', testOptions2);

//});