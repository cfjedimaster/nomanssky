/*

So getBuildable gives us a 'pure' data list that looks like this:

	{
		"pageid": 4274,
		"title": "Aeration Membrane Tau",
		"parts": [
			{
				"name": "Zinc",
				"qty": 50
			},
			{
				"name": "Carbon",
				"qty": 100
			},
			{
				"name": "Microdensity Fabric",
				"qty": 1,
				"subcomponent": true
			}
		]
	}

	Notice that one item, Microdensity Fabric, is a subcomponent, and needs it's own stuff.
	So the point of this funciton is to translate parts into a pure list of raw materials. 
	It will also be an array with name/qty.

*/

const fs = require('fs');
//expect the name of the JSON file
let jsonFile = process.argv[2];
let data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

data.forEach((item,idx) => {
	//console.log('Generate raw resources for '+idx+') '+item.name +' :'+JSON.stringify(item.parts));
	item.rawresources = {};

	item.parts.forEach(part => {
		let resources = getResources(part);
		//console.log('resources for '+part.name+' was '+JSON.stringify(resources));
		
		resources.forEach(resource => {
			if(!item.rawresources[resource.name]) item.rawresources[resource.name] = 0;
			item.rawresources[resource.name] += resource.qty;
		});
		
	});

	//console.log('raw is '+JSON.stringify(item.rawresources,null,'\t'));

});

console.log(JSON.stringify(data,null,'\t'));
function getResources(r,arr) {
	if(!arr) arr = [];
	//console.log('getResource('+r.name+','+arr.toString()+')');
	//Am I subcomponent?
	if(!isSubcomponent(r)) {
		arr.push(r);
		return arr;
	} else {
		let subc = getSubcomponent(r);
		subc.parts.forEach(part => {
			let subparts = getResources(part);
			subparts.forEach(subpart => {
				arr.push(subpart);
			});
		});
		return arr;

	}

}

function isSubcomponent(part) {
	let subc = data.findIndex(item => {
		return item.name == part.name;
	});
	return (subc >= 0);
}

function getSubcomponent(part) {
	let subc = data.findIndex(item => {
		return item.name == part.name;
	});
	return data[subc];
}
