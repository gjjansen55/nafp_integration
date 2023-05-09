/**
 * Create the credit memos so AP need not do this every month.
 * To the best of my knowledge and belief, the numbers WILL NOT change:
 * We are simply changing batch names and posting dates.
 *
 * Considerably expanded from the first version: because of flakiness with the
 * distributions, we are putting EVERYTHING into the CSV.
 */


var iixState = 0;
var iixVendorId = 1;
var iixAmount = 2;

var FIELD_NAMES_OUT = ['ROW_NUMBER',
		       'BATCH_ID', 'PURCHASES','DOC_DATE',
		       'VENDOR_ID', 'DISTR_ACCOUNT',
		       'DISTR_TYPE',
		       'DISTR_AMOUNT','ANAL_GROUP_ID', 'ANAL_CODE_ID'];


var templatePathname = 'c:\\nafp\\input_data\\credit_memo_template.csv';
var outputPathname = 'c:\\nafp\\nafp_adjustments.csv';

var accountDetails = [{'account': '2100-0000',
		       'distr_type': 'PAY',
		       'multiplier': 1},
		      {'account': '2170-0000',
		       'distr_type': 'PURCH',
		       'multiplier': -1}];

var mdaData = {'2100-0000': [{'group': 'LM2', 'code': 'LINE 30'}],
	       '2170-0000': [{'group': 'LM2', 'code': 'LINE 63'},
			     {'group': 'PROJECTS', 'code': 'ZZ999'}]}

function padToTen(strIn) {
    var retval = strIn;
    while (retval.length < 10) {
	retval = '0' + retval;
    }

    return retval;
}

function commandLineArgs() {
    if (WScript.Arguments.length < 2) {
	WScript.Echo("You must provide month of payment and posting date");
	WScript.Echo("for example 'cscript create_credit_memo_file.js'"
		     + "  10/17 12/1/2017'");
	WScript.Quit(1)
    } 
    var args = WScript.Arguments;
    var retval = new Array();
    for (var i = 0; i < 2; i++) {
	retval[i] = args.Item(i);
    }

    return retval;
}


function create_file(fs) {
    var args = commandLineArgs();
    var batchMonth = args[0];
    var postingDate = args[1];
    var batchName = 'NAFP ADJ ' + batchMonth;
    var ifh = fs.OpenTextFile(templatePathname, 1);
    var ofh = fs.OpenTextFile(outputPathname, 2, true)
    ofh.WriteLine(FIELD_NAMES_OUT.join(','))
    var skip = ifh.ReadLine();
    var rowNumber = 1;
    while ( true ) {
	var line = ifh.ReadLine()
	if (line == '') {
	    break;	}
	var fields = line.split(',');
	var vendorId = padToTen(fields[1]);
	var amount = fields[2];
	if (amount == 0) {
	    continue;
	}
	amount = amount * -1;
	for (var i = 0; i < accountDetails.length; i++) {
	    var accountDetail = accountDetails[i];
	    for (var j = 0; j < mdaData[accountDetail.account].length; j++) {
		var distrAmount = amount * accountDetail.multiplier;
		mdaEntry = mdaData[accountDetail.account][j];
		var fieldsOut = [rowNumber, batchName, amount, postingDate,
				 vendorId, accountDetail.account,
				 accountDetail.distr_type,
				 distrAmount,
				 mdaEntry.group,mdaEntry.code]; 
		ofh.WriteLine(fieldsOut.join(','));
	    }
	    rowNumber += 1;
	}
	if (ifh.AtEndofStream) {
	    break;
	}
    }
}
		      
var fs = new ActiveXObject('Scripting.FileSystemObject');
create_file(fs);
