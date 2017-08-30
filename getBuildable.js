/*
I get a list of things you can build, which is a combination of the Blueprints category
and Products category. Technically products have blueprints, but the wiki doesn't list things
in products under Blueprints. Not sure why.
*/
const rp = require('request-promise');

// The URL for getting blueprints
const bpURL = 'https://nomanssky.gamepedia.com/api.php?action=query&list=categorymembers&cmtitle=Category:Blueprints&cmlimit=500&format=json&formatversion=2';
// The URL for products:
const pURL = 'https://nomanssky.gamepedia.com/api.php?action=query&list=categorymembers&cmtitle=Category:Products&cmlimit=500&format=json&formatversion=2';

//base url for fetching page content
const rawURLBase = ' https://nomanssky.gamepedia.com/';

/*
I saw some content that is 'special' and should be ignored. Hard coded list for now.

Night Crystals needs to be checked later
*/
const IGNORE_TITLES = [
	'Blueprint',
	'Blueprint Trader',
	'Jetpack',
	'Category:Blueprint panels',
	'Product',
	'Alloy',
	'Consumable',
	'Crafting',
	'Night Crystals',
	'Category:Consumables'
];


let options = {
	json:true,
	url:bpURL
};

Promise.all([
	rp({json:true,url:bpURL}),
	rp({json:true,url:pURL})
]).then((results) => {
	let [blueprints,products] = results;
	let buildable = [];
	buildable.push.apply(buildable, blueprints.query.categorymembers);
	buildable.push.apply(buildable, products.query.categorymembers);


	//filter out specials
	buildable = buildable.filter(item => {
		return IGNORE_TITLES.indexOf(item.title) === -1;
	});

	//trim for testing
	//TEMP
	/*
	buildable = buildable.filter(item => {
		return item.title == 'Plasma Core Casing V1';
	});
	*/
	//buildable = buildable.slice(0,90);

	console.log('Total '+buildable.length + ' things to parse.');
	
	let promises = [];
	buildable.forEach(thing => {
		let rawURL =  `${rawURLBase}${thing.title}?action=raw`;			
		promises.push(rp(rawURL));
	});

	Promise.all(promises).then(results => {
		results.forEach((result,idx) => {
			let parts = getParts(result, buildable[idx].title);
			buildable[idx].parts = parts;
			//while we're here, lets kill ns
			delete buildable[idx].ns;
		});

		/*
		I want to signify when a part is craftable. My logic is, 
		if part's title is NOT in the main list, it must be a base item.
		ToDo: Decide if that makes freaking sense.
		*/
		buildable.forEach((item, idx) => {
			/*
			for each part, see if it exists in buildable[x].title
			*/
			item.parts.forEach(part => {
				if(buildable.findIndex((item) => {
					return item.title == part.name;
				}) >= 0) {
					part.subcomponent = true;
				}
			});
		});

		//now sort by title
		buildable = buildable.sort((a, b) => {
			if(a.title < b.title) return -1;
			if(a.title > b.title) return 1;
			return 0;
		});

		console.log(JSON.stringify(buildable,null, '\t'));
	});


});


/*
Given raw wiki text, look for: 
==Crafting==
{{Craft|Name,Qty;Name2,Qty; (there is also blueprint=yes/no I may care aboyt later
*/
function getParts(s,name) {
	let re = /{{Craft\|(.*?)[\||}}]+/;
	let found = s.match(re);
	if(!found || found.length !== 2) {
		console.log(s);
		throw new Error("Unable to find Craft line for "+name);
	}
	let productsRaw = found[1];
	//productsRaw looks like: x,qty;y,qty2
	let partsRaw = productsRaw.split(';');
	//drop the end if it is blank
	if(partsRaw[partsRaw.length-1] === '') partsRaw.pop();
	let parts = [];
	partsRaw.forEach((pair) => {
		let [partName, partQty] = pair.split(',');
		parts.push({name:partName,qty:Number(partQty)});
	});
	return parts;
}

