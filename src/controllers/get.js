/*

  ___ ___       ___               _ _       _   ___ ___ 
 | __/ __|  ___| _ \___ _ _ _ __ (_) |_    /_\ | _ \_ _|
 | _|\__ \ / -_)  _/ -_) '_| '  \| |  _|  / _ \|  _/| | 
 |_| |___/ \___|_| \___|_| |_|_|_|_|\__| /_/ \_\_| |___|

*/

//*******************************************************************

'use strict';

//*******************************************************************
// required modules
const jsf = require('json-schema-faker');
//*******************************************************************

function getTopLevelField(intakeField, cnData, getSchema, jsonData, key){

	switch (intakeField){
	case 'none':
		break;
	default:
		if (cnData.hasOwnProperty(getSchema[key].intake)){
	
			jsonData[key] = cnData[getSchema[key].intake];
		
		}
	}

}
function getSubLevelField(cnData, getSchema, key, jsonData){

	const addressData = cnData.addresses[0];
	const phoneData = cnData.phones[0];
	const holderData = cnData.holders[0];
	const path = getSchema[key].intake.split('/');
	let data;
	switch (path[0]){
	case 'holders':
		data = holderData;
		break;
	case 'phones':
		data = phoneData;
		break;
	case 'addresses':
		data = addressData;
		break;
	}
	if (data.hasOwnProperty(path[1])){
		jsonData[key] = data[path[1]];
	}

}
function buildGetResponse(cnData, applicationData, schemaData, jsonData, getSchema){

	let key; 
	for (key in schemaData){
		
		if (typeof jsonData[key] !== 'object'){
			
			const intakeField = getSchema[key].intake;
			if (intakeField.startsWith('middleLayer/')){
				const applicationField = intakeField.split('/')[1];
				jsonData[key] = applicationData[applicationField];
			}
			else {

				if (intakeField.indexOf('/') === -1){
					getTopLevelField(intakeField, cnData, getSchema, jsonData, key);	
				}
				else {
					
					getSubLevelField(cnData, getSchema, key, jsonData);
				}
			}
		}
		else {
			buildGetResponse(cnData, applicationData, schemaData[key], jsonData[key], getSchema[key]);
		}
	}

}

function copyGenericInfo(cnData, applicationData, jsonData, outputSchema){

	jsf.option({useDefaultValue:true});
	const schemaData = jsf(outputSchema);
	delete schemaData.id;

	jsonData = schemaData;
	buildGetResponse(cnData, applicationData, schemaData, jsonData, outputSchema);

	return jsonData;
}

module.exports.copyGenericInfo = copyGenericInfo;
