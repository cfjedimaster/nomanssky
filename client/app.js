let bpApp = new Vue({
	el:'#bpList',
	data:{
		filter:'',
		blueprints:[],
		items:[]
	},
	created:function() {
		fetch('./data.json')
		.then(res => res.json())
		.then(res => {
			this.blueprints = res;
		});
	},
	computed:{
		filteredBlueprints: function() {
			let thatFilter = this.filter.toLowerCase();
			return this.blueprints.filter(function(bp) {
				if(thatFilter === '') return true;
				if(bp.name.toLowerCase().indexOf(thatFilter) >= 0) return true;
				return false;
			});
		},
		neededResources:function() {
			let needed = {};
			let result = [];
			/*
			ok, so our shopping cart (items) has an array of items and requirements.
			*/
			for(let x=0;x<this.items.length;x++) {
				let item = this.items[x];
				//first, find it
				for(let i=0;i<this.blueprints.length;i++) {
					if(this.blueprints[i].name === item.name) {
						for(let key in this.blueprints[i].rawresources) {
							if(!needed[key]) needed[key] = 0;
							needed[key] += Number(this.blueprints[i].rawresources[key]) * item.qty;
						}
					}
				}
			}
			//now convert it to an array
			for(let key in needed) {
				result.push({name:key, qty: needed[key]});
			}
			result.sort(function(a,b) {
				if(a.name > b.name) return 1;
				if(a.name < b.name) return -1;
				return 0;
			});
			return result;
		}
	},
	methods:{
		addToCart:function(item) {
			/* why doesn't this work?
			let existing = this.items.findExisting((item) => {
				return item.title === item;
			});
			*/
			let existing = -1;
			for(let i=0;i<this.items.length;i++) {
				if(this.items[i].name === item) existing = i;
			}
			if(existing === -1) {
				this.items.push({name:item, qty:1});
			} else {
				this.items[existing].qty++;
			}

			this.items = this.items.sort((a,b) => {
				if(a.name > b.name) return 1;
				if(a.name < b.name) return -1;
				return 0;
			});
		},
		removeFromCart:function(item) {
			console.log('remove '+item);
			let existing = -1;
			for(let i=0;i<this.items.length;i++) {
				if(this.items[i].name === item) existing = i;
			}
			if(existing !== -1) {
				//in theory it should ALWAYs match, but...
				this.items.splice(existing, 1);
			}
		}
	}
});

document.addEventListener('DOMContentLoaded', init, false);
function init() {

	if("serviceWorker" in navigator) {
		navigator.serviceWorker.register('serviceworker.js')
		.then((registration) => {
			console.log('Service Worker installed!');
		}).catch((err) => {
			console.error('Service Worker failed', err);
		});
	}

}